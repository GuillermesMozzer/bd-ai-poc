import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignRight as AlignRightIcon,
  ArrowBack as ArrowBackIcon,
  FormatBold as BoldIcon,
  Save as SaveIcon,
  Description as DocIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListBulletedIcon,
  FormatListNumbered as ListNumberedIcon,
  Title as HeadingIcon,
} from '@mui/icons-material';

type TemplatePrefill = {
  template?: string;
  type?: string;
};

interface DocumentArtifactCreationScreenProps {
  onBack: () => void;
  onCreate?: (payload: { title: string; content: string; template?: string; type?: string }) => void;
  prefillOptions?: TemplatePrefill | null;
}

const templateBodies: Record<string, string> = {
  'Client Onboarding SOP': `<h1>Client Onboarding SOP</h1>
<h2>Document Header</h2>
<p><strong>Document ID:</strong> SOP-NEW-001<br/><strong>Owner:</strong> ____<br/><strong>Approver:</strong> ____<br/><strong>Effective Date:</strong> ____</p>
<h2>1. Purpose</h2>
<p>Define the onboarding process, responsibilities, and control points.</p>
<h2>2. Scope</h2>
<p>Applies to all new client setup requests.</p>
<h2>3. Procedure</h2>
<ol>
<li>Intake request and validate requirements.</li>
<li>Configure environment and access matrix.</li>
<li>Perform quality and compliance checks.</li>
<li>Confirm handoff and sign-off.</li>
</ol>
<h2>4. Records and Traceability</h2>
<ul>
<li>Linked entities:</li>
<li>Folder hierarchy:</li>
<li>Revision notes:</li>
</ul>`,
  'Quality Deviation Report': `<h1>Quality Deviation Report</h1>
<h2>Document Header</h2>
<p><strong>Report ID:</strong> QDR-NEW-001<br/><strong>Site:</strong> ____<br/><strong>Line:</strong> ____<br/><strong>Asset:</strong> ____<br/><strong>Raised By:</strong> ____</p>
<h2>1. Deviation Summary</h2>
<p>Describe what happened, when, and operational impact.</p>
<h2>2. Root Cause</h2>
<p>Capture investigation findings and evidence.</p>
<h2>3. Corrective / Preventive Actions</h2>
<p>List immediate containment and long-term fixes.</p>
<h2>4. Approval and Closure</h2>
<ul>
<li>Owner:</li>
<li>QA Reviewer:</li>
<li>Closure Date:</li>
</ul>`,
  'Safety Incident Log': `<h1>Safety Incident Log</h1>
<h2>Document Header</h2>
<p><strong>Incident ID:</strong> ____<br/><strong>Date/Time:</strong> ____<br/><strong>Site:</strong> ____<br/><strong>Reporter:</strong> ____</p>
<h2>1. Incident Description</h2>
<p>Capture observed event and initial severity.</p>
<h2>2. Immediate Actions</h2>
<p>Record containment actions executed on shift.</p>
<h2>3. Follow-up Actions</h2>
<p>Assign owner, due date, and verification method.</p>
<h2>4. Compliance Notes</h2>
<p>Reference policies, entities, and supporting artifacts.</p>`,
};

