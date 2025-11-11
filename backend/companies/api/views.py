import logging
from django.http import Http404
from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from companies.constants import FREE_TICKERS, RISK_TOLERANCE_LOOKUP
from companies.models import DBSnapshots
from stockzAI.common.response import api_json_response
from users.models import TrackingEvent, User, PermissionCode
from users.middleware import require_permission
from users.utils.tracking import track_event

from ..db.DB_Handler import DB_Handler
from stockzAI.common.functions import build_query_meta


db = DB_Handler("companies")
logger = logging.getLogger(__name__)

AVAILABLE_COLUMNS = ["SYMBOL", "name", "sector"]
AVAILABLE_COLUMNS_SET = {column.upper() for column in AVAILABLE_COLUMNS}
DEFAULT_PLACEHOLDER = 10
SEARCH_PERMISSION = PermissionCode.COMPANY_SEARCH_ALL


def redact_search_results(results: dict[str, dict]) -> tuple[dict[str, dict], list[str]]:
    """
    Return a copy of the provided results with sensitive columns redacted for non-free tickers.
    """
    if not isinstance(results, dict):
        return {}, []

    free_tickers = {ticker.upper() for ticker in FREE_TICKERS}
    redacted_symbols: list[str] = []
    filtered_results: dict[str, dict] = {}

    for symbol, payload in results.items():
        symbol_upper = symbol.upper()
        if symbol_upper in free_tickers:
            filtered_results[symbol] = payload
            continue

        redacted_symbols.append(symbol_upper)

        if not isinstance(payload, dict):
            filtered_results[symbol] = {}
            continue

        redacted_entry = {}
        for key, value in payload.items():
            normalized_key = key.upper() if isinstance(key, str) else key
            if normalized_key in AVAILABLE_COLUMNS_SET:
                redacted_entry[key] = value
            else:
                redacted_entry[key] = DEFAULT_PLACEHOLDER

        filtered_results[symbol] = redacted_entry

    return filtered_results, redacted_symbols


class CompanyPageView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # This should be set to the appropriate serializer class

    @require_permission(PermissionCode.COMPANY_PAGE_ALL)
    def get(self, request, symbol):
        intel = db.dbq_get_company_data(symbol)
        latest_entries = intel["latest_entries"]
        if not latest_entries:
            raise Http404("No data found for this symbol.")

        track_event(
            request,
            TrackingEvent.EVENT_TICKER_VIEW,
            {
                "symbol": symbol.upper(),
                "results": len(latest_entries),
            },
        )
        payload = dict(intel or {})
        payload["query"] = build_query_meta("PropertyCompanyProfile", symbol=symbol)
        return api_json_response(msg=payload)


class CompanyFreePageView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None

    def get(self, request, symbol):
        symbol_upper = (symbol or "").upper()
        if symbol_upper not in FREE_TICKERS:
            raise Http404("No data found for this symbol.")

        intel = db.dbq_get_company_data(symbol_upper)
        payload = dict(intel or {})
        payload["query"] = build_query_meta("PropertyCompanyProfileFree", symbol=symbol_upper)

        tutorial_flag = (request.GET.get("t") or request.GET.get("tutorial") or "").strip().lower()
        is_tutorial = tutorial_flag in {"1", "true", "yes"}
        if is_tutorial:
            track_event(
                request,
                TrackingEvent.EVENT_TUTORIAL_PAGE_VIEW,
                {
                    "symbol": symbol_upper,
                },
            )
        return api_json_response(msg=payload)


class CompanyFreeTickersView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None

    def get(self, request):
        return api_json_response(msg=list(FREE_TICKERS))


class KPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None  # This should be set to the appropriate serializer class

    def get(self, request):
        kpis = db.dbq_get_kpis()
        return api_json_response(msg=kpis)


