import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Chip, TextField, InputAdornment,
  Tabs, Tab, Avatar, Divider, Snackbar, Alert, LinearProgress, Tooltip,
  Card, CardContent, Grid, Collapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, AutoAwesome as SparkleIcon, Search as SearchIcon,
  Send as SendIcon, CloudUpload as UploadIcon, Description as DocIcon,
  CheckCircle as CheckIcon, Warning as WarningIcon, Psychology as BrainIcon,
  Category as ClassifyIcon, Scanner as ScanIcon, Summarize as SummarizeIcon,
  Compare as CompareIcon, Edit as EditIcon, AccountTree as WorkflowIcon,
  Schedule as ScheduleIcon, Label as TagIcon, Shield as ShieldIcon,
  Security as SecurityIcon, School as TrainingIcon, TrendingUp as TrendIcon,
  Close as CloseIcon, ContentCopy as CopyIcon, ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon, HelpOutline as HelpIcon,
  Visibility as ViewIcon, Speed as SpeedIcon, Flag as FlagIcon,
  GppGood as ComplianceIcon, Quiz as QuizIcon, Article as ArticleIcon,
  DataObject as DataIcon, TableChart as TableIcon, Draw as SignIcon,
  CalendarMonth as CalendarIcon, ErrorOutline as AlertIcon,
  Download as DownloadIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';

// â”€â”€â”€ Types â”€â”€â”€
interface ChatMessage { role: 'user' | 'ai'; text: string; sources?: string[]; }
interface ClassificationResult {
  type: string;
  category: string;
  tags: string[];
  metadata: Array<{ key: string; value: string }>;
  entities: string[];
  recommendedPath: string;
  placementActions: string[];
}
interface ExtractedField { label: string; value: string; region: string; confidence: number; }

// â”€â”€â”€ Constants â”€â”€â”€
const SAMPLE_QUESTIONS = [
  'What is the max temperature limit for Line 2?',
  'Show all SOPs modified last week about safety',
  'Which documents are pending approval for Q1?',
  'Find non-conformances related to hydraulic pressure',
];

const AI_CHAT_RESPONSES: Record<string, { text: string; sources: string[] }> = {
  'temperature': {
    text: 'Based on my analysis of 3 documents, the **maximum temperature limit for Line 2** is **85Â°C** during any phase of the extrusion process.\n\n**Key details:**\n- Health & Safety Manual (Section 4.2): Sets the 85Â°C ceiling\n- SOP-001 Changeover: Requires 40Â°C during changeover\n- NC-2024-0103: Recorded an excursion to 91Â°C (6Â°C over limit)\n\nâš ï¸ The most recent incident report suggests the sensor calibration may need review.',
    sources: ['Health & Safety Manual.docx', 'SOP-001 Changeover Procedure.pdf', 'NC-2024-0103 Temperature Excursion.pdf'],
  },
  'sop': {
    text: 'I found **4 SOPs** modified in the last 7 days related to safety:\n\n1. **SOP-001 Changeover Procedure** â€” Updated temperature thresholds\n2. **SOP-008 Equipment Cleaning** â€” New cleaning agent requirements\n3. **SOP-014 Deviation Report** â€” Modified reporting timeline from 8h to 4h\n4. **WI-042 Syringe Assembly** â€” Updated torque specifications\n\nAll documents are currently in the approval pipeline.',
    sources: ['SOP-001 Changeover Procedure.pdf', 'SOP-008 Equipment Cleaning.docx', 'SOP-014 Deviation Report.docx', 'WI-042 Syringe Assembly.docx'],
  },
  'default': {
    text: 'I analyzed **12 documents** across your repository and found **3 relevant matches**.\n\nThe most relevant document is the **Quality Manual v8** which covers document control procedures, CAPA management, and internal audits. It is ISO 9001:2015 compliant.\n\nWould you like me to summarize any of these documents in detail?',
    sources: ['Quality Manual v8.docx', 'Health & Safety Manual.docx', 'Report-Q1-2026 Line Performance.pdf'],
  },
};

const CLASSIFICATION_STAGES = ['Analyzing content...', 'Detecting document type...', 'Assigning category...', 'Extracting metadata...', 'Generating tags...'];

const IDP_FIELDS: ExtractedField[] = [
  { label: 'Document Title', value: 'SOP-001 Changeover Procedure', region: 'Header', confidence: 98 },
  { label: 'Effective Date', value: '2026-03-15', region: 'Header', confidence: 95 },
  { label: 'Author', value: 'Marcus Chods', region: 'Header', confidence: 97 },
  { label: 'Temperature Limit', value: '85Â°C', region: 'Section 2.4', confidence: 92 },
  { label: 'Batch Number', value: 'B2026-042', region: 'Table Row 3', confidence: 88 },
  { label: 'Equipment ID', value: 'EQ-LINE2-001', region: 'Section 1.1', confidence: 94 },
  { label: 'Signature', value: 'George Whales (Approved)', region: 'Footer', confidence: 86 },
  { label: 'Revision Number', value: 'Rev 10', region: 'Header', confidence: 99 },
];

// â”€â”€â”€ Props â”€â”€â”€
interface DocumentAIHubScreenProps { onBack: () => void; }

