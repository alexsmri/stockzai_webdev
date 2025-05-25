from django.shortcuts import render, redirect
from .forms import C_UserCreationForm, C_AuthenticationForm, UserChangeForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
import logging

# Create your views here.
REDIRECT_URL = "companies:search"

def register_view(request):
    if request.method == "POST":
        logging.debug("Registration attempt")
        form = C_UserCreationForm(data=request.POST)
        logging.debug(f"{form}")
        logging.debug(f"{request.POST}")
        if form.is_valid():
            form.save()
            logging.debug("Successful registration")
            next_url = request.GET.get("next") or request.POST.get("next")
            return redirect(next_url or REDIRECT_URL)
        else:
            logging.debug(form.errors)
    else:
        form = C_UserCreationForm()
    return render(request, "register.html", {"form": form})

def login_view(request):
    if request.method == "POST":
        form = C_AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            next_url = request.GET.get("next") or request.POST.get("next")
            return redirect(next_url or REDIRECT_URL)
    else:
        logging.debug("Login attempt")
        form = C_AuthenticationForm()
    return render(request, "login.html", {"form": form})

def logout_view(request):
    if request.method == "POST":
        logout(request)
        next_url = request.GET.get("next") or request.POST.get("next")
        return redirect(next_url or REDIRECT_URL)
    return redirect(REDIRECT_URL)

@login_required
def change_user_view(request):
    if request.method == "POST":
        form = UserChangeForm(data=request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect(REDIRECT_URL)
    else:
        form = UserChangeForm(instance=request.user)
    return render(request, "change_user.html", {"form": form})


                  

