import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ITF_ListViewColumnConfig } from '../../types/interfaces';
import type { TYP_ListViewRow, TYP_SortState } from '../../types/types';
import {
  formatNumeric,
  formatText,
  toNumeric,
  toComparableString,
  getDefaultOrderDirection,
  getOppositeOrderDirection,
} from '../../utils/formats';
import ICON_FirstPlace from '@/assets/media/ICON_FirstPlace.svg?react';
import ICON_Triangle from '@/assets/media/ICON_Triangle.svg?react';
import COM_PaywallSearchResult from '../COM_PaywallSearchResult';

export interface ITF_PaywallConfig {
  columns?: string[];
  rows?: string[];
}

export interface PI_DCOM_ListView {
  prRows: Array<[string, TYP_ListViewRow]>;
  prColumnConfig: ITF_ListViewColumnConfig[];
  prOnRowClick?: (rowId: string, row: TYP_ListViewRow) => void;
  prEmptyPlaceholder?: ReactNode;
  prPaywallConfig?: ITF_PaywallConfig | null;
}

const DEFAULT_CELL_CLASS = 'look-text-x1 look-priority-low';
const DEFAULT_HEADER_CLASS = 'look-button-ghost mod-button-auth look-text-x0';
const DEFAULT_FALLBACK = '-';

function resolveRawValue(
  column: ITF_ListViewColumnConfig,
  rowId: string,
  row: TYP_ListViewRow
): unknown {
  if (column.valueGetter) {
    return column.valueGetter(row, rowId);
  }
  if (column.key) {
    if (column.key === 'symbol') {
      return row[column.key] ?? rowId;
    }
    return row[column.key];
  }
  return undefined;
}

function resolveDisplay(
  column: ITF_ListViewColumnConfig,
  rowId: string,
  row: TYP_ListViewRow,
  rawValue: unknown
): ReactNode {
  if (column.render) {
    return column.render(rawValue, rowId, row);
  }
  const fallback = column.fallback ?? DEFAULT_FALLBACK;
  return column.isNumeric ? formatNumeric(rawValue, fallback) : formatText(rawValue, fallback);
}

