import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachFileRounded as AttachFileIcon,
  GraphicEqRounded as AudioIcon,
  ImageOutlined as ImageIcon,
  InsertDriveFileOutlined as FileIcon,
  SendRounded as SendIcon,
} from '@mui/icons-material';
import { tokenBrand, tokenCommon, tokenDivider, tokenNeutral, tokenText, workstationVisuals } from '../../workstation/theme';

type QuickAction = {
  label: string;
  action: () => void;
};

type ComposerAttachmentKind = 'file' | 'image' | 'audio';

type ComposerAttachment = {
  id: string;
  kind: ComposerAttachmentKind;
  file: File;
};

interface AiAssistantComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  placeholder: string;
  quickActions?: QuickAction[];
  expandAction?: () => void;
  expandLabel?: string;
  dense?: boolean;
}

const attachmentAcceptMap: Record<ComposerAttachmentKind, string> = {
  file: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip,.json',
  image: 'image/*',
  audio: 'audio/*',
};

const attachmentLabelMap: Record<ComposerAttachmentKind, string> = {
  file: 'File',
  image: 'Image',
  audio: 'Audio',
};

export default function AiAssistantComposer({
  value,
  onChange,
  onSend,
  placeholder,
  quickActions = [],
  expandAction,
  expandLabel = 'Open full assistant',
  dense = false,
}: AiAssistantComposerProps) {
  const [attachments, setAttachments] = React.useState<ComposerAttachment[]>([]);
  const fileInputRefs = React.useRef<Record<ComposerAttachmentKind, HTMLInputElement | null>>({
    file: null,
    image: null,
    audio: null,
  });

  const addFiles = React.useCallback((kind: ComposerAttachmentKind, files: FileList | null) => {
    if (!files?.length) return;

    setAttachments((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({
        id: `${kind}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        kind,
        file,
      })),
    ]);
  }, []);

  const removeAttachment = React.useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const buildOutgoingMessage = React.useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) {
      return '';
    }

    if (!attachments.length) {
      return trimmed;
    }

    const attachmentLines = attachments.map((attachment) => (
      `${attachmentLabelMap[attachment.kind]}: ${attachment.file.name}`
    ));

    return [
      trimmed,
      trimmed ? '' : undefined,
      'Attachments:',
      ...attachmentLines,
    ].filter(Boolean).join('\n');
  }, [attachments, value]);

  const handleSend = React.useCallback(() => {
    const outgoing = buildOutgoingMessage();
    if (!outgoing) return;
    onSend(outgoing);
    setAttachments([]);
  }, [buildOutgoingMessage, onSend]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const openPicker = React.useCallback((kind: ComposerAttachmentKind) => {
    fileInputRefs.current[kind]?.click();
  }, []);

  return (
    <Box
      sx={{
        border: `1px solid ${tokenDivider}`,
        borderRadius: 3,
        bgcolor: tokenCommon.white,
        display: 'flex',
        flexDirection: 'column',
        gap: dense ? 1 : 1.2,
        p: dense ? 1.25 : 1.5,
      }}
    >
      {quickActions.length ? (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75}}>
          {quickActions.map((quickAction) => (
            <Chip
              key={quickAction.label}
              label={quickAction.label}
              onClick={quickAction.action}
              size="small"
              sx={{
                height: 26,
                borderRadius: 999,
                bgcolor: workstationVisuals.slateSurface,
                color: tokenText.secondary,
                border: `1px solid ${tokenDivider}`,
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
      ) : null}

      {attachments.length ? (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75}}>
          {attachments.map((attachment) => (
            <Chip
              key={attachment.id}
              label={`${attachmentLabelMap[attachment.kind]}: ${attachment.file.name}`}
              onDelete={() => removeAttachment(attachment.id)}
              size="small"
              sx={{
                maxWidth: '100%',
                height: 26,
                borderRadius: 999,
                bgcolor: tokenBrand.softBg,
                color: tokenBrand.main,
                border: `1px solid ${tokenBrand.selectedBg}`,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          ))}
        </Box>
      ) : null}

      <Box
        component="textarea"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={dense ? 2 : 3}
        sx={{
          width: '100%',
          resize: 'none',
          border: 'none',
          outline: 'none',
          font: 'inherit',
          color: tokenText.primary,
          backgroundColor: 'transparent',
          minHeight: dense ? 52 : 76,
          lineHeight: 1.55,
          '&::placeholder': {
            color: tokenText.disabled,
            opacity: 1,
          },
        }}
      />

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.15}}>
          <Tooltip title="Attach file">
            <IconButton size="small" onClick={() => openPicker('file')} sx={{color: tokenText.secondary}}>
              <AttachFileIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload image">
            <IconButton size="small" onClick={() => openPicker('image')} sx={{color: tokenText.secondary}}>
              <ImageIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload or record audio">
            <IconButton size="small" onClick={() => openPicker('audio')} sx={{color: tokenText.secondary}}>
              <AudioIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
          {expandAction ? (
            <Chip
              label={expandLabel}
              onClick={expandAction}
              size="small"
              variant="outlined"
              sx={{
                height: 28,
                borderRadius: 999,
                borderColor: tokenNeutral.main,
                color: tokenText.secondary,
                fontWeight: 600,
              }}
            />
          ) : null}
          <IconButton
            onClick={handleSend}
            sx={{
              width: dense ? 36 : 40,
              height: dense ? 36 : 40,
              borderRadius: 2.5,
              bgcolor: tokenBrand.main,
              color: tokenCommon.white,
              '&:hover': {
                bgcolor: tokenBrand.dark,
              },
            }}
          >
            <SendIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      {(['file', 'image', 'audio'] as ComposerAttachmentKind[]).map((kind) => (
        <input
          key={kind}
          ref={(node) => {
            fileInputRefs.current[kind] = node;
          }}
          type="file"
          hidden
          accept={attachmentAcceptMap[kind]}
          capture={kind === 'audio' ? 'user' : undefined}
          multiple
          onChange={(event) => {
            addFiles(kind, event.target.files);
            event.target.value = '';
          }}
        />
      ))}
    </Box>
  );
}
