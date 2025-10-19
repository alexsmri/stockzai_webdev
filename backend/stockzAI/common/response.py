from django.http import JsonResponse

def api_json_response(msg: any = None, error: any = None, status: int = 200):
    response = JsonResponse({"msg": msg, "error": str(error)}, status=status)
    return response
