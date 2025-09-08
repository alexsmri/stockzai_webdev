from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from ..db.DB_Handler import DB_Handler
from stockzAI.response import api_json_response
from django.http import Http404
from companies.models import WinnerEntry

db = DB_Handler("companies")

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
        results = None
        try:
            results = db.dbg_get_company_search(query, ["financial_score", "valuation_score", "sector", "sectorRanking"], unique=unique)
        except Exception as e:
            print(type(e))
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