
import os

from celery import Celery
from celery.schedules import crontab

from companies.db.DB_Handler import DB_Handler

import logging

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stockzAI.settings')

app = Celery('stockzai-WEB')

app.config_from_object('django.conf:settings', namespace='CELERY')

@app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    sender.add_periodic_task(
        crontab(minute="*"),
        fetch_company_winners.s(),
        name="Fetch company winners, every 5 minutes"
    )

@app.task
def fetch_company_winners():
    db = DB_Handler("companies")
    results = db.dbq_get_company_winners()
    logger.info(results)
    return