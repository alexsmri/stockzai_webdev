from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field, replace
from datetime import date, datetime, time, timedelta
from statistics import pstdev
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np
import yfinance as yf

from .db.DB_Handler import DB_Handler, KPI_NAME_ALIASES

logger = logging.getLogger(__name__)

DEFAULT_START_DATE = date(2024, 1, 3)
DEFAULT_END_DATE = date(2025, 10, 3)
SYMBOLS_PER_CYCLE = 10
DEFAULT_INITIAL_CAPITAL = 100


def _normalize_weight(value: float) -> float:
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return 0.0
    if math.isnan(numeric_value):
        return 0.0
    return max(0.0, numeric_value)


@dataclass
class BacktestConfig:
    start: date = DEFAULT_START_DATE
    end: date = DEFAULT_END_DATE
    initial_capital: float = DEFAULT_INITIAL_CAPITAL
    symbols_per_cycle: int = SYMBOLS_PER_CYCLE
    financial_weight: float = 0.5
    valuation_weight: float = 0.5
    risk_target: Optional[float] = 0.0
    risk_tolerance: Optional[float] = None
    sector_filters: Optional[Iterable[str]] = None
    exclude_symbols: Optional[Iterable[str]] = None
    buy_frequency_months: int = 1
    allow_overlap: bool = False
    holding_period_months: Optional[int] = None
    reinvest_profits: bool = True
    transaction_fee_pct: float = 0.0
    benchmark_symbol: str = "^GSPC"

    def __post_init__(self) -> None:
        if self.start > self.end:
            raise ValueError("start date must be earlier than end date.")
        if self.initial_capital <= 0:
            raise ValueError("initial_capital must be positive.")
        self.symbols_per_cycle = max(3, min(int(self.symbols_per_cycle), 20))
        if not (1 <= self.buy_frequency_months <= 12):
            raise ValueError("buy_frequency_months must range between 1 and 12.")
        if self.holding_period_months is None:
            self.holding_period_months = self.buy_frequency_months
        self.holding_period_months = max(1, int(self.holding_period_months))
        if not self.allow_overlap and self.holding_period_months != self.buy_frequency_months:
            raise ValueError("holding_period_months must equal buy_frequency_months when overlap is disabled.")
        self.transaction_fee_pct = max(0.0, float(self.transaction_fee_pct))
        if self.transaction_fee_pct > 1.0:
            self.transaction_fee_pct /= 100.0
        self.financial_weight = _normalize_weight(self.financial_weight)
        self.valuation_weight = _normalize_weight(self.valuation_weight)
        total_weight = self.financial_weight + self.valuation_weight
        if total_weight == 0:
            self.financial_weight = self.valuation_weight = 0.5
        else:
            self.financial_weight /= total_weight
            self.valuation_weight /= total_weight
        if self.risk_tolerance is not None:
            self.risk_tolerance = max(1.0, min(10.0, float(self.risk_tolerance)))
        if self.sector_filters is not None:
            self.sector_filters = tuple(sorted({sector for sector in self.sector_filters if sector}))
        if self.exclude_symbols is not None:
            self.exclude_symbols = tuple(sorted({symbol.upper() for symbol in self.exclude_symbols if symbol}))

    def with_window(self, start: date, end: date) -> "BacktestConfig":
        return replace(self, start=start, end=end)

    @property
    def holding_period(self) -> int:
        return int(self.holding_period_months or self.buy_frequency_months)


@dataclass
class _ActivePosition:
    trade: TradeLeg
    allocation: float
    shares: float
    planned_exit_date: date
    entry_fee: float = 0.0
@dataclass
class TradeLeg:
    symbol: str
    allocation: float
    shares: float
    entry_price: Optional[float]
    exit_price: Optional[float]
    entry_date: Optional[date]
    exit_date: Optional[date]
    pnl: float
    fees_paid: float = 0.0
    notes: List[str] = field(default_factory=list)


@dataclass
class MonthlyCycle:
    cycle_start: date
    cycle_end: date
    capital_in: float
    capital_out: float
    picks: List[TradeLeg]
    selection_scores: Dict[str, float]
    notes: List[str] = field(default_factory=list)

    @property
    def gain(self) -> float:
        return self.capital_out - self.capital_in


