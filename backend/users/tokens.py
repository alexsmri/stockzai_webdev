from django.contrib.auth.tokens import PasswordResetTokenGenerator

class VerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )
    
verification_token = VerificationTokenGenerator()
password_reset_token = PasswordResetTokenGenerator()