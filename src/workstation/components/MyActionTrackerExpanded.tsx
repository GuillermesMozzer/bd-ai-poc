import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useMemo, useState} from 'react';
import {Box, Button, Checkbox, IconButton, Menu, MenuItem, Paper, Typography} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  OpenInFull as OpenInFullIcon,
  Search as SearchIcon,
  SettingsOutlined as SettingsIcon,
  StarBorder as StarBorderIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import {
  ActionTrackerKanbanBoard,
  ActionTrackerTable,
  actionTrackerKanbanColumns,
  actionTrackerKanbanFieldOptions,
  actionTrackerTableColumns,
  categoryFilterOrder,
  CategoryFilterDot,
  type ActionTrackerKanbanField,
  type ActionTrackerTableColumnId,
  type ActionTrackerViewMode,
} from './MyActionTrackerWidget';
import {type ActionCategory, type ActionTrackerItem, useActionTrackerItems} from './actionTrackerStore';

type MyActionTrackerExpandedProps = {
  initialViewMode?: ActionTrackerViewMode;
  onBack: () => void;
};

function parseDueDateLabel(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

export default function MyActionTrackerExpanded({initialViewMode = 'table', onBack}: MyActionTrackerExpandedProps) {
  const [viewMode, setViewMode] = useState<ActionTrackerViewMode>(initialViewMode);
  const [visibleKanbanColumns, setVisibleKanbanColumns] = useState<string[]>(actionTrackerKanbanColumns.map((column) => column.id));
  const [visibleKanbanFields, setVisibleKanbanFields] = useState<ActionTrackerKanbanField[]>(['problem', 'date', 'owner', 'priority']);
  const [visibleTableColumns, setVisibleTableColumns] = useState<ActionTrackerTableColumnId[]>(actionTrackerTableColumns.map((column) => column.id));
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [activeCategories, setActiveCategories] = useState<ActionCategory[]>(categoryFilterOrder);
  const {setIsActionCreateDrawerOpen, setSelectedActionTrackerItem} = useActionTrackerContext();
  const {items} = useActionTrackerItems();

  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  const summaryCards = useMemo(() => {
    const now = new Date('2026-05-06T00:00:00');
    const overdueCount = items.filter((item) => {
      const dueTimestamp = parseDueDateLabel(item.dueDate);
      return dueTimestamp !== null && dueTimestamp < now.getTime() && item.status !== 'Completed' && item.status !== 'Canceled';
    }).length;

    return [
      {value: items.length, label: 'All action items', accent: tokenBrand.lighter, bg: tokenNeutral.lightest},
      {value: items.filter((item) => item.assignedTo === 'John Smith').length, label: 'Assigned To Me', accent: tokenBrand.lighter, bg: tokenNeutral.lightest},
      {value: items.filter((item) => item.createdBy === 'John Smith' || item.reviewer === 'John Smith' || item.approver === 'John Smith').length, label: 'Related To Me', accent: tokenBrand.lighter, bg: tokenNeutral.lightest},
      {value: items.filter((item) => item.status === 'Under Approval').length, label: 'Pending Approvals', accent: tokenError.lighter, bg: tokenNeutral.lighter},
      {value: overdueCount, label: 'Overdue', accent: tokenError.main, bg: tokenNeutral.lighter},
    ];
  }, [items]);

  const toggleCategory = (category: ActionCategory) => {
    setActiveCategories((current) => {
      if (current.includes(category)) {
        if (current.length === 1) {
          return categoryFilterOrder;
        }
        return current.filter((item) => item !== category);
      }

      return [...current, category].sort((a, b) => categoryFilterOrder.indexOf(a) - categoryFilterOrder.indexOf(b));
    });
  };

  const toggleTableColumn = (columnId: ActionTrackerTableColumnId) => {
    setVisibleTableColumns((current) => {
      if (current.includes(columnId)) {
        return current.length === 1 ? current : current.filter((id) => id !== columnId);
      }

      return actionTrackerTableColumns
        .map((column) => column.id)
        .filter((id) => id === columnId || current.includes(id));
    });
  };

  const toggleKanbanColumn = (columnId: string) => {
    setVisibleKanbanColumns((current) => {
      if (current.includes(columnId)) {
        return current.length === 1 ? current : current.filter((id) => id !== columnId);
      }

      return actionTrackerKanbanColumns
        .map((column) => column.id)
        .filter((id) => id === columnId || current.includes(id));
    });
  };

  const toggleKanbanField = (fieldId: ActionTrackerKanbanField) => {
    setVisibleKanbanFields((current) => {
      if (current.includes(fieldId)) {
        return current.length === 1 ? current : current.filter((id) => id !== fieldId);
      }

      return actionTrackerKanbanFieldOptions
        .map((field) => field.id)
        .filter((id) => id === fieldId || current.includes(id));
    });
  };

  return (
    <Box sx={{height: 'calc(100vh - 176px)', minHeight: 620, display: 'flex', flexDirection: 'column', bgcolor: tokenCommon.white, border: `1px solid ${tokenNeutral.main}`, borderRadius: 3, overflow: 'hidden', boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)'}}>
      <Box sx={{minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.6, py: 0.75, borderBottom: `1px solid ${tokenNeutral.main}`, gap: 1.2, flexWrap: 'wrap'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.9}}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{fontSize: 19}} />}
            sx={{minWidth: 0, px: 0.2, color: tokenBrand.main, fontWeight: 900, fontSize: 16, textTransform: 'none'}}
          >
            Action Tracker
          </Button>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, color: tokenBrand.main, flexWrap: 'wrap'}}>
          <Button
            variant="text"
            startIcon={<AddIcon sx={{fontSize: 16}} />}
            onClick={() => setIsActionCreateDrawerOpen(true)}
            sx={{height: 30, px: 0.6, color: tokenBrand.main, fontSize: 12, fontWeight: 900, textTransform: 'none'}}
          >
            Add Action
          </Button>
          <IconButton size="small" sx={{width: 30, height: 30, color: tokenBrand.main, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <AutoAwesomeIcon sx={{fontSize: 18}} />
          </IconButton>
          <IconButton size="small" sx={{width: 30, height: 30, color: tokenBrand.main, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <StarBorderIcon sx={{fontSize: 17}} />
          </IconButton>
          <IconButton size="small" sx={{width: 30, height: 30, color: tokenBrand.main, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <OpenInFullIcon sx={{fontSize: 17}} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25, minHeight: 0, flex: 1, overflow: 'hidden'}}>
        <Paper elevation={0} sx={{border: `1px solid ${tokenBrand.lightest}`, bgcolor: tokenNeutral.lighter, borderRadius: 2, px: 1.5, py: 1.3}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.55, gap: 1}}>
            <Typography sx={{fontSize: 14, color: tokenBrand.main, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.4}}>
              <AutoAwesomeIcon sx={{fontSize: 16, color: tokenWarning.dark}} />
              BLU.AI analysis
            </Typography>
            <Button variant="text" sx={{minWidth: 0, px: 0, color: tokenBrand.main, fontSize: 11, fontWeight: 850, textTransform: 'none'}}>More insights</Button>
          </Box>
          <Typography sx={{fontSize: 12, color: tokenInfo.darkest, lineHeight: 1.45}}>
            {items.filter((item) => item.priority === 'High' && item.status !== 'Completed' && item.status !== 'Canceled').length} action items with High priority. High priority items are associated with short deadlines and should be addressed promptly to avoid delays.
          </Typography>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1.1}}>
          {summaryCards.map((card) => (
            <Paper key={card.label} elevation={0} sx={{p: 1.05, borderRadius: 1.7, borderLeft: `4px solid ${card.accent}`, bgcolor: card.bg}}>
              <Typography sx={{fontSize: 24, lineHeight: 1, color: card.accent === tokenError.main ? tokenError.main : workstationVisuals.tierTextHeading, fontWeight: 800}}>
                {card.value}
              </Typography>
              <Typography sx={{fontSize: 11, color: card.accent === tokenError.main ? tokenError.main : workstationVisuals.tierTextLabel}}>{card.label}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.55,
              px: 0.55,
              py: 0.45,
              borderRadius: 999,
              border: `1px solid ${tokenNeutral.main}`,
              bgcolor: tokenCommon.white,
            }}
          >
            {categoryFilterOrder.map((category) => (
              <CategoryFilterDot
                key={category}
                active={activeCategories.includes(category)}
                category={category}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1}}>
            <Button variant="outlined" startIcon={<FilterIcon sx={{fontSize: 15}} />} sx={{height: 32, borderRadius: 1.2, color: tokenBrand.main, borderColor: tokenInfo.lightest, fontSize: 11, fontWeight: 900, textTransform: 'none'}}>
              Filters
            </Button>
            <Box sx={{width: 360, height: 32, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.1, color: workstationVisuals.textMuted, fontSize: 12, bgcolor: tokenCommon.white}}>
              Search action items
              <SearchIcon sx={{fontSize: 18, color: tokenBrand.main}} />
            </Box>
            <Box sx={{display: 'flex', gap: 0.55}}>
              <IconButton onClick={() => setViewMode('board')} size="small" sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: viewMode === 'board' ? tokenNeutral.lighter : tokenCommon.white, color: viewMode === 'board' ? tokenBrand.main : workstationVisuals.textSecondary, width: 32, height: 32}}><GridViewIcon sx={{fontSize: 17}} /></IconButton>
              <IconButton onClick={() => setViewMode('table')} size="small" sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: viewMode === 'table' ? tokenNeutral.lighter : tokenCommon.white, color: viewMode === 'table' ? tokenBrand.main : workstationVisuals.textSecondary, width: 32, height: 32}}><TableRowsIcon sx={{fontSize: 17}} /></IconButton>
            </Box>
            <IconButton size="small" onClick={(event) => setSettingsAnchor(event.currentTarget)} sx={{width: 32, height: 32, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, color: workstationVisuals.textSecondary, bgcolor: tokenCommon.white}}>
              <SettingsIcon sx={{fontSize: 17}} />
            </IconButton>
            <Menu anchorEl={settingsAnchor} open={Boolean(settingsAnchor)} onClose={() => setSettingsAnchor(null)}>
              <Typography sx={{px: 2, pt: 1, pb: 0.4, fontSize: 11, fontWeight: 900, color: workstationVisuals.textSecondary, textTransform: 'uppercase'}}>Table Columns</Typography>
              {actionTrackerTableColumns.map((column) => (
                <MenuItem
                  key={column.id}
                  onClick={() => toggleTableColumn(column.id)}
                  dense
                >
                  <Checkbox checked={visibleTableColumns.includes(column.id)} size="small" />
                  {column.label}
                </MenuItem>
              ))}
              <Box sx={{height: 1, bgcolor: tokenNeutral.main, my: 0.5}} />
              <Typography sx={{px: 2, pt: 1, pb: 0.4, fontSize: 11, fontWeight: 900, color: workstationVisuals.textSecondary, textTransform: 'uppercase'}}>Kanban Columns</Typography>
              {actionTrackerKanbanColumns.map((column) => (
                <MenuItem
                  key={column.id}
                  onClick={() => toggleKanbanColumn(column.id)}
                  dense
                >
                  <Checkbox checked={visibleKanbanColumns.includes(column.id)} size="small" />
                  {column.label}
                </MenuItem>
              ))}
              <Box sx={{height: 1, bgcolor: tokenNeutral.main, my: 0.5}} />
              <Typography sx={{px: 2, pt: 1, pb: 0.4, fontSize: 11, fontWeight: 900, color: workstationVisuals.textSecondary, textTransform: 'uppercase'}}>Card Fields</Typography>
              {actionTrackerKanbanFieldOptions.map((field) => (
                <MenuItem
                  key={field.id}
                  onClick={() => toggleKanbanField(field.id)}
                  dense
                >
                  <Checkbox checked={visibleKanbanFields.includes(field.id)} size="small" />
                  {field.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        <Box sx={{minHeight: 0, flex: 1, overflow: 'hidden'}}>
          {viewMode === 'board' ? (
            <ActionTrackerKanbanBoard
              activeCategories={activeCategories}
              rows={items}
              visibleColumnIds={visibleKanbanColumns}
              visibleFields={visibleKanbanFields}
              onRowClick={setSelectedActionTrackerItem}
            />
          ) : (
            <ActionTrackerTable activeCategories={activeCategories} rows={items} visibleColumnIds={visibleTableColumns} onRowClick={setSelectedActionTrackerItem} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
