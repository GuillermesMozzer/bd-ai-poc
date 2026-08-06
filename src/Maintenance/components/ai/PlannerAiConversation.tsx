import { useState } from 'react';
import { AutoAwesome as SparkleIcon, Send as SendIcon } from '@mui/icons-material';
import { Box, Button, Chip, Paper, TextField, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenNeutral, tokenText } from '../../../workstation/theme';
import type { PlannerAiAssistantMessage, PlannerAiQuickPrompt } from '../../ai/types';

type PlannerAiConversationProps = {
  messages: PlannerAiAssistantMessage[];
  quickPrompts: PlannerAiQuickPrompt[];
  isLoading: boolean;
  onSendMessage: (message: string) => void | Promise<void>;
  onRunQuickPrompt: (prompt: PlannerAiQuickPrompt) => void | Promise<void>;
  placeholder: string;
};

export function PlannerAiConversation({
  messages,
  quickPrompts,
  isLoading,
  onSendMessage,
  onRunQuickPrompt,
  placeholder,
}: PlannerAiConversationProps) {
  const [draftMessage, setDraftMessage] = useState('');

  const handleSubmit = () => {
    const nextMessage = draftMessage.trim();
    if (!nextMessage) {
      return;
    }

    void onSendMessage(nextMessage);
    setDraftMessage('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ mt: 0.5, display: 'grid', gap: 0.75 }}>
        {messages.map((message) => {
          const isAssistant = message.role === 'assistant';
          return (
            <Box
              key={message.id}
              sx={{
                justifySelf: isAssistant ? 'stretch' : 'end',
                maxWidth: isAssistant ? '100%' : '92%',
                p: 1,
                borderRadius: '12px',
                bgcolor: isAssistant ? tokenNeutral.lightest : 'rgba(4,78,215,0.08)',
                border: `1px solid ${isAssistant ? tokenDivider : '#BFDBFE'}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.35 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {isAssistant ? 'BLU.AI Copilot' : 'Planner'}
                </Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem' }}>{message.timestampLabel}</Typography>
              </Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.73rem', lineHeight: 1.5 }}>
                {message.content}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 0.5, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        {quickPrompts.map((prompt) => (
          <Chip
            key={prompt.id}
            label={prompt.label}
            onClick={() => void onRunQuickPrompt(prompt)}
            clickable
            sx={{
              height: 24,
              borderRadius: 99,
              bgcolor: '#EFF6FF',
              color: tokenBrand.main,
              border: '1px solid #BFDBFE',
              fontWeight: 700,
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 0.6, display: 'flex', gap: 0.8, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          size="small"
          value={draftMessage}
          placeholder={placeholder}
          onChange={(event) => setDraftMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          multiline
          maxRows={3}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !draftMessage.trim()}
          startIcon={<SendIcon />}
          sx={{
            minHeight: 40,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
            bgcolor: tokenBrand.main,
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
}
