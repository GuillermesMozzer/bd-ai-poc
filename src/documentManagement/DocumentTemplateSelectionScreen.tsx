import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  TextField,
  Chip,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  InputAdornment,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Description as WordIcon,
  TableChart as ExcelIcon,
  PresentToAll as PptIcon,
  PictureAsPdf as PdfIcon,
  ChevronRight as ChevronRightIcon,
  AutoAwesome as SparkleIcon,
  Star as StarIcon,
  InsertDriveFile as FileIcon,
  History as HistoryIcon,
  FactCheck as ComplianceIcon,
  Speed as TempoIcon,
  Collections as LibraryIcon,
} from '@mui/icons-material';

/**
 * SMART FACTORY - INDUSTRIAL HIGH DENSITY DESIGN
 * Template Selection Screen - Audited Style
 */

const stats = [
  { label: 'TOTAL TEMPLATES', value: '8', icon: <LibraryIcon sx={{ fontSize: 18 }} />, color: '#1D74FF', bg: '#EBEDF0' },
  { label: 'USAGE COUNT (MTD)', value: '142', icon: <HistoryIcon sx={{ fontSize: 18 }} />, color: '#FF6E00', bg: '#fffbeb' },
  { label: 'AVG TIME TO SETUP', value: '14m', icon: <TempoIcon sx={{ fontSize: 18 }} />, color: '#9199D8', bg: '#f5f3ff' },
  { label: 'COMPLIANCE RATE', value: '100%', icon: <ComplianceIcon sx={{ fontSize: 18 }} />, color: '#00AF95', bg: '#ecfdf5' },
  { label: 'PRIVATE BLUEPRINTS', value: '2', icon: <StarIcon sx={{ fontSize: 18 }} />, color: '#9199D8', bg: '#eef2ff' },
];

const templates = [
  { id: 1, title: 'Client Onboarding SOP', type: 'Word', desc: 'Standard operating procedure for new client intake and initial configuration.', author: 'Systems Admin', folder: 'Operations' },
  { id: 2, title: 'Monthly Financial Audit', type: 'Excel', desc: 'Internal ledger reconciliation and cash flow statement template.', author: 'Finance Mgr', folder: 'Finance' },
  { id: 3, title: 'Compliance Handbook 2024', type: 'PDF', desc: 'Official regulatory guide for corporate governance and quality standards.', author: 'Legal Lead', folder: 'Legal' },
  { id: 4, title: 'Strategy Alignment Deck', type: 'PPT', desc: 'Internal framework for visualizing OKRs and quarterly roadmap.', author: 'Strategy Exec', folder: 'Planning' },
  { id: 5, title: 'Quality Deviation Report', type: 'Word', desc: 'Standardized manufacturing quality deviation log for line managers.', author: 'Quality Dept', folder: 'Quality', popular: true },
  { id: 6, title: 'Safety Incident Log', type: 'Excel', desc: 'Comprehensive OHS compliance tracking tool with auto-reporting.', author: 'Safety Officer', folder: 'Security', popular: true },
  { id: 7, title: 'Employment Contract', type: 'Word', desc: 'Legal template for full-time employee contracts and NDA protocols.', author: 'HR Lead', folder: 'Legal' },
  { id: 8, title: 'Inventory Tracker', type: 'Excel', desc: 'Asset management and stock level monitoring for warehouse operations.', author: 'Ops Team', folder: 'Operations' },
];

interface DocumentTemplateSelectionScreenProps {
  onBack: () => void;
  onNavigateToSetup: (prefillOptions?: any) => void;
}

