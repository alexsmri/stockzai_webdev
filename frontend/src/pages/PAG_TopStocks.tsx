import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import COM_DropdownSelect, { type TYP_DropdownConfig } from '../components/COM_DropdownSelect';
import COM_MenuSelect, { type MenuSelectOptions } from '../components/COM_MenuSelect';
import COM_LeaderboardTable from '../components/COM_LeaderboardTable';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { TYP_ListViewRow } from '../types/types';
import COM_Loading from '../components/COM_Loading';
import { queryMatches } from '../utils/functions';

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

  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>('valuation_score');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectorValues, setSectorValues] = useState<string[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPayload | null>(() => {
    const existing = store.read('PropertyCompanyLeaderboard');
    return isLeaderboardPayload(existing) ? existing : null;
  });

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

  useCompaniesStoreSync<LeaderboardPayload | boolean>(
    store,
    'PropertyCompanyLeaderboard',
    (payload) => {
      if (isLeaderboardPayload(payload)) {
        setLeaderboardData(payload);
        return;
      }
      setLeaderboardData(null);
    }
  );

  useEffect(() => {
    if (!selectedSector || !selectedMetric) {
      return;
    }
    setLoadError(null);
    void store
      .get('PropertyCompanyLeaderboard', [], { sector: selectedSector, metric: selectedMetric })
      .then((response) => {
        if (response === false) {
          setLoadError('Failed to fetch leaderboard data.');
        } else if (!isLeaderboardPayload(response)) {
          setLoadError('No leaderboard data available.');
        }
      })
      .catch(() => {
        setLoadError('Failed to fetch leaderboard data.');
      });
  }, [selectedSector, selectedMetric, store]);

  const dropdownConfig = useMemo<TYP_DropdownConfig>(() => {
    const config: TYP_DropdownConfig = {};
    (sectorValues || []).forEach((sector) => {
      config[sector] = { label: sector };
    });
    return config;
  }, [sectorValues]);

  const hasMatchingLeaderboard =
    Boolean(selectedSector && selectedMetric) &&
    queryMatches('PropertyCompanyLeaderboard', leaderboardData, {
      sector: selectedSector,
      metric: selectedMetric,
    });

  const leaderboardRows = useMemo<Array<[string, TYP_ListViewRow]>>(() => {
    if (!hasMatchingLeaderboard || !leaderboardData) {
      return [];
    }

    const intel = leaderboardData.intel ?? {};

    return leaderboardData.leaderboard.map((entry, index) => {
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
        sector: intelEntry?.sector ?? leaderboardData.sector,
        sectorRanking: intelEntry?.sectorRanking ?? null,
        financial_score: intelEntry?.financial_score ?? null,
        valuation_score: intelEntry?.valuation_score ?? null,
        total_score: intelEntry?.total_score ?? null,
      };

      const rowId = symbol;
      return [rowId, row];
    });
  }, [hasMatchingLeaderboard, leaderboardData, selectedMetric]);

  const listPlaceholder = useMemo(() => {
    if (loadError) {
      return <div className="mod-padding-side look-text-x0 look-priority-low">{loadError}</div>;
    }
    if (selectedSector && !hasMatchingLeaderboard) {
      return (
        <div className="area-flex-row mod-justify-center mod-padding-xl">
          <COM_Loading />
        </div>
      );
    }
    return null;
  }, [hasMatchingLeaderboard, loadError, selectedSector]);

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
        <COM_LeaderboardTable
          prRows={leaderboardRows}
          prOnRowClick={(rowId) => handleRowClick(rowId)}
          prEmptyPlaceholder={listPlaceholder}
          prMetricLabel={METRIC_OPTIONS[selectedMetric] ?? 'Score'}
        />
      )}
    </STR_ApplicationPage>
  );
}