@dataclass
class BacktestReport:
    cycles: List[MonthlyCycle]
    config: Optional[BacktestConfig] = None

    def all_trades(self, include_cash_legs: bool = False) -> List[TradeLeg]:
        trades: List[TradeLeg] = []
        for cycle in self.cycles:
            for trade in cycle.picks:
                if include_cash_legs or (trade.shares > 0 and trade.entry_price is not None):
                    trades.append(trade)
        return trades

    @property
    def ending_capital(self) -> float:
        if not self.cycles:
            return 0.0
        return self.cycles[-1].capital_out

    @property
    def starting_capital(self) -> float:
        if not self.cycles:
            return 0.0
        return self.cycles[0].capital_in

    @property
    def cumulative_return_pct(self) -> float:
        starting_capital = self.starting_capital
        if not starting_capital:
            return 0.0
        return (self.ending_capital / starting_capital - 1.0) * 100

    @property
    def profitable_trade_percentage(self) -> float:
        trades = self.all_trades()
        if not trades:
            return 0.0
        winners = sum(1 for trade in trades if trade.pnl > 0)
        return (winners / len(trades)) * 100

    @property
    def monthly_returns(self) -> List[float]:
        returns: List[float] = []
        for cycle in self.cycles:
            if cycle.capital_in:
                returns.append((cycle.capital_out - cycle.capital_in) / cycle.capital_in)
        return returns

    @property
    def strategy_volatility(self) -> float:
        returns = self.monthly_returns
        if len(returns) < 2:
            return 0.0
        return pstdev(returns)

    @property
    def average_monthly_return(self) -> float:
        returns = self.monthly_returns
        if not returns:
            return 0.0
        return sum(returns) / len(returns)

    @property
    def duration_years(self) -> float:
        periods = len(self.monthly_returns)
        return periods / 12 if periods else 0.0

    @property
    def sharpe_ratio(self) -> float:
        returns = self.monthly_returns
        if len(returns) < 2:
            return 0.0
        avg = self.average_monthly_return
        volatility = self.strategy_volatility
        if volatility == 0:
            return 0.0
        return (avg / volatility) * math.sqrt(12)

    @property
    def sortino_ratio(self) -> float:
        returns = self.monthly_returns
        if not returns:
            return 0.0
        downside = [min(0.0, r) for r in returns if r < 0]
        if not downside:
            return math.inf
        downside_dev = math.sqrt(sum(d ** 2 for d in downside) / len(downside))
        if downside_dev == 0:
            return math.inf
        return (self.average_monthly_return / downside_dev) * math.sqrt(12)

    @property
    def equity_curve(self) -> List[float]:
        if not self.cycles:
            return []
        equity = [self.cycles[0].capital_in]
        for cycle in self.cycles:
            equity.append(cycle.capital_out)
        return equity

    @property
    def max_drawdown(self) -> float:
        equity = self.equity_curve
        if not equity:
            return 0.0
        peak = equity[0]
        max_dd = 0.0
        for value in equity:
            if value > peak:
                peak = value
            if peak:
                drawdown = (peak - value) / peak
                max_dd = max(max_dd, drawdown)
        return max_dd

    @property
    def cagr(self) -> float:
        starting_capital = self.starting_capital
        if not starting_capital or starting_capital <= 0:
            return 0.0
        total_return = self.ending_capital / starting_capital
        years = self.duration_years
        if years == 0:
            return 0.0
        if total_return <= 0:
            return -1.0
        return total_return ** (1 / years) - 1

    @property
    def calmar_ratio(self) -> float:
        max_dd = self.max_drawdown
        cagr = self.cagr
        if max_dd == 0:
            return math.inf if cagr > 0 else 0.0
        return cagr / max_dd

    @property
    def absolute_return(self) -> float:
        return self.ending_capital - self.starting_capital

    def top_trades(self, limit: int = 10, descending: bool = True) -> List[TradeLeg]:
        trades = self.all_trades()
        if not trades:
            return []
        return sorted(trades, key=lambda trade: trade.pnl, reverse=descending)[:limit]

    def sample_randomness(self, simulation_nr: int = 10000):
        returns = self.monthly_returns
        if not returns:
            return np.array([0.0, 0.0, 0.0])
        simulations = []
        for _ in range(simulation_nr):
            sample = np.random.choice(returns, size=len(returns), replace=True)
            total = np.prod(1 + sample) - 1
            simulations.append(total)

        return np.percentile(simulations, [5, 50, 95])

    def benchmark_monthly_returns(self, symbol: str = "^GSPC") -> List[float]:
        returns: List[float] = []
        for cycle in self.cycles:
            entry_price, _ = _fetch_price(symbol, cycle.cycle_start)
            exit_price, _ = _fetch_price(symbol, cycle.cycle_end)
            if entry_price is None or exit_price is None or entry_price == 0:
                logger.warning(
                    "Skipping benchmark calculation for %s cycle %s due to missing price data.",
                    symbol,
                    cycle.cycle_start,
                )
                continue
            returns.append((exit_price - entry_price) / entry_price)
        return returns

    def benchmark_summary(self, symbol: Optional[str] = None) -> Optional[Dict[str, float]]:
        benchmark_symbol = symbol or (self.config.benchmark_symbol if self.config else "^GSPC")
        returns = self.benchmark_monthly_returns(benchmark_symbol)
        if not returns:
            return None
        stats = _calculate_return_statistics(returns, self.starting_capital)
        stats["symbol"] = benchmark_symbol
        stats["monthly_returns"] = returns
        return stats