// â”€â”€â”€ Component â”€â”€â”€
export default function DocumentAIHubScreen({ onBack }: DocumentAIHubScreenProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' });
  const show = (message: string, severity: 'success' | 'info' | 'error' = 'info') => setSnackbar({ open: true, message, severity });

  // â”€â”€ Tab 1: Conversational Search â”€â”€
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendChat = (q: string) => {
    if (!q.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    setChatThinking(true);
    setTimeout(() => {
      const lq = q.toLowerCase();
      const key = Object.keys(AI_CHAT_RESPONSES).find(k => k !== 'default' && lq.includes(k));
      const resp = AI_CHAT_RESPONSES[key || 'default'];
      setChatMessages(prev => [...prev, { role: 'ai', text: resp.text, sources: resp.sources }]);
      setChatThinking(false);
    }, 1800);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatThinking]);

  // â”€â”€ Tab 1: Classification â”€â”€
  const [classResult, setClassResult] = useState<ClassificationResult | null>(null);
  const [classStage, setClassStage] = useState(-1);
  const [classRunning, setClassRunning] = useState(false);

  const runClassification = () => {
    setClassResult(null); setClassRunning(true); setClassStage(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < CLASSIFICATION_STAGES.length) { setClassStage(i); }
      else {
        clearInterval(iv); setClassRunning(false); setClassStage(-1);
        setClassResult({
          type: 'SOP',
          category: 'Quality > Changeover',
          tags: ['Line 2', 'Temperature', 'Changeover', 'Safety', 'Autoguard'],
          metadata: [
            { key: 'Site', value: 'Sandy' },
            { key: 'Line', value: 'Line 2' },
            { key: 'Asset', value: 'Autoguard Conveyor' },
            { key: 'Business Line', value: 'Medication Delivery Solutions' },
            { key: 'Document Owner', value: 'Marcus Chods' },
            { key: 'Review Cycle', value: '6 months' },
          ],
          entities: ['EQ-LINE2-001', 'SOP-001', 'NC-2024-0103', 'WO-2481'],
          recommendedPath: 'Product Family 1 > Product Sub Family > Quality > Line 2 > Autoguard Conveyor > SOP',
          placementActions: [
            'Associate with equipment entity EQ-LINE2-001',
            'Link related NC-2024-0103 for traceability',
            'Assign owner and approver metadata before publish',
            'Route to Quality > Changeover approval workflow',
          ],
        });
      }
    }, 600);
  };

  // â”€â”€ Tab 1: IDP â”€â”€
  const [idpRunning, setIdpRunning] = useState(false);
  const [idpResults, setIdpResults] = useState<ExtractedField[]>([]);

  const runIDP = () => {
    setIdpResults([]); setIdpRunning(true);
    let idx = 0;
    const iv = setInterval(() => {
      if (idx < IDP_FIELDS.length) { const current = idx; idx++; setIdpResults(prev => [...prev, IDP_FIELDS[current]]); }
      else { clearInterval(iv); setIdpRunning(false); show('Extraction complete â€” 8 fields identified', 'success'); }
    }, 350);
  };

  // â”€â”€ Tab 2 State â”€â”€
  const [summaryRunning, setSummaryRunning] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [selectedSummaryDoc, setSelectedSummaryDoc] = useState<string>('');
  const [diffRunning, setDiffRunning] = useState(false);
  const [diffDone, setDiffDone] = useState(false);
  const [copilotSuggestions, setCopilotSuggestions] = useState<string[]>([]);
  const [copilotRunning, setCopilotRunning] = useState(false);

  // â”€â”€ Tab 3 State â”€â”€
  const [routingRunning, setRoutingRunning] = useState(false);
  const [routingDone, setRoutingDone] = useState(false);
  const [expiryRunning, setExpiryRunning] = useState(false);
  const [expiryDone, setExpiryDone] = useState(false);
  const [taggingRunning, setTaggingRunning] = useState(false);
  const [taggingDone, setTaggingDone] = useState(false);

  // â”€â”€ Tab 4 State â”€â”€
  const [anomalyRunning, setAnomalyRunning] = useState(false);
  const [anomalyDone, setAnomalyDone] = useState(false);
  const [complianceRunning, setComplianceRunning] = useState(false);
  const [complianceDone, setComplianceDone] = useState(false);
  const [trainingRunning, setTrainingRunning] = useState(false);
  const [trainingDone, setTrainingDone] = useState(false);

  // â”€â”€ Generic AI runner â”€â”€
  const runAI = (setRunning: (v:boolean)=>void, setDone: (v:boolean)=>void, msg: string, delay = 2000) => {
    setRunning(true); setDone(false);
    setTimeout(() => { setRunning(false); setDone(true); show(msg, 'success'); }, delay);
  };

  // â”€â”€ Summary runner â”€â”€
  const runSummary = (docName: string) => {
    setSelectedSummaryDoc(docName);
    setSummaryText(''); setSummaryRunning(true);
    const fullText = `**Executive Summary â€” ${docName}**\n\nâ€¢ Purpose: Defines operating and compliance controls for this artifact\nâ€¢ Key Change: Safety threshold and approval notes updated in latest revision\nâ€¢ Impact: Cross-functional impact across operators, QA, and compliance reviewers\nâ€¢ Risk Level: Medium â€” training and acknowledgement recommended\nâ€¢ Compliance: Alignment check completed against ISO and internal SOP standards\nâ€¢ Action Items: Validate metadata links, confirm entity associations, and route approvals\nâ€¢ Next Review: Follow defined review cycle for this document class`;
    let i = 0;
    const iv = setInterval(() => {
      if (i < fullText.length) { setSummaryText(fullText.slice(0, i + 3)); i += 3; }
      else { clearInterval(iv); setSummaryRunning(false); show('Summary generated', 'success'); }
    }, 15);
  };

  const runSmartChangeDetection = () => {
    runAI(setDiffRunning, setDiffDone, 'Semantic diff complete â€” 3 changes detected', 2200);
  };

  // â”€â”€ Copilot runner â”€â”€
  const runCopilot = () => {
    setCopilotSuggestions([]); setCopilotRunning(true);
    const suggestions = [
      'âš ï¸ Section 2.1: Missing required "Scope" definition per ISO 9001:2015 clause 4.3',
      'ðŸ’¡ Consider adding a risk assessment table (recommended for SOPs with safety implications)',
      'âœ… Document header format is compliant with internal template standards',
      'ðŸ”§ Auto-fix: "celcius" â†’ "Celsius" (3 occurrences found)',
      'ðŸ“‹ Suggestion: Add cross-reference to related NC-2024-0103 in Section 3',
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < suggestions.length) { setCopilotSuggestions(prev => [...prev, suggestions[i]]); i++; }
      else { clearInterval(iv); setCopilotRunning(false); }
    }, 700);
  };

  // â”€â”€â”€ Tab rendering helpers â”€â”€â”€
  const ModuleCard = ({ icon, title, desc, children, color = '#044ED7' }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode; color?: string }) => (
    <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0', mb: 2.5 }}>
      <Box sx={{ px: 2.5, py: 1.5, background: `linear-gradient(135deg, ${color}08, ${color}15)`, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#060A3D', lineHeight: 1.2 }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.68rem' }}>{desc}</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );

  const renderTab1 = () => (
    <Grid container spacing={2.5}>
      {/* 1. Conversational Search */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<SearchIcon fontSize="small" />} title="Document Deep Dive" desc="Retrieval-first AI chat to investigate evidence, versions, and traceability" color="#0f3d66">
          {/* Sample questions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <Chip key={i} label={q} size="small" clickable onClick={() => sendChat(q)}
                sx={{ fontSize: '0.68rem', height: 24, bgcolor: '#e6f4ff', color: '#0f3d66', border: '1px solid #b6d7f2', '&:hover': { bgcolor: '#d5ebff' } }} />
            ))}
          </Box>
          {/* Chat area */}
          <Box sx={{ height: 320, bgcolor: '#f7fbff', borderRadius: 2, border: '1px solid #dbe7f3', mb: 1.5, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {chatMessages.length === 0 && !chatThinking && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                <SearchIcon sx={{ fontSize: 32, color: '#0f3d66', mb: 1 }} />
                <Typography variant="caption" sx={{ color: '#4b5563', textAlign: 'center' }}>Start a deep dive: ask for findings, clauses, limits, or version deltas.</Typography>
                <Box sx={{ display: 'flex', gap: 0.6, mt: 1 }}>
                  {['retrieval', 'citations', 'trace'].map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ height: 18, fontSize: '0.58rem', bgcolor: '#e6f4ff', color: '#0f3d66', border: '1px solid #b6d7f2' }} />
                  ))}
                </Box>
              </Box>
            )}
            {chatMessages.map((m, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
                {m.role === 'ai' && <Avatar sx={{ width: 24, height: 24, bgcolor: '#0f3d66', mt: 0.5 }}><SearchIcon sx={{ fontSize: 14 }} /></Avatar>}
                <Box sx={{ maxWidth: '85%', p: 1.5, borderRadius: 2, bgcolor: m.role === 'user' ? '#0f3d66' : 'white', color: m.role === 'user' ? 'white' : '#1f2937', border: m.role === 'ai' ? '1px solid #dbe7f3' : 'none' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{m.text}</Typography>
                  {m.sources && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #edf2f7' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.6rem' }}>RETRIEVED EVIDENCE:</Typography>
                      {m.sources.map((s, j) => (
                        <Chip key={j} icon={<DocIcon sx={{ fontSize: '11px !important' }} />} label={s} size="small" sx={{ mr: 0.5, mt: 0.5, height: 18, fontSize: '0.6rem', bgcolor: '#eef6ff', color: '#0f3d66', border: '1px solid #dbe7f3' }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            {chatThinking && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#0f3d66' }}><SearchIcon sx={{ fontSize: 14 }} /></Avatar>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #dbe7f3' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map(d => <Box key={d} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0f3d66', animation: 'pulse 1.2s infinite', animationDelay: `${d * 0.3}s`, '@keyframes pulse': { '0%, 100%': { opacity: 0.3 }, '50%': { opacity: 1 } } }} />)}
                  </Box>
                </Box>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>
          {/* Input */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" placeholder="Document deep dive: ask for evidence, limits, incidents, or version differences..." value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.82rem' } }} />
            <IconButton onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatThinking}
              sx={{ bgcolor: '#0f3d66', color: 'white', '&:hover': { bgcolor: '#0b3152' }, '&.Mui-disabled': { bgcolor: '#e0e0e0' } }}>
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </ModuleCard>
      </Grid>

      {/* 2. Auto-Classification */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<ClassifyIcon fontSize="small" />} title="AI Document Classification" desc="Auto-classify documents by type, category, and metadata" color="#00AF95">
          <Box sx={{ border: '2px dashed #a5d6a7', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: '#f1f8e9', transition: '0.2s', '&:hover': { bgcolor: '#e8f5e9', borderColor: '#00AF95' }, mb: 2 }}
            onClick={runClassification}>
            <UploadIcon sx={{ fontSize: 36, color: '#00AF95', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#00AF95' }}>Drop document here to classify</Typography>
            <Typography variant="caption" color="text.secondary">or click to simulate classification</Typography>
          </Box>
          {classRunning && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#e8f5e9', '& .MuiLinearProgress-bar': { bgcolor: '#00AF95' } }} />
              <Typography variant="caption" sx={{ color: '#00AF95', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SparkleIcon sx={{ fontSize: 12 }} /> {CLASSIFICATION_STAGES[classStage] || 'Processing...'}
              </Typography>
            </Box>
          )}
          {classResult && (
            <Paper sx={{ p: 2, bgcolor: '#f1f8e9', border: '1px solid #c8e6c9', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CheckIcon sx={{ color: '#00AF95', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20' }}>Classification and Placement Guidance Ready</Typography>
              </Box>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{classResult.type}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Category</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{classResult.category}</Typography></Grid>
              </Grid>
              <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block', mb: 0.4 }}>Recommended folder hierarchy</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#14532d', mb: 1.1 }}>
                {classResult.recommendedPath}
              </Typography>
              <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block', mb: 0.4 }}>Required metadata</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.1 }}>
                {classResult.metadata.map((m, i) => (
                  <Chip key={i} label={`${m.key}: ${m.value}`} size="small" sx={{ height: 20, fontSize: '0.62rem', bgcolor: '#e8f5e9', color: '#0f5132', fontWeight: 600 }} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block', mb: 0.4 }}>Entity associations</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.1 }}>
                {classResult.entities.map((entity, i) => <Chip key={i} label={entity} size="small" sx={{ height: 20, fontSize: '0.62rem', bgcolor: '#eef6ff', color: '#0f3d66', fontWeight: 600 }} />)}
              </Box>
              <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block', mb: 0.4 }}>Placement actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                {classResult.placementActions.map((step, i) => (
                  <Typography key={i} variant="caption" sx={{ color: '#14532d', fontSize: '0.68rem' }}>
                    {i + 1}. {step}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ mt: 1.2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {classResult.tags.map((t, i) => <Chip key={i} label={t} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 600 }} />)}
              </Box>
            </Paper>
          )}
        </ModuleCard>

        {/* 3. IDP */}
        <ModuleCard icon={<ScanIcon fontSize="small" />} title="Intelligent Document Processing" desc="OCR + AI to extract structured data from documents" color="#FF6E00">
          <Button variant="contained" size="small" startIcon={<ScanIcon />} onClick={runIDP} disabled={idpRunning}
            sx={{ bgcolor: '#FF6E00', mb: 2, '&:hover': { bgcolor: '#bf360c' } }}>
            {idpRunning ? 'Extracting...' : 'Run IDP Extraction'}
          </Button>
          {idpRunning && <LinearProgress sx={{ mb: 1.5, borderRadius: 4, bgcolor: '#fff3e0', '& .MuiLinearProgress-bar': { bgcolor: '#FF6E00' } }} />}
          {idpResults.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {idpResults.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: '#fff8e1', border: '1px solid #ffe0b2', gap: 1, animation: 'fadeIn 0.3s', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                  <DataIcon sx={{ fontSize: 14, color: '#FF6E00', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: '#888', fontSize: '0.6rem', display: 'block' }}>{f.label} â€” <em>{f.region}</em></Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{f.value}</Typography>
                  </Box>
                  <Chip label={`${f.confidence}%`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: f.confidence > 90 ? '#e8f5e9' : '#fff3e0', color: f.confidence > 90 ? '#00AF95' : '#FF6E00' }} />
                </Box>
              ))}
            </Box>
          )}
        </ModuleCard>
      </Grid>
    </Grid>
  );

  const renderTab2 = () => (
    <Grid container spacing={2.5}>
      {/* 4. AI Summaries */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<SummarizeIcon fontSize="small" />} title="AI Document Summaries" desc="Generate executive summaries for long documents" color="#044ED7">
          <Box sx={{ display: 'flex', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
            {['SOP-001 Changeover', 'Quality Manual v8', 'H&S Manual', 'Autoguard Safety SOP.docx'].map((doc) => (
              <Chip
                key={doc}
                label={doc}
                size="small"
                clickable
                onClick={() => runSummary(doc)}
                sx={{
                  bgcolor: selectedSummaryDoc === doc ? '#1D74FF' : '#EBEDF0',
                  color: selectedSummaryDoc === doc ? 'white' : '#044ED7',
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.2 }}>
            Select one of your documents to generate summary and auto-run smart change detection.
          </Typography>
          {summaryRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#EBEDF0', '& .MuiLinearProgress-bar': { bgcolor: '#044ED7' } }} />}
          <Box sx={{ minHeight: 200, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            {summaryText ? (
              <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#333' }}>{summaryText}</Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, flexDirection: 'column' }}>
                <SummarizeIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption">Select a document to generate summary</Typography>
              </Box>
            )}
          </Box>
        </ModuleCard>
      </Grid>

      {/* 5. Smart Change Detection */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<CompareIcon fontSize="small" />} title="Smart Change Detection" desc="Semantic diff with impact analysis & compliance risk flags" color="#E43B46">
          <Paper sx={{ p: 1.2, mb: 1.2, border: '1px solid #ffcdd2', borderRadius: 1.8, bgcolor: '#fff8f8' }}>
            <Typography variant="caption" sx={{ color: '#7f1d1d', fontWeight: 700 }}>
              {selectedSummaryDoc
                ? `Auto comparison target: ${selectedSummaryDoc} (latest revision vs previous revision)`
                : 'Select a document in AI Document Summaries to trigger automatic change detection.'}
            </Typography>
          </Paper>
          {diffRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#ffebee', '& .MuiLinearProgress-bar': { bgcolor: '#ef5350' } }} />}
          {diffDone && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Paper sx={{ p: 1.5, border: '1px solid #ffcdd2', borderLeft: '4px solid #ef5350', borderRadius: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <Chip label="HIGH IMPACT" size="small" sx={{ bgcolor: '#ffebee', color: '#E43B46', fontWeight: 700, height: 18, fontSize: '0.6rem' }} />
                  <Typography variant="caption" sx={{ color: '#888' }}>Section 2.4</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                  <span style={{ color: '#E43B46', textDecoration: 'line-through' }}>Max Temperature: 70Â°C</span> â†’ <span style={{ color: '#00AF95', fontWeight: 600 }}>Max Temperature: 65Â°C</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#FF6E00', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <WarningIcon sx={{ fontSize: 12 }} /> Safety-critical parameter â€” requires retraining
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, border: '1px solid #c8e6c9', borderLeft: '4px solid #00AF95', borderRadius: 1.5 }}>
                <Chip label="LOW IMPACT" size="small" sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 700, height: 18, fontSize: '0.6rem', mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>Added sensor calibration note in Section 3.1</Typography>
              </Paper>
              <Paper sx={{ p: 1.5, border: '1px solid #bbdefb', borderLeft: '4px solid #42a5f5', borderRadius: 1.5 }}>
                <Chip label="FORMATTING" size="small" sx={{ bgcolor: '#EBEDF0', color: '#044ED7', fontWeight: 700, height: 18, fontSize: '0.6rem', mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>Updated header date format to ISO 8601</Typography>
              </Paper>
            </Box>
          )}
        </ModuleCard>
      </Grid>

      {/* 6. AI Copilot */}
      <Grid size={{ xs: 12 }}>
        <ModuleCard icon={<EditIcon fontSize="small" />} title="AI Copilot for Document Authoring" desc="In-editor AI assistant for writing, formatting, and compliance" color="#00695c">
          <Button variant="contained" size="small" startIcon={<SparkleIcon />} onClick={runCopilot} disabled={copilotRunning}
            sx={{ bgcolor: '#00695c', mb: 2, '&:hover': { bgcolor: '#004d40' } }}>
            {copilotRunning ? 'Analyzing document...' : 'Run AI Analysis on Current Draft'}
          </Button>
          {copilotRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#e0f2f1', '& .MuiLinearProgress-bar': { bgcolor: '#26a69a' } }} />}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {copilotSuggestions.map((s, i) => (
              <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#f1f8e9', border: '1px solid #c8e6c9', display: 'flex', alignItems: 'flex-start', gap: 1, animation: 'fadeIn 0.4s', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } } }}>
                <SparkleIcon sx={{ fontSize: 14, color: '#00695c', mt: 0.2 }} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{s}</Typography>
                <Button size="small" sx={{ ml: 'auto', fontSize: '0.65rem', minWidth: 50, color: '#00695c' }} onClick={() => show('Applied suggestion', 'success')}>Apply</Button>
              </Box>
            ))}
            {copilotSuggestions.length === 0 && !copilotRunning && (
              <Box sx={{ p: 3, textAlign: 'center', opacity: 0.4 }}>
                <EditIcon sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block">Run analysis to get AI suggestions</Typography>
              </Box>
            )}
          </Box>
        </ModuleCard>
      </Grid>
    </Grid>
  );

  useEffect(() => {
    if (!selectedSummaryDoc) return;
    runSmartChangeDetection();
  }, [selectedSummaryDoc]);

  const renderTab3 = () => (
    <Grid container spacing={2.5}>
      {/* 7. Predictive Routing */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<WorkflowIcon fontSize="small" />} title="Predictive Workflow Routing" desc="AI suggests optimal reviewers and predicts approval timeline" color="#044ED7">
          <Button variant="contained" size="small" startIcon={<BrainIcon />} onClick={() => runAI(setRoutingRunning, setRoutingDone, 'Routing prediction complete', 1800)} disabled={routingRunning}
            sx={{ bgcolor: '#044ED7', mb: 2, '&:hover': { bgcolor: '#0d47a1' } }}>
            {routingRunning ? 'Predicting...' : 'Predict Optimal Route'}
          </Button>
          {routingRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4 }} />}
          {routingDone && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { name: 'George Whales', role: 'Quality Manager', confidence: 96, time: '~2 days', avatar: 'GW' },
                { name: 'Chris Klopp', role: 'Safety Lead', confidence: 89, time: '~1 day', avatar: 'CK' },
                { name: 'Marcus Chods', role: 'Line Supervisor', confidence: 82, time: '~3 days', avatar: 'MC' },
              ].map((r, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: i === 0 ? '#EBEDF0' : '#fafbff', border: `1px solid ${i === 0 ? '#90caf9' : '#e0e0e0'}` }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: i === 0 ? '#044ED7' : '#90a4ae', fontSize: 12 }}>{r.avatar}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.role} â€¢ ETA: {r.time}</Typography>
                  </Box>
                  <Chip label={`${r.confidence}%`} size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem', bgcolor: r.confidence > 90 ? '#e8f5e9' : '#fff3e0', color: r.confidence > 90 ? '#00AF95' : '#FF6E00' }} />
                  {i === 0 && <Chip label="RECOMMENDED" size="small" sx={{ bgcolor: '#044ED7', color: 'white', fontWeight: 700, height: 18, fontSize: '0.55rem' }} />}
                </Box>
              ))}
              <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon sx={{ fontSize: 16, color: '#044ED7' }} />
                <Typography variant="caption" sx={{ color: '#555' }}>Historical accuracy: <strong>91.3%</strong> across 284 past routings</Typography>
              </Box>
            </Box>
          )}
        </ModuleCard>
      </Grid>

      {/* 8. Expiry Prediction */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<ScheduleIcon fontSize="small" />} title="Document Expiry Prediction" desc="Predict which documents will need revision based on patterns" color="#f57f17">
          <Button variant="contained" size="small" startIcon={<CalendarIcon />} onClick={() => runAI(setExpiryRunning, setExpiryDone, 'Expiry predictions generated', 1600)} disabled={expiryRunning}
            sx={{ bgcolor: '#f57f17', mb: 2, '&:hover': { bgcolor: '#FF6E00' } }}>
            {expiryRunning ? 'Predicting...' : 'Predict Expiry Risk'}
          </Button>
          {expiryRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#fff8e1', '& .MuiLinearProgress-bar': { bgcolor: '#ffb300' } }} />}
          {expiryDone && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {[
                { doc: 'SOP-001 Changeover Procedure', risk: 'HIGH', days: 12, reason: 'Regulatory update pending' },
                { doc: 'Health & Safety Manual', risk: 'MEDIUM', days: 45, reason: 'Annual review cycle approaching' },
                { doc: 'WI-042 Syringe Assembly', risk: 'LOW', days: 120, reason: 'Stable - no external changes' },
              ].map((d, i) => (
                <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: d.risk === 'HIGH' ? '#ffcdd2' : d.risk === 'MEDIUM' ? '#ffe0b2' : '#c8e6c9', bgcolor: d.risk === 'HIGH' ? '#fff5f5' : d.risk === 'MEDIUM' ? '#fffde7' : '#f9fbe7' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={d.risk} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: d.risk === 'HIGH' ? '#ef5350' : d.risk === 'MEDIUM' ? '#FF6E00' : '#00AF95', color: 'white' }} />
                    <Typography variant="caption" color="text.secondary">{d.days} days until predicted revision</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{d.doc}</Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>{d.reason}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </ModuleCard>
      </Grid>

      {/* 9. Auto-Tagging */}
      <Grid size={{ xs: 12 }}>
        <ModuleCard icon={<TagIcon fontSize="small" />} title="Auto-Tagging & Metadata Enrichment" desc="Extract and assign metadata tags from document content automatically" color="#6a1b9a">
          <Button variant="contained" size="small" startIcon={<TagIcon />} onClick={() => { setTaggingDone(false); setTaggingRunning(true); setTimeout(() => { setTaggingRunning(false); setTaggingDone(true); show('Tags extracted from 12 documents', 'success'); }, 2000); }} disabled={taggingRunning}
            sx={{ bgcolor: '#6a1b9a', mb: 2, '&:hover': { bgcolor: '#4a148c' } }}>
            {taggingRunning ? 'Extracting tags...' : 'Auto-Tag Repository'}
          </Button>
          {taggingRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#f3e5f5', '& .MuiLinearProgress-bar': { bgcolor: '#ab47bc' } }} />}
          {taggingDone && (
            <Grid container spacing={1.5}>
              {[
                { category: 'Equipment', tags: ['Autoguard', 'EQ-LINE2-001', 'Hydraulic Press #4', 'Syringe Station'] },
                { category: 'Materials', tags: ['Cleaning Agent A', 'Cartridge 1.2ml', 'Gasket Type-B'] },
                { category: 'Parameters', tags: ['85Â°C', '2.4 Nm', '40Â°C', '22Â°C Â±2Â°C', '1.2ml Â±0.05ml'] },
                { category: 'People', tags: ['George Whales', 'Chris Klopp', 'Marcus Chods', 'Dougie Wood'] },
                { category: 'Standards', tags: ['ISO 9001:2015', 'ISO 13485', '21 CFR Part 11'] },
              ].map((g, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#faf5ff', border: '1px solid #e1bee7' }}>
                    <Typography variant="caption" sx={{ color: '#6a1b9a', fontWeight: 700, mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.6rem' }}>{g.category}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {g.tags.map((t, j) => <Chip key={j} label={t} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f3e5f5', color: '#6a1b9a', fontWeight: 500 }} />)}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </ModuleCard>
      </Grid>
    </Grid>
  );

  const renderTab4 = () => (
    <Grid container spacing={2.5}>
      {/* 10. Anomaly Detection */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<SecurityIcon fontSize="small" />} title="Anomaly & Risk Detection" desc="Real-time monitoring for unusual patterns and security threats" color="#E43B46">
          <Button variant="contained" size="small" startIcon={<SecurityIcon />} onClick={() => runAI(setAnomalyRunning, setAnomalyDone, 'Security scan complete â€” 3 anomalies detected', 2000)} disabled={anomalyRunning}
            sx={{ bgcolor: '#E43B46', mb: 2, '&:hover': { bgcolor: '#b71c1c' } }}>
            {anomalyRunning ? 'Scanning...' : 'Run Security Scan'}
          </Button>
          {anomalyRunning && <LinearProgress color="error" sx={{ mb: 1, borderRadius: 4 }} />}
          {anomalyDone && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {[
                { severity: 'CRITICAL', title: 'Bulk download detected', desc: 'User "jsmith" downloaded 47 documents in 5 minutes', time: '12 mins ago', color: '#E43B46' },
                { severity: 'WARNING', title: 'After-hours access', desc: 'Login from unusual IP (192.168.5.42) at 2:30 AM', time: '6 hours ago', color: '#FF6E00' },
    { severity: 'INFO', title: 'Permission escalation', desc: 'User "mchods" granted admin access to Quality hierarchy node', time: '1 day ago', color: '#044ED7' },
              ].map((a, i) => (
                <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, borderLeft: `4px solid ${a.color}`, bgcolor: `${a.color}08`, border: `1px solid ${a.color}30` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <Chip label={a.severity} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, height: 18, fontSize: '0.55rem' }} />
                    <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{a.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{a.desc}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </ModuleCard>
      </Grid>

      {/* 11. Compliance Gap Analysis */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ModuleCard icon={<ComplianceIcon fontSize="small" />} title="Compliance Gap Analysis" desc="Scan documents against regulatory frameworks for gaps" color="#00AF95">
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label="FDA 21 CFR Part 11" size="small" clickable onClick={() => runAI(setComplianceRunning, setComplianceDone, 'Compliance scan complete', 2200)} sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 600, border: '1px solid #a5d6a7' }} />
            <Chip label="ISO 9001" size="small" clickable onClick={() => runAI(setComplianceRunning, setComplianceDone, 'ISO 9001 analysis complete', 2200)} sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 600, border: '1px solid #a5d6a7' }} />
            <Chip label="ISO 13485" size="small" clickable onClick={() => runAI(setComplianceRunning, setComplianceDone, 'ISO 13485 analysis complete', 2200)} sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 600, border: '1px solid #a5d6a7' }} />
          </Box>
          {complianceRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#e8f5e9', '& .MuiLinearProgress-bar': { bgcolor: '#00AF95' } }} />}
          {complianceDone && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1.5, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00AF95' }}>78%</Typography>
                  <Typography variant="caption" color="text.secondary">Overall Compliance</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#ffebee', borderRadius: 1.5, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#E43B46' }}>4</Typography>
                  <Typography variant="caption" color="text.secondary">Critical Gaps</Typography>
                </Box>
              </Box>
              {[
                { gap: 'Missing electronic signature framework', section: 'Â§11.50', severity: 'Critical' },
                { gap: 'Audit trail not immutable', section: 'Â§11.10(e)', severity: 'Critical' },
                { gap: 'No session timeout configured', section: 'Â§11.10(d)', severity: 'Major' },
              ].map((g, i) => (
                <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e0e0e0', display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AlertIcon sx={{ fontSize: 16, color: g.severity === 'Critical' ? '#E43B46' : '#FF6E00' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{g.gap}</Typography>
                    <Typography variant="caption" color="text.secondary">Reference: {g.section}</Typography>
                  </Box>
                  <Chip label={g.severity} size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, bgcolor: g.severity === 'Critical' ? '#ffebee' : '#fff3e0', color: g.severity === 'Critical' ? '#E43B46' : '#FF6E00' }} />
                </Box>
              ))}
            </Box>
          )}
        </ModuleCard>
      </Grid>

      {/* 12. Training Content Generation */}
      <Grid size={{ xs: 12 }}>
        <ModuleCard icon={<TrainingIcon fontSize="small" />} title="AI Training Content Generation" desc="Auto-generate quizzes, training materials, and assessments from SOPs" color="#0277bd">
          <Button variant="contained" size="small" startIcon={<QuizIcon />} onClick={() => runAI(setTrainingRunning, setTrainingDone, 'Training content generated from SOP-001', 2000)} disabled={trainingRunning}
            sx={{ bgcolor: '#0277bd', mb: 2, '&:hover': { bgcolor: '#01579b' } }}>
            {trainingRunning ? 'Generating...' : 'Generate from SOP-001'}
          </Button>
          {trainingRunning && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: '#e1f5fe', '& .MuiLinearProgress-bar': { bgcolor: '#29b6f6' } }} />}
          {trainingDone && (
            <Grid container spacing={1.5}>
              {[
                { q: 'What is the maximum temperature limit during changeover on Line 2?', options: ['85Â°C', '70Â°C', '40Â°C', '65Â°C'], correct: 2, type: 'Multiple Choice' },
                { q: 'Which step must be completed BEFORE starting a product changeover?', options: ['Sensor calibration', 'Full purge cycle', 'Supervisor approval', 'Quality check'], correct: 1, type: 'Multiple Choice' },
                { q: 'True or False: Operators can skip the purge cycle if line clearance was done within 24 hours.', options: ['True', 'False'], correct: 1, type: 'True/False' },
              ].map((quiz, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                    <Chip label={`Q${i + 1} Â· ${quiz.type}`} size="small" sx={{ mb: 1, bgcolor: '#e1f5fe', color: '#0277bd', fontWeight: 700, height: 20, fontSize: '0.6rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', mb: 1.5, lineHeight: 1.3 }}>{quiz.q}</Typography>
                    {quiz.options.map((o, j) => (
                      <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 0.75, borderRadius: 1, mb: 0.5, bgcolor: j === quiz.correct ? '#e8f5e9' : '#fafafa', border: `1px solid ${j === quiz.correct ? '#a5d6a7' : '#e0e0e0'}`, cursor: 'pointer', '&:hover': { bgcolor: j === quiz.correct ? '#c8e6c9' : '#f5f5f5' } }}
                        onClick={() => show(j === quiz.correct ? 'Correct!' : 'Incorrect', j === quiz.correct ? 'success' : 'error')}>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: j === quiz.correct ? 700 : 400, color: j === quiz.correct ? '#00AF95' : '#555' }}>{String.fromCharCode(65 + j)}) {o}</Typography>
                        {j === quiz.correct && <CheckIcon sx={{ fontSize: 14, color: '#00AF95', ml: 'auto' }} />}
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </ModuleCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: '#EBEDF0', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      fontFamily: '"Fira Sans", sans-serif',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, rgba(248, 250, 252, 1) 100%)',
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Fira+Sans:wght@300;400;500;600;700;800&display=swap');
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); borderRadius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}
      </style>
      {/* Header */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} size="small"><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.02em' }}>
              AI Intelligence Hub
            </Typography>
            <Chip icon={<SparkleIcon sx={{ fontSize: '14px !important', color: '#7b1fa2 !important' }} />} label="12 Capabilities" size="small"
              sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 700, border: '1px solid #ce93d8' }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Centralized AI-powered document intelligence â€” search, classify, analyze, and automate</Typography>
        </Box>
      </Box>

      {/* â•â•â•â•â• KPI BENTO GRID â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, 
        py: 1.5, 
        display: 'flex', 
        gap: 2,
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {[
          { label: 'AI Queries', value: '1,284', color: '#7b1fa2', bg: 'rgba(123, 31, 162, 0.1)', icon: <SparkleIcon sx={{ fontSize: 18 }} /> },
          { label: 'Docs Analyzed', value: '452', color: '#1D74FF', bg: 'rgba(59, 130, 246, 0.1)', icon: <DocIcon sx={{ fontSize: 18 }} /> },
          { label: 'Avg Confidence', value: '94%', color: '#00AF95', bg: 'rgba(16, 185, 129, 0.1)', icon: <SpeedIcon sx={{ fontSize: 18 }} /> },
          { label: 'Entities Found', value: '8.4K', color: '#FF6E00', bg: 'rgba(245, 158, 11, 0.1)', icon: <DataIcon sx={{ fontSize: 18 }} /> },
          { label: 'Risks Flagged', value: '12', color: '#E43B46', bg: 'rgba(239, 68, 68, 0.1)', icon: <SecurityIcon sx={{ fontSize: 18 }} /> },
          { label: 'Compliance Index', value: '98.2', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: <ComplianceIcon sx={{ fontSize: 18 }} /> },
        ].map((kpi, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              px: 3,
              py: 1.5,
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              minWidth: 200,
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                borderColor: kpi.color,
              },
            }}
          >
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: 2, 
              bgcolor: kpi.bg, 
              color: kpi.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {kpi.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2, fontSize: '1rem' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.025em', display: 'block' }}>
                {kpi.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, py: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' } }}>
          <Tab icon={<SearchIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Search & Discovery" />
          <Tab icon={<EditIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Content & Authoring" />
          <Tab icon={<WorkflowIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Workflow & Prediction" />
          <Tab icon={<ShieldIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Compliance & Security" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
        {activeTab === 0 && renderTab1()}
        {activeTab === 1 && renderTab2()}
        {activeTab === 2 && renderTab3()}
        {activeTab === 3 && renderTab4()}
      </Box>

      {/* Disclaimer */}
      <Box sx={{ px: 3, py: 0.75, bgcolor: '#fff3e0', borderTop: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpIcon sx={{ fontSize: 14, color: '#FF6E00' }} />
        <Typography variant="caption" sx={{ color: '#FF6E00', fontSize: '0.65rem' }}>
          AI-generated results are simulated for demonstration. Always verify against source documents before acting.
        </Typography>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

