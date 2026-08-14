import React, { useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CheckCircle2, Send } from 'lucide-react';
import { appendAudit, getShipments, setShipments } from '../data/reactiveLogisticsDemo';
import { useCtV2Filters } from '../ctV2/CtV2FiltersContext';
import {
  ctV2Type,
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  workstationTierCardSx,
  workstationVisuals,
} from '../ctV2Theme';

type MessageType = 'INFO' | 'ACTION_REQUIRED' | 'RESOLVED';

type ChatMessage = {
  sender: string;
  text: string;
  time: string;
  type: MessageType;
  id?: string;
};

export type AtlasAiPrescriptivePanelProps = {
  onToast?: (message: string) => void;
};

export const AtlasAiPrescriptivePanel: React.FC<AtlasAiPrescriptivePanelProps> = ({ onToast }) => {
  const { sitesLabel, periodLabel } = useCtV2Filters();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ATLAS.AI',
      text: 'Good morning! Active logistics audit is running. Outbound Shipment Querétaro (SHIP-QRO-15) is locked because Sterilization validation is pending. Dra. Alejandra must sign the E-Signature release for LOT-A-114.',
      time: '12:00 PM',
      type: 'INFO',
    },
    {
      sender: 'ATLAS.AI',
      text: 'CRITICAL EVENT: Outbound Shipment Reno (SHIP-RNO-08) is blocked on Dock 15 due to a Customs XML validation failure. I have mapped the schema and verified the mismatch is a missing transaction hash from SAP.',
      time: '12:10 PM',
      type: 'ACTION_REQUIRED',
      id: 'MSG-02',
    },
  ]);

  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolveAction = (msgId: string) => {
    setResolvingId(msgId);
    window.setTimeout(() => {
      const shipments = getShipments();
      setShipments(
        shipments.map((s) =>
          s.id === 'SHIP-RNO-08'
            ? {
                ...s,
                status: s.status === 'BLOCKED' ? 'READINESS_CHECK' : s.status,
                checks: { ...s.checks, customsClearance: 'GREEN' },
              }
            : s,
        ),
      );
      appendAudit({
        actor: 'ATLAS.AI',
        action: 'CUSTOMS_XML_RESYNC',
        entityId: 'SHIP-RNO-08',
        contract: 'DA',
        detail: 'Prescriptive RE-SYNC XML unlocked Reno customs gate',
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                text: 'Customs XML validated and synchronized in SAP. Reno (SHIP-RNO-08) check is now GREEN. The physical gate is unlocked.',
                type: 'RESOLVED' as const,
              }
            : msg,
        ),
      );
      setResolvingId(null);
      onToast?.('SHIP-RNO-08 customs gate unlocked — XML re-sync complete.');
    }, 2000);
  };

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="atlas-panel-heading"
      sx={{
        ...workstationTierCardSx,
        p: 1.6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
          borderBottom: `1px solid ${tokenDivider}`,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 27,
            height: 27,
            borderRadius: '8px',
            bgcolor: tokenBrand.softBg,
            color: tokenBrand.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16 }} aria-hidden />
        </Box>
        <Typography
          id="atlas-panel-heading"
          component="h2"
          sx={{ ...ctV2Type.sectionTitle, color: tokenBrand.main, fontWeight: 800 }}
        >
          ATLAS.AI Prescriptive Logistics
        </Typography>
      </Box>
      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mb: 1 }}>
        Scope: {sitesLabel} · {periodLabel}
      </Typography>

      <Box
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', mb: 1.5, pr: 0.5 }}
        role="log"
        aria-live="polite"
      >
        {messages.map((msg, idx) => {
          const isAction = msg.type === 'ACTION_REQUIRED';
          const isResolved = msg.type === 'RESOLVED';

          return (
            <Box key={msg.id ?? idx} sx={{ display: 'flex', gap: 1, alignSelf: 'flex-start', maxWidth: '96%' }}>
              <Avatar
                sx={{
                  bgcolor: tokenBrand.softBg,
                  width: 22,
                  height: 22,
                  fontSize: 9,
                  color: tokenBrand.main,
                  fontWeight: 800,
                }}
                aria-hidden
              >
                AI
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.35,
                  bgcolor: isAction
                    ? tokenError.softBg
                    : isResolved
                      ? tokenSuccess.softBg
                      : 'background.paper',
                  border: '1px solid',
                  borderColor: isAction
                    ? tokenError.lighter
                    : isResolved
                      ? tokenSuccess.lighter
                      : tokenDivider,
                  color: tokenText.primary,
                  borderRadius: '11px 11px 11px 3px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Typography
                  sx={{
                    display: 'block',
                    color: tokenBrand.main,
                    fontWeight: 800,
                    mb: 0.5,
                    fontSize: 11,
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  ATLAS.AI · {msg.time}
                </Typography>
                <Typography sx={{ ...ctV2Type.caption, fontSize: 12, lineHeight: 1.45, color: tokenText.primary, fontWeight: 600 }}>
                  {isResolved ? (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0.75 }}>
                      <CheckCircle2 size={14} color="currentColor" style={{ color: 'var(--token-success-main)', marginTop: 2, flexShrink: 0 }} aria-hidden />
                      <span>{msg.text}</span>
                    </Box>
                  ) : (
                    msg.text
                  )}
                </Typography>

                {isAction && msg.id && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={resolvingId !== null}
                    onClick={() => handleResolveAction(msg.id!)}
                    aria-label="Resolve customs gate and re-sync XML"
                    sx={{
                      mt: 1.35,
                      height: 32,
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: workstationVisuals.fontFamily,
                      textTransform: 'none',
                      borderRadius: 999,
                      bgcolor: tokenError.main,
                      color: tokenCommon.white,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: tokenError.dark, boxShadow: 'none' },
                    }}
                  >
                    {resolvingId === msg.id ? (
                      <CircularProgress size={12} sx={{ color: tokenCommon.white, mr: 1 }} />
                    ) : null}
                    Resolve Regulatory Lock (Re-Sync XML)
                  </Button>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            px: 1.5,
            py: 1,
            bgcolor: tokenNeutral.lightest,
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${tokenDivider}`,
            borderRadius: 1.5,
          }}
        >
          <Typography sx={{ color: tokenText.disabled, flexGrow: 1, fontSize: 12, fontWeight: 600 }}>
            Ask ATLAS.AI to optimize queues...
          </Typography>
        </Paper>
        <Button
          variant="contained"
          aria-label="Send message"
          sx={{
            minWidth: 40,
            width: 40,
            height: 36,
            p: 0,
            bgcolor: tokenBrand.main,
            borderRadius: 1.5,
            boxShadow: 'none',
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          <Send size={14} aria-hidden />
        </Button>
      </Box>
    </Paper>
  );
};

export default AtlasAiPrescriptivePanel;
