import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export type OeeModuleView = 'timeline' | 'table';

const oeeHours = [
  {time: '06:00 AM', short: '06 AM', warning: true, selected: false, comments: 2},
  {time: '07:00 AM', short: '07 AM', warning: false, selected: false, comments: 2},
  {time: '08:00 AM', short: '08 AM', warning: true, selected: true, comments: 1},
  {time: '09:00 AM', short: '09 AM', warning: false, selected: false, comments: 0},
  {time: '10:00 AM', short: '10 AM', warning: false, selected: false, comments: 0},
  {time: '11:00 AM', short: '11 AM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '12:00 PM', short: '12 PM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '01:00 PM', short: '01 PM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '02:00 PM', short: '02 PM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '03:00 PM', short: '03 PM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '05:00 PM', short: '05 PM', warning: false, selected: false, disabled: true, comments: 0},
  {time: '06:00 PM', short: '06 PM', warning: false, selected: false, disabled: true, comments: 0},
];

const oeeComments = [
  {accent: '#FFC11F', text: 'Z5C30 worn out drive belt and broken slide for the prestop.', updated: false},
  {accent: '#0E2BAA', text: 'Identified damage hub coming from Track #3 and randomly from track #2. Issue c...', updated: true},
];

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid rgba(148,163,184,0.18)',
  bgcolor: '#FFFFFF',
  boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
};

export default function OeeModuleDrilldown({
  activeView,
  onClose,
  onViewChange,
}: {
  activeView: OeeModuleView;
  onClose: () => void;
  onViewChange: (view: OeeModuleView) => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <Box sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 1050,
      bgcolor: '#F7F9FC',
      pt: '52px',
      px: { xs: 1, md: 1.5, lg: 2 },
      pb: { xs: 1, md: 1.5, lg: 2 },
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Single content card — no separate header to preserve vertical space */}
      <Paper
        elevation={0}
        sx={{
          ...moduleCardSx,
          p: { xs: 1, md: 1.5, lg: 2 },
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          gap: { xs: 0.8, md: 1, lg: 1.2 },
          overflow: 'hidden',
        }}
      >
        <OeeModuleToolbar activeView={activeView} onViewChange={onViewChange} onClose={onClose} />
        {activeView === 'timeline' ? <OeeTimelineView /> : <OeeTableView />}
      </Paper>
    </Box>
  );
}



