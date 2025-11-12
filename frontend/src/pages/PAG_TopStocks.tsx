import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_DropdownSelect, { type TYP_DropdownConfig } from '../components/COM_DropdownSelect';
import COM_MenuSelect, { type MenuSelectOptions } from '../components/COM_MenuSelect';
import COM_LeaderboardTable from '../components/COM_LeaderboardTable';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { TYP_ListViewRow } from '../types/types';
import COM_Loading from '../components/COM_Loading';
import { queryMatches } from '../utils/functions';
import { RISK_TOLERANCE_OPTIONS } from '../constants';

const METRIC_OPTIONS: MenuSelectOptions = {
  valuation_score: 'Valuation Score',
  financial_score: 'Financial Score',
  total_score: 'Total Score',
};

type LeaderboardMetric = keyof typeof METRIC_OPTIONS;
const DEFAULT_RISK_TOLERANCE = 'risk_balanced';
const QUERY_PARAM_SECTOR = 'sector';
const QUERY_PARAM_METRIC = 'metric';
const QUERY_PARAM_RISK = 'risk';

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
  riskTolerance?: string;
  riskFilters?: Array<{ key?: string; label?: string }>;
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

function isLeaderboardMetric(value: string | null): value is LeaderboardMetric {
  return Boolean(value && value in METRIC_OPTIONS);
}

