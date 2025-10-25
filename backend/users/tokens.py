from django.contrib.auth.tokens import PasswordResetTokenGenerator as PWRGenerator
import secrets
import string

class PasswordResetTokenGenerator(PWRGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

def make_otp(digits: int):
    digits = max(1, int(digits))
    alphabet = string.digits
    return "".join(secrets.choice(alphabet) for _ in range(digits))

password_reset_token = PasswordResetTokenGenerator()
