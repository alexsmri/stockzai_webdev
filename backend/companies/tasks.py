from celery import shared_task
from .db.DB_Handler import DB_Handler
import logging

logger = logging.getLogger(__name__)

@shared_task
def fetch_company_winners(self):
    db = DB_Handler("companies")
    results = db.dbq_get_company_winners()
    logger.info(results)
    return results