from django.contrib import admin
from .models import User, TokenPasswordReset, TokenVerification, TokenNewsletter, UserConsents, TrackingEvent

admin.site.register(User)
admin.site.register(TokenPasswordReset)
admin.site.register(TokenVerification)
admin.site.register(TokenNewsletter)
admin.site.register(UserConsents)
admin.site.register(TrackingEvent)

