import {useMemo, useState} from 'react';
import {
  Checkbox,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type {LongTermPlanRowView, ProductLineCapability, ProductionLine} from '../types';
import {DataTable, StatusPill} from '../../ui/PlanningComponents';
import {planningTokens} from '../../ui/planningTheme';

type LongTermPlanningGridProps = {
  rows: LongTermPlanRowView[];
  selectedRowIds: string[];
  editable: boolean;
  productionLines: ProductionLine[];
  capabilities: ProductLineCapability[];
  onToggleRow: (planLineId: string, checked: boolean) => void;
  onEditRow: (planLineId: string, field: 'committedQuantity' | 'assignedLineId' | 'plannerComment', value: string) => void;
};

const rowsPerPageOptions = [10, 20, 50];

export default function LongTermPlanningGrid({
  rows,
  selectedRowIds,
  editable,
  productionLines,
  capabilities,
  onToggleRow,
  onEditRow,
}: LongTermPlanningGridProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const selectedSet = useMemo(() => new Set(selectedRowIds), [selectedRowIds]);

  const capabilitiesByProduct = useMemo(() => {
    const map = new Map<string, ProductLineCapability[]>();
    for (const item of capabilities) {
      if (!item.active) continue;
      const list = map.get(item.productCode) ?? [];
      list.push(item);
      map.set(item.productCode, list);
    }
    return map;
  }, [capabilities]);

  const lineById = useMemo(
    () => new Map(productionLines.map((l) => [l.id, l])),
    [productionLines],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(
    () => rows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [rows, rowsPerPage, safePage],
  );

  const pageButtons = Array.from({length: totalPages}, (_, index) => index + 1).slice(0, 5);

  return (
    <DataTable
      title="Planning Grid"
      description="Detailed planning rows with editable commitments and line assignments."
      footer={(
        <TableRowFooter
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={safePage}
          pageButtons={pageButtons}
          totalPages={totalPages}
          onChangeRowsPerPage={(value) => {
            setRowsPerPage(value);
            setPage(1);
          }}
          onChangePage={setPage}
        />
      )}
    >
      <Table stickyHeader size="small" aria-label="Demand Forecast grid" sx={{minWidth: 1120}}>
        <TableHead>
          <TableRow>
            {['', 'Product code', 'Description', 'Family', 'Month', 'Requested', 'Committed', 'Assigned line', 'Required hrs', 'Available hrs', 'Utilization %', 'Uncovered', 'Status'].map((header) => (
              <TableCell
                key={header}
                sx={{
                  fontWeight: 900,
                  bgcolor: '#F8FAFF',
                  color: planningTokens.textPrimary,
                  whiteSpace: 'nowrap',
                  borderBottom: `1px solid ${planningTokens.border}`,
                  py: 1.2,
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedRows.map((row) => {
            const caps = capabilitiesByProduct.get(row.productCode) ?? [];
            const eligibleLines = caps
              .map((cap) => lineById.get(cap.lineId))
              .filter((line): line is ProductionLine => Boolean(line));

            return (
              <TableRow
                key={row.id}
                hover
                selected={row.pendingChanges}
                sx={{
                  '& td': {borderBottom: `1px solid ${planningTokens.border}`, py: 0.95},
                  '&:last-child td': {borderBottom: 0},
                  bgcolor: row.pendingChanges ? '#F5F8FF' : undefined,
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    inputProps={{'aria-label': `Select ${row.productCode} ${row.month}`}}
                    checked={selectedSet.has(row.id)}
                    onChange={(event) => onToggleRow(row.id, event.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>
                  <Typography sx={{fontSize: 13, fontWeight: 900, color: planningTokens.primaryBlue}}>
                    {row.productCode}
                  </Typography>
                </TableCell>
                <TableCell sx={{minWidth: 170}}>
                  <Typography sx={{fontSize: 13, color: planningTokens.textPrimary}}>{row.productDescription}</Typography>
                </TableCell>
                <TableCell sx={{fontSize: 13, color: planningTokens.textSecondary}}>{row.productFamily}</TableCell>
                <TableCell sx={{whiteSpace: 'nowrap', fontSize: 13}}>{row.month}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.requestedQuantity.toLocaleString()}</TableCell>
                <TableCell sx={{minWidth: 120}}>
                  <TextField
                    type="number"
                    size="small"
                    value={typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity}
                    onChange={(event) => onEditRow(row.id, 'committedQuantity', event.target.value)}
                    fullWidth
                    disabled={!editable}
                    inputProps={{min: 0, 'aria-label': `Committed quantity for ${row.productCode} ${row.month}`}}
                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2.5, backgroundColor: '#FFFFFF'}}}
                  />
                </TableCell>
                <TableCell sx={{minWidth: 126}}>
                  <TextField
                    select
                    size="small"
                    value={row.assignedLineId ?? ''}
                    onChange={(event) => onEditRow(row.id, 'assignedLineId', event.target.value)}
                    fullWidth
                    disabled={!editable}
                    inputProps={{'aria-label': `Assigned line for ${row.productCode} ${row.month}`}}
                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2.5, backgroundColor: '#FFFFFF'}}}
                  >
                    {eligibleLines.map((line) => <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>)}
                  </TextField>
                </TableCell>
                <TableCell sx={{fontSize: 13}}>{row.requiredHours}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.availableHours}</TableCell>
                <TableCell sx={{fontSize: 13, whiteSpace: 'nowrap'}}>
                  {row.utilizationPercent}%
                </TableCell>
                <TableCell sx={{fontSize: 13}}>{row.uncoveredQuantity.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusPill label={row.status} tone={row.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DataTable>
  );
}

function TableRowFooter({
  count,
  rowsPerPage,
  page,
  pageButtons,
  totalPages,
  onChangeRowsPerPage,
  onChangePage,
}: {
  count: number;
  rowsPerPage: number;
  page: number;
  pageButtons: number[];
  totalPages: number;
  onChangeRowsPerPage: (value: number) => void;
  onChangePage: (value: number) => void;
}) {
  const start = count === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(count, page * rowsPerPage);

  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '0 6px'}}>
      <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary}}>
        Showing {start} to {end} of {count} results
      </Typography>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'}}>
        <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary}}>Rows per page</Typography>
        <TextField
          select
          size="small"
          value={rowsPerPage}
          onChange={(event) => onChangeRowsPerPage(Number(event.target.value))}
          sx={{width: 84, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 2.5}}}
        >
          {rowsPerPageOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
        <PageButton label="First" active={false} disabled={page === 1} onClick={() => onChangePage(1)} />
        <PageButton label="<" active={false} disabled={page === 1} onClick={() => onChangePage(Math.max(1, page - 1))} />
        {pageButtons.map((pageNumber) => (
          <PageButton key={pageNumber} label={String(pageNumber)} active={pageNumber === page} onClick={() => onChangePage(pageNumber)} />
        ))}
        <PageButton label=">" active={false} disabled={page === totalPages} onClick={() => onChangePage(Math.min(totalPages, page + 1))} />
        <PageButton label="Last" active={false} disabled={page === totalPages} onClick={() => onChangePage(totalPages)} />
      </div>
    </div>
  );
}

function PageButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: label.length > 1 ? 54 : 34,
        height: 34,
        borderRadius: 10,
        border: `1px solid ${active ? '#A5BFFF' : planningTokens.border}`,
        background: active ? '#EEF2FF' : '#FFFFFF',
        color: active ? planningTokens.primaryBlue : planningTokens.textPrimary,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}
