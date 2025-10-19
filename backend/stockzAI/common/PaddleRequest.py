from paddle_billing.Notifications.Requests.Headers import Headers


class PaddleRequest:
    def __init__(self, headers: Headers, body: bytes | str):
        self.headers = headers if headers is not None else {}
        self.body = body.encode() if isinstance(body, str) else body

    @staticmethod
    def create_from_body(body: str, headers: Headers) -> "PaddleRequest":
        return PaddleRequest(headers=headers, body=body)