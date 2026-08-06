import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  Collapse,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  AutoAwesome as SparkleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  FolderCopy as FolderCopyIcon,
  Public as GlobalIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpIcon,
  TipsAndUpdates as TipsIcon,
  Clear as ClearIcon,
  Send as SendIcon,
} from '@mui/icons-material';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type LifecycleState = 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived' | 'Obsolete';
type DocType = 'SOP' | 'Manual' | 'Work Instruction' | 'NC' | 'Report';
type OcrStatus = 'processed' | 'pending' | 'none';
type LogicOp = 'AND' | 'OR';

interface SearchableDocument {
  id: number;
  name: string;
  type: DocType;
  lifecycle: LifecycleState;
  modified: string;
  owner: string;
  approver: string;
  folder: string;
  isScanned: boolean;
  ocrStatus: OcrStatus;
  contentSnippet: string;
  matchScore?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: { types: string[]; statuses: string[]; owner: string; logic: LogicOp };
}

interface SearchFilters {
  types: string[];
  statuses: string[];
  owner: string;
  dateFrom: string;
  dateTo: string;
  logic: LogicOp;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Mock data
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DOC_TYPES: DocType[] = ['SOP', 'Manual', 'Work Instruction', 'NC', 'Report'];
const LIFECYCLE_STATES: LifecycleState[] = ['Draft', 'In Review', 'Approved', 'Published', 'Archived', 'Obsolete'];

const lifecycleChipStyle: Record<LifecycleState, { color: string; bg: string }> = {
  Draft:       { color: '#044ED7', bg: '#EBEDF0' },
  'In Review': { color: '#FF6E00', bg: '#fff3e0' },
  Approved:    { color: '#1b5e20', bg: '#e8f5e9' },
  Published:   { color: '#006064', bg: '#e0f7fa' },
  Archived:    { color: '#616161', bg: '#f5f5f5' },
  Obsolete:    { color: '#b71c1c', bg: '#ffebee' },
};

const allDocuments: SearchableDocument[] = [
  {
    id: 1, name: 'Health & Safety Manual.docx', type: 'Manual', lifecycle: 'Published',
    modified: '5 mins ago', owner: 'Chris Klopp', approver: 'George Whales',
    folder: 'Formulation', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'This manual defines the maximum temperature limits for Line 2 operations. Personnel must not exceed 85Â°C during any phase of the extrusion process.',
  },
  {
    id: 2, name: 'SOP-001 Changeover Procedure.pdf', type: 'SOP', lifecycle: 'Approved',
    modified: '2 hours ago', owner: 'Marcus Chods', approver: 'George Whales',
    folder: 'Changeover', isScanned: true, ocrStatus: 'processed',
    contentSnippet: 'Changeover from product A to B requires a full purge cycle. Temperature must be set to 40Â°C. Ensure Line 2 is cleared before starting.',
  },
  {
    id: 3, name: 'SOP-014 Deviation Report.docx', type: 'SOP', lifecycle: 'In Review',
    modified: '1 day ago', owner: 'Dougie Wood', approver: 'George Whales',
    folder: 'Quality', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'All quality deviations from line 2 must be reported within 4 hours. Include batch number, equipment ID, and root cause analysis.',
  },
  {
    id: 4, name: 'Employee Handbook.docx', type: 'Manual', lifecycle: 'In Review',
    modified: '5 mins ago', owner: 'George Whales', approver: 'George Whales',
    folder: 'Formulation', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'All employees are required to complete safety training before operating machinery. Annual refresher training is mandatory.',
  },
  {
    id: 5, name: 'NC-2024-0092 Line 2 Stoppage.pdf', type: 'NC', lifecycle: 'Draft',
    modified: '3 days ago', owner: 'Dougie Wood', approver: 'Chris Klopp',
    folder: 'Maintenance', isScanned: true, ocrStatus: 'pending',
    contentSnippet: 'Non-conformance raised for unexpected Line 2 stoppage on 2024-03-15. Root cause: hydraulic pressure below threshold. Corrective action pending.',
  },
  {
    id: 6, name: 'Quality Manual v8.docx', type: 'Manual', lifecycle: 'Approved',
    modified: '6 mins ago', owner: 'Chris Klopp', approver: 'George Whales',
    folder: 'Quality', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'The quality management system covers document control, CAPA, internal audits, and management review. ISO 9001:2015 compliant.',
  },
  {
    id: 7, name: 'WI-042 Syringe Assembly.docx', type: 'Work Instruction', lifecycle: 'Published',
    modified: '1 week ago', owner: 'Marcus Chods', approver: 'Chris Klopp',
    folder: 'Med Delivery', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'Step-by-step work instruction for syringe tip assembly. Torque setting: 2.4 Nm. Temperature: 22Â°C Â±2Â°C in cleanroom.',
  },
  {
    id: 8, name: 'Maintenance Manual v12.docx', type: 'Manual', lifecycle: 'Archived',
    modified: '2 weeks ago', owner: 'George Whales', approver: 'George Whales',
    folder: 'Maintenance', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'Archived version. See v13 for current procedures. Covers preventive maintenance schedules for all assembly line equipment.',
  },
  {
    id: 9, name: 'Report-Q1-2026 Line Performance.pdf', type: 'Report', lifecycle: 'Published',
    modified: '2 days ago', owner: 'Chris Klopp', approver: 'George Whales',
    folder: 'Formulation', isScanned: true, ocrStatus: 'processed',
    contentSnippet: 'Q1 2026 production report. Line 2 achieved 96.4% OEE. Three quality incidents recorded. Temperature excursions: 0. Full audit trail attached.',
  },
  {
    id: 10, name: 'SOP-008 Equipment Cleaning.docx', type: 'SOP', lifecycle: 'Published',
    modified: '4 days ago', owner: 'Dougie Wood', approver: 'Marcus Chods',
    folder: 'SOP', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'Cleaning procedure for all product-contact surfaces. Use approved cleaning agents only. Log cleaning date, agent, concentration, and operator name.',
  },
  {
    id: 11, name: 'NC-2024-0103 Temperature Excursion.pdf', type: 'NC', lifecycle: 'Approved',
    modified: '5 days ago', owner: 'Marcus Chods', approver: 'George Whales',
    folder: 'Quality', isScanned: true, ocrStatus: 'processed',
    contentSnippet: 'Temperature excursion recorded on Line 2 on 2024-08-22. Peak: 91Â°C (limit: 85Â°C). Batch B2024-082 quarantined pending investigation.',
  },
  {
    id: 12, name: 'WI-010 Nexiva Cartridge Fill.docx', type: 'Work Instruction', lifecycle: 'Draft',
    modified: '1 hour ago', owner: 'Chris Klopp', approver: 'George Whales',
    folder: 'Nexiva', isScanned: false, ocrStatus: 'none',
    contentSnippet: 'Draft instruction for Nexiva cartridge fill process. Fill volume: 1.2ml Â±0.05ml. Requires supervisor sign-off before implementation.',
  },
];

const defaultSavedSearches: SavedSearch[] = [
  { id: '1', name: 'SOPs â€“ Published', query: '', filters: { types: ['SOP'], statuses: ['Published'], owner: '', logic: 'AND' } },
  { id: '2', name: 'Awaiting Approval', query: '', filters: { types: [], statuses: ['In Review'], owner: '', logic: 'AND' } },
  { id: '3', name: 'Temperature Docs', query: 'temperature', filters: { types: [], statuses: [], owner: '', logic: 'AND' } },
];

const AI_SAMPLE_QUERIES = [
  'Find all SOPs modified last week about temperature limits',
  'Quality manuals pending approval on Line 2',
  'Documents owned by Chris Klopp expiring this quarter',
  'Non-conformances related to Line 2 stoppages',
];

const AI_MOCK_ANSWERS: Record<string, { summary: string; hits: number[] }> = {
  default: {
    summary: 'Based on your query, I found documents across multiple categories. The most relevant results relate to temperature control procedures and Line 2 operations.',
    hits: [1, 2, 11],
  },
  'temperature': {
    summary: 'Found 3 documents explicitly mentioning temperature limits or excursions. Key reference: Health & Safety Manual sets the 85Â°C ceiling for Line 2.',
    hits: [1, 2, 11],
  },
  'approval': {
    summary: 'Found 2 documents currently In Review status awaiting approval. Assigned approver for most pending docs is George Whales.',
    hits: [3, 4],
  },
  'line 2': {
    summary: 'Found 4 documents referencing Line 2 operations including SOPs, non-conformance reports, and performance reports.',
    hits: [1, 2, 3, 11],
  },
  'chris klopp': {
    summary: 'Chris Klopp owns 4 documents across Quality, Formulation, and Nexiva hierarchy nodes. One draft document is pending final classification.',
    hits: [1, 6, 9, 12],
  },
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: '#fff59d', padding: '0 2px', borderRadius: 2 }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function computeMatchScore(doc: SearchableDocument, query: string): number {
  if (!query.trim()) return 100;
  const q = query.toLowerCase();
  const nameHit = doc.name.toLowerCase().includes(q) ? 40 : 0;
  const snippetWords = q.split(' ').filter(Boolean);
  const snippetHits = snippetWords.filter(w => doc.contentSnippet.toLowerCase().includes(w)).length;
  const snippetScore = Math.round((snippetHits / Math.max(snippetWords.length, 1)) * 60);
  return Math.min(nameHit + snippetScore, 99);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Props
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DocumentAdvancedSearchScreenProps {
  onBack: () => void;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DocumentAdvancedSearchScreen({ onBack }: DocumentAdvancedSearchScreenProps) {
  // Search state
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'current' | 'all'>('all');
  const [filters, setFilters] = useState<SearchFilters>({ types: [], statuses: [], owner: '', dateFrom: '', dateTo: '', logic: 'AND' });

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(defaultSavedSearches);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalName, setSaveModalName] = useState('');

  // AI panel
  const [aiQuery, setAiQuery] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{ summary: string; hits: number[] } | null>(null);

  // UI
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' });
  const aiInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: 'success' | 'info' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // â”€â”€â”€ Filtering logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const results = React.useMemo(() => {
    let pool = allDocuments;

    // Scope
    if (scope === 'current') {
      pool = pool.filter(d => d.folder === 'Formulation');
    }

    // Full-text + name filter
    const q = query.toLowerCase().trim();
    if (q) {
      pool = pool.filter(d =>
        d.name.toLowerCase().includes(q) || d.contentSnippet.toLowerCase().includes(q)
      );
    }

    // Metadata filters
    const hasTypeFilter = filters.types.length > 0;
    const hasStatusFilter = filters.statuses.length > 0;
    const hasOwnerFilter = !!filters.owner.trim();

    pool = pool.filter(d => {
      const typeMatch = !hasTypeFilter || filters.types.includes(d.type);
      const statusMatch = !hasStatusFilter || filters.statuses.includes(d.lifecycle);
      const ownerMatch = !hasOwnerFilter || d.owner.toLowerCase().includes(filters.owner.toLowerCase());

      if (filters.logic === 'AND') return typeMatch && statusMatch && ownerMatch;
      // OR: if any filter is set, at least one must match; if none set, always true
      if (!hasTypeFilter && !hasStatusFilter && !hasOwnerFilter) return true;
      return (hasTypeFilter && typeMatch) || (hasStatusFilter && statusMatch) || (hasOwnerFilter && ownerMatch);
    });

    // Attach match scores
    return pool.map(d => ({ ...d, matchScore: computeMatchScore(d, q) }))
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [query, scope, filters]);

  // â”€â”€â”€ Saved searches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const applySavedSearch = (s: SavedSearch) => {
    setQuery(s.query);
    setFilters(prev => ({ ...prev, types: s.filters.types, statuses: s.filters.statuses, owner: s.filters.owner, logic: s.filters.logic }));
    showSnackbar(`Applied: "${s.name}"`, 'info');
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    showSnackbar('Saved search removed', 'info');
  };

