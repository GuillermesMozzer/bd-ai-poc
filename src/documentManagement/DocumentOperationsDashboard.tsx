import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Paper, Tabs, Tab,
  Grid, TextField, Chip, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Snackbar, Alert,
  Checkbox, Avatar, LinearProgress, Switch, FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  AutoAwesome as SparkleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  DeleteOutline as DeleteOutlineIcon,
  Gavel as LegalIcon,
  Restore as RestoreIcon,
  LocalOffer as LocalOfferIcon, // Using LocalOffer instead
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface DocumentOperationsDashboardProps {
  onBack: () => void;
}

export default function DocumentOperationsDashboard({ onBack }: DocumentOperationsDashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' | 'warning' });
  const [uploadFiles, setUploadFiles] = useState([
    { name: 'SOP-099_Line_2_Calibration.pdf', size: '1.2 MB', status: 'pending', progress: 0, aiTags: ['SOP', 'Calibration', 'Line 2'] },
    { name: 'Deviation_Report_Aug_28.docx', size: '254 KB', status: 'complete', progress: 100, aiTags: ['Deviation', 'Quality', 'Aug 2026'] }
  ]);
  
  const [recycleBin, setRecycleBin] = useState([
    { id: 1, name: 'Old_Guidelines_2024.pdf', deletedBy: 'Doug Wood', deletedAt: '2 days ago', expires: '28 days' },
    { id: 2, name: 'Draft_SOP_abandoned.docx', deletedBy: 'Chris Klopp', deletedAt: '15 days ago', expires: '15 days' },
  ]);
  const [recycleSelected, setRecycleSelected] = useState<number[]>([]);

  const showSnackbar = (message: string, severity: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const simulateUpload = () => {
    setUploadFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setUploadFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, progress: p } : f));
      if (p >= 100) {
        clearInterval(interval);
        setUploadFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'complete' } : f));
        showSnackbar('Batch upload complete. Metadata assigned via AI.', 'success');
      }
    }, 500);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ color: '#044ED7', fontWeight: 700, lineHeight: 1 }}>
            Document Operations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Advanced document management: Batch uploads, retention policies, and secure previewing.
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', px: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, pt: 1, pb: 1, fontWeight: 600 } }}>
          <Tab label="Batch Upload & Metadata" icon={<CloudUploadIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Secure Preview Engine" icon={<PrintIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Archive & Retention" icon={<LegalIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Recycle Bin" icon={<DeleteOutlineIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: '#060A3D', mb: 2, fontWeight: 'bold' }}>Batch Upload Studio</Typography>
                
                <Box sx={{ border: '2px dashed #90caf9', borderRadius: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#EBEDF0', cursor: 'pointer', '&:hover': { bgcolor: '#bbdefb' }, mb: 3 }} onClick={() => showSnackbar('File picker opened', 'info')}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#044ED7', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#044ED7', fontWeight: 'bold' }}>Drag and drop files here</Typography>
                  <Typography variant="body2" color="text.secondary">or click to browse from standard storage</Typography>
                  <Chip label="Supports multiple files up to 500MB" size="small" sx={{ mt: 2, bgcolor: 'white', color: '#044ED7' }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>Staged Files ({uploadFiles.length})</Typography>
                  <Button variant="contained" size="small" onClick={simulateUpload} disabled={uploadFiles.some(f => f.status === 'uploading')}>Start Batch Upload</Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {uploadFiles.map((f, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DescriptionIcon sx={{ color: '#044ED7' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{f.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{f.size}</Typography>
                        {f.status === 'uploading' && <LinearProgress variant="determinate" value={f.progress} sx={{ mt: 1, height: 4, borderRadius: 2 }} />}
                      </Box>
                      {f.status === 'complete' ? <CheckCircleIcon color="success" /> : <Typography variant="caption" color="text.secondary">{f.status}</Typography>}
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ color: '#060A3D', mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SparkleIcon fontSize="small" sx={{ color: '#044ED7' }} /> Metadata & Tagging
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Our AI engine automatically reads incoming documents and suggests classification, custom tags, and lifecycle states based on content.
                </Typography>

                {uploadFiles[0].status === 'complete' || uploadFiles[1].status === 'complete' ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Extracted Metadata Highlights</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {uploadFiles.flatMap(f => f.aiTags).map((t, i) => (
                        <Chip key={i} label={t} icon={<LocalOfferIcon sx={{ fontSize: 14 }} />} size="small" sx={{ bgcolor: '#fff3e0', color: '#FF6E00', border: '1px solid #ffcc80' }} />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Suggested Policies</Typography>
                    <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
                      <FormControlLabel control={<Switch defaultChecked size="small" />} label={<Typography variant="body2">Apply "3-Year SOP Retention" rule</Typography>} />
                      <FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2">Place on Immediate Approval Flow</Typography>} />
                    </Box>

                    <Button variant="outlined" fullWidth onClick={() => showSnackbar('Metadata saved manually')}>Manually Editing Metadata overrides AI...</Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', color: '#9e9e9e', bgcolor: '#f9f9f9', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
                    <SparkleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">Waiting for files to be uploaded to start extraction...</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600, overflow: 'hidden' }}>
            {/* Viewer Header */}
            <Box sx={{ px: 3, py: 1.5, bgcolor: '#060A3D', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Secure Document Viewer: Health & Safety Manual.pdf</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button size="small" variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#044ED7' }} onClick={() => showSnackbar('Print job started with watermark', 'info')}>Controlled Print</Button>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} sx={{ color: 'white', borderColor: 'white' }} onClick={() => showSnackbar('File downloaded with secure wrapper', 'success')}>Secure Download</Button>
              </Box>
            </Box>

            {/* Viewer Stage */}
            <Box sx={{ flexGrow: 1, bgcolor: '#9e9e9e', p: 4, display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
              <Paper sx={{ width: '100%', maxWidth: 800, minHeight: 1000, p: 6, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
                  <Typography sx={{ color: 'rgba(255, 0, 0, 0.1)', fontSize: '5rem', fontWeight: 900, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    CONFIDENTIAL - C. KLOPP
                  </Typography>
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>Health & Safety Manual</Typography>
                <Typography variant="h6" sx={{ color: '#044ED7', mb: 2 }}>1. Temperature Constraints</Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                  This manual defines the maximum temperature limits for Line 2 operations. Personnel must not exceed 85Â°C during any phase of the extrusion process. Failure to conform to this standard will result in an immediate stoppage and the registering of a Non-Conformance (NC).
                </Typography>
                <Typography variant="h6" sx={{ color: '#044ED7', mb: 2 }}>2. Changeover Validation</Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                  Every changeover necessitates a complete line audit by the designated quality supervisor. See standard operating procedure SOP-001 for a complete breakdown of changeover protocols.
                </Typography>

                <Box sx={{ flexGrow: 1 }} />
                
                <Box sx={{ borderTop: '2px solid #e0e0e0', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Printed securely from SmartFactory DMS</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>User: D. Wood | Time: {new Date().toISOString().split('T')[0]}</Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
            <Box sx={{ width: 300 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#888', textTransform: 'uppercase', mb: 2 }}>Policy Categories</Typography>
              <Paper variant="outlined" sx={{ mb: 2 }}>
                {[
                  { name: 'Regulatory (FDA 21 CFR)', count: 12, active: true },
                  { name: 'Internal Quality (ISO 9001)', count: 8, active: false },
                  { name: 'General Administrative', count: 3, active: false }
                ].map((p, i) => (
                  <Box key={i} sx={{ p: 2, borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', bgcolor: p.active ? '#EBEDF0' : 'transparent', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <Typography variant="body2" sx={{ fontWeight: p.active ? 'bold' : 'normal', color: p.active ? '#044ED7' : '#333' }}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.count} rules applied</Typography>
                  </Box>
                ))}
              </Paper>
              <Button fullWidth variant="outlined" startIcon={<LocalOfferIcon />}>Create New Category</Button>
            </Box>

            <Paper sx={{ flexGrow: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#060A3D' }}>Regulatory Policies (FDA 21 CFR)</Typography>
                <Button variant="contained" size="small">+ Add Rule</Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafbfc', '& th': { fontWeight: 'bold' } }}>
                      <TableCell>Policy Name</TableCell>
                      <TableCell>Scope/Target</TableCell>
                      <TableCell>Action & Trigger</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { name: 'Archive Expired SOPs', target: 'Type: SOP', action: 'Move to Archive -> 1 year post-expiration', status: true },
                      { name: 'Maintain Quality Records', target: 'Hierarchy: Quality', action: 'Legal Hold -> 10 years', status: true, hold: true },
                      { name: 'Purge Old Reports', target: 'Type: Report', action: 'Permanent Deletion -> 5 years old', status: false },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.name}</Typography>
                          {row.hold && <Chip label="LEGAL HOLD IN EFFECT" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }} />}
                        </TableCell>
                        <TableCell><Chip label={row.target} size="small" sx={{ bgcolor: '#EBEDF0', color: '#044ED7' }} /></TableCell>
                        <TableCell><Typography variant="body2">{row.action}</Typography></TableCell>
                        <TableCell><Switch size="small" checked={row.status} onChange={() => showSnackbar(`Policy status toggled`)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#060A3D' }}>Recycle Bin / Soft Delte</Typography>
                <Typography variant="body2" color="text.secondary">Items here will be permanently deleted after their retention period expires.</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<RestoreIcon />} disabled={recycleSelected.length === 0} onClick={() => {
                  setRecycleBin(prev => prev.filter(r => !recycleSelected.includes(r.id)));
                  setRecycleSelected([]);
                  showSnackbar('Items restored to their original hierarchy nodes.', 'success');
                }}>Restore Selected</Button>
                <Button size="small" variant="contained" color="error" startIcon={<DeleteOutlineIcon />} disabled={recycleSelected.length === 0} onClick={() => {
                  setRecycleBin(prev => prev.filter(r => !recycleSelected.includes(r.id)));
                  setRecycleSelected([]);
                  showSnackbar('Items permanently deleted.', 'error');
                }}>Empty / Delete Permanently</Button>
              </Box>
            </Box>

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
              You have administrator privileges. Be careful with manual permanent deletion as it overrides retention rules.
            </Alert>

            <TableContainer sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafbfc' }}>
                    <TableCell padding="checkbox"><Checkbox onChange={(e) => setRecycleSelected(e.target.checked ? recycleBin.map(r => r.id) : [])} /></TableCell>
                    <TableCell>Document Name</TableCell>
                    <TableCell>Deleted By</TableCell>
                    <TableCell>Deleted Date</TableCell>
                    <TableCell>Time Until Purge</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recycleBin.map(row => (
                    <TableRow key={row.id} selected={recycleSelected.includes(row.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={recycleSelected.includes(row.id)} onChange={() => {
                          setRecycleSelected(prev => prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]);
                        }} />
                      </TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ color: '#9e9e9e' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555', textDecoration: 'line-through' }}>{row.name}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">{row.deletedBy}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{row.deletedAt}</Typography></TableCell>
                      <TableCell><Chip label={row.expires} size="small" color="error" variant="outlined" /></TableCell>
                    </TableRow>
                  ))}
                  {recycleBin.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">Recycle Bin is empty</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

