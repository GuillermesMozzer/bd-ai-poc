import { useCallback, useEffect, useMemo, useState } from 'react';
import { AutoAwesome as AutoAwesomeIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { tokenBrand, tokenCommon, tokenDivider, tokenText } from '../theme';
import {
  completeOperatorWorkstationTour,
  OPERATOR_WORKSTATION_TOUR_START_EVENT,
  operatorWorkstationTourSteps,
} from './operatorWorkstationOnboarding';

type TargetRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height'>;

const pulse = keyframes`
  0% { transform: scale(0.78); opacity: 0.95; }
  70% { transform: scale(1.7); opacity: 0; }
  100% { transform: scale(1.7); opacity: 0; }
`;

const typingBounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30% { transform: translateY(-4px); opacity: 1; }
`;

const targetSelector = (target: string) => `[data-workstation-tour-target="${target}"]`;

export default function OperatorWorkstationTour() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isStepTyping, setIsStepTyping] = useState(false);
  const step = activeStep === null ? null : operatorWorkstationTourSteps[activeStep];

  const measureTarget = useCallback(() => {
    if (!step) return;
    const element = document.querySelector<HTMLElement>(targetSelector(step.target));
    if (!element) {
      setTargetRect(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [step]);

  const findAvailableStep = useCallback((fromIndex: number, direction: 1 | -1) => {
    let index = fromIndex;
    while (index >= 0 && index < operatorWorkstationTourSteps.length) {
      if (document.querySelector(targetSelector(operatorWorkstationTourSteps[index].target))) return index;
      index += direction;
    }
    return null;
  }, []);

  useEffect(() => {
    const startTour = () => {
      const firstStep = findAvailableStep(0, 1);
      if (firstStep !== null) setActiveStep(firstStep);
    };
    window.addEventListener(OPERATOR_WORKSTATION_TOUR_START_EVENT, startTour);
    return () => window.removeEventListener(OPERATOR_WORKSTATION_TOUR_START_EVENT, startTour);
  }, [findAvailableStep]);

  useEffect(() => {
    if (!step) return undefined;
    setIsStepTyping(true);
    const typingTimer = window.setTimeout(() => setIsStepTyping(false), 650);
    const element = document.querySelector<HTMLElement>(targetSelector(step.target));
    element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const initialMeasure = window.setTimeout(measureTarget, 280);
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.clearTimeout(initialMeasure);
      window.clearTimeout(typingTimer);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget, step]);

  useEffect(() => {
    if (activeStep === null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveStep(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStep]);

  const cardPosition = useMemo(() => {
    if (!targetRect || typeof window === 'undefined') return { left: 16, top: 96 };
    const width = Math.min(360, window.innerWidth - 32);
    const left = Math.max(16, Math.min(targetRect.left, window.innerWidth - width - 16));
    const fitsBelow = targetRect.bottom + 224 < window.innerHeight;
    const top = fitsBelow
      ? targetRect.bottom + 18
      : Math.max(16, targetRect.top - 214);
    return { left, top };
  }, [targetRect]);

  if (activeStep === null || !step || !targetRect) return null;

  const goNext = () => {
    const nextStep = findAvailableStep(activeStep + 1, 1);
    if (nextStep === null) {
      setActiveStep(null);
      completeOperatorWorkstationTour();
      return;
    }
    setTargetRect(null);
    setActiveStep(nextStep);
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1600, pointerEvents: 'auto' }}>
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          left: Math.max(8, targetRect.left - 6),
          top: Math.max(8, targetRect.top - 6),
          width: Math.min(window.innerWidth - 16, targetRect.width + 12),
          height: Math.min(window.innerHeight - 16, targetRect.height + 12),
          border: `2px solid ${tokenBrand.light}`,
          borderRadius: '12px',
          boxShadow: `0 0 0 9999px color-mix(in srgb, ${tokenCommon.black} 68%, transparent), 0 0 0 4px color-mix(in srgb, ${tokenBrand.light} 22%, transparent), 0 0 28px color-mix(in srgb, ${tokenBrand.main} 42%, transparent)`,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: -7,
            top: -7,
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: tokenBrand.main,
            border: `3px solid ${tokenCommon.white}`,
            boxSizing: 'border-box',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -7,
              borderRadius: '50%',
              bgcolor: tokenBrand.light,
              animation: `${pulse} 1.8s ease-out infinite`,
              zIndex: -1,
            },
          }}
        />
      </Box>

      <Paper
        role="dialog"
        aria-modal="true"
        aria-label={`AI tour step ${activeStep + 1}: ${step.title}`}
        elevation={0}
        sx={{
          position: 'fixed',
          left: cardPosition.left,
          top: cardPosition.top,
          width: { xs: 'calc(100vw - 32px)', sm: 360 },
          maxWidth: 360,
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: tokenCommon.white,
          boxShadow: '0 0 6px -4px rgba(0,31,155,0.20), 0 0 8px rgba(0,31,155,0.14), 0 0 16px rgba(0,31,155,0.12)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: tokenBrand.main }} />
          <Typography sx={{ flex: 1, color: tokenBrand.main, fontSize: 14, fontWeight: 700 }}>AI Tour</Typography>
          <IconButton size="small" aria-label="Close AI tour" onClick={() => setActiveStep(null)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, py: 1.75 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: 16, lineHeight: 1.35, fontWeight: 700 }}>
            Step {activeStep + 1} of {operatorWorkstationTourSteps.length} — {step.title}
          </Typography>
          <Box sx={{ mt: 0.75, minHeight: 44, display: 'flex', alignItems: isStepTyping ? 'center' : 'flex-start' }}>
            {isStepTyping ? (
              <Box role="status" aria-label="My AI Assistant is typing" sx={{ display: 'flex', alignItems: 'center', gap: 0.55, py: 1 }}>
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: tokenBrand.main,
                      animation: `${typingBounce} 1s ease-in-out ${index * 140}ms infinite`,
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: tokenText.secondary, fontSize: 14, lineHeight: 1.5 }}>
                {step.body}
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 1.75, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button disabled={isStepTyping} variant="contained" onClick={goNext} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
              {findAvailableStep(activeStep + 1, 1) === null ? 'Finish' : 'Next'}
            </Button>
            <Button onClick={() => setActiveStep(null)} sx={{ borderRadius: '8px', textTransform: 'none', color: tokenText.secondary, fontWeight: 600 }}>
              Skip tour
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
