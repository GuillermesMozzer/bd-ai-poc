import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  BuildCircleOutlined as WorkOrderIcon,
  BuildOutlined as BuildOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthIcon,
  HandymanOutlined as HandymanOutlinedIcon,
} from '@mui/icons-material';
import {maintenancePriorityStyles} from '../data';
import type {MaintenancePriority} from '../types';
import StandardDialog from '../../common/components/StandardDialog';

export type MaintenanceMonthAggregateCategory = 'Preventive' | 'Corrective' | 'Maintenance Plan';

export type MaintenanceMonthWorkOrderItem = {
  woCode: string;
  category: 'Preventive' | 'Corrective' | 'Autonomous Maintenance';
  equipment: string;
  location: string;
  scheduledDate: string;
  duration: string;
  assignedTechnician: string;
  priority: MaintenancePriority;
};

export type MaintenanceMonthPlanItem = {
  planName: string;
  equipment: string;
  frequency: string;
  nextScheduledDate: string;
  responsible: string;
};

export type MaintenanceMonthAggregateCard = {
  category: MaintenanceMonthAggregateCategory;
  count: number;
  workOrders: MaintenanceMonthWorkOrderItem[];
  plans: MaintenanceMonthPlanItem[];
};

export type MaintenanceMonthAggregateDialogState = {
  dateKey: string;
  dayLabel: string;
  aggregate: MaintenanceMonthAggregateCard;
};

export const maintenanceMonthAggregateCategoryOrder: MaintenanceMonthAggregateCategory[] = ['Preventive', 'Corrective', 'Maintenance Plan'];

export const maintenanceMonthAggregateCategoryStyles: Record<
  MaintenanceMonthAggregateCategory,
  {label: string; border: string; bg: string; fg: string; icon: typeof HandymanOutlinedIcon}
> = {
  Preventive: {label: 'Preventive', border: '#93C5FD', bg: '#EEF4FF', fg: '#2563EB', icon: HandymanOutlinedIcon},
  Corrective: {label: 'Corrective', border: '#A7E0B8', bg: '#EAF8EF', fg: '#16A34A', icon: BuildOutlinedIcon},
  'Maintenance Plan': {label: 'Maintenance Plan', border: '#7DA6FF', bg: '#DCE9FF', fg: '#2563EB', icon: CalendarMonthIcon},
};

export function MaintenanceMonthAggregateDetailsDialog({
  selection,
  onClose,
}: {
  selection: MaintenanceMonthAggregateDialogState | null;
  onClose: () => void;
}) {
  const aggregateStyle = selection ? maintenanceMonthAggregateCategoryStyles[selection.aggregate.category] : null;
  const AggregateIcon = aggregateStyle?.icon ?? WorkOrderIcon;
  const dialogTitle = selection && aggregateStyle
    ? `${aggregateStyle.label} - May ${Number(selection.dayLabel)}, 2026`
    : 'Scheduled items';
  const countLabel = selection
    ? `${selection.aggregate.count} ${selection.aggregate.category === 'Maintenance Plan' ? 'plans' : 'work orders'}`
    : '';

  const headerIcon = (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: `1px solid ${aggregateStyle?.border ?? 'var(--paper-border-color)'}`,
        bgcolor: aggregateStyle?.bg ?? 'background.default',
        color: aggregateStyle?.fg ?? 'text.secondary',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <AggregateIcon sx={{fontSize: 17}} />
    </Box>
  );

  return (
    <StandardDialog
      open={Boolean(selection)}
      onClose={onClose}
      title={dialogTitle}
      subtitle={countLabel}
      icon={headerIcon}
      maxWidth="md"
      variant="analytical"
      footer={
        <Button onClick={onClose} sx={{fontWeight: 800}}>
          Close
        </Button>
      }
    >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        {selection?.aggregate.category === 'Maintenance Plan'
          ? selection.aggregate.plans.map((plan) => (
            <Paper key={`${plan.planName}-${plan.equipment}`} elevation={0} sx={{p: 1.2, border: '1px solid var(--paper-border-color)', borderRadius: '8px', bgcolor: 'background.paper'}}>
              <Typography variant="subtitle2" sx={{color: 'text.primary', fontWeight: 900, mb: 0.8}}>
                {plan.planName}
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))'}, gap: 0.8}}>
                {[
                  {label: 'Equipment', value: plan.equipment},
                  {label: 'Frequency', value: plan.frequency},
                  {label: 'Next Scheduled Date', value: plan.nextScheduledDate},
                  {label: 'Responsible', value: plan.responsible},
                ].map((item) => (
                  <Box key={item.label} sx={{minWidth: 0}}>
                    <Typography variant="caption" sx={{display: 'block', color: 'text.disabled', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase'}}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.primary', fontSize: '0.78rem', fontWeight: 700, overflowWrap: 'anywhere'}}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))
          : selection?.aggregate.workOrders.map((workOrder) => (
            <Paper key={workOrder.woCode} elevation={0} sx={{p: 1.2, border: '1px solid var(--paper-border-color)', borderRadius: '8px', bgcolor: 'background.paper'}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.8, flexWrap: 'wrap'}}>
                <Typography variant="subtitle2" sx={{color: 'text.primary', fontWeight: 900}}>
                  {workOrder.woCode}
                </Typography>
                <Chip
                  label={workOrder.priority}
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: maintenancePriorityStyles[workOrder.priority]?.bg ?? 'background.default',
                    color: maintenancePriorityStyles[workOrder.priority]?.fg ?? 'text.secondary',
                    border: `1px solid ${maintenancePriorityStyles[workOrder.priority]?.border ?? 'var(--paper-border-color)'}`,
                    '& .MuiChip-label': {px: 0.8, fontSize: '0.62rem', fontWeight: 900},
                  }}
                />
              </Box>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))'}, gap: 0.8}}>
                {[
                  {label: 'Equipment', value: workOrder.equipment},
                  {label: 'Location', value: workOrder.location},
                  {label: 'Scheduled Date', value: workOrder.scheduledDate},
                  {label: 'Duration', value: workOrder.duration},
                  {label: 'Assigned Technician', value: workOrder.assignedTechnician},
                  {label: 'Priority', value: workOrder.priority},
                ].map((item) => (
                  <Box key={item.label} sx={{minWidth: 0}}>
                    <Typography variant="caption" sx={{display: 'block', color: 'text.disabled', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase'}}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.primary', fontSize: '0.78rem', fontWeight: 700, overflowWrap: 'anywhere'}}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
      </Box>
    </StandardDialog>
  );
}
