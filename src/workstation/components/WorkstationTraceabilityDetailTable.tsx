import {Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {
  AccountTreeOutlined as HierarchyIcon,
  CategoryOutlined as SkuIcon,
  CheckCircleOutline as GoodIcon,
  ChevronRightRounded as ChevronIcon,
  ExpandMoreRounded as ExpandIcon,
  HighlightOffOutlined as RejectedIcon,
  Inventory2Outlined as LotIcon,
  LayersOutlined as BatchIcon,
  PrecisionManufacturingOutlined as MachineIcon,
  RadioButtonCheckedRounded as ActiveDotIcon,
  ReceiptLongOutlined as WorkOrderIcon,
  TaskAltOutlined as QcIcon,
  TimelineOutlined as QuantityIcon,
} from '@mui/icons-material';
import type {
  WorkstationSelectedItemDetail,
  WorkstationSelectedItemType,
  WorkstationTraceabilityEvent,
} from '../types';
import {workstationChartSemantic, workstationTierCardSx, workstationVisuals, workstationWidgetTitleSx} from '../theme';

type WorkstationTraceabilityDetailTableProps = {
  selectedItemType: WorkstationSelectedItemType;
  selectedItems: Record<WorkstationSelectedItemType, WorkstationSelectedItemDetail>;
  traceabilityHistory: WorkstationTraceabilityEvent[];
  onSelectItemType: (itemType: WorkstationSelectedItemType) => void;
};

type HierarchyNode = {
  label: string;
  caption: string;
  itemType: WorkstationSelectedItemType;
  depth: number;
  active: boolean;
};

function getTypeLabel(itemType: WorkstationSelectedItemType) {
  if (itemType === 'work-order') return 'Work Order';
  if (itemType === 'sku') return 'SKU';
  if (itemType === 'batch') return 'Batch';
  return 'Lot';
}

function getTypeIcon(itemType: WorkstationSelectedItemType) {
  if (itemType === 'work-order') return WorkOrderIcon;
  if (itemType === 'sku') return SkuIcon;
  if (itemType === 'batch') return BatchIcon;
  return LotIcon;
}

function getPropertyIcon(label: string) {
  if (label === 'Item Type') return HierarchyIcon;
  if (label.includes('Quantity')) return label === 'Rejected Quantity' ? RejectedIcon : label === 'Good Quantity' ? GoodIcon : QuantityIcon;
  if (label === 'Machine' || label === 'Line') return MachineIcon;
  if (label === 'QC Result') return QcIcon;
  return ChevronIcon;
}

function getPropertyValue(item: WorkstationSelectedItemDetail, label: string) {
  return item.properties.find((property) => property.label === label)?.value;
}

function getValueTone(label: string, value: string) {
  if (label === 'Good Quantity') {
    return {
      color: workstationChartSemantic.good,
      bgcolor: workstationChartSemantic.goodSoft,
      borderColor: 'rgba(122,211,107,0.25)',
    };
  }

  if (label === 'Rejected Quantity') {
    return {
      color: workstationChartSemantic.bad,
      bgcolor: workstationChartSemantic.badSoft,
      borderColor: 'rgba(255,90,82,0.25)',
    };
  }

  if (label === 'QC Result') {
    const normalized = value.toLowerCase();
    if (normalized.includes('release')) {
      return {
        color: workstationChartSemantic.good,
        bgcolor: workstationChartSemantic.goodSoft,
        borderColor: 'rgba(122,211,107,0.25)',
      };
    }

    if (normalized.includes('await') || normalized.includes('pending') || normalized.includes('progress')) {
      return {
        color: workstationVisuals.amber,
        bgcolor: workstationVisuals.amberSoft,
        borderColor: 'rgba(217,119,6,0.25)',
      };
    }
  }

  return null;
}

export default function WorkstationTraceabilityDetailTable({
  selectedItemType,
  selectedItems,
  traceabilityHistory,
  onSelectItemType,
}: WorkstationTraceabilityDetailTableProps) {
  const selectedItem = selectedItems[selectedItemType];
  const SelectedTypeIcon = getTypeIcon(selectedItemType);
  const selectedContext =
    getPropertyValue(selectedItem, 'Machine') ??
    getPropertyValue(selectedItem, 'Line') ??
    getPropertyValue(selectedItem, 'Parent Batch') ??
    getPropertyValue(selectedItem, 'Batch') ??
    getPropertyValue(selectedItem, 'SKU') ??
    selectedItem.status;

  const lotNames = Array.from(
    new Set(
      traceabilityHistory
        .filter((event) => event.entity === 'Lot')
        .map((event) => `Lot ${event.id}`),
    ),
  );

  if (!lotNames.includes(selectedItems.lot.name)) {
    lotNames.unshift(selectedItems.lot.name);
  }

  const hierarchyNodes: HierarchyNode[] = [
    {
      label: selectedItems['work-order'].name,
      caption: getTypeLabel('work-order'),
      itemType: 'work-order',
      depth: 0,
      active: selectedItemType === 'work-order',
    },
    {
      label: selectedItems.sku.name,
      caption: getTypeLabel('sku'),
      itemType: 'sku',
      depth: 1,
      active: selectedItemType === 'sku',
    },
    {
      label: selectedItems.batch.name,
      caption: getTypeLabel('batch'),
      itemType: 'batch',
      depth: 2,
      active: selectedItemType === 'batch',
    },
    ...lotNames.map((lotName) => ({
      label: lotName,
      caption: getTypeLabel('lot'),
      itemType: 'lot' as const,
      depth: 3,
      active: selectedItemType === 'lot' && lotName === selectedItems.lot.name,
    })),
  ];

  return (
    <Box
      sx={{
        overflow: 'hidden',
        minHeight: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: {xs: '1fr', lg: '260px minmax(0, 1fr)'},
      }}
    >
      <Box
        sx={{
          borderRight: {xs: 'none', lg: `1px solid ${workstationVisuals.tierBorder}`},
          borderBottom: {xs: `1px solid ${workstationVisuals.tierBorder}`, lg: 'none'},
          bgcolor: workstationVisuals.tierSurfaceSoft,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.05,
            borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
          }}
        >
          <Typography sx={workstationWidgetTitleSx}>
            Hierarchy Nav
          </Typography>
        </Box>

        <Box sx={{p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.25}}>
          {hierarchyNodes.map((node) => {
            const NodeIcon = getTypeIcon(node.itemType);

            return (
              <Box
                key={`${node.itemType}-${node.label}`}
                onClick={() => onSelectItemType(node.itemType)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.7,
                  pl: `${0.8 + node.depth * 1.12}rem`,
                  pr: 0.8,
                  py: 0.55,
                  borderRadius: 1.2,
                  cursor: 'pointer',
                  bgcolor: node.active ? workstationVisuals.blueSoft : 'transparent',
                  '&:hover': {bgcolor: node.active ? workstationVisuals.blueSoft : workstationVisuals.tierSurfaceMuted},
                  transition: 'all 0.2s ease',
                }}
              >
                {node.active ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: workstationVisuals.blue,
                      borderRadius: '0 6px 6px 0',
                    }}
                  />
                ) : null}

                <Box
                  sx={{
                    position: 'absolute',
                    left: `${0.35 + node.depth * 1.12}rem`,
                    top: 11,
                    color: workstationVisuals.blue,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {node.depth < 3 ? <ExpandIcon sx={{fontSize: 15}} /> : <ChevronIcon sx={{fontSize: 15}} />}
                </Box>

                <NodeIcon sx={{fontSize: 15, color: workstationVisuals.tierTextMuted, flexShrink: 0}} />

                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography
                    sx={{
                      color: node.active ? workstationVisuals.blue : workstationVisuals.tierTextHeading,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {node.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      color: workstationVisuals.tierTextMeta,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {node.caption}
                  </Typography>
                </Box>

                {node.active ? <ActiveDotIcon sx={{fontSize: 10, color: workstationVisuals.blue}} /> : null}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0}}>
        <Box sx={{px: {xs: 1.2, md: 1.55}, pt: 1.15, pb: 0.85}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
            <Paper
              elevation={0}
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.2,
                border: `1px solid ${workstationVisuals.tierBorder}`,
                display: 'grid',
                placeItems: 'center',
                color: workstationVisuals.blue,
                bgcolor: workstationVisuals.tierSurface,
                boxShadow: workstationVisuals.tierShadow,
                flexShrink: 0,
              }}
            >
              <SelectedTypeIcon sx={{fontSize: 17}} />
            </Paper>

            <Box sx={{minWidth: 0}}>
              <Typography
                sx={{
                  color: workstationVisuals.tierTextHeading,
                  fontSize: {xs: '1.05rem', md: '1.28rem'},
                  fontWeight: 900,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                  lineHeight: 1.05,
                  wordBreak: 'break-word',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {getTypeLabel(selectedItemType)} {selectedItem.name.replace(/^Work Order\s+/i, '').replace(/^SKU\s+/i, '').replace(/^Batch\s+/i, '').replace(/^Lot\s+/i, '')}
              </Typography>

              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mt: 0.45}}>
                <Box sx={{width: 2, height: 14, bgcolor: workstationVisuals.blueSoft, borderRadius: 999}} />
                <Typography
                  sx={{
                    color: workstationVisuals.tierTextMeta,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {selectedContext}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <TableContainer sx={{borderTop: `1px solid ${workstationVisuals.tierBorder}`, minHeight: 0, flex: 1, overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor: workstationVisuals.tierSurfaceSoft,
                    borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
                    color: workstationVisuals.tierTextMeta,
                    fontWeight: 900,
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    py: 0.65,
                    fontFamily: workstationVisuals.fontFamily,
                  },
                }}
              >
                <TableCell sx={{width: '42%'}}>Parameter</TableCell>
                <TableCell>Identification / Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItem.properties.map((property) => {
                const PropertyIcon = getPropertyIcon(property.label);
                const valueTone = getValueTone(property.label, property.value);

                return (
                  <TableRow
                    key={`${selectedItem.type}-${property.label}`}
                    sx={{
                      '& td': {
                        borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
                        py: 0.7,
                      },
                      '&:last-of-type td': {borderBottom: 'none'},
                    }}
                  >
                    <TableCell>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                        <PropertyIcon sx={{fontSize: 15, color: workstationVisuals.tierTextMuted}} />
                        <Typography
                          sx={{
                            color: workstationVisuals.tierTextLabel,
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            fontFamily: workstationVisuals.fontFamily,
                          }}
                        >
                          {property.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {valueTone ? (
                        <Chip
                          label={property.value}
                          sx={{
                            height: 22,
                            borderRadius: 1.1,
                            bgcolor: valueTone.bgcolor,
                            color: valueTone.color,
                            border: `1px solid ${valueTone.borderColor}`,
                            fontWeight: 900,
                            fontSize: '0.68rem',
                            fontFamily: '"Roboto Mono", "Consolas", monospace',
                            '& .MuiChip-label': {px: 0.85},
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            color: workstationVisuals.tierTextHeading,
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            fontFamily:
                              property.label.includes('Quantity') || property.label.includes('Time')
                                ? '"Roboto Mono", "Consolas", monospace'
                                : workstationVisuals.fontFamily,
                          }}
                        >
                          {property.value}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
