import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useState} from 'react';
import {Box, Button, Dialog, DialogContent, IconButton, MenuItem, Paper, TextField, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  OpenInFull as OpenInFullIcon,
  ReportProblem as WarningIcon,
  DiamondOutlined as DiamondIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  safetyNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';

const safetyMetrics = [
  {label: 'Fatality', value: '0', target: '0', color: tokenNeutral.darkest, textColor: tokenCommon.black},
  {label: 'Serious Injury', value: '4', target: '1', color: tokenError.dark, textColor: tokenError.dark},
  {label: 'Minor Injury', value: '12', target: '11', color: tokenError.dark, textColor: tokenError.dark},
  {label: 'Near Misses', value: '2', color: tokenNeutral.darkest, textColor: tokenCommon.black},
  {label: 'Days Without Injuries', value: '4', target: '87', targetLabel: 'Record', color: tokenNeutral.darkest, textColor: tokenCommon.black},
] as const;

const tier1SafetyMetrics = [
  {label: 'Fatality', value: '0', target: '0', color: tokenSuccess.dark},
  {label: 'Serious Injury', value: '4', target: '1', color: tokenError.dark, textColor: tokenError.dark},
  {label: 'Minor Injury', value: '12', target: '11', color: tokenError.dark},
  {label: 'Near Misses', value: '2', target: '2', color: tokenSuccess.dark},
  {label: 'Days Without Injuries', value: '4', target: '87', targetLabel: 'Record', color: tokenNeutral.darkest, textColor: tokenCommon.black},
] as const;

const tier1PendingSeriousInjuryMetric = {
  label: 'Serious Injury',
  value: '3',
  target: '1',
  color: tokenNeutral.darkest,
  textColor: tokenCommon.black,
} as const;

const safetyLineOverview = [
  {name: 'Line 01', value: '0 injuries', delta: '0', tone: tokenSuccess.darker, trend: [0, 0, 0, 0, 0, 0, 0, 0]},
  {name: 'Line 02', value: '1 minor', delta: '+1', tone: tokenWarning.light, trend: [0, 0, 1, 0, 1, 1, 0, 1]},
  {name: 'Line 03', value: '2 minor', delta: '+2', tone: tokenError.dark, trend: [1, 1, 2, 1, 2, 2, 2, 2]},
  {name: 'Line 04', value: '0 injuries', delta: '-1', tone: tokenSuccess.darker, trend: [1, 0, 0, 0, 0, 0, 0, 0]},
];

const safetyDayColorOptions = [
  {label: 'Injury (Red)', value: tokenError.dark},
  {label: 'Safe (Green)', value: tokenSuccess.main},
  {label: 'Warning (Yellow)', value: tokenWarning.light},
  {label: 'No status (Gray)', value: tokenNeutral.dark},
];

const safetyDay15Occurrences = [
  {
    category: 'Serious Injury',
    description: 'The technician bypassed a safety guard and got a glove caught in a rotating part.',
    tone: 'red',
  },
  {
    category: 'Near Misses',
    description: 'Wet floor near production line',
    tone: 'orange',
  },
  {
    category: 'Near Misses',
    description: 'Chemical spill in maintenance area',
    tone: 'orange',
  },
  {
    category: 'Minor Injury',
    description: 'Machine guard left open',
    tone: 'orange',
  },
  {
    category: 'ESO Submitted',
    description: 'Loose cables near operator walkway',
    tone: 'green',
  },
] as const;

const occurrenceToneStyles = {
  red: {
    bg: tokenError.lightest,
    rail: tokenError.dark,
    icon: tokenError.dark,
    iconBg: tokenError.lightest,
  },
  orange: {
    bg: tokenWarning.lightest,
    rail: tokenWarning.dark,
    icon: tokenWarning.dark,
    iconBg: tokenWarning.lightest,
  },
  green: {
    bg: tokenSuccess.lightest,
    rail: tokenSuccess.dark,
    icon: tokenSuccess.dark,
    iconBg: tokenSuccess.lightest,
  },
} as const;

function SafetyRibbon({enlarged = false, onClick}: {enlarged?: boolean; onClick?: () => void}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        inset: enlarged ? 'clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px) clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px)' : 'clamp(8px, 1.8cqw, 14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box
        component="img"
        src="/images/S%20Safety.png"
        alt="Safety calendar"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}

function MetricCard({
  onClick,
  color,
  label,
  target,
  targetLabel = 'Target',
  textColor,
  value,
  tierOneStyle = false,
  pulse = false,
}: {
  onClick?: () => void;
  color: string;
  label: string;
  target?: string;
  targetLabel?: string;
  textColor?: string;
  value: string;
  tierOneStyle?: boolean;
  pulse?: boolean;
}) {
  const targetValueColor = color === tokenError.dark ? tokenBrand.light : color;
  const metricTextColor = textColor ?? color;
  const tierOneAlertActive = tierOneStyle && pulse;
  const tierOneSeriousInjuryPending = tierOneStyle && label === 'Serious Injury' && value === '3';

  if (tierOneStyle) {
    return (
      <Paper elevation={0} className="sqdc-metric-card" onClick={onClick} sx={{
        position: 'relative',
        height: '4.125rem',
        minHeight: '4.125rem',
        pl: tierOneAlertActive ? 2.35 : 1.55,
        pr: tierOneAlertActive ? 1.45 : 1,
        py: tierOneAlertActive ? 0.75 : 0.8,
        borderRadius: tierOneAlertActive || tierOneSeriousInjuryPending ? '8px' : '6px',
        bgcolor: tierOneAlertActive ? tokenError.dark : tokenNeutral.lighter,
        border: `1px solid ${tierOneAlertActive ? '${tokenError.dark}' : tierOneSeriousInjuryPending ? '${tokenNeutral.dark}' : '${tokenNeutral.main}'}`,
        boxShadow: tierOneAlertActive ? '0 8px 20px rgba(239, 52, 61, 0.18)' : '0 3px 10px rgba(23, 84, 180, 0.14)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        animation: pulse ? 'serious-injury-pulse 720ms ease-in-out 1' : 'none',
        '@keyframes serious-injury-pulse': {
          '0%': { bgcolor: tokenNeutral.lighter, boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)' },
          '45%': { bgcolor: tokenNeutral.lighter, boxShadow: '0 0 0 3px rgba(239, 52, 61, 0.24), 0 10px 24px rgba(239, 52, 61, 0.28)' },
          '100%': { bgcolor: tokenError.dark, boxShadow: '0 8px 20px rgba(239, 52, 61, 0.18)' },
        },
      }}>
        <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: tierOneAlertActive ? 8 : 5, bgcolor: tierOneAlertActive ? tokenWarning.lighter : tierOneSeriousInjuryPending ? tokenError.dark : color}} />
        <Box sx={{display: 'flex', justifyContent: 'space-between', height: '100%', gap: 1}}>
          <Box sx={{minWidth: 0, maxWidth: tierOneSeriousInjuryPending ? 'calc(100% - 44px)' : undefined}}>
            <Typography className="sqdc-metric-value" sx={{fontSize: '1.8125rem', lineHeight: 0.95, color: tierOneAlertActive ? tokenCommon.white : tierOneSeriousInjuryPending ? tokenError.dark : metricTextColor, fontWeight: tierOneAlertActive ? 700 : 400}}>{value}</Typography>
            <Typography className="sqdc-metric-label" sx={{fontSize: '0.6875rem', lineHeight: 1, color: tierOneAlertActive ? tokenCommon.white : tierOneSeriousInjuryPending ? tokenError.dark : metricTextColor, mt: 0.15, fontWeight: tierOneAlertActive ? 500 : undefined, whiteSpace: 'nowrap'}}>{label}</Typography>
          </Box>
          {target ? (
            tierOneAlertActive ? (
              <Typography className="sqdc-metric-target" sx={{position: 'absolute', top: 12, right: 14, fontSize: 11, lineHeight: 1, color: 'rgba(255,255,255,0.82)', fontWeight: 700}}>
                {target}
              </Typography>
            ) : tierOneSeriousInjuryPending ? (
              <Box sx={{position: 'absolute', top: 13, right: 10, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography className="sqdc-metric-target" sx={{fontSize: 8.5, letterSpacing: 0.6, color: workstationVisuals.tierTextLabel, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1}}>
                  {targetLabel}
                </Typography>
                <Box sx={{display: 'grid', placeItems: 'center', width: 25, height: 25, mt: 0.4, borderRadius: '50%', bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 14, fontWeight: 600}}>
                  {target}
                </Box>
              </Box>
            ) : (
              <Box sx={{pt: 1.1, textAlign: 'right', flexShrink: 0}}>
                <Typography className="sqdc-metric-target" sx={{fontSize: 8.5, letterSpacing: 0, color: workstationVisuals.tierTextLabel, fontWeight: 700, textTransform: 'uppercase'}}>{targetLabel}</Typography>
                <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 10, fontWeight: 800}}>
                  {target}
                </Box>
              </Box>
            )
          ) : null}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className="sqdc-metric-card" onClick={onClick} sx={{
      position: 'relative',
      minHeight: 'clamp(66px, 16cqw, 78px)',
      px: 'clamp(10px, 2.3cqw, 14px)',
      py: 'clamp(9px, 2cqw, 12px)',
      border: `1px solid ${tokenNeutral.main}`,
      borderRadius: 1.15,
      overflow: 'hidden',
      bgcolor: tokenNeutral.lightest,
      boxShadow: 'none',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: color}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, height: '100%'}}>
        <Box sx={{minWidth: 0}}>
          <Typography className="sqdc-metric-value" sx={{fontSize: 'clamp(24px, 6.5cqw, 33px)', lineHeight: 0.9, color: metricTextColor, fontWeight: 500}}>{value}</Typography>
          <Typography className="sqdc-metric-label" sx={{fontSize: 'clamp(10px, 2.3cqw, 12px)', color: metricTextColor, lineHeight: 1.15, mt: 0.7}}>{label}</Typography>
        </Box>
        {target ? (
          <Typography className="sqdc-metric-target" sx={{fontSize: 'clamp(10px, 2cqw, 12px)', color: tokenBrand.light, fontWeight: 500, whiteSpace: 'nowrap', mt: 0.1}}>
            {targetLabel}&nbsp;<Box component="span" sx={{color: targetValueColor}}>{target}</Box>
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

type MySafetyWidgetProps = {
  onExpand?: () => void;
  onGenerateAiSafetyReport?: () => void;
  onOpenSeriousInjury?: () => void;
  useTierCarousel?: boolean;
  overviewLabel?: string;
  overviewItemPrefix?: string;
  tier1SeriousInjuryIncidentActive?: boolean;
};

export default function MySafetyWidget({onExpand, onGenerateAiSafetyReport, onOpenSeriousInjury, useTierCarousel = false, overviewLabel = 'Line overview', overviewItemPrefix = 'Line', tier1SeriousInjuryIncidentActive = false}: MySafetyWidgetProps) {
  const notifications = useWidgetNotifications(safetyNotificationConfig);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAiInsightOpen, setIsAiInsightOpen] = useState(false);
  const [showCalendarDayDetails, setShowCalendarDayDetails] = useState(false);
  const [day15Color, setDay15Color] = useState<string>(tokenError.dark);

  const openCalendarModal = () => {
    setIsCalendarModalOpen(true);
    setShowCalendarDayDetails(false);
  };

  return (
    <Paper elevation={0} sx={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      p: 'clamp(8px, 1.7cqw, 12px)',
      borderRadius: 1.8,
      bgcolor: tokenCommon.white,
      border: `1px solid ${tokenNeutral.main}`,
      boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
      overflow: 'visible',
      containerType: 'inline-size',
      position: 'relative',
      zIndex: isAiInsightOpen ? 80 : 'auto',
      display: 'grid',
      gridTemplateRows: useTierCarousel ? 'auto minmax(142px, 1.15fr) 78px minmax(118px, 0.85fr)' : 'auto minmax(90px, 1fr) auto auto',
      gap: 'clamp(3px, 1.1cqw, 8px)',
      '@container (max-width: 260px)': {
        p: 1,
        gridTemplateRows: useTierCarousel ? 'auto minmax(126px, 1.05fr) 76px minmax(112px, 0.85fr)' : 'auto minmax(76px, 0.8fr) auto auto',
        '& .sqdc-header-actions': {gap: 0.2},
        '& .sqdc-title': {fontSize: 20},
        '& .sqdc-metric-card': {p: '7px', pl: '10px'},
        '& .sqdc-metric-value': {fontSize: 22},
        '& .sqdc-metric-label': {fontSize: 10.5},
        '& .sqdc-metric-target': {fontSize: 9},
      },
    }}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 'clamp(40px, 9cqw, 52px)', px: 'clamp(3px, 1.2cqw, 8px)'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.7cqw, 17px)', minWidth: 0}}>
          <WidgetLetterBadge letter="S" defaultTone="green" />
          <Typography className="sqdc-title" sx={{fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1}}>
            Safety
          </Typography>
        </Box>
        <Box className="sqdc-header-actions" sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
          <Box sx={{position: 'relative'}}>
            <IconButton
              size="small"
              aria-label="Open BLU.AI safety insight"
              onClick={() => setIsAiInsightOpen((current) => !current)}
              sx={{
                width: 28,
                height: 28,
                color: tokenBrand.main,
                bgcolor: tokenNeutral.lighter,
                animation: 'safetyAiBlink 1.05s ease-in-out infinite',
                '@keyframes safetyAiBlink': {
                  '0%, 100%': {boxShadow: '0 0 0 0 rgba(23, 100, 245, 0.38)', transform: 'scale(1)'},
                  '50%': {boxShadow: '0 0 0 7px rgba(23, 100, 245, 0)', transform: 'scale(1.08)'},
                },
                '&:hover': {
                  bgcolor: tokenNeutral.main,
                },
              }}
            >
              <SparkleIcon sx={{fontSize: 'clamp(17px, 4cqw, 21px)'}} />
            </IconButton>
          </Box>
          <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={28} />
          <IconButton size="small" onClick={onExpand} sx={{width: 28, height: 28, color: tokenBrand.main}}>
            <OpenInFullIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      {isAiInsightOpen ? (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: 'clamp(48px, 10cqw, 56px)',
            right: 'clamp(10px, 2.6cqw, 16px)',
            zIndex: 120,
            width: 'min(248px, calc(100% - 20px))',
            p: 1.35,
            borderRadius: '10px',
            border: `1px solid ${tokenInfo.lightest}`,
            bgcolor: tokenCommon.white,
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.22)',
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.75}}>
            <SparkleIcon sx={{fontSize: 17, color: tokenWarning.dark}} />
            <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenBrand.main}}>
              BLU.AI Insight
            </Typography>
          </Box>
          <Typography sx={{fontSize: 13, lineHeight: 1.35, color: workstationVisuals.tierTextHeading, mb: 1.15}}>
            Safety risk is trending up on Line 3. Serious injuries remain above target and repeated near-miss signals suggest a guard bypass pattern.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SparkleIcon sx={{fontSize: 16}} />}
            onClick={() => {
              setIsAiInsightOpen(false);
              onGenerateAiSafetyReport?.();
            }}
            sx={{
              height: 34,
              borderRadius: '8px',
              bgcolor: tokenBrand.main,
              boxShadow: 'none',
              color: tokenCommon.white,
              fontSize: 12.5,
              fontWeight: 900,
              textTransform: 'none',
              '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'},
            }}
          >
            Generate Report
          </Button>
        </Paper>
      ) : null}

      <Paper elevation={0} sx={{position: 'relative', minHeight: useTierCarousel ? 142 : 90, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, overflow: 'hidden', bgcolor: tokenCommon.white}}>
        <SafetyRibbon enlarged={useTierCarousel} onClick={openCalendarModal} />
      </Paper>

      {useTierCarousel ? (
        <>
          <MetricCarousel
            metrics={safetyMetrics}
            onMetricClick={(label) => label === 'Serious Injury' ? onOpenSeriousInjury?.() : undefined}
          />
          <LineOverview rows={safetyLineOverview} title={overviewLabel} itemPrefix={overviewItemPrefix} />
        </>
      ) : (
        <>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: '4.125rem', gap: 0.85}}>
            {tier1SafetyMetrics.slice(0, 4).map((metric) => {
              const visibleMetric = metric.label === 'Serious Injury' && !tier1SeriousInjuryIncidentActive
                ? tier1PendingSeriousInjuryMetric
                : metric;

              return (
                <MetricCard
                  key={metric.label}
                  {...visibleMetric}
                  onClick={metric.label === 'Serious Injury' ? onOpenSeriousInjury : undefined}
                  pulse={metric.label === 'Serious Injury' && tier1SeriousInjuryIncidentActive}
                  tierOneStyle
                />
              );
            })}
          </Box>

          <MetricCard {...tier1SafetyMetrics[4]} tierOneStyle />
        </>
      )}
      <WidgetNotificationsDialog
        active={notifications.active}
        config={safetyNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
      <Dialog
        open={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 'min(1014px, calc(100vw - 16px))',
            height: '525px',
            borderRadius: '8px',
            bgcolor: tokenCommon.white,
            border: `1px solid ${tokenNeutral.darker}`,
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.42)',
            overflow: 'hidden',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {bgcolor: 'rgba(9, 14, 31, 0.78)'},
          },
        }}
      >
        <DialogContent sx={{p: 0, height: '100%', overflow: 'hidden'}}>
          <Box sx={{position: 'relative', height: '100%', px: '39px', pt: '18px', pb: '28px'}}>
            <Typography sx={{fontSize: 20, lineHeight: 1.2, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>
              Safety Calendar
            </Typography>
            <IconButton
              onClick={() => setIsCalendarModalOpen(false)}
              size="small"
              sx={{position: 'absolute', right: 35, top: 17, width: 28, height: 28, color: tokenBrand.main}}
            >
              <OpenInFullIcon sx={{fontSize: 19}} />
            </IconButton>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(390px, 1fr) minmax(420px, 500px)',
                alignItems: 'start',
                height: 'calc(100% - 28px)',
                mt: '14px',
              }}
            >
              <Box
                onClick={() => setShowCalendarDayDetails(true)}
                sx={{
                  position: 'relative',
                  width: 455,
                  height: 404,
                  cursor: 'pointer',
                }}
              >
                <Box
                  component="img"
                  src="/images/S%20Safety.png"
                  alt="Safety calendar"
                  sx={{width: 455, height: 404, objectFit: 'contain', display: 'block'}}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 235,
                    top: 190,
                    width: 42,
                    height: 22,
                    bgcolor: day15Color,
                    color: tokenCommon.white,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                    lineHeight: 1,
                    border: `2px solid ${tokenCommon.white}`,
                    boxSizing: 'border-box',
                    clipPath: 'polygon(0 0, 100% 0, 86% 100%, 0% 100%)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.16)',
                  }}
                >
                  15
                </Box>
              </Box>

              {showCalendarDayDetails ? (
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 400,
                    mt: 1,
                    p: '14px 19px',
                    borderRadius: '10px',
                    border: `1px solid ${tokenNeutral.dark}`,
                    bgcolor: tokenNeutral.lightest,
                    overflow: 'hidden',
                  }}
                >
                  <Typography sx={{fontSize: 17, lineHeight: 1.2, fontWeight: 900, color: workstationVisuals.tierTextHeading, mb: '11px'}}>
                    Monday 15 / Day Shift Occurrences
                  </Typography>
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    {safetyDay15Occurrences.map((occurrence) => (
                      <OccurrenceRow key={`${occurrence.category}-${occurrence.description}`} occurrence={occurrence} />
                    ))}
                  </Box>
                  <TextField
                    select
                    label="Shift Status"
                    size="small"
                    value={day15Color}
                    onChange={(event) => setDay15Color(event.target.value)}
                    sx={{
                      width: '100%',
                      mt: '24px',
                      '& .MuiInputLabel-root': {
                        color: workstationVisuals.tierTextMeta,
                        fontSize: 13,
                        bgcolor: tokenNeutral.lightest,
                        px: 0.6,
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: workstationVisuals.tierTextMeta,
                      },
                      '& .MuiOutlinedInput-root': {
                        height: 56,
                        borderRadius: '7px',
                        bgcolor: tokenNeutral.lightest,
                        color: workstationVisuals.tierTextHeading,
                        fontSize: 16,
                        '& fieldset': {
                          borderColor: tokenNeutral.darker,
                        },
                        '&:hover fieldset': {
                          borderColor: tokenNeutral.darker,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: tokenNeutral.darker,
                          borderWidth: 1,
                        },
                      },
                    }}
                  >
                    {safetyDayColorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Paper>
              ) : (
                <Box sx={{height: '100%', display: 'grid', placeItems: 'center', pb: 28}}>
                  <Typography sx={{fontSize: 16, fontWeight: 800, color: workstationVisuals.tierTextLabel}}>
                    Select a shift/day at the left
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

function OccurrenceRow({occurrence}: {occurrence: typeof safetyDay15Occurrences[number]}) {
  const style = occurrenceToneStyles[occurrence.tone];
  const isEso = occurrence.tone === 'green';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: occurrence.tone === 'red' ? 61 : 45,
        pl: '45px',
        pr: 1.5,
        py: occurrence.tone === 'red' ? '6px' : '5px',
        borderRadius: '5px',
        bgcolor: style.bg,
        overflow: 'hidden',
      }}
    >
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: style.rail}} />
      <Box
        sx={{
          position: 'absolute',
          left: 17,
          top: '50%',
          transform: 'translateY(-50%)',
          color: style.icon,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {isEso ? <DiamondIcon sx={{fontSize: 20}} /> : <WarningIcon sx={{fontSize: 22}} />}
      </Box>
      <Typography sx={{fontSize: 11, lineHeight: 1.15, color: workstationVisuals.tierTextLabel, fontWeight: 500}}>
        {occurrence.category}
      </Typography>
      <Typography sx={{fontSize: 13.5, lineHeight: 1.15, color: workstationVisuals.textPrimary, fontWeight: 900}}>
        {occurrence.description}
      </Typography>
    </Box>
  );
}

