import {Paper, Typography} from '@mui/material';
import type {PlanningException} from '../types';
import {ExceptionListItem, SectionHeader} from '../../ui/PlanningComponents';
import {planningCardSx} from '../../ui/planningTheme';

export default function ExceptionsPanel({exceptions}: {exceptions: PlanningException[]}) {
  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
      <SectionHeader eyebrow="Exceptions" title="Validation and capacity signals that need review" />
      {exceptions.length ? (
        <Paper elevation={0} sx={{display: 'grid', gap: 1.1, mt: 1.7, bgcolor: 'transparent', boxShadow: 'none', border: 0}}>
          {exceptions.map((exception) => (
            <ExceptionListItem
              key={exception.id}
              status={exception.severity}
              title={exception.product}
              context={`${exception.month}${exception.line ? ` • ${exception.line}` : ''}`}
              description={exception.reason}
              suggestedAction={exception.suggestedAction}
            />
          ))}
        </Paper>
      ) : (
        <Typography sx={{fontSize: 13.5, color: '#5B668A', mt: 1.5}}>
          No exceptions for the current filtered view.
        </Typography>
      )}
    </Paper>
  );
}
