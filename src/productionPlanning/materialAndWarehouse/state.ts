import type {
  MaterialWarehouseFilters,
  MaterialWarehouseState,
  MaterialWarehouseTab,
  ScenarioFormState,
  ScenarioResult,
} from './types';

export const defaultFilters: MaterialWarehouseFilters = {
  site: '',
  building: '',
  materialType: '',
  materialNumber: '',
  pcn: '',
  supplier: '',
  productionArea: '',
  dateHorizon: '4 Weeks',
  status: '',
  dataSource: '',
};

export const defaultScenarioForm: ScenarioFormState = {
  scenarioName: '',
  scenarioType: '',
  affectedMaterial: '',
  assumptionChange: '',
  dateImpact: '',
  quantityImpact: '',
  reason: '',
};

export const initialMaterialWarehouseState: MaterialWarehouseState = {
  activeTab: 'material-overview',
  filters: defaultFilters,
  selectedMaterialId: null,
  drawerOpen: false,
  aiPanelOpen: false,
  aiMaterialId: null,
  toastMessage: null,
  filtersExpanded: true,
  scenarioForm: defaultScenarioForm,
  scenarioResult: null,
  scenarioHasRun: false,
};

export function setActiveTab(state: MaterialWarehouseState, activeTab: MaterialWarehouseTab): MaterialWarehouseState {
  return {...state, activeTab};
}

export function setFilters(state: MaterialWarehouseState, filters: Partial<MaterialWarehouseFilters>): MaterialWarehouseState {
  return {...state, filters: {...state.filters, ...filters}};
}

export function clearFilters(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, filters: defaultFilters};
}

export function selectMaterial(state: MaterialWarehouseState, id: string): MaterialWarehouseState {
  return {...state, selectedMaterialId: id, drawerOpen: true};
}

export function closeDrawer(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, drawerOpen: false, selectedMaterialId: null};
}

export function openAiPanel(state: MaterialWarehouseState, materialId?: string): MaterialWarehouseState {
  return {...state, aiPanelOpen: true, aiMaterialId: materialId ?? null};
}

export function closeAiPanel(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, aiPanelOpen: false, aiMaterialId: null};
}

export function showToast(state: MaterialWarehouseState, message: string): MaterialWarehouseState {
  return {...state, toastMessage: message};
}

export function dismissToast(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, toastMessage: null};
}

export function toggleFilters(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, filtersExpanded: !state.filtersExpanded};
}

export function setScenarioForm(state: MaterialWarehouseState, form: Partial<ScenarioFormState>): MaterialWarehouseState {
  return {...state, scenarioForm: {...state.scenarioForm, ...form}};
}

export function runScenario(state: MaterialWarehouseState): MaterialWarehouseState {
  const result: ScenarioResult = {
    firstImpactedPcn: state.scenarioForm.affectedMaterial === '8004430' ? 'NS364314' : 'NS364316',
    firstShortageWeek: 'Wk 31',
    maximumShortage: 47,
    affectedWos: 3,
    recommendedAction: 'Request supplier pull-in of 7 days and review SQA hold release timeline.',
  };
  return {...state, scenarioResult: result, scenarioHasRun: true};
}

export function clearScenario(state: MaterialWarehouseState): MaterialWarehouseState {
  return {...state, scenarioForm: defaultScenarioForm, scenarioResult: null, scenarioHasRun: false};
}
