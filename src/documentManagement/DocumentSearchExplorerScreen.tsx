import React, {useMemo, useState} from 'react';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowUpward as ArrowUpwardIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Folder as FolderIcon,
  FolderCopy as FolderCopyIcon,
  GridView as GridViewIcon,
  InfoOutlined as InfoOutlinedIcon,
  Public as PublicIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import DocumentHierarchyPicker from './DocumentHierarchyPicker';
import {
  DEFAULT_DOCUMENT_HIERARCHY_SELECTION_ID,
  findDocumentHierarchyPath,
} from './documentHierarchy';

interface DocumentSearchExplorerScreenProps {
  onBack: () => void;
  onCreateNewFileClick?: () => void;
}

const initialMockFolders = [
  {id: 101, isFolder: true, name: 'Sandy - Line 10 - Autoguard', items: 12, starred: true, modified: '2 hours ago', modifiedBy: 'Chris Klopp', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '-', frequency: '-', type: 'Hierarchy Node'},
  {id: 102, isFolder: true, name: 'Sandy - Line 12 - Syringe Cell', items: 8, starred: false, modified: '1 day ago', modifiedBy: 'Marcus Chods', owner: 'Marcus Chods', approver: 'George Whales', reviewDate: '-', frequency: '-', type: 'Hierarchy Node'},
  {id: 103, isFolder: true, name: 'Sandy - Line 4 - Sterile Press', items: 24, starred: true, modified: '3 days ago', modifiedBy: 'System', owner: 'System', approver: 'System', reviewDate: '-', frequency: '-', type: 'Hierarchy Node'},
];