def _resolve_kpi_name(friendly: str) -> str:
    return KPI_NAME_ALIASES.get(friendly, friendly)


def _month_delta(current: date, months: int = 1) -> date:
    month = current.month - 1 + months
    year = current.year + month // 12
    month = month % 12 + 1
    return date(year, month, current.day)


def _iter_cycle_dates(start: date, end: date, step_months: int = 1) -> Iterable[date]:
    cursor = start
    while cursor <= end:
        yield cursor
        cursor = _month_delta(cursor, step_months)


def _to_end_of_day(value: date) -> datetime:
    return datetime.combine(value, time(23, 59, 59))


def _calculate_return_statistics(returns: List[float], starting_capital: float) -> Dict[str, float]:
    stats: Dict[str, float] = {
        "average_monthly_return": 0.0,
        "volatility": 0.0,
        "sharpe_ratio": 0.0,
        "sortino_ratio": 0.0,
        "max_drawdown": 0.0,
        "cagr": 0.0,
        "calmar_ratio": 0.0,
        "ending_capital": starting_capital,
        "cumulative_return_pct": 0.0,
        "absolute_return": 0.0,
    }
    if not returns:
        return stats

    avg_return = sum(returns) / len(returns)
    volatility = pstdev(returns) if len(returns) >= 2 else 0.0
    sharpe = (avg_return / volatility) * math.sqrt(12) if volatility else 0.0

    downside = [r for r in returns if r < 0]
    if downside:
        downside_dev = math.sqrt(sum(d ** 2 for d in downside) / len(downside))
        sortino = (avg_return / downside_dev) * math.sqrt(12) if downside_dev else math.inf
    else:
        sortino = math.inf

    base_capital = starting_capital if starting_capital and starting_capital > 0 else 1.0
    equity = [base_capital]
    for r in returns:
        equity.append(equity[-1] * (1 + r))
    ending_capital = equity[-1]
    cumulative_return = (ending_capital / base_capital) - 1
    absolute_return = ending_capital - base_capital

    peak = equity[0]
    max_drawdown = 0.0
    for value in equity:
        if value > peak:
            peak = value
        if peak:
            drawdown = (peak - value) / peak
            max_drawdown = max(max_drawdown, drawdown)

    years = len(returns) / 12 if returns else 0.0
    if years > 0 and ending_capital > 0:
        cagr = (ending_capital / base_capital) ** (1 / years) - 1
    else:
        cagr = 0.0
    if max_drawdown == 0:
        calmar = math.inf if cagr > 0 else 0.0
    else:
        calmar = cagr / max_drawdown

    stats.update(
        {
            "average_monthly_return": avg_return,
            "volatility": volatility,
            "sharpe_ratio": sharpe,
            "sortino_ratio": sortino,
            "max_drawdown": max_drawdown,
            "cagr": cagr,
            "calmar_ratio": calmar,
            "ending_capital": ending_capital,
            "cumulative_return_pct": cumulative_return * 100,
            "absolute_return": absolute_return,
        }
    )
    return stats


