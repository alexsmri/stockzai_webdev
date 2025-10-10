import { useMemo, type ReactNode } from 'react';
import DCOM_ListView from './dumb/DCOM_ListView';
import type { ITF_ListViewColumnConfig } from '../types/interfaces';
import type { TYP_ListViewRow } from '../types/types';

interface PI_LeaderboardTable {
  prRows: Array<[string, TYP_ListViewRow]>;
  prMetricLabel: string;
  prOnRowClick?: (rowId: string, row: TYP_ListViewRow) => void;
  prEmptyPlaceholder?: ReactNode;
  prRedactedSymbols?: string[] | null;
}

const BASE_COLUMNS: ITF_ListViewColumnConfig[] = [
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
];

const PAYWALL_COLUMNS = ['sectorRanking', 'score', 'financial_score', 'valuation_score', 'total_score'];

export default function COM_LeaderboardTable({
  prRows,
  prMetricLabel,
  prOnRowClick,
  prEmptyPlaceholder = null,
  prRedactedSymbols = null,
}: PI_LeaderboardTable) {
  const columnConfig = useMemo<ITF_ListViewColumnConfig[]>(() => {
    return [
      ...BASE_COLUMNS,
      {
        id: 'score',
        title: prMetricLabel,
        key: 'score',
        defaultSorting: 'd',
        isNumeric: true,
        fallback: '-',
        cellClassName: 'look-text-x1 look-priority-high',
      },
    ];
  }, [prMetricLabel]);

  const paywallConfig = useMemo(
    () => ({
      columns: PAYWALL_COLUMNS,
      rows: prRedactedSymbols ?? undefined,
    }),
    [prRedactedSymbols]
  );

  return (
    <DCOM_ListView
      prRows={prRows}
      prColumnConfig={columnConfig}
      prOnRowClick={prOnRowClick}
      prEmptyPlaceholder={prEmptyPlaceholder}
      prPaywallConfig={paywallConfig}
    />
  );
}
