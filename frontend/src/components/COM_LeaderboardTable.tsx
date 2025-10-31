import { useMemo, type ReactNode } from 'react';
import DCOM_ListView from './dumb/DCOM_ListView';
import type { ITF_ListViewColumnConfig } from '../types/interfaces';
import type { TYP_ListViewRow } from '../types/types';
import ICON_Star from '../assets/media/ICON_Star.svg?react';
import ICON_Ranking from '../assets/media/ICON_Ranking.svg?react';
import ICON_Work from '../assets/media/ICON_Work.svg?react';
import ICON_Company from '../assets/media/ICON_Company.svg?react';
import ICON_Stocks from '../assets/media/ICON_Stocks.svg?react';
import { PAYWALL_ENABLED } from '../constants';

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
    icon: ICON_Star,
  },
  {
    id: 'symbol',
    title: 'Symbol',
    key: 'symbol',
    defaultSorting: 'a',
    fallback: '-',
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
];

const PAYWALL_COLUMNS = [
  'sectorRanking',
  'score',
  'financial_score',
  'valuation_score',
  'total_score',
];

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
        icon: ICON_Ranking,
      },
    ];
  }, [prMetricLabel]);

  const paywallConfig = useMemo(
    () =>
      PAYWALL_ENABLED
        ? {
            columns: PAYWALL_COLUMNS,
            rows: prRedactedSymbols ?? undefined,
          }
        : null,
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