function MetricCarousel({
  metrics,
  onMetricClick,
}: {
  metrics: typeof safetyMetrics;
  onMetricClick?: (label: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const metricPages = [
    metrics.slice(0, 2),
    metrics.slice(2, 4),
    metrics.slice(4, 5),
  ];
  const activeMetrics = metricPages[activeIndex] ?? metricPages[0];

  useEffect(() => {
    const rotateId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % metricPages.length);
    }, 3200);

    return () => window.clearInterval(rotateId);
  }, [metricPages.length]);

  return (
    <Box sx={{minWidth: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 0.45}}>
      <Box sx={{display: 'grid', gridTemplateColumns: activeMetrics.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 0.85, minWidth: 0}}>
        {activeMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            onClick={metric.label === 'Serious Injury' ? () => onMetricClick?.(metric.label) : undefined}
            tierOneStyle
          />
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 0.45}}>
        {metricPages.map((page, index) => (
          <Box
            key={page.map((metric) => metric.label).join('-')}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: index === activeIndex ? 14 : 5,
              height: 5,
              borderRadius: 999,
              bgcolor: index === activeIndex ? tokenBrand.light : tokenNeutral.dark,
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function LineOverview({rows, title, itemPrefix}: {rows: typeof safetyLineOverview; title: string; itemPrefix: string}) {
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', borderTop: `1px solid ${tokenNeutral.main}`, pt: 0.65}}>
      <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 950, mb: 0.45, textTransform: 'uppercase'}}>{title}</Typography>
      {rows.map((row, index) => <LineOverviewRow key={row.name} {...row} name={`${itemPrefix} ${index + 1}`} />)}
    </Box>
  );
}

function LineOverviewRow({delta, name, tone, trend, value}: typeof safetyLineOverview[number]) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '74px 62px 30px minmax(0, 1fr)', alignItems: 'center', minHeight: 27, gap: 0.55, borderTop: `1px solid ${tokenNeutral.main}`}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
        <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: tone}} />
        <Typography sx={{fontSize: 10.8, color: workstationVisuals.tierTextHeading, fontWeight: 800}} noWrap>{name}</Typography>
      </Box>
      <Typography sx={{fontSize: 10.8, color: workstationVisuals.tierTextHeading, fontWeight: 950}} noWrap>{value}</Typography>
      <Typography sx={{fontSize: 10, color: delta.startsWith('+') ? tokenError.dark : tokenSuccess.darker, fontWeight: 850}}>{delta}</Typography>
      <LineSparkline values={trend} color={tone} />
    </Box>
  );
}

function LineSparkline({color, values}: {color: string; values: number[]}) {
  const width = 74;
  const height = 20;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${3 + (1 - (value - min) / range) * (height - 6)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="20" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