function OeeModuleToolbar({
  activeView,
  onViewChange,
  onClose,
}: {
  activeView: OeeModuleView;
  onViewChange: (view: OeeModuleView) => void;
  onClose: () => void;
}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: { xs: 0.8, md: 1, lg: 1.4 }, minWidth: 0, flexWrap: 'nowrap', overflow: 'hidden'}}>
      <OeeSelectBox eyebrow="Location" value="AFA10" />
      <OeeSelectBox eyebrow="Select date" value="MM/DD/YYYY" wide />
      <Typography sx={{fontSize: { xs: 13, lg: 15 }, color: '#2B2F34', flexShrink: 0}}>Filters</Typography>
      {['S', 'Q', 'D', 'C'].map((item, index) => (
        <Box
          key={item}
          sx={{
            width: { xs: 30, lg: 36 },
            height: { xs: 30, lg: 36 },
            borderRadius: '50%',
            bgcolor: index === 0 ? '#2265E8' : '#E2ECFF',
            color: index === 0 ? '#FFFFFF' : '#1C2530',
            display: 'grid',
            placeItems: 'center',
            fontSize: { xs: 12, lg: 14 },
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {item}
        </Box>
      ))}
      <Box sx={{width: 34, height: 20, borderRadius: 999, bgcolor: '#A5A8AD', position: 'relative', ml: { xs: 0.3, lg: 0.8 }, flexShrink: 0}}>
        <Box sx={{position: 'absolute', left: -1, top: 0, width: 20, height: 20, borderRadius: '50%', bgcolor: '#FFFFFF', boxShadow: '0 1px 5px rgba(10, 20, 40, 0.22)'}} />
      </Box>
      <Typography sx={{fontSize: { xs: 12, lg: 14 }, color: '#2B2F34', whiteSpace: 'nowrap', flexShrink: 0}}>Cumulative Metrics</Typography>
      <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: { xs: 0.5, lg: 1 }, flexShrink: 0}}>
        <OeeViewButton active={activeView === 'timeline'} label="TIMELINE VIEW" onClick={() => onViewChange('timeline')} />
        <OeeViewButton active={activeView === 'table'} label="TABLE VIEW" onClick={() => onViewChange('table')} />
        <Button sx={{height: { xs: 34, lg: 40 }, px: { xs: 1, lg: 1.8 }, border: '1px solid #7DA9FF', borderRadius: '10px', color: '#0D63FF', fontSize: { xs: 11, lg: 13 }, fontWeight: 800}}>
          REPORTS
        </Button>
        <IconButton
          onClick={onClose}
          sx={{ width: 32, height: 32, bgcolor: '#F1F5FF', color: '#0B61FF', '&:hover': { bgcolor: '#D9E6FF' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function OeeSelectBox({eyebrow, value, wide = false}: {eyebrow: string; value: string; wide?: boolean}) {
  return (
    <Box sx={{position: 'relative', width: wide ? { xs: 160, md: 200, lg: 260 } : { xs: 110, md: 150, lg: 200 }, height: { xs: 34, lg: 38 }, border: '1px solid #C9CDD2', borderRadius: '8px', px: 1.2, display: 'flex', alignItems: 'center', color: value.includes('/') ? '#9CA0A5' : '#2B2F34', flexShrink: 0}}>
      <Typography sx={{position: 'absolute', top: -8, left: 10, px: 0.4, bgcolor: '#FFFFFF', fontSize: 10, color: '#666C72'}}>{eyebrow}</Typography>
      <Typography sx={{fontSize: { xs: 12, lg: 14 }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{value}</Typography>
      <Typography sx={{ml: 'auto', fontSize: 11, color: '#6D737A', flexShrink: 0}}>{wide ? '[ ]' : 'v'}</Typography>
    </Box>
  );
}

function OeeViewButton({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        height: { xs: 34, lg: 40 },
        px: { xs: 1, lg: 1.4 },
        border: '1px solid #D0D3D8',
        borderRadius: 0,
        bgcolor: active ? '#E4E5E7' : '#FFFFFF',
        color: '#25282D',
        fontSize: { xs: 10, lg: 12 },
        fontWeight: 900,
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}
    >
      {label}
    </Button>
  );
}

function OeeTimelineView() {
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: { xs: 0.8, lg: 1.4 }}}>
      <Box sx={{display: 'flex', gap: { xs: 0.8, md: 1, lg: 1.4 }, overflowX: 'auto', pb: 0.4}}>
        {oeeHours.slice(0, 7).map((hour) => (
          <OeeTimelineCard key={hour.time} {...hour} />
        ))}
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: { xs: 0.4, lg: 0.8 }, border: '2px solid #B7BABF', borderRadius: '3px', px: { xs: 0.4, lg: 0.8 }, overflowX: 'auto', flexShrink: 0}}>
        {oeeHours.map((hour) => (
          <Box
            key={hour.short}
            sx={{
              minWidth: { xs: 70, sm: 90, md: 100, lg: 120 },
              flex: '1 0 auto',
              height: { xs: 38, lg: 46 },
              border: hour.selected ? '2px solid #2D75FF' : '1px solid #D7DBE0',
              bgcolor: hour.warning || hour.selected ? '#FFD0D6' : '#F2F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0.5, lg: 1.5 },
              color: hour.disabled ? '#A2A6AB' : '#22262A',
              fontSize: { xs: 13, md: 15, lg: 18 },
              fontWeight: 900,
            }}
          >
            {hour.short}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function OeeTimelineCard({
  comments,
  disabled,
  selected,
  time,
  warning,
}: {
  comments: number;
  disabled?: boolean;
  selected?: boolean;
  time: string;
  warning: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: { xs: 200, sm: 240, md: 270, lg: 300, xl: 328 },
        flex: '1 0 auto',
        height: '100%',
        borderRadius: '8px',
        border: selected ? '3px solid #2D75FF' : '1px solid #D7DBE0',
        bgcolor: disabled ? '#F3F4F5' : '#FFFFFF',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', px: 1.4, height: { xs: 40, lg: 48 }, bgcolor: warning || selected ? '#FBC2C8' : '#F7F8F9'}}>
        <Typography sx={{fontSize: { xs: 15, md: 17, lg: 20 }, fontWeight: 900, color: disabled ? '#9FA3A8' : '#1F2226'}}>{time}</Typography>
        <Typography sx={{ml: 'auto', fontSize: { xs: 22, lg: 28 }, color: '#0C5FFF', lineHeight: 1}}>+</Typography>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: '#63BA66', borderBottom: '1px solid #4E9E52', height: { xs: 48, lg: 58 }}}>
        <OeeMetricHeader title="SAFETY" subtitle="OEE: 87%" />
        <OeeMetricHeader title="QUALITY" subtitle="SCRAP TGT/ACT:  3% / 3%" />
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #D7DBE0', height: { xs: 48, lg: 58 }}}>
        <OeeMetricCell label="DLV PLND/ACT" value="5.666" danger={warning && !selected} />
        <OeeMetricCell label="CST PLND/ACT" value={warning ? '$300,000' : '$200,000'} danger={warning} />
      </Box>
      <Box sx={{p: { xs: 0.8, lg: 1.2 }, display: 'grid', alignContent: comments ? 'start' : 'center', gap: { xs: 0.6, lg: 0.8 }, overflowY: 'auto'}}>
        {comments ? (
          oeeComments.slice(0, comments).map((comment) => <OeeIncidentCard key={`${time}-${comment.accent}`} {...comment} />)
        ) : (
          <Typography sx={{textAlign: 'center', color: '#6B7076', fontSize: { xs: 13, lg: 15 }}}>No Major Incidents</Typography>
        )}
      </Box>
    </Paper>
  );
}

function OeeMetricHeader({subtitle, title}: {subtitle: string; title: string}) {
  return (
    <Box sx={{display: 'grid', placeItems: 'center', borderRight: '1px solid rgba(0,0,0,0.12)', color: '#07130A'}}>
      <Typography sx={{fontSize: 11, fontWeight: 600}}>{title}</Typography>
      <Typography sx={{fontSize: 11, fontWeight: 500}}>{subtitle}</Typography>
    </Box>
  );
}

function OeeMetricCell({danger, label, value}: {danger?: boolean; label: string; value: string}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 100px', alignItems: 'center', borderRight: '1px solid #D7DBE0'}}>
      <Typography sx={{fontSize: 12, textAlign: 'center', fontWeight: 400}}>{label}</Typography>
      <Box sx={{height: '100%', display: 'grid', placeItems: 'center', bgcolor: danger ? '#FA4039' : '#65BC68', color: danger ? '#FFFFFF' : '#07130A', fontSize: 14, fontWeight: 500}}>{value}</Box>
    </Box>
  );
}

function OeeIncidentCard({accent, text, updated}: {accent: string; text: string; updated?: boolean}) {
  return (
    <Box sx={{minHeight: { xs: 100, lg: 130 }, borderRadius: '5px', bgcolor: '#EEF3F6', display: 'grid', gridTemplateColumns: '28px 1fr', overflow: 'hidden'}}>
      <Box sx={{bgcolor: accent, display: 'grid', placeItems: 'center'}}>
        <Box sx={{width: 18, height: 18, borderRadius: '50%', bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900}}>S</Box>
      </Box>
      <Box sx={{p: { xs: 0.8, lg: 1.2 }}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Typography sx={{fontSize: 10, fontWeight: 900, color: '#2265E8'}}>PIN</Typography>
          <Typography sx={{fontSize: { xs: 11, lg: 13 }, fontWeight: 800}}>Z5 C3</Typography>
          <Box sx={{ml: 'auto', px: 0.8, py: 0.2, borderRadius: 999, bgcolor: '#60BD68', fontSize: 8, fontWeight: 900}}>RESOLVED</Box>
        </Box>
        <Typography sx={{fontSize: { xs: 12, lg: 13 }, lineHeight: 1.25, mt: 0.6}}>{text}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', mt: { xs: 0.8, lg: 1.2 }, gap: { xs: 1.5, lg: 2.4 }, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: { xs: 10, lg: 12 }}}>DT: <Box component="span" sx={{fontWeight: 500}}>60m</Box></Typography>
          <Typography sx={{fontSize: { xs: 10, lg: 12 }}}>Category: <Box component="span" sx={{fontWeight: 500}}>Short Stop</Box></Typography>
          {updated ? <Typography sx={{fontSize: { xs: 10, lg: 12 }, color: '#008DDA', fontWeight: 900}}>Updated</Typography> : null}
        </Box>
      </Box>
    </Box>
  );
}

function OeeTableView() {
  return (
    <Box sx={{minHeight: 0, overflow: 'auto', border: '1px solid #D7DBE0'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '78px 144px 110px 110px 68px minmax(640px, 1fr)', minWidth: 1260}}>
        <OeeTableHeader label="Time" center />
        <OeeTableHeader label="S    Q    D    C" center />
        <OeeTableHeader label="Delivery (Actual/Planned)" center />
        <OeeTableHeader label="Cost (Actual/Planned)" center />
        <OeeTableHeader label="Create" center />
        <OeeTableHeader label="Comments" />
        {oeeHours.slice(0, 10).map((hour, index) => (
          <OeeTableRow key={hour.time} hour={hour} index={index} />
        ))}
      </Box>
    </Box>
  );
}

function OeeTableHeader({center, label}: {center?: boolean; label: string}) {
  return (
    <Box sx={{height: 44, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'center', fontSize: 13, fontWeight: 900}}>
      {label}
    </Box>
  );
}

function OeeTableRow({
  hour,
  index,
}: {
  hour: (typeof oeeHours)[number];
  index: number;
}) {
  const muted = hour.disabled;
  const hasComments = index < 3;

  return (
    <>
      <Box sx={{height: 62, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', bgcolor: hour.warning ? '#FA4039' : '#FFFFFF', color: hour.warning ? '#FFFFFF' : muted ? '#A4A8AD' : '#2A2D31', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 900}}>
        {hour.short.replace(' ', '')}
      </Box>
      <Box sx={{height: 62, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
        {['S', 'Q', 'D', 'C'].map((status, statusIndex) => (
          <Box key={status} sx={{width: 20, height: 20, borderRadius: '50%', bgcolor: muted ? '#FFFFFF' : hour.warning && statusIndex === 3 ? '#F0443E' : '#60BD68', border: muted ? '2px solid #D8DBDF' : 'none', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900}}>
            {muted ? null : statusIndex === 3 && hour.warning ? '!' : (
              <Box sx={{width: 8, height: 5, borderLeft: '2px solid #FFFFFF', borderBottom: '2px solid #FFFFFF', transform: 'rotate(-45deg)', mt: -0.3}} />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{height: 62, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500}}>
        {muted ? '-    /    -' : <>5666 / <Box component="span" sx={{color: hour.warning ? '#FA4039' : '#111'}}>5666</Box></>}
      </Box>
      <Box sx={{height: 62, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500}}>
        {muted ? '-    /    -' : <>200 / <Box component="span" sx={{color: hour.warning ? '#FA4039' : '#111'}}>300</Box></>}
      </Box>
      <Box sx={{height: 62, borderRight: '1px solid #D7DBE0', borderBottom: '1px solid #D7DBE0', display: 'grid', placeItems: 'center', color: '#9AA0A6', fontSize: 28}}>+</Box>
      <Box sx={{height: 62, borderBottom: '1px solid #D7DBE0', display: 'flex', alignItems: 'center', gap: 1, px: 0.8, overflow: 'hidden'}}>
        {hasComments ? (
          <>
            <OeeTableComment accent="#FFC11F" />
            {index < 2 ? <OeeTableComment accent="#0E2BAA" /> : null}
          </>
        ) : (
          <Typography sx={{fontSize: 16, color: '#A0A4A9'}}>No comments</Typography>
        )}
      </Box>
    </>
  );
}

function OeeTableComment({accent}: {accent: string}) {
  return (
    <Box sx={{height: 52, minWidth: 610, border: '1px solid #D7DBE0', borderRadius: '4px', display: 'grid', gridTemplateColumns: '36px 1fr 24px', overflow: 'hidden', bgcolor: '#FFFFFF'}}>
      <Box sx={{bgcolor: accent, display: 'grid', placeItems: 'center'}}>
        <Box sx={{width: 20, height: 20, borderRadius: '50%', bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900}}>S</Box>
      </Box>
      <Box sx={{px: 1.1, display: 'grid', alignContent: 'center'}}>
        <Typography sx={{fontSize: 12, fontWeight: 500}}>Z5 C3 <Box component="span" sx={{fontWeight: 400, ml: 2}}>Downtime: <Box component="span" sx={{fontWeight: 500}}>60m</Box></Box></Typography>
        <Typography sx={{fontSize: 14}} noWrap>Identified damage hub coming from Track #3 and randomly from track #2. Issue c...</Typography>
      </Box>
      <Box sx={{display: 'grid', placeItems: 'center'}}>
        <Box sx={{width: 14, height: 14, borderRadius: '50%', bgcolor: '#60BD68', display: 'grid', placeItems: 'center'}}>
          <Box sx={{width: 7, height: 4, borderLeft: '2px solid #FFFFFF', borderBottom: '2px solid #FFFFFF', transform: 'rotate(-45deg)', mt: -0.2}} />
        </Box>
      </Box>
    </Box>
  );
}
