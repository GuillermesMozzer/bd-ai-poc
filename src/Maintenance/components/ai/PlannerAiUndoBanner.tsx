import { Alert, Button } from '@mui/material';

type PlannerAiUndoBannerProps = {
  changeLabel: string;
  capturedAt: string;
  onUndo: () => void;
};

export function PlannerAiUndoBanner({ changeLabel, capturedAt, onUndo }: PlannerAiUndoBannerProps) {
  return (
    <Alert
      severity="success"
      action={
        <Button color="inherit" size="small" onClick={onUndo} sx={{ fontWeight: 800, textTransform: 'none' }}>
          Undo
        </Button>
      }
      sx={{ alignItems: 'center' }}
      role="status"
      aria-live="polite"
    >
      {changeLabel} applied at {capturedAt}. You can revert the last propagated change.
    </Alert>
  );
}
