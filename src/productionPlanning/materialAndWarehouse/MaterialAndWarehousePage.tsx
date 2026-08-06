import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowBackRounded as ArrowBackRoundedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Inventory2 as Inventory2Icon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  clearFilters,
  clearScenario,
  closeAiPanel,
  closeDrawer,
  dismissToast,
  initialMaterialWarehouseState,
  openAiPanel,
  runScenario,
  selectMaterial,
  setActiveTab,
  setFilters,
  setScenarioForm,
  showToast,
  toggleFilters,
} from './state';
import type {MaterialWarehouseState, MaterialWarehouseTab} from './types';
import {mockMaterials} from './mocks';
import KpiCard from './components/KpiCard';
import MaterialWarehouseFilters from './components/MaterialWarehouseFilters';
import MaterialDetailDrawer from './components/MaterialDetailDrawer';
import AIAssistantPanel from './components/AIAssistantPanel';
import MaterialOverviewTab from './components/tabs/MaterialOverviewTab';
import ProjectedInventoryTab from './components/tabs/ProjectedInventoryTab';
import MaterialBreakdownTab from './components/tabs/MaterialBreakdownTab';
import FoilBreakdownTab from './components/tabs/FoilBreakdownTab';
import SapMovementsTab from './components/tabs/SapMovementsTab';
import PurchaseExpediteTab from './components/tabs/PurchaseExpediteTab';
import WarehouseReceivingTab from './components/tabs/WarehouseReceivingTab';
import LocationStagingTab from './components/tabs/LocationStagingTab';
import SqaHoldsTab from './components/tabs/SqaHoldsTab';
import SterilizationShippingTab from './components/tabs/SterilizationShippingTab';
import ScenarioSimulationTab from './components/tabs/ScenarioSimulationTab';
import AuditTrailTab from './components/tabs/AuditTrailTab';

interface Props {
  onBack?: () => void;
}

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const TABS: Array<{id: MaterialWarehouseTab; label: string}> = [
  {id: 'material-overview', label: 'Material Overview'},
  {id: 'projected-inventory', label: 'Projected Inventory'},
  {id: 'material-breakdown', label: 'Material Breakdown'},
  {id: 'foil-breakdown', label: 'Foil Breakdown'},
  {id: 'sap-movements', label: 'SAP Movements'},
  {id: 'purchase-expedite', label: 'Purchase & Expedite'},
  {id: 'warehouse-receiving', label: 'Warehouse Receiving'},
  {id: 'location-staging', label: 'Location & Staging'},
  {id: 'quality-sqa-holds', label: 'Quality / SQA Holds'},
  {id: 'sterilization-shipping', label: 'Sterilization & Shipping'},
  {id: 'scenario-simulation', label: 'Scenario Simulation'},
  {id: 'audit-trail', label: 'Audit Trail'},
];

const LAST_REFRESH = '14 May 2026 · 06:15';