def _fetch_top_symbols(
    db: DB_Handler,
    as_of: date,
    limit: int = SYMBOLS_PER_CYCLE,
    risk_target: Optional[float] = 0.0,
    financial_weight: float = 0.5,
    valuation_weight: float = 0.5,
    risk_tolerance: Optional[float] = None,
    sectors: Optional[Iterable[str]] = None,
    exclude_symbols: Optional[Iterable[str]] = None,
) -> Dict[str, float]:
    financial_info = db.dbq_get_kpi_info(_resolve_kpi_name("financial_score"))
    valuation_info = db.dbq_get_kpi_info(_resolve_kpi_name("valuation_score"))
    risk_info = db.dbq_get_kpi_info(_resolve_kpi_name("risk_score"))

    sector_info = None
    sector_filter = tuple(sectors) if sectors else tuple()
    if sector_filter:
        try:
            sector_info = db.dbq_get_kpi_info(_resolve_kpi_name("sector"))
        except Exception:
            logger.warning("Unable to resolve sector KPI; ignoring provided sector filter.")
            sector_filter = tuple()

    financial_table = financial_info["role"]
    valuation_table = valuation_info["role"]
    risk_table = risk_info["role"]
    financial_kpi_id = int(financial_info["id"])
    valuation_kpi_id = int(valuation_info["id"])
    risk_kpi_id = int(risk_info["id"])

    sector_cte = ""
    sector_join = ""
    sector_condition = ""
    if sector_info and sector_filter:
        sector_table = sector_info["role"]
        sector_kpi_id = int(sector_info["id"])
        sector_cte = f""",
        sector_ranked AS (
            SELECT s.SYMBOL AS symbol,
                s.value AS sector_value,
                ROW_NUMBER() OVER (PARTITION BY s.SYMBOL ORDER BY s.date DESC) AS rn
            FROM `{sector_table}` s
            WHERE s.KPI = :sector_kpi_id
            AND s.date <= :as_of
            AND s.value IS NOT NULL
        )"""
        sector_join = "JOIN sector_ranked sr ON sr.symbol = fr.symbol"
        sector_condition = "AND sr.rn = 1 AND sr.sector_value IN :sector_filters"

    risk_condition = ""
    if risk_tolerance is not None:
        risk_condition = "AND rr.risk_value <= :risk_tolerance"
    elif risk_target is not None:
        risk_condition = "AND rr.risk_value = :risk_target"

    exclude_condition = ""
    excluded = tuple(exclude_symbols) if exclude_symbols else tuple()
    if excluded:
        exclude_condition = "AND fr.symbol NOT IN :excluded_symbols"

    query = f"""
        WITH financial_ranked AS (
            SELECT t.SYMBOL AS symbol,
                t.value AS financial_value,
                ROW_NUMBER() OVER (PARTITION BY t.SYMBOL ORDER BY t.date DESC) AS rn
            FROM `{financial_table}` t
            WHERE t.KPI = :financial_kpi_id
            AND t.date <= :as_of
            AND t.value IS NOT NULL
        ),
        valuation_ranked AS (
            SELECT v.SYMBOL AS symbol,
                v.value AS valuation_value,
                ROW_NUMBER() OVER (PARTITION BY v.SYMBOL ORDER BY v.date DESC) AS rn
            FROM `{valuation_table}` v
            WHERE v.KPI = :valuation_kpi_id
            AND v.date <= :as_of
            AND v.value IS NOT NULL
        ),
        risk_ranked AS (
            SELECT r.SYMBOL AS symbol,
                r.value AS risk_value,
                ROW_NUMBER() OVER (PARTITION BY r.SYMBOL ORDER BY r.date DESC) AS rn
            FROM `{risk_table}` r
            WHERE r.KPI = :risk_kpi_id
            AND r.date <= :as_of
            AND r.value IS NOT NULL
        ){sector_cte}
        SELECT fr.symbol,
            (fr.financial_value * :financial_weight + vr.valuation_value * :valuation_weight) AS aggregated_score
        FROM financial_ranked fr
        JOIN valuation_ranked vr ON vr.symbol = fr.symbol
        JOIN risk_ranked rr ON rr.symbol = fr.symbol
        {sector_join}
        WHERE fr.rn = 1
        AND vr.rn = 1
        AND rr.rn = 1
        {risk_condition}
        {sector_condition}
        {exclude_condition}
        ORDER BY aggregated_score DESC
        LIMIT :limit
    """
    params = {
        "financial_kpi_id": financial_kpi_id,
        "valuation_kpi_id": valuation_kpi_id,
        "risk_kpi_id": risk_kpi_id,
        "as_of": _to_end_of_day(as_of),
        "limit": limit,
        "financial_weight": financial_weight,
        "valuation_weight": valuation_weight,
    }
    if risk_tolerance is not None:
        params["risk_tolerance"] = risk_tolerance
    elif risk_target is not None:
        params["risk_target"] = risk_target
    if sector_info and sector_filter:
        params["sector_kpi_id"] = int(sector_info["id"])
        params["sector_filters"] = sector_filter
    if excluded:
        params["excluded_symbols"] = excluded

    rows = db.dbu_read_execute(query, params=params)
    return {symbol: float(score) for symbol, score in rows if symbol and score is not None}


