from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta
from statistics import pstdev
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np
import yfinance as yf

from .db.DB_Handler import DB_Handler, KPI_NAME_ALIASES

logger = logging.getLogger(__name__)

DEFAULT_START_DATE = date(2024, 1, 3)
DEFAULT_END_DATE = date(2025, 10, 3)
SYMBOLS_PER_CYCLE = 3
DEFAULT_INITIAL_CAPITAL = 300.0


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

    def benchmark_summary(self, symbol: str = "^GSPC") -> Optional[Dict[str, float]]:
        returns = self.benchmark_monthly_returns(symbol)
        if not returns:
            return None
        stats = _calculate_return_statistics(returns, self.starting_capital)
        stats["symbol"] = symbol
        stats["monthly_returns"] = returns
        return stats


def _resolve_kpi_name(friendly: str) -> str:
    return KPI_NAME_ALIASES.get(friendly, friendly)


def _month_delta(current: date, months: int = 1) -> date:
    month = current.month - 1 + months
    year = current.year + month // 12
    month = month % 12 + 1
    return date(year, month, current.day)


def _iter_cycle_dates(start: date, end: date) -> Iterable[date]:
    cursor = start
    while cursor <= end:
        yield cursor
        cursor = _month_delta(cursor, 1)


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
    risk_target: float = 0.0,
) -> Dict[str, float]:
    financial_info = db.dbq_get_kpi_info(_resolve_kpi_name("financial_score"))
    valuation_info = db.dbq_get_kpi_info(_resolve_kpi_name("valuation_score"))
    risk_info = db.dbq_get_kpi_info(_resolve_kpi_name("risk_score"))

    financial_table = financial_info["role"]
    valuation_table = valuation_info["role"]
    risk_table = risk_info["role"]
    financial_kpi_id = int(financial_info["id"])
    valuation_kpi_id = int(valuation_info["id"])
    risk_kpi_id = int(risk_info["id"])

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
            AND r.value IS NOT NULL
        )
        SELECT fr.symbol,
            (fr.financial_value + vr.valuation_value) / 2 AS aggregated_score
        FROM financial_ranked fr
        JOIN valuation_ranked vr ON vr.symbol = fr.symbol
        JOIN risk_ranked rr ON rr.symbol = fr.symbol
        WHERE fr.rn = 1
        AND vr.rn = 1
        AND rr.rn = 1
        AND rr.risk_value = :risk_target
        ORDER BY aggregated_score DESC
        LIMIT :limit
    """
    params = {
        "financial_kpi_id": financial_kpi_id,
        "valuation_kpi_id": valuation_kpi_id,
        "risk_kpi_id": risk_kpi_id,
        "as_of": _to_end_of_day(as_of),
        "risk_target": risk_target,
        "limit": limit,
    }
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
) -> BacktestReport:
    db_handler = db or DB_Handler("companies")
    cycles: List[MonthlyCycle] = []
    capital = initial_capital

    for cycle_start in _iter_cycle_dates(start, end):
        cycle_end = _month_delta(cycle_start, 1)
        logger.info(f"Current Cycle start:{cycle_start}")
        selection = _fetch_top_symbols(db_handler, cycle_start, symbols_per_cycle)
        logger.info(f"Current Cycle selection:{selection}")
        notes: List[str] = []
        if len(selection) < symbols_per_cycle:
            notes.append(
                f"Only found {len(selection)} eligible stocks on {cycle_start.isoformat()}."
            )

        allocation_per_symbol = capital / symbols_per_cycle if selection else 0.0
        picks: List[TradeLeg] = []
        realized_value = 0.0

        for symbol in selection:
            allocation = allocation_per_symbol
            entry_price, actual_entry_date = _fetch_price(symbol, cycle_start)
            leg_notes: List[str] = []
            if entry_price is None:
                realized_value += allocation
                leg_notes.append("Missing entry price, treated as holding cash.")
                picks.append(
                    TradeLeg(
                        symbol=symbol,
                        allocation=allocation,
                        shares=0.0,
                        entry_price=None,
                        exit_price=None,
                        entry_date=None,
                        exit_date=None,
                        pnl=0.0,
                        notes=leg_notes,
                    )
                )
                continue

            shares = allocation / entry_price if entry_price else 0.0
            exit_price, actual_exit_date = _fetch_price(symbol, cycle_end)
            if exit_price is None:
                realized_value += allocation
                leg_notes.append("Missing exit price, capital rolled unchanged.")
                picks.append(
                    TradeLeg(
                        symbol=symbol,
                        allocation=allocation,
                        shares=shares,
                        entry_price=entry_price,
                        exit_price=None,
                        entry_date=actual_entry_date,
                        exit_date=None,
                        pnl=0.0,
                        notes=leg_notes,
                    )
                )
                continue

            exit_value = shares * exit_price
            realized_value += exit_value
            pnl = exit_value - allocation
            picks.append(
                TradeLeg(
                    symbol=symbol,
                    allocation=allocation,
                    shares=shares,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    entry_date=actual_entry_date,
                    exit_date=actual_exit_date,
                    pnl=pnl,
                    notes=leg_notes,
                )
            )

        if not selection:
            realized_value = capital
            notes.append("No eligible stocks were found; capital carried forward unchanged.")

        cycle = MonthlyCycle(
            cycle_start=cycle_start,
            cycle_end=cycle_end,
            capital_in=capital,
            capital_out=realized_value,
            picks=picks,
            selection_scores=selection,
            notes=notes,
        )
        cycles.append(cycle)
        capital = realized_value

    return BacktestReport(cycles=cycles)


def run_backtest_with_rolling_windows(
    start: date = DEFAULT_START_DATE,
    end: date = DEFAULT_END_DATE,
    initial_capital: float = DEFAULT_INITIAL_CAPITAL,
    symbols_per_cycle: int = SYMBOLS_PER_CYCLE,
    db: Optional[DB_Handler] = None,
    window_months: int = 6,
    window_step_months: int = 3,
) -> Tuple[BacktestReport, List[Tuple[Tuple[date, date], BacktestReport]]]:
    """
    Run the full-period backtest and a series of rolling 6-month windows starting each quarter.
    """
    if window_months <= 0 or window_step_months <= 0:
        raise ValueError("window_months and window_step_months must be positive.")

    db_handler = db or DB_Handler("companies")
    primary_report = run_monthly_top_score_backtest(
        start=start,
        end=end,
        initial_capital=initial_capital,
        symbols_per_cycle=symbols_per_cycle,
        db=db_handler,
    )

    rolling_reports: List[Tuple[Tuple[date, date], BacktestReport]] = []
    window_start = start
    while window_start < end:
        window_end = _month_delta(window_start, window_months)
        if window_end > end:
            break
        window_report = run_monthly_top_score_backtest(
            start=window_start,
            end=window_end,
            initial_capital=initial_capital,
            symbols_per_cycle=symbols_per_cycle,
            db=db_handler,
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
    benchmark_symbol: str = "^GSPC",
) -> None:
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

    benchmark_stats = report.benchmark_summary(benchmark_symbol)
    if benchmark_stats:
        print(f"\nBenchmark ({benchmark_symbol})")
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
            window_benchmark = window_report.benchmark_summary(benchmark_symbol)
            if window_benchmark:
                print(f"  Benchmark ({benchmark_symbol}) cumulative: {window_benchmark['cumulative_return_pct']:.2f}%")
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
    "BacktestReport",
    "MonthlyCycle",
    "TradeLeg",
    "run_monthly_top_score_backtest",
    "run_backtest_with_rolling_windows",
    "print_backtest_summary",
    "print_backtest_report",
]
