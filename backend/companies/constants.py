from django.conf import settings

DEFAULT_FREE_TICKERS = [
    "AAPL",
    "NVDA",
    "GOOGL",
    "AMZN",
]

FREE_TICKERS = DEFAULT_FREE_TICKERS if settings.PAYWALL_ENABLED else DEFAULT_FREE_TICKERS

RISK_TOLERANCE_BUCKETS = [
    {
        "key": "risk_zero",
        "label": "Risk-Free (0)",
        "min": 0.0,
        "max": 0.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
    {
        "key": "risk_ultra_conservative",
        "label": "Ultra Conservative (0-1)",
        "min": 0.0,
        "max": 2.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
    {
        "key": "risk_conservative",
        "label": "Conservative (0-2)",
        "min": 0.0,
        "max": 4.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
    {
        "key": "risk_balanced",
        "label": "Balanced (0-3)",
        "min": 0.0,
        "max": 6.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
    {
        "key": "risk_growth",
        "label": "Growth (0-4)",
        "min": 0.0,
        "max": 8.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
    {
        "key": "risk_aggressive",
        "label": "Aggressive (0-5)",
        "min": 0.0,
        "max": 10.0,
        "min_inclusive": True,
        "max_inclusive": True,
    },
]

RISK_TOLERANCE_LOOKUP = {bucket["key"]: bucket for bucket in RISK_TOLERANCE_BUCKETS}