def _pick_price_column(frame_row) -> str:
    if "Adj Close" in frame_row.index:
        return "Adj Close"
    return "Close"


def _fetch_price(symbol: str, target_date: date, forward_window: int = 7) -> tuple[Optional[float], Optional[date]]:
    ticker = yf.Ticker(symbol)
    start = (target_date - timedelta(days=2)).isoformat()
    end = (target_date + timedelta(days=forward_window + 1)).isoformat()
    history = ticker.history(start=start, end=end, auto_adjust=False)
    if history.empty:
        logger.warning("No price data for %s around %s", symbol, target_date)
        return None, None
    if history.index.tz is not None:
        history.index = history.index.tz_localize(None)
    eligible = history[history.index.date >= target_date]
    if eligible.empty:
        logger.warning("No forward trading day for %s after %s", symbol, target_date)
        return None, None
    first_row = eligible.iloc[0]
    price_column = _pick_price_column(first_row)
    price = float(first_row[price_column])
    trade_date = eligible.index[0].date()
    return price, trade_date


def run_monthly_top_score_backtest(
    start: date = DEFAULT_START_DATE,
    end: date = DEFAULT_END_DATE,
    initial_capital: float = DEFAULT_INITIAL_CAPITAL,
    symbols_per_cycle: int = SYMBOLS_PER_CYCLE,
    db: Optional[DB_Handler] = None,
    config: Optional[BacktestConfig] = None,
) -> BacktestReport:
    cfg = config or BacktestConfig(
        start=start,
        end=end,
        initial_capital=initial_capital,
        symbols_per_cycle=symbols_per_cycle,
    )
    db_handler = db or DB_Handler("companies")
    cycles: List[MonthlyCycle] = []
    cash = cfg.initial_capital
    withdrawn_profits = 0.0
    active_positions: List[_ActivePosition] = []

    def _portfolio_total() -> float:
        return cash + sum(position.allocation for position in active_positions) + withdrawn_profits

    def _close_positions(upto_date: date, *, force: bool = False) -> bool:
        nonlocal cash, withdrawn_profits
        closed_any = False
        remaining: List[_ActivePosition] = []
        for position in active_positions:
            should_close = force or position.planned_exit_date <= upto_date
            if not should_close:
                remaining.append(position)
                continue
            closed_any = True
            lookup_date = position.planned_exit_date if not force else min(position.planned_exit_date, upto_date)
            exit_price, exit_trade_date = _fetch_price(position.trade.symbol, lookup_date)
            if exit_price is None:
                exit_price = position.trade.entry_price or 0.0
                exit_trade_date = exit_trade_date or lookup_date
                position.trade.notes.append("Missing exit price; assumed entry price.")
            exit_value = position.shares * exit_price
            exit_fee = exit_value * cfg.transaction_fee_pct
            net_exit = exit_value - exit_fee
            cash += net_exit
            total_fees = position.entry_fee + exit_fee
            pnl = net_exit - position.allocation - position.entry_fee
            position.trade.exit_price = exit_price
            position.trade.exit_date = exit_trade_date
            position.trade.pnl = pnl
            position.trade.fees_paid = total_fees
            if force and position.planned_exit_date > upto_date:
                position.trade.notes.append(f"Force-closed on {upto_date.isoformat()} before planned exit.")
            if not cfg.reinvest_profits and pnl > 0:
                cash -= pnl
                withdrawn_profits += pnl
        active_positions[:] = remaining
        return closed_any

    for cycle_start in _iter_cycle_dates(cfg.start, cfg.end, step_months=cfg.buy_frequency_months):
        _close_positions(cycle_start)
        capital_in = _portfolio_total()
        cycle_end = min(_month_delta(cycle_start, cfg.buy_frequency_months), cfg.end)
        selection = _fetch_top_symbols(
            db_handler,
            cycle_start,
            limit=cfg.symbols_per_cycle,
            risk_target=cfg.risk_target,
            financial_weight=cfg.financial_weight,
            valuation_weight=cfg.valuation_weight,
            risk_tolerance=cfg.risk_tolerance,
            sectors=cfg.sector_filters,
            exclude_symbols=cfg.exclude_symbols,
        )
        logger.info("Cycle start %s selection: %s", cycle_start, selection)
        notes: List[str] = []
        if len(selection) < cfg.symbols_per_cycle:
            notes.append(f"Only found {len(selection)} eligible stocks on {cycle_start.isoformat()}.")
        picks: List[TradeLeg] = []

        target_positions = min(len(selection), cfg.symbols_per_cycle)
        allocation_per_symbol = cash / target_positions if target_positions and cash > 0 else 0.0
        if allocation_per_symbol <= 0 and target_positions:
            notes.append("Insufficient available cash for new positions.")

        for symbol in selection.keys():
            if allocation_per_symbol <= 0 or cash <= 0:
                break
            leg_notes: List[str] = []
            entry_price, actual_entry_date = _fetch_price(symbol, cycle_start)
            if entry_price is None:
                leg_notes.append("Missing entry price, capital held as cash.")
                picks.append(
                    TradeLeg(
                        symbol=symbol,
                        allocation=allocation_per_symbol,
                        shares=0.0,
                        entry_price=None,
                        exit_price=None,
                        entry_date=None,
                        exit_date=None,
                        pnl=0.0,
                        fees_paid=0.0,
                        notes=leg_notes,
                    )
                )
                continue

            entry_fee = allocation_per_symbol * cfg.transaction_fee_pct
            total_required = allocation_per_symbol + entry_fee
            if cash < total_required:
                notes.append(f"Ran out of cash before purchasing {symbol}.")
                break

            cash -= total_required
            shares = allocation_per_symbol / entry_price if entry_price else 0.0
            planned_exit = _month_delta(cycle_start, cfg.holding_period)
            trade = TradeLeg(
                symbol=symbol,
                allocation=allocation_per_symbol,
                shares=shares,
                entry_price=entry_price,
                exit_price=None,
                entry_date=actual_entry_date,
                exit_date=None,
                pnl=0.0,
                fees_paid=entry_fee,
                notes=leg_notes,
            )
            picks.append(trade)
            active_positions.append(
                _ActivePosition(
                    trade=trade,
                    allocation=allocation_per_symbol,
                    shares=shares,
                    planned_exit_date=planned_exit,
                    entry_fee=entry_fee,
                )
            )

        if not selection:
            notes.append("No eligible stocks were found; capital carried forward unchanged.")

        cycle = MonthlyCycle(
            cycle_start=cycle_start,
            cycle_end=cycle_end,
            capital_in=capital_in,
            capital_out=_portfolio_total(),
            picks=picks,
            selection_scores=selection,
            notes=notes,
        )
        cycles.append(cycle)

    pre_settlement = _portfolio_total()
    settled = _close_positions(cfg.end, force=True)
    final_total = _portfolio_total()
    if settled:
        settlement_cycle = MonthlyCycle(
            cycle_start=cfg.end,
            cycle_end=cfg.end,
            capital_in=pre_settlement,
            capital_out=final_total,
            picks=[],
            selection_scores={},
            notes=["Settled remaining open positions at the end of the backtest."],
        )
        cycles.append(settlement_cycle)
    elif cycles:
        cycles[-1].capital_out = final_total
    else:
        cycles.append(
            MonthlyCycle(
                cycle_start=cfg.start,
                cycle_end=cfg.end,
                capital_in=cfg.initial_capital,
                capital_out=final_total,
                picks=[],
                selection_scores={},
                notes=["No trades executed."],
            )
        )

    return BacktestReport(cycles=cycles, config=cfg)


