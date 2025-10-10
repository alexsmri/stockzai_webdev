import { useMemo, type ReactNode } from 'react';
import DCOM_ListView from './dumb/DCOM_ListView';
import type { ITF_ListViewColumnConfig } from '../types/interfaces';
import type { TYP_ListViewRow } from '../types/types';

interface PI_SearchTable {
  prRows: Array<[string, TYP_ListViewRow]>;
  prRedactedSymbols?: string[] | null;
  prOnRowClick?: (rowId: string, row: TYP_ListViewRow) => void;
  prEmptyPlaceholder?: ReactNode;
}

const SEARCH_TABLE_COLUMNS: ITF_ListViewColumnConfig[] = [
  {
    id: 'symbol',
    title: 'Symbol',
    valueGetter: (_, rowId) => rowId,
    defaultSorting: 'a',
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
    id: 'financial_score',
    title: 'Financial Score',
    key: 'financial_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
  },
  {
    id: 'valuation_score',
    title: 'Valuation Score',
    key: 'valuation_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
  },
];

const PAYWALL_COLUMNS = ['sectorRanking', 'financial_score', 'valuation_score'];

export default function COM_SearchTable({
  prRows,
  prRedactedSymbols = null,
  prOnRowClick,
  prEmptyPlaceholder = null,
}: PI_SearchTable) {
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
      prColumnConfig={SEARCH_TABLE_COLUMNS}
      prOnRowClick={prOnRowClick}
      prEmptyPlaceholder={prEmptyPlaceholder}
      prPaywallConfig={paywallConfig}
    />
  );
}
