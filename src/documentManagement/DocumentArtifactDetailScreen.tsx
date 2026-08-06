import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Chip,
  Tabs,
  Tab,
  Grid,
  Divider,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  FileCopy as DuplicateIcon,
  AltRoute as MoveIcon,
  Share as ShareIcon,
  Summarize as SummarizeIcon,
  Translate as TranslateIcon,
  Topic as TopicIcon,
  Delete as DeleteIcon,
  LockOutlined as LockIcon,
  LockOpenOutlined as UnlockIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  OpenInFull as ExpandIcon,
  Visibility as VisibilityIcon,
  KeyboardReturn as KeyboardReturnIcon,
  Folder as FolderIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  SmartToy as BotIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as BulletedListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

type Artifact = {
  id: string;
  name: string;
  type?: string;
  status?: string;
  version?: string;
  owner?: string;
  approver?: string;
  modified?: string;
  modifiedBy?: string;
  reviewDate?: string;
  site?: string;
  line?: string;
  asset?: string;
};

interface DocumentArtifactDetailScreenProps {
  artifact: Artifact | null;
  onBack: () => void;
}

export default function DocumentArtifactDetailScreen({ artifact, onBack }: DocumentArtifactDetailScreenProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [metadataSearch, setMetadataSearch] = useState('');
  const [artifactDisplayName, setArtifactDisplayName] = useState(artifact?.name ?? 'Equipment XYZ Artifact');
  const [artifactDescription, setArtifactDescription] = useState('Artifact documentation for process governance, quality compliance, and production support details.');
  const [artifactFolder, setArtifactFolder] = useState('Associated folder');
  const [artifactPath, setArtifactPath] = useState('Product Family 1 > Product Sub Family > Sub Group > Product 1 > Unit 2');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [topicsDialogOpen, setTopicsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiSummaryDialogOpen, setAiSummaryDialogOpen] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [commentSearch, setCommentSearch] = useState('');
  const [commentVersionFilter, setCommentVersionFilter] = useState<'all' | 'v8' | 'v7' | 'v6'>('all');
  const [commentStatusFilter, setCommentStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [shareInput, setShareInput] = useState('');
  const [shareRole, setShareRole] = useState('Viewer');
  const [moveTarget, setMoveTarget] = useState('PF-UTL-EFF-DTP-TR05-PMP1');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    root: true,
    pf: true,
    'pf-utl-eff': true,
    'pf-utl-eff-dtp': true,
    'pf-utl-eff-dtp-tr05': true,
    'links-secondary': true,
  });
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState('equip-main');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isPreviewLocked, setIsPreviewLocked] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [editDocumentDialogOpen, setEditDocumentDialogOpen] = useState(false);
  const [editMetadataDialogOpen, setEditMetadataDialogOpen] = useState(false);
  const [addMetadataDialogOpen, setAddMetadataDialogOpen] = useState(false);
  const [editDescriptionDialogOpen, setEditDescriptionDialogOpen] = useState(false);
  const [metadataEntries, setMetadataEntries] = useState<Array<{
    key: string;
    value: string;
    source: 'Manual' | 'AI' | 'System';
    confidence: number;
    linked: boolean;
    trace: string;
  }>>([
    { key: 'Changed by', value: artifact?.modifiedBy ?? '2240', source: 'System', confidence: 99, linked: true, trace: 'revision-log' },
    { key: 'Changed On', value: artifact?.modified ?? 'BD Ltd.', source: 'System', confidence: 99, linked: true, trace: 'revision-log' },
    { key: 'Company Code', value: '1005112', source: 'Manual', confidence: 92, linked: true, trace: 'quality-master-data' },
    { key: 'Company Code Description', value: 'CO', source: 'Manual', confidence: 91, linked: true, trace: 'quality-master-data' },
  ]);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [aiSuggestingMetadata, setAiSuggestingMetadata] = useState(false);
  const [aiMetadataSuggestions, setAiMetadataSuggestions] = useState<Array<{ key: string; value: string }>>([]);
  const [editorAlign, setEditorAlign] = useState<'left' | 'center' | 'right'>('left');
  const [editorBold, setEditorBold] = useState(false);
  const [editorItalic, setEditorItalic] = useState(false);
  const [editorListMode, setEditorListMode] = useState<'none' | 'bulleted' | 'numbered'>('none');
  const [editorHtml, setEditorHtml] = useState(`
    <h1>STANDARD OPERATING PROCEDURE</h1>
    <h2>${artifact?.name ?? 'Autoguard Safety SOP.docx'}</h2>
    <p><strong>Artifact ID:</strong> ${artifact?.id ?? 'ART-00014690'} | <strong>Status:</strong> ${artifact?.status ?? 'Under Revision'}</p>
    <h3 id="sec-purpose">1. Purpose</h3>
    <p>This procedure defines the required safety checks, guarding verification, and sign-off sequence for operation of the Autoguard station. It standardizes pre-start validation, in-process controls, and escalation rules to maintain compliance.</p>
    <h3 id="sec-scope">2. Scope and Responsibilities</h3>
    <p>Applies to operators, line leads, quality reviewers, and maintenance support. Each role must complete assigned checkpoints and record evidence in the approval workflow before release.</p>
    <h3 id="sec-procedure">3. Procedure</h3>
    <ul>
      <li>Perform pre-start guard check</li>
      <li>Validate interlock behavior</li>
      <li>Confirm emergency stop availability</li>
      <li>Record result and route approval</li>
    </ul>
    <h3 id="sec-controls">4. Controls and Escalation</h3>
    <p>Any failed checkpoint must stop line release. Notify the line lead and quality reviewer, attach evidence, and complete corrective action before restart.</p>
  `);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const artifactName = artifactDisplayName;
  const artifactNumber = artifact?.id ?? '00014690-0100';
  const status = artifact?.status ?? 'Under Revision';
  const artifactTopics = ['Safety Labels', 'Equipment Dimensions', 'Audit Preparation', 'Workflow Compliance', 'Validation Rules'];
  const editorPlainText = editorHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  useEffect(() => {
    setArtifactDisplayName(artifact?.name ?? 'Equipment XYZ Artifact');
  }, [artifact?.name]);

  const metadataRows = metadataEntries.filter((row) => `${row.key} ${row.value}`.toLowerCase().includes(metadataSearch.toLowerCase()));

  const runAiSummary = () => {
    setAiSummaryDialogOpen(true);
    setAiSummaryLoading(true);
    setAiSummaryText('');
    window.setTimeout(() => {
      setAiSummaryLoading(false);
      setAiSummaryText(
        `BLU.AI Summary: "${artifactDisplayName}" is a reference artifact for ${artifact?.asset ?? 'the target equipment'} with high operational relevance. Key updates are concentrated on labeling standards, workflow handoff guidance, and compliance traceability. The latest revisions impacted approval routing and introduced stronger metadata relations with maintenance and incident records.`
      );
    }, 900);
  };

  const handlePreviewZoomIn = () => setPreviewZoom((prev) => Math.min(150, prev + 10));
  const handlePreviewZoomOut = () => setPreviewZoom((prev) => Math.max(70, prev - 10));
  const handlePreviewRefresh = () => {
    setPreviewRefreshKey((prev) => prev + 1);
    setSnackbar({ open: true, message: 'Preview refreshed.', severity: 'info' });
  };
  const handleTogglePreviewLock = () => {
    setIsPreviewLocked((prev) => !prev);
    setSnackbar({
      open: true,
      message: isPreviewLocked ? 'Preview unlocked.' : 'Preview locked for editing.',
      severity: 'info',
    });
  };
  const handleOpenEditDocument = () => {
    if (isPreviewLocked) {
      setSnackbar({ open: true, message: 'Document is locked. Unlock to edit.', severity: 'warning' });
      return;
    }
    setEditDocumentDialogOpen(true);
  };
  const handleAddMetadata = (entry: { key: string; value: string; source?: 'Manual' | 'AI' | 'System'; confidence?: number; trace?: string }) => {
    if (!entry.key.trim() || !entry.value.trim()) return;
    setMetadataEntries((prev) => [
      ...prev,
      {
        key: entry.key.trim(),
        value: entry.value.trim(),
        source: entry.source ?? 'Manual',
        confidence: entry.confidence ?? 88,
        linked: true,
        trace: entry.trace ?? 'artifact-manual-link',
      },
    ]);
  };
  const handleRunAiMetadataSuggestions = () => {
    setAiSuggestingMetadata(true);
    window.setTimeout(() => {
      setAiSuggestingMetadata(false);
      setAiMetadataSuggestions([
        { key: 'Equipment Class', value: artifact?.asset ?? 'Autoguard Conveyor' },
        { key: 'Document Criticality', value: 'High - Safety Compliance' },
        { key: 'Approval Route', value: 'Operator > Line Lead > QA > Compliance' },
        { key: 'Review Frequency', value: 'Quarterly' },
      ]);
    }, 900);
  };

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current?.innerHTML ?? '');
  };

  const jumpToSection = (id: string) => {
    const root = editorRef.current;
    if (!root) return;
    const target = root.querySelector(`#${id}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const renderDocumentWorkspace = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 2.5 }}>
        <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid #dbe3ef' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Document Outline
          </Typography>
          {[
            { id: 'sec-purpose', label: '1. Purpose' },
            { id: 'sec-scope', label: '2. Scope and Responsibilities' },
            { id: 'sec-procedure', label: '3. Procedure' },
            { id: 'sec-controls', label: '4. Controls and Escalation' },
          ].map((item) => (
            <Button
              key={item.id}
              size="small"
              variant="text"
              onClick={() => jumpToSection(item.id)}
              sx={{ justifyContent: 'flex-start', width: '100%', textTransform: 'none', mb: 0.4, fontWeight: 600 }}
            >
              {item.label}
            </Button>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
            Scroll inside the page to navigate like a real editor.
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 9.5 }}>
        <Paper elevation={0} sx={{ border: '1px solid #dbe3ef', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #dbe3ef', bgcolor: '#f8fafc', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <ToggleButtonGroup size="small" value={editorBold ? 'bold' : null} exclusive>
              <ToggleButton value="bold" onClick={() => { setEditorBold((prev) => !prev); runEditorCommand('bold'); }}>
                <BoldIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup size="small" value={editorItalic ? 'italic' : null} exclusive>
              <ToggleButton value="italic" onClick={() => { setEditorItalic((prev) => !prev); runEditorCommand('italic'); }}>
                <ItalicIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              size="small"
              value={editorAlign}
              exclusive
              onChange={(_, value) => {
                if (!value) return;
                setEditorAlign(value);
                const cmd = value === 'center' ? 'justifyCenter' : value === 'right' ? 'justifyRight' : 'justifyLeft';
                runEditorCommand(cmd);
              }}
            >
              <ToggleButton value="left"><AlignLeftIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="center"><AlignCenterIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="right"><AlignRightIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup size="small" value={editorListMode} exclusive>
              <ToggleButton value="bulleted" onClick={() => { setEditorListMode('bulleted'); runEditorCommand('insertUnorderedList'); }}><BulletedListIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="numbered" onClick={() => { setEditorListMode('numbered'); runEditorCommand('insertOrderedList'); }}><NumberedListIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="none" onClick={() => { setEditorListMode('none'); runEditorCommand('removeFormat'); }}>Clear List</ToggleButton>
            </ToggleButtonGroup>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none', ml: 0.5 }} onClick={() => runEditorCommand('formatBlock', 'H3')}>H3</Button>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => runEditorCommand('formatBlock', 'P')}>Paragraph</Button>
            <Box sx={{ ml: 'auto' }}><Chip label="Editor Mode" size="small" sx={{ fontWeight: 700, bgcolor: '#eaf2ff', color: '#1d4ed8' }} /></Box>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#eef2f7', minHeight: 540, overflow: 'auto', maxHeight: '72vh' }}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: 980,
                minHeight: 500,
                mx: 'auto',
                p: 2.2,
                border: '1px solid #cbd5e1',
                borderRadius: 1.5,
                bgcolor: '#fff',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                zoom: `${previewZoom}%`,
              }}
            >
              <Box
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => setEditorHtml((event.target as HTMLDivElement).innerHTML)}
                sx={{
                  outline: 'none',
                  color: '#334155',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                  '& h1': { fontSize: '1.4rem', margin: '0 0 8px 0', color: '#0f172a' },
                  '& h2': { fontSize: '1.05rem', margin: '0 0 10px 0', color: '#1e3a8a' },
                  '& h3': { fontSize: '0.95rem', margin: '14px 0 6px 0', color: '#334155' },
                  '& p': { margin: '0 0 10px 0' },
                  '& ul, & ol': { margin: '0 0 10px 18px' },
                }}
                dangerouslySetInnerHTML={{ __html: editorHtml }}
              />
            </Paper>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const runTranslation = () => {
    setTranslationLoading(true);
    setTranslatedText('');
    window.setTimeout(() => {
      setTranslationLoading(false);
      setTranslatedText(
        selectedLanguage === 'Portuguese'
          ? `Resumo traduzido (${selectedLanguage}): este artefato orienta rotinas de validação, segurança e fluxo de aprovação para ${artifact?.asset ?? 'o equipamento'}.`
          : selectedLanguage === 'Spanish'
            ? `Resumen traducido (${selectedLanguage}): este artefacto guía validación, seguridad y flujo de aprobación para ${artifact?.asset ?? 'el equipo'}.`
            : `Translated summary (${selectedLanguage}): this artifact guides validation, safety, and approval workflow for ${artifact?.asset ?? 'the equipment'}.`
      );
    }, 700);
  };

  const generalActions = [
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setEditDialogOpen(true),
    },
    {
      label: 'Download',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => {
        const content = `Artifact: ${artifactDisplayName}\nID: ${artifactNumber}\nType: ${artifact?.type ?? 'Reference'}\nStatus: ${status}\nPath: ${artifactPath}\nDescription: ${artifactDescription}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = `${artifactDisplayName.replace(/[^\w\-]+/g, '_')}.txt`;
        anchor.click();
        URL.revokeObjectURL(href);
        setSnackbar({ open: true, message: 'Artifact file downloaded.', severity: 'success' });
      },
    },
    {
      label: 'Duplicate',
      icon: <DuplicateIcon fontSize="small" />,
      onClick: () => {
        const nextCount = duplicateCount + 1;
        setDuplicateCount(nextCount);
        setArtifactDisplayName(`${artifact?.name ?? 'Equipment XYZ Artifact'} (Copy ${nextCount})`);
        setSnackbar({ open: true, message: 'Artifact duplicated successfully.', severity: 'success' });
      },
    },
    {
      label: 'Move',
      icon: <MoveIcon fontSize="small" />,
      onClick: () => setMoveDialogOpen(true),
    },
    {
      label: 'Share',
      icon: <ShareIcon fontSize="small" />,
      onClick: () => setShareDialogOpen(true),
    },
    {
      label: 'Summarize',
      icon: <SummarizeIcon fontSize="small" />,
      onClick: runAiSummary,
    },
    {
      label: 'Translate',
      icon: <TranslateIcon fontSize="small" />,
      onClick: () => setTranslateDialogOpen(true),
    },
    {
      label: 'Main Topics',
      icon: <TopicIcon fontSize="small" />,
      onClick: () => setTopicsDialogOpen(true),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: () => setDeleteDialogOpen(true),
    },
  ];
  const historyRows = [
    { version: 'Version 8', format: 'XLS', date: '05/04/2024', status: 'Waiting for approval' },
    { version: 'Version 7', format: 'DOC', date: '05/04/2024', status: 'Approved' },
    { version: 'Version 6', format: 'XLS', date: '05/04/2024', status: 'Approved' },
    { version: 'Version 5', format: 'XLS', date: '05/04/2024', status: 'Disapproved' },
    { version: 'Version 4', format: 'XLS', date: '05/04/2024', status: 'Approved' },
    { version: 'Version 3', format: 'XLS', date: '05/04/2024', status: 'Under Revision' },
    { version: 'Version 2', format: 'XLS', date: '05/04/2024', status: 'Approved' },
    { version: 'Version 1', format: 'XLS', date: '05/04/2024', status: 'Approved' },
  ];
  const commentsByVersion = [
    { author: 'John Doe', role: 'Line Lead', version: 'v8', date: 'Mar 16, 2026', text: 'Missing a few key equipment labels on page 57; double-check.', status: 'open' as const, priority: 'high' as const },
    { author: 'Jane Doette', role: 'QA Reviewer', version: 'v8', date: 'Mar 15, 2026', text: 'Revise valve symbols for consistency across the artifact.', status: 'resolved' as const, priority: 'medium' as const },
    { author: 'Melisa', role: 'Compliance', version: 'v7', date: 'Mar 14, 2026', text: 'Remove redundant lines to reduce clutter in section 2.', status: 'open' as const, priority: 'low' as const },
  ];
  const visibleComments = commentsByVersion.filter((comment) => {
    const versionOk = commentVersionFilter === 'all' || comment.version === commentVersionFilter;
    const statusOk = commentStatusFilter === 'all' || comment.status === commentStatusFilter;
    const searchOk = `${comment.author} ${comment.role} ${comment.text} ${comment.version}`.toLowerCase().includes(commentSearch.toLowerCase());
    return versionOk && statusOk && searchOk;
  });
  const openCommentsCount = commentsByVersion.filter((comment) => comment.status === 'open').length;
  const resolvedCommentsCount = commentsByVersion.filter((comment) => comment.status === 'resolved').length;
  const approvalReviewers = [
    { name: 'John Doe', required: true, status: 'Approved' },
    { name: 'Jane Doette', required: false, status: 'Approved' },
    { name: 'Xin Yue', required: false, status: 'Not Validated Yet' },
    { name: 'John', required: false, status: 'Not Validated Yet' },
    { name: 'Melisa', required: false, status: 'Not Validated Yet' },
  ];
  const relatedFiles = ['EQUIPMENT FULL NAME AND SPECIFICATION', 'EQUIPMENT FULL NAME AND SPECIFICATION', 'EQUIPMENT FULL NAME AND SPECIFICATION', 'EQUIPMENT FULL NAME AND SPECIFICATION', 'EQUIPMENT FULL NAME AND SPECIFICATION'];
  const linkTreeNodes: Array<{
    id: string;
    label: string;
    kind: 'Folder' | 'Artifact' | 'File';
    relationCount: number;
    aiConfidence: number;
    relationType: string;
    children?: Array<any>;
  }> = [
    {
      id: 'root',
      label: 'PF (Plant Root)',
      kind: 'Folder',
      relationCount: 24,
      aiConfidence: 98,
      relationType: 'Hierarchy root',
      children: [
        {
          id: 'pf',
          label: 'PF-UTL-EFF',
          kind: 'Folder',
          relationCount: 12,
          aiConfidence: 96,
          relationType: 'Parent folder',
          children: [
            {
              id: 'pf-utl-eff',
              label: 'PF-UTL-EFF-DTP',
              kind: 'Folder',
              relationCount: 8,
              aiConfidence: 97,
              relationType: 'Asset stream branch',
              children: [
                {
                  id: 'pf-utl-eff-dtp',
                  label: 'PF-UTL-EFF-DTP-TR05',
                  kind: 'Folder',
                  relationCount: 6,
                  aiConfidence: 95,
                  relationType: 'Process unit node',
                  children: [
                    {
                      id: 'pf-utl-eff-dtp-tr05',
                      label: 'PF-UTL-EFF-DTP-TR05-PMP1',
                      kind: 'Folder',
                      relationCount: 5,
                      aiConfidence: 94,
                      relationType: 'Equipment branch',
                      children: [
                        { id: 'equip-main', label: artifactName, kind: 'Artifact', relationCount: 4, aiConfidence: 99, relationType: 'Primary artifact node' },
                        { id: 'equip-he1300', label: 'HE1300', kind: 'File', relationCount: 2, aiConfidence: 88, relationType: 'Sibling linked file' },
                        { id: 'equip-m122560a', label: 'M122560A', kind: 'File', relationCount: 2, aiConfidence: 91, relationType: 'Referenced by metadata tag' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'links-secondary',
              label: 'PF-UTL-EFF-HRT',
              kind: 'Folder',
              relationCount: 5,
              aiConfidence: 89,
              relationType: 'Secondary route via tag mapping',
              children: [
                { id: 'sec-risk-note', label: 'Risk Assessment Note', kind: 'File', relationCount: 3, aiConfidence: 84, relationType: 'Referenced in revision comments' },
                { id: 'sec-maint-guide', label: 'Maintenance Guideline', kind: 'File', relationCount: 2, aiConfidence: 82, relationType: 'Linked by shared equipment code' },
              ],
            },
          ],
        },
      ],
    },
  ];
  const relationEvidenceByNode: Record<string, string[]> = {
    'equip-main': [
      'Matched metadata: site + line + asset + platform.',
      'Referenced in 3 workflow steps and 2 approval comments.',
      'Linked to 4 siblings through shared equipment ID prefix.',
    ],
    'equip-he1300': [
      'Cross-referenced by change request CR-4402.',
      'Same unit class and revision window overlap (+/- 3 days).',
      'Co-mentioned in 2 incident descriptions.',
    ],
    'equip-m122560a': [
      'Appears in BOM relationship table for this unit.',
      'Found in approval attachments for version v7 and v8.',
      'Strong semantic match in AI vector index.',
    ],
    'sec-risk-note': [
      'Mentioned in mandatory review checklist.',
      'Linked to one disapproval reason in history tab.',
    ],
  };
  const selectedNodeRelations = relationEvidenceByNode[selectedTreeNodeId] ?? ['AI did not find detailed evidence for this node yet.'];
  const toggleTreeNode = (nodeId: string) => {
    setExpandedTreeNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };
  const renderTree = (nodes: Array<any>, level = 0) => nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length);
    const expanded = Boolean(expandedTreeNodes[node.id]);
    const isSelected = selectedTreeNodeId === node.id;
    return (
      <Box key={node.id} sx={{ ml: level ? 2 : 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.7,
            py: 0.4,
            px: 0.6,
            borderRadius: 1.8,
            bgcolor: isSelected ? '#eaf2ff' : 'transparent',
            border: `1px solid ${isSelected ? '#93c5fd' : 'transparent'}`,
          }}
        >
          <IconButton size="small" onClick={() => (hasChildren ? toggleTreeNode(node.id) : setSelectedTreeNodeId(node.id))} sx={{ width: 24, height: 24 }}>
            {hasChildren ? (expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />) : <ChevronRightIcon fontSize="small" sx={{ opacity: 0.35 }} />}
          </IconButton>
          <Chip
            size="small"
            icon={node.kind === 'Folder' ? <FolderIcon /> : node.kind === 'Artifact' ? <BotIcon /> : <LinkIcon />}
            label={node.label}
            onClick={() => setSelectedTreeNodeId(node.id)}
            sx={{
              height: 30,
              bgcolor: node.kind === 'Folder' ? '#1e3a8a' : node.kind === 'Artifact' ? '#044ED7' : '#1D74FF',
              color: 'white',
              fontWeight: 800,
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
          <Chip size="small" label={`${node.relationCount} relations`} sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700, height: 24 }} />
          <Chip size="small" label={`AI ${node.aiConfidence}%`} sx={{ bgcolor: '#ecfeff', color: '#0369a1', fontWeight: 700, height: 24 }} />
        </Box>
        {hasChildren ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ borderLeft: '2px solid #bfdbfe', ml: 2, pl: 0.8 }}>
              {renderTree(node.children, level + 1)}
            </Box>
          </Collapse>
        ) : null}
      </Box>
    );
  });
  const associatedLinks = [
    { name: 'PF-UTR', date: '11/09/2023' },
    { name: 'Manufacturing', date: '11/09/2023' },
    { name: 'STW-00-01-TR1', date: '11/09/2023' },
  ];
  const relatedFolders = [
    { name: 'PF-UTL-EFF', date: '11/09/2023' },
    { name: 'PF-UTL-EFF-DTP', date: '11/09/2023' },
    { name: 'PF-UTL-EFF-DTP-TR05-PMP1', date: '11/09/2023' },
  ];
  const incidents = [
    { name: 'Meoh leak on E. Hydolysos boo', category: 'PSC-T2', date: '05/30/2023', unit: 'BISPOM' },
    { name: 'Meoh leak on E. Hydolysos boo', category: 'PSC-T2', date: '05/30/2023', unit: 'BISPOM' },
    { name: 'Meoh leak on E. Hydolysos boo', category: 'PSC-T2', date: '05/30/2023', unit: 'BISPOM' },
    { name: 'Meoh leak on E. Hydolysos boo', category: 'PSC-T2', date: '05/30/2023', unit: 'BISPOM' },
  ];

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#f4f7fc', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton size="small" onClick={onBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366' }}>
              Search by Artifact Files
            </Typography>
          </Box>
          <Button variant="outlined" size="small">
            Properties
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #DBDDDF', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 220 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937' }}>{artifactName}</Typography>
              <Chip size="small" label={status} sx={{ mt: 0.8, bgcolor: '#EBEDF0', color: '#044ED7', fontWeight: 700 }} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ color: '#334155', mb: 0.8 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>Number</Box> {artifactNumber}
                <Box component="span" sx={{ ml: 2, fontWeight: 700 }}>File Class</Box> Reference Documentation
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                <Box component="span" sx={{ fontWeight: 700, color: '#334155' }}>Relation</Box> Product Family 1 &gt; Product Sub Family &gt; Sub Group &gt; Product 1 &gt; Unit 2 &gt; {artifact?.asset ?? 'Equipment XYZ'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, lg: 9 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #cbd5e1', overflow: 'hidden', bgcolor: '#eef2f7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.8, borderBottom: '1px solid #cbd5e1', bgcolor: 'white', flexWrap: 'wrap' }}>
                <IconButton size="small" onClick={handlePreviewZoomIn} sx={{ border: '1px solid #DBDDDF', borderRadius: 1.5 }}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handlePreviewZoomOut} sx={{ border: '1px solid #DBDDDF', borderRadius: 1.5 }}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handlePreviewRefresh} sx={{ border: '1px solid #DBDDDF', borderRadius: 1.5 }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setIsPreviewExpanded(true)} sx={{ border: '1px solid #DBDDDF', borderRadius: 1.5 }}>
                  <ExpandIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleTogglePreviewLock} sx={{ border: '1px solid #DBDDDF', borderRadius: 1.5 }}>
                  {isPreviewLocked ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
                </IconButton>
                <Button size="small" variant="outlined" onClick={handleOpenEditDocument} sx={{ textTransform: 'none', fontWeight: 700, ml: 0.5 }}>
                  Edit Document
                </Button>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, ml: 'auto' }}>
                  Zoom {previewZoom}%
                </Typography>
              </Box>
              <Box key={previewRefreshKey} sx={{ minHeight: 420, p: 2, display: 'grid', placeItems: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: 960,
                    minHeight: 380,
                    border: '1px solid #cbd5e1',
                    borderRadius: 1.5,
                    bgcolor: '#ffffff',
                    p: 2.2,
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    zoom: `${previewZoom}%`,
                  }}
                >
                  <Box sx={{ borderBottom: '2px solid #1e3a8a', pb: 1, mb: 1.2 }}>
                    <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, lineHeight: 1.2 }}>
                      STANDARD OPERATING PROCEDURE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 700 }}>
                      {artifactName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>
                      Artifact ID {artifactNumber} | Status: {status} | Owner: {artifact?.owner ?? 'Operations'}
                    </Typography>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 1.2 }}>
                    {[
                      { label: 'Document Type', value: artifact?.type ?? 'Manual' },
                      { label: 'Line / Asset', value: `${artifact?.line ?? 'Line 10'} / ${artifact?.asset ?? 'Autoguard Conveyor'}` },
                      { label: 'Effective Date', value: artifact?.reviewDate ?? '10/03/2026' },
                      { label: 'Revision', value: artifact?.version ?? 'v1' },
                    ].map((cell) => (
                      <Grid key={cell.label} size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.2, p: 0.8 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            {cell.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
                            {cell.value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mb: 1.2 }}>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800 }}>
                      1. PURPOSE
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', mt: 0.3, lineHeight: 1.5 }}>
                      {editorPlainText.slice(0, 260) || artifactDescription}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.2 }}>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800 }}>
                      2. SCOPE AND RESPONSIBILITIES
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', mt: 0.3, lineHeight: 1.5 }}>
                      {editorPlainText.slice(260, 520) || 'Content continues in document editor view.'}
                    </Typography>
                  </Box>

                  <Paper elevation={0} sx={{ border: '1px solid #dbeafe', borderRadius: 1.2, p: 1, bgcolor: '#f8fbff' }}>
                    <Typography variant="caption" sx={{ color: '#1e3a8a', fontWeight: 800, display: 'block', mb: 0.7 }}>
                      3. APPROVAL FLOW DIAGRAM
                    </Typography>
                    <Grid container spacing={0.8} alignItems="center">
                      {['Operator Check', 'Line Lead Review', 'Quality Approval', 'Release to Production'].map((step, idx) => (
                        <React.Fragment key={step}>
                          <Grid size={{ xs: 12, sm: 2.7 }}>
                            <Box
                              sx={{
                                border: '1px solid #93c5fd',
                                borderRadius: 1.2,
                                bgcolor: '#ffffff',
                                p: 0.8,
                                textAlign: 'center',
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#1e3a8a', fontWeight: 700 }}>
                                {step}
                              </Typography>
                            </Box>
                          </Grid>
                          {idx < 3 ? (
                            <Grid size={{ xs: 12, sm: 0.4 }} sx={{ display: 'grid', placeItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>
                                →
                              </Typography>
                            </Grid>
                          ) : null}
                        </React.Fragment>
                      ))}
                    </Grid>
                  </Paper>
                </Paper>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid #DBDDDF', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937', mb: 1.2 }}>
                General Info
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Select Action
              </Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {generalActions.map((action) => (
                    <Grid key={action.label} size={{ xs: 4 }}>
                      <Button
                        variant="outlined"
                        startIcon={action.icon}
                        onClick={action.onClick}
                        sx={{ width: '100%', py: 0.8, borderRadius: 1.8, textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', justifyContent: 'flex-start' }}
                      >
                        {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mt: 1.2 }}>
                File formats
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.8 }}>
                {['DOC', 'PDF', 'TXT', 'JPG', 'CSS'].map((ext) => (
                  <Chip key={ext} label={ext} size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700 }} />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ borderBottom: '1px solid #DBDDDF', mb: 1.5 }}
        >
          {['Details', 'History', 'Links', 'Comments', 'Approval Workflow', 'Associated Entities'].map((tabLabel) => (
            <Tab key={tabLabel} label={tabLabel} sx={{ textTransform: 'none', fontWeight: 700 }} />
          ))}
        </Tabs>

        {activeTab === 0 ? (
          <>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937' }}>General</Typography>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 800 }}>Edit</Button>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2"><b>File Name:</b> {artifactName}</Typography>
                  <Typography variant="body2"><b>Root Asset:</b> {artifact?.asset ?? 'PF - Product Facility'}</Typography>
                  <Typography variant="body2"><b>Asset:</b> {artifact?.line ?? 'Production Facility'}</Typography>
                  <Typography variant="body2"><b>Quality:</b> Tier 1</Typography>
                  <Typography variant="body2"><b>Doc Type:</b> {artifact?.type ?? 'Audit Plan'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2"><b>Product:</b> Internal Audit Quality</Typography>
                  <Typography variant="body2"><b>Workflow:</b> Approval Workflow</Typography>
                  <Typography variant="body2"><b>Folder:</b> {artifactFolder}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
                    <Typography variant="body2"><b>Description:</b> {artifactDescription}</Typography>
                    <IconButton size="small" onClick={() => setEditDescriptionDialogOpen(true)} sx={{ mt: -0.4 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 1.2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937' }}>Metadata</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMetadataDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 800 }}>Edit Metadata</Button>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddMetadataDialogOpen(true)} sx={{ textTransform: 'none', fontWeight: 800 }}>Add Metadata</Button>
                </Box>
              </Box>
              <TextField
                size="small"
                placeholder="Search..."
                fullWidth
                value={metadataSearch}
                onChange={(event) => setMetadataSearch(event.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
                sx={{ mb: 1.2 }}
              />
              <Grid container spacing={1}>
                {metadataRows.map((row, idx) => (
                  <Grid key={`${row.key}-${idx}`} size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 1.8, border: '1px solid #dbe3ef', bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                            Associated Key
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {row.key}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setMetadataEntries((prev) => prev.filter((_, i) => i !== idx))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#1f2937', mt: 0.4, mb: 0.8 }}>
                        {row.value}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        <Chip size="small" label={`source:${row.source.toLowerCase()}`} sx={{ fontWeight: 700, bgcolor: row.source === 'AI' ? '#e0f2fe' : row.source === 'System' ? '#ede9fe' : '#ecfeff', color: '#0f172a' }} />
                        <Chip size="small" label={`confidence:${row.confidence}%`} sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#334155' }} />
                        <Chip size="small" label={row.linked ? 'linked-to-artifact' : 'unlinked'} sx={{ fontWeight: 700, bgcolor: row.linked ? '#dcfce7' : '#fee2e2', color: row.linked ? '#166534' : '#991b1b' }} />
                        <Chip size="small" label={`trace:${row.trace}`} sx={{ fontWeight: 700, bgcolor: '#fff7ed', color: '#9a3412' }} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        ) : null}

        {activeTab === 1 ? (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>History overview</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>File format</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Last updated date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyRows.map((row) => (
                  <TableRow key={row.version}>
                    <TableCell>{row.version}</TableCell>
                    <TableCell>{row.format}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        sx={{
                          bgcolor: row.status.includes('Disapproved') ? '#fee2e2' : row.status.includes('Waiting') ? '#fff7ed' : row.status.includes('Revision') ? '#dbeafe' : '#dcfce7',
                          color: row.status.includes('Disapproved') ? '#ef4444' : row.status.includes('Waiting') ? '#f97316' : row.status.includes('Revision') ? '#2563eb' : '#16a34a',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small"><KeyboardReturnIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : null}

        {activeTab === 2 ? (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF', backgroundImage: 'radial-gradient(#bae6fd 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.8 }}>Interactive document hierarchy tree</Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 1.2 }}>
                    AI mapped all known relations for this artifact across hierarchy paths, sibling documents, incidents, and workflow references.
                  </Typography>
                  <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
                    {renderTree(linkTreeNodes)}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF', height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.8 }}>AI relation evidence</Typography>
                  <Chip label={`Selected node: ${selectedTreeNodeId}`} size="small" sx={{ mb: 1, bgcolor: '#eaf2ff', color: '#1d4ed8', fontWeight: 700 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {selectedNodeRelations.map((line) => (
                      <Paper key={line} elevation={0} sx={{ p: 0.9, borderRadius: 1.8, border: '1px solid #dbeafe', bgcolor: '#f8fbff' }}>
                        <Typography variant="body2" sx={{ color: '#334155' }}>{line}</Typography>
                      </Paper>
                    ))}
                  </Box>
                  <Paper elevation={0} sx={{ mt: 1.2, p: 1, borderRadius: 1.8, border: '1px solid #bfdbfe', bgcolor: '#eef4ff' }}>
                    <Typography variant="caption" sx={{ color: '#1e3a8a', fontWeight: 800, display: 'block' }}>
                      <BotIcon sx={{ fontSize: 12, mr: 0.4, verticalAlign: '-1px' }} />
                      AI interpretation
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1f4aa8' }}>
                      This artifact is in 2 primary hierarchy branches and 4 secondary file-level relations. Confidence is high due to metadata + semantic + workflow co-occurrence.
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Related Folders</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Link</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Created on</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatedFolders.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell><IconButton size="small"><LinkIcon fontSize="small" /></IconButton></TableCell>
                          <TableCell>{row.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #DBDDDF' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Associated Links</Typography>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none', fontWeight: 800 }}>Add Link</Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Created on</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {associatedLinks.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small"><LinkIcon fontSize="small" /></IconButton>
                            <IconButton size="small"><DeleteIcon fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        {activeTab === 3 ? (
          <Box>
            <Grid container spacing={1.2} sx={{ mb: 1.2 }}>
              {[
                { label: 'Total Threads', value: `${commentsByVersion.length}`, tone: '#1D74FF' },
                { label: 'Open Comments', value: `${openCommentsCount}`, tone: '#E43B46' },
                { label: 'Resolved', value: `${resolvedCommentsCount}`, tone: '#00AF95' },
                { label: 'Leadership View', value: 'Enabled', tone: '#1F2366' },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: '1px solid #dbe3ef', borderLeft: `4px solid ${item.tone}` }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>{item.label}</Typography>
                    <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, lineHeight: 1.1 }}>{item.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Version Control Comments</Typography>
                <Chip label="Current Head: v8" size="small" sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 800 }} />
              </Box>

              <Grid container spacing={1} sx={{ mb: 1.2 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField size="small" fullWidth placeholder="Search author, role, version, text..." value={commentSearch} onChange={(event) => setCommentSearch(event.target.value)} />
                </Grid>
                <Grid size={{ xs: 6, md: 3.5 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Version</InputLabel>
                    <Select label="Version" value={commentVersionFilter} onChange={(event) => setCommentVersionFilter(event.target.value as 'all' | 'v8' | 'v7' | 'v6')}>
                      <MenuItem value="all">All Versions</MenuItem>
                      <MenuItem value="v8">v8</MenuItem>
                      <MenuItem value="v7">v7</MenuItem>
                      <MenuItem value="v6">v6</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3.5 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={commentStatusFilter} onChange={(event) => setCommentStatusFilter(event.target.value as 'all' | 'open' | 'resolved')}>
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField multiline minRows={3} placeholder="Add leadership comment or reviewer note..." fullWidth sx={{ mb: 1 }} />
              <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 800, mb: 1.5 }}>Add Comment</Button>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                {visibleComments.map((comment) => (
                  <Paper key={`${comment.author}-${comment.date}`} elevation={0} sx={{ p: 1.2, borderRadius: 1.8, border: '1px solid #DBDDDF', borderLeft: `4px solid ${comment.status === 'open' ? '#E43B46' : '#00AF95'}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'none' }}>{comment.author}</Typography>
                        <Chip size="small" label={comment.role} sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }} />
                        <Chip size="small" label={`Version ${comment.version}`} sx={{ bgcolor: '#eaf2ff', color: '#1d4ed8', fontWeight: 700 }} />
                        <Chip size="small" label={comment.priority.toUpperCase()} sx={{ bgcolor: comment.priority === 'high' ? '#fee2e2' : comment.priority === 'medium' ? '#fff7ed' : '#ecfeff', color: '#0f172a', fontWeight: 700 }} />
                      </Box>
                      <Chip size="small" label={comment.status === 'open' ? 'OPEN THREAD' : 'RESOLVED'} sx={{ bgcolor: comment.status === 'open' ? '#fee2e2' : '#dcfce7', color: comment.status === 'open' ? '#991b1b' : '#166534', fontWeight: 800 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>{comment.date}</Typography>
                    <Typography variant="body2" sx={{ color: '#1f2937' }}>{comment.text}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Trace: {artifactNumber} / {comment.version} / reviewer-thread</Typography>
                      <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                        View in Version Diff
                      </Button>
                    </Box>
                  </Paper>
                ))}
                {visibleComments.length === 0 ? (
                  <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.8, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>No comments match the selected filters.</Typography>
                  </Paper>
                ) : null}
              </Box>
            </Paper>
          </Box>
        ) : null}

        {activeTab === 4 ? (
          <Box>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF', mb: 1.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))', gap: 1 }}>
                {[
                  { step: 'Drafting', date: '01/09/2024', done: true },
                  { step: 'Review', date: '05/09/2025', done: true },
                  { step: 'Approval', date: '07/09/2024', done: true },
                  { step: 'Sign', date: 'Not yet set', done: true },
                  { step: 'Release', date: 'Not yet set', done: false },
                  { step: 'Archive', date: 'Not yet set', done: false },
                ].map((item, index) => (
                  <Box key={item.step} sx={{ textAlign: 'center' }}>
                    <Chip label={index + 1} size="small" sx={{ bgcolor: item.done ? '#1e3a8a' : '#d1d5db', color: 'white', fontWeight: 800, mb: 0.6 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.step}</Typography>
                    <Typography variant="caption">{item.date}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Workflow comments</Typography>
                  <TextField multiline minRows={3} placeholder="Add Comment" fullWidth sx={{ mb: 1 }} />
                  <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 800, mb: 1.2 }}>Add Comment</Button>
                  {commentsByVersion.map((comment) => (
                    <Paper key={`wf-${comment.author}-${comment.date}`} elevation={0} sx={{ p: 1, borderRadius: 1.8, border: '1px solid #e5e7eb', mb: 0.9 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'none' }}>{comment.author}</Typography>
                      <Typography variant="body2">{comment.text}</Typography>
                    </Paper>
                  ))}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF', mb: 1.2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Reviews (5 reviews required)</Typography>
                  {approvalReviewers.map((reviewer) => (
                    <Box key={reviewer.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2">{reviewer.name}</Typography>
                      <Chip
                        size="small"
                        label={reviewer.status}
                        sx={{
                          bgcolor: reviewer.status === 'Approved' ? '#dcfce7' : '#fff7ed',
                          color: reviewer.status === 'Approved' ? '#16a34a' : '#f97316',
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Paper>
                <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid #bfdbfe', bgcolor: '#eef4ff' }}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'none', fontWeight: 800, color: '#1e3a8a', mb: 0.6 }}>
                    <BotIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: '-2px', color: '#1D74FF' }} />
                    AI workflow suggestion
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1f4aa8' }}>
                    BLU.AI identified this artifact as a high-change document. Suggested approval path: Operations Reviewer → QA Lead → Compliance Manager → Digital Signature.
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="contained" sx={{ textTransform: 'none', fontWeight: 800 }}>Apply AI Workflow</Button>
                    <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 800 }}>Customize</Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        {activeTab === 5 ? (
          <Box>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF', mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Time Series</Typography>
              <LineChart
                height={240}
                xAxis={[{ data: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'], scaleType: 'point' }]}
                series={[
                  { id: 'a', data: [705, 704, 710, 709, 707, 712, 711, 714], color: '#1e3a8a', label: 'PF_AAS:FC19115.SP' },
                  { id: 'b', data: [500, 510, 490, 520, 505, 515, 518, 530], color: '#d9480f', label: 'PF_AAS:MK25115.PV' },
                ]}
                margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
              />
              <Typography variant="caption" sx={{ color: '#64748b' }}>AI detected possible anomalies in Sep and Oct connected to this artifact context.</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF', mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Files</Typography>
                <Button variant="text" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none', fontWeight: 800 }}>See all</Button>
              </Box>
              <Grid container spacing={1}>
                {relatedFiles.map((file, idx) => (
                  <Grid key={`${file}-${idx}`} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #e5e7eb', bgcolor: '#f8fafc' }}>
                      <Box sx={{ height: 90, borderRadius: 1.5, border: '1px dashed #cbd5e1', mb: 0.8, display: 'grid', placeItems: 'center' }}>
                        <Typography variant="caption">Preview</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{file}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Incidents</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <BarChart
                    height={260}
                    xAxis={[{ data: ['Jan', 'Feb', 'Apr', 'May', 'Jun', 'Aug', 'Sep'], scaleType: 'band' }]}
                    series={[
                      { id: 's1', data: [35, 15, 40, 33, 14, 2, 15], stack: 'a', color: '#0f3d66' },
                      { id: 's2', data: [4, 22, 5, 3, 8, 17, 6], stack: 'a', color: '#46a6c5' },
                      { id: 's3', data: [3, 5, 8, 31, 22, 18, 4], stack: 'a', color: '#43c777' },
                      { id: 's4', data: [6, 7, 4, 8, 12, 8, 6], stack: 'a', color: '#f59e0b' },
                    ]}
                    margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incidents.map((incident, idx) => (
                        <TableRow key={`${incident.name}-${idx}`}>
                          <TableCell>{incident.name}</TableCell>
                          <TableCell>{incident.category}</TableCell>
                          <TableCell>{incident.date}</TableCell>
                          <TableCell>{incident.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : null}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Artifact</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
          <TextField
            size="small"
            label="Artifact name"
            value={artifactDisplayName}
            onChange={(event) => setArtifactDisplayName(event.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Folder"
            value={artifactFolder}
            onChange={(event) => setArtifactFolder(event.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Description"
            value={artifactDescription}
            onChange={(event) => setArtifactDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditDialogOpen(false);
              setSnackbar({ open: true, message: 'Artifact updated.', severity: 'success' });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDescriptionDialogOpen} onClose={() => setEditDescriptionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Description</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            multiline
            minRows={5}
            fullWidth
            value={artifactDescription}
            onChange={(event) => setArtifactDescription(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDescriptionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditDescriptionDialogOpen(false);
              setSnackbar({ open: true, message: 'Description updated.', severity: 'success' });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editMetadataDialogOpen} onClose={() => setEditMetadataDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Metadata</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Key</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Trace</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metadataEntries.map((entry, idx) => (
                <TableRow key={`${entry.key}-${idx}`}>
                  <TableCell sx={{ width: '36%' }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={entry.key}
                      onChange={(event) =>
                        setMetadataEntries((prev) => prev.map((row, i) => (i === idx ? { ...row, key: event.target.value } : row)))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      value={entry.value}
                      onChange={(event) =>
                        setMetadataEntries((prev) => prev.map((row, i) => (i === idx ? { ...row, value: event.target.value } : row)))
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: '14%' }}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={entry.source}
                        onChange={(event) =>
                          setMetadataEntries((prev) => prev.map((row, i) => (i === idx ? { ...row, source: event.target.value as 'Manual' | 'AI' | 'System' } : row)))
                        }
                      >
                        <MenuItem value="Manual">Manual</MenuItem>
                        <MenuItem value="AI">AI</MenuItem>
                        <MenuItem value="System">System</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={entry.trace}
                      onChange={(event) =>
                        setMetadataEntries((prev) => prev.map((row, i) => (i === idx ? { ...row, trace: event.target.value } : row)))
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: '12%' }}>
                    <TextField
                      size="small"
                      type="number"
                      fullWidth
                      inputProps={{ min: 0, max: 100 }}
                      value={entry.confidence}
                      onChange={(event) =>
                        setMetadataEntries((prev) => prev.map((row, i) => (i === idx ? { ...row, confidence: Number(event.target.value) || 0 } : row)))
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setMetadataEntries((prev) => prev.filter((_, i) => i !== idx))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMetadataDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setEditMetadataDialogOpen(false);
              setSnackbar({ open: true, message: 'Metadata updated.', severity: 'success' });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addMetadataDialogOpen} onClose={() => setAddMetadataDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Metadata</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" label="Metadata Key" fullWidth value={newMetadataKey} onChange={(event) => setNewMetadataKey(event.target.value)} />
            <TextField size="small" label="Metadata Value" fullWidth value={newMetadataValue} onChange={(event) => setNewMetadataValue(event.target.value)} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                handleAddMetadata({ key: newMetadataKey, value: newMetadataValue, source: 'Manual', confidence: 88, trace: 'artifact-manual-link' });
                setNewMetadataKey('');
                setNewMetadataValue('');
                setSnackbar({ open: true, message: 'Metadata added.', severity: 'success' });
              }}
            >
              Add Entry
            </Button>
            <Button variant="outlined" startIcon={<BotIcon />} onClick={handleRunAiMetadataSuggestions}>
              AI Suggest Metadata
            </Button>
          </Box>
          {aiSuggestingMetadata ? (
            <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">BLU.AI is analyzing the document context...</Typography>
            </Box>
          ) : null}
          {aiMetadataSuggestions.length > 0 ? (
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.8, border: '1px solid #DBDDDF', bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.8 }}>
                AI Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                {aiMetadataSuggestions.map((suggestion, idx) => (
                  <Box key={`${suggestion.key}-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2"><b>{suggestion.key}:</b> {suggestion.value}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        handleAddMetadata({ ...suggestion, source: 'AI', confidence: 94, trace: 'ai-semantic-extraction' });
                        setSnackbar({ open: true, message: `Added "${suggestion.key}" from AI suggestion.`, severity: 'success' });
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMetadataDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Artifact</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
          <TextField size="small" label="User or email" value={shareInput} onChange={(event) => setShareInput(event.target.value)} fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Access role</InputLabel>
            <Select label="Access role" value={shareRole} onChange={(event) => setShareRole(event.target.value)}>
              <MenuItem value="Viewer">Viewer</MenuItem>
              <MenuItem value="Editor">Editor</MenuItem>
              <MenuItem value="Approver">Approver</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShareDialogOpen(false);
              setSnackbar({ open: true, message: `Shared with ${shareInput || 'selected user'} as ${shareRole}.`, severity: 'success' });
            }}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move Artifact</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Target location</InputLabel>
            <Select label="Target location" value={moveTarget} onChange={(event) => setMoveTarget(event.target.value)}>
              <MenuItem value="PF-UTL-EFF-DTP-TR05-PMP1">PF-UTL-EFF-DTP-TR05-PMP1</MenuItem>
              <MenuItem value="PF-UTL-EFF-HRT">PF-UTL-EFF-HRT</MenuItem>
              <MenuItem value="PF-UTL-EFF-DTP-TR05-AMJQ">PF-UTL-EFF-DTP-TR05-AMJQ</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setMoveDialogOpen(false);
              setArtifactPath(`Product Family 1 > Product Sub Family > ${moveTarget}`);
              setSnackbar({ open: true, message: 'Artifact moved successfully.', severity: 'success' });
            }}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={translateDialogOpen} onClose={() => setTranslateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Translate Artifact Summary</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Language</InputLabel>
            <Select label="Language" value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)}>
              <MenuItem value="Spanish">Spanish</MenuItem>
              <MenuItem value="Portuguese">Portuguese</MenuItem>
              <MenuItem value="English">English</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={runTranslation}>Translate</Button>
          {translationLoading ? (
            <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Translating...</Typography>
            </Box>
          ) : translatedText ? (
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.8, border: '1px solid #DBDDDF', bgcolor: '#f8fafc' }}>
              <Typography variant="body2">{translatedText}</Typography>
            </Paper>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTranslateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={topicsDialogOpen} onClose={() => setTopicsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Main Topics</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {artifactTopics.map((topic) => (
              <Chip key={topic} label={topic} sx={{ bgcolor: '#eaf2ff', color: '#1d4ed8', fontWeight: 700 }} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

        <Dialog open={aiSummaryDialogOpen} onClose={() => setAiSummaryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Summary</DialogTitle>
        <DialogContent>
          {aiSummaryLoading ? (
            <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">BLU.AI is building summary...</Typography>
            </Box>
          ) : (
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.8, border: '1px solid #bfdbfe', bgcolor: '#eef4ff' }}>
              <Typography variant="body2" sx={{ color: '#1f4aa8' }}>{aiSummaryText}</Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiSummaryDialogOpen(false)}>Close</Button>
        </DialogActions>
        </Dialog>

        <Dialog open={isPreviewExpanded} onClose={() => setIsPreviewExpanded(false)} maxWidth={false} PaperProps={{ sx: { width: '96vw', maxWidth: '1600px' } }} fullWidth>
          <DialogTitle>Expanded Artifact Preview</DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#eef2f7' }}>{renderDocumentWorkspace()}</DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setSnackbar({ open: true, message: 'Document changes saved from expanded view.', severity: 'success' })}
            >
              Save Changes
            </Button>
            <Button onClick={() => setIsPreviewExpanded(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editDocumentDialogOpen} onClose={() => setEditDocumentDialogOpen(false)} maxWidth={false} PaperProps={{ sx: { width: '96vw', maxWidth: '1600px' } }} fullWidth>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#eef2f7' }}>{renderDocumentWorkspace()}</DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDocumentDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => {
                setEditDocumentDialogOpen(false);
                setSnackbar({ open: true, message: 'Document draft updated.', severity: 'success' });
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Artifact</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this artifact?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setDeleteDialogOpen(false);
              setSnackbar({ open: true, message: 'Artifact deleted (simulated).', severity: 'warning' });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2200}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
