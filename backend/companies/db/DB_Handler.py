from .DB_Executor import DB_Executor
from datetime import datetime, date
import decimal
import numpy
import pandas as pd
import os
from .formats import parse_json
from typing import Any, Dict
import logging

logger = logging.getLogger(__name__)

NUMERAL_TYPES = (int, float, decimal.Decimal, numpy.int64, numpy.int32, numpy.float64, numpy.float32)

KPI_NAME_ALIASES = {
    "financial_score": "financial_score",
    "valuation_score": "valuation_score",
    "total_score": "totalScore",
    "name": "name",
    "sector": "sector",
    "sectorRanking": "sectorRanking",
}

DB_FUNCTIONS: Dict[str, str] = {
    "kpi_info": "dbq_get_kpi_info",
    "kpis": "dbq_get_kpis",
    "kpi": "dbq_get_kpi",
    "company_data": "dbq_get_company_data",
    "company_search": "dbq_get_company_search",
    "company_winners": "dbq_get_company_winners",
    "distinct_sectors": "dbq_get_distinct_sectors",
    "sector_ranking": "dbq_get_sector_ranking",
    "sector_company_data": "dbq_get_sector_company_data",
    "distinct_kpi_values": "dbq_get_distinct_kpi_values",
}

class DB_Handler:

    def __init__(self,
                 database: str):
        self.executor = DB_Executor(database)
        self.database = self.executor.database
        self.engine = self.executor.engine
        self.metadata = self.executor.metadata

    def get(self, key: str, *args, **kwargs):
        if not key:
            raise KeyError("Key must be provided for DB_Handler.get")

        func_name = DB_FUNCTIONS.get(key.lower())
        if not func_name:
            raise KeyError(f"Unknown DB function key: {key}")

        func = getattr(self, func_name, None)
        if func is None:
            raise AttributeError(f"DB function '{func_name}' is not implemented")

        return func(*args, **kwargs)

    def _build_conditions(self, *args, **kwargs):
        return self.executor._build_conditions(*args, **kwargs)

    def dbu_read(self, *args, **kwargs):
        return self.executor.dbu_read(*args, **kwargs)

    def dbu_read_selectcount(self, *args, **kwargs):
        return self.executor.dbu_read_selectcount(*args, **kwargs)

    def dbu_read_selectdistinct(self, *args, **kwargs):
        return self.executor.dbu_read_selectdistinct(*args, **kwargs)

    def dbu_read_execute(self, *args, **kwargs):
        return self.executor.dbu_read_execute(*args, **kwargs)

    def dbu_write(self, *args, **kwargs):
        return self.executor.dbu_write(*args, **kwargs)

    def dbu_write_df(self, *args, **kwargs):
        return self.executor.dbu_write_df(*args, **kwargs)

    def dbu_check_df(self, *args, **kwargs):
        return self.executor.dbu_check_df(*args, **kwargs)

    def dbq_get_kpi_info(self, kpi):
        kpi_entry: pd.DataFrame = self.dbu_read(table_name="kpi", conditions={"KPI": kpi})

        kpi_id = kpi_entry.iloc[0]["id"]
        kpi_role = kpi_entry.iloc[0]["role"]

        return {"id": kpi_id, "role": kpi_role}
    
    def dbq_get_kpis(self):
        kpis: pd.DataFrame = self.dbu_read(table_name="kpi")
        kpis = kpis.set_index("id").to_dict(orient="index")
        for column in kpis:
            dic = kpis[column]
            for key in dic:
                dic[key] = None if pd.isna(dic[key]) else dic[key]
        return kpis

    def dbq_get_kpi(self, ticker: str, kpi_id, kpi_role, limit: int | None = 1, date: datetime | date | None = None):

        if date is not None:
            conditions = {"SYMBOL": ticker, "KPI": kpi_id, 'date': f"<=TIMESTAMP('{date}')func"}
        else:
            conditions = {"SYMBOL": ticker, "KPI": kpi_id}

        try:
            kpi_entry: pd.DataFrame = self.dbu_read(
                table_name=kpi_role,
                conditions=conditions,
                order_by="date",
                ascend=False)
            if limit == 1:
                latest_entry = kpi_entry.iloc[0]

                value = latest_entry["value"] if latest_entry["value"] != "NULL" else None
                value2 = latest_entry["value2"] if latest_entry["value2"] != "NULL" else None
                return {"value": value, "value2": value2} if value is not None or value2 is not None else None

            elif limit is None:
                return kpi_entry

            else:
                return kpi_entry[:limit]

        except Exception:
            return {"value": None, "value2": None}
        
    def dbq_get_company_data(self, ticker):
        company_intel = {}
        latest_entries = {}
        wanted_roles = [
            "cashflow_statement", 
            "balance_sheet", 
            "income_statement", 
            "scores", 
            "basics", 
            "ratios", 
            "valuation", 
            "statistics",
            "blobs",
        ]

        kpis_df = self.dbu_read("kpi")
        kpis = [(row["id"], row["role"], row["KPI"]) for _, row in kpis_df.iterrows()]

        for kpi_id, role, kpi_name in kpis:
            if role in wanted_roles:
                kpi_dictionary = {}
                company_kpis_df = self.dbq_get_kpi(ticker, kpi_id, role, limit=None)

                # store each value by date
                for _, row in company_kpis_df.sort_values("date", ascending=True).iterrows():
                    if not pd.isna(row["value"]):
                        row_value = parse_json(row["value"])
                        kpi_dictionary[str(row["date"])] = row_value

                # store latest entry (most recent date)
                if not company_kpis_df.empty:
                    latest_row = company_kpis_df.sort_values("date", ascending=False).iloc[0]
                    latest_value = parse_json(latest_row["value"])
                    latest_entries[kpi_name] = latest_value

                company_intel[kpi_name] = kpi_dictionary

        return {"company_intel": company_intel, "latest_entries": latest_entries}
    
    def dbq_get_company_search(self, search_request: str, additional_kpis: list[str] = [], unique: bool = False):
        results = {}

        additional_kpis_info = {kpi: self.dbq_get_kpi_info(kpi) for kpi in additional_kpis}

        if not unique:
            sql_query = ("SELECT b.value AS company_name, b.SYMBOL AS company_ticker "
                        "FROM basics b "
                        "WHERE (b.KPI = 90) AND (b.SYMBOL LIKE :request OR b.value LIKE :request)"
                        "LIMIT 20;")
            results_raw = self.dbu_read_execute(sql_query, params={"request": f"%{search_request}%"})
        else:
            sql_query = ("SELECT b.value AS company_name, b.SYMBOL AS company_ticker "
                        "FROM basics b "
                        "WHERE (b.KPI = 90) AND b.SYMBOL = :request;")
            results_raw = self.dbu_read_execute(sql_query, params={"request": search_request})
        
        for (name, symbol) in results_raw:
            results_dic = {"name": name}
            for kpi in additional_kpis_info:
                symboL_kpi = self.dbq_get_kpi(symbol, 
                                               additional_kpis_info[kpi]["id"], 
                                               additional_kpis_info[kpi]["role"])
                if symboL_kpi is not None:
                    results_dic[kpi] = parse_json(symboL_kpi["value"])
            
            results[symbol] = results_dic

        return results
    
    def dbq_get_company_winners(self, result_count: int = 2):

        winner_calulcations = {}

        display_kpis = ["totalScore", "priceChange"]
        display_kpis_info = {kpi: self.dbq_get_kpi_info(kpi) for kpi in display_kpis}

        sql_query = (
            "SELECT s1.SYMBOL, s1.value "
            "FROM statistics s1 "
            "JOIN ( "
                "SELECT s_inner.SYMBOL, MAX(s_inner.date) AS max_date "
                "FROM statistics s_inner "
                "WHERE s_inner.KPI = 116 "
                "GROUP BY s_inner.SYMBOL "
            ") latest "
            "ON s1.SYMBOL = latest.SYMBOL AND s1.date = latest.max_date "
            "WHERE s1.KPI = 116 "
            "AND s1.value IS NOT NULL "
            "AND s1.value != 'NULL' "
            "AND s1.value > 0 "
            "AND s1.date >= NOW() - INTERVAL 2 DAY; "
        )
        
        calculation_raw = self.dbu_read_execute(sql_query)

        for (symbol, calculation) in calculation_raw:
            winner_calulcations[symbol] = {"winnerCalculation": calculation}
        
        winners = sorted(
            [symbol for symbol in winner_calulcations 
            if "winnerCalculation" in winner_calulcations[symbol] and winner_calulcations[symbol]["winnerCalculation"]],
            key=lambda symbol: winner_calulcations[symbol]["winnerCalculation"],
            reverse=True
        )

        out = {}
        winners_count = 0
        for winner in winners:
            if winners_count >= result_count:
                break

            winner_dict = {}
            for kpi in display_kpis:
                winner_kpi = self.dbq_get_kpi(
                    winner, 
                    display_kpis_info[kpi]["id"],
                    display_kpis_info[kpi]["role"],
                    )
                
                if winner_kpi is not None:
                    if "value" in winner_kpi and isinstance(winner_kpi["value"], NUMERAL_TYPES):
                        winner_dict[kpi] = float(winner_kpi["value"])
            
            if len(list(winner_dict.keys())) == len(display_kpis):
                out[winner] = winner_dict
                winners_count += 1

        return out
        

    def _resolve_kpi_name(self, kpi: str) -> str:
        """Translate friendly KPI aliases to the underlying KPI names."""
        return KPI_NAME_ALIASES.get(kpi, kpi)

    @staticmethod
    def _coerce_value(value: Any) -> Any:
        parsed = parse_json(value)
        if parsed is None:
            return None
        if isinstance(parsed, str):
            stripped = parsed.strip()
            if not stripped or stripped.upper() == "NULL":
                return None
            try:
                number = float(stripped.replace(",", ""))
            except ValueError:
                return stripped
            if number.is_integer():
                return int(number)
            return number
        if isinstance(parsed, NUMERAL_TYPES):
            try:
                number = float(parsed)
            except (TypeError, ValueError):
                return parsed
            if number.is_integer():
                return int(number)
            return number
        return parsed

    def dbq_get_distinct_kpi_values(self, kpi: str) -> list[Any]:
        """Fetch distinct, sanitized values for a KPI limited to the basics role."""
        if not kpi:
            return []

        resolved_kpi = self._resolve_kpi_name(kpi)

        try:
            info = self.dbq_get_kpi_info(resolved_kpi)
        except Exception:
            logger.warning("Failed to resolve KPI %s for distinct values", kpi)
            raise

        role = info.get("role")
        if role != "basics":
            raise ValueError("Distinct KPI values are only supported for basics role KPIs")

        query = (
            "SELECT DISTINCT value "
            f"FROM `{role}` "
            "WHERE KPI = :kpi_id "
            "AND value IS NOT NULL "
            "AND value != 'NULL' "
            "ORDER BY value"
        )

        rows = self.dbu_read_execute(query, params={"kpi_id": info["id"]})

        seen = set()
        results: list[Any] = []
        for (value,) in rows:
            coerced = self._coerce_value(value)
            if coerced is None:
                continue
            if isinstance(coerced, str):
                cleaned = coerced.strip()
                if not cleaned:
                    continue
                coerced = cleaned
            if coerced in seen:
                continue
            seen.add(coerced)
            results.append(coerced)

        return results

    def dbq_get_distinct_sectors(self) -> list[str]:
        """Return a sorted list of all sectors that have data in the basics table."""
        sector_info = self.dbq_get_kpi_info(self._resolve_kpi_name("sector"))
        query = (
            "SELECT DISTINCT b.value "
            "FROM basics b "
            "WHERE b.KPI = :sector_kpi_id "
            "AND b.value IS NOT NULL "
            "AND b.value != 'NULL' "
            "ORDER BY b.value"
        )
        rows = self.dbu_read_execute(query, params={"sector_kpi_id": sector_info["id"]})
        return [row[0] for row in rows if isinstance(row[0], str) and row[0].strip()]

    def dbq_get_sector_ranking(self, sector: str, metric: str, limit: int = 100, risk_levels: list[str] | None = None) -> list[dict[str, Any]]:
        """Fetch the top companies for a sector ranked by the provided KPI."""
        metric_info = self.dbq_get_kpi_info(self._resolve_kpi_name(metric))
        sector_info = self.dbq_get_kpi_info(self._resolve_kpi_name("sector"))

        metric_table = metric_info["role"]

        query = f"""
            WITH latest_metric AS (
                SELECT t.SYMBOL,
                       CAST(t.value AS DECIMAL(32, 8)) AS metric_value,
                       ROW_NUMBER() OVER (PARTITION BY t.SYMBOL ORDER BY t.date DESC) AS metric_row
                FROM `{metric_table}` t
                WHERE t.KPI = :metric_kpi_id
            ),
            latest_sector AS (
                SELECT b.SYMBOL,
                       b.value AS sector_value,
                       ROW_NUMBER() OVER (PARTITION BY b.SYMBOL ORDER BY b.date DESC) AS sector_row
                FROM `basics` b
                WHERE b.KPI = :sector_kpi_id
            )
            SELECT lm.SYMBOL,
                   lm.metric_value
            FROM latest_metric lm
            JOIN latest_sector ls ON ls.SYMBOL = lm.SYMBOL
            WHERE lm.metric_row = 1
              AND ls.sector_row = 1
              AND ls.sector_value = :sector
              AND lm.metric_value IS NOT NULL
              AND lm.metric_value != 0
            ORDER BY lm.metric_value DESC
            LIMIT :limit
        """

        params: dict[str, Any] = {
            "metric_kpi_id": metric_info["id"],
            "sector_kpi_id": sector_info["id"],
            "sector": sector,
            "limit": limit,
        }

        rows = self.dbu_read_execute(query, params=params)

        if risk_levels:
            logger.debug("Risk level filtering not yet implemented. Provided levels: %s", risk_levels)

        ranking: list[dict[str, Any]] = []
        for index, (symbol, metric_value) in enumerate(rows, start=1):
            if not symbol:
                continue
            ranking.append(
                {
                    "symbol": symbol,
                    "rank": index,
                    "score": float(metric_value) if metric_value is not None else None,
                }
            )
        return ranking

    def _fetch_latest_basics_by_kpi(self, kpi_id: int, symbols: list[str]) -> dict[str, Any]:
        if not symbols:
            return {}

        query = """
            WITH latest_values AS (
                SELECT b.SYMBOL,
                       b.value,
                       ROW_NUMBER() OVER (PARTITION BY b.SYMBOL ORDER BY b.date DESC) AS rn
                FROM `basics` b
                WHERE b.KPI = :kpi_id AND b.SYMBOL IN :symbols
            )
            SELECT SYMBOL, value FROM latest_values WHERE rn = 1
        """

        rows = self.dbu_read_execute(query, params={"kpi_id": kpi_id, "symbols": tuple(symbols)})
        return {symbol: self._coerce_value(value) for symbol, value in rows if symbol}

    def dbq_get_sector_company_data(self, sector: str, kpis: list[str], symbols: list[str] | None = None) -> dict[str, dict[str, Any]]:
        """Collect the latest KPI values for the given symbols within a sector."""
        if not kpis:
            return {}

        friendly_to_info: dict[str, dict[str, Any]] = {}
        for friendly in kpis:
            try:
                friendly_to_info[friendly] = self.dbq_get_kpi_info(self._resolve_kpi_name(friendly))
            except Exception:
                logger.warning("Missing KPI info for %s", friendly)

        if not friendly_to_info:
            return {}

        if symbols is None:
            sector_info = friendly_to_info.get("sector") or self.dbq_get_kpi_info(self._resolve_kpi_name("sector"))
            sector_query = (
                "SELECT DISTINCT b.SYMBOL "
                "FROM basics b "
                "WHERE b.KPI = :sector_kpi_id "
                "AND b.value = :sector"
            )
            rows = self.dbu_read_execute(
                sector_query,
                params={
                    "sector_kpi_id": sector_info["id"],
                    "sector": sector,
                },
            )
            symbols = [row[0] for row in rows if row[0]]

        if not symbols:
            return {}

        results: dict[str, dict[str, Any]] = {symbol: {"symbol": symbol} for symbol in symbols}

        role_groups: dict[str, list[tuple[str, int]]] = {}
        for friendly, info in friendly_to_info.items():
            role_groups.setdefault(info["role"], []).append((friendly, info["id"]))

        for role, items in role_groups.items():
            kpi_ids = tuple(info_id for _, info_id in items)
            if not kpi_ids:
                continue

            query = f"""
                WITH latest_values AS (
                    SELECT t.SYMBOL,
                           t.KPI,
                           t.value,
                           ROW_NUMBER() OVER (PARTITION BY t.SYMBOL, t.KPI ORDER BY t.date DESC) AS rn
                    FROM `{role}` t
                    WHERE t.KPI IN :kpi_ids AND t.SYMBOL IN :symbol_list
                )
                SELECT SYMBOL, KPI, value
                FROM latest_values
                WHERE rn = 1
            """

            params = {
                "kpi_ids": kpi_ids,
                "symbol_list": tuple(symbols),
            }

            try:
                rows = self.dbu_read_execute(query, params=params)
            except Exception:
                logger.warning("Failed to fetch KPI data for role %s", role)
                continue

            id_to_friendly = {info_id: friendly for friendly, info_id in items}
            for symbol, kpi_id, value in rows:
                if symbol not in results or kpi_id not in id_to_friendly:
                    continue
                friendly_key = id_to_friendly[kpi_id]
                results[symbol][friendly_key] = self._coerce_value(value)

        if "name" in kpis and "name" not in friendly_to_info:
            fallback_name_kpi = 90
            try:
                name_info = self.dbq_get_kpi_info(self._resolve_kpi_name("name"))
                fallback_name_kpi = name_info["id"]
            except Exception:
                logger.debug("Using fallback KPI id %s for company names", fallback_name_kpi)
            names = self._fetch_latest_basics_by_kpi(fallback_name_kpi, list(symbols))
            for symbol, value in names.items():
                results.setdefault(symbol, {})["name"] = value

        if "sector" in kpis and "sector" not in friendly_to_info:
            sector_info = self.dbq_get_kpi_info(self._resolve_kpi_name("sector"))
            sectors = self._fetch_latest_basics_by_kpi(sector_info["id"], list(symbols))
            for symbol, value in sectors.items():
                results.setdefault(symbol, {})["sector"] = value

        for symbol in results:
            for friendly in kpis:
                results[symbol].setdefault(friendly, None)

        return results










