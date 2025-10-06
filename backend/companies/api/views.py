from django.http import Http404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from companies.models import DBSnapshots
from stockzAI.response import api_json_response
from users.models import TrackingEvent
from users.utils.tracking import track_event

from ..db.DB_Handler import DB_Handler


db = DB_Handler("companies")


class CompanyPageView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # This should be set to the appropriate serializer class

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
        return api_json_response(msg=intel)


class KPIView(APIView):
    permission_classes = [IsAuthenticated]
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
            results = db.dbg_get_company_search(
                query,
                ["financial_score", "valuation_score", "sector", "sectorRanking"],
                unique=unique,
            )
        except Exception:
            results = None

        results_count = None
        if isinstance(results, (list, tuple)):
            results_count = len(results)
        elif isinstance(results, dict) and "results" in results and isinstance(results["results"], (list, tuple)):
            results_count = len(results["results"])

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
        return api_json_response(msg={"query": query, "results": results})


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

        if not sector or not metric_param:
            return api_json_response(msg=False)

        metric_key = LEADERBOARD_METRIC_PARAMS.get(metric_param.lower())
        if not metric_key:
            return api_json_response(msg=False)

        try:
            snapshot = DBSnapshots.objects.get(type=DBSnapshots.SnapshotType.SECTOR_LEADERBOARD)
        except DBSnapshots.DoesNotExist:
            return api_json_response(msg=False)

        payload = snapshot.value or {}
        leaderboard = payload.get("leaderboard", {})
        intel = payload.get("intel", {})

        sector_data = leaderboard.get(sector)
        if not isinstance(sector_data, dict):
            return api_json_response(msg=False)

        ranking = sector_data.get(metric_key)
        if ranking is None:
            return api_json_response(msg=False)

        symbols = [entry.get("symbol") for entry in ranking if isinstance(entry, dict) and entry.get("symbol")]
        relevant_intel = {symbol: intel.get(symbol) for symbol in symbols if symbol in intel}

        response_payload = {
            "sector": sector,
            "metric": metric_key,
            "leaderboard": ranking,
            "intel": relevant_intel,
        }
        return api_json_response(msg=response_payload)