export default function DocumentArtifactCreationScreen({
  onBack,
  onCreate,
  prefillOptions,
}: DocumentArtifactCreationScreenProps) {
  const templateName = prefillOptions?.template ?? 'Custom Artifact';
  const templateType = prefillOptions?.type ?? 'Word';

  const defaultBody = useMemo(() => {
    return (
      templateBodies[templateName] ??
      `<h1>${templateName}</h1>
<h2>Document Header</h2>
<p><strong>Document ID:</strong> ____<br/><strong>Owner:</strong> ____<br/><strong>Approver:</strong> ____<br/><strong>Effective Date:</strong> ____</p>
<h2>1. Purpose</h2><p></p>
<h2>2. Scope</h2><p></p>
<h2>3. Content</h2><p></p>
<h2>4. Traceability</h2>
<ul><li>Entity links:</li><li>Folder hierarchy:</li><li>Metadata tags:</li></ul>`
    );
  }, [templateName]);

  const [title, setTitle] = useState(templateName);
  const [editorHtml, setEditorHtml] = useState(defaultBody);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('3');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const editorRef = useRef<HTMLDivElement | null>(null);

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current?.innerHTML ?? '');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef2f7', p: 2.5 }}>
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #dbe3ef', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <DocIcon sx={{ color: '#1D74FF' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937', lineHeight: 1.1 }}>
            Create New Artifact
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Template preloaded with structure, headers, and starter sections.
          </Typography>
        </Box>
        <Chip label={`Template: ${templateName}`} size="small" sx={{ bgcolor: '#eaf2ff', color: '#1d4ed8', fontWeight: 700 }} />
        <Chip label={`Type: ${templateType}`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700 }} />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ textTransform: 'none', fontWeight: 700 }}
          onClick={() => onCreate?.({ title, content: editorHtml, template: templateName, type: templateType })}
        >
          Save Artifact
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #dbe3ef', overflow: 'hidden' }}>
        <Box sx={{ p: 1, borderBottom: '1px solid #dbe3ef', bgcolor: '#f8fafc' }}>
          <TextField
            fullWidth
            size="small"
            label="Artifact Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 1, borderBottom: '1px solid #dbe3ef', bgcolor: '#f8fafc', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={fontFamily}
              onChange={(event) => {
                const value = event.target.value;
                setFontFamily(value);
                runCommand('fontName', value);
              }}
            >
              <MenuItem value="Arial">Arial</MenuItem>
              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              <MenuItem value="Calibri">Calibri</MenuItem>
              <MenuItem value="Georgia">Georgia</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={fontSize}
              onChange={(event) => {
                const value = event.target.value;
                setFontSize(value);
                runCommand('fontSize', value);
              }}
            >
              <MenuItem value="2">10</MenuItem>
              <MenuItem value="3">12</MenuItem>
              <MenuItem value="4">14</MenuItem>
              <MenuItem value="5">18</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton value="bold" onClick={() => runCommand('bold')}><BoldIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="italic" onClick={() => runCommand('italic')}><ItalicIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            size="small"
            value={align}
            exclusive
            onChange={(_, value) => {
              if (!value) return;
              setAlign(value);
              const cmd = value === 'center' ? 'justifyCenter' : value === 'right' ? 'justifyRight' : 'justifyLeft';
              runCommand(cmd);
            }}
          >
            <ToggleButton value="left"><AlignLeftIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="center"><AlignCenterIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="right"><AlignRightIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton value="h2" onClick={() => runCommand('formatBlock', 'H2')}><HeadingIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="ul" onClick={() => runCommand('insertUnorderedList')}><ListBulletedIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="ol" onClick={() => runCommand('insertOrderedList')}><ListNumberedIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#eef2f7' }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #cbd5e1', borderRadius: 1.5, bgcolor: 'white', minHeight: '72vh', maxWidth: 980, mx: 'auto', boxShadow: '0 12px 30px rgba(15,23,42,0.06)' }}>
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(event) => setEditorHtml((event.target as HTMLDivElement).innerHTML)}
              sx={{
                minHeight: '66vh',
                outline: 'none',
                fontFamily: '"Arial", sans-serif',
                color: '#1f2937',
                lineHeight: 1.6,
                '& h1': { fontSize: '1.8rem', mb: 1, color: '#0f172a' },
                '& h2': { fontSize: '1.2rem', mt: 2, mb: 1, color: '#1e3a8a' },
                '& p': { mb: 1.2 },
                '& ul, & ol': { pl: 3, mb: 1.2 },
              }}
              dangerouslySetInnerHTML={{ __html: editorHtml }}
            />
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