export default function PAG_TopStocks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const latestSearchParamsRef = useRef(searchParams);
  const store = useCompaniesStore();

  const [selectedSector, setSelectedSector] = useState<string>(
    () => searchParams.get(QUERY_PARAM_SECTOR) ?? ''
  );
  const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>(() => {
    const metricParam = searchParams.get(QUERY_PARAM_METRIC);
    return isLeaderboardMetric(metricParam) ? metricParam : 'valuation_score';
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectorValues, setSectorValues] = useState<string[] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPayload | null>(() => {
    const existing = store.read('PropertyCompanyLeaderboard');
    return isLeaderboardPayload(existing) ? existing : null;
  });
  const [selectedRiskTolerance, setSelectedRiskTolerance] = useState<string>(() => {
    const paramValue = searchParams.get(QUERY_PARAM_RISK);
    if (paramValue) {
      return paramValue;
    }
    const existing = store.read('PropertyCompanyLeaderboard');
    if (isLeaderboardPayload(existing) && typeof existing.riskTolerance === 'string') {
      return existing.riskTolerance;
    }
    return DEFAULT_RISK_TOLERANCE;
  });

  useEffect(() => {
    latestSearchParamsRef.current = searchParams;
  }, [searchParams]);

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
    setSelectedSector((prev) => {
      if (prev && sectorValues.includes(prev)) {
        return prev;
      }
      const paramValue = searchParams.get(QUERY_PARAM_SECTOR);
      if (paramValue && sectorValues.includes(paramValue)) {
        return paramValue;
      }
      return sectorValues[0];
    });
  }, [searchParams, sectorValues]);

  useCompaniesStoreSync<LeaderboardPayload | boolean>(
    store,
    'PropertyCompanyLeaderboard',
    (payload) => {
      if (isLeaderboardPayload(payload)) {
        setLeaderboardData(payload);
        if (typeof payload.riskTolerance === 'string') {
          setSelectedRiskTolerance((prev) =>
            prev === payload.riskTolerance ? prev : (payload.riskTolerance as string)
          );
        }
        return;
      }
      setLeaderboardData(null);
    }
  );

  const riskDropdownConfig = useMemo<TYP_DropdownConfig>(() => {
    const config: TYP_DropdownConfig = {};
    Object.entries(RISK_TOLERANCE_OPTIONS).forEach(([key, option]) => {
      config[key] = { label: option.label };
    });
    if (leaderboardData?.riskFilters && Array.isArray(leaderboardData.riskFilters)) {
      leaderboardData.riskFilters.forEach((filter) => {
        if (!filter || typeof filter !== 'object') {
          return;
        }
        const key = typeof filter.key === 'string' ? filter.key : null;
        if (!key) {
          return;
        }
        const label =
          typeof filter.label === 'string'
            ? filter.label
            : config[key]?.label || (filter.key as string);
        config[key] = { label };
      });
    }
    return config;
  }, [leaderboardData?.riskFilters]);

  useEffect(() => {
    const available = Object.keys(riskDropdownConfig);
    if (!available.length) {
      return;
    }
    setSelectedRiskTolerance((prev) => {
      if (prev && available.includes(prev)) {
        return prev;
      }
      if (available.includes(DEFAULT_RISK_TOLERANCE)) {
        return DEFAULT_RISK_TOLERANCE;
      }
      return available[0];
    });
  }, [riskDropdownConfig]);

  useEffect(() => {
    if (!selectedSector || !selectedMetric || !selectedRiskTolerance) {
      return;
    }
    setLoadError(null);
    void store
      .get('PropertyCompanyLeaderboard', [], {
        sector: selectedSector,
        metric: selectedMetric,
        riskTolerance: selectedRiskTolerance,
      })
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
  }, [selectedSector, selectedMetric, selectedRiskTolerance, store]);

  useLayoutEffect(() => {
    const sectorParam = searchParams.get(QUERY_PARAM_SECTOR);
    if (sectorParam) {
      setSelectedSector((prev) => (prev === sectorParam ? prev : sectorParam));
    }
    const metricParam = searchParams.get(QUERY_PARAM_METRIC);
    if (isLeaderboardMetric(metricParam)) {
      setSelectedMetric((prev) => (prev === metricParam ? prev : metricParam));
    }
    const riskParam = searchParams.get(QUERY_PARAM_RISK);
    if (riskParam) {
      setSelectedRiskTolerance((prev) => (prev === riskParam ? prev : riskParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(latestSearchParamsRef.current);
    const currentEntries: [string, string | null][] = [
      [QUERY_PARAM_SECTOR, selectedSector || null],
      [QUERY_PARAM_METRIC, selectedMetric || null],
      [QUERY_PARAM_RISK, selectedRiskTolerance || null],
    ];
    let changed = false;
    currentEntries.forEach(([key, value]) => {
      const existing = next.get(key);
      if (value === null || value === '') {
        if (existing !== null) {
          next.delete(key);
          changed = true;
        }
        return;
      }
      if (existing !== value) {
        next.set(key, value);
        changed = true;
      }
    });
    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [selectedMetric, selectedRiskTolerance, selectedSector, setSearchParams]);

  const dropdownConfig = useMemo<TYP_DropdownConfig>(() => {
    const config: TYP_DropdownConfig = {};
    (sectorValues || []).forEach((sector) => {
      config[sector] = { label: sector };
    });
    return config;
  }, [sectorValues]);

  const hasMatchingLeaderboard =
    Boolean(selectedSector && selectedMetric && selectedRiskTolerance) &&
    queryMatches('PropertyCompanyLeaderboard', leaderboardData, {
      sector: selectedSector,
      metric: selectedMetric,
      riskTolerance: selectedRiskTolerance,
    });

  const leaderboardRows = useMemo<Array<[string, TYP_ListViewRow]>>(() => {
    if (!hasMatchingLeaderboard || !leaderboardData) {
      return [];
    }

    const intel = leaderboardData.intel ?? {};

    const leaderboardList = Array.isArray(leaderboardData?.leaderboard)
      ? leaderboardData.leaderboard
      : [];

    return leaderboardList.map((entry, index) => {
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
    if (selectedSector && selectedRiskTolerance && !hasMatchingLeaderboard) {
      return (
        <div className="area-flex-row mod-justify-center mod-padding-xl">
          <COM_Loading />
        </div>
      );
    }
    return null;
  }, [hasMatchingLeaderboard, loadError, selectedRiskTolerance, selectedSector]);

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

  const handleRiskChange = (key: string) => {
    if (!key || key === selectedRiskTolerance) {
      return;
    }
    setSelectedRiskTolerance(key);
  };

  const handleRowClick = (symbol: string) => {
    if (!symbol) {
      return;
    }
    navigate(`/companies/page/${symbol}`);
  };

  return (
    <STR_ApplicationPage>
      <div className="area-flex-wrap mod-space-between mod-w-full" style={{ alignItems: 'center' }}>
        <div className="area-flex-row mod-gap" style={{ alignItems: 'center' }}>
          <COM_DropdownSelect
            prDropdownConfig={dropdownConfig}
            prSelectedKey={selectedSector}
            handleSelect={handleSectorChange}
            prPlaceholder="Select sector"
          />
          <COM_DropdownSelect
            prDropdownConfig={riskDropdownConfig}
            prSelectedKey={selectedRiskTolerance}
            handleSelect={handleRiskChange}
            prPlaceholder="Select risk tolerance"
          />
        </div>
        <COM_MenuSelect
          prOptions={METRIC_OPTIONS}
          prHandleChange={handleMetricChange}
          prSelectedKey={selectedMetric}
        />
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