def run_backtest_with_rolling_windows(
    start: date = DEFAULT_START_DATE,
    end: date = DEFAULT_END_DATE,
    initial_capital: float = DEFAULT_INITIAL_CAPITAL,
    symbols_per_cycle: int = SYMBOLS_PER_CYCLE,
    db: Optional[DB_Handler] = None,
    window_months: int = 6,
    window_step_months: int = 3,
    config: Optional[BacktestConfig] = None,
) -> Tuple[BacktestReport, List[Tuple[Tuple[date, date], BacktestReport]]]:
    """
    Run the full-period backtest and a series of rolling 6-month windows starting each quarter.
    """
    if window_months <= 0 or window_step_months <= 0:
        raise ValueError("window_months and window_step_months must be positive.")

    db_handler = db or DB_Handler("companies")
    base_config = config or BacktestConfig(
        start=start,
        end=end,
        initial_capital=initial_capital,
        symbols_per_cycle=symbols_per_cycle,
    )
    primary_report = run_monthly_top_score_backtest(
        db=db_handler,
        config=base_config,
    )

    rolling_reports: List[Tuple[Tuple[date, date], BacktestReport]] = []
    window_start = base_config.start
    while window_start < base_config.end:
        window_end = _month_delta(window_start, window_months)
        if window_end > base_config.end:
            break
        window_report = run_monthly_top_score_backtest(
            db=db_handler,
            config=base_config.with_window(window_start, window_end),
        )
        rolling_reports.append(((window_start, window_end), window_report))
        window_start = _month_delta(window_start, window_step_months)

    return primary_report, rolling_reports