export default function DocumentTemplateSelectionScreen({ onBack, onNavigateToSetup }: DocumentTemplateSelectionScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (filterType !== 'All' && t.type !== filterType) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterType, searchQuery]);

  const popularItems = useMemo(() => templates.filter(t => t.popular), []);

  const getFormatIcon = (type: string, color?: string) => {
    const sx = { fontSize: 20, color: color || 'inherit' };
    switch (type) {
      case 'Excel': return <ExcelIcon sx={sx} />;
      case 'PPT': return <PptIcon sx={sx} />;
      case 'PDF': return <PdfIcon sx={sx} />;
      default: return <WordIcon sx={sx} />;
    }
  };

  const getFormatColor = (type: string) => {
    switch (type) {
      case 'Excel': return '#00AF95';
      case 'PPT': return '#FF6E00';
      case 'PDF': return '#E43B46';
      default: return '#1D74FF';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#EBEDF0',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Fira Sans", sans-serif',
      background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, rgba(248, 250, 252, 1) 100%)',
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Fira+Sans:wght@300;400;500;600;700;800&display=swap');
        `}
      </style>

      {/* â•â•â• TOP BAR - MATCHED TO AUDIT TRAIL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, 
        py: 2.5, 
        bgcolor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        zIndex: 10,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        <IconButton 
          onClick={onBack} 
          size="small" 
          sx={{ 
            bgcolor: '#EBEDF0', 
            border: '1px solid #EBEDF0',
            borderRadius: '10px',
            '&:hover': { bgcolor: '#EBEDF0' }
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Blueprint Library
          </Typography>
          <Typography variant="body2" sx={{ color: '#626465', fontWeight: 600, mt: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ENTERPRISE VISUAL TEMPLATES & SERVICE LEVEL COMPLIANCE MONITORING
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileIcon sx={{ fontSize: 18 }} />}
            sx={{ px: 2, fontWeight: 700, borderRadius: '8px', textTransform: 'none', borderColor: '#DBDDDF', color: '#626465' }}
          >
            REQUEST TEMPLATE
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<SparkleIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: '#1D74FF', '&:hover': { bgcolor: '#044ED7' }, px: 2, fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
          >
            AI DIGITIZATION
          </Button>
        </Box>
      </Box>

      {/* â•â•â• STATS ROW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, 
        py: 2, 
        display: 'flex', 
        gap: 2,
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
      }}>
        {stats.map((s, idx) => (
          <Paper key={idx} elevation={0} sx={{ 
            px: 3, 
            py: 1.5, 
            bgcolor: 'white', 
            border: '1px solid rgba(226, 232, 240, 0.8)', 
            borderRadius: '12px',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            minWidth: 220,
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderColor: s.color }
          }}>
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '8px', 
              bgcolor: s.bg, 
              color: s.color, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {s.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '1.1rem', lineHeight: 1 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* â•â•â• FILTERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, py: 1.5, 
        bgcolor: 'white', 
        borderBottom: '1px solid #EBEDF0',
        display: 'flex', gap: 2, alignItems: 'center'
      }}>
        <TextField
          size="small"
          placeholder="Filter blueprints by name or description..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ 
            width: 400,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#EBEDF0',
              height: 38,
              fontSize: 13,
              borderRadius: '10px',
              '& fieldset': { borderColor: '#EBEDF0' },
            }
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#808285' }} /></InputAdornment> }}
        />

        <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {['All', 'Word', 'Excel', 'PPT', 'PDF'].map((type) => (
            <Button
              key={type}
              size="small"
              onClick={() => setFilterType(type)}
              sx={{ 
                height: 32,
                px: 2,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                bgcolor: filterType === type ? '#EBEDF0' : 'transparent',
                color: filterType === type ? '#1D74FF' : '#626465',
                '&:hover': { bgcolor: '#EBEDF0' }
              }}
            >
              {type.toUpperCase()}
            </Button>
          ))}
        </Box>
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
          
          {/* POPULAR - HIGHLIGHTED GRID */}
          {filterType === 'All' && !searchQuery && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended Blueprints
                </Typography>
                <Divider sx={{ flexGrow: 1, borderColor: '#DBDDDF' }} />
              </Box>
              <Grid container spacing={3}>
                {popularItems.map((item) => (
                  <Grid size={{ xs: 12, md: 4 }} key={item.id}>
                    <Card 
                      onClick={() => onNavigateToSetup({ template: item.title, type: item.type })}
                      elevation={0}
                      sx={{ 
                        borderRadius: '16px',
                        border: '1px solid #DBDDDF',
                        bgcolor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                          borderColor: '#1D74FF',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        height: 220
                      }}
                    >
                      <Box sx={{ 
                        height: 80, 
                        background: 'linear-gradient(135deg, #1F2366 0%, #1F2366 100%)',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                          {getFormatIcon(item.type)}
                        </Box>
                        <Chip label="POPULAR" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 900, bgcolor: '#FF6E00', color: '#fff', border: 'none' }} />
                      </Box>
                      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.3, mb: 0.5 }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#626465', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.desc}
                        </Typography>
                        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 18, height: 18, fontSize: '0.5rem', fontWeight: 900, bgcolor: '#EBEDF0', color: '#626465' }}>{item.author[0]}</Avatar>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#808285' }}>{item.author}</Typography>
                          </Box>
                          <ChevronRightIcon fontSize="small" sx={{ color: '#1D74FF' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* ALL TEMPLATES */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standard Library {filterType !== 'All' ? `(${filterType})` : ''}
            </Typography>
            <Divider sx={{ flexGrow: 1, borderColor: '#DBDDDF' }} />
          </Box>
          
          <Grid container spacing={2.5}>
            {filteredTemplates.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={item.id}>
                <Card 
                  onClick={() => onNavigateToSetup({ template: item.title, type: item.type })}
                  elevation={0}
                  sx={{ 
                    borderRadius: '12px',
                    border: '1px solid #DBDDDF',
                    bgcolor: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                      borderColor: '#1D74FF',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: 'rgba(59, 130, 246, 0.05)', 
                        borderRadius: '8px', 
                        display: 'flex',
                        color: getFormatColor(item.type)
                      }}>
                        {getFormatIcon(item.type)}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#cbd5e1', fontSize: '0.6rem' }}>BLUEPRINT-0{item.id}</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2366', mb: 0.5, lineHeight: 1.4 }}>{item.title}</Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#808285', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                    }}>
                      {item.desc}
                    </Typography>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #EBEDF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#1D74FF' }}>USE TEMPLATE</Typography>
                      <ChevronRightIcon sx={{ fontSize: 14, color: '#1D74FF' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

        </Box>
      </Box>

      {/* FOOTER */}
      <Box sx={{ 
        px: 4, py: 2, 
        borderTop: '1px solid #EBEDF0', 
        bgcolor: 'white', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
      }}>
        <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SMART FACTORY / <Box component="span" sx={{ color: '#1D74FF' }}>BLUEPRINT ENGINE v2.4</Box>
        </Typography>
        <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800 }}>
          {filteredTemplates.length} TEMPLATES AVAILABLE
        </Typography>
      </Box>
    </Box>
  );
}

