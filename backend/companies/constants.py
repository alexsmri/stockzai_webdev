from django.conf import settings

DEFAULT_FREE_TICKERS = [
    "AAPL",
    "NVDA",
    "GOOGL",
    "AMZN",
]

FREE_TICKERS = DEFAULT_FREE_TICKERS if settings.PAYWALL_ENABLED else []