  const handleSaveSearch = () => {
    if (!saveModalName.trim()) return;
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveModalName.trim(),
      query,
      filters: { types: filters.types, statuses: filters.statuses, owner: filters.owner, logic: filters.logic },
    };
    setSavedSearches(prev => [...prev, newSearch]);
    setSaveModalOpen(false);
    setSaveModalName('');
    showSnackbar('Search saved!', 'success');
  };

  // â”€â”€â”€ AI search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const runAiSearch = (q: string) => {
    setAiQuery(q);
    setAiAnswer(null);
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
      const lq = q.toLowerCase();
      const key = Object.keys(AI_MOCK_ANSWERS).find(k => k !== 'default' && lq.includes(k));
      setAiAnswer(key ? AI_MOCK_ANSWERS[key] : AI_MOCK_ANSWERS['default']);
    }, 1200);
  };

  // â”€â”€â”€ Filter helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleType = (t: string) =>
    setFilters(prev => ({ ...prev, types: prev.types.includes(t) ? prev.types.filter(x => x !== t) : [...prev.types, t] }));
  const toggleStatus = (s: string) =>
    setFilters(prev => ({ ...prev, statuses: prev.statuses.includes(s) ? prev.statuses.filter(x => x !== s) : [...prev.statuses, s] }));
  const clearAllFilters = () => setFilters({ types: [], statuses: [], owner: '', dateFrom: '', dateTo: '', logic: 'AND' });
  const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0 || filters.owner || filters.dateFrom || filters.dateTo;

  const activeFilterCount = filters.types.length + filters.statuses.length + (filters.owner ? 1 : 0) + (filters.dateFrom || filters.dateTo ? 1 : 0);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HEADER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 3, 
        py: 1.5, 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #DBDDDF', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        zIndex: 10
      }}>
        <IconButton 
          onClick={onBack} 
          size="small"
          sx={{ 
            bgcolor: 'rgba(0,0,0,0.03)', 
            '&:hover': { bgcolor: 'rgba(0,0,0,0.07)' },
            mr: 1
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ color: '#1F2366', fontWeight: 800, lineHeight: 1.2 }}>
            Advanced Search
          </Typography>
          <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500, mt: 0.5 }}>
            Enterprise-grade full-text indexing across documents, metadata, and OCR-extracted text
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          GLOBAL SEARCH BAR & SCOPE
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ px: 3, py: 3, bgcolor: '#EBEDF0', borderBottom: '1px solid #DBDDDF' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', maxWidth: 1400, mx: 'auto' }}>
          {/* Scope toggle - Bento Style */}
          <Paper elevation={0} sx={{ 
            display: 'flex', 
            p: 0.5, 
            bgcolor: 'white', 
            border: '1px solid #DBDDDF', 
            borderRadius: 3, 
            overflow: 'hidden', 
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <Button
              size="small"
              startIcon={<FolderCopyIcon sx={{ fontSize: 18 }} />}
              onClick={() => setScope('current')}
              sx={{
                px: 2, py: 1, borderRadius: 2, textTransform: 'none', fontSize: '0.85rem', fontWeight: 700,
                bgcolor: scope === 'current' ? '#044ED7' : 'transparent',
                color: scope === 'current' ? 'white' : '#626465',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: scope === 'current' ? '#1D74FF' : '#EBEDF0' },
              }}
            >
              Current
            </Button>
            <Button
              size="small"
              startIcon={<GlobalIcon sx={{ fontSize: 18 }} />}
              onClick={() => setScope('all')}
              sx={{
                px: 2, py: 1, borderRadius: 2, textTransform: 'none', fontSize: '0.85rem', fontWeight: 700,
                bgcolor: scope === 'all' ? '#044ED7' : 'transparent',
                color: scope === 'all' ? 'white' : '#626465',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: scope === 'all' ? '#1D74FF' : '#EBEDF0' },
              }}
            >
              Global
            </Button>
          </Paper>

          {/* Main search input - Premium Style */}
          <TextField
              fullWidth
              placeholder="Search document names, deep content, metadata, or OCR text..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              sx={{
                '& .MuiInputBase-root': { 
                  bgcolor: 'white', 
                  borderRadius: 4, 
                  fontSize: '1rem',
                  height: 52,
                  px: 2,
                  border: '1px solid #DBDDDF',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#cbd5e1' },
                  '&.Mui-focused': { borderColor: '#044ED7', boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)' }
                },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#044ED7', fontSize: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setQuery('')} sx={{ color: '#808285' }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : (
                   <InputAdornment position="end">
                    <Box sx={{ px: 1, py: 0.5, bgcolor: '#EBEDF0', borderRadius: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, fontSize: '0.65rem' }}>âŒ˜ K</Typography>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />

          {/* Results count badge */}
          <Paper elevation={0} sx={{ 
            px: 2, py: 1.5, bgcolor: '#EBEDF0', border: '1px solid #DBDDDF', borderRadius: 3,
            display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0
          }}>
            <Box sx={{ width: 8, height: 8, bgcolor: '#044ED7', borderRadius: '50%' }} />
            <Typography sx={{ color: '#1e40af', fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {results.length} results found
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN BODY: Left Sidebar | Table | AI Panel
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LEFT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{ 
          width: 280, 
          minWidth: 280, 
          bgcolor: 'white', 
          borderRight: '1px solid #DBDDDF', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          gap: 3
        }}>

          {/* Filter header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TuneIcon sx={{ fontSize: 20, color: '#1F2366' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#1F2366', fontSize: '0.95rem' }}>Filters</Typography>
              {activeFilterCount > 0 && (
                <Chip 
                  label={activeFilterCount} 
                  size="small" 
                  sx={{ bgcolor: '#044ED7', color: 'white', fontWeight: 900, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Box>
            {hasActiveFilters && (
              <Button 
                variant="text" 
                size="small" 
                onClick={clearAllFilters} 
                sx={{ fontSize: '0.72rem', color: '#E43B46', fontWeight: 700, textTransform: 'none', p: 0.5, borderRadius: 1.5 }}
              >
                Reset
              </Button>
            )}
          </Box>

          {/* AND / OR Logic toggle */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Filter Logic
            </Typography>
            <Paper elevation={0} sx={{ display: 'flex', p: 0.5, bgcolor: '#EBEDF0', border: '1px solid #DBDDDF', borderRadius: 2 }}>
              {(['AND', 'OR'] as LogicOp[]).map(op => (
                <Button
                  key={op}
                  fullWidth
                  size="small"
                  onClick={() => setFilters(prev => ({ ...prev, logic: op }))}
                  sx={{
                    py: 0.5, borderRadius: 1.5, textTransform: 'none', fontSize: '0.78rem', fontWeight: 800,
                    bgcolor: filters.logic === op ? 'white' : 'transparent',
                    color: filters.logic === op ? '#1F2366' : '#626465',
                    boxShadow: filters.logic === op ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: filters.logic === op ? 'white' : '#EBEDF0' },
                  }}
                >
                  {op}
                </Button>
              ))}
            </Paper>
          </Box>

          {/* Document Type */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Document Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {DOC_TYPES.map(t => (
                <Chip
                  key={t}
                  label={t}
                  onClick={() => toggleType(t)}
                  sx={{
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: filters.types.includes(t) ? 800 : 500,
                    bgcolor: filters.types.includes(t) ? '#044ED7' : '#EBEDF0',
                    color: filters.types.includes(t) ? 'white' : '#626465',
                    border: '1px solid',
                    borderColor: filters.types.includes(t) ? '#1D74FF' : '#DBDDDF',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: filters.types.includes(t) ? '#1D74FF' : '#DBDDDF' },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Lifecycle Status */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Lifecycle Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {LIFECYCLE_STATES.map(s => {
                const cfg = lifecycleChipStyle[s];
                const active = filters.statuses.includes(s);
                return (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => toggleStatus(s)}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      bgcolor: active ? cfg.color : 'white',
                      color: active ? 'white' : cfg.color,
                      border: `1px solid ${cfg.color}`,
                      opacity: active ? 1 : 0.6,
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { opacity: 1, bgcolor: active ? cfg.color : '#EBEDF0' },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Owner */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Owner
            </Typography>
            <TextField
              size="small"
              placeholder="System search owner..."
              value={filters.owner}
              onChange={e => setFilters(prev => ({ ...prev, owner: e.target.value }))}
              fullWidth
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.85rem', 
                  borderRadius: 2,
                  bgcolor: '#EBEDF0',
                  '& fieldset': { borderColor: '#DBDDDF' },
                } 
              }}
            />
          </Box>

          {/* Date Range */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Modification Window
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                size="small"
                placeholder="From date..."
                value={filters.dateFrom}
                onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.82rem', borderRadius: 2, bgcolor: '#EBEDF0' } }}
              />
              <TextField
                size="small"
                placeholder="To date..."
                value={filters.dateTo}
                onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.82rem', borderRadius: 2, bgcolor: '#EBEDF0' } }}
              />
            </Box>
          </Box>

          {/* â”€â”€â”€ Saved Searches â”€â”€â”€ */}
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #DBDDDF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookmarkIcon sx={{ fontSize: 18, color: '#FF6E00' }} />
                <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Saved Filters
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setSaveModalOpen(true)}
                sx={{ bgcolor: '#EBEDF0', color: '#044ED7', '&:hover': { bgcolor: '#DBDDDF' } }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {savedSearches.map(s => (
              <Box
                key={s.id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5, px: 1,
                  borderRadius: 1, cursor: 'pointer', mb: 0.5,
                  '&:hover': { bgcolor: '#f5f5f5' },
                  '&:hover .delete-btn': { opacity: 1 },
                }}
                onClick={() => applySavedSearch(s)}
              >
                <BookmarkBorderIcon sx={{ fontSize: 13, color: '#FF6E00', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.78rem', flexGrow: 1, color: '#333' }}>{s.name}</Typography>
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={e => { e.stopPropagation(); deleteSavedSearch(s.id); }}
                  sx={{ p: 0.25, opacity: 0, transition: 'opacity 0.15s', color: '#bbb', '&:hover': { color: '#E43B46' } }}
                >
                  <DeleteIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            ))}

            {savedSearches.length === 0 && (
              <Typography variant="caption" sx={{ color: '#bbb', display: 'block', textAlign: 'center', py: 2 }}>
                No saved searches yet
              </Typography>
            )}

            {/* Save search modal (inline) */}
            <Collapse in={saveModalOpen}>
              <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#060A3D', display: 'block', mb: 1 }}>
                  Save Current Search
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search nameâ€¦"
                  value={saveModalName}
                  onChange={e => setSaveModalName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveSearch(); if (e.key === 'Escape') setSaveModalOpen(false); }}
                  autoFocus
                  sx={{ mb: 1, '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" onClick={handleSaveSearch} disabled={!saveModalName.trim()} sx={{ fontSize: '0.72rem', py: 0.25 }}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => { setSaveModalOpen(false); setSaveModalName(''); }} sx={{ fontSize: '0.72rem', py: 0.25 }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CENTER: RESULTS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', bgcolor: 'white' }}>
          {results.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#808285', p: 4, bgcolor: '#EBEDF0' }}>
              <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', mb: 3 }}>
                <SearchIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#626465', fontWeight: 800, mb: 1 }}>No matching records</Typography>
              <Typography variant="body2" sx={{ color: '#808285', maxWidth: 300, textAlign: 'center', mb: 3 }}>
                Refine your selection or try broader search terms to find what you're looking for.
              </Typography>
              {hasActiveFilters && (
                <Button 
                  variant="contained" 
                  onClick={clearAllFilters} 
                  sx={{ 
                    bgcolor: '#044ED7', 
                    borderRadius: 2.5, 
                    textTransform: 'none', 
                    fontWeight: 700,
                    px: 3
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#EBEDF0', borderBottom: '1px solid #DBDDDF', color: '#626465', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2, px: 2 } }}>
                    <TableCell sx={{ minWidth: 300 }}>File Information</TableCell>
                    <TableCell sx={{ width: 100 }}>Relevance</TableCell>
                    <TableCell sx={{ width: 100 }}>Doc Type</TableCell>
                    <TableCell sx={{ width: 120 }}>Lifecycle</TableCell>
                    <TableCell sx={{ width: 120 }}>Last Modified</TableCell>
                    <TableCell sx={{ width: 150 }}>Owner</TableCell>
                    <TableCell sx={{ width: 150 }}>Hierarchy</TableCell>
                    <TableCell sx={{ minWidth: 250 }}>Content Insight</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map(doc => {
                    const lcfg = lifecycleChipStyle[doc.lifecycle];
                    const score = doc.matchScore ?? 0;
                    const scoreColor = score > 70 ? '#00AF95' : score > 40 ? '#FF6E00' : '#808285';
                    const isAiHighlighted = aiAnswer?.hits.includes(doc.id);

                    return (
                      <TableRow
                        key={doc.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '& td': { borderBottom: '1px solid #EBEDF0', py: 2.5, px: 2, fontSize: '0.85rem' },
                          transition: 'all 0.2s',
                          bgcolor: isAiHighlighted ? 'rgba(124, 58, 237, 0.03)' : 'transparent',
                          '&:hover': { bgcolor: '#EBEDF0' },
                          ...(isAiHighlighted && { '& td:first-of-type': { borderLeft: '4px solid #9199D8' } }),
                        }}
                      >
                        {/* Name + OCR */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: isAiHighlighted ? '#f5f3ff' : '#EBEDF0', 
                              borderRadius: 2,
                              color: isAiHighlighted ? '#9199D8' : '#044ED7',
                              display: 'flex'
                            }}>
                              <DescriptionIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.3 }}>
                                {highlight(doc.name, query)}
                              </Typography>
                              {doc.isScanned && (
                                <Chip
                                  label={doc.ocrStatus === 'processed' ? 'V-OCR ACTIVE' : 'OCR QUEUED'}
                                  size="small"
                                  onClick={() => {
                                    if (doc.ocrStatus === 'pending') showSnackbar('OCR processing prioritized...', 'info');
                                  }}
                                  sx={{
                                    height: 18, fontSize: '0.6rem', mt: 0.75, fontWeight: 900,
                                    bgcolor: doc.ocrStatus === 'processed' ? '#ecfdf5' : '#EBEDF0',
                                    color: doc.ocrStatus === 'processed' ? '#00AF95' : '#626465',
                                    border: '1px solid',
                                    borderColor: doc.ocrStatus === 'processed' ? '#00AF95' : '#DBDDDF',
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              )}
                            </Box>
                            {isAiHighlighted && (
                              <Tooltip title="AI Recommended Hit">
                                <SparkleIcon sx={{ fontSize: 16, color: '#9199D8', ml: 'auto' }} />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        {/* Match score */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography sx={{ fontWeight: 900, color: scoreColor, fontSize: '0.75rem', lineHeight: 1 }}>
                              {score}%
                            </Typography>
                            <Box sx={{ width: 60, height: 6, bgcolor: '#EBEDF0', borderRadius: 4, overflow: 'hidden' }}>
                              <Box sx={{ 
                                width: `${score}%`, 
                                height: '100%', 
                                bgcolor: scoreColor, 
                                borderRadius: 4, 
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: `0 0 8px ${scoreColor}44`
                              }} />
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: '#626465', fontSize: '0.8rem' }}>{doc.type}</Typography>
                        </TableCell>

                        {/* Lifecycle */}
                        <TableCell>
                          <Chip 
                            label={doc.lifecycle} 
                            size="small" 
                            sx={{ 
                              bgcolor: lcfg.bg, 
                              color: lcfg.color, 
                              fontWeight: 900, 
                              fontSize: '0.65rem', 
                              height: 22, 
                              borderRadius: 1.5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                              border: `1px solid ${lcfg.color}33`
                            }} 
                          />
                        </TableCell>

                        {/* Modified */}
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500 }}>{doc.modified}</Typography>
                        </TableCell>

                        {/* Owner */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: 12, bgcolor: '#FF6E00', fontWeight: 800 }}>{doc.owner?.charAt(0)}</Avatar>
                            <Typography sx={{ fontWeight: 600, color: '#1F2366' }}>{doc.owner}</Typography>
                          </Box>
                        </TableCell>

                        {/* Hierarchy */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderIcon sx={{ fontSize: 18, color: '#fcd34d' }} />
                            <Typography sx={{ fontWeight: 600, color: '#626465' }}>{doc.folder}</Typography>
                          </Box>
                        </TableCell>

                        {/* Content snippet */}
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#626465',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.6,
                              fontSize: '0.78rem',
                              fontStyle: 'italic'
                            }}
                          >
                            "{highlight(doc.contentSnippet, query)}"
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RIGHT: AI PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box
          sx={{
            width: 360, minWidth: 360,
            bgcolor: '#EBEDF0',
            borderLeft: '1px solid #DBDDDF',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            p: 3,
            gap: 3
          }}
        >
          {/* AI panel header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #DBDDDF' }}>
              <SparkleIcon sx={{ color: '#9199D8', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#1F2366', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>
                V-Intelligence
              </Typography>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Neural Search Layer
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#DBDDDF' }} />

          {/* Sample queries */}
          <Box>
            <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Instant Analysis suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {AI_SAMPLE_QUERIES.map((q, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  onClick={() => runAiSearch(q)}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2,
                    borderRadius: 3, cursor: 'pointer', bgcolor: 'white',
                    border: '1px solid #DBDDDF', transition: 'all 0.2s',
                    '&:hover': { borderColor: '#9199D8', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.1)' },
                  }}
                >
                  <TipsIcon sx={{ fontSize: 16, color: '#9199D8', mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#626465', fontWeight: 600, lineHeight: 1.5, fontSize: '0.8rem' }}>
                    {q}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* AI input - Bento Search */}
          <Box sx={{ mt: 'auto' }}>
             <Paper elevation={0} sx={{ 
               p: 2, 
               bgcolor: 'white', 
               borderRadius: 4, 
               border: '1px solid #DBDDDF',
               boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
             }}>
                <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6rem' }}>
                  Semantic Query
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Ask V-Intelligence about repository content..."
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (aiQuery.trim()) runAiSearch(aiQuery); } }}
                    inputRef={aiInputRef}
                    variant="standard"
                    sx={{
                      '& .MuiInputBase-root': {
                        color: '#1F2366', fontSize: '0.9rem', fontWeight: 600,
                        '&:before, &:after': { display: 'none' },
                      },
                      '& .MuiInputBase-input::placeholder': { color: '#808285', opacity: 1 },
                    }}
                  />
                  <IconButton
                    disabled={!aiQuery.trim() || aiThinking}
                    onClick={() => { if (aiQuery.trim()) runAiSearch(aiQuery); }}
                    sx={{
                      bgcolor: '#9199D8', color: 'white', p: 1, borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#6d28d9', transform: 'scale(1.05)' },
                      '&.Mui-disabled': { bgcolor: '#EBEDF0', color: '#cbd5e1' },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
             </Paper>
          </Box>

          {/* AI thinking */}
          {aiThinking && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <SparkleIcon sx={{ fontSize: 16, color: '#9199D8', animation: 'pulse 2s infinite' }} />
                <Typography sx={{ color: '#9199D8', fontWeight: 800, fontSize: '0.85rem' }}>Synthesizing knowledge...</Typography>
              </Box>
              <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#f5f3ff', '& .MuiLinearProgress-bar': { bgcolor: '#9199D8', borderRadius: 3 } }} />
            </Box>
          )}

          {/* AI answer */}
          {aiAnswer && !aiThinking && (
            <Box sx={{ mt: 3, overflowY: 'auto', flexGrow: 1, pr: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#DBDDDF', borderRadius: 4 } }}>
              <Paper elevation={0} sx={{ 
                p: 2.5, 
                bgcolor: '#f5f3ff', 
                borderRadius: 4, 
                border: '1px solid #ddd6fe', 
                mb: 3,
                boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <SparkleIcon sx={{ fontSize: 16, color: '#9199D8' }} />
                  <Typography variant="caption" sx={{ color: '#9199D8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                    V-Insight Report
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#4c1d95', lineHeight: 1.7, fontSize: '0.9rem', fontWeight: 600 }}>
                  {aiAnswer.summary}
                </Typography>
              </Paper>

              {/* Matched doc list */}
              <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                Relevant Artifacts Found ({aiAnswer.hits.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {aiAnswer.hits.map(id => {
                  const doc = allDocuments.find(d => d.id === id);
                  if (!doc) return null;
                  return (
                    <Paper
                      key={id}
                      elevation={0}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
                        borderRadius: 3, bgcolor: 'white',
                        border: '1px solid #DBDDDF', cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#9199D8', transform: 'translateX(4px)' },
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 18, color: '#044ED7' }} />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography sx={{ color: '#1F2366', display: 'block', lineHeight: 1.2, fontSize: '0.8rem', fontWeight: 800 }}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#626465', fontSize: '0.68rem', fontWeight: 500 }}>
                          {doc.type} Â· {doc.folder}
                        </Typography>
                      </Box>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#00AF95' }} />
                    </Paper>
                  );
                })}
              </Box>

              {/* Disclaimer */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#fffbeb', borderRadius: 3, display: 'flex', gap: 1.5, border: '1px solid #fef3c7' }}>
                <HelpIcon sx={{ fontSize: 16, color: '#d97706', mt: 0.15, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.7rem', lineHeight: 1.5, fontWeight: 500 }}>
                  <span style={{ fontWeight: 800, display: 'block', marginBottom: '2px' }}>AI VERIFICATION REQUIRED</span>
                  Contents are synthetically aggregated. Verify with original source for compliance.
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() => { setAiAnswer(null); setAiQuery(''); }}
                sx={{ mt: 2, color: '#626465', fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', p: 1, borderRadius: 2, '&:hover': { bgcolor: '#EBEDF0' } }}
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
              >
                Reset Intelligence View
              </Button>
            </Box>
          )}

          {/* Empty AI state */}
          {!aiAnswer && !aiThinking && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 3, opacity: 0.7 }}>
              <SparkleIcon sx={{ fontSize: 32, color: '#bbdefb', mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#888', textAlign: 'center', lineHeight: 1.4 }}>
                Click a sample query or type your own question to search using natural language
              </Typography>
            </Box>
          )}
        </Box>

      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