const initialMockFiles = [
  {id: 1, isFolder: false, name: 'Health & Safety Manual.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: true, status: 'Validated', lastUpdated: '5 mins ago'},
  {id: 2, isFolder: false, name: 'Employee Handbook.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'George Whales', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Validated', lastUpdated: '5 mins ago'},
  {id: 3, isFolder: false, name: 'Production Manual.docx', type: 'Manual', modified: '6 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Marcus Chods', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Validated', lastUpdated: '6 mins ago'},
  {id: 4, isFolder: false, name: 'Quality Manual.docx', type: 'Manual', modified: '6 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Validated', lastUpdated: '6 mins ago'},
  {id: 5, isFolder: false, name: 'Maintenance Manual.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'George Whales', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Validated', lastUpdated: '5 mins ago'},
];

export default function DocumentSearchExplorerScreen({onBack, onCreateNewFileClick}: DocumentSearchExplorerScreenProps) {
  const [selectedHierarchyId, setSelectedHierarchyId] = useState<string>(DEFAULT_DOCUMENT_HIERARCHY_SELECTION_ID);
  const [favoriteHierarchyIds, setFavoriteHierarchyIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchScope, setSearchScope] = useState<'current' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [mockFolders, setMockFolders] = useState(initialMockFolders);
  const [mockFiles, setMockFiles] = useState(initialMockFiles);
  const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success' as 'success' | 'info' | 'error'});

  const selectedHierarchyPath = useMemo(
    () => findDocumentHierarchyPath(selectedHierarchyId) ?? [],
    [selectedHierarchyId],
  );
  const selectedHierarchyNode = selectedHierarchyPath[selectedHierarchyPath.length - 1] ?? null;
  const breadcrumbNodes = selectedHierarchyPath.filter((node) => node.kind !== 'global');

  const handleSelectHierarchy = (nodeId: string) => {
    setSelectedHierarchyId(nodeId);
    setSelectedFolderIds([]);
    setSelectedFileIds([]);
  };

  const toggleFavoriteHierarchy = (nodeId: string) => {
    setFavoriteHierarchyIds((current) => (
      current.includes(nodeId)
        ? current.filter((favoriteId) => favoriteId !== nodeId)
        : [...current, nodeId]
    ));
  };

  const handleToggleFolderSelect = (id: number) => {
    setSelectedFolderIds((prev) => (prev.includes(id) ? prev.filter((folderId) => folderId !== id) : [...prev, id]));
  };

  const handleToggleFileSelect = (id: number) => {
    setSelectedFileIds((prev) => (prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]));
  };

  const toggleFolderStar = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setMockFolders((prev) => prev.map((folder) => (folder.id === id ? {...folder, starred: !folder.starred} : folder)));
  };

  const toggleFileStar = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setMockFiles((prev) => prev.map((file) => (file.id === id ? {...file, starred: !file.starred} : file)));
  };

  const showSnackbar = (message: string, severity: 'success' | 'info' | 'error' = 'success') => {
    setSnackbar({open: true, message, severity});
  };

  const handleBulkAction = (action: string) => {
    const totalSelected = selectedFolderIds.length + selectedFileIds.length;
    showSnackbar(`${totalSelected} items ${action} successfully.`, 'success');
    if (action === 'deleted') {
      setMockFolders((prev) => prev.filter((folder) => !selectedFolderIds.includes(folder.id)));
      setMockFiles((prev) => prev.filter((file) => !selectedFileIds.includes(file.id)));
      setSelectedFolderIds([]);
      setSelectedFileIds([]);
    }
  };

  const hasSelection = selectedFolderIds.length > 0 || selectedFileIds.length > 0;

  const filteredFolders = mockFolders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = mockFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const globalFolders = searchScope === 'all' ? filteredFolders : filteredFolders;
  const globalFiles = searchScope === 'all' ? filteredFiles : filteredFiles;
  const unifiedData = [...globalFolders, ...globalFiles];

  return (
    <Box sx={{flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box sx={{px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #e0e0e0'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <IconButton onClick={onBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" color="primary" sx={{fontWeight: 'bold'}}>
            Search & Hierarchy
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 2}}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => showSnackbar('Properties menu clicked', 'info')}>Properties</Button>
          <Button variant="outlined" startIcon={<InfoOutlinedIcon />} color={isDetailsOpen ? 'primary' : 'inherit'} onClick={() => setIsDetailsOpen(!isDetailsOpen)}>Details</Button>
        </Box>
      </Box>

      <Box sx={{px: 3, py: 1.5, display: 'flex', gap: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', alignItems: 'center', flexWrap: 'wrap'}}>
        <Button size="small" variant="text" startIcon={<CreateNewFolderIcon />} onClick={onCreateNewFileClick}>Create New</Button>
        <Button size="small" variant="text" startIcon={<CloudUploadIcon />} onClick={onCreateNewFileClick}>Upload</Button>
        <Button size="small" variant="text" startIcon={<EditIcon />} disabled={!hasSelection} onClick={() => handleBulkAction('moved to editing')}>Edit</Button>
        <Button size="small" variant="text" startIcon={<ArrowUpwardIcon />} disabled={!hasSelection} onClick={() => handleBulkAction('moved')}>Move</Button>
        <Button size="small" variant="text" startIcon={<DeleteIcon />} disabled={!hasSelection} color="error" onClick={() => handleBulkAction('deleted')}>Delete</Button>

        <Box sx={{flexGrow: 1}} />

        <TextField
          placeholder="Search All..."
          size="small"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          sx={{width: 250, '& .MuiInputBase-root': {bgcolor: '#f5f5f5', borderRadius: 2}}}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{display: 'flex', border: '1px solid #e0e0e0', borderRadius: 1.5, overflow: 'hidden', flexShrink: 0}}>
          <Button
            size="small"
            startIcon={<FolderCopyIcon />}
            onClick={() => setSearchScope('current')}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 0,
              textTransform: 'none',
              fontSize: '0.75rem',
              bgcolor: searchScope === 'current' ? '#044ED7' : 'white',
              color: searchScope === 'current' ? 'white' : '#555',
              '&:hover': {bgcolor: searchScope === 'current' ? '#044ED7' : '#f5f5f5'},
            }}
          >
            Current
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button
            size="small"
            startIcon={<PublicIcon />}
            onClick={() => setSearchScope('all')}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 0,
              textTransform: 'none',
              fontSize: '0.75rem',
              bgcolor: searchScope === 'all' ? '#044ED7' : 'white',
              color: searchScope === 'all' ? 'white' : '#555',
              '&:hover': {bgcolor: searchScope === 'all' ? '#044ED7' : '#f5f5f5'},
            }}
          >
            All Docs
          </Button>
        </Box>
        <Button size="small" variant="outlined" startIcon={<FilterListIcon />} onClick={() => showSnackbar('Filters menu opened', 'info')}>Filters</Button>
        <Button size="small" variant="outlined" startIcon={<SettingsIcon />} onClick={() => showSnackbar('Settings opened', 'info')}>Settings</Button>
      </Box>

      <Box sx={{display: 'flex', flexGrow: 1, overflow: 'hidden'}}>
        <Box sx={{width: '30%', minWidth: 320, maxWidth: 380, bgcolor: 'white', borderRight: '1px solid #e0e0e0', overflow: 'hidden'}}>
          <DocumentHierarchyPicker
            selectedId={selectedHierarchyId}
            favoriteIds={favoriteHierarchyIds}
            onSelect={handleSelectHierarchy}
            onToggleFavorite={toggleFavoriteHierarchy}
          />
        </Box>

        <Box sx={{flexGrow: 1, p: 3, overflowY: 'auto'}}>
          {!selectedHierarchyNode ? (
            <Box sx={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9e9e9e'}}>
              <FolderIcon sx={{fontSize: 64, mb: 2, opacity: 0.5}} />
              <Typography variant="h6">Select a hierarchy</Typography>
              <Typography variant="body2">Choose a site, area, unit, line, or zone to view contextual documents.</Typography>
            </Box>
          ) : (
            <Box>
              <Breadcrumbs aria-label="breadcrumb" sx={{mb: 3}}>
                {breadcrumbNodes.slice(0, -1).map((node) => (
                  <Link
                    key={node.id}
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handleSelectHierarchy(node.id);
                    }}
                  >
                    {node.label}
                  </Link>
                ))}
                <Typography color="text.primary" sx={{fontWeight: 'bold'}}>{selectedHierarchyNode.label}</Typography>
              </Breadcrumbs>

              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="subtitle1" sx={{fontWeight: 'bold', color: '#060A3D'}}>Hierarchy Results</Typography>
                <Box>
                  <IconButton size="small" onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}><GridViewIcon /></IconButton>
                  <IconButton size="small" onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}><ViewListIcon /></IconButton>
                </Box>
              </Box>

              {viewMode === 'grid' ? (
                <Grid container spacing={2}>
                  {unifiedData.map((item) => (
                    <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={item.id}>
                      <Card
                        variant="outlined"
                        onClick={() => (item.isFolder ? handleToggleFolderSelect(item.id) : handleToggleFileSelect(item.id))}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          p: 2,
                          height: '100%',
                          cursor: 'pointer',
                          bgcolor: (item.isFolder ? selectedFolderIds.includes(item.id) : selectedFileIds.includes(item.id)) ? '#f0f7ff' : 'white',
                          borderColor: (item.isFolder ? selectedFolderIds.includes(item.id) : selectedFileIds.includes(item.id)) ? '#044ED7' : '#e0e0e0',
                          '&:hover': {bgcolor: '#fcfcfc', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'},
                        }}
                      >
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center'}}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Checkbox size="small" checked={item.isFolder ? selectedFolderIds.includes(item.id) : selectedFileIds.includes(item.id)} sx={{p: 0}} />
                            {item.type && <Chip label={item.type} size="small" sx={{fontSize: 10, bgcolor: '#e0e0e0', fontWeight: 'bold'}} />}
                          </Box>
                          <IconButton size="small" sx={{p: 0}} onClick={(event) => (item.isFolder ? toggleFolderStar(item.id, event) : toggleFileStar(item.id, event))}>
                            {item.starred ? <StarIcon sx={{color: '#ffca28', fontSize: 18}} /> : <StarBorderIcon sx={{color: '#bdbdbd', fontSize: 18}} />}
                          </IconButton>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'flex-start', mb: 2, mt: 1, flexGrow: 1}}>
                          {item.isFolder ? <FolderIcon sx={{color: '#ffca28', mr: 1, mt: 0.5, fontSize: 24}} /> : <DescriptionIcon sx={{color: '#044ED7', mr: 1, mt: 0.5, fontSize: 24}} />}
                          <Typography variant="body2" sx={{fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.2}}>{item.name}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1, borderTop: '1px solid #f0f0f0'}}>
                          {(item as any).status ? <Chip label={(item as any).status} size="small" sx={{fontSize: 9, bgcolor: (item as any).status === 'Validated' ? '#e8f5e9' : '#ffebee', color: (item as any).status === 'Validated' ? '#00AF95' : '#E43B46', height: 18}} /> : <Typography variant="caption" sx={{color: '#666'}}>{(item as any).items} items</Typography>}
                          <Typography variant="caption" color="text.secondary" sx={{fontSize: 10}}>{item.modified || (item as any).lastUpdated}</Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableContainer component={Paper} elevation={0} variant="outlined" sx={{border: 'none', borderRadius: 0, borderTop: '1px solid #e0e0e0'}}>
                  <Table size="small" sx={{minWidth: 800}}>
                    <TableHead>
                      <TableRow sx={{'& th': {borderBottom: '1px solid #e0e0e0', color: '#555', fontWeight: 600, fontSize: '0.8rem', py: 1}}}>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" />
                        </TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Modified</TableCell>
                        <TableCell>Modified By</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Approver</TableCell>
                        <TableCell>Review Date</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Document Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unifiedData.map((item) => {
                        const isSelected = item.isFolder ? selectedFolderIds.includes(item.id) : selectedFileIds.includes(item.id);

                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={isSelected}
                            onClick={() => {
                              item.isFolder ? handleToggleFolderSelect(item.id) : handleToggleFileSelect(item.id);
                              if (!item.isFolder && !isDetailsOpen) setIsDetailsOpen(true);
                            }}
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': {bgcolor: '#f0f7ff'},
                              '& td': {borderBottom: '1px solid #f0f0f0', py: 1},
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox size="small" checked={isSelected} onClick={(event) => event.stopPropagation()} onChange={() => (item.isFolder ? handleToggleFolderSelect(item.id) : handleToggleFileSelect(item.id))} />
                            </TableCell>
                            <TableCell sx={{minWidth: 200}}>
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                {item.isFolder ? <FolderIcon sx={{color: '#ffca28', fontSize: 20}} /> : <DescriptionIcon sx={{color: '#044ED7', fontSize: 18}} />}
                                <Typography variant="body2" sx={{fontWeight: item.isFolder ? 600 : 500}}>{item.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{item.modified}</Typography></TableCell>
                            <TableCell>
                              <Chip label={item.modifiedBy} size="small" sx={{bgcolor: '#f5f5f5', color: '#555', fontWeight: 500, fontSize: '0.75rem', height: 24}} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Avatar sx={{width: 24, height: 24, fontSize: 12, bgcolor: '#ffb74d'}}>{item.owner?.charAt(0)}</Avatar>
                                <Typography variant="body2">{item.owner}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Avatar sx={{width: 24, height: 24, fontSize: 12, bgcolor: '#ba68c8'}}>{item.approver?.charAt(0)}</Avatar>
                                <Typography variant="body2">{item.approver}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{item.reviewDate}</Typography></TableCell>
                            <TableCell>
                              <Chip label={item.frequency} size="small" sx={{bgcolor: item.isFolder ? 'transparent' : '#EBEDF0', color: item.isFolder ? 'transparent' : '#044ED7', fontWeight: 'bold', fontSize: '0.75rem', height: 24}} />
                            </TableCell>
                            <TableCell>
                              <Chip label={item.type} size="small" sx={{bgcolor: item.isFolder ? '#f5f5f5' : '#3f51b5', color: item.isFolder ? '#555' : 'white', fontWeight: 'bold', fontSize: '0.75rem', height: 24}} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>

        {isDetailsOpen && (
          <Box sx={{width: 350, minWidth: 350, bgcolor: '#222222', color: '#f0f0f0', borderLeft: '1px solid #111', display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
            <Box sx={{p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Typography variant="subtitle1" sx={{fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1}}>
                <InfoOutlinedIcon fontSize="small" /> Details
              </Typography>
              <IconButton size="small" onClick={() => setIsDetailsOpen(false)} sx={{color: '#aaa'}}>
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedFileIds.length > 0 ? (() => {
              const file = mockFiles.find((candidate) => candidate.id === selectedFileIds[selectedFileIds.length - 1]);
              return (
                <Box sx={{p: 0, display: 'flex', flexDirection: 'column'}}>
                  <Box sx={{height: 260, bgcolor: '#333333', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #444'}}>
                    <Paper elevation={3} sx={{width: 160, height: 210, bgcolor: 'white', mx: 'auto', p: 1.5, display: 'flex', flexDirection: 'column'}}>
                      <Typography variant="caption" sx={{color: '#000', fontWeight: 'bold', display: 'block', textAlign: 'center', mb: 1, fontSize: 8}}>{file?.name}</Typography>
                      <Box sx={{width: '100%', height: 3, bgcolor: '#e0e0e0', mb: 0.5}} />
                      <Box sx={{width: '90%', height: 3, bgcolor: '#e0e0e0', mb: 0.5}} />
                      <Box sx={{width: '95%', height: 3, bgcolor: '#e0e0e0', mb: 1}} />
                      <Box sx={{width: '100%', height: 3, bgcolor: '#e0e0e0', mb: 0.5}} />
                      <Box sx={{width: '80%', height: 3, bgcolor: '#e0e0e0', mb: 0.5}} />
                      <Box sx={{flexGrow: 1}} />
                      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <DescriptionIcon sx={{fontSize: 14, color: '#044ED7'}} />
                        <Typography variant="caption" sx={{fontSize: 6, color: '#888'}}>{file?.modified}</Typography>
                      </Box>
                    </Paper>
                  </Box>

                  <Box sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.5}}>
                      <DescriptionIcon sx={{color: '#4fc3f7', fontSize: 28}} />
                      <Typography variant="subtitle1" sx={{fontWeight: 'bold', wordBreak: 'break-word', lineHeight: 1.2}}>{file?.name}</Typography>
                    </Box>

                    <Typography variant="body2" sx={{color: '#bbb'}}>This item is not shared</Typography>

                    <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} sx={{alignSelf: 'flex-start', color: '#e0e0e0', borderColor: '#555', textTransform: 'none'}}>
                      Share
                    </Button>

                    <Divider sx={{borderColor: '#444', my: 1}} />

                    <Typography variant="subtitle2" sx={{fontWeight: 'bold', mb: 1}}>Details</Typography>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <Typography variant="body2" sx={{color: '#bbb', width: '40%'}}>Type</Typography>
                      <Typography variant="body2" sx={{width: '60%', textAlign: 'right'}}>{file?.type} Document</Typography>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <Typography variant="body2" sx={{color: '#bbb', width: '40%'}}>Size</Typography>
                      <Typography variant="body2" sx={{width: '60%', textAlign: 'right'}}>215 KB</Typography>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <Typography variant="body2" sx={{color: '#bbb', width: '40%'}}>Date modified</Typography>
                      <Typography variant="body2" sx={{width: '60%', textAlign: 'right'}}>{file?.modified}</Typography>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <Typography variant="body2" sx={{color: '#bbb', width: '40%'}}>Modified by</Typography>
                      <Typography variant="body2" sx={{width: '60%', textAlign: 'right'}}>{file?.modifiedBy}</Typography>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <Typography variant="body2" sx={{color: '#bbb', width: '40%'}}>Owner</Typography>
                      <Typography variant="body2" sx={{width: '60%', textAlign: 'right'}}>{file?.owner}</Typography>
                    </Box>

                    <Button variant="outlined" size="small" startIcon={<SettingsIcon />} sx={{mt: 1, alignSelf: 'flex-start', color: '#e0e0e0', borderColor: '#555', textTransform: 'none'}}>
                      Properties
                    </Button>
                  </Box>
                </Box>
              );
            })() : (
              <Box sx={{p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
                <InfoOutlinedIcon sx={{fontSize: 48, mb: 2, opacity: 0.3}} />
                <Typography variant="body2">Select a document to view its details</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{width: '100%'}}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
