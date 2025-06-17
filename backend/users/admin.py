from django.contrib import admin
from .models import User, TokenPasswordReset, TokenVerification

admin.site.register(User)
admin.site.register(TokenPasswordReset)
admin.site.register(TokenVerification)