export default function MaterialAndWarehousePage({onBack}: Props) {
  const [state, setState] = useState<MaterialWarehouseState>(initialMaterialWarehouseState);

  const toast = useCallback((message: string) => {
    setState((s) => showToast(s, message));
  }, []);

  useEffect(() => {
    if (!state.toastMessage) return;
    const timer = setTimeout(() => setState((s) => dismissToast(s)), 3000);
    return () => clearTimeout(timer);
  }, [state.toastMessage]);

  const selectedMaterial = useMemo(
    () => state.selectedMaterialId ? mockMaterials.find((m) => m.id === state.selectedMaterialId) ?? null : null,
    [state.selectedMaterialId],
  );

  const aiMaterial = useMemo(
    () => state.aiMaterialId ? mockMaterials.find((m) => m.id === state.aiMaterialId) ?? null : null,
    [state.aiMaterialId],
  );

  const activeTabIndex = TABS.findIndex((t) => t.id === state.activeTab);

  function renderTab() {
    switch (state.activeTab) {
      case 'material-overview':
        return (
          <MaterialOverviewTab
            filters={state.filters}
            onViewDetail={(id) => setState((s) => selectMaterial(s, id))}
            onAskAi={(id) => setState((s) => openAiPanel(s, id))}
            onAction={toast}
          />
        );
      case 'projected-inventory':
        return <ProjectedInventoryTab />;
      case 'material-breakdown':
        return <MaterialBreakdownTab onAction={toast} />;
      case 'foil-breakdown':
        return <FoilBreakdownTab onAction={toast} />;
      case 'sap-movements':
        return <SapMovementsTab onAction={toast} />;
      case 'purchase-expedite':
        return (
          <PurchaseExpediteTab
            onAction={toast}
            onAskAi={(id) => setState((s) => openAiPanel(s, id))}
          />
        );
      case 'warehouse-receiving':
        return <WarehouseReceivingTab onAction={toast} />;
      case 'location-staging':
        return <LocationStagingTab onAction={toast} />;
      case 'quality-sqa-holds':
        return <SqaHoldsTab onAction={toast} />;
      case 'sterilization-shipping':
        return (
          <SterilizationShippingTab
            onAction={toast}
            onAskAi={(id) => setState((s) => openAiPanel(s, id))}
          />
        );
      case 'scenario-simulation':
        return (
          <ScenarioSimulationTab
            state={state}
            onSetScenarioForm={(form) => setState((s) => setScenarioForm(s, form))}
            onRunScenario={() => setState((s) => runScenario(s))}
            onClearScenario={() => setState((s) => clearScenario(s))}
            onAction={toast}
          />
        );
      case 'audit-trail':
        return <AuditTrailTab onAction={toast} />;
      default:
        return null;
    }
  }

  return (
    <>
      <Paper elevation={0} sx={{...moduleCardSx, p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
        {/* Header */}
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap'}}>
          {onBack && (
            <IconButton onClick={onBack} size="small" sx={{mt: 0.3}}>
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          <Box sx={{flex: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Inventory2Icon sx={{fontSize: 22, color: '#6B21A8'}} />
              <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)'}}>
                Material & Warehouse
              </Typography>
            </Box>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.3}}>
              Supply availability · Warehouse · SQA · Expedites · Sterilization readiness
            </Typography>
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', mt: 0.3}}>
              Last SAP refresh: {LAST_REFRESH}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{fontSize: 15}} />}
              onClick={() => toast('Mock SAP refresh triggered.')}
              sx={{textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5}}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeIcon sx={{fontSize: 15}} />}
              onClick={() => setState((s) => openAiPanel(s))}
              sx={{textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, bgcolor: '#7C3AED', '&:hover': {bgcolor: '#5B21B6'}}}
            >
              Ask AI
            </Button>
          </Stack>
        </Box>

        {/* Toast */}
        <Collapse in={Boolean(state.toastMessage)}>
          {state.toastMessage && (
            <Alert severity="success" onClose={() => setState((s) => dismissToast(s))} sx={{fontSize: 13, py: 0.5}}>
              {state.toastMessage}
            </Alert>
          )}
        </Collapse>

        {/* Filters */}
        <MaterialWarehouseFilters
          filters={state.filters}
          expanded={state.filtersExpanded}
          onToggle={() => setState((s) => toggleFilters(s))}
          onChange={(f) => setState((s) => setFilters(s, f))}
          onClear={() => setState((s) => clearFilters(s))}
        />

        {/* KPI Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr 1fr', sm: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)'},
            gap: 1.5,
          }}
        >
          <KpiCard label="Below Safety Stock" value="3" tone="warning" trend="up" trendLabel="+1 vs last week" />
          <KpiCard label="Below 50% Safety Stock" value="2" tone="danger" trend="up" trendLabel="Critical" />
          <KpiCard label="Projected Stockouts" value="2" tone="danger" />
          <KpiCard label="Open Material Exceptions" value="7" tone="warning" />
          <KpiCard label="Blocked by SQA" value="2" tone="danger" trend="flat" trendLabel="No change" />
          <KpiCard label="Open Expedite Actions" value="2" tone="warning" trend="down" trendLabel="-1 vs yesterday" />
          <KpiCard label="Warehouse Mismatches" value="1" tone="warning" />
          <KpiCard label="Last SAP Refresh" value={LAST_REFRESH} tone="neutral" />
        </Box>

        {/* Tab bar */}
        <Box sx={{borderBottom: '1px solid #E5E7EB'}}>
          <Tabs
            value={activeTabIndex >= 0 ? activeTabIndex : 0}
            onChange={(_, idx) => setState((s) => setActiveTab(s, TABS[idx].id))}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {fontSize: 12, fontWeight: 800, textTransform: 'none', minHeight: 38, py: 0.8, px: 1.5},
              '& .Mui-selected': {color: '#7C3AED'},
              '& .MuiTabs-indicator': {bgcolor: '#7C3AED'},
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.id} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{pt: 0.5}}>
          {renderTab()}
        </Box>
      </Paper>

      {/* Material Detail Drawer */}
      <MaterialDetailDrawer
        open={state.drawerOpen}
        material={selectedMaterial}
        onClose={() => setState((s) => closeDrawer(s))}
        onAction={toast}
      />

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        open={state.aiPanelOpen}
        material={aiMaterial}
        onClose={() => setState((s) => closeAiPanel(s))}
        onAction={(msg) => {
          setState((s) => closeAiPanel(s));
          toast(msg);
        }}
      />
    </>
  );
}
