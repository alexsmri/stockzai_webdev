from django.http import JsonResponse


def api_json_response(msg: any = None, error: any = None, status: int = 200):
    payload = {
        "msg": msg,
        "error": error,
    }
    return JsonResponse(payload, status=status)
