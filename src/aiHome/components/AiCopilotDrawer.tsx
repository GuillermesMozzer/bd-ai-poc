import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import {
  OpenInFull as ExpandIcon,
  Close as CloseIcon,
  AutoAwesome as SparkleIcon,
  ArrowForward as ArrowForwardIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { type AppScreen } from '../../navigation/navigationConfig';
import { type AiMessage } from '../types';
import AiAssistantComposer from './AiAssistantComposer';
import { tokenBrand, tokenCommon, tokenDivider, tokenText } from '../../workstation/theme';

interface AiCopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  currentScreen: AppScreen;
  openAiHome: () => void;
  aiMessages: AiMessage[];
  currentUserInitials: string;
  aiInput: string;
  setAiInput: (val: string) => void;
  handleAiSend: (text: string) => void;
  activeTheme: any;
  drawerHeaderIconButtonSx: any;
  isAiDrawerResizingRef: React.MutableRefObject<boolean>;
  aiDrawerWidth: number;
  lightDrawerPanelSx: any;
  aiProblemFilterInput: string;
  setAiProblemFilterInput: (value: string) => void;
  aiProblemFilter: string;
  setAiProblemFilter: (value: string) => void;
}

function TypingDots({color}: {color: string}) {
  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.45, minHeight: 16}}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: color,
            opacity: 0.35,
            animation: `aiTypingPulse 1.2s ease-in-out ${dot * 0.18}s infinite`,
            '@keyframes aiTypingPulse': {
              '0%, 100%': {opacity: 0.28, transform: 'translateY(0px)'},
              '50%': {opacity: 1, transform: 'translateY(-2px)'},
            },
          }}
        />
      ))}
    </Box>
  );
}

