import React from 'react';
import { Box, Paper, Typography, Button, IconButton, Chip, Grid, TextField, InputAdornment, Divider, FormControl, InputLabel, Select, MenuItem, Avatar } from '@mui/material';
import { Search as SearchIcon, AccessTime as TimeIcon, AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';

export default function NotificationDashboardScreen({ 
  activeNotificationAlerts, 
  notificationStatusBreakdown, 
  resolvedNotificationAlertIds, 
  notificationPriorityBreakdown, 
  notificationSourceChartData, 
  notificationOwnerChartData, 
  notificationFeedSearch, 
  setNotificationFeedSearch, 
  notificationFeedSource, 
  setNotificationFeedSource, 
  notificationFeedOwner, 
  setNotificationFeedOwner, 
  notificationFeedSeverity, 
  setNotificationFeedSeverity, 
  notificationFeedSourceOptions, 
  notificationFeedOwnerOptions, 
  filteredNotificationAlerts, 
  selectedNotificationAlertId, 
  setSelectedNotificationAlertId, 
  selectedNotificationAlert, 
  setCurrentScreen, 
  resolveSelectedNotificationAlert
}: any) {
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2.2, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#626465', letterSpacing: '0.08em' }}>NOTIFICATION DASHBOARD</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366' }}>Plant Alerts & Notifications</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Live alert stream separated from Action Tracker so operators can triage and resolve issues quickly.
            </Typography>
          </Box>
          <Chip label={`${activeNotificationAlerts.length} Active`} sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800 }} />
        </Box>

        <Grid container spacing={1.2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #ef4444', bgcolor: '#fff1f2' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444', lineHeight: 1.1 }}>{activeNotificationAlerts.length}</Typography>
              <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700 }}>Active Alerts</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #2563eb', bgcolor: '#eff6ff' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d4ed8', lineHeight: 1.1 }}>{notificationStatusBreakdown.find((item: any) => item.status === 'New')?.value ?? 0}</Typography>
              <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700 }}>New</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #0f766e', bgcolor: '#ecfeff' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f766e', lineHeight: 1.1 }}>{resolvedNotificationAlertIds.length}</Typography>
              <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 700 }}>Solved</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #7c3aed', bgcolor: '#f5f3ff' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#7c3aed', lineHeight: 1.1 }}>{notificationPriorityBreakdown.find((item: any) => item.priority === 'High')?.value ?? 0}</Typography>
              <Typography variant="caption" sx={{ color: '#6d28d9', fontWeight: 700 }}>High Severity</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #f59e0b', bgcolor: '#fff7ed' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', lineHeight: 1.1 }}>{notificationPriorityBreakdown.find((item: any) => item.priority === 'Medium')?.value ?? 0}</Typography>
              <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700 }}>Medium Severity</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.6, borderLeft: '3px solid #16a34a', bgcolor: '#f0fdf4' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#16a34a', lineHeight: 1.1 }}>{notificationPriorityBreakdown.find((item: any) => item.priority === 'Low')?.value ?? 0}</Typography>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>Low Severity</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mb: 1.8 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 1.4, borderRadius: 1.6, border: '1px solid #DBDDDF', height: 264 }}>
              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.6 }}>PRIORITY BREAKDOWN</Typography>
              <BarChart
                height={208}
                xAxis={[{ data: notificationPriorityBreakdown.map((item: any) => item.priority), scaleType: 'band' }]}
                series={[{ data: notificationPriorityBreakdown.map((item: any) => item.value), color: '#E43B46', label: 'Open alerts' }]}
                margin={{ left: 42, right: 10, top: 16, bottom: 30 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 1.4, borderRadius: 1.6, border: '1px solid #DBDDDF', height: 264 }}>
              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.6 }}>SOURCE BREAKDOWN</Typography>
              <BarChart
                height={208}
                xAxis={[{ data: notificationSourceChartData.map((item: any) => item.source), scaleType: 'band' }]}
                series={[{ data: notificationSourceChartData.map((item: any) => item.value), color: '#044ED7', label: 'Alerts by source' }]}
                margin={{ left: 42, right: 10, top: 16, bottom: 30 }}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 1.4, borderRadius: 1.6, border: '1px solid #DBDDDF', height: 264 }}>
              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.8 }}>STATUS DISTRIBUTION</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {notificationStatusBreakdown.map((item: any) => {
                  const total = (notificationStatusBreakdown[0]?.value ?? 0) + (notificationStatusBreakdown[1]?.value ?? 0) || 1;
                  const width = `${Math.round((item.value / total) * 100)}%`;
                  return (
                    <Box key={item.status}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>{item.status}</Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>{item.value}</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#EBEDF0', borderRadius: 999 }}>
                        <Box sx={{ height: '100%', width, borderRadius: 999, bgcolor: item.status === 'New' ? '#2563eb' : '#94a3b8' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Divider sx={{ my: 1.1 }} />
              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.5 }}>OWNER LOAD</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {notificationOwnerChartData.slice(0, 3).map((ownerRow: any) => (
                  <Box key={ownerRow.owner} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#334155' }}>{ownerRow.owner}</Typography>
                    <Chip size="small" label={`${ownerRow.value} open`} sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 6.8 }}>
            <Paper elevation={0} sx={{ borderRadius: 1.6, border: '1px solid #DBDDDF', overflow: 'hidden' }}>
              <Box sx={{ px: 1.2, py: 0.9, bgcolor: '#f8fafc', borderBottom: '1px solid #DBDDDF' }}>
                <Typography variant="subtitle2" sx={{ color: '#475569', letterSpacing: '0.06em' }}>ALERT FEED</Typography>
              </Box>
              <Box sx={{ p: 1, borderBottom: '1px solid #EBEDF0', display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <TextField
                  size="small"
                  placeholder="Search alerts"
                  value={notificationFeedSearch}
                  onChange={(event) => setNotificationFeedSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Grid container spacing={0.8}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Source</InputLabel>
                      <Select value={notificationFeedSource} label="Source" onChange={(event) => setNotificationFeedSource(event.target.value)}>
                        {notificationFeedSourceOptions.map((option: string) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Owner</InputLabel>
                      <Select value={notificationFeedOwner} label="Owner" onChange={(event) => setNotificationFeedOwner(event.target.value)}>
                        {notificationFeedOwnerOptions.map((option: string) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Severity</InputLabel>
                      <Select value={notificationFeedSeverity} label="Severity" onChange={(event) => setNotificationFeedSeverity(event.target.value as 'All' | 'High' | 'Medium' | 'Low')}>
                        {['All', 'High', 'Medium', 'Low'].map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ maxHeight: 362, overflowY: 'auto' }}>
                {filteredNotificationAlerts.length ? filteredNotificationAlerts.map((alert: any) => (
                  <Box
                    key={alert.id}
                    onClick={() => setSelectedNotificationAlertId(alert.id)}
                    sx={{
                      px: 1.2,
                      py: 0.9,
                      borderBottom: '1px solid #EBEDF0',
                      cursor: 'pointer',
                      bgcolor: selectedNotificationAlert?.id === alert.id ? '#eef4ff' : '#fff',
                      '&:hover': { bgcolor: selectedNotificationAlert?.id === alert.id ? '#e0ebff' : '#f8fbff' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#1F2366', fontWeight: 700 }}>{alert.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{alert.id} · {alert.location} · {alert.source}</Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={alert.priority}
                        sx={{
                          fontWeight: 800,
                          bgcolor: alert.priority === 'High' ? '#fff1f2' : alert.priority === 'Medium' ? '#fff7ed' : '#f0fdf4',
                          color: alert.priority === 'High' ? '#ef4444' : alert.priority === 'Medium' ? '#f59e0b' : '#16a34a',
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip size="small" label={alert.status} sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Due {alert.dueDate} · {alert.owner}</Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" sx={{ color: '#64748b', p: 1.2 }}>
                    No alerts found for the selected filters.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5.2 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1.6, border: '1px solid #DBDDDF' }}>
              <Typography variant="subtitle2" sx={{ color: '#475569', letterSpacing: '0.06em' }}>RESOLUTION PANEL</Typography>
              {selectedNotificationAlert ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', mt: 0.5 }}>{selectedNotificationAlert.title}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.8, color: '#334155' }}>
                    Source: {selectedNotificationAlert.source} · Location: {selectedNotificationAlert.location}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    Owner: {selectedNotificationAlert.owner} · Due: {selectedNotificationAlert.dueDate}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    <Chip size="small" label={selectedNotificationAlert.priority} sx={{ bgcolor: '#fff1f2', color: '#b91c1c', fontWeight: 800 }} />
                    <Chip size="small" label={selectedNotificationAlert.status} sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800 }} />
                  </Box>
                  <Box sx={{ mt: 1.2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={() => setCurrentScreen('work_order_hub')} sx={{ bgcolor: '#044ED7', '&:hover': { bgcolor: '#1D74FF' } }}>
                      Open Work Order
                    </Button>
                    <Button variant="outlined" onClick={resolveSelectedNotificationAlert}>
                      Resolve Issue
                    </Button>
                  </Box>
                  <Grid container spacing={1} sx={{ mt: 1.2 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>ALERT ID</Typography>
                        <Typography variant="subtitle2" sx={{ color: '#1e3a8a', fontWeight: 800 }}>{selectedNotificationAlert.id}</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>ASSIGNED TO</Typography>
                        <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 800 }}>{selectedNotificationAlert.owner}</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #fed7aa', bgcolor: '#fff7ed' }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>TARGET DUE</Typography>
                        <Typography variant="subtitle2" sx={{ color: '#9a3412', fontWeight: 800 }}>{selectedNotificationAlert.dueDate}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1 }}>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.2, border: '1px solid #DBDDDF', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>ROOT SIGNAL</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                        {selectedNotificationAlert.source} triggered this alert at {selectedNotificationAlert.location}.
                      </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.2, border: '1px solid #DBDDDF', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>RECOMMENDED NEXT STEP</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                        Open the linked workflow to complete corrective action and submit closure notes.
                      </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.2, border: '1px solid #DBDDDF' }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>HANDOFF NOTE</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                        Keep this alert in focus until evidence is attached and issue status changes to resolved.
                      </Typography>
                    </Paper>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                  No active alerts. Notification dashboard is clear.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}