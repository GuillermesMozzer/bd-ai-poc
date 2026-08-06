import {useState, type ChangeEvent, type MouseEvent, type TouchEvent} from 'react';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  EditOutlined as EditIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignRight as AlignRightIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  Remove as RemoveIcon,
  VerticalAlignBottom as VerticalAlignBottomIcon,
  VerticalAlignCenter as VerticalAlignCenterIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
} from '@mui/icons-material';
import type {TextBoxWidgetPreferences} from '../types';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';

const designSystemFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
const fontSizes: TextBoxWidgetPreferences['fontSize'][] = [12, 14, 16, 20, 24, 34];

const textBoxTypographyMap: Record<TextBoxWidgetPreferences['fontSize'], {lineHeight: number; letterSpacing: string}> = {
  12: {lineHeight: 1.3, letterSpacing: '0px'},
  14: {lineHeight: 1.43, letterSpacing: '0.17px'},
  16: {lineHeight: 1.5, letterSpacing: '0.15px'},
  20: {lineHeight: 1.6, letterSpacing: '0.15px'},
  24: {lineHeight: 1.334, letterSpacing: '0px'},
  34: {lineHeight: 1.235, letterSpacing: '0.25px'},
};

export const defaultTextBoxPreferences: TextBoxWidgetPreferences = {
  content: '',
  backgroundTone: 'white',
  textTone: 'primary',
  fontSize: 16,
  bold: false,
  italic: false,
  underline: false,
  align: 'left',
  verticalAlign: 'top',
};

const backgroundToneMap: Record<TextBoxWidgetPreferences['backgroundTone'], string> = {
  white: tokenCommon.white,
  neutral: tokenNeutral.lightest,
  brand: tokenBrand.softBg,
  success: tokenSuccess.softBg,
  warning: tokenWarning.softBg,
  error: tokenError.softBg,
};

const textToneMap: Record<TextBoxWidgetPreferences['textTone'], string> = {
  primary: tokenText.primary,
  secondary: tokenText.secondary,
  brand: tokenBrand.main,
  success: tokenSuccess.darker,
  warning: tokenWarning.darker,
  error: tokenError.main,
};

type TextBoxWidgetProps = {
  value?: TextBoxWidgetPreferences;
  onChange: (nextValue: TextBoxWidgetPreferences) => void;
};