export default function DCOM_ListView({
  prRows,
  prColumnConfig,
  prOnRowClick,
  prEmptyPlaceholder = null,
  prPaywallConfig = null,
}: PI_DCOM_ListView) {
  const [stSort, setStSort] = useState<TYP_SortState>({ columnId: null, direction: null });

  const memColumnsById = useMemo(() => {
    const lookup = new Map<string, ITF_ListViewColumnConfig>();
    prColumnConfig.forEach((column) => {
      lookup.set(column.id, column);
    });
    return lookup;
  }, [prColumnConfig]);

  const memPreparedRows = useMemo(() => {
    return prRows.map(([rowId, rowData]) => ({ rowId, rowData }));
  }, [prRows]);

  const memPaywallColumns = useMemo(() => {
    if (!prPaywallConfig?.columns?.length) {
      return null;
    }
    const normalized = prPaywallConfig.columns.reduce<Set<string>>((set, columnId) => {
      if (typeof columnId === 'string' && columnId.trim().length > 0) {
        set.add(columnId.trim());
      }
      return set;
    }, new Set<string>());
    return normalized.size ? normalized : null;
  }, [prPaywallConfig?.columns]);

  const memPaywalledRows = useMemo(() => {
    if (!prPaywallConfig?.rows?.length) {
      return null;
    }
    const normalized = prPaywallConfig.rows.reduce<Set<string>>((set, symbol) => {
      if (typeof symbol === 'string') {
        const trimmed = symbol.trim();
        if (trimmed) {
          set.add(trimmed.toUpperCase());
        }
      }
      return set;
    }, new Set<string>());
    return normalized.size ? normalized : null;
  }, [prPaywallConfig?.rows]);

  const memSortedRows = useMemo(() => {
    if (!stSort.columnId || !stSort.direction) {
      return memPreparedRows;
    }

    const column = memColumnsById.get(stSort.columnId);
    if (!column) {
      return memPreparedRows;
    }

    const direction = stSort.direction;
    const isNumeric = column.isNumeric ?? false;

    return [...memPreparedRows].sort((a, b) => {
      const rawA = resolveRawValue(column, a.rowId, a.rowData);
      const rawB = resolveRawValue(column, b.rowId, b.rowData);

      if (isNumeric) {
        const numberA = toNumeric(rawA);
        const numberB = toNumeric(rawB);

        const hasA = Number.isFinite(numberA);
        const hasB = Number.isFinite(numberB);

        if (!hasA && !hasB) {
          return 0;
        }
        if (!hasA) {
          return 1;
        }
        if (!hasB) {
          return -1;
        }

        return direction === 'desc' ? numberB - numberA : numberA - numberB;
      }

      const textA = toComparableString(rawA);
      const textB = toComparableString(rawB);

      return direction === 'desc' ? textB.localeCompare(textA) : textA.localeCompare(textB);
    });
  }, [memPreparedRows, stSort, memColumnsById]);

  const handleSort = (column: ITF_ListViewColumnConfig) => {
    const defaultDirection = getDefaultOrderDirection(column);
    const oppositeDirection = getOppositeOrderDirection(defaultDirection);

    setStSort((prev) => {
      if (prev.columnId !== column.id) {
        return { columnId: column.id, direction: defaultDirection };
      }

      if (prev.direction === defaultDirection) {
        return { columnId: column.id, direction: oppositeDirection };
      }

      if (prev.direction === oppositeDirection) {
        return { columnId: null, direction: null };
      }

      return { columnId: column.id, direction: defaultDirection };
    });
  };

  if (!memPreparedRows.length) {
    return prEmptyPlaceholder ?? null;
  }

  return (
    <>
      <div
        className="area-flex-col mod-align-stretch"
        style={{ minWidth: 'calc(var(--default-font-size) * 48)' }}
      >
        <div className="area-grid-results mod-padding-side">
          {prColumnConfig.map((column) => {
            const Icon = column.icon ?? ICON_FirstPlace;
            const isActive = stSort.columnId === column.id && stSort.direction !== null;
            const sortDirection = isActive ? stSort.direction : null;

            return (
              <button
                type="button"
                key={column.id}
                className={`${column.headerClassName ?? DEFAULT_HEADER_CLASS}`}
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
          {memSortedRows.map(({ rowId, rowData }) => {
            const key = rowId;
            const handleClick = prOnRowClick ? () => prOnRowClick(rowId, rowData) : undefined;
            const symbolValue =
              typeof rowData.symbol === 'string' && rowData.symbol.trim().length > 0
                ? rowData.symbol
                : rowId;
            const normalizedSymbol = symbolValue.trim().toUpperCase();
            const isPaywalled = memPaywalledRows ? memPaywalledRows.has(normalizedSymbol) : false;

            return (
              <div key={key} style={{ position: 'relative' }} className="state-hover-scale">
                <div className="area-grid-results look-div-subtle" onClick={handleClick}>
                  {prColumnConfig.map((column) => {
                    const rawValue = resolveRawValue(column, rowId, rowData);
                    const display = resolveDisplay(column, rowId, rowData, rawValue);
                    const titleValue =
                      typeof display === 'string'
                        ? display
                        : typeof display === 'number'
                        ? String(display)
                        : undefined;
                    const needsBlur = isPaywalled && memPaywallColumns?.has(column.id);
                    const className = `${column.cellClassName ?? DEFAULT_CELL_CLASS}${
                      needsBlur ? ' mod-blur' : ''
                    }`;

                    return (
                      <span key={column.id} className={className} title={titleValue}>
                        {display}
                      </span>
                    );
                  })}
                </div>
                <COM_PaywallSearchResult prIsRedacted={isPaywalled} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
