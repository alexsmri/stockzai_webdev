from .common.response import api_json_response
from django.db import connection
import logging
from django.conf import settings
from companies.db.DB_Handler import DB_Handler

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)


def view_health(request):
    health_dict = {
        "Util DB": False,
        "Companies DB": False,
    }
    errors = {}

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_dict["Util DB"] = True
    except Exception as ex:
        errors["Util DB"] = str(ex)

    try:
        DB_Handler("companies")
        health_dict["Companies DB"] = True
    except Exception as ex:
        errors["Companies DB"] = str(ex)

    health = all(health_dict.values())
    status_code = 200 if health else 500

    return api_json_response(
        msg=health_dict,
        status=status_code,
        error=errors if errors else None
    )
