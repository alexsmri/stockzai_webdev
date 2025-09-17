from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from ..db.DB_Handler import DB_Handler
from stockzAI.response import api_json_response
from django.http import Http404
from companies.models import WinnerEntry
from users.models import TrackingEvent
from users.utils.tracking import track_event

db = DB_Handler('companies')

class CompanyPageView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # This should be set to the appropriate serializer class

    def get(self, request, symbol):
        # Logic to retrieve the company object based on the request
        # For example, you might use self.request.user.company
        
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
        # Logic to retrieve the company object based on the request
        # For example, you might use self.request.user.company
        
        kpis = db.dbq_get_kpis()
        return api_json_response(msg=kpis)

class CompanySearchView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None  # This should be set to the appropriate serializer class

    def get(self, request, query):
        # Logic to retrieve the company object based on the request
        # For example, you might use self.request.user.company

        unique = request.GET.get("unique", "false").lower() == "true"
        variant = (request.GET.get("variant") or "search").lower()
        results = None
        try:
            results = db.dbg_get_company_search(query, ["financial_score", "valuation_score", "sector", "sectorRanking"], unique=unique)
        except Exception as e:
            print(type(e))

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
            results = WinnerEntry.objects.latest("date").winners
        except WinnerEntry.DoesNotExist:
            try:
                results = db.dbq_get_company_winners()
            except Exception as e:
                return api_json_response(error=str(e))
        return api_json_response(msg=results)




