import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Avatar,
  Divider,
  Checkbox,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparkleIcon,
  ViewAgenda as ViewAgendaIcon,
  CheckCircleOutline as CheckCircleIcon,
} from '@mui/icons-material';

interface DocumentRevisionApprovalScreenProps {
  onBack: () => void;
  onReviewClick: () => void;
  onViewFile: (id: string) => void;
}

const initialMockFiles = [
  { id: '1', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Approved', author: 'John', date: 'January 1, 2024' },
  { id: '2', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Disapproved', author: 'John', date: 'January 1, 2024' },
  { id: '3', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'New', author: 'John', date: 'January 2, 2024' },
  { id: '4', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Under Revision', author: 'John', date: 'January 2, 2024' },
  { id: '5', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Waiting for approval', author: 'John', date: 'January 2, 2024' },
  { id: '6', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Approved', author: 'John', date: 'January 3, 2024' },
  { id: '7', name: 'Global EQ Management...', number: 'GL-CE-01-01-0', version: '10', status: 'Waiting for approval', author: 'John', date: 'January 4, 2024' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return { bg: '#e8f5e9', text: '#00AF95' };
    case 'Waiting for approval': return { bg: '#fff3e0', text: '#FF6E00' };
    case 'Under Revision': return { bg: '#EBEDF0', text: '#044ED7' };
    case 'Disapproved': return { bg: '#ffebee', text: '#E43B46' };
    case 'New': return { bg: '#f3e5f5', text: '#7b1fa2' };
    default: return { bg: '#eeeeee', text: '#616161' };
  }
};

export default function DocumentRevisionApprovalScreen({ onBack, onReviewClick, onViewFile }: DocumentRevisionApprovalScreenProps) {
  const [mockFiles, setMockFiles] = useState(initialMockFiles);
  const [activeFilters, setActiveFilters] = useState<string[]>(['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredData = mockFiles.filter(item => activeFilters.includes(item.status));

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkApprove = () => {
    setMockFiles(prev => prev.map(f => selectedIds.includes(f.id) ? { ...f, status: 'Approved' } : f));
    showSnackbar(`Successfully approved ${selectedIds.length} document(s).`);
    setSelectedIds([]);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMockFiles(prev => prev.filter(f => f.id !== id));
    showSnackbar(`Document removed`, 'info');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Bar / Filters */}
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#616161', mr: 2 }}>SHOWING:</Typography>
          {['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New'].map(status => (
            <Chip 
              key={status} 
              label={status} 
              onClick={() => toggleFilter(status)}
              sx={{ 
                bgcolor: activeFilters.includes(status) ? getStatusColor(status).bg : '#f5f5f5', 
                color: activeFilters.includes(status) ? getStatusColor(status).text : '#9e9e9e',
                fontWeight: activeFilters.includes(status) ? 'bold' : 'normal',
                cursor: 'pointer',
                borderRadius: 1
              }} 
            />
          ))}
          <Button size="small" variant="text" color="primary" onClick={() => setActiveFilters(['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New'])}>CLEAR</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" sx={{ bgcolor: '#060A3D', color: 'white', fontWeight: 'bold' }} onClick={onReviewClick}>REVIEW</Button>
          <Button variant="outlined" startIcon={<DateRangeIcon />} sx={{ color: '#616161', borderColor: '#e0e0e0' }}>Report Date Range</Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* KPI Cards */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { label: 'Total Files', value: '24K', color: '#060A3D', bg: 'rgba(11, 22, 63, 0.05)', icon: <DescriptionIcon fontSize="small" /> },
            { label: 'Waiting for approval', value: '1220', color: '#FF6E00', bg: 'rgba(230, 81, 0, 0.05)', icon: <CheckCircleIcon fontSize="small" /> },
            { label: 'Disapproved', value: '1693', color: '#E43B46', bg: 'rgba(198, 40, 40, 0.05)', icon: <DeleteIcon fontSize="small" /> },
            { label: 'Under Revision', value: '77', color: '#044ED7', bg: 'rgba(21, 101, 192, 0.05)', icon: <EditIcon fontSize="small" /> },
            { label: 'New', value: '7', color: '#7b1fa2', bg: 'rgba(123, 31, 162, 0.05)', icon: <SparkleIcon fontSize="small" /> },
          ].map((kpi, i) => (
            <Paper 
              key={i}
              elevation={0}
              sx={{ 
                px: 2, 
                py: 1, 
                bgcolor: 'white',
                border: '1px solid #DBDDDF',
                borderRadius: 3,
                display: 'flex', 
                alignItems: 'center',
                gap: 1.5,
                minWidth: 'fit-content',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
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
                flexShrink: 0
              }}>
                {kpi.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '1rem', lineHeight: 1.2 }}>{kpi.value}</Typography>
                <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.025em', display: 'block' }}>{kpi.label}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Action Bar (When selection occurs) */}
        {selectedIds.length > 0 && (
          <Paper sx={{ mb: 2, p: 1.5, px: 3, bgcolor: '#EBEDF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, border: '1px solid #90caf9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#044ED7' }}>{selectedIds.length} file(s) selected</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleBulkApprove}>Bulk Approve</Button>
              <Button size="small" variant="outlined" color="primary" onClick={() => showSnackbar('Bulk review requested', 'info')}>Bulk Review</Button>
              <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} sx={{ ml: 2 }} onClick={() => { setMockFiles(prev => prev.filter(f => !selectedIds.includes(f.id))); setSelectedIds([]); showSnackbar('Selected documents deleted', 'info'); }}>Delete</Button>
            </Box>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Left Panel - Timeline View */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper variant="outlined" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ViewAgendaIcon sx={{ color: '#044ED7' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#060A3D' }}>Timeline</Typography>
              </Box>
              <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
                {['January 1, 2024', 'January 2, 2024', 'January 3, 2024'].map((day, i) => {
                  const dayData = filteredData.filter(d => d.date === day);
                  if (dayData.length === 0) return null;
                  return (
                    <Box key={i} sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#424242' }}>{day}</Typography>
                      {dayData.map((file, j) => (
                        <Card key={j} variant="outlined" sx={{ mb: 1.5, borderLeft: `4px solid ${getStatusColor(file.status).text}`, '&:hover': { bgcolor: '#fcfcfc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } }}>
                          <CardContent sx={{ p: '12px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <DescriptionIcon sx={{ color: getStatusColor(file.status).text, fontSize: 18, mt: 0.2 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: getStatusColor(file.status).text, fontWeight: 'bold', fontSize: 9 }}>{file.status.toUpperCase()}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{file.name.substring(0, 15)}...</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" sx={{ p: 0.5 }} onClick={(e) => { e.stopPropagation(); showSnackbar('Edit timeline entry', 'info') }}><EditIcon sx={{ fontSize: 14, color: '#9e9e9e' }} /></IconButton>
                              <IconButton size="small" sx={{ p: 0.5 }} onClick={(e) => handleDeleteItem(file.id, e)}><DeleteIcon sx={{ fontSize: 14, color: '#9e9e9e' }} /></IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - File Table */}
          <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, borderRadius: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                     <TableCell padding="checkbox">
                       <Checkbox 
                         indeterminate={selectedIds.length > 0 && selectedIds.length < filteredData.length}
                         checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                         onChange={handleSelectAll}
                         size="small"
                       />
                     </TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#616161' }}>File Name</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#616161' }}>Number</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#616161' }}>Version</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#616161' }}>Status</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#616161' }}>Author</TableCell>
                     <TableCell align="right" sx={{ pr: 3, fontWeight: 'bold', color: '#616161' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow hover key={row.id} selected={selectedIds.includes(row.id)} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell padding="checkbox">
                         <Checkbox 
                           checked={selectedIds.includes(row.id)}
                           onChange={() => handleSelectOne(row.id)}
                           size="small"
                         />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{row.number}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{row.version}</Typography></TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: getStatusColor(row.status).bg, 
                            color: getStatusColor(row.status).text, 
                            fontWeight: 'bold', 
                            fontSize: 11,
                            height: 20
                          }} 
                        />
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{row.author}</Typography></TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <IconButton size="small" onClick={() => onViewFile(row.id)}>
                          <VisibilityIcon sx={{ color: '#044ED7' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No files match the active filters.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

