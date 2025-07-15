'''
import os

from celery import Celery

from companies.db.DB_Handler import DB_Handler

import logging

logger = logging.getLogger(__name__)

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stockzAI.settings')

app = Celery('stockzAI')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def fetch_company_winners(self):
    db = DB_Handler("companies")
    results = db.dbq_get_company_winners()
    logger.info(results)
    return results

'''