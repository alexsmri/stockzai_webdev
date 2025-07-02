from .response import api_json_response
from django.db import connection
import logging
from django.conf import settings

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)


def view_health(request):
    health = False
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health = True
    except Exception as ex:
        error = str(ex)

    status_code = 200 if health else 500
    msg = True if health else False
    return api_json_response(msg=msg, status=status_code, error=error)
