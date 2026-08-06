import {type ChangeEvent, useMemo, useRef, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorIcon,
  InsertDriveFileOutlined as FileIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

type ImportStep = 'landing' | 'structure' | 'upload' | 'ready' | 'errors' | 'success' | 'log';

type TierBoardImportExportDialogProps = {
  open: boolean;
  tierLevel?: string;
  onClose: () => void;
};

const templateSections = [
  {section: 'Safety', field: 'Fatality', example: '0', required: 'Yes', notes: 'Numeric value'},
  {section: 'Safety', field: 'Serious Injury', example: '4', required: 'Yes', notes: 'Numeric value'},
  {section: 'Quality', field: 'Complaints', example: '2', required: 'Yes', notes: 'Numeric value'},
  {section: 'Delivery', field: 'Actual OEE', example: '85%', required: 'Yes', notes: 'Percentage (0-100%)'},
  {section: 'Cost', field: 'Downtime', example: '88 h', required: 'Yes', notes: 'Hours or numeric value'},
  {section: 'People', field: 'Absences', example: '2', required: 'Yes', notes: 'Numeric value'},
  {section: '3P Tracking', field: 'Participation', example: '92%', required: 'No', notes: 'Percentage (0-100%)'},
  {section: 'Loss Focused KPIs', field: 'Changeover', example: '244 min', required: 'Yes', notes: 'Duration in minutes'},
  {section: 'Recognition', field: 'Recognition text', example: 'Helped train 3 new operators', required: 'No', notes: 'Text'},
  {section: 'Action Tracker', field: 'Action title', example: 'Conduct staff training on compliance and SOP adherence', required: 'Yes', notes: 'Text'},
  {section: 'Action Tracker', field: 'Owner', example: 'Carlos Mendez', required: 'Yes', notes: 'Text'},
];

const importLogRows = [
  {date: 'Mar 16, 2026 10:42 AM', by: 'Carlos Mendez', records: 42, status: 'Success'},
  {date: 'Mar 09, 2026 02:15 PM', by: 'Maria Pinna', records: 38, status: 'Success'},
  {date: 'Mar 02, 2026 09:31 AM', by: 'Carlos Mendez', records: 40, status: 'Success'},
  {date: 'Feb 23, 2026 04:18 PM', by: 'Maria Pinna', records: 35, status: 'Failed'},
  {date: 'Feb 16, 2026 11:07 AM', by: 'Carlos Mendez', records: 37, status: 'Success'},
];

const sectionTabs = ['Safety', 'Quality', 'Delivery', 'Cost', 'People', '3P Tracking', 'Loss Focused KPIs', 'Recognition', 'Action Tracker'];

function downloadFile(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildTemplateCsv(tierLevel: string) {
  const header = ['Tier Level', 'Section', 'Field', 'Current Board Example', 'Required', 'Notes'];
  const rows = templateSections.map((row) => [tierLevel, row.section, row.field, row.example, row.required, row.notes]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function buildLogCsv() {
  const header = ['Date & Time', 'Imported By', 'Records', 'Status'];
  const rows = importLogRows.map((row) => [row.date, row.by, String(row.records), row.status]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export default function TierBoardImportExportDialog({
  open,
  tierLevel = 'Tier 1',
  onClose,
}: TierBoardImportExportDialogProps) {
  const [step, setStep] = useState<ImportStep>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const templateFileName = useMemo(() => `Tier_Meeting_Template_${tierLevel.replace(/\s+/g, '')}.csv`, [tierLevel]);

  const resetAndClose = () => {
    setStep('landing');
    setSelectedFile(null);
    setIsValidating(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    downloadFile(templateFileName, buildTemplateCsv(tierLevel));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setStep('upload');
  };

  const handleValidate = () => {
    if (!selectedFile) return;
    setIsValidating(true);
    window.setTimeout(() => {
      setIsValidating(false);
      const invalid = selectedFile.name.toLowerCase().includes('error') || selectedFile.name.toLowerCase().includes('failed');
      setStep(invalid ? 'errors' : 'ready');
    }, 750);
  };

  const modalTitle = step === 'structure'
    ? 'Template Structure Preview'
    : step === 'ready' || step === 'errors'
      ? 'Validation results'
      : step === 'success'
        ? 'Board data imported successfully'
        : step === 'log'
          ? 'Import log'
          : 'Import / Export Board Data';

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth={step === 'structure' || step === 'log' ? 'lg' : 'md'} fullWidth>
      <DialogTitle sx={{px: 3, pt: 2.2, pb: 1.2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2}}>
          <Box>
            <Typography sx={{fontSize: 20, fontWeight: 900, color: '#111827'}}>{modalTitle}</Typography>
            {step === 'landing' ? (
              <Typography sx={{fontSize: 13, color: '#475467', mt: 0.45}}>
                Download the template, fill it manually, and upload it back to update this board.
              </Typography>
            ) : null}
          </Box>
          <IconButton size="small" onClick={resetAndClose} aria-label="Close import dialog">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{px: 3, pb: 3}}>
        {step === 'landing' ? (
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 2.2}}>
            <Paper elevation={0} sx={{p: 2.2, border: '1px solid #E2E8F0', borderRadius: 2}}>
              <DownloadIcon sx={{color: '#0B63E5', fontSize: 34}} />
              <Typography sx={{fontSize: 15, fontWeight: 900, color: '#0B63E5', mt: 1}}>Download template</Typography>
              <Typography sx={{fontSize: 13, color: '#344054', mt: 1.3, minHeight: 44}}>
                Get an Excel-ready file with all board sections and required fields.
              </Typography>
              <Button fullWidth variant="contained" onClick={handleDownloadTemplate} sx={{mt: 2.5, height: 38, fontWeight: 900, textTransform: 'none'}}>
                Download Excel template
              </Button>
              <Button fullWidth variant="text" onClick={() => setStep('structure')} sx={{mt: 1.2, fontWeight: 850, textTransform: 'none'}}>
                View template structure
              </Button>
            </Paper>
            <Paper elevation={0} sx={{p: 2.2, border: '1px solid #E2E8F0', borderRadius: 2}}>
              <UploadIcon sx={{color: '#0B63E5', fontSize: 34}} />
              <Typography sx={{fontSize: 15, fontWeight: 900, color: '#0B63E5', mt: 1}}>Upload completed template</Typography>
              <Typography sx={{fontSize: 13, color: '#344054', mt: 1.3}}>
                Import manually filled data into this Tier Meeting board.
              </Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{mt: 1.8, p: 2.1, border: '1px dashed #AFCBFF', borderRadius: 1.5, textAlign: 'center', cursor: 'pointer', bgcolor: '#FBFDFF'}}
              >
                <Typography sx={{fontSize: 13, fontWeight: 800, color: '#1F2937'}}>Drag and drop your completed file here</Typography>
                <Typography sx={{fontSize: 13, color: '#0B63E5', fontWeight: 900, mt: 0.4}}>or browse files</Typography>
                <Typography sx={{fontSize: 12, color: '#667085', mt: 0.7}}>Accepted formats: .xlsx, .csv</Typography>
              </Box>
              <input ref={fileInputRef} hidden type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
              <Button fullWidth disabled variant="contained" sx={{mt: 2, height: 38, fontWeight: 900, textTransform: 'none'}}>
                Import data
              </Button>
            </Paper>
          </Box>
        ) : null}

        {step === 'structure' ? (
          <Box>
            <Box sx={{display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2}}>
              {sectionTabs.map((tab, index) => (
                <Chip key={tab} label={tab} size="small" color={index === 0 ? 'primary' : 'default'} variant={index === 0 ? 'filled' : 'outlined'} sx={{fontWeight: 800}} />
              ))}
            </Box>
            <TemplateTable />
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
              <Button variant="outlined" onClick={() => setStep('landing')} sx={{fontWeight: 850, textTransform: 'none'}}>Back</Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{fontWeight: 900, textTransform: 'none'}}>Download template</Button>
            </Box>
          </Box>
        ) : null}

        {step === 'upload' ? (
          <Box>
            <Paper elevation={0} sx={{p: 2, border: '1px solid #E2E8F0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.4, minWidth: 0}}>
                <FileIcon sx={{fontSize: 34, color: '#16A34A'}} />
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontSize: 14, fontWeight: 900, color: '#111827'}} noWrap>{selectedFile?.name}</Typography>
                  <Typography sx={{fontSize: 12, color: '#667085'}}>{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}</Typography>
                  <Typography sx={{fontSize: 12, color: '#16A34A', fontWeight: 800, mt: 0.45}}>Ready to validate</Typography>
                </Box>
              </Box>
              <CheckCircleIcon sx={{color: '#16A34A'}} />
            </Paper>
            {isValidating ? <LinearProgress sx={{mt: 2}} /> : null}
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 2}}>
              <Button variant="outlined" onClick={() => setSelectedFile(null)} sx={{fontWeight: 850, textTransform: 'none'}}>Remove file</Button>
              <Button variant="contained" onClick={handleValidate} disabled={!selectedFile || isValidating} sx={{fontWeight: 900, textTransform: 'none'}}>Validate file</Button>
            </Box>
            <Button fullWidth disabled variant="contained" sx={{mt: 2.5, height: 40, fontWeight: 900, textTransform: 'none'}}>Import data</Button>
          </Box>
        ) : null}

        {step === 'ready' ? (
          <ValidationReady onCancel={() => setStep('landing')} onImport={() => setStep('success')} />
        ) : null}

        {step === 'errors' ? (
          <ValidationErrors
            onUploadAnother={() => {
              setSelectedFile(null);
              setStep('landing');
            }}
          />
        ) : null}

        {step === 'success' ? (
          <SuccessView
            onViewBoard={resetAndClose}
            onDownloadLog={() => downloadFile('Tier_Meeting_Import_Log.csv', buildLogCsv())}
          />
        ) : null}

        {step === 'log' ? (
          <ImportLog onClose={resetAndClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TemplateTable() {
  return (
    <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.5}}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{bgcolor: '#F8FAFC'}}>
            {['Section', 'Field', 'Current Board Example', 'Required', 'Notes'].map((head) => (
              <TableCell key={head} sx={{fontWeight: 900, color: '#111827'}}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {templateSections.map((row) => (
            <TableRow key={`${row.section}-${row.field}`}>
              <TableCell>{row.section}</TableCell>
              <TableCell>{row.field}</TableCell>
              <TableCell>{row.example}</TableCell>
              <TableCell>{row.required}</TableCell>
              <TableCell>{row.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ValidationReady({onCancel, onImport}: {onCancel: () => void; onImport: () => void}) {
  return (
    <Box>
      <Paper elevation={0} sx={{p: 2, borderRadius: 2, bgcolor: '#F0FDF4', color: '#166534', display: 'flex', gap: 1.2, alignItems: 'center'}}>
        <CheckCircleIcon />
        <Box>
          <Typography sx={{fontWeight: 900}}>Ready to import</Typography>
          <Typography sx={{fontSize: 13}}>No errors found. 42 records will be imported.</Typography>
        </Box>
      </Paper>
      <Typography sx={{mt: 2.2, mb: 1, fontSize: 14, fontWeight: 900}}>Summary by section</Typography>
      <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.5}}>
        <Table size="small">
          <TableBody>
            {[
              ['Safety', '5 fields'],
              ['Quality', '4 fields'],
              ['Delivery', '3 fields'],
              ['Cost', '6 fields'],
              ['People', '5 fields'],
              ['Action Tracker', '11 items'],
            ].map(([section, value]) => (
              <TableRow key={section}>
                <TableCell sx={{fontWeight: 800}}>{section}</TableCell>
                <TableCell align="right">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 2}}>
        <Button variant="outlined" onClick={onCancel} sx={{fontWeight: 850, textTransform: 'none'}}>Cancel</Button>
        <Button variant="contained" onClick={onImport} sx={{fontWeight: 900, textTransform: 'none'}}>Import data</Button>
      </Box>
    </Box>
  );
}

function ValidationErrors({onUploadAnother}: {onUploadAnother: () => void}) {
  return (
    <Box>
      <Paper elevation={0} sx={{p: 2, borderRadius: 2, bgcolor: '#FEF2F2', color: '#B42318', display: 'flex', gap: 1.2, alignItems: 'center'}}>
        <ErrorIcon />
        <Box>
          <Typography sx={{fontWeight: 900}}>Errors found</Typography>
          <Typography sx={{fontSize: 13}}>Please fix the highlighted rows and upload the file again.</Typography>
        </Box>
      </Paper>
      <Typography sx={{mt: 2.2, mb: 1, fontSize: 14, fontWeight: 900}}>Errors</Typography>
      <Paper elevation={0} sx={{border: '1px solid #FECACA', borderRadius: 1.5, overflow: 'hidden'}}>
        {[
          'Row 8, Safety: Serious Injury must be a number',
          'Row 14, Delivery: Actual OEE must be a percentage',
          'Row 22, Action Tracker: Owner is required',
        ].map((error) => (
          <Box key={error} sx={{display: 'flex', gap: 1, p: 1.4, borderBottom: '1px solid #FEE2E2'}}>
            <ErrorIcon sx={{fontSize: 18, color: '#EF4444'}} />
            <Typography sx={{fontSize: 13, color: '#344054'}}>{error}</Typography>
          </Box>
        ))}
      </Paper>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 2}}>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadFile('Tier_Meeting_Error_Report.csv', 'Row,Section,Error\n8,Safety,Serious Injury must be a number\n14,Delivery,Actual OEE must be a percentage\n22,Action Tracker,Owner is required')} sx={{fontWeight: 850, textTransform: 'none'}}>Download error report</Button>
        <Button variant="outlined" onClick={onUploadAnother} sx={{fontWeight: 850, textTransform: 'none'}}>Upload another file</Button>
      </Box>
    </Box>
  );
}

function SuccessView({onViewBoard, onDownloadLog}: {onViewBoard: () => void; onDownloadLog: () => void}) {
  return (
    <Box>
      <Box sx={{display: 'flex', gap: 1.5, alignItems: 'start'}}>
        <CheckCircleIcon sx={{color: '#16A34A', fontSize: 34}} />
        <Typography sx={{fontSize: 13, color: '#344054', mt: 0.7}}>The board has been updated with the data from your completed template.</Typography>
      </Box>
      <Box sx={{display: 'grid', gap: 1.3, mt: 2.4, mb: 2.4}}>
        {['42 records imported', '3 action items created', '5 KPIs updated', 'Last imported by: Carlos Mendez', 'Mar 16, 2026 at 10:42 AM'].map((item) => (
          <Box key={item} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <CheckCircleIcon sx={{fontSize: 18, color: '#16A34A'}} />
            <Typography sx={{fontSize: 13, color: '#344054'}}>{item}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2}}>
        <Button variant="contained" onClick={onViewBoard} sx={{fontWeight: 900, textTransform: 'none'}}>View updated board</Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadLog} sx={{fontWeight: 850, textTransform: 'none'}}>Download import log</Button>
      </Box>
    </Box>
  );
}

function ImportLog({onClose}: {onClose: () => void}) {
  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.5}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{bgcolor: '#F8FAFC'}}>
              {['Date & Time', 'Imported By', 'Records', 'Status', 'Actions'].map((head) => (
                <TableCell key={head} sx={{fontWeight: 900, color: '#111827'}}>{head}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {importLogRows.map((row) => (
              <TableRow key={`${row.date}-${row.by}`}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.by}</TableCell>
                <TableCell>{row.records}</TableCell>
                <TableCell sx={{color: row.status === 'Success' ? '#16A34A' : '#DC2626', fontWeight: 800}}>{row.status}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => downloadFile('Tier_Meeting_Import_Log.csv', buildLogCsv())}>
                    <DownloadIcon sx={{fontSize: 17, color: '#0B63E5'}} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
        <Button variant="outlined" onClick={onClose} sx={{fontWeight: 850, textTransform: 'none'}}>Close</Button>
      </Box>
    </Box>
  );
}
