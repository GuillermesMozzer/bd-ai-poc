import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Switch,
  Typography,
} from '@mui/material';
import {Close as CloseIcon, DragIndicator as DragIndicatorIcon} from '@mui/icons-material';
import {actionTrackerKanbanColumns, actionTrackerTableColumns} from '../../actionTracker/config';
import type {TierMeetingLaneSettings} from '../types';

const componentDefinitions = [
  {id: 'kpis', label: 'KPI cards'},
  {id: 'aiInsights', label: 'AI insights'},
  {id: 'quickLinks', label: 'Quick links'},
] as const;

type ActionTrackerLaneSettingsDialogProps = {
  open: boolean;
  settings: TierMeetingLaneSettings;
  onClose: () => void;
  onChange: (settings: TierMeetingLaneSettings) => void;
};

export default function ActionTrackerLaneSettingsDialog({
  open,
  settings,
  onClose,
  onChange,
}: ActionTrackerLaneSettingsDialogProps) {
  const stopDialogDragPropagation = (event: React.DragEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const orderedComponents = settings.componentOrder
    .map((componentId) => componentDefinitions.find((component) => component.id === componentId))
    .filter((component): component is (typeof componentDefinitions)[number] => Boolean(component));

  const toggleVisibleComponent = (componentId: (typeof componentDefinitions)[number]['id']) => {
    const visibleComponentIds = settings.visibleComponentIds.includes(componentId)
      ? settings.visibleComponentIds.filter((id) => id !== componentId)
      : [...settings.visibleComponentIds, componentId];
    onChange({...settings, visibleComponentIds});
  };

  const toggleVisibleTableColumn = (columnId: (typeof actionTrackerTableColumns)[number]['id']) => {
    const nextVisibleTableColumnIds = settings.visibleTableColumnIds?.includes(columnId)
      ? settings.visibleTableColumnIds.filter((id) => id !== columnId)
      : [...(settings.visibleTableColumnIds ?? []), columnId];
    onChange({...settings, visibleTableColumnIds: nextVisibleTableColumnIds});
  };

  const toggleVisibleKanbanColumn = (columnId: (typeof actionTrackerKanbanColumns)[number]['id']) => {
    const nextVisibleKanbanColumnIds = settings.visibleKanbanColumnIds?.includes(columnId)
      ? settings.visibleKanbanColumnIds.filter((id) => id !== columnId)
      : [...(settings.visibleKanbanColumnIds ?? []), columnId];
    onChange({...settings, visibleKanbanColumnIds: nextVisibleKanbanColumnIds});
  };

  const reorderList = <T,>(items: T[], sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return items;
    const nextItems = [...items];
    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    return nextItems;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{p: 2.2, position: 'relative'}}>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            border: '1px solid #DBDDDF',
            bgcolor: '#FFFFFF',
            color: '#475569',
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            '&:hover': {
              bgcolor: '#F8FAFC',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{fontWeight: 800, mb: 1}}>
          Customize Action Tracker
        </Typography>
        <Typography variant="body2" sx={{color: '#626465', mb: 1.4}}>
          Control which sections appear in the Action Tracker lane while editing the tier meeting board.
        </Typography>
        <Typography variant="caption" sx={{fontWeight: 800, color: '#626465'}}>
          SECTIONS
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1}}>
          {orderedComponents.map((component, index) => (
            <Box
              key={component.id}
              draggable
              onDragStart={(event) => {
                stopDialogDragPropagation(event);
                event.dataTransfer.setData('text/action-tracker-component-index', index.toString());
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                stopDialogDragPropagation(event);
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                stopDialogDragPropagation(event);
                event.preventDefault();
                const sourceIndex = Number(event.dataTransfer.getData('text/action-tracker-component-index'));
                if (Number.isNaN(sourceIndex)) return;
                onChange({...settings, componentOrder: reorderList(settings.componentOrder, sourceIndex, index)});
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                <Typography variant="body2" sx={{fontWeight: 700}}>
                  {component.label}
                </Typography>
              </Box>
              <Switch checked={settings.visibleComponentIds.includes(component.id)} onChange={() => toggleVisibleComponent(component.id)} />
            </Box>
          ))}
        </Box>
        <Typography variant="caption" sx={{fontWeight: 800, color: '#626465', mt: 1.6}}>
          GRID COLUMNS
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8, mt: 1}}>
          {actionTrackerTableColumns.map((column) => (
            <Box
              key={column.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{fontWeight: 700}}>
                {column.label}
              </Typography>
              <Switch checked={settings.visibleTableColumnIds?.includes(column.id) ?? false} onChange={() => toggleVisibleTableColumn(column.id)} />
            </Box>
          ))}
        </Box>
        <Typography variant="caption" sx={{fontWeight: 800, color: '#626465', mt: 1.6}}>
          KANBAN COLUMNS
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8, mt: 1}}>
          {actionTrackerKanbanColumns.map((column) => (
            <Box
              key={column.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{fontWeight: 700}}>
                {column.label}
              </Typography>
              <Switch checked={settings.visibleKanbanColumnIds?.includes(column.id) ?? false} onChange={() => toggleVisibleKanbanColumn(column.id)} />
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
