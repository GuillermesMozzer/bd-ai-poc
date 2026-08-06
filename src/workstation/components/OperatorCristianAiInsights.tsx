import {useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
  WbSunnyOutlined as SunIcon,
} from '@mui/icons-material';
import {tokenBrand, tokenInfo, tokenNeutral, tokenSuccess, tokenWarning, workstationVisuals} from '../theme';
import type {WorkstationLineSummary} from '../types';

type OperatorCristianAiInsightsProps = {
  currentUserName?: string;
  summary: WorkstationLineSummary;
};

function getFirstName(name?: string) {
  const trimmed = name?.trim();
  if (!trimmed || trimmed === 'Anonymous') return 'Cristian';
  return trimmed.split(/\s+/)[0] || 'Cristian';
}

export default function OperatorCristianAiInsights({currentUserName, summary}: OperatorCristianAiInsightsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const firstName = getFirstName(currentUserName);

  const insights = [
    {
      id: 'operator-greeting',
      tone: tokenWarning.main,
      icon: <SunIcon sx={{fontSize: 16, color: tokenWarning.main, flexShrink: 0}} />,
      text: `Good morning, ${firstName}.`,
    },
    {
      id: 'line-assignment',
      tone: tokenInfo.dark,
      icon: <InfoOutlinedIcon sx={{fontSize: 15, color: tokenInfo.dark, flexShrink: 0}} />,
      text: `You are assigned to ${summary.line} - Zone 2 / Z2-WC01 for this shift.`,
    },
    {
      id: 'current-product',
      tone: tokenSuccess.darker,
      icon: <InfoOutlinedIcon sx={{fontSize: 15, color: tokenSuccess.darker, flexShrink: 0}} />,
      text: `Currently running ${summary.product} on ${summary.workOrder}.`,
    },
  ] as const;

  useEffect(() => {
    if (!isOpen) {
      setVisibleLineCount(0);
      return undefined;
    }

    setVisibleLineCount(0);
    const timers = insights.map((_, index) => (
      window.setTimeout(() => {
        setVisibleLineCount(index + 1);
      }, 650 + index * 850)
    ));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isOpen, insights.length]);

  const isTyping = isOpen && visibleLineCount < insights.length;

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
          <SunIcon sx={{fontSize: 18, color: tokenWarning.main, flexShrink: 0}} />
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
          {insights.slice(0, visibleLineCount).map((insight) => (
            <Box
              key={insight.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                alignItems: 'center',
                gap: 0.85,
                px: 0.6,
                py: 0.38,
                minHeight: 28,
                borderRadius: '5px',
                bgcolor: 'transparent',
                border: '1px solid transparent',
              }}
            >
              {insight.icon}
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
                {insight.text}
              </Typography>
            </Box>
          ))}
          {isTyping ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                alignItems: 'center',
                gap: 0.85,
                px: 0.6,
                py: 0.38,
                minHeight: 28,
                borderRadius: '5px',
              }}
            >
              <Box
                sx={{
                  width: 15,
                  height: 15,
                  borderRadius: '999px',
                  border: `2px solid ${tokenBrand.selectedBg}`,
                  borderTopColor: tokenBrand.main,
                  animation: 'operatorBluAiTypingSpin 0.8s linear infinite',
                  '@keyframes operatorBluAiTypingSpin': {
                    to: {transform: 'rotate(360deg)'},
                  },
                }}
              />
              <Typography
                sx={{
                  minWidth: 0,
                  fontFamily: workstationVisuals.fontFamily,
                  fontSize: 12.2,
                  lineHeight: 1.35,
                  fontWeight: 600,
                  color: tokenBrand.main,
                }}
              >
                BLU.AI is typing...
              </Typography>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Paper>
  );
}