def _format_ratio(value: float) -> str:
    if math.isinf(value):
        return "inf"
    return f"{value:.2f}"


def print_backtest_summary(
    report: BacktestReport,
    rolling_reports: Optional[List[Tuple[Tuple[date, date], BacktestReport]]] = None,
    top_n: int = 10,
    benchmark_symbol: Optional[str] = None,
) -> None:
    benchmark = benchmark_symbol or (report.config.benchmark_symbol if report.config else "^GSPC")
    print("=== Backtest Summary ===")
    print(f"Ending capital: ${report.ending_capital:,.2f}")
    print(f"Cumulative return: {report.cumulative_return_pct:.2f}%")
    print(f"Absolute return: ${report.absolute_return:,.2f}")
    print(f"Profitable trades: {report.profitable_trade_percentage:.2f}%")
    volatility_pct = report.strategy_volatility * 100
    print(f"Strategy volatility (monthly return stdev): {volatility_pct:.2f}%")
    print(f"Average monthly return: {report.average_monthly_return * 100:.2f}%")
    print(f"Sharpe Ratio (annualized): {report.sharpe_ratio:.2f}")
    print(f"Sortino Ratio (annualized): {_format_ratio(report.sortino_ratio)}")
    print(f"Max Drawdown: {report.max_drawdown * 100:.2f}%")
    print(f"CAGR: {report.cagr * 100:.2f}%")
    print(f"Calmar Ratio: {_format_ratio(report.calmar_ratio)}")

    randomness = report.sample_randomness()
    if randomness is not None:
        print(
            "Randomness percentiles (5/50/95): "
            f"{randomness[0] * 100:.2f}% | {randomness[1] * 100:.2f}% | {randomness[2] * 100:.2f}%"
        )

    benchmark_stats = report.benchmark_summary(benchmark)
    if benchmark_stats:
        print(f"\nBenchmark ({benchmark})")
        print(f"  Cumulative return: {benchmark_stats['cumulative_return_pct']:.2f}%")
        print(f"  Absolute return: ${benchmark_stats['absolute_return']:,.2f}")
        print(f"  Average monthly return: {benchmark_stats['average_monthly_return'] * 100:.2f}%")
        print(f"  Volatility: {benchmark_stats['volatility'] * 100:.2f}%")
        print(f"  Sharpe: {benchmark_stats['sharpe_ratio']:.2f}")
        print(f"  Sortino: {_format_ratio(benchmark_stats['sortino_ratio'])}")
        print(f"  Max Drawdown: {benchmark_stats['max_drawdown'] * 100:.2f}%")
        print(f"  CAGR: {benchmark_stats['cagr'] * 100:.2f}%")
        print(f"  Calmar: {_format_ratio(benchmark_stats['calmar_ratio'])}")

    best_trades = report.top_trades(limit=top_n, descending=True)
    worst_trades = report.top_trades(limit=top_n, descending=False)

    def _print_trades(title: str, trades: List[TradeLeg]) -> None:
        print(f"\n{title}")
        if not trades:
            print("  No trades to display.")
            return
        for idx, trade in enumerate(trades, start=1):
            entry = trade.entry_date.isoformat() if trade.entry_date else "n/a"
            exit_date = trade.exit_date.isoformat() if trade.exit_date else "n/a"
            entry_price = trade.entry_price if trade.entry_price is not None else 0.0
            exit_price = trade.exit_price if trade.exit_price is not None else 0.0
            print(
                f"  {idx:02d}. {trade.symbol} | PnL: ${trade.pnl:,.2f} | "
                f"{entry} -> {exit_date} | Entry: {entry_price:.2f} | Exit: {exit_price:.2f}"
            )

    _print_trades("Top Trades", best_trades)
    _print_trades("Worst Trades", worst_trades)

    if rolling_reports:
        print("\n=== Rolling Window Backtests ===")
        for idx, ((window_start, window_end), window_report) in enumerate(rolling_reports, start=1):
            avg_return_pct = window_report.average_monthly_return * 100
            abs_return = window_report.absolute_return
            print(f"Window {idx}: {window_start.isoformat()} -> {window_end.isoformat()}")
            print(f"  Avg monthly return: {avg_return_pct:.2f}%")
            print(f"  Absolute return: ${abs_return:,.2f} ({window_report.cumulative_return_pct:.2f}%)")
            print(f"  Profitable trades: {window_report.profitable_trade_percentage:.2f}%")
            print(f"  Sharpe: {window_report.sharpe_ratio:.2f}")
            print(f"  Sortino: {_format_ratio(window_report.sortino_ratio)}")
            print(f"  Max Drawdown: {window_report.max_drawdown * 100:.2f}%")
            print(f"  Calmar: {_format_ratio(window_report.calmar_ratio)}")
            window_benchmark = window_report.benchmark_summary(benchmark)
            if window_benchmark:
                print(f"  Benchmark ({benchmark}) cumulative: {window_benchmark['cumulative_return_pct']:.2f}%")
                print(f"    Avg monthly return: {window_benchmark['average_monthly_return'] * 100:.2f}%")
                print(f"    Sharpe: {window_benchmark['sharpe_ratio']:.2f}")
                print(f"    Sortino: {_format_ratio(window_benchmark['sortino_ratio'])}")
                print(f"    Max Drawdown: {window_benchmark['max_drawdown'] * 100:.2f}%")
                print(f"    Calmar: {_format_ratio(window_benchmark['calmar_ratio'])}")

    print_backtest_report(report)