export default function TextBoxWidget({value, onChange}: TextBoxWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const settings = {...defaultTextBoxPreferences, ...value};
  const backgroundColor = backgroundToneMap[settings.backgroundTone];
  const textColor = textToneMap[settings.textTone];
  const textTypography = textBoxTypographyMap[settings.fontSize] ?? textBoxTypographyMap[16];
  const displayJustifyContent = settings.verticalAlign === 'middle'
    ? 'center'
    : settings.verticalAlign === 'bottom'
      ? 'flex-end'
      : 'flex-start';

  const update = (patch: Partial<TextBoxWidgetPreferences>) => {
    onChange({...settings, ...patch});
  };

  const stepFontSize = (direction: -1 | 1) => {
    const currentIndex = fontSizes.indexOf(settings.fontSize);
    const nextIndex = Math.min(fontSizes.length - 1, Math.max(0, currentIndex + direction));
    update({fontSize: fontSizes[nextIndex]});
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    update({content: event.target.value});
  };

  const stopGridDrag = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
  };

  const formatButtonSx = (active = false) => ({
    width: 28,
    height: 28,
    borderRadius: '8px',
    border: `1px solid ${active ? tokenBrand.main : tokenDivider}`,
    color: active ? tokenBrand.main : workstationVisuals.textSecondary,
    bgcolor: active ? tokenBrand.softBg : tokenCommon.white,
    '&:hover': {
      bgcolor: active ? tokenBrand.softBg : tokenNeutral.lightest,
      borderColor: active ? tokenBrand.main : tokenBrand.lighter,
    },
  });

  return (
    <WidgetShell>
      <Box
        onMouseDown={stopGridDrag}
        onTouchStart={stopGridDrag}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: isEditing ? 1 : 0,
          minHeight: 0,
          height: '100%',
          fontFamily: designSystemFontFamily,
        }}
      >
        <Tooltip title={isEditing ? 'Done editing' : 'Edit text'}>
          <IconButton
            aria-label={isEditing ? 'Done editing' : 'Edit text'}
            size="small"
            onClick={() => setIsEditing((current) => !current)}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              zIndex: 2,
              width: 28,
              height: 28,
              borderRadius: '999px',
              color: isEditing ? tokenCommon.white : tokenBrand.main,
              bgcolor: isEditing ? tokenBrand.main : tokenCommon.white,
              border: `1px solid ${isEditing ? tokenBrand.main : tokenBrand.lighter}`,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.10)',
              opacity: isEditing || !settings.content ? 1 : 0.72,
              transition: 'opacity 120ms ease, background-color 120ms ease, border-color 120ms ease',
              '&:hover': {
                opacity: 1,
                bgcolor: isEditing ? tokenBrand.dark : tokenBrand.softBg,
              },
            }}
          >
            {isEditing ? <CheckIcon sx={{fontSize: 16}} /> : <EditIcon sx={{fontSize: 15}} />}
          </IconButton>
        </Tooltip>

        {isEditing ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.55,
              minHeight: 30,
              pr: 3.7,
            }}
          >
            <Tooltip title="Bold">
              <IconButton aria-label="Bold" size="small" onClick={() => update({bold: !settings.bold})} sx={formatButtonSx(settings.bold)}>
                <BoldIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton aria-label="Italic" size="small" onClick={() => update({italic: !settings.italic})} sx={formatButtonSx(settings.italic)}>
                <ItalicIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
              <IconButton aria-label="Underline" size="small" onClick={() => update({underline: !settings.underline})} sx={formatButtonSx(settings.underline)}>
                <UnderlineIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align left">
              <IconButton aria-label="Align left" size="small" onClick={() => update({align: 'left'})} sx={formatButtonSx(settings.align === 'left')}>
                <AlignLeftIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align center">
              <IconButton aria-label="Align center" size="small" onClick={() => update({align: 'center'})} sx={formatButtonSx(settings.align === 'center')}>
                <AlignCenterIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align right">
              <IconButton aria-label="Align right" size="small" onClick={() => update({align: 'right'})} sx={formatButtonSx(settings.align === 'right')}>
                <AlignRightIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align top">
              <IconButton aria-label="Align top" size="small" onClick={() => update({verticalAlign: 'top'})} sx={formatButtonSx(settings.verticalAlign === 'top')}>
                <VerticalAlignTopIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align middle">
              <IconButton aria-label="Align middle" size="small" onClick={() => update({verticalAlign: 'middle'})} sx={formatButtonSx(settings.verticalAlign === 'middle')}>
                <VerticalAlignCenterIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align bottom">
              <IconButton aria-label="Align bottom" size="small" onClick={() => update({verticalAlign: 'bottom'})} sx={formatButtonSx(settings.verticalAlign === 'bottom')}>
                <VerticalAlignBottomIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4, ml: {xs: 0, sm: 0.8}}}>
              <Tooltip title="Decrease font size">
                <IconButton aria-label="Decrease font size" size="small" disabled={settings.fontSize === fontSizes[0]} onClick={() => stepFontSize(-1)} sx={formatButtonSx()}>
                  <RemoveIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Typography
                aria-label="Font size"
                sx={{
                  minWidth: 34,
                  px: 0.8,
                  height: 28,
                  border: `1px solid ${tokenDivider}`,
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: workstationVisuals.textPrimary,
                  bgcolor: tokenCommon.white,
                  fontFamily: designSystemFontFamily,
                }}
              >
                {settings.fontSize}
              </Typography>
              <Tooltip title="Increase font size">
                <IconButton aria-label="Increase font size" size="small" disabled={settings.fontSize === fontSizes[fontSizes.length - 1]} onClick={() => stepFontSize(1)} sx={formatButtonSx()}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, ml: 'auto'}}>
              {(Object.keys(backgroundToneMap) as TextBoxWidgetPreferences['backgroundTone'][]).map((tone) => (
                <Tooltip key={tone} title={`Background: ${tone}`}>
                  <IconButton
                    aria-label={`Background ${tone}`}
                    size="small"
                    onClick={() => update({backgroundTone: tone})}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '999px',
                      border: `2px solid ${settings.backgroundTone === tone ? tokenBrand.main : tokenDivider}`,
                      bgcolor: backgroundToneMap[tone],
                      '&:hover': {bgcolor: backgroundToneMap[tone]},
                    }}
                  />
                </Tooltip>
              ))}
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
              {(Object.keys(textToneMap) as TextBoxWidgetPreferences['textTone'][]).map((tone) => (
                <Tooltip key={tone} title={`Text: ${tone}`}>
                  <IconButton
                    aria-label={`Text ${tone}`}
                    size="small"
                    onClick={() => update({textTone: tone})}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '999px',
                      border: `2px solid ${settings.textTone === tone ? tokenBrand.main : tokenDivider}`,
                      bgcolor: textToneMap[tone],
                      '&:hover': {bgcolor: textToneMap[tone]},
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        ) : null}

        {isEditing ? (
          <Box
            component="textarea"
            value={settings.content}
            onChange={handleContentChange}
            placeholder="Write here..."
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              resize: 'none',
              border: `1px solid ${tokenDivider}`,
              borderRadius: '8px',
              outline: 'none',
              p: 1.35,
              boxSizing: 'border-box',
              bgcolor: backgroundColor,
              color: textColor,
              cursor: 'text',
              fontFamily: designSystemFontFamily,
              fontSize: settings.fontSize,
              lineHeight: textTypography.lineHeight,
              letterSpacing: textTypography.letterSpacing,
              fontWeight: settings.bold ? 700 : 400,
              fontStyle: settings.italic ? 'italic' : 'normal',
              textDecoration: settings.underline ? 'underline' : 'none',
              textAlign: settings.align,
              transition: 'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
              '&::placeholder': {
                color: workstationVisuals.textMuted,
                opacity: 0.72,
              },
              '&:focus': {
                borderColor: tokenBrand.main,
                boxShadow: `0 0 0 2px ${tokenBrand.softBg}`,
              },
            }}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              border: `1px solid ${settings.content ? 'transparent' : tokenDivider}`,
              borderRadius: '8px',
              p: 1.35,
              pr: 4.6,
              boxSizing: 'border-box',
              bgcolor: backgroundColor,
              color: settings.content ? textColor : workstationVisuals.textMuted,
              cursor: 'default',
              fontFamily: designSystemFontFamily,
              fontSize: settings.fontSize,
              lineHeight: textTypography.lineHeight,
              letterSpacing: textTypography.letterSpacing,
              fontWeight: settings.bold ? 700 : 400,
              fontStyle: settings.italic ? 'italic' : 'normal',
              textDecoration: settings.underline ? 'underline' : 'none',
              textAlign: settings.align,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: displayJustifyContent,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <Box sx={{width: '100%'}}>{settings.content || 'Write here...'}</Box>
          </Box>
        )}
      </Box>
    </WidgetShell>
  );
}
