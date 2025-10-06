import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ICON_FirstPlace from '@/assets/media/ICON_FirstPlace.svg?react';
import ICON_Triangle from '@/assets/media/ICON_Triangle.svg?react';

import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { VAI_SearchData } from '../types/interfaces';

type SearchResultEntry = Record<string, unknown>;
type SortDirection = 'asc' | 'desc';
type ColumnKey =
  | 'symbol'
  | 'name'
  | 'sector'
  | 'sectorRanking'
  | 'financial_score'
  | 'valuation_score';

type SortCycle = {
  columnId: ColumnKey | null;
  direction: SortDirection | null;
};

interface ColumnConfig {
  id: ColumnKey;
  title: string;
  key: ColumnKey;
  icon: typeof ICON_FirstPlace;
  defaultSorting: 'a' | 'd';
}

const NUMERIC_COLUMNS = new Set<ColumnKey>(['sectorRanking', 'financial_score', 'valuation_score']);

const COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'symbol', title: 'Symbol', key: 'symbol', icon: ICON_FirstPlace, defaultSorting: 'a' },
  { id: 'name', title: 'Name', key: 'name', icon: ICON_FirstPlace, defaultSorting: 'a' },
  { id: 'sector', title: 'Sector', key: 'sector', icon: ICON_FirstPlace, defaultSorting: 'a' },
  {
    id: 'sectorRanking',
    title: 'Sector Rank',
    key: 'sectorRanking',
    icon: ICON_FirstPlace,
    defaultSorting: 'a',
  },
  {
    id: 'financial_score',
    title: 'Financial Score',
    key: 'financial_score',
    icon: ICON_FirstPlace,
    defaultSorting: 'd',
  },
  {
    id: 'valuation_score',
    title: 'Valuation Score',
    key: 'valuation_score',
    icon: ICON_FirstPlace,
    defaultSorting: 'd',
  },
];

function getColumnValue(column: ColumnConfig, symbol: string, company: SearchResultEntry) {
  if (column.key === 'symbol') {
    return symbol;
  }
  return company?.[column.key];
}

function getDisplayScore(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Number(value.toFixed(2));
    return Number.isInteger(rounded) ? rounded : value.toFixed(1);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return '-';
}

function getDisplayText(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return fallback;
}

function getDisplayRank(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return '-';
}

function getDefaultDirection(column: ColumnConfig): SortDirection {
  return column.defaultSorting === 'd' ? 'desc' : 'asc';
}

function getOppositeDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

interface SearchResultsProps {
  prQuery: string;
}

