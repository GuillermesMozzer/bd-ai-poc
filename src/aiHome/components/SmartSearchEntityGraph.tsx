import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ChevronRight as ChevronRightIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  ShowChartOutlined as ShowChartOutlinedIcon,
  ViewInArOutlined as ViewInArOutlinedIcon,
  FlagOutlined as FlagOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
} from '@mui/icons-material';
import { EntityNode, SmartSearchCatalogItem, SmartSearchItemKind } from '../smartSearch/types';
import { tokenBrand, tokenDivider, tokenText } from '../../workstation/theme';

type SmartSearchEntityGraphProps = {
  nodes: EntityNode[];
  visibleCount: number;
  onSelectItem: (itemId: string) => void;
  index: SmartSearchCatalogItem[];
};

const kindIcons: Record<SmartSearchItemKind, React.ReactNode> = {
  document: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
  task: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />,
  notification: <NotificationsOutlinedIcon sx={{ fontSize: 16 }} />,
  training: <SchoolOutlinedIcon sx={{ fontSize: 16 }} />,
  asset: <PrecisionManufacturingIcon sx={{ fontSize: 16 }} />,
  timeSeries: <ShowChartOutlinedIcon sx={{ fontSize: 16 }} />,
  '3d': <ViewInArOutlinedIcon sx={{ fontSize: 16 }} />,
  action: <FlagOutlinedIcon sx={{ fontSize: 16 }} />,
  eso: <FlagOutlinedIcon sx={{ fontSize: 16 }} />,
  shiftNote: <EditOutlinedIcon sx={{ fontSize: 16 }} />,
};

export const SmartSearchEntityGraph: React.FC<SmartSearchEntityGraphProps> = ({
  nodes,
  visibleCount,
  onSelectItem,
  index,
}) => {
  if (!nodes.length) return null;

  const itemMap = new Map(index.map((item) => [item.id, item]));

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 1.5,
        p: { xs: 1.25, md: 1.5 },
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 7px rgba(15,23,42,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
        <AutoAwesomeIcon sx={{ color: tokenBrand.main, fontSize: 17 }} />
        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: 13 }}>
          Connected evidence chain
        </Typography>
        <Typography sx={{ color: tokenText.secondary, fontSize: 11.5, ml: 0.5 }}>
          BLU.AI correlated these sources for your query
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          overflowX: 'auto',
          pb: 0.5,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 4 },
        }}
      >
        {nodes.slice(0, visibleCount).map((node, index) => {
          const item = itemMap.get(node.itemId);
          const isLast = index === Math.min(visibleCount, nodes.length) - 1;
          return (
            <React.Fragment key={node.id}>
              <Box
                onClick={() => onSelectItem(node.itemId)}
                sx={{
                  minWidth: { xs: 140, md: 168 },
                  maxWidth: 180,
                  p: 1.1,
                  borderRadius: '10px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: 0,
                  animation: 'smart-search-entity-in 220ms ease forwards',
                  animationDelay: `${index * 120}ms`,
                  '@keyframes smart-search-entity-in': {
                    from: { opacity: 0, transform: 'translateY(6px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                  transition: 'border-color 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    borderColor: tokenBrand.light,
                    boxShadow: '0 4px 12px rgba(29,99,255,0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      bgcolor: `${node.tone}14`,
                      color: node.tone,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {kindIcons[node.kind]}
                  </Box>
                  <Chip
                    label={node.category.split(' ')[0]}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 9,
                      fontWeight: 700,
                      bgcolor: `${node.tone}12`,
                      color: node.tone,
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: tokenText.primary,
                    fontSize: 11.5,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {node.label}
                </Typography>
                {item?.metric ? (
                  <Typography sx={{ color: tokenText.secondary, fontSize: 10, mt: 0.45, fontWeight: 600 }}>
                    {item.metric}
                  </Typography>
                ) : null}
              </Box>
              {!isLast ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 0.35,
                    color: tokenText.disabled,
                    flexShrink: 0,
                    opacity: index < visibleCount - 1 ? 1 : 0,
                    animation: 'smart-search-entity-in 220ms ease forwards',
                    animationDelay: `${index * 120 + 60}ms`,
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </Box>
              ) : null}
            </React.Fragment>
          );
        })}
      </Box>
    </Paper>
  );
};
