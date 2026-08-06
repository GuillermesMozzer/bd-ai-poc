import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  IconButton,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Card,
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  QrCodeScanner as QrCodeScannerIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckCircleIcon,
  OpenInFull as ExpandIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  TableChart as SheetIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface DashboardScreenProps {
  setCurrentScreen: (screen: string) => void;
  openSmartSearch: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  setCurrentScreen,
  openSmartSearch,
  setIsDrawerOpen,
  setIsAiDrawerOpen,
}) => {
  return (
    <>
      {/* Action Header */}
      <Box sx={{
        px: 4, py: 2.5,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        bgcolor: 'white',
        borderBottom: '1px solid #EBEDF0',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2 }}>
              Autoguard <Box component="span" sx={{ color: '#cbd5e1', mx: 1 }}>&gt;</Box> Line 10
            </Typography>
            <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500, mt: 0.5 }}>
              COORDINATED OPERATIONS DASHBOARD
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label="PROD ACTIVE"
              size="small"
              sx={{ bgcolor: '#ecfdf5', color: '#00AF95', fontWeight: 700, fontSize: 10, height: 20 }}
            />
            <IconButton size="small" onClick={() => setCurrentScreen('shift_logbook')} sx={{ bgcolor: '#EBEDF0', border: '1px solid #EBEDF0' }}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<SearchIcon sx={{ fontSize: 18 }} />} onClick={openSmartSearch}>SEARCH DOCS</Button>
          <Button variant="outlined" startIcon={<QrCodeScannerIcon sx={{ fontSize: 18 }} />} onClick={() => setCurrentScreen('document_operations')}>SCAN EQUIPMENT</Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<SparkleIcon sx={{ fontSize: 18 }} />}
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: '#1D74FF',
              '&:hover': { bgcolor: '#044ED7' },
              px: 3
            }}
          >
            NEW OPERATIONS ENTRY
          </Button>
        </Box>
      </Box>

      {/* Content Grid */}
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Grid container spacing={3}>

          {/* Left Column (Alerts + CILTs + Maintenance + Equipment) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {/* BLU.AI Detected Alerts */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{
                  p: 2.5,
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
                  border: '1px solid #bae6fd',
                  display: 'flex', flexDirection: 'column', gap: 1.5,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', filter: 'blur(30px)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#1D74FF', display: 'flex' }}>
                        <SparkleIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ color: '#0369a1', fontWeight: 700 }}>BLU.AI Detected Alerts</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip label="1 ACTIVE" size="small" sx={{ bgcolor: 'white', color: '#0369a1', fontWeight: 700, fontSize: 10, height: 20 }} />
                      <IconButton size="small" onClick={() => setCurrentScreen('ai_assistant')}><ExpandIcon fontSize="small" sx={{ color: '#0369a1' }} /></IconButton>
                    </Box>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)',
                      p: 2, borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <Box sx={{ color: '#0369a1', display: 'flex' }}>
                      <CheckCircleIcon />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#0c4a6e', fontWeight: 600 }}>
                      Great news, everything seems to be working properly during this shift. No critical anomalies detected.
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>

              {/* Today's CILTs & Centerlining */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, border: '1px solid #EBEDF0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366' }}>Today's Tasks & CILTs</Typography>
                      <Typography variant="caption">Monitoring <Box component="span" sx={{ color: '#1D74FF', fontWeight: 600 }}>18 Active</Box> points on Line 10</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ToggleButtonGroup size="small" value="all" exclusive sx={{ height: 32, bgcolor: '#EBEDF0', p: 0.5, borderRadius: 2 }}>
                        <ToggleButton value="all" sx={{ px: 2, fontSize: 12, textTransform: 'none', border: 'none', borderRadius: '6px !important', '&.Mui-selected': { bgcolor: 'white', color: '#1F2366', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } }}>All (18)</ToggleButton>
                        <ToggleButton value="cilt" sx={{ px: 2, fontSize: 12, textTransform: 'none', border: 'none', borderRadius: '6px !important' }}>CILT (2)</ToggleButton>
                      </ToggleButtonGroup>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => setIsAiDrawerOpen(true)} sx={{ border: '1px solid #EBEDF0' }}><SparkleIcon fontSize="small" sx={{ color: '#808285' }} /></IconButton>
                        <IconButton size="small" onClick={() => setCurrentScreen('tier_meeting')} sx={{ border: '1px solid #EBEDF0' }}><ExpandIcon fontSize="small" color="primary" /></IconButton>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3, px: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#626465' }}>OVERALL COMPLETION</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1D74FF' }}>27% (3/11 CORE)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={27} sx={{ height: 8, borderRadius: 4, bgcolor: '#EBEDF0', '& .MuiLinearProgress-bar': { bgcolor: '#1D74FF', borderRadius: 4 } }} />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Paper variant="outlined" sx={{ bgcolor: '#fffdfa', borderColor: '#fef3c7', p: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ p: 1, borderRadius: 1, bgcolor: '#fef3c7' }}>
                        <TimeIcon sx={{ color: '#d97706', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>Priority:</Box> Changeover on Adapter Conveyor requires centerlining verification.
                      </Typography>
                    </Paper>
                  </Box>

                  <List disablePadding>
                    {[
                      { name: 'Z2 Extrusion Machine', status: 'Stopped', statusColor: 'error', type: 'CILT', loc: 'Z2', time: '15m' },
                      { name: 'Conveyor Behind Tippers', type: 'Daily', loc: 'Z2', time: '15m' },
                      { name: 'Station 12 Tip-Shield Nest 1, 3', type: 'Daily', loc: 'Z6', time: '15m' },
                      { name: 'Station 15 Tip-Shield Nest 2, 4', type: 'Daily', loc: 'Z6', time: '15m' },
                      { name: 'C30-C60 All Tippers', type: 'Troubleshoot', loc: 'Z2', time: '15m' },
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ py: 1.5, px: 1, borderRadius: 2, '&:hover': { bgcolor: '#EBEDF0' }, transition: 'background 0.2s', borderBottom: index < 4 ? '1px solid #EBEDF0' : 'none' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2366' }}>{item.name}</Typography>
                              {item.status && (
                                <Chip label={item.status} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: item.statusColor === 'error' ? '#fef2f2' : '#ecfdf5', color: item.statusColor === 'error' ? '#E43B46' : '#00AF95' }} />
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: '#EBEDF0' }}>
                            <FlagIcon sx={{ fontSize: 12, color: '#626465' }} />
                            <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{item.type}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 40 }}>
                            <LocationIcon sx={{ fontSize: 12, color: '#808285' }} />
                            <Typography variant="caption">{item.loc}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 50 }}>
                            <TimeIcon sx={{ fontSize: 12, color: '#808285' }} />
                            <Typography variant="caption">{item.time}</Typography>
                          </Box>
                          <IconButton size="small" onClick={() => setIsDrawerOpen(true)} sx={{ color: '#1D74FF' }}><CheckCircleIcon fontSize="small" /></IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button variant="text" size="small" startIcon={<CalendarIcon />} onClick={() => setCurrentScreen('tier_meeting')} sx={{ color: '#626465' }}>WEEK SCHEDULE</Button>
                    <Button variant="text" size="small" startIcon={<SheetIcon />} onClick={() => setCurrentScreen('shift_logbook')} sx={{ color: '#626465' }}>LINE LOG SHEET</Button>
                  </Box>
                </Paper>
              </Grid>


              {/* Bottom Row: Maintenance & Equipment */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">My Line Open Maintenance Requests</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => setIsAiDrawerOpen(true)}><SparkleIcon fontSize="small" color="disabled" /></IconButton>
                      <IconButton size="small" onClick={() => setCurrentScreen('action_tracker')}><ExpandIcon fontSize="small" color="primary" /></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
                    <Typography variant="caption" color="text.secondary">ID ↓</Typography>
                    <Typography variant="caption" color="text.secondary">Reporter ↓</Typography>
                  </Box>
                  <List disablePadding>
                    {[
                      { id: 'WN-952532567', title: 'Motor Line 3 Gasket', reporter: 'Ronnie D\'elano', avatar: 'RD', color: '#FF6E00' },
                      { id: 'WN-952532567', title: 'Hydraulic Press #4 Convey Belt', reporter: 'BLU.AI', avatar: 'AI', color: '#044ED7', isAi: true },
                      { id: 'WN-952532567', title: 'Motor Line 3 Gasket', reporter: 'Thomas Jeff', avatar: 'TJ', color: '#FF6E00' },
                    ].map((req, i) => (
                      <Paper key={i} variant="outlined" sx={{ mb: 1, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${req.color}` }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>{req.id}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{req.title}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#FF6E00', fontWeight: 'bold' }}>D</Typography>
                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>Q</Typography>
                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>S</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {req.isAi ? (
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#044ED7' }}><SparkleIcon sx={{ fontSize: 14, color: 'white' }} /></Avatar>
                          ) : (
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', color: '#333', fontSize: 10 }}>{req.avatar}</Avatar>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ width: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.reporter}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 2, height: '100%', position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">My Line Equipment Status</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => setIsAiDrawerOpen(true)}><SparkleIcon fontSize="small" color="disabled" /></IconButton>
                      <IconButton size="small" onClick={() => setCurrentScreen('document_operations')}><ExpandIcon fontSize="small" color="primary" /></IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {[
                      { name: 'Injection Molding Machine', oee: 98, avail: 99, wo: 6 },
                      { name: 'Syringe Assembly Station', oee: 98, avail: 99, wo: 6 },
                      { name: 'Printing & Marking Machine', oee: 98, avail: 99, wo: 6 },
                    ].map((equip, i) => (
                      <Card key={i} variant="outlined" sx={{ minWidth: 200, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#044ED7', width: '60%' }}>{equip.name}</Typography>
                          <Chip label="Operating" size="small" sx={{ bgcolor: '#e8f5e9', color: '#00AF95', fontWeight: 'bold', fontSize: 10, height: 20 }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexGrow: 1, p: 1.5, pt: 0 }}>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1, mr: 1 }}>
                            {/* Placeholder for machine image */}
                            <Box sx={{ width: 60, height: 60, border: '2px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="caption" color="text.secondary">IMG</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '40%' }}>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#044ED7', lineHeight: 1 }}>{equip.oee}%</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>OEE</Typography>
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#044ED7', lineHeight: 1 }}>{equip.avail}%</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Availability</Typography>
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#044ED7', lineHeight: 1 }}>{equip.wo}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Open WO</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                  <IconButton onClick={() => setCurrentScreen('document_operations')} sx={{ position: 'absolute', left: -10, top: '50%', bgcolor: '#044ED7', color: 'white', '&:hover': { bgcolor: '#044ED7' }, width: 24, height: 24 }}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => setCurrentScreen('document_operations')} sx={{ position: 'absolute', right: -10, top: '50%', bgcolor: '#044ED7', color: 'white', '&:hover': { bgcolor: '#044ED7' }, width: 24, height: 24 }}>
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column (Tier 1 Overview) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#EBEDF0', border: '1px solid #EBEDF0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#1F2366', fontWeight: 800 }}>Tier 1 Intelligence</Typography>
                  <Typography variant="caption">Operational KPIs & Real-time Insights</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => setCurrentScreen('ai_assistant')} sx={{ bgcolor: 'white', border: '1px solid #EBEDF0' }}><SparkleIcon fontSize="small" sx={{ color: '#1D74FF' }} /></IconButton>
                  <IconButton size="small" onClick={() => setCurrentScreen('action_tracker')} sx={{ bgcolor: 'white', border: '1px solid #EBEDF0' }}><StarIcon fontSize="small" sx={{ color: '#FF6E00' }} /></IconButton>
                </Box>
              </Box>

              {/* Safety & Quality & Performance & Insights Grid */}
              <Grid container spacing={2.5} sx={{ flexGrow: 1 }}>
                {/* Safety Card */}
                <Grid size={{ xs: 6 }}>
                  <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">Safety</Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E43B46', boxShadow: '0 0 8px #E43B46' }} />
                    </Box>
                    <Box sx={{ py: 1 }}>
                      <Typography variant="h4" sx={{ color: '#E43B46', fontWeight: 800 }}>1</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>INCIDENT <Box component="span" sx={{ color: '#E43B46', opacity: 0.7 }}>● JAN</Box></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Box sx={{ flex: 1, bgcolor: '#EBEDF0', p: 1, borderRadius: 1.5, border: '1px solid #EBEDF0' }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>1</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>YTD</Typography>
                      </Box>
                      <Box sx={{ flex: 1, bgcolor: '#EBEDF0', p: 1, borderRadius: 1.5, border: '1px solid #EBEDF0' }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>5</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>L.Y.</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* Quality Card */}
                <Grid size={{ xs: 6 }}>
                  <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">Quality</Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6E00', boxShadow: '0 0 8px #FF6E00' }} />
                    </Box>
                    <Box sx={{ py: 1 }}>
                      <Typography variant="h4" sx={{ color: '#1F2366', fontWeight: 800 }}>2</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>ISSUES <Box component="span" sx={{ color: '#808285', opacity: 0.7 }}>● JAN</Box></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Box sx={{ flex: 1, bgcolor: '#EBEDF0', p: 1, borderRadius: 1.5, border: '1px solid #EBEDF0' }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>2</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>YTD</Typography>
                      </Box>
                      <Box sx={{ flex: 1, bgcolor: '#EBEDF0', p: 1, borderRadius: 1.5, border: '1px solid #EBEDF0' }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>9</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>L.Y.</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* Performance Card */}
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ p: 2.5, minHeight: 180 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Daily Production Trends</Typography>
                      <Chip label="Line 10" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, mt: 2, px: 1 }}>
                      {[40, 55, 35, 60, 25, 45, 50].map((val, i) => (
                        <Box key={i} sx={{ position: 'relative', width: '10%' }}>
                          <Box sx={{ height: val, width: '100%', bgcolor: val < 30 ? '#E43B46' : '#101e40', borderRadius: '4px 4px 1px 1px', transition: 'all 0.3s ease' }} />
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: 9 }}>{15 + i}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Insights Grid */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#626465' }}>ANALYTIC INSIGHTS</Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Open Actions', val: 23, color: '#1D74FF' },
                      { label: 'High Risks', val: 9, color: '#E43B46' },
                      { label: 'Meeting Notes', val: 12, color: '#101e40' },
                      { label: 'Closed WOs', val: 17, color: '#00AF95' },
                    ].map((stat, i) => (
                      <Grid size={{ xs: 6 }} key={i}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderLeft: `4px solid ${stat.color}` }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1 }}>{stat.val}</Typography>
                          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: '#626465' }}>{stat.label.toUpperCase()}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DashboardScreen;
