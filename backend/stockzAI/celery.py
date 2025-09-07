
from celery import Celery

import logging

logger = logging.getLogger(__name__)

app = Celery('stockzai-WEB')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()