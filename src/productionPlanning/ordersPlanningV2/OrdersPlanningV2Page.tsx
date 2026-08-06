import {useCallback, useMemo, useState} from 'react';
import {Box, Button, Chip, Paper, Stack, Typography} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  EditNote as EditNoteIcon,
  Refresh as RefreshIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import V2Toolbar from './components/V2Toolbar';
import V2ObjectsPanel from './components/V2ObjectsPanel';
import V2WorkOrdersList from './components/V2WorkOrdersList';
import V2Timeline from './components/V2Timeline';
import OrdersAiAssistantWorkspace from './components/OrdersAiAssistantWorkspace';
import V2ObjectsConfigDrawer from './components/V2ObjectsConfigDrawer';
import type {V2ColumnLine, V2DateRange, V2ObjectCategoryConfig, V2TimelineDropTarget, V2UnplannedWorkOrder} from './types';
import {
  cloneWorkOrders,
  createPlannedWorkOrder,
  isSlotVisible,
  movePlannedWorkOrder,
  parseDragPayload,
} from './scheduleUtils';
import type {MachineWorkOrder} from '../schedulingWorkspaceTimeline/types';
import {
  generateV2TimeSlots,
  v2DefaultDateRange,
  v2Lines as initialLines,
  v2ObjectCategories as initialCategories,
  v2PlannedWorkOrders,
  v2TimelineEvents,
  v2UnplannedWorkOrders,
} from './mock';
import {planningCardSx, planningTokens} from '../ui/planningTheme';

interface OrdersPlanningV2PageProps {
  initialAssistantOpen?: boolean;
}

