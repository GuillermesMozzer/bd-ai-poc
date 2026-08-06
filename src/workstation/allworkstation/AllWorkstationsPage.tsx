import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useMemo, useState} from 'react';
import {Box, Tab, Tabs, Typography, Button, Stack} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  DevicesOutlined as WorkstationIcon,
  CheckCircleOutline as ActiveIcon,
  WarningAmberRounded as AlertIcon,
  PowerSettingsNewOutlined as InactiveIcon,
} from '@mui/icons-material';
import HierarchyExplorer from './components/HierarchyExplorer';
import WorkstationsTable from './components/WorkstationsTable';
import UsersTable from './components/UsersTable';
import ConnectionPathCanvas from './components/ConnectionPathCanvas';
import SummaryCard from './components/SummaryCard';
import {AdminTab} from './data/workstation.types';
import {accessSelectionTree} from './data/workstation.mock';
import {findAccessPath} from './hooks/workstation.utils';
import {ALL_WORKSTATIONS_NODE_ID, useAllWorkstationsData} from './hooks/useAllWorkstationsData';

export default function AllWorkstationsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('workstations');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(ALL_WORKSTATIONS_NODE_ID);
  const {stats} = useAllWorkstationsData(selectedNodeId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: AdminTab) => {
    setActiveTab(newValue);
  };

  const contextBreadcrumb = useMemo(() => {
    if (!selectedNodeId || selectedNodeId === ALL_WORKSTATIONS_NODE_ID) return 'All Workstations';
    const path = findAccessPath(accessSelectionTree, selectedNodeId);
    if (!path) return 'All Workstations';
    return path.map(node => node.label).join(' > ');
  }, [selectedNodeId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {xs: 'column', lg: 'row'},
        height: 'calc(100vh - 84px)',
        minHeight: 'calc(100vh - 84px)',
        '@media screen and (max-width: 1280px)': {
          height: 'calc(133.33vh - 84px)',
          minHeight: 'calc(133.33vh - 84px)',
        },
        '@media screen and (min-width: 1281px) and (max-width: 1366px)': {
          height: 'calc(128.2vh - 84px)',
          minHeight: 'calc(128.2vh - 84px)',
        },
        '@media screen and (min-width: 1367px) and (max-width: 1440px)': {
          height: 'calc(120.5vh - 84px)',
          minHeight: 'calc(120.5vh - 84px)',
        },
        '@media screen and (min-width: 1441px) and (max-width: 1600px)': {
          height: 'calc(111.1vh - 84px)',
          minHeight: 'calc(111.1vh - 84px)',
        },
        '@media screen and (min-width: 1601px) and (max-width: 1920px)': {
          height: 'calc(105.3vh - 84px)',
          minHeight: 'calc(105.3vh - 84px)',
        },
        '@media screen and (min-width: 1921px)': {
          height: 'calc(100vh - 84px)',
          minHeight: 'calc(100vh - 84px)',
        },
        bgcolor: workstationVisuals.slateSurface,
      }}
    >
      {/* Sidebar: Hierarchy Explorer */}
      <Box
        sx={{
          width: {xs: '100%', lg: 280},
          maxHeight: {xs: 320, lg: 'none'},
          borderRight: {xs: 'none', lg: `1px solid ${workstationVisuals.tierBorder}`},
          borderBottom: {xs: `1px solid ${workstationVisuals.tierBorder}`, lg: 'none'},
          bgcolor: tokenCommon.white,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <HierarchyExplorer onSelect={setSelectedNodeId} selectedId={selectedNodeId} />
      </Box>

      {/* Main Content Area */}
      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Sub-Header with Tabs */}
        <Box sx={{px: {xs: 2, md: 3}, pt: 2, borderBottom: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenCommon.white}}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {height: 3, borderRadius: '3px 3px 0 0', bgcolor: tokenBrand.main},
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                color: workstationVisuals.textSecondary,
                '&.Mui-selected': {color: tokenBrand.main},
              },
            }}
          >
            <Tab value="workstations" label="Workstations" />
            <Tab value="escalation" label="Connection Path" />
            <Tab value="users" label="Users" />
          </Tabs>
        </Box>

        <Box sx={{flex: 1, overflowY: 'auto', p: {xs: 2, md: 3}, scrollbarWidth: 'thin'}}>
          {/* Dynamic Context Header */}
          <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: {xs: 'flex-start', md: 'center'}, flexDirection: {xs: 'column', md: 'row'}, gap: 1.5}}>
            <Box>
              <Typography sx={{fontSize: 18, fontWeight: 800, color: workstationVisuals.textPrimary, letterSpacing: '-0.01em'}}>Selected Context</Typography>
              <Typography sx={{fontSize: 14, color: workstationVisuals.textSecondary, fontWeight: 500}}>
                {contextBreadcrumb}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              sx={{
                width: {xs: '100%', md: 'auto'},
                textTransform: 'none',
                borderRadius: 2,
                borderColor: workstationVisuals.tierBorder,
                color: workstationVisuals.tierTextLabel,
                fontWeight: 600,
                '&:hover': {borderColor: tokenNeutral.dark, bgcolor: workstationVisuals.slateSurface},
              }}
            >
              View Context Details
            </Button>
          </Box>

          {/* KPI Summary Cards */}
          {activeTab !== 'users' ? (
            <Stack direction={{xs: 'column', md: 'row'}} spacing={3} sx={{mb: 4}}>
              <SummaryCard label="Total Workstations" value={stats.total} icon={<WorkstationIcon />} color={tokenBrand.main} />
              <SummaryCard label="Active" value={stats.active} icon={<ActiveIcon />} color={tokenSuccess.main} />
              <SummaryCard label="With Alerts" value={stats.alert} icon={<AlertIcon />} color={tokenWarning.main} />
              <SummaryCard label="Inactive" value={stats.inactive} icon={<InactiveIcon />} color={workstationVisuals.textSecondary} />
            </Stack>
          ) : null}

          {/* Tab Content */}
          <Box>
            {activeTab === 'workstations' && <WorkstationsTable nodeId={selectedNodeId} />}
            {activeTab === 'escalation' && <ConnectionPathCanvas nodeId={selectedNodeId} />}
            {activeTab === 'users' && <UsersTable nodeId={selectedNodeId} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
