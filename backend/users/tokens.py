from django.contrib.auth.tokens import PasswordResetTokenGenerator as PWRGenerator
import random
import math

class PasswordResetTokenGenerator(PWRGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

def make_otp(digits: int):

    otp = ""
    for _ in range(digits):
        digit = math.floor(random.random() * 10)
        otp += str(digit)
    return otp

password_reset_token = PasswordResetTokenGenerator()