import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {IconButton} from '@mui/material';

type WidgetLetterTone = 'green' | 'red';

const toneMap: Record<WidgetLetterTone, string> = {
  green: tokenSuccess.dark,
  red: tokenError.dark,
};

export default function WidgetLetterBadge({
  defaultTone = 'green',
  letter,
}: {
  defaultTone?: WidgetLetterTone;
  letter: string;
}) {
  const [tone, setTone] = useState<WidgetLetterTone>(defaultTone);

  return (
    <IconButton
      aria-label={`Toggle ${letter} status`}
      onClick={() => setTone((current) => current === 'green' ? 'red' : 'green')}
      sx={{
        width: 'clamp(40px, 10cqw, 48px)',
        height: 'clamp(40px, 10cqw, 48px)',
        borderRadius: '50%',
        bgcolor: toneMap[tone],
        color: tokenCommon.white,
        display: 'grid',
        placeItems: 'center',
        fontSize: 'clamp(22px, 6cqw, 29px)',
        fontWeight: 900,
        flexShrink: 0,
        p: 0,
        '&:hover': {
          bgcolor: toneMap[tone],
        },
      }}
    >
      {letter}
    </IconButton>
  );
}