export default function OrdersPlanningV2Page({ initialAssistantOpen = false }: OrdersPlanningV2PageProps) {
  const [dateRange, setDateRange] = useState<V2DateRange>(v2DefaultDateRange);
  const [lines, setLines] = useState<V2ColumnLine[]>(initialLines);
  const [categories, setCategories] = useState<V2ObjectCategoryConfig[]>(initialCategories);
  const [assistantWorkspaceOpen, setAssistantWorkspaceOpen] = useState(initialAssistantOpen);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [timelineTransposed, setTimelineTransposed] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [plannedWorkOrders, setPlannedWorkOrders] = useState<MachineWorkOrder[]>(() => cloneWorkOrders(v2PlannedWorkOrders));
  const [unplannedWorkOrders, setUnplannedWorkOrders] = useState<V2UnplannedWorkOrder[]>(() => cloneWorkOrders(v2UnplannedWorkOrders));
  const [draftPlannedWorkOrders, setDraftPlannedWorkOrders] = useState<MachineWorkOrder[]>([]);
  const [draftUnplannedWorkOrders, setDraftUnplannedWorkOrders] = useState<V2UnplannedWorkOrder[]>([]);

  const slots = useMemo(
    () => generateV2TimeSlots(dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate],
  );

  const activePlannedWorkOrders = isEditMode ? draftPlannedWorkOrders : plannedWorkOrders;
  const activeUnplannedWorkOrders = isEditMode ? draftUnplannedWorkOrders : unplannedWorkOrders;

  const filteredWorkOrders = useMemo(() => {
    const start = new Date(`${dateRange.startDate}T00:00:00`);
    const end = new Date(`${dateRange.endDate}T23:59:59`);
    return activePlannedWorkOrders.filter((wo) => {
      const woStart = new Date(wo.plannedStartDateTime);
      const woEnd = new Date(wo.plannedEndDateTime);
      return woStart <= end && woEnd >= start && lines.some((l) => l.id === wo.lineId);
    });
  }, [activePlannedWorkOrders, dateRange, lines]);

  const filteredEvents = useMemo(() => {
    const start = new Date(`${dateRange.startDate}T00:00:00`);
    const end = new Date(`${dateRange.endDate}T23:59:59`);
    return v2TimelineEvents.filter((ev) => {
      return new Date(ev.startDateTime) <= end && new Date(ev.endDateTime) >= start;
    });
  }, [dateRange]);

  const handleToggleLine = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? {...l, expanded: !l.expanded} : l)),
    );
  }, []);

  const handleToggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) return {...c, enabled: !c.enabled};
        if (c.children?.some((ch) => ch.id === id)) {
          return {
            ...c,
            children: c.children.map((ch) => (ch.id === id ? {...ch, enabled: !ch.enabled} : ch)),
          };
        }
        return c;
      }),
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setCategories((prev) =>
      prev.map((c) => ({...c, enabled: true, children: c.children?.map((ch) => ({...ch, enabled: true}))})),
    );
  }, []);

  const handleDeselectAll = useCallback(() => {
    setCategories((prev) =>
      prev.map((c) => ({...c, enabled: false, children: c.children?.map((ch) => ({...ch, enabled: false}))})),
    );
  }, []);

  const handleEnterEditMode = useCallback(() => {
    setDraftPlannedWorkOrders(cloneWorkOrders(plannedWorkOrders));
    setDraftUnplannedWorkOrders(cloneWorkOrders(unplannedWorkOrders));
    setIsEditMode(true);
  }, [plannedWorkOrders, unplannedWorkOrders]);

  const handleCancelEditMode = useCallback(() => {
    setDraftPlannedWorkOrders([]);
    setDraftUnplannedWorkOrders([]);
    setIsEditMode(false);
  }, []);

  const handleSaveEditMode = useCallback(() => {
    setPlannedWorkOrders(cloneWorkOrders(draftPlannedWorkOrders));
    setUnplannedWorkOrders(cloneWorkOrders(draftUnplannedWorkOrders));
    setDraftPlannedWorkOrders([]);
    setDraftUnplannedWorkOrders([]);
    setIsEditMode(false);
  }, [draftPlannedWorkOrders, draftUnplannedWorkOrders]);

  const handleTimelineDrop = useCallback((rawPayload: string, target: V2TimelineDropTarget) => {
    if (!isEditMode || !isSlotVisible(target.slotId, slots)) return;
    const payload = parseDragPayload(rawPayload);
    if (!payload) return;

    if (payload.source === 'unplanned') {
      const draggedWorkOrder = draftUnplannedWorkOrders.find((wo) => wo.id === payload.workOrderId);
      if (!draggedWorkOrder) return;
      const nextPlanned = createPlannedWorkOrder(draggedWorkOrder, target, lines);
      if (!nextPlanned) return;

      setDraftUnplannedWorkOrders((prev) => prev.filter((wo) => wo.id !== payload.workOrderId));
      setDraftPlannedWorkOrders((prev) => [...prev, nextPlanned]);
      return;
    }

    const draggedWorkOrder = draftPlannedWorkOrders.find((wo) => wo.id === payload.workOrderId);
    if (!draggedWorkOrder) return;
    const movedWorkOrder = movePlannedWorkOrder(draggedWorkOrder, target, lines);
    if (!movedWorkOrder) return;

    setDraftPlannedWorkOrders((prev) =>
      prev.map((wo) => (wo.id === payload.workOrderId ? movedWorkOrder : wo)),
    );
  }, [draftPlannedWorkOrders, draftUnplannedWorkOrders, isEditMode, lines, slots]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'var(--planning-background)',
        overflow: 'hidden',
      }}
    >
      {/* Page header */}
      <Paper elevation={0} sx={{...planningCardSx, mx: 2, mt: 2, mb: 1.5, px: 2.5, py: 1.5, flexShrink: 0}}>
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{mb: 0.8}}>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>Production Planning</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>›</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.primaryBlue, fontWeight: 600}}>Order Planning</Typography>
        </Stack>

        {/* Title row */}
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8}}>
          <Typography sx={{fontSize: 22, fontWeight: 900, color: planningTokens.textPrimary}}>
            Order Planning
          </Typography>
          <Chip
            label="Live"
            size="small"
            sx={{fontWeight: 700, fontSize: 11, bgcolor: '#ECFDF3', color: '#16A34A', border: '1px solid #BBF7D0'}}
          />
          <IconButton size="small" sx={{p: 0.4}}>
            <BookmarkBorderIcon sx={{fontSize: 16}} />
          </IconButton>
          <Box sx={{ml: 'auto', display: 'flex', gap: 1}}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditNoteIcon sx={{fontSize: 15}} />}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'none',
                height: 32,
                borderColor: planningTokens.border,
                color: planningTokens.textSecondary,
              }}
            >
              Planning Assumptions
            </Button>
          </Box>
        </Box>

        {/* Metadata bar */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          divider={<Typography sx={{color: planningTokens.border}}>|</Typography>}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarMonthIcon sx={{fontSize: 13, color: planningTokens.textMuted}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
              View: <strong>3 Days</strong>
            </Typography>
          </Stack>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
            Site: <strong>Plymouth</strong>
          </Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
            Lines: <strong>{lines.length} active</strong>
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <RefreshIcon sx={{fontSize: 13, color: planningTokens.textMuted}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
              Last refresh: <strong>25-May-2026 08:15</strong>
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <V2Toolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        transposed={timelineTransposed}
        onToggleTranspose={() => setTimelineTransposed((prev) => !prev)}
        onOpenAssistant={() => setAssistantWorkspaceOpen(true)}
        isEditMode={isEditMode}
        onEnterEditMode={handleEnterEditMode}
        onCancelEditMode={handleCancelEditMode}
        onSaveEditMode={handleSaveEditMode}
      />

      {assistantWorkspaceOpen ? (
        <Box sx={{flex: 1, overflow: 'hidden', p: 2}}>
          <OrdersAiAssistantWorkspace
            open={assistantWorkspaceOpen}
            onClose={() => setAssistantWorkspaceOpen(false)}
          />
        </Box>
      ) : (
        <Box sx={{display: 'flex', flex: 1, overflow: 'hidden', gap: 0}}>
          {/* Left sidebar */}
          <Paper
            elevation={0}
            sx={{
              width: 280,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: '1px solid var(--planning-border)',
              borderRadius: 0,
              bgcolor: 'var(--planning-surface)',
            }}
          >
            <Box sx={{p: 1.25, borderBottom: '1px solid var(--planning-border)', flexShrink: 0}}>
              <V2ObjectsPanel
                categories={categories}
                onToggle={handleToggleCategory}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onOpenConfig={() => setConfigDrawerOpen(true)}
              />
            </Box>

            <Box sx={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <V2WorkOrdersList
                unplanned={activeUnplannedWorkOrders}
                planned={filteredWorkOrders}
                isEditMode={isEditMode}
              />
            </Box>
          </Paper>

          {/* Timeline */}
          <Box sx={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <V2Timeline
              lines={lines}
              slots={slots}
              workOrders={filteredWorkOrders}
              events={filteredEvents}
              categories={categories}
              transposed={timelineTransposed}
              isEditMode={isEditMode}
              onToggleLine={handleToggleLine}
              onDropWorkOrder={handleTimelineDrop}
            />
          </Box>
        </Box>
      )}

      <V2ObjectsConfigDrawer
        open={configDrawerOpen}
        onClose={() => setConfigDrawerOpen(false)}
        categories={categories}
        onChange={setCategories}
      />
    </Box>
  );
}
