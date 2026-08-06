import {useState} from 'react';
import type {ReactNode} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import {tokenBrand, tokenInfo, tokenNeutral, tokenWarning, workstationVisuals} from '../theme';
import type {WorkstationContextualizationTarget} from '../types';

const technicianInsights = [
  {
    id: 'overdue-work-orders',
    tone: tokenWarning.main,
    cta: 'Open My Work Orders',
    text: "You have 2 overdue work orders requiring attention before today's scheduled activities. Open My Work Orders and complete overdue tasks before starting new assignments.",
  },
  {
    id: 'highest-maintenance-risk',
    tone: tokenWarning.dark,
    cta: 'Review asset history',
    text: 'Syringe Assembly Machine SA-204 currently has the highest maintenance risk in your area. Review asset history and inspect the equipment before the next production run.',
  },
  {
    id: 'upcoming-preventive-maintenance',
    tone: tokenInfo.dark,
    cta: 'Review schedule',
    text: '3 preventive maintenance work orders are scheduled within the next 7 days and all required parts are already reserved in the tool crib. Review the schedule and confirm execution readiness.',
  },
  {
    id: 'aging-in-progress-work-order',
    tone: tokenBrand.main,
    cta: 'Complete WO 6548276',
    text: 'WO 6548276 has remained in progress for 2 days without completion. Complete the work order or document the reason for delay.',
  },
] as const;

type MaintenanceTechnicianAiInsightsProps = {
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
};

function ContextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      sx={{
        p: 0,
        m: 0,
        border: 0,
        bgcolor: 'transparent',
        color: tokenBrand.main,
        font: 'inherit',
        fontWeight: 700,
        textDecoration: 'underline',
        textDecorationThickness: '1px',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
        '&:hover': {
          color: tokenBrand.dark,
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function MaintenanceTechnicianAiInsights({onOpenContextualization}: MaintenanceTechnicianAiInsightsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const renderInsightText = (insight: (typeof technicianInsights)[number]) => {
    if (insight.id === 'highest-maintenance-risk') {
      return (
        <>
          <ContextLink onClick={() => onOpenContextualization?.('syringe-assembly-sa-204')}>
            Syringe Assembly Machine SA-204
          </ContextLink>
          {' currently has the highest maintenance risk in your area. Review asset history and inspect the equipment before the next production run.'}
        </>
      );
    }

    if (insight.id === 'aging-in-progress-work-order') {
      return (
        <>
          <ContextLink onClick={() => onOpenContextualization?.('conveyor-belt-c4')}>
            WO 6548276
          </ContextLink>
          {' has remained in progress for 2 days without completion. Complete the work order or document the reason for delay.'}
        </>
      );
    }

    return insight.text;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        bgcolor: tokenNeutral.lightest,
        border: `1px solid ${workstationVisuals.tierBorder}`,
        overflow: 'hidden',
        boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          minHeight: 34,
          px: 1.3,
          py: 0.65,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenWarning.main, flexShrink: 0}} />
          <Typography
            sx={{
              fontFamily: workstationVisuals.fontFamily,
              fontSize: 18,
              lineHeight: 1.1,
              fontWeight: 500,
              color: tokenBrand.main,
            }}
          >
            BLU.AI Insights
          </Typography>
        </Box>
        <Button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          endIcon={isOpen ? <ExpandLessIcon sx={{fontSize: 16}} /> : <ExpandMoreIcon sx={{fontSize: 16}} />}
          sx={{
            minWidth: 0,
            px: 0.7,
            py: 0.2,
            color: workstationVisuals.textSecondary,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'none',
            lineHeight: 1,
            '& .MuiButton-endIcon': {ml: 0.35},
          }}
        >
          {isOpen ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      {isOpen ? (
        <Box sx={{px: 1.3, pb: 1, display: 'grid', gap: 0.55}}>
          {technicianInsights.map((insight) => (
            <Box
              key={insight.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: {xs: 'auto minmax(0, 1fr)', md: 'auto minmax(0, 1fr) auto'},
                alignItems: 'center',
                gap: {xs: 0.75, md: 0.9},
                px: 0.6,
                py: 0.38,
                minHeight: 28,
                borderRadius: '5px',
                bgcolor: 'transparent',
                border: '1px solid transparent',
              }}
            >
              <InfoOutlinedIcon sx={{fontSize: 15, color: insight.tone, flexShrink: 0}} />
              <Typography
                sx={{
                  minWidth: 0,
                  fontFamily: workstationVisuals.fontFamily,
                  fontSize: 12.2,
                  lineHeight: 1.35,
                  fontWeight: 500,
                  color: workstationVisuals.textSecondary,
                }}
              >
                {renderInsightText(insight)}
              </Typography>
              <Button
                type="button"
                onClick={(event) => event.preventDefault()}
                sx={{
                  gridColumn: {xs: '2 / 3', md: 'auto'},
                  justifySelf: {xs: 'start', md: 'end'},
                  minWidth: 0,
                  px: 0.8,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: 'background.paper',
                  border: `1px solid ${tokenBrand.selectedBg}`,
                  color: tokenBrand.main,
                  fontSize: 11.5,
                  lineHeight: 1.15,
                  fontWeight: 800,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: tokenBrand.softBg,
                    borderColor: tokenBrand.selectedBg,
                  },
                }}
              >
                {insight.cta}
              </Button>
            </Box>
          ))}
        </Box>
      ) : null}
    </Paper>
  );
}
