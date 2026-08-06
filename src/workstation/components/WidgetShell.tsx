import type {ReactNode} from 'react';
import {Box, Paper, Typography} from '@mui/material';
import {workstationTierCardSx, workstationWidgetTitleSx} from '../theme';

type WidgetShellProps = {
  /**
   * Optional widget header label. Rendered in the standardized uppercase
   * caption style (workstationWidgetTitleSx). Leave undefined to omit the
   * header row entirely (e.g. when the widget manages its own internal header).
   */
  title?: ReactNode;

  /**
   * Optional element placed at the far right of the header row.
   * Useful for action links, filter chips, or period selectors.
   */
  action?: ReactNode;

  /**
   * Set to true for full-bleed content that must reach the card edges.
   * When true the inner padding is 0 and the header is positioned over
   * the content instead of above it.
   */
  noPadding?: boolean;

  /**
   * When true, the card grows to fill its grid cell height.
   * Defaults to true — almost all widgets want this behaviour.
   */
  fillHeight?: boolean;

  dragHandleClass?: string;
  isEditing?: boolean;
  onHide?: () => void;
  size?: string;
  subtitle?: string;
  type?: string;

  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * WidgetShell
 *
 * The single, shared outer wrapper for every workstation widget.
 * Using this component guarantees:
 *   - Consistent card background, border, border-radius and shadow
 *     (sourced from workstationTierCardSx in theme.ts)
 *   - Consistent title typography (workstationWidgetTitleSx)
 *   - Consistent inner padding (1.4 × 8 px = 11.2 px)
 *   - A flex-column layout so children can grow naturally
 *
 * Usage:
 * ```tsx
 * <WidgetShell title="Hourly Output" action={<MyFilterChip />}>
 *   <MyChartOrContent />
 * </WidgetShell>
 * ```
 */
export default function WidgetShell({
  title,
  action,
  noPadding = false,
  fillHeight = true,
  dragHandleClass,
  children,
  className,
  style,
}: WidgetShellProps) {
  const hasHeader = Boolean(title || action);

  return (
    <Paper
      elevation={0}
      className={`${dragHandleClass ?? 'workstation-drag-handle'} ${className ?? ''}`}
      style={style}
      sx={{
        ...workstationTierCardSx,
        position: 'relative',
        overflow: 'hidden',
        containerType: 'inline-size',
        height: fillHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        p: noPadding ? 0 : 1.4,
        minHeight: 0,
        cursor: 'default',
        [`&.${dragHandleClass ?? 'workstation-drag-handle'}`]: {
          cursor: 'grab',
          '&:active': {cursor: 'grabbing'},
        },
      }}
    >
      {hasHeader && (
        <Box
          className={dragHandleClass ?? 'workstation-drag-handle'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            cursor: 'grab',
            '&:active': {cursor: 'grabbing'},
            // When noPadding, float the header over the content.
            ...(noPadding
              ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  px: 1.4,
                  pt: 1.1,
                  pb: 0.6,
                }
              : {mb: 1.1}),
          }}
        >
          {title ? (
            typeof title === 'string' ? (
              <Typography sx={workstationWidgetTitleSx}>{title}</Typography>
            ) : (
              title
            )
          ) : (
            // Spacer so action stays right-aligned even without a title
            <Box />
          )}

          {action ? <Box sx={{flexShrink: 0}}>{action}</Box> : null}
        </Box>
      )}

      {/* Content area — fills remaining space */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