def print_backtest_report(report: BacktestReport) -> None:
    print("\n=== Monthly Breakdown ===")
    if not report.cycles:
        print("No data available.")
        return
    for cycle in report.cycles:
        if cycle.capital_in:
            cycle_return = (cycle.capital_out - cycle.capital_in) / cycle.capital_in * 100
        else:
            cycle_return = 0.0
        print(
            f"{cycle.cycle_start:%Y-%m} | Capital {cycle.capital_in:,.2f} -> "
            f"{cycle.capital_out:,.2f} ({cycle_return:+.2f}%)"
        )
        if not cycle.picks:
            print("  No trades executed.")
            continue
        for trade in cycle.picks:
            entry_date = trade.entry_date.isoformat() if trade.entry_date else "n/a"
            exit_date = trade.exit_date.isoformat() if trade.exit_date else "n/a"
            entry_price = trade.entry_price if trade.entry_price is not None else 0.0
            exit_price = trade.exit_price if trade.exit_price is not None else 0.0
            if trade.allocation:
                allocation_return = trade.pnl / trade.allocation * 100
            else:
                allocation_return = 0.0
            if trade.entry_price and trade.exit_price:
                price_return = ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
            else:
                price_return = 0.0
            status = ""
            if trade.shares == 0:
                status = "CASH"
            elif trade.exit_price is None:
                status = "OPEN"
            print(
                f"  - {trade.symbol}: {entry_date} -> {exit_date} | "
                f"{entry_price:.2f} -> {exit_price:.2f} | "
                f"Price {price_return:+.2f}% | Alloc {allocation_return:+.2f}% | "
                f"PnL ${trade.pnl:,.2f} {status}".rstrip()
            )


__all__ = [
    "BacktestConfig",
    "BacktestReport",
    "MonthlyCycle",
    "TradeLeg",
    "run_monthly_top_score_backtest",
    "run_backtest_with_rolling_windows",
    "print_backtest_summary",
    "print_backtest_report",
]