function COM_SearchResults({ prQuery }: SearchResultsProps) {
  const store = useCompaniesStore();
  const [data, setData] = useState<VAI_SearchData | null>(null);
  const [sortState, setSortState] = useState<SortCycle>({ columnId: null, direction: null });

  useEffect(() => {
    if (!prQuery.trim()) {
      setData(null);
    }
  }, [prQuery]);

  useCompaniesStoreSync<VAI_SearchData>(store, 'PropertySearchResults', setData, {
    autoFetch: prQuery.trim().length > 0,
    prUrlPaths: prQuery ? [prQuery] : [],
    prUrlParams: { unique: false, variant: 'search' },
  });

  const safeData = data;
  const navigate = useNavigate();

  const sortedResults = useMemo(() => {
    if (!safeData?.results || typeof safeData.results !== 'object' || safeData.query !== prQuery) {
      return [] as Array<[string, SearchResultEntry]>;
    }

    const entries = Object.entries(safeData.results) as Array<[string, SearchResultEntry]>;

    if (!sortState.columnId || !sortState.direction) {
      return entries;
    }

    const column = COLUMN_CONFIG.find((item) => item.id === sortState.columnId);

    if (!column) {
      return entries;
    }

    const direction = sortState.direction;
    const isNumeric = NUMERIC_COLUMNS.has(column.key);

    return [...entries].sort((a, b) => {
      const [symbolA, companyA] = a;
      const [symbolB, companyB] = b;

      const rawA = getColumnValue(column, symbolA, companyA);
      const rawB = getColumnValue(column, symbolB, companyB);

      if (isNumeric) {
        const numberA = Number(rawA);
        const numberB = Number(rawB);

        if (!Number.isFinite(numberA) && !Number.isFinite(numberB)) {
          return 0;
        }
        if (!Number.isFinite(numberA)) {
          return 1;
        }
        if (!Number.isFinite(numberB)) {
          return -1;
        }

        return direction === 'desc' ? numberB - numberA : numberA - numberB;
      }

      const textA = String(rawA).toLowerCase();
      const textB = String(rawB).toLowerCase();

      return direction === 'desc' ? textB.localeCompare(textA) : textA.localeCompare(textB);
    });
  }, [safeData?.results, safeData?.query, sortState, prQuery]);

  const handleSort = (column: ColumnConfig) => {
    const defaultDirection = getDefaultDirection(column);
    const oppositeDirection = getOppositeDirection(defaultDirection);

    if (sortState.columnId !== column.id) {
      setSortState({ columnId: column.id, direction: defaultDirection });
      return;
    }

    if (sortState.direction === defaultDirection) {
      setSortState({ columnId: column.id, direction: oppositeDirection });
      return;
    }

    if (sortState.direction === oppositeDirection) {
      setSortState({ columnId: null, direction: null });
      return;
    }

    setSortState({ columnId: column.id, direction: defaultDirection });
  };

  if (!sortedResults.length) {
    return null;
  }

  return (
    <div
      className="area-flex-col mod-align-stretch"
      style={{ minWidth: 'calc(var(--default-font-size) * 48)' }}
    >
      <div className="area-grid-results mod-padding-side">
        {COLUMN_CONFIG.map((column) => {
          const Icon = column.icon;
          const isActive = sortState.columnId === column.id && sortState.direction !== null;
          const sortDirection = isActive ? sortState.direction : null;

          return (
            <button
              type="button"
              key={column.id}
              className={`look-button-ghost mod-button-auth look-text-x0${
                isActive ? ' mod-selected' : ''
              }`}
              onClick={() => handleSort(column)}
            >
              <Icon style={{ width: 'calc(var(--default-font-size) * 1)' }} />
              <span>{column.title}</span>
              <ICON_Triangle
                style={{
                  width: 'calc(var(--default-font-size) * 1)',
                  height: 'auto',
                  transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                  visibility: isActive ? 'visible' : 'hidden',
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="area-flex-col mod-align-stretch mod-gap-s mod-padding-none">
        {sortedResults.map(([symbol, company]) => {
          const companyName = getDisplayText(company?.name, 'Unknown Company');
          const sector = getDisplayText(company?.sector, 'Unknown Sector');
          const sectorRank = getDisplayRank(company?.sectorRanking);
          const financialScore = getDisplayScore(company?.financial_score);
          const valuationScore = getDisplayScore(company?.valuation_score);

          return (
            <div
              key={symbol}
              className="area-grid-results look-div-subtle state-hover-scale"
              onClick={() => {
                navigate(`/companies/page/${symbol}`);
              }}
            >
              <span className="look-text-x1 look-priority-high mod-text-wrap-gradient">
                {symbol}
              </span>
              <span
                className="look-text-x1 look-priority-medium mod-text-wrap-gradient"
                title={companyName}
              >
                {companyName}
              </span>
              <span
                className="look-text-x1 look-priority-low mod-text-wrap-gradient"
                title={sector}
              >
                {sector}
              </span>
              <span className="look-text-x1 look-priority-low">{sectorRank}</span>
              <span className="look-text-x1 look-priority-low">{financialScore}</span>
              <span className="look-text-x1 look-priority-low">{valuationScore}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default COM_SearchResults;
