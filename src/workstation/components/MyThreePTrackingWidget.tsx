import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {Box, ButtonBase, Typography} from '@mui/material';
import WidgetShell from './WidgetShell';

type ThreePKey = 'presence' | 'punctuality' | 'participation';

const threePItems: Array<{id: ThreePKey; label: string}> = [
  {id: 'presence', label: 'Presence'},
  {id: 'punctuality', label: 'Punctuality'},
  {id: 'participation', label: 'Participation'},
];

export default function MyThreePTrackingWidget() {
  const [redItems, setRedItems] = useState<Record<ThreePKey, boolean>>({
    presence: false,
    punctuality: false,
    participation: false,
  });

  const toggleItem = (itemId: ThreePKey) => {
    setRedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  };

  return (
    <WidgetShell
      title={
        <Typography
          sx={{
            fontSize: 'clamp(16px, 3.4cqw, 20px)',
            color: workstationVisuals.textPrimary,
            fontWeight: 800,
            fontFamily: workstationVisuals.fontFamily,
            lineHeight: 1,
          }}
        >
          3P Tracking
        </Typography>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 0.45,
            minHeight: 42,
          }}
        >
          {threePItems.map((item) => {
            const isRed = redItems[item.id];
            return (
              <ButtonBase
                key={item.id}
                onClick={() => toggleItem(item.id)}
                aria-pressed={isRed}
                aria-label={`${item.label} status`}
                sx={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                  minWidth: 0,
                  minHeight: 42,
                  px: 0.75,
                  py: 0.45,
                  borderRadius: 1,
                  bgcolor: isRed ? tokenError.dark : tokenSuccess.darker,
                  color: tokenCommon.white,
                  textAlign: 'left',
                  transition: 'background-color 140ms ease, transform 140ms ease',
                  '&:hover': {
                    bgcolor: isRed ? tokenError.darker : tokenSuccess.darkest,
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                <Typography sx={{fontSize: 21, fontWeight: 900, lineHeight: 0.86, color: 'inherit'}}>
                  P
                </Typography>
                <Typography sx={{fontSize: 11.5, fontWeight: 500, lineHeight: 1.05, color: 'inherit'}}>
                  {item.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </WidgetShell>
  );
}
