import {useState} from 'react';
import {Box, Chip, Dialog, DialogContent, Divider, List, ListItem, ListItemText, Typography} from '@mui/material';
import type {TierMeetingDailyTrackerConfig, TierMeetingDailyTrackerDayDetail} from '../types';

type CircularLaneCalendarProps = {
  tracker: TierMeetingDailyTrackerConfig;
};

const calendarPalette = {
  frame: '#F6F8FC',
  divider: '#D9E1EE',
  clear: '#4BE283',
  incident: '#FF4B57',
  active: '#2D6BFF',
  future: '#BFC9D8',
  center: '#FFFFFF',
  textDark: '#08111C',
  textLight: '#FFFFFF',
  futureText: '#55657C',
  centerBorder: '#D9E1EE',
  centerText: '#17356D',
  selectedStroke: '#17356D',
};

const viewBoxSize = 240;
const centerPoint = viewBoxSize / 2;
const outerRadius = 104;
const innerRadius = 58;
const labelRadius = 84;
const segmentStrokeWidth = 2;

function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function getDayState(day: number, tracker: TierMeetingDailyTrackerConfig) {
  if (day === tracker.activeDay) return 'active';
  if (tracker.incidentDays.includes(day)) return 'incident';
  if (day <= tracker.recordedThroughDay) return 'clear';
  return 'future';
}

function getDayStyles(state: ReturnType<typeof getDayState>) {
  if (state === 'active') {
    return {fill: calendarPalette.active, text: calendarPalette.textLight};
  }

  if (state === 'incident') {
    return {fill: calendarPalette.incident, text: calendarPalette.textDark};
  }

  if (state === 'clear') {
    return {fill: calendarPalette.clear, text: calendarPalette.textDark};
  }

  return {fill: calendarPalette.future, text: calendarPalette.futureText};
}

function getDayStateLabel(state: ReturnType<typeof getDayState>) {
  if (state === 'active') return 'Current day';
  if (state === 'incident') return 'Incident';
  if (state === 'clear') return 'Clear';
  return 'Future';
}

function getDayDetail(day: number, tracker: TierMeetingDailyTrackerConfig): TierMeetingDailyTrackerDayDetail {
  return tracker.details.find((detail) => detail.day === day) ?? {
    day,
    title: 'No detail available',
    summary: 'No additional note has been attached to this date yet.',
    notes: ['This day does not currently have expanded tracker notes.'],
  };
}

export default function CircularLaneCalendar({tracker}: CircularLaneCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const segmentAngle = 360 / tracker.totalDays;
  const selectedDetail = selectedDay ? getDayDetail(selectedDay, tracker) : null;
  const selectedState = selectedDay ? getDayState(selectedDay, tracker) : null;

  return (
    <>
      <Box
        aria-label={`${tracker.centerLabel} circular calendar`}
        sx={{
          width: '100%',
          maxWidth: 244,
          mx: 'auto',
          aspectRatio: '1 / 1',
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          role="img"
          aria-hidden="true"
          style={{display: 'block', width: '100%', height: '100%'}}
        >
          <circle cx={centerPoint} cy={centerPoint} r={118} fill={calendarPalette.frame} />

          {Array.from({length: tracker.totalDays}).map((_, index) => {
            const day = index + 1;
            const startAngle = -90 + (index * segmentAngle);
            const endAngle = startAngle + segmentAngle;
            const midAngle = startAngle + (segmentAngle / 2);
            const dayState = getDayState(day, tracker);
            const {fill, text} = getDayStyles(dayState);
            const labelPosition = polarToCartesian(centerPoint, centerPoint, labelRadius, midAngle);
            const isSelected = selectedDay === day || focusedDay === day;

            return (
              <g key={`${tracker.centerLabel}-day-${day}`}>
                <path
                  d={describeDonutSegment(centerPoint, centerPoint, outerRadius, innerRadius, startAngle, endAngle)}
                  fill={fill}
                  stroke={isSelected ? calendarPalette.selectedStroke : calendarPalette.divider}
                  strokeWidth={isSelected ? 3 : segmentStrokeWidth}
                  strokeLinejoin="round"
                  tabIndex={0}
                  role="button"
                  aria-label={`Open details for day ${day}`}
                  onClick={() => setSelectedDay(day)}
                  onFocus={() => setFocusedDay(day)}
                  onBlur={() => setFocusedDay((current) => (current === day ? null : current))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedDay(day);
                    }
                  }}
                  style={{cursor: 'pointer', outline: 'none'}}
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  fill={text}
                  fontSize={day >= 10 ? 11 : 12}
                  fontWeight={900}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${midAngle + 90} ${labelPosition.x} ${labelPosition.y})`}
                  style={{pointerEvents: 'none'}}
                >
                  {day}
                </text>
              </g>
            );
          })}

          <circle
            cx={centerPoint}
            cy={centerPoint}
            r={47}
            fill={calendarPalette.center}
            stroke={calendarPalette.centerBorder}
            strokeWidth={2}
          />
          <text
            x={centerPoint}
            y={centerPoint + 3}
            fill={calendarPalette.centerText}
            fontSize={48}
            fontWeight={900}
            textAnchor="middle"
            dominantBaseline="central"
            style={{pointerEvents: 'none'}}
          >
            {tracker.centerLabel}
          </text>
        </svg>
      </Box>

      <Dialog open={Boolean(selectedDetail)} onClose={() => setSelectedDay(null)} maxWidth="sm" fullWidth>
        <DialogContent sx={{p: 0}}>
          {selectedDetail && selectedState ? (
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Box sx={{p: 2.2, bgcolor: '#F6F8FC'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5}}>
                  <Box>
                    <Typography sx={{fontSize: '0.8rem', fontWeight: 800, color: '#55657C', letterSpacing: '0.08em'}}>
                      {tracker.centerLabel} CALENDAR DAY
                    </Typography>
                    <Typography sx={{fontSize: '1.6rem', fontWeight: 900, color: '#17356D', lineHeight: 1.05, mt: 0.4}}>
                      Day {selectedDetail.day}
                    </Typography>
                  </Box>
                  <Chip
                    label={getDayStateLabel(selectedState)}
                    sx={{
                      fontWeight: 800,
                      bgcolor: selectedState === 'incident'
                        ? '#FDECEC'
                        : selectedState === 'active'
                          ? '#E8F0FF'
                          : selectedState === 'clear'
                            ? '#EAF6EE'
                            : '#EEF2F7',
                      color: selectedState === 'incident'
                        ? '#C62839'
                        : selectedState === 'active'
                          ? '#044ED7'
                          : selectedState === 'clear'
                            ? '#1A7F37'
                            : '#55657C',
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{p: 2.2}}>
                <Typography sx={{fontSize: '1.05rem', fontWeight: 900, color: '#1F2366'}}>
                  {selectedDetail.title}
                </Typography>
                <Typography sx={{mt: 1, color: '#55657C', lineHeight: 1.5}}>
                  {selectedDetail.summary}
                </Typography>

                <List disablePadding sx={{mt: 1.5}}>
                  {selectedDetail.notes.map((note) => (
                    <ListItem key={note} disableGutters sx={{alignItems: 'flex-start', py: 0.55}}>
                      <ListItemText
                        primary={note}
                        primaryTypographyProps={{fontSize: '0.96rem', color: '#1F2366'}}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
