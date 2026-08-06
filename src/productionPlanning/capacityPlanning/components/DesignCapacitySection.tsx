import type {ReactNode} from 'react';
import {Box, ButtonBase, Chip, Stack, Typography} from '@mui/material';
import {Lock as LockIcon, Speed as RateIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {LineDesignCapacity} from '../types';

type Props = {
  design: LineDesignCapacity;
  onOpenAvailableTime?: () => void;
};

function Row({label, value, highlight}: {label: string; value: string | number; highlight?: boolean}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        px: 1.5,
        py: 0.75,
        borderBottom: `1px solid ${planningTokens.border}`,
        '&:last-child': {borderBottom: 'none'},
        ...(highlight && {bgcolor: '#F0F9FF'}),
      }}
    >
      <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{label}</Typography>
      <Typography sx={{fontSize: 12, fontWeight: 600, color: highlight ? planningTokens.primaryBlue : planningTokens.textPrimary, textAlign: 'right'}}>
        {value}
      </Typography>
    </Box>
  );
}

function SectionLabel({icon, label, onClick}: {icon: ReactNode; label: string; onClick?: () => void}) {
  const content = (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      {icon}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: onClick ? planningTokens.primaryBlue : planningTokens.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          textDecoration: onClick ? 'underline' : 'none',
          textUnderlineOffset: onClick ? '2px' : undefined,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{px: 1.5, py: 0.75, bgcolor: 'var(--planning-surface-muted)', borderBottom: `1px solid ${planningTokens.border}`}}>
      {onClick ? (
        <ButtonBase
          onClick={onClick}
          sx={{
            borderRadius: 1,
            justifyContent: 'flex-start',
            cursor: 'pointer',
            '&:hover': {opacity: 0.85},
          }}
        >
          {content}
        </ButtonBase>
      ) : content}
    </Box>
  );
}

export default function DesignCapacitySection({design, onOpenAvailableTime}: Props) {
  const effectiveDesignHrs = Math.round(design.designHrsPerMonth * (design.nominalOeePct / 100));
  const designRateCapacity = design.designHrsPerMonth * design.designRatePerHr;
  const capacityAtOee = effectiveDesignHrs * design.designRatePerHr;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{mb: 1}}>
        <LockIcon sx={{fontSize: 14, color: planningTokens.textMuted}} />
        <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textSecondary}}>
          Engineering Design Reference
        </Typography>
        <Chip
          label="Read-only"
          size="small"
          sx={{fontSize: 10, height: 18, bgcolor: 'var(--planning-surface-muted)', color: planningTokens.textMuted, border: `1px solid ${planningTokens.border}`}}
        />
      </Stack>

      <Box sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden'}}>
        {/* Time parameters */}
        <SectionLabel
          icon={<LockIcon sx={{fontSize: 11, color: planningTokens.textMuted}} />}
          label="Available Time"
          onClick={onOpenAvailableTime}
        />
        <Row label="Design Capacity (hrs/month)" value={design.designHrsPerMonth.toLocaleString()} />
        <Row label="Shifts per Day" value={design.designShiftsPerDay} />
        <Row label="Days per Week" value={design.designDaysPerWeek} />
        <Row label="Hours per Shift" value={design.designHrsPerShift} />
        <Row label="Nominal OEE" value={`${design.nominalOeePct}%`} />
        <Row label="Effective Hrs at OEE (hrs/month)" value={effectiveDesignHrs.toLocaleString()} />

        {/* Rate & output capacity */}
        <SectionLabel icon={<RateIcon sx={{fontSize: 11, color: planningTokens.primaryBlue}} />} label="Production Rate & Capacity" />
        <Row label={`Design Rate (${design.rateUnit})`} value={design.designRatePerHr.toLocaleString()} />
        <Row
          label="Design Rate Capacity (pcs/month)"
          value={`${(designRateCapacity / 1_000_000).toFixed(2)}M`}
        />
        <Row
          label="Capacity at OEE (pcs/month)"
          value={`${(capacityAtOee / 1_000_000).toFixed(2)}M`}
          highlight
        />
      </Box>

      <Typography sx={{fontSize: 10, color: planningTokens.textMuted, mt: 0.75, fontStyle: 'italic'}}>
        Capacity = available time × production rate. Actual output depends on product-specific run rates.
      </Typography>
    </Box>
  );
}