const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  open,
  onClose,
  currentScreen,
  openAiHome,
  aiMessages,
  aiInput,
  setAiInput,
  handleAiSend,
  activeTheme,
  drawerHeaderIconButtonSx,
  isAiDrawerResizingRef,
  aiDrawerWidth,
  lightDrawerPanelSx,
}) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [cardInputValues, setCardInputValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open || !scrollRef.current) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [aiMessages, open]);

  if (!open) return null;

  const isMaintenanceGuideMode = aiMessages.some((message) => message.badge === 'Maintenance guide');
  const isLogbookAssistantMode = aiMessages.some((message) => (
    message.badge === 'Logbook context'
    || Boolean((message as any).contextualTypingToken)
  ));
  const isPriorityAssistantMode = aiMessages.some((message) => (
    message.variant === 'priority_summary'
    || message.variant === 'priority_progress'
    || message.variant === 'priority_cards'
    || isMaintenanceGuideMode
    || message.badge === 'Operator onboarding'
    || isLogbookAssistantMode
    || (currentScreen === 'action_tracker' && (
      message.variant === 'typing'
      || message.actionLabel === 'Yes, prioritize for me'
      || message.text.toLowerCase().includes('priorit')
    ))
  ));
  const headerTitle = isPriorityAssistantMode
    ? isLogbookAssistantMode
      ? 'BD Atlas AI'
      : 'BD Atlas AI'
    : currentScreen === 'smart_search'
      ? 'BD Atlas AI Search Context'
      : 'BD Atlas AI Chat';
  const headerIsLight = isPriorityAssistantMode;
  const assistantLabel = 'BD Atlas AI';
  const buildDrawerMessageCopy = (message: AiMessage) => {
    const segments: string[] = [];

    if (message.heading && !message.text?.includes(message.heading)) {
      segments.push(message.heading);
    }

    if (message.text) {
      segments.push(message.text);
    }

    const progressTitle = (message as any).progressTitle as string | undefined;
    const progressDetail = (message as any).progressDetail as string | undefined;
    const progressItems = (message as any).progressItems as Array<{label: string; state?: string}> | undefined;

    if (progressTitle) {
      segments.push(progressTitle);
    }
    if (progressDetail) {
      segments.push(progressDetail);
    }
    if (progressItems?.length) {
      segments.push(progressItems.map((item) => `${item.state === 'done' ? 'Done' : item.state === 'active' ? 'In progress' : 'Pending'}: ${item.label}`).join('\n'));
    }
    if (message.priorityReasons?.length) {
      segments.push(message.priorityReasons.map((reason) => `${reason.label}: ${reason.detail}`).join('\n'));
    }
    if (message.priorityChanges?.length) {
      segments.push(message.priorityChanges.map((item) => `Applied: ${item}`).join('\n'));
    }

    return segments.filter(Boolean).join('\n\n');
  };
  const assistantBubbleSx = {
    position: 'relative' as const,
    border: `1px solid ${tokenDivider}`,
    borderRadius: '11px 11px 11px 3px',
    bgcolor: tokenCommon.white,
    textAlign: 'left' as const,
    boxShadow: '0 2px 8px rgba(15,23,42,0.035)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: -4,
      bottom: 8,
      width: 8,
      height: 8,
      bgcolor: tokenCommon.white,
      transform: 'rotate(45deg)',
      borderLeft: `1px solid ${tokenDivider}`,
      borderBottom: `1px solid ${tokenDivider}`,
    },
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 48,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: `${aiDrawerWidth}px` },
        zIndex: 1400,
        ...lightDrawerPanelSx,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${tokenDivider}`,
        bgcolor: tokenCommon.white,
        backgroundColor: tokenCommon.white,
        backgroundImage: 'none',
        opacity: 1,
        backdropFilter: 'none',
        boxShadow: 'none',
      }}
    >
      <Box
        onMouseDown={() => {
          isAiDrawerResizingRef.current = true;
        }}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          transform: 'translateX(-50%)',
          cursor: 'col-resize',
          zIndex: 4,
          display: { xs: 'none', sm: 'block' },
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 3,
            height: 56,
            borderRadius: 999,
            bgcolor: 'rgba(148,163,184,0.38)',
          },
          '&:hover::after': {
            bgcolor: 'rgba(37,99,235,0.56)',
          },
        }}
      />

      <Box
        sx={{
          px: 2.1,
          py: headerIsLight ? 1.15 : 2.2,
          minHeight: headerIsLight ? 68 : undefined,
          boxSizing: 'border-box',
          flexShrink: 0,
          color: tokenText.primary,
          background: tokenCommon.white,
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${tokenDivider}`,
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, minHeight: headerIsLight ? 44 : undefined }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
            <Box sx={{ width: 27, height: 27, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <SparkleIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography variant="h6" noWrap sx={{ color: tokenBrand.main, fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.15, minWidth: 0 }}>
              {headerTitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
            {currentScreen !== 'smart_search' ? (
              <IconButton
                onClick={openAiHome}
                size="small"
                sx={headerIsLight ? { color: tokenText.secondary, borderRadius: 2 } : drawerHeaderIconButtonSx}
              >
                <ExpandIcon fontSize="small" />
              </IconButton>
            ) : null}
            <IconButton
              onClick={onClose}
              size="small"
              sx={headerIsLight ? { color: tokenText.secondary, borderRadius: 2 } : drawerHeaderIconButtonSx}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1.5,
          py: 1.4,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: tokenCommon.white,
        }}
      >
        {aiMessages.map((message, index) => {
          const isAssistant = message.role === 'assistant';
          const isTyping = message.variant === 'typing';
          const messageCopy = buildDrawerMessageCopy(message);
          const priorityCards = message.priorityCards ?? [];
          const bulletItems = message.bulletItems ?? [];

          if (isLogbookAssistantMode) {
            const cards = message.priorityCards ?? [];
            const isQuickActions = message.variant === 'quick_actions' && Boolean(message.quickActions?.length);

            return (
              <Box key={`${message.role}-${message.variant ?? 'message'}-${index}`} sx={{ display: 'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end' }}>
                <Box sx={{ width: isAssistant ? '100%' : 'auto', maxWidth: isAssistant ? '100%' : '88%' }}>
                  {isTyping ? (
                    <Box sx={{ ...assistantBubbleSx, px: 1.1, py: 0.8 }}>
                      <TypingDots color="#2563EB" />
                    </Box>
                  ) : !isAssistant ? (
                    <Box>
                      <Typography
                        sx={{ position: 'relative', px: 1.25, py: 0.85, borderRadius: '11px 11px 3px 11px', bgcolor: tokenBrand.main, color: tokenCommon.white, fontSize: '0.78rem', lineHeight: 1.45, fontWeight: 600, textAlign: 'left', '&::after': { content: '""', position: 'absolute', right: -4, bottom: 7, width: 8, height: 8, bgcolor: tokenBrand.main, transform: 'rotate(45deg)' } }}
                      >
                        {message.text}
                      </Typography>
                      <Box sx={{ mt: 0.35, pr: 0.15, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.3 }}>
                        <Typography sx={{ color: tokenText.disabled, fontSize: '0.57rem', lineHeight: 1 }}>Now</Typography>
                        <DoneAllIcon sx={{ color: tokenBrand.main, fontSize: 13 }} />
                      </Box>
                    </Box>
                  ) : isQuickActions ? (
                    <Box sx={{ ...assistantBubbleSx, p: 1 }}>
                      {message.text ? (
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.45, mb: 0.85 }}>
                          {message.text}
                        </Typography>
                      ) : null}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
                        {message.quickActions?.map((quickAction) => (
                          <Button
                            key={quickAction.label}
                            size="small"
                            variant="outlined"
                            onClick={quickAction.action}
                            sx={{ minHeight: 32, maxWidth: '100%', px: 1, borderRadius: '7px', borderColor: tokenDivider, color: tokenBrand.main, bgcolor: tokenCommon.white, justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'none', fontSize: '0.68rem', lineHeight: 1.25, fontWeight: 700, '&:hover': { borderColor: tokenDivider, bgcolor: tokenBrand.softBg } }}
                          >
                            {quickAction.label}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  ) : cards.length ? (
                    <Box sx={{ ...assistantBubbleSx, p: 1 }}>
                      {message.heading ? (
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                          {message.heading}
                        </Typography>
                      ) : null}
                      {message.text ? (
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45, mt: message.heading ? 0.45 : 0 }}>
                          {message.text}
                        </Typography>
                      ) : null}
                      <Box sx={{ display: 'grid', gap: 0.55, mt: 0.8 }}>
                        {cards.map((card, cardIndex) => {
                          const accent = card.accent ?? (/critical|high|overdue|urgent/i.test(card.priority ?? '') ? '#EF4444' : '#2563EB');
                          const cardKey = card.id ?? `${card.title}-${cardIndex}`;
                          const cardRank = card.rank ?? cardIndex + 1;
                          const hasExecutionActions = Boolean(card.inputStepId || card.inputCode);
                          const hasInlineInput = Boolean(card.inputStepId && card.inputUnit);
                          const inputValue = cardInputValues[cardKey] ?? '';
                          const submitInlineInput = () => {
                            const trimmedValue = inputValue.trim();
                            if (!trimmedValue) return;
                            handleAiSend(`__execution_action__|record-value-complete|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}|${trimmedValue}|${card.inputUnit ?? ''}`);
                            setCardInputValues((current) => ({...current, [cardKey]: trimmedValue}));
                          };
                          return (
                            <Box
                              key={cardKey}
                              onClick={card.action}
                              onKeyDown={(event) => {
                                if (!card.action || (event.key !== 'Enter' && event.key !== ' ')) return;
                                event.preventDefault();
                                card.action();
                              }}
                              role={card.action ? 'button' : undefined}
                              tabIndex={card.action ? 0 : undefined}
                              sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                p: hasInlineInput ? 0.9 : 0.8,
                                pl: hasInlineInput ? 1.15 : 1,
                                border: `1px solid ${tokenDivider}`,
                                borderRadius: '7px',
                                bgcolor: tokenCommon.white,
                                cursor: card.action ? 'pointer' : 'default',
                                '&:hover': card.action ? {bgcolor: tokenBrand.softBg, borderColor: tokenDivider} : undefined,
                              }}
                            >
                              <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: hasInlineInput ? 4 : 3, bgcolor: accent }} />
                              <Box sx={{ display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr) auto', alignItems: 'start', gap: 0.6 }}>
                                <Box sx={{ width: 18, height: 18, borderRadius: '4px', border: `1px solid ${tokenDivider}`, color: tokenText.secondary, display: 'grid', placeItems: 'center', fontSize: '0.58rem', fontWeight: 800 }}>
                                  {cardRank}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.4 }}>
                                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.6rem', fontWeight: 700 }}>{card.signal}</Typography>
                                    {card.priority ? (
                                      <Box component="span" sx={{ px: 0.45, py: 0.08, borderRadius: 99, bgcolor: `${accent}14`, color: accent, fontSize: '0.52rem', lineHeight: 1.35, fontWeight: 800 }}>
                                        {card.priority}
                                      </Box>
                                    ) : null}
                                  </Box>
                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', lineHeight: 1.25, fontWeight: 800, mt: 0.15 }}>
                                    {card.title}
                                  </Typography>
                                  {hasInlineInput && card.rangeLabel ? (
                                    <Typography sx={{ color: tokenText.primary, fontSize: '0.62rem', lineHeight: 1.35, mt: 0.28, fontWeight: 900 }}>
                                      {card.rangeLabel}
                                    </Typography>
                                  ) : null}
                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.6rem', lineHeight: 1.35, mt: 0.18 }}>
                                    {card.detail}
                                  </Typography>
                                  {card.assignedTo ? (
                                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.56rem', mt: 0.35 }}>{card.assignedTo}</Typography>
                                  ) : null}
                                  {hasInlineInput || hasExecutionActions ? (
                                    <Box sx={{ mt: 0.75, display: 'grid', gap: 0.6 }}>
                                      {hasInlineInput ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                          <TextField
                                            size="small"
                                            value={inputValue}
                                            placeholder={card.inputPlaceholder ?? `Enter ${card.inputUnit}`}
                                            aria-label={card.inputLabel ?? `Enter ${card.inputUnit}`}
                                            onChange={(event) => {
                                              setCardInputValues((current) => ({...current, [cardKey]: event.target.value}));
                                            }}
                                            onKeyDown={(event) => {
                                              if (event.key === 'Enter') {
                                                event.preventDefault();
                                                submitInlineInput();
                                              }
                                            }}
                                            sx={{
                                              width: 138,
                                              '& .MuiInputBase-root': {
                                                height: 29,
                                                borderRadius: '9px',
                                                bgcolor: '#F8FAFC',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                              },
                                              '& .MuiInputBase-input': { py: 0.45 },
                                            }}
                                          />
                                          <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', fontWeight: 800 }}>
                                            {card.inputUnit}
                                          </Typography>
                                          {card.evidenceLabel ? (
                                            <Box component="span" sx={{ px: 0.6, py: 0.18, borderRadius: 99, bgcolor: '#FFF7ED', color: '#F97316', fontSize: '0.55rem', lineHeight: 1.25, fontWeight: 900 }}>
                                              {card.evidenceLabel}
                                            </Box>
                                          ) : null}
                                        </Box>
                                      ) : null}
                                      <Box sx={{ display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
                                        {[
                                          {label: 'Instructions', action: 'open-instructions', tone: 'default'},
                                          {label: 'Report Issue', action: 'report-issue', tone: 'danger'},
                                          {label: card.inputActionLabel ?? 'Complete', action: 'complete', tone: 'primary'},
                                          {label: 'Comment', action: 'prefill-comment', tone: 'default'},
                                        ].map((item) => (
                                          <Button
                                            key={`${card.id}-${item.action}`}
                                            size="small"
                                            variant={item.tone === 'primary' ? 'contained' : 'outlined'}
                                            disabled={item.action === 'complete' && hasInlineInput && !inputValue.trim()}
                                            onClick={() => {
                                              if (item.action === 'complete') {
                                                if (hasInlineInput) {
                                                  submitInlineInput();
                                                } else {
                                                  handleAiSend(`__execution_action__|complete-active|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}`);
                                                }
                                                return;
                                              }
                                              const action = item.action === 'prefill-comment' ? 'comment' : item.action;
                                              handleAiSend(`__execution_action__|${action}|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}`);
                                            }}
                                            sx={{
                                              minHeight: 29,
                                              px: 0.75,
                                              borderRadius: '7px',
                                              borderColor: item.tone === 'danger' ? '#FCA5A5' : item.tone === 'primary' ? accent : tokenBrand.main,
                                              color: item.tone === 'danger' ? '#DC2626' : item.tone === 'primary' ? tokenCommon.white : tokenBrand.main,
                                              bgcolor: item.tone === 'danger' ? '#FEF2F2' : item.tone === 'primary' ? accent : tokenCommon.white,
                                              boxShadow: 'none',
                                              textTransform: 'none',
                                              fontSize: '0.6rem',
                                              lineHeight: 1,
                                              fontWeight: 900,
                                              '&:hover': {
                                                borderColor: item.tone === 'danger' ? '#DC2626' : accent,
                                                bgcolor: item.tone === 'danger' ? '#FEF2F2' : item.tone === 'primary' ? accent : tokenBrand.softBg,
                                                boxShadow: 'none',
                                              },
                                            }}
                                          >
                                            {item.label}
                                          </Button>
                                        ))}
                                      </Box>
                                    </Box>
                                  ) : null}
                                </Box>
                                {card.dueDate ? (
                                  <Typography sx={{ color: accent, fontSize: '0.56rem', lineHeight: 1.2, fontWeight: 800, whiteSpace: 'nowrap', alignSelf: 'end' }}>
                                    {card.dueDate}
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ ...assistantBubbleSx, p: 1.05 }}>
                      {message.heading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.45 }}>
                          <SparkleIcon sx={{ color: '#2563EB', fontSize: 14 }} />
                          <Typography sx={{ color: '#2563EB', fontSize: '0.66rem', fontWeight: 800 }}>{message.heading}</Typography>
                        </Box>
                      ) : null}
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.73rem', lineHeight: 1.5, whiteSpace: 'pre-line', textAlign: 'left' }}>
                        {message.text}
                      </Typography>
                      {message.variant === 'action' ? (
                        <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} onClick={message.action} sx={{ mt: 0.7, px: 0, color: '#2563EB', textTransform: 'none', fontWeight: 800 }}>
                          {message.actionLabel}
                        </Button>
                      ) : null}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          }

          return (
            <Box key={`${message.role}-${message.variant ?? 'message'}-${index}`} sx={{ display: 'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end' }}>
              <Box
                sx={{
                  maxWidth: '88%',
                  px: 0,
                  py: 0,
                  borderRadius: 0,
                  bgcolor: 'transparent',
                  color: isAssistant ? tokenText.primary : tokenCommon.white,
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: isTyping ? 0.45 : 0.4, px: 0.15 }}>
                  <Typography variant="caption" sx={{ color: isAssistant ? tokenText.secondary : 'rgba(15,23,42,0.7)', fontWeight: 800 }}>
                    {isAssistant ? assistantLabel : 'You'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.disabled, fontWeight: 700 }}>
                    {isPriorityAssistantMode && isAssistant ? 'Working live' : 'Now'}
                  </Typography>
                </Box>

                {isTyping ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, px: 0.15, alignItems: isAssistant ? 'flex-start' : 'flex-end' }}>
                    <Box
                      sx={!isAssistant
                        ? {
                          px: 1.15,
                          py: 0.85,
                          borderRadius: '18px 18px 6px 18px',
                          bgcolor: activeTheme.primary,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }
                        : undefined}
                    >
                      <TypingDots color={isAssistant ? '#2563EB' : tokenCommon.white} />
                    </Box>
                  </Box>
                ) : (
                  <>
                    {messageCopy || bulletItems.length ? (
                      <Box
                        sx={{
                          bgcolor: isAssistant ? '#F8FAFC' : activeTheme.primary,
                          border: isAssistant ? `1px solid ${tokenDivider}` : 'none',
                          borderRadius: isAssistant ? '18px 18px 18px 6px' : '18px 18px 6px 18px',
                          px: 1.35,
                          py: 1,
                          textAlign: 'left',
                        }}
                      >
                        {messageCopy ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: isAssistant ? tokenText.primary : tokenCommon.white,
                              lineHeight: 1.6,
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {messageCopy}
                          </Typography>
                        ) : null}
                        {bulletItems.length ? (
                          <Box component="ul" sx={{ m: 0, mt: messageCopy ? 0.85 : 0, pl: 2.15, display: 'grid', gap: 0.55 }}>
                            {bulletItems.map((item) => (
                              <Box
                                key={`${item.label}-${item.value}`}
                                component="li"
                                sx={{
                                  color: item.accent ?? tokenBrand.main,
                                  pl: 0.1,
                                  '&::marker': {
                                    color: item.accent ?? tokenBrand.main,
                                  },
                                }}
                              >
                                <Typography component="span" sx={{ color: tokenText.primary, fontSize: '0.76rem', lineHeight: 1.42 }}>
                                  <Box component="span" sx={{ fontWeight: 800 }}>{item.label}:</Box>{' '}
                                  <Box component="span" sx={{ fontWeight: 800 }}>{item.value}</Box>
                                  {item.detail ? (
                                    <Box component="span" sx={{ color: tokenText.secondary, fontWeight: 400 }}>
                                      {' '}— {item.detail}
                                    </Box>
                                  ) : null}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : null}
                      </Box>
                    ) : null}

                    {priorityCards.length ? (
                      <Box sx={{ mt: messageCopy ? 0.75 : 0, display: 'grid', gap: 0.7 }}>
                        {priorityCards.map((card) => {
                          const accent = card.accent ?? (/critical|high|overdue|urgent|next/i.test(card.priority ?? '') ? '#F59E0B' : '#2563EB');
                          const hasExecutionActions = Boolean(card.inputStepId || card.inputCode);
                          const hasInlineInput = Boolean(card.inputStepId && card.inputUnit);
                          const inputValue = cardInputValues[card.id] ?? '';
                          const submitInlineInput = () => {
                            const trimmedValue = inputValue.trim();
                            if (!trimmedValue) return;
                            handleAiSend(`__execution_action__|record-value-complete|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}|${trimmedValue}|${card.inputUnit ?? ''}`);
                            setCardInputValues((current) => ({...current, [card.id]: trimmedValue}));
                          };
                          return (
                            <Box
                              key={card.id}
                              sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                p: hasInlineInput ? 0.85 : 0.95,
                                pl: hasInlineInput ? 1.2 : 1.15,
                                borderRadius: hasInlineInput ? '7px' : '14px',
                                border: `1px solid ${tokenDivider}`,
                                bgcolor: tokenCommon.white,
                                boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
                              }}
                            >
                              <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: accent }} />
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.85 }}>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.45, mb: 0.35 }}>
                                    <Box sx={{ width: 22, height: 22, borderRadius: '7px', bgcolor: `${accent}14`, color: accent, display: 'grid', placeItems: 'center', fontSize: '0.64rem', fontWeight: 900 }}>
                                      {card.rank}
                                    </Box>
                                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 800 }}>
                                      {card.signal}
                                    </Typography>
                                    {card.priority ? (
                                      <Box component="span" sx={{ px: 0.6, py: 0.15, borderRadius: 99, bgcolor: `${accent}14`, color: accent, fontSize: '0.56rem', lineHeight: 1.35, fontWeight: 900 }}>
                                        {card.priority}
                                      </Box>
                                    ) : null}
                                  </Box>
                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', lineHeight: 1.25, fontWeight: 900 }}>
                                    {card.title}
                                  </Typography>
                                  {hasInlineInput && card.rangeLabel ? (
                                    <Typography sx={{ color: tokenText.primary, fontSize: '0.66rem', lineHeight: 1.35, mt: 0.25, fontWeight: 900 }}>
                                      {card.rangeLabel}
                                    </Typography>
                                  ) : null}
                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', lineHeight: 1.4, mt: 0.32 }}>
                                    {card.detail}
                                  </Typography>
                                  {card.assignedTo ? (
                                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.58rem', lineHeight: 1.25, mt: 0.45, fontWeight: 700 }}>
                                      {card.assignedTo}
                                    </Typography>
                                  ) : null}
                                  {hasInlineInput || hasExecutionActions ? (
                                    <Box sx={{mt: 0.8, display: 'grid', gap: 0.65}}>
                                      {hasInlineInput ? (
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap'}}>
                                          <TextField
                                            size="small"
                                            value={inputValue}
                                            placeholder={card.inputPlaceholder ?? `Enter ${card.inputUnit}`}
                                            aria-label={card.inputLabel ?? `Enter ${card.inputUnit}`}
                                            onChange={(event) => {
                                              setCardInputValues((current) => ({...current, [card.id]: event.target.value}));
                                            }}
                                            onKeyDown={(event) => {
                                              if (event.key === 'Enter') {
                                                event.preventDefault();
                                                submitInlineInput();
                                              }
                                            }}
                                            sx={{
                                              width: 152,
                                              '& .MuiInputBase-root': {
                                                height: 30,
                                                borderRadius: '9px',
                                                bgcolor: '#F8FAFC',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                              },
                                              '& .MuiInputBase-input': {
                                                py: 0.5,
                                              },
                                            }}
                                          />
                                          <Typography sx={{color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800}}>
                                            {card.inputUnit}
                                          </Typography>
                                          {card.evidenceLabel ? (
                                            <Box component="span" sx={{ px: 0.65, py: 0.22, borderRadius: 99, bgcolor: '#FFF7ED', color: '#F97316', fontSize: '0.58rem', lineHeight: 1.25, fontWeight: 900 }}>
                                              {card.evidenceLabel}
                                            </Box>
                                          ) : null}
                                        </Box>
                                      ) : null}
                                      <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap'}}>
                                        {[
                                          {label: 'Instructions', action: 'open-instructions', tone: 'default'},
                                          {label: 'Report Issue', action: 'report-issue', tone: 'danger'},
                                          {label: card.inputActionLabel ?? 'Complete', action: 'complete', tone: 'primary'},
                                          {label: 'Comment', action: 'prefill-comment', tone: 'default'},
                                        ].map((item) => (
                                          <Button
                                            key={`${card.id}-${item.action}`}
                                            size="small"
                                            variant={item.tone === 'primary' ? 'contained' : 'outlined'}
                                            disabled={item.action === 'complete' && hasInlineInput && !inputValue.trim()}
                                            onClick={() => {
                                              if (item.action === 'complete') {
                                                if (hasInlineInput) {
                                                  submitInlineInput();
                                                } else {
                                                  handleAiSend(`__execution_action__|complete-active|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}`);
                                                }
                                                return;
                                              }
                                              const action = item.action === 'prefill-comment' ? 'comment' : item.action;
                                              handleAiSend(`__execution_action__|${action}|${card.inputStepId ?? ''}|${card.inputCode ?? card.title}`);
                                            }}
                                            sx={{
                                              minHeight: 30,
                                              px: 0.85,
                                              borderRadius: '7px',
                                              borderColor: item.tone === 'danger' ? '#FCA5A5' : item.tone === 'primary' ? accent : tokenBrand.main,
                                              color: item.tone === 'danger' ? '#DC2626' : item.tone === 'primary' ? tokenCommon.white : tokenBrand.main,
                                              bgcolor: item.tone === 'danger' ? '#FEF2F2' : item.tone === 'primary' ? accent : tokenCommon.white,
                                              boxShadow: 'none',
                                              textTransform: 'none',
                                              fontSize: '0.64rem',
                                              lineHeight: 1,
                                              fontWeight: 900,
                                              '&:hover': {
                                                borderColor: item.tone === 'danger' ? '#DC2626' : accent,
                                                bgcolor: item.tone === 'danger' ? '#FEF2F2' : item.tone === 'primary' ? accent : tokenBrand.softBg,
                                                boxShadow: 'none',
                                              },
                                            }}
                                          >
                                            {item.label}
                                          </Button>
                                        ))}
                                      </Box>
                                    </Box>
                                  ) : null}
                                </Box>
                                {card.dueDate ? (
                                  <Box sx={{ flexShrink: 0, px: 0.65, py: 0.35, borderRadius: '9px', bgcolor: '#F8FAFC', border: `1px solid ${tokenDivider}`, color: accent, fontSize: '0.58rem', lineHeight: 1.2, fontWeight: 900, whiteSpace: 'nowrap' }}>
                                    {card.dueDate}
                                  </Box>
                                ) : null}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : null}

                    {message.variant === 'quick_actions' && message.quickActions?.length ? (
                      <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
                        {message.quickActions.map((quickAction) => (
                          <Button
                            key={quickAction.label}
                            size="small"
                            variant="outlined"
                            onClick={quickAction.action}
                            sx={{
                              minHeight: 34,
                              maxWidth: '100%',
                              borderRadius: '8px',
                              borderColor: tokenDivider,
                              color: tokenBrand.main,
                              bgcolor: tokenCommon.white,
                              textTransform: 'none',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                              '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg },
                            }}
                          >
                            {quickAction.label}
                          </Button>
                        ))}
                      </Box>
                    ) : null}

                    {message.variant === 'action' ? (
                      <Box sx={{ display: 'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end', mt: 0.75 }}>
                        <Button
                          variant="contained"
                          onClick={message.action}
                          sx={{
                            minHeight: 36,
                            px: 1.4,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            bgcolor: message.accent ?? tokenBrand.main,
                            color: tokenBrand.contrast,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: message.accent ?? tokenBrand.dark,
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {message.actionLabel}
                        </Button>
                      </Box>
                    ) : null}
                  </>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 1.5, borderTop: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
        <AiAssistantComposer
          dense
          value={aiInput}
          onChange={setAiInput}
          onSend={handleAiSend}
          placeholder={isMaintenanceGuideMode
            ? 'Describe what is happening, or ask for help with the next field...'
            : isLogbookAssistantMode
              ? 'Ask about this live context, priority signals, or next best action...'
              : isPriorityAssistantMode
                ? 'Ask why an action moved, what changed, or who should act next...'
                : 'Ask BD Atlas AI anything about the current workstation...'}
        />
      </Box>
    </Box>
  );
};

export default AiCopilotDrawer;
