from __future__ import annotations

from typing import Any, Dict, Mapping, Optional

QueryKey = str


def _normalize_string(value: Any, *, to_upper: bool = False, to_lower: bool = False) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, bool):
        return "true" if value else "false"
    stringified = str(value).strip()
    if not stringified:
        return None
    if to_upper:
        return stringified.upper()
    if to_lower:
        return stringified.lower()
    return stringified


def _serialize_meta(meta: Mapping[str, str]) -> str:
    return "|".join(f"{key}:{value}" for key, value in sorted(meta.items(), key=lambda item: item[0]))


def build_query_meta(key: QueryKey, **kwargs: Any) -> Dict[str, str]:
    normalized_key = str(key)
    if normalized_key == "PropertySearchResults":
        search = _normalize_string(kwargs.get("query") or kwargs.get("search"), to_lower=True)
        variant = _normalize_string(kwargs.get("variant"), to_lower=True)
        unique = kwargs.get("unique")
        meta: Dict[str, str] = {}
        if search:
            meta["search"] = search
        if variant:
            meta["variant"] = variant
        if unique is not None:
            meta["unique"] = "true" if bool(unique) else "false"
        return meta

    if normalized_key in {"PropertyCompanyProfile", "PropertyCompanyProfileFree"}:
        symbol = _normalize_string(kwargs.get("symbol"), to_upper=True)
        return {"symbol": symbol} if symbol else {}

    if normalized_key == "PropertyCompanyLeaderboard":
        metric = _normalize_string(kwargs.get("metric"), to_lower=True)
        sector = _normalize_string(kwargs.get("sector"), to_lower=True)
        risk_tolerance = _normalize_string(
            kwargs.get("riskTolerance") or kwargs.get("risk_tolerance"),
            to_lower=True,
        )
        meta = {}
        if metric:
            meta["metric"] = metric
        if sector:
            meta["sector"] = sector
        if risk_tolerance:
            meta["risktolerance"] = risk_tolerance
        return meta

    return {}


def _extract_query_meta_from_payload(key: QueryKey, payload: Any) -> Dict[str, str]:
    if isinstance(payload, Mapping):
        raw_query = payload.get("query")
        if isinstance(raw_query, Mapping):
            canonicalised: Dict[str, str] = {}
            for raw_key, raw_value in raw_query.items():
                mapped_key = str(raw_key)
                normalized = _normalize_string(
                    raw_value,
                    to_upper=True if mapped_key == "symbol" else False,
                    to_lower=True if mapped_key != "symbol" else False,
                )
                if normalized:
                    canonicalised[mapped_key] = normalized
            return canonicalised
        if raw_query is not None:
            return build_query_meta(key, query=raw_query)

    if isinstance(payload, Mapping) and key in {"PropertyCompanyProfile", "PropertyCompanyProfileFree"}:
        latest_entries = payload.get("latest_entries")
        if isinstance(latest_entries, Mapping):
            for candidate_key in ("symbol", "SYMBOL"):
                if candidate_key in latest_entries:
                    symbol = _normalize_string(latest_entries[candidate_key], to_upper=True)
                    if symbol:
                        return {"symbol": symbol}
    return {}


def query_matches(key: QueryKey, payload: Any, **desired: Any) -> bool:
    payload_meta = _extract_query_meta_from_payload(key, payload)
    desired_meta = build_query_meta(key, **desired)

    if not desired_meta:
        return False

    return _serialize_meta(payload_meta) == _serialize_meta(desired_meta)
