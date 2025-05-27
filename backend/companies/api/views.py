from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from companies.function.DBHandler import DBHandler
from rest_framework.response import Response
from django.http import Http404

db = DBHandler("companies")

class CompanyPageView(APIView):
    permission_classes = [AllowAny]
    serializer_class = None  # This should be set to the appropriate serializer class

    def get(self, request, symbol):
        # Logic to retrieve the company object based on the request
        # For example, you might use self.request.user.company
        
        intel = db.retrieve_company_data(symbol)
        latest_entries = intel["latest_entries"]
        if not latest_entries:
            raise Http404("No data found for this symbol.")
        
        return Response(intel)