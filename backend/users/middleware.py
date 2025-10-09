from functools import wraps
from typing import Iterable, Union

from django.http import HttpRequest

from stockzAI.response import api_json_response


def _normalise_requirement(value: Union[str, Iterable[str], None]) -> Iterable[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    return [item for item in value if item]


def _ensure_user(request: HttpRequest):
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return None, api_json_response(error="Authentication required.", status=401)
    return user, None


def require_permission(required: Union[str, Iterable[str]]):
    """
    View decorator that ensures the authenticated user holds at least one
    of the specified paywall permissions.
    """

    required_permissions = set(_normalise_requirement(required))

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request: HttpRequest, *args, **kwargs):
            user, error_response = _ensure_user(request)
            if error_response:
                return error_response

            if not required_permissions:
                return view_func(request, *args, **kwargs)

            if any(user.has_permission(permission) for permission in required_permissions):
                return view_func(request, *args, **kwargs)

            return api_json_response(error="Permission denied.", status=403)

        return _wrapped

    return decorator


def require_product(required: Union[str, Iterable[str]]):
    """
    View decorator that ensures the authenticated user owns one
    of the specified products via purchase or subscription.
    """

    required_products = set(_normalise_requirement(required))

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request: HttpRequest, *args, **kwargs):
            user, error_response = _ensure_user(request)
            if error_response:
                return error_response

            if not required_products:
                return view_func(request, *args, **kwargs)

            if any(user.has_product(product) for product in required_products):
                return view_func(request, *args, **kwargs)

            return api_json_response(error="Product access required.", status=403)

        return _wrapped

    return decorator
