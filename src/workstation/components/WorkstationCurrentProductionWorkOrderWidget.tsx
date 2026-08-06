import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, LinearProgress, Typography} from '@mui/material';
import type {
  WorkstationLineSummary,
  WorkstationSelectedItemDetail,
  WorkstationSelectedItemType,
} from '../types';
import WidgetShell from './WidgetShell';

type WorkstationCurrentProductionWorkOrderWidgetProps = {
  selectedItems: Record<WorkstationSelectedItemType, WorkstationSelectedItemDetail>;
  summary: WorkstationLineSummary;
};

function stripItemPrefix(value: string, prefix: string) {
  return value.replace(new RegExp(`^${prefix}\\s+`, 'i'), '');
}

function getPropertyValue(item: WorkstationSelectedItemDetail, label: string) {
  return item.properties.find((property) => property.label === label)?.value;
}

function formatMetric(value: number) {
  return value.toLocaleString();
}

export default function WorkstationCurrentProductionWorkOrderWidget({
  selectedItems,
  summary,
}: WorkstationCurrentProductionWorkOrderWidgetProps) {
  const workOrder = stripItemPrefix(selectedItems['work-order'].name, 'Work Order') || summary.workOrder;
  const sku = stripItemPrefix(selectedItems.sku.name, 'SKU') || summary.sku;
  const productOrder = getPropertyValue(selectedItems['work-order'], 'Product') ?? summary.product;
  const batch = stripItemPrefix(selectedItems.batch.name, 'Batch') || summary.batch;
  const lot = stripItemPrefix(selectedItems.lot.name, 'Lot');
  const progressPercent = Math.min((summary.currentOutput / Math.max(summary.shiftTarget, 1)) * 100, 100);

  const detailItems = [
    {
      label: 'Order',
      value: workOrder,
    },
    {
      label: 'SKU / PO',
      value: sku,
      secondary: productOrder,
    },
    {
      label: 'Batch Number',
      value: batch,
      secondary: lot,
    },
    {
      label: 'Produced',
      value: formatMetric(summary.currentOutput),
      unit: 'pcs',
      align: 'right' as const,
    },
    {
      label: 'Target',
      value: formatMetric(summary.shiftTarget),
      unit: 'pcs',
      align: 'right' as const,
    },
  ];

  return (
    <WidgetShell title="Current Production Work Order">
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1.15fr 1.25fr 1.35fr 0.75fr 0.7fr',
            },
            alignItems: 'stretch',
            border: `1px solid ${workstationVisuals.tierBorder}`,
            borderRadius: 2,
            bgcolor: workstationVisuals.tierSurfaceMuted,
            overflow: 'hidden',
          }}
        >
          {detailItems.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                minWidth: 0,
                px: {xs: 1.3, md: 1.55},
                py: {xs: 0.95, md: 1.05},
                borderRight: {
                  xs: 'none',
                  sm: index === detailItems.length - 1 ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
                },
                borderBottom: {
                  xs: index === detailItems.length - 1 ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
                  sm: 'none',
                },
                textAlign: item.align ?? 'left',
              }}
            >
              <Typography
                sx={{
                  color: workstationVisuals.tierTextLabel,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  color: workstationVisuals.tierTextHeading,
                  fontSize: {xs: '0.95rem', md: item.unit ? '1.15rem' : '0.95rem'},
                  fontWeight: 800,
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: workstationVisuals.fontFamily,
                }}
                title={item.value}
              >
                {item.value}
              </Typography>
              {item.secondary ? (
                <Typography
                  sx={{
                    mt: 0.4,
                    color: workstationVisuals.tierTextMeta,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                  title={item.secondary}
                >
                  {item.secondary}
                </Typography>
              ) : null}
              {item.unit ? (
                <Typography
                  sx={{
                    mt: 0.4,
                    color: workstationVisuals.tierTextMeta,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {item.unit}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>

        <Box sx={{mt: 0.5}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.8}}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: workstationVisuals.tierTextLabel,
                fontFamily: workstationVisuals.fontFamily,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Order Progress
            </Typography>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 900,
                color: workstationVisuals.tierTextHeading,
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              {Math.round(progressPercent)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 12,
              borderRadius: 999,
              bgcolor: workstationVisuals.tierSurfaceMuted,
              border: `1px solid ${workstationVisuals.tierBorder}`,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                backgroundImage:
                  progressPercent >= 90
                    ? `linear-gradient(90deg, ${workstationChartSemantic.good} 0%, ${tokenSuccess.lighter} 100%)`
                    : `linear-gradient(90deg, ${workstationVisuals.blue} 0%, ${tokenBrand.light} 100%)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              },
            }}
          />
        </Box>
      </Box>
    </WidgetShell>
  );
}
