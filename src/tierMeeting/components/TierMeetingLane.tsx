import {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  InputBase,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import {AutoAwesome as SparkleIcon, DeleteOutline as DeleteIcon, DragIndicator as DragHandleIcon, OpenInFull as ExpandIcon, Settings as SettingsIcon} from '@mui/icons-material';
import type {ActionTrackerCategory} from '../../actionTracker/types';
import type {TierMeetingLaneSettings, TierMeetingLaneSpan, TierMeetingLaneStatus, TierMeetingPillar} from '../types';
import TierMeetingLaneSettingsDialog from './TierMeetingLaneSettingsDialog';

type ResizeDirection = 'width' | 'height' | 'both';

type TierMeetingLaneProps = {
  pillar: TierMeetingPillar;
  status: TierMeetingLaneStatus;
  settings: TierMeetingLaneSettings;
  span: TierMeetingLaneSpan;
  height: number;
  boardGridWidth: number;
  layoutEditingEnabled: boolean;
  editableTitle?: boolean;
  showDeleteAction?: boolean;
  children: React.ReactNode;
  onDelete?: () => void;
  onTitleChange?: (title: string) => void;
  onStatusChange: (status: TierMeetingLaneStatus) => void;
  onSpanChange: (span: TierMeetingLaneSpan) => void;
  onHeightChange: (height: number) => void;
  onSettingsChange: (settings: TierMeetingLaneSettings) => void;
  onExpand: () => void;
  onOpenActionTracker: (category?: ActionTrackerCategory) => void;
};

const lanePalette = {
  accent: '#044ED7',
  accentSoft: '#EBEDF0',
  accentBorder: '#BFD3FF',
  surfaceMuted: '#F4F7FC',
  textPrimary: '#1F2366',
  textSecondary: '#626465',
  border: '#DBDDDF',
};

const minSpan = 10;
const maxSpan = 60;
const laneGapPx = 16;
const minHeight = 420;
const maxHeight = 1200;

export default function TierMeetingLane({
  pillar,
  status,
  settings,
  span,
  height,
  boardGridWidth,
  layoutEditingEnabled,
  editableTitle = false,
  showDeleteAction = false,
  children,
  onDelete,
  onTitleChange,
  onSpanChange,
  onHeightChange,
  onSettingsChange,
  onExpand,
  onOpenActionTracker,
}: TierMeetingLaneProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeResizeDirection, setActiveResizeDirection] = useState<ResizeDirection | null>(null);
  const [titleDraft, setTitleDraft] = useState(pillar.title);
  const visibleComponents = new Set(settings.visibleComponentIds);
  const summary = pillar.actionSummary;

  const footerCards = useMemo(() => ([
    {label: 'Open', value: summary.open},
    {label: 'Review', value: summary.underReview},
    {label: 'Approval', value: summary.underApproval},
    {label: 'Done', value: summary.completed},
    {label: 'Overdue', value: summary.overdue, tone: '#E43B46'},
  ]), [summary]);

  const startResize = (direction: ResizeDirection) => (event: React.MouseEvent<HTMLDivElement>) => {
    if (!layoutEditingEnabled) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startSpan = span;
    const startHeight = height;
    const columnUnit = boardGridWidth > 0
      ? ((boardGridWidth - (laneGapPx * 59)) / 60) + laneGapPx
      : 0;

    setActiveResizeDirection(direction);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'width' ? 'ew-resize' : direction === 'height' ? 'ns-resize' : 'nwse-resize';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'width' || direction === 'both') {
        if (columnUnit > 0) {
          const spanDelta = Math.round((moveEvent.clientX - startX) / columnUnit);
          const nextSpan = Math.min(maxSpan, Math.max(minSpan, startSpan + spanDelta));
          onSpanChange(nextSpan);
        }
      }

      if (direction === 'height' || direction === 'both') {
        const heightDelta = moveEvent.clientY - startY;
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + heightDelta));
        onHeightChange(nextHeight);
      }
    };

    const handleMouseUp = () => {
      setActiveResizeDirection(null);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const statusBadge = getStatusBadge(status);

  useEffect(() => {
    setTitleDraft(pillar.title);
  }, [pillar.title]);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: height,
          height: '100%',
          borderRadius: 3.5,
          border: activeResizeDirection ? `2px solid ${lanePalette.accent}` : `1px solid ${lanePalette.border}`,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: activeResizeDirection ? '0 20px 35px rgba(4,78,215,0.12)' : 'none',
          transition: activeResizeDirection ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
        }}
      >
        <Box sx={{p: {xs: 1.15, xl: 1.5}, borderBottom: '1px solid #DBDDDF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: {xs: 0.7, xl: 1}}}>
          <Box sx={{minWidth: 0, display: 'flex', alignItems: 'center', gap: {xs: 0.7, xl: 1.1}}}>
            <Box
              sx={{
                width: {xs: 28, md: 30, xl: 40},
                height: {xs: 28, md: 30, xl: 40},
                borderRadius: 2.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: statusBadge.bg,
                color: statusBadge.fg,
                fontWeight: 900,
                fontSize: {xs: '0.85rem', md: '0.92rem', xl: '1.35rem'},
                flexShrink: 0,
                boxShadow: `inset 0 0 0 1px ${statusBadge.border}`,
              }}
            >
              {pillar.title.charAt(0)}
            </Box>
            <Box sx={{minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              {editableTitle ? (
                <InputBase
                  value={titleDraft}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setTitleDraft(nextValue);
                    onTitleChange?.(nextValue);
                  }}
                  onPaste={(event) => {
                    const pastedText = event.clipboardData.getData('text');
                    const selectionStart = event.currentTarget.querySelector('input')?.selectionStart ?? titleDraft.length;
                    const selectionEnd = event.currentTarget.querySelector('input')?.selectionEnd ?? titleDraft.length;
                    const nextValue = `${titleDraft.slice(0, selectionStart)}${pastedText}${titleDraft.slice(selectionEnd)}`;
                    setTitleDraft(nextValue);
                    onTitleChange?.(nextValue);
                    event.preventDefault();
                  }}
                  onBlur={() => {
                    const trimmedTitle = titleDraft.trim();
                    if (!trimmedTitle) {
                      setTitleDraft('Custom');
                      onTitleChange?.('Custom');
                      return;
                    }
                    if (trimmedTitle !== titleDraft) {
                      setTitleDraft(trimmedTitle);
                    }
                    onTitleChange?.(trimmedTitle);
                  }}
                  placeholder="Custom lane"
                  inputProps={{spellCheck: false}}
                  sx={{
                    fontWeight: 900,
                    color: lanePalette.textPrimary,
                    fontSize: {xs: '0.92rem', md: '0.94rem', lg: '0.98rem', xl: '1.48rem'},
                    lineHeight: 1,
                    px: 0.4,
                    borderBottom: '2px solid transparent',
                    transition: 'border-color 0.2s ease',
                    '&:hover': {borderColor: '#C5CAD3'},
                    '&.Mui-focused': {borderColor: lanePalette.accent},
                    '& input': {
                      p: 0,
                    },
                  }}
                />
              ) : (
                <Typography sx={{fontWeight: 900, color: lanePalette.textPrimary, fontSize: {xs: '0.92rem', md: '0.94rem', lg: '0.98rem', xl: '1.48rem'}, lineHeight: 1}}>
                  {pillar.title}
                </Typography>
              )}
              {layoutEditingEnabled ? (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.35}}>
                  <DragHandleIcon sx={{fontSize: {xs: 12, xl: 16}, color: lanePalette.textSecondary}} />
                  <Typography variant="caption" sx={{color: lanePalette.textSecondary, fontWeight: 700, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
                    Drag the lane to reorder. Drag the right or bottom border to resize.
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: {xs: 0.35, xl: 0.6}, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
            {layoutEditingEnabled ? (
              <IconButton size="small" onClick={() => setIsSettingsOpen(true)} sx={{border: '1px solid #DBDDDF', width: {xs: 28, xl: 34}, height: {xs: 28, xl: 34}}}>
                <SettingsIcon sx={{fontSize: {xs: 16, xl: 20}}} />
              </IconButton>
            ) : null}
            {layoutEditingEnabled && showDeleteAction ? (
              <IconButton
                size="small"
                onClick={onDelete}
                aria-label="Delete custom lane"
                sx={{border: '1px solid #F3C7CC', color: '#C62839', bgcolor: '#FFF5F6', width: {xs: 28, xl: 34}, height: {xs: 28, xl: 34}}}
              >
                <DeleteIcon sx={{fontSize: {xs: 16, xl: 20}}} />
              </IconButton>
            ) : null}
            <IconButton size="small" sx={{border: '1px solid #DBDDDF', color: lanePalette.accent, width: {xs: 28, xl: 34}, height: {xs: 28, xl: 34}}}>
              <SparkleIcon sx={{fontSize: {xs: 16, xl: 20}}} />
            </IconButton>
            <IconButton size="small" onClick={onExpand} sx={{border: '1px solid #DBDDDF', width: {xs: 28, xl: 34}, height: {xs: 28, xl: 34}}}>
              <ExpandIcon sx={{fontSize: {xs: 16, xl: 20}}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{p: {xs: 1.05, xl: 1.5}, flexGrow: 1, overflowY: 'auto'}}>
          {children}
        </Box>

        {visibleComponents.has('actionSummary') ? (
          <Box sx={{p: {xs: 1.05, xl: 1.5}, borderTop: '1px solid #DBDDDF', bgcolor: '#f8fafc'}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 0.9, fontSize: {xs: '0.58rem', md: '0.6rem', xl: '0.72rem'}}}>
              ACTION SUMMARY
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.7}}>
              {footerCards.map((item) => (
                <Paper key={item.label} elevation={0} sx={{p: 0.9, borderRadius: 2, bgcolor: '#ffffff', textAlign: 'center', border: '1px solid #e5e7eb'}}>
                  <Typography variant="subtitle2" sx={{fontWeight: 900, color: item.tone ?? '#1F2366', fontSize: {xs: '0.82rem', md: '0.84rem', xl: '1rem'}}}>{item.value}</Typography>
                  <Typography variant="caption" sx={{fontWeight: 700, color: '#626465', fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>{item.label}</Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.1}}>
              <Chip size="small" label={`${summary.open + summary.underReview + summary.underApproval} active items`} sx={{fontWeight: 800}} />
              <Button variant="text" size="small" onClick={() => onOpenActionTracker(pillar.id === 'custom' ? undefined : pillar.category)} sx={{fontWeight: 800}}>
                Open actions
              </Button>
            </Box>
          </Box>
        ) : null}

        {layoutEditingEnabled ? (
          <>
            <Box
              onMouseDown={startResize('width')}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 10,
                height: '100%',
                cursor: 'ew-resize',
                '&:hover': {bgcolor: lanePalette.accentSoft},
              }}
            />
            <Box
              onMouseDown={startResize('height')}
              sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: 10,
                cursor: 'ns-resize',
                '&:hover': {bgcolor: lanePalette.accentSoft},
              }}
            />
            <Box
              onMouseDown={startResize('both')}
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 22,
                height: 22,
                cursor: 'nwse-resize',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                pr: 0.5,
                pb: 0.35,
                color: lanePalette.accent,
                bgcolor: activeResizeDirection === 'both' ? lanePalette.accentSoft : 'transparent',
                '&:hover': {bgcolor: lanePalette.accentSoft},
                '&::before': {
                  content: '""',
                  width: 10,
                  height: 10,
                  borderRight: `2px solid ${lanePalette.accent}`,
                  borderBottom: `2px solid ${lanePalette.accent}`,
                  borderBottomRightRadius: 1,
                },
              }}
            />
          </>
        ) : null}
      </Paper>
      <TierMeetingLaneSettingsDialog
        open={isSettingsOpen}
        pillar={pillar}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={onSettingsChange}
      />
    </>
  );
}

function getStatusBadge(status: TierMeetingLaneStatus) {
  if (status === 'On Track') {
    return {
      bg: '#7AD36B',
      fg: '#0F172A',
      border: '#5BB74C',
    };
  }

  if (status === 'Watch') {
    return {
      bg: '#FFD166',
      fg: '#0F172A',
      border: '#E0B347',
    };
  }

  return {
    bg: '#FF5A52',
    fg: '#0F172A',
    border: '#E43B46',
  };
}
