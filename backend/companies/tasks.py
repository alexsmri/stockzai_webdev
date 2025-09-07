import logging
from .models import WinnerEntry
from .db.DB_Handler import DB_Handler
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task(name="fetch_company_winners")
def fetch_company_winners():
    db = DB_Handler("companies")
    winners = db.dbq_get_company_winners()

    try:
        last_winners = WinnerEntry.objects.latest("date").winners
    except WinnerEntry.DoesNotExist:
        last_winners = None

    if last_winners != winners:
        logger.info(f"Winners: {winners}")
        WinnerEntry.objects.create(winners=winners)
    return