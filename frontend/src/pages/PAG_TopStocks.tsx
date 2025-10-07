import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import COM_ListView from '../components/COM_ListView';
import COM_DropdownSelect, { type TYP_DropdownConfig } from '../components/COM_DropdownSelect';
import COM_MenuSelect, { type MenuSelectOptions } from '../components/COM_MenuSelect';
import COM_Footer from '../components/COM_Footer';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { ITF_ListViewColumnConfig } from '../types/interfaces';
import type { TYP_ListViewRow } from '../types/types';

const METRIC_OPTIONS: MenuSelectOptions = {
  valuation_score: 'Valuation Score',
  financial_score: 'Financial Score',
  total_score: 'Total Score',
};

type LeaderboardMetric = keyof typeof METRIC_OPTIONS;

type LeaderboardEntry = {
  symbol?: string;
  rank?: number;
  score?: number;
  [key: string]: unknown;
};

type LeaderboardPayload = {
  sector: string;
  metric: string;
  leaderboard: LeaderboardEntry[];
  intel?: Record<string, TYP_ListViewRow>;
};

function isLeaderboardPayload(value: unknown): value is LeaderboardPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Partial<LeaderboardPayload>;
  return (
    typeof payload.sector === 'string' &&
    typeof payload.metric === 'string' &&
    Array.isArray(payload.leaderboard)
  );
}

export default function PAG_TopStocks() {
  const navigate = useNavigate();
  const store = useCompaniesStore();

  const [stLeaderboards, setStLeaderboards] = useState<Record<string, LeaderboardPayload>>({});
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>('valuation_score');
  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectorValues, setSectorValues] = useState<string[] | null>(null);

  const distinctParams = useMemo(() => ({ kpi: 'sector' as const }), []);

  useCompaniesStoreSync<string[]>(
    store,
    'PropertyDistinctKPIValues',
    (values) => {
      if (!Array.isArray(values)) {
        setSectorValues(null);
        return;
      }
      const filtered = values.filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
      );
      setSectorValues(filtered);
    },
    {
      autoFetch: true,
      prUrlParams: distinctParams,
    }
  );

  useEffect(() => {
    if (!sectorValues || !sectorValues.length) {
      return;
    }
    setSelectedSector((prev) => (prev && sectorValues.includes(prev) ? prev : sectorValues[0]));
  }, [sectorValues]);

  useEffect(() => {
    if (!selectedSector || !selectedMetric) {
      return;
    }

    const cacheKey = `${selectedSector}::${selectedMetric}`;
    const cached = stLeaderboards[cacheKey];
    if (cached) {
      setActiveLeaderboard(cached);
      return;
    }

    setActiveLeaderboard(null);

    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    store
      .get('PropertyCompanyLeaderboard', [], { sector: selectedSector, metric: selectedMetric })
      .then((response) => {
        if (isCancelled) {
          return;
        }
        if (isLeaderboardPayload(response)) {
          setStLeaderboards((prev) => ({ ...prev, [cacheKey]: response }));
          setActiveLeaderboard(response);
        } else {
          setActiveLeaderboard(null);
          setLoadError('No leaderboard data available.');
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setActiveLeaderboard(null);
          setLoadError('Failed to fetch leaderboard data.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSector, selectedMetric, stLeaderboards, store]);

  const dropdownConfig = useMemo<TYP_DropdownConfig>(() => {
    const config: TYP_DropdownConfig = {};
    (sectorValues || []).forEach((sector) => {
      config[sector] = { label: sector };
    });
    return config;
  }, [sectorValues]);

  const leaderboardColumns = useMemo<ITF_ListViewColumnConfig[]>(() => {
    const metricLabel = METRIC_OPTIONS[selectedMetric] ?? 'Score';
    return [
      {
        id: 'rank',
        title: '#',
        key: 'rank',
        defaultSorting: 'a',
        isNumeric: true,
        fallback: '-',
        cellClassName: 'look-text-x1 look-priority-high',
      },
      {
        id: 'symbol',
        title: 'Symbol',
        key: 'symbol',
        defaultSorting: 'a',
        fallback: '-',
        cellClassName: 'look-text-x1 look-priority-high mod-text-wrap-gradient',
      },
      {
        id: 'name',
        title: 'Name',
        key: 'name',
        defaultSorting: 'a',
        fallback: 'Unknown Company',
        cellClassName: 'look-text-x1 look-priority-medium mod-text-wrap-gradient',
      },
      {
        id: 'sector',
        title: 'Sector',
        key: 'sector',
        defaultSorting: 'a',
        fallback: 'Unknown Sector',
        cellClassName: 'look-text-x1 look-priority-low mod-text-wrap-gradient',
      },
      {
        id: 'sectorRanking',
        title: 'Sector Rank',
        key: 'sectorRanking',
        defaultSorting: 'a',
        isNumeric: true,
        fallback: '-',
        cellClassName: 'look-text-x1 look-priority-low',
      },
      {
        id: 'score',
        title: metricLabel,
        key: 'score',
        defaultSorting: 'd',
        isNumeric: true,
        fallback: '-',
        cellClassName: 'look-text-x1 look-priority-high',
      },
    ];
  }, [selectedMetric]);

  const leaderboardRows = useMemo<Array<[string, TYP_ListViewRow]>>(() => {
    if (!activeLeaderboard) {
      return [];
    }

    const intel = activeLeaderboard.intel ?? {};

    return activeLeaderboard.leaderboard.map((entry, index) => {
      const symbol = typeof entry.symbol === 'string' ? entry.symbol : '';
      const intelEntry = (symbol && intel[symbol] ? intel[symbol] : {}) as TYP_ListViewRow;
      const rank = typeof entry.rank === 'number' ? entry.rank : index + 1;

      const rawScore = typeof entry.score === 'number' ? entry.score : Number(entry.score);
      const intelScore = intelEntry?.[selectedMetric];
      const intelNumeric = typeof intelScore === 'number' ? intelScore : Number(intelScore);
      const score = Number.isFinite(rawScore)
        ? rawScore
        : Number.isFinite(intelNumeric)
        ? intelNumeric
        : null;

      const row: TYP_ListViewRow = {
        symbol,
        rank,
        score,
        name: intelEntry?.name ?? null,
        sector: intelEntry?.sector ?? activeLeaderboard.sector,
        sectorRanking: intelEntry?.sectorRanking ?? null,
        financial_score: intelEntry?.financial_score ?? null,
        valuation_score: intelEntry?.valuation_score ?? null,
        total_score: intelEntry?.total_score ?? null,
      };

      const rowId = symbol;
      return [rowId, row];
    });
  }, [activeLeaderboard, selectedMetric]);

  const listPlaceholder = useMemo(() => {
    if (isLoading) {
      return (
        <div className="mod-padding-side look-text-x0 look-priority-low">Loading leaderboard�</div>
      );
    }
    if (loadError) {
      return <div className="mod-padding-side look-text-x0 look-priority-low">{loadError}</div>;
    }
    return null;
  }, [isLoading, loadError]);

  const handleMetricChange = (key: string) => {
    if (!(key in METRIC_OPTIONS) || key === selectedMetric) {
      return;
    }
    setSelectedMetric(key as LeaderboardMetric);
  };

  const handleSectorChange = (key: string) => {
    if (!sectorValues?.includes(key) || key === selectedSector) {
      return;
    }
    setSelectedSector(key);
  };

  const handleRowClick = (symbol: string) => {
    if (!symbol) {
      return;
    }
    navigate(`/companies/page/${symbol}`);
  };

  return (
    <STR_ApplicationPage>
      <div className="area-flex-wrap mod-space-between mod-w-full">
        <COM_DropdownSelect
          prDropdownConfig={dropdownConfig}
          prSelectedKey={selectedSector}
          handleSelect={handleSectorChange}
          prPlaceholder="Select sector"
        />
        <COM_MenuSelect prOptions={METRIC_OPTIONS} prHandleChange={handleMetricChange} />
      </div>
      {selectedSector && (
        <COM_ListView
          prRows={leaderboardRows}
          prColumnConfig={leaderboardColumns}
          prOnRowClick={(rowId) => handleRowClick(rowId)}
          prEmptyPlaceholder={listPlaceholder}
        />
      )}
      <COM_Footer />
    </STR_ApplicationPage>
  );
}
