from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class FormsStyleMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                "class": "form-control",
            })

class C_UserCreationForm(FormsStyleMixin, UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "username", "password1", "password2")
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": _("Email")}),
            "username": forms.TextInput(attrs={"placeholder": _("Username")}),
            "password1": forms.PasswordInput(attrs={"placeholder": _("Passowrd")}),
            "password2": forms.PasswordInput(attrs={"placeholder": _("Repeat Password")}),
        }


class C_AuthenticationForm(FormsStyleMixin, AuthenticationForm):
    username = forms.EmailField(label=_("Email"))

    class Meta:
        model = User
        fields = ("email", "password")
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": _("Email")}),
            "password": forms.TextInput(attrs={"placeholder": _("Password")})
        }

class UserChangeForm(FormsStyleMixin, forms.ModelForm):
    class Meta:
        model = User
        fields = ("email", "username", "first_name", "last_name", "phone")
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": _("Email")}),
            "username": forms.TextInput(attrs={"placeholder": _("Username")}),
            "first_name": forms.TextInput(attrs={"placeholder": _("First Name")}),
            "last_name": forms.TextInput(attrs={"placeholder": _("Last Name")}),
            "phone": forms.TextInput(attrs={"placeholder": _("Phone Number")}),
        }