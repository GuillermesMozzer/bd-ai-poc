import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as SparkleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  ChatBubbleOutline as ChatIcon,
  WarningAmber as WarningIcon,
  Rule as RuleIcon,
} from '@mui/icons-material';

interface DocumentReviewFlowScreenProps {
  onBack: () => void;
}

export default function DocumentReviewFlowScreen({ onBack }: DocumentReviewFlowScreenProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' });

  const showSnackbar = (message: string, severity: 'success' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!hasStarted) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Paper sx={{ p: 4, width: 400, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#060A3D' }}>Select Documents for Review</Typography>
            <IconButton onClick={onBack} size="small"><CloseIcon /></IconButton>
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value="all" label="Type">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="quality">Quality</MenuItem>
              <MenuItem value="safety">Safety</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value="all" label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => setHasStarted(true)}
            sx={{ bgcolor: '#060A3D', py: 1.5, mt: 1 }}
          >
            Start Review Flow
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} size="small"><ArrowBackIcon /></IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>Review Flow (1 of 6)</Typography>
            <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffebee', color: '#E43B46', fontWeight: 'bold', height: 20 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => showSnackbar('Share link copied to clipboard', 'info')}>Share</Button>
        </Box>
      </Box>

      {/* Main Layout Split */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Left Panel */}
        <Box sx={{ width: '40%', minWidth: 350, maxWidth: 500, bgcolor: 'white', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#060A3D' }}>Document Metadata</Typography>
              <Chip label="Current Status" size="small" sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 'bold' }} />
            </Box>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">ID</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>DOC-001</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>Quality SOP</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Owner</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>Marta (Line Leader)</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Version</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>v10 (10:30 AM)</Typography></Grid>
            </Grid>
          </Box>

          {/* AI Insights & Context */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 40, '& .MuiTab-root': { py: 1, minHeight: 40, textTransform: 'none', fontWeight: 'bold' } }}>
                <Tab icon={<SparkleIcon fontSize="small" />} iconPosition="start" label="AI Insights" />
                <Tab icon={<ChatIcon fontSize="small" />} iconPosition="start" label="Comments (2)" />
                <Tab icon={<TimelineIcon fontSize="small" />} iconPosition="start" label="Timeline" />
              </Tabs>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
              {tabValue === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper sx={{ p: 2, borderLeft: '4px solid #044ED7' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#044ED7', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SparkleIcon fontSize="small" /> Summary
                    </Typography>
                    <Typography variant="body2">This revision updates the changeover parameters for Line 2 Autoguard. Safety thresholds have been tightened.</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderLeft: '4px solid #ffb74d' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#FF6E00', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon fontSize="small" /> Critical Points Detected
                    </Typography>
                    <Typography variant="body2">- Section 2.4 modified (Temperature limits)<br/>- New risk added regarding sensor calibration</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderLeft: '4px solid #81c784' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#00AF95', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RuleIcon fontSize="small" /> Compliance Checklist
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} /><Typography variant="caption">Format verified</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} /><Typography variant="caption">No conflicts found</Typography></Box>
                  </Paper>
                </Box>
              )}
              {tabValue === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#044ED7', fontSize: 14 }}>J</Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle2">John</Typography>
                        <Typography variant="caption" color="text.secondary">10:45 AM</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#EBEDF0', borderRadius: 1, mt: 0.5 }}>Please verify the new temperature limits on page 3.</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Jan 2 - v10 Uploaded</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Jan 1 - v9 Approved</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Action Footer */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white', display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth 
              startIcon={<CheckIcon />}
              disabled={isEditMode}
              onClick={() => showSnackbar('Document approved successfully')}
            >
              APPROVE
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              startIcon={<SaveIcon />}
              disabled={!isEditMode}
              onClick={() => showSnackbar('Draft saved successfully')}
            >
              SAVE DRAFT
            </Button>
          </Box>
        </Box>

        {/* Right Panel - Document Execution Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, bgcolor: '#e0e0e0', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Button size="small" variant={!isEditMode ? "contained" : "outlined"} onClick={() => setIsEditMode(false)} sx={{ bgcolor: !isEditMode ? 'white' : 'transparent', color: !isEditMode ? '#044ED7' : 'inherit' }}>PREVIEW</Button>
              <Button size="small" variant={isEditMode ? "contained" : "outlined"} onClick={() => setIsEditMode(true)} sx={{ ml: 1, bgcolor: isEditMode ? 'white' : 'transparent', color: isEditMode ? '#044ED7' : 'inherit' }}>EDIT MODE</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="text" startIcon={<DownloadIcon />} onClick={() => showSnackbar('Download started', 'info')}>Download</Button>
              <Button size="small" variant="text" startIcon={<CloudUploadIcon />} onClick={() => showSnackbar('Upload dialog opened', 'info')}>Upload New</Button>
            </Box>
          </Box>

          <Paper sx={{ width: '100%', maxWidth: 800, margin: '0 auto', flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>Standard Operating Procedure: Autoguard Line 2</Typography>
            
            <Typography variant="h6">1. Purpose</Typography>
            <Typography variant="body1" sx={{ color: '#424242' }}>This document outlines the standard operation for the Autoguard system on Line 2.</Typography>

            <Typography variant="h6">2. Limits and Thresholds</Typography>
            {isEditMode ? (
               <Box sx={{ border: '2px solid #044ED7', borderRadius: 1, p: 2 }}>
                 <Typography variant="body2" sx={{ color: '#E43B46', textDecoration: 'line-through', mb: 1 }}>Max Temperature: 70Â°C</Typography>
                 <Typography variant="body2" sx={{ color: '#00AF95', fontWeight: 'bold' }}>Max Temperature: 65Â°C</Typography>
                 <Typography variant="caption" sx={{ color: '#044ED7', mt: 1, display: 'block' }}>Editing Mode Active</Typography>
               </Box>
            ) : (
               <Box sx={{ border: '2px dashed transparent', p: 2 }}>
                 <Typography variant="body1" sx={{ color: '#424242' }}>Max Temperature: 65Â°C</Typography>
               </Box>
            )}
          </Paper>
        </Box>
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

