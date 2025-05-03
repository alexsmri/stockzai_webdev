from celery import shared_task
from .models import Company
from .DBHandler import DBHandler


@shared_task
def update_company_scores():
    db = DBHandler()
    db_companies = db.get_all_companies()
    dj_companies = set(Company.objects.values_list("symbol", flat=True))
    new_companies = [company for company in db_companies if company not in dj_companies]

    for company in Company.objects.all():
        scores = db.get_info(company.symbol)
        company.valuation_score = scores["valuation"]
        company.financial_score = scores["financial"]
        company.save()

    new_objects = []
    for new_symbol in new_companies:
        info = db.get_info(new_symbol)
        new_objects.append(Company(
            symbol=new_symbol,
            name=info["name"],
            financial_score=info["financial_score"],
            valuation_score=info["valuation_score"]
        ))

    if new_objects:
        Company.objects.bulk_create(new_objects)

