import React, { useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { CheckCircle2, Send } from 'lucide-react';
import { appendAudit, getShipments, setShipments } from '../data/reactiveLogisticsDemo';
import { ct } from '../cockpit/cockpitTheme';

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
    <Box
      component="section"
      aria-labelledby="atlas-panel-heading"
      sx={{
        bgcolor: ct.bgCard,
        border: `1px solid ${ct.border}`,
        borderRadius: 2,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          borderBottom: `1px solid ${ct.border}`,
          pb: 1,
        }}
      >
        <Avatar
          sx={{
            bgcolor: ct.accent,
            width: 24,
            height: 24,
            fontSize: 10,
            color: ct.bg,
            fontWeight: 700,
          }}
        >
          AT
        </Avatar>
        <Typography
          id="atlas-panel-heading"
          component="h2"
          sx={{ color: ct.accent, fontWeight: 700, fontFamily: ct.font, fontSize: 13 }}
        >
          ATLAS.AI PRESCRIPTIVE LOGISTICS
        </Typography>
      </Box>

      <Box
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', mb: 2, pr: 0.5 }}
        role="log"
        aria-live="polite"
      >
        {messages.map((msg, idx) => {
          const isAction = msg.type === 'ACTION_REQUIRED';
          const isResolved = msg.type === 'RESOLVED';

          return (
            <Box key={msg.id ?? idx} sx={{ display: 'flex', gap: 1, alignSelf: 'flex-start', maxWidth: '95%' }}>
              <Avatar
                sx={{ bgcolor: ct.bgCardHover, width: 22, height: 22, fontSize: 9, color: ct.accent, fontWeight: 700 }}
                aria-hidden
              >
                AI
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: isAction ? ct.dangerSoft : isResolved ? ct.okSoft : ct.bgCardHover,
                  border: '1px solid',
                  borderColor: isAction
                    ? 'rgba(239, 68, 68, 0.2)'
                    : isResolved
                      ? 'rgba(34, 197, 94, 0.2)'
                      : ct.border,
                  color: ct.text,
                  borderRadius: 1.5,
                }}
              >
                <Typography
                  sx={{
                    display: 'block',
                    color: ct.accent,
                    fontWeight: 700,
                    mb: 0.5,
                    fontFamily: ct.mono,
                    fontSize: 10,
                  }}
                >
                  ATLAS.AI · {msg.time}
                </Typography>
                <Typography sx={{ fontSize: 12, lineHeight: 1.45, fontFamily: ct.font }}>
                  {isResolved ? (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0.75 }}>
                      <CheckCircle2 size={14} color={ct.ok} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
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
                      mt: 1.5,
                      height: 32,
                      fontSize: 11,
                      fontFamily: ct.mono,
                      textTransform: 'none',
                      bgcolor: ct.danger,
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' },
                    }}
                  >
                    {resolvingId === msg.id ? (
                      <CircularProgress size={12} sx={{ color: '#ffffff', mr: 1 }} />
                    ) : null}
                    RESOLVE REGULATORY LOCK (RE-SYNC XML)
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
            bgcolor: ct.bgCardHover,
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${ct.border}`,
            borderRadius: 1,
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', flexGrow: 1, fontSize: 12 }}>
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
            bgcolor: '#044ed7',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#033da6', boxShadow: 'none' },
          }}
        >
          <Send size={14} aria-hidden />
        </Button>
      </Box>
    </Box>
  );
};

export default AtlasAiPrescriptivePanel;
