from django.shortcuts import render
from django.db import models
import logging
from django.conf import settings

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)


def error_404_view(request, exception):
    return render(request, 'utility/404.html', status=404)
