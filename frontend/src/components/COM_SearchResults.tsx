import { useMemo, type ReactNode } from 'react';
import DCOM_ListView from './dumb/DCOM_ListView';
import type { ITF_ListViewColumnConfig } from '../types/interfaces';
import type { TYP_ListViewRow } from '../types/types';
import ICON_Star from '../assets/media/ICON_Star.svg?react';
import ICON_Diamond from '../assets/media/ICON_Diamond.svg?react';
import ICON_Cash from '../assets/media/ICON_Cash.svg?react';
import ICON_Work from '../assets/media/ICON_Work.svg?react';
import ICON_Company from '../assets/media/ICON_Company.svg?react';
import ICON_Stocks from '../assets/media/ICON_Stocks.svg?react';

interface PI_SearchTable {
  prRows: Array<[string, TYP_ListViewRow]>;
  prRedactedSymbols?: string[] | null;
  prOnRowClick?: (rowId: string, row: TYP_ListViewRow) => void;
  prEmptyPlaceholder?: ReactNode;
  prHasLoadedResults?: boolean;
}

const SEARCH_TABLE_COLUMNS: ITF_ListViewColumnConfig[] = [
  {
    id: 'symbol',
    title: 'Symbol',
    valueGetter: (_, rowId) => rowId,
    defaultSorting: 'a',
    cellClassName: 'look-text-x1 look-priority-high mod-text-wrap-gradient',
    icon: ICON_Stocks,
  },
  {
    id: 'name',
    title: 'Name',
    key: 'name',
    defaultSorting: 'a',
    fallback: 'Unknown Company',
    cellClassName: 'look-text-x1 look-priority-medium mod-text-wrap-gradient',
    icon: ICON_Company,
  },
  {
    id: 'sector',
    title: 'Sector',
    key: 'sector',
    defaultSorting: 'a',
    fallback: 'Unknown Sector',
    cellClassName: 'look-text-x1 look-priority-low mod-text-wrap-gradient',
    icon: ICON_Work,
  },
  {
    id: 'sectorRanking',
    title: 'Sector Rank',
    key: 'sectorRanking',
    defaultSorting: 'a',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
    icon: ICON_Star,
  },
  {
    id: 'financial_score',
    title: 'Financial Score',
    key: 'financial_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
    icon: ICON_Cash,
  },
  {
    id: 'valuation_score',
    title: 'Valuation Score',
    key: 'valuation_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
    icon: ICON_Diamond,
  },
];

const PAYWALL_COLUMNS = ['sectorRanking', 'financial_score', 'valuation_score'];

export default function COM_SearchResults({
  prRows,
  prRedactedSymbols = null,
  prOnRowClick,
  prEmptyPlaceholder,
  prHasLoadedResults = false,
}: PI_SearchTable) {
  const paywallConfig = useMemo(
    () => ({
      columns: PAYWALL_COLUMNS,
      rows: prRedactedSymbols ?? undefined,
    }),
    [prRedactedSymbols]
  );

  const computedEmptyPlaceholder =
    prRows.length > 0 ? null : (
      <span className="look-text-x1 look-priority-low mod-center">
        {prHasLoadedResults
          ? 'No results matching query'
          : 'Nothing to show here, enter your search first'}
      </span>
    );

  const emptyPlaceholder =
    prEmptyPlaceholder !== undefined ? prEmptyPlaceholder : computedEmptyPlaceholder;

  return (
    <DCOM_ListView
      prRows={prRows}
      prColumnConfig={SEARCH_TABLE_COLUMNS}
      prOnRowClick={prOnRowClick}
      prEmptyPlaceholder={emptyPlaceholder}
      prPaywallConfig={paywallConfig}
    />
  );
}