class CompanySearchView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # This should be set to the appropriate serializer class

    def get(self, request, query):
        unique = request.GET.get("unique", "false").lower() == "true"
        variant = (request.GET.get("variant") or "search").lower()
        results = None
        try:
            results = db.dbq_get_company_search(
                query,
                ["financial_score", "valuation_score", "sector", "sectorRanking"],
                unique=unique,
            )
        except Exception:
            results = None

        results_count = None
        if isinstance(results, (list, tuple)):
            results_count = len(results)
        elif isinstance(results, dict):
            results_count = len(results)

        raw_results = results if isinstance(results, dict) else {}

        has_full_access = isinstance(request.user, User) and request.user.has_permission(SEARCH_PERMISSION)
        if not settings.PAYWALL_ENABLED:
            processed_results = raw_results
            redacted_symbols: list[str] = []
        elif has_full_access:
            processed_results = raw_results
            redacted_symbols: list[str] = []
        else:
            processed_results, redacted_symbols = redact_search_results(raw_results)

        if variant not in {"completion", "hint"}:
            track_event(
                request,
                TrackingEvent.EVENT_SEARCH_QUERY,
                {
                    "query": query,
                    "unique": unique,
                    "variant": variant,
                    "results_count": results_count,
                },
            )
        query_meta = build_query_meta(
            "PropertySearchResults",
            query=query,
            variant=variant,
            unique=unique,
        )
        return api_json_response(
            msg={
                "query": query_meta,
                "results": processed_results,
                "redacted": redacted_symbols,
            }
        )


class CompanyWinnersView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None

    def get(self, request):
        try:
            snapshot = DBSnapshots.objects.get(type=DBSnapshots.SnapshotType.COMPANY_WINNERS)
            results = snapshot.value or {}
        except DBSnapshots.DoesNotExist:
            try:
                results = db.dbq_get_company_winners()
            except Exception as exc:
                return api_json_response(error=str(exc))
            DBSnapshots.objects.update_or_create(
                type=DBSnapshots.SnapshotType.COMPANY_WINNERS,
                defaults={"value": results or {}},
            )
        return api_json_response(msg=results)


LEADERBOARD_METRIC_PARAMS = {
    "financial_score": "financial_score",
    "financialscore": "financial_score",
    "valuation_score": "valuation_score",
    "valuationscore": "valuation_score",
    "total_score": "total_score",
    "totalscore": "total_score",
}


class CompanyLeaderboardView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None

    def get(self, request):
        sector = request.GET.get("sector")
        metric_param = request.GET.get("metric")
        risk_param = request.GET.get("riskTolerance")

        if not sector or not metric_param or not risk_param:
            return api_json_response(msg=False)

        metric_key = LEADERBOARD_METRIC_PARAMS.get(metric_param.lower())
        if not metric_key:
            return api_json_response(msg=False)

        normalized_risk_param = (risk_param or "").strip().lower()
        risk_key = None
        for candidate_key in RISK_TOLERANCE_LOOKUP:
            if candidate_key.lower() == normalized_risk_param:
                risk_key = candidate_key
                break
        if not risk_key:
            return api_json_response(msg=False)

        try:
            snapshot = DBSnapshots.objects.get(type=DBSnapshots.SnapshotType.SECTOR_LEADERBOARD)
        except DBSnapshots.DoesNotExist:
            return api_json_response(msg=False)

        payload = snapshot.value or {}
        leaderboard = payload.get("leaderboard", {})
        intel = payload.get("intel", {})
        risk_filters = payload.get("risk_filters")

        sector_data = leaderboard.get(sector)
        if not isinstance(sector_data, dict):
            return api_json_response(msg=False)

        metric_payload = sector_data.get(metric_key)
        ranking = None
        if isinstance(metric_payload, dict):
            ranking = metric_payload.get(risk_key)
        elif isinstance(metric_payload, list):
            ranking = metric_payload
        if ranking is None:
            return api_json_response(msg=False)

        symbols = [entry.get("symbol") for entry in ranking if isinstance(entry, dict) and entry.get("symbol")]
        relevant_intel = {symbol: intel.get(symbol) for symbol in symbols if symbol in intel}

        response_payload = {
            "sector": sector,
            "metric": metric_key,
            "riskTolerance": risk_key,
            "leaderboard": ranking,
            "intel": relevant_intel,
        }
        if isinstance(risk_filters, list):
            response_payload["riskFilters"] = risk_filters
        response_payload["query"] = build_query_meta(
            "PropertyCompanyLeaderboard",
            sector=sector,
            metric=metric_key,
            riskTolerance=risk_key,
        )
        return api_json_response(msg=response_payload)


class CompanyDistinctKPIValuesView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None

    def get(self, request):
        kpi_param = request.GET.get("kpi")
        if not kpi_param:
            return api_json_response(msg=[])

        try:
            values = db.dbq_get_distinct_kpi_values(kpi_param)
        except ValueError:
            logger.warning("Rejected distinct KPI request for non-basics KPI %s", kpi_param)
            return api_json_response(msg=[])
        except Exception:
            logger.exception("Failed to fetch distinct KPI values for %s", kpi_param)
            return api_json_response(error="distinct_kpi_fetch_failed")

        return api_json_response(msg=values)
