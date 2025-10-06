import logging
from typing import Dict

from celery import shared_task

from .db.DB_Handler import DB_Handler
from .models import DBSnapshots

logger = logging.getLogger(__name__)

LEADERBOARD_METRICS = ["financial_score", "valuation_score", "total_score"]
LEADERBOARD_DISPLAY_KPIS = [
    "name",
    "sector",
    "sectorRanking",
    "financial_score",
    "valuation_score",
    "total_score",
]


@shared_task(name="fetch_company_winners")
def fetch_company_winners():
    db = DB_Handler("companies")
    try:
        winners = db.dbq_get_company_winners()
    except Exception:
        logger.exception("Failed to fetch company winners")
        return

    DBSnapshots.objects.update_or_create(
        type=DBSnapshots.SnapshotType.COMPANY_WINNERS,
        defaults={"value": winners or {}},
    )
    return winners


@shared_task(name="refresh_sector_leaderboard")
def refresh_sector_leaderboard():
    db = DB_Handler("companies")

    try:
        sectors = db.dbq_get_distinct_sectors()
    except Exception:
        logger.exception("Failed to fetch sectors for leaderboard refresh")
        return

    leaderboard: Dict[str, Dict[str, list]] = {}
    intel: Dict[str, Dict[str, object]] = {}

    for sector in sectors:
        sector_leaderboard: Dict[str, list] = {}
        leaderboard[sector] = sector_leaderboard
        sector_symbols: set[str] = set()

        for metric in LEADERBOARD_METRICS:
            try:
                ranking = db.dbq_get_sector_ranking(sector, metric)
            except Exception:
                logger.exception("Failed to fetch ranking for sector %s and metric %s", sector, metric)
                ranking = []

            sector_leaderboard[metric] = ranking

            for entry in ranking:
                symbol = entry.get("symbol") if isinstance(entry, dict) else None
                if symbol:
                    sector_symbols.add(symbol)

        if not sector_symbols:
            continue

        try:
            sector_intel = db.dbq_get_sector_company_data(
                sector,
                LEADERBOARD_DISPLAY_KPIS,
                symbols=sorted(sector_symbols),
            )
        except Exception:
            logger.exception("Failed to fetch company intel for sector %s", sector)
            continue

        for symbol, payload in sector_intel.items():
            intel[symbol] = payload

    snapshot_value = {"leaderboard": leaderboard, "intel": intel}

    DBSnapshots.objects.update_or_create(
        type=DBSnapshots.SnapshotType.SECTOR_LEADERBOARD,
        defaults={"value": snapshot_value},
    )

    return snapshot_value

