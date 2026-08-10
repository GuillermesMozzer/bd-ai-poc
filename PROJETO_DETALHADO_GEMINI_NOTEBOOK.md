# BD Smart Factory / BD Atlas AI — Documento Extremamente Detalhado do Projeto

> **Objetivo deste documento:** servir como contexto completo para o Gemini Notebook (NotebookLM / Gemini) ajudar a **pensar, priorizar e desenhar as próximas funcionalidades**.  
> **Repositório:** `https://github.com/GuillermesMozzer/bd-ai-poc`  
> **Data do inventário:** 2026-08-10  
> **Tipo de produto:** POC / protótipo interativo de Smart Factory (BD — Becton Dickinson) com UX AI-first (BLU.AI / BD Atlas AI).  
> **Idioma do código:** TypeScript/React · **Idioma deste doc:** Português (BR)

---

## 0. Como usar este documento no Gemini Notebook

Perguntas úteis para fazer ao Gemini depois de carregar este arquivo:

1. Quais são as **3 próximas features de maior impacto de demo** vs. **maior valor operacional**?
2. Como conectar **Production Planning ↔ Maintenance Planner** sem backend real (ainda em mock)?
3. Quais módulos estão **prontos**, **parciais**, **órfãos** (código existe mas não está no menu) ou **só especificação**?
4. Onde a IA é **mock/regra** e onde faria sentido plugar **Gemini real** primeiro?
5. Quais refactors técnicos desbloqueiam velocidade de feature?
6. Monte um roadmap de 30/60/90 dias por persona (diretor, líder, operador, técnico, planner).

---

## 1. Resumo executivo

O **bd-ai-poc** é uma aplicação web **SPA (Single Page Application)** de fábrica inteligente que demonstra, em um único frontend, um ecossistema operacional conectado:

| Domínio | O que cobre |
|---|---|
| **AI Hub** | Assistente BLU.AI / BD Atlas, Smart Search, copilot contextual |
| **Workstations** | Dashboards configuráveis por persona (operador, líder, manutenção, etc.) |
| **Shopfloor** | CIL/Centerline, changeover, ESO, tasks, OEE, notificações |
| **Shift Management** | Logbook, escala, equipe, organograma, shift entry |
| **Tier Meeting** | Quadro SQDCP Tier 1/2/3 |
| **Action Tracker** | Ações corretivas/preventivas QCDPS |
| **Maintenance** | Follow-up WO, planner AI multi-agente, CBM/PdM, spare parts, ledger, performance |
| **Control Tower** | Visão executiva SQDCP + widget de manutenção AI |
| **Logistics** | Control towers (inbound/WIP/steril/outbound), mobile ops, pallet 3D |
| **Production Planning** | Forecast → Capacity → MPS → MRP → Schedule → WO → Material/Warehouse → Lineage |
| **Document Management** | Inbox, library, workflows, compliance, e-sign, AI hub documental |
| **OTMS / Global View** | Asset explorer / OT wizard + mapa global de sites |

### Verdade crítica do produto (para o Gemini não inventar)

1. **Não há backend de domínio.** Quase tudo é **mock in-browser** (+ `localStorage` para workstations, action tracker, tier, tema, etc.).
2. **Não há router de URL** (`react-router` ausente). Navegação = estado `currentScreen: AppScreen`.
3. **IA chamada “BLU.AI / BD Atlas” é predominantemente mock:**
   - regras / keyword matching (`aiHome`)
   - geradores determinísticos + agents simulados (`Maintenance/ai`)
   - narrativas scriptadas (Action Tracker, Control Tower, Document AI Hub)
4. Existe dependência `@google/genai` e `GEMINI_API_KEY` no `.env.example`, mas **os módulos inventariados não usam LLM real de forma central** — a experiência de demo é mock-first.
5. É um **protótipo de design/UX + narrativa de produto**, não um sistema production-ready.

### Origem

- Import inicial de arquivo Azure DevOps (`Initial import of bd-ai-poc from Azure DevOps archive`).
- Contexto local original (Windows): pasta limpa a partir de `bd-ai-poc.zip`.
- Deploy pensado para **Vercel** (`vercel.json`) e **GitHub Pages** (workflow + `base: /bd-ai-poc/` quando `GITHUB_PAGES=true`).
- Pipelines Azure ainda presentes em `/pipelines`.

---

## 2. Stack técnico

### 2.1 Runtime e build

| Item | Valor |
|---|---|
| Framework UI | React **19** |
| Bundler | Vite **6** |
| Linguagem | TypeScript ~5.8 (`allowJs: true`, **sem `strict`**) |
| UI kit | MUI **7** + Emotion + Icons |
| Charts | Recharts **e** `@mui/x-charts` (inconsistente) |
| CSS | Tailwind **4** via `@tailwindcss/vite` + CSS variables em `src/index.css` |
| Motion | `motion` (Framer Motion successor) |
| 3D | `three` (pallet verification) |
| Grid layout | `react-grid-layout` (workstations) |
| Server local | Express (`local-server.cjs`) para `npm start` |
| Testes | Scripts `tsx` + `assert` (sem Jest/Vitest) |

### 2.2 Scripts npm relevantes

```text
dev / build / preview / start / clean
lint = tsc --noEmit

test:long-term-planning
test:mps-planning
test:scenario-planning          ← módulo órfão no shell
test:daily-production-status-report ← órfão
test:work-orders
test:wo-readiness               ← órfão
test:scheduling-workspace-timeline
test:scheduling-machine-drilldown
test:ai-sequence-simulation
test:ai-forecast-proposal
```

Também existem testes em `src/actionTracker/*.test.ts` **sem** script no `package.json`.

### 2.3 Variáveis de ambiente

```env
GEMINI_API_KEY=...   # pensada para Gemini / AI Studio
APP_URL=...          # URL do applet (Cloud Run / hosting)
```

### 2.4 Estrutura de pastas (tamanho aproximado)

| Pasta | Tamanho | Papel |
|---|---|---|
| `src/PBI/` | ~4.4M | Spec PDF (não é código) |
| `src/productionPlanning/` | ~4.1M | Planejamento de produção |
| `src/workstation/` | ~3.2M | Dashboards configuráveis |
| `src/Maintenance/` | ~2.6M | Manutenção + AI Planner |
| `src/shiftManagement/` | ~1.3M | Turnos / logbook |
| `src/shopfloor/` | ~1.1M | Chão de fábrica |
| `src/aiHome/` | ~1.0M | Assistente + Smart Search |
| `src/documentManagement/` | ~0.9M | Documentos controlados |
| `src/logistics/` | ~0.7M | Logística |
| `src/globalView/` | ~0.6M | Mapa global |
| `src/actionTracker/` | ~0.4M | Action Tracker |
| `src/controlTower/` | ~0.3M | Torre de controle |
| `src/tierMeeting/` | ~0.3M | Tier meetings |
| `src/otms/` | ~0.3M | Asset explorer / OT wizard |
| `src/FilesMD/` | ~0.5M | Docs de plano / auditoria |

**~729 arquivos** `.ts`/`.tsx` sob `src/`.

### 2.5 Arquitetura de shell (mental model)

```text
index.jsx
  → App.tsx (Theme + Auth gate + Providers)
    → LoginScreen (se não autenticado)
    → AppContent.tsx  ← orquestrador gigante (~3.1k linhas)
         → MainLayout (app bar; SideNav oculto)
         → AppRoutes switch(currentScreen) → telas lazy
         → AppLibraryDrawer (navegação principal)
         → AiCopilotDrawer + drawers de domínio
```

**Não há URL router.** Deep-link mínimo via query:
- `?screen=<AppScreen>`
- `?chatbot=1`
- path `/asn-portal` → portal de transferência externa
- localhost `?codexPreview=production_planning` auto-login diretor

---

## 3. Autenticação, personas e temas

### 3.1 Auth (100% mock)

Arquivos: `src/auth/hooks/useAppAuth.ts`, `AuthContext.tsx`, `LoginScreen.tsx`.

- Qualquer email/senha **não vazios** autenticam (delay fake ~750ms).
- Sem tokens, cookies, sessão server-side.
- Logout existe no hook, mas o **Sign Out do menu não está wired**.

### 3.2 Roles (`AppUserRole`)

Definidas em `src/utils/user.ts`:

| Email de login | Role | View mode |
|---|---|---|
| `leader@bd.com` | `leader` | `line` |
| `operator@bd.com` | `operator` | `operator` |
| `technician@bd.com` | `technician` | `line` |
| `planner@bd.com` | `planner` | `line` |
| qualquer outro | `director` | `line` |

**Importante:** não há ACL dura no menu. Todos autenticados podem abrir praticamente qualquer tela. O role muda:

- streams sugeridos ao criar workstation
- copy / quick actions do assistente
- guias especiais (técnico: maintenance request guide; operador: tour)
- abas de notificação “My Team” (leader/director)

### 3.3 Streams de criação de workstation por role

| Role | Streams |
|---|---|
| operator | Shift Logbook, Doc Manager, Action Tracker |
| technician | Maintenance Calendar, Maintenance Analytics, CBM & PdM, Maintenance |
| planner | Demand Forecast, Capacity Planning, MPS, Schedule & Order Planning, Production Lineage |
| default (director/leader) | CIL, Centerline, Equipment Setup Changeover, Manage Activities |

### 3.4 Tema

- `ThemeMode = 'light' | 'dark'`
- Persistência: `localStorage` key `bd-smart-factory-theme-mode`
- MUI theme factory: `src/theme.ts` → `getMuiTheme(mode)`
- CSS vars em `src/index.css` (`:root` e `:root[data-theme="dark"]`)
- Design system tokens também em `design-system/Light.tokens.json` e `Dark.tokens.json`
- Nota: `MyAiAssistantExpandedScreen` ainda recebe `themeMode="light"` hardcoded em rotas — possível inconsistência dark mode

---

## 4. Navegação e inventário de telas

### 4.1 Sistemas de navegação paralelos (dívida)

1. **App Library Drawer** (navegação real principal)
2. **applicationMenuItems** (SideNav — **oculto** no MainLayout)
3. **Atalhos do AI Assistant / Smart Search**
4. **Widgets de workstation** que abrem apps

### 4.2 Chaves de navegação de alto nível (`AppNavigationKey`)

`blu_ai | smart_search | document_manager | notification | global_view | my_workstation | workstations | workstation | shopfloor | maintenance | quality | logistic | production_planning | ehs`

- `quality` está **disabled: true**
- Menu “Production Planning” hoje aponta para `shift_schedule_overview` (não para o shell de PP) — inconsistência importante

### 4.3 Catálogo de telas (`AppScreen`) — por domínio

#### Core / AI / Search / Executivo
| Screen key | Componente |
|---|---|
| `ai_assistant` (default) | `MyAiAssistantExpandedScreen` |
| `ai_home` | `AiHomeScreen` |
| `smart_search` | `SmartSearchScreen` |
| `dashboard` | `DashboardScreen` |
| `notification_dashboard` | `NotificationDashboard` |
| `global_view` | `GlobalViewScreen` |
| `control_tower` | `ControlTowerScreen` |

#### Workstations
| Screen key | Componente |
|---|---|
| `my_workstation` / `workstation` | `WorkstationScreen` |
| `workstations` | `WorkstationsLibraryScreen` |
| `all_workstations` | `AllWorkstationsPage` |

#### Shopfloor / Actions / Tier
| Screen key | Componente |
|---|---|
| `shift_logbook` | `ShiftLogbookScreen` |
| `tier_meeting` | `TierMeetingBoard` |
| `tier_overview` | `TierOverviewScreen` |
| `action_tracker` | `ActionTrackerScreen` |
| `work_order_hub` | `WorkOrderHubScreen` |
| `eso_hub` | `EsoHubScreen` |
| `line_performance` | `LinePerformanceScreen` |
| `cilt_kpis` / `cil_kpis` / `centerline_kpis` | `CiltKpisScreen` |
| `equipment_changeover` | `EquipmentChangeoverScreen` |
| `manage_tasks` | `ManageTasksScreen` |
| `shift_schedule_operator` | `ShiftScheduleOperatorPage` |
| `equipment_changeover_operator` | `EquipmentChangeoverOperatorPage` |
| `cil_operator` / `centerline_operator` / `cil_centerline_operator` | `CilCenterLineOperatorPage` |

#### Shift Management
| Screen key | Componente |
|---|---|
| `shift_schedule_overview` / `shift_schedule` | `ShiftScheduleScreen` (crew pattern) |
| `shift_schedule_summary` | `ShiftScheduleScreen` |
| `shift_schedule_settings` | `ShiftPlannerScreen` |
| `team_management` | `ShiftTeamManagementScreen` |
| `site_organogram` | `ShiftSiteOrganogramScreen` |

#### Maintenance
| Screen key | Componente |
|---|---|
| `maintenance_hub` / `maintenance_planner` | `MaintenancePlannerPage` |
| `maintenance_plan` | `MaintenancePlan` |
| `maintenance_my_team` | `MaintenanceMyTeamPage` |
| `maintenance_calendar` | `MaintenancePlannerPage` (calendar-only) |
| `maintenance_followup` | `MaintenanceFollowUpBoardPage` |
| `tool_crib` | **`SparePartsManagementPage`** (não o stub ToolCrib) |
| `equipment_ledger` | `EquipmentLedgerPage` |
| `maintenance_request_log` | `MaintenanceRequestLogPage` (**stub Under Development**) |
| `maintenance_cbm_pdm` | `MaintenanceCbmPdmPage` |
| `maintenance_performance` | `MaintenancePerformancePage` |
| `asset_explorer` | `AssetExplorer` (OTMS) |
| `ot_asset_type_wizard` | `OtAssetTypeWizardScreen` |

#### Logistics
| Screen key | Componente |
|---|---|
| `logistics_mobile_ops` | `LogisticsMobileOpsPage` |
| `logistics_control_tower` / `receiving_control_tower` | `LogisticsControlTowerPage` (+ receiving) |
| `quality_release` | `QualityReleasePage` |
| `shipment_readiness` | `ShipmentReadinessPage` |
| `sterilization_tracker` | `SterilizationTrackerPage` |
| `external_transfer_portal` | `ExternalTransferPortalPage` |
| `guided_tasks` | `GuidedTasksPage` |
| `job_readiness` | `JobReadinessPage` |
| `production_alerts` | `ProductionAlertsPage` |
| `machine_status` | `MachineStatusPage` |
| `wip_control_tower` | `WipControlTowerPage` |
| `sterilization_outbound_control_tower` | `SterilizationOutboundControlTowerPage` |
| `pallet_verification` | `PalletVerificationPage` |

#### Document Management
| Screen key | Componente |
|---|---|
| `document_management` | `DocumentManagementScreen` |
| `artifact_detail` | `DocumentArtifactDetailScreen` |
| `document_search_hierarchy` | `DocumentSearchExplorerScreen` |
| `approval_dashboard` | `DocumentRevisionApprovalScreen` |
| `review_flow` | `DocumentReviewFlowScreen` |
| `version_history` | `DocumentVersionHistoryScreen` |
| `audit_trail` | `DocumentAuditTrailScreen` |
| `compliance` | `DocumentComplianceDashboard` |
| `advanced_search` | `DocumentAdvancedSearchScreen` |
| `workflow_engine` | WorkflowPlanner / engine screens |
| `document_operations` | `DocumentOperationsDashboard` |
| `ai_hub` | `DocumentAIHubScreen` |
| `esignature` | `DocumentESignatureScreen` |
| `template_selection` | `DocumentTemplateSelectionScreen` |

#### Especial / dívida de tipo
| Key | Status |
|---|---|
| `production_planning` | Renderiza `ProductionPlanningScreen`, mas **não está** consistentemente no union `AppScreen` |
| default | `UnderConstructionScreen` |

---

## 5. Módulo por módulo (estado, features, AI, gaps)

Legenda de maturidade:

- **Complete (mock):** UI rica + dados mock + fluxos interativos
- **Partial:** núcleo funciona; áreas placeholder
- **Built, not wired:** código/testes existem, mas não entram no shell/menu
- **Placeholder/Stub:** “Under Development”
- **Spec only:** PDF/docs

---

### 5.1 AI Home / BLU.AI (`src/aiHome/`)

**Propósito:** porta de entrada plant-wide para chat, busca inteligente e deep-links para módulos.

**Telas principais**
- `AiHomeScreen` — greeting + chat entry + urgent tasks
- `MyAiAssistantExpandedScreen` — workspace de chat expandido (~3.2k LOC); pode abrir drawers de WO
- `AiCopilotDrawer` — drawer lateral
- `SmartSearchScreen` (~8.4k LOC) + `SmartSearchEntityGraph`
- `LiveContextRail`, `EquipmentContextDrawer`, `AiAssistantComposer`

**Dados / tipos**
- `AiMessage` (variantes ricas: priority cards, progress, quick actions)
- `UrgentAiTask`, `HomeSiteScope`, `SmartSearchCategory`
- Catalog: `smartSearch/globalCatalog.ts` + engine `smartSearchEngine.ts`
- Conteúdos guiados: `technicianAssistantIntro.ts`, `technicianMaintenanceRequestGuide.ts`, `myAiAssistantContent.ts`

**Como a “IA” funciona hoje**
- `useAiChat`: normaliza texto → intents por keyword → respostas canned + CTAs de navegação
- Guia do técnico: fluxo passo-a-passo para Maintenance Request (não LLM)
- Smart Search: scoring local + intent detection + grafo de entidades

**Jornadas**
1. Perguntar no home → navegar para Shift / Maintenance / Action Tracker / Notifications
2. Técnico: guia MR → pré-preenche Shift Entry maintenance
3. Smart Search → abrir docs/assets/actions/ESO/shift notes / spare parts
4. Equipment context a partir de workstation
5. Flag `sessionStorage` para abrir priorização AI no Action Tracker

**Gaps**
- Cards “Coming Soon” ainda navegáveis
- Chat não generativo
- Arquivos monolíticos (Smart Search / Expanded Assistant)
- Não há orquestração LLM real

**Ideias de próximas features (produto)**
- Plugar Gemini só no composer (com grounding nos mocks + citações)
- Intent router híbrido: regras rápidas + LLM para fallback
- Memory de contexto por role/site/line
- “Execute action” com human-in-the-loop (criar WO / Action / documento) com preview

---

### 5.2 Workstations (`src/workstation/`)

**Propósito:** dashboards configuráveis por persona; biblioteca de workstations publicadas; admin hierarchy.

**Maturidade:** Complete (mock) — uma das maiores superfícies do app.

**Peças-chave**
- `WorkstationScreen`, `WorkstationDashboard`, `PersonalWorkstationDashboard`, `StandardWorkstationDashboard`
- `WorkstationsLibraryScreen`, `AppLibraryDrawer`
- `allworkstation/AllWorkstationsPage` — admin hierarchy/users/paths
- `widgetRegistry.ts` — **40+ widgets** (CIL, Centerline, OEE, SQDCP, maintenance hubs, production planning, etc.)
- `publishedWorkstations.ts` — presets em `localStorage` versionado
- Onboarding: `OperatorWorkstationTour`

**Published workstations seed**
| id | título | tipo |
|---|---|---|
| `operator-view-cristian` | Operator View - Cristian | Production |
| `sample-oee` | OEE | Production |
| `sample-operator-view` | Operator View | Maintenance |
| `sample-leader-view` | Leader View | Leadership |
| `sample-tier-1/2/3` | Tier 1/2/3 | Tier Management |
| `sample-maintenance-leader` | Maintenance Leader | Maintenance |
| `sample-maintenance-planner` | Maintenance Planner | Maintenance |
| `sample-spare-parts` | Spare Parts | Maintenance |
| `sample-maintenance-technician` | Maintenance Technician | Maintenance |

`WorkstationType`: `'Tier Management' | 'Quality' | 'Leadership' | 'Maintenance' | 'Production' | 'Engineering' | 'Safety'`

**AI**
- Insights de operador/técnico em componentes dedicados
- Orquestração contextual pesada em `AppContent.tsx` (tour, execução CIL/Centerline/Changeover)

**Gaps / próximas features**
- Publicação multi-usuário real (hoje localStorage)
- Templates BA-editáveis (JSON) em vez de snapshots TSX
- Widget marketplace + permissões por role
- Sync de layout entre plantas
- Reduzir acoplamento com `AppContent`

---

### 5.3 Control Tower (`src/controlTower/`)

**Propósito:** dashboard executivo SQDCP (Safety, Quality, Delivery, Cost, People, Sustainability) + Plant Overview + Blu.AI cards.

**Arquivos**
- `ControlTowerScreen.tsx` (~5.8k LOC) — monolítico; charts muitas vezes SVG/HTML manuais
- `ControlTowerMaintenancePlannerWidget.tsx` — métricas BLU.AI de manutenção + narrativa

**AI**
- Botão abre assistente
- Insights estáticos
- Widget chama `buildControlTowerPlannerWidgetSnapshot()` (mock adapters)

**Gaps / próximas**
- Sincronizar widget com sessão live do Planner (não só adapters default)
- Comparação cross-site (Phase 8 §19.10)
- Migrar charts para wrappers Recharts comuns
- Narrative diária gerada (mesmo que mock→LLM)

---

### 5.4 Action Tracker (`src/actionTracker/`)

**Propósito:** ciclo de ações QCDPS (Quality, Cost, Delivery, People, Safety) com table/kanban, KPIs, create/reassign/extend due.

**Fontes de ação:** ESO, Maintenance, Tier, Shift Logbook, BLU.AI, etc.

**Tipos-chave** (`types.ts`)
- Status, priority, category, type, source
- `ActionTrackerRow`, drafts, histórico de reassignment / due-date extension
- Flag `aiAssisted`

**AI**
- Priorização BLU.AI scriptada (chat + reorder)
- Pode criar ação demo `source: 'BLU.AI'`
- Auto-open via `action-tracker-open-ai-prioritization`

**Testes:** zone hierarchy, create title flow, enhancements, KPI sections

**Gaps / próximas**
- Ranking real (risco × aging × impacto SQDCP)
- Auto-criar a partir do Maintenance Planner apply (Phase 8 §19.8)
- Escalação automática para Tier Meeting
- Persistência multi-user

---

### 5.5 Maintenance (`src/Maintenance/`) — núcleo AI mais profundo

**Propósito:** CMMS-like: requests → planning → scheduling → execution → review; PM plans; CBM/PdM; spare parts; ledger; team; performance; **AI-centric planner**.

#### Telas

| Área | Arquivo | Notas |
|---|---|---|
| Follow-Up Board | `MaintenanceFollowUpBoardPage.tsx` | ~9.9k LOC; Kanban lifecycle; `CreateWorkOrderDrawer` |
| Planner | `MaintenancePlannerPage.tsx` | ~7.7k LOC; weekly/monthly/quarterly/annual + AI |
| PM Plans | `MaintenancePlan.tsx` | ~6.8k LOC |
| Spare Parts | `SparePartsManagementPage.tsx` | ~7.1k LOC; rota `tool_crib` |
| Equipment Ledger | `EquipmentLedgerPage.tsx` | ~4.7k LOC |
| CBM/PdM | `MaintenanceCbmPdmPage.tsx` | ~2.4k LOC |
| Performance | `MaintenancePerformancePage.tsx` | ~1.9k LOC |
| My Team | `MaintenanceMyTeamPage.tsx` | ~0.6k LOC |
| Tool Crib stub | `ToolCribPage.tsx` | Under Development (não wired) |
| Request Log stub | `MaintenanceRequestLogPage.tsx` | Under Development |

#### AI Planner — o que já existe (Phases 1–7 mock)

Contratos em `Maintenance/ai/types.ts` e UI em `Maintenance/components/ai/`.

Capacidades implementadas (mock):
1. **Geração de planos** (`generatePlannerAiPlan.ts`) com estratégias:
   - `recommended` | `min-downtime` | `max-reliability` | `production-sync`
2. **Multi-agent orchestrator** (`plannerAiOrchestrator.ts`):
   - Safety, Reliability, Spare Parts, Labor, Production agents
3. **Compare plans / trade-off matrix**
4. **Copilot** contextual por horizonte
5. **Cascade preview** entre weekly/monthly/quarterly/annual + approvals + undo
6. **Coverage heatmap / gap analysis / bundles**
7. **Planning Agent chat** conversacional a partir de Follow-Up request
8. **Bulk analysis**
9. **Control Tower snapshot builder**

Label explícito na UX: **“BLU.AI Mock Orchestrator”** / “All data is mocked… no live systems”.

#### Workflows
1. Follow-Up lanes: Request → Autonomous → Planning → Scheduled → In Progress → Review → Closed
2. Planning Agent: analisar request → create/combine → parts/safety/quality/schedule → commit
3. AI Planner: Analyze → Review → Apply (com cascade)
4. Copilot what-if + drag suggestion
5. Spare parts kit stages: Upcoming → Reserved → Ready → Partial → Completed
6. CBM signals → adapters → chips de risco no planner

#### Phase 8+ — integrações cross-module (ainda futuras)

Estas são as **melhores sementes de roadmap** (do doc oficial `AI_CENTRIC_MAINTENANCE_PLANNER_PLAN.md` §19):

| # | Feature | Módulos | Wow | Esforço |
|---|---|---|---|---|
| 19.1 | Production Planning ↔ Maintenance bi-directional sync | PP + Planner | ★★★★★ | High |
| 19.2 | Live CBM/PdM sensor feed | CBM + Planner | ★★★★★ | Medium |
| 19.3 | Spare Parts AI / procurement suggestions | Spare Parts + Planner | ★★★★ | Medium |
| 19.4 | Equipment Ledger intelligence feed | Ledger + Planner | ★★★★ | Medium |
| 19.5 | Follow-Up lifecycle sync + auto-draft on AI apply | Follow-Up + Planner | ★★★ | Medium |
| 19.6 | Shift & team / PTO / certification-aware scheduling | Shift + My Team + Planner | ★★★★ | Medium |
| 19.7 | WO readiness scoring bridge | `woReadiness` + Planner | ★★★★ | Medium |
| 19.8 | Auto-generated Action Tracker items | Action Tracker + Planner | ★★★ | Low–Med |
| 19.9 | Scenario Planning bridge | Scenario PP + Planner | ★★★★★ | High |
| 19.10 | Control Tower executive AI richer | CT + Planner | ★★★★ | Low–Med |
| 19.11 | Maintenance cost intelligence | Performance/Ledger + Planner | ★★★★ | Medium |
| 19.12 | Digital shift handover intelligence | Shift Logbook + Planner | ★★★★ | Medium |

**Recomendação do próprio plano:** começar por **production-window feed** + **equipment ledger context** após polish de layout.

---

### 5.6 Production Planning (`src/productionPlanning/`)

**Propósito:** command center de planejamento: demanda/forecast → capacity → MPS → MRP → schedule/orders → WO → material/warehouse → lineage; + scheduling workspace short-term.

**Entry:** screen `production_planning` → `ProductionPlanningScreen.tsx`  
**Atenção:** item de menu top-level “Production Planning” **não** abre este shell (abre shift schedule overview). App Library / AI / preview links abrem o shell certo.

#### Shell menu wired
1. Forecasting → Demand Forecast, Capacity Planning  
2. Production Planning → MPS, MRP  
3. Order Management → Schedule & Order Planning, Orders Management  
4. Quick Actions → Command Center, Production Lineage  
(+ Scheduling Workspace, Material & Warehouse, Create Orders)

#### Submódulos wired (Complete mock)
| Submódulo | Destaques |
|---|---|
| `PlanningOverviewV2` | AI briefing, KPIs, accept/reject recommendations |
| `demandForecast` + `longTermPlanning` | 12-month feasibility, scenarios, AI forecast proposal, demand matrix, resource distribution |
| `capacityPlanning` | utilization, hierarchy, bulk adjust, AiCapacityAnalysisPanel |
| `monthlyMps` | frozen horizon, buckets, assistant |
| `mrp` + `mrpExplorer` | versions, AI search parser |
| `scheduleVersions` + `ordersPlanningV2` | lifecycle Draft/Published/Frozen/Simulation; timeline; conflicts |
| `schedulingWorkspace` + `schedulingWorkspaceTimeline` | AI vs approved sequence, machine drilldown |
| `workOrders` | lifecycle/readiness/exceptions, AICopilotPanel |
| `createOrders` | AI-assisted / planned / manual |
| `materialAndWarehouse` | muitas tabs (inventory, SAP, expedite, SQA, steril, scenario, audit) + AIAssistantPanel |
| `planningLineage` | chain Demand→…→DHR + AgenticView |

#### Built but **not wired** (órfãos importantes)
| Módulo | Testes? | Nota |
|---|---|---|
| `scenarioPlanning/` | Sim (18 cases) | page id existe; cai em placeholder |
| `priorityQueue/` | Sem script | órfão |
| `woReadiness/` | Sim | UI completa órfã — ótimo para Phase 8.7 |
| `dailyProductionStatusReport/` | Sim | órfão |
| ids `execution-feedback`, `batch-release` | — | placeholder |

**AI:** quase toda scriptada/mock (forecast proposal, capacity analysis, sequence simulation, MPS assistant, lineage agentic view).

**Próximas features naturais**
1. **Wire órfãos** no shell (especialmente Scenario Planning + WO Readiness) — alto ROI / baixo risco de produto
2. Sync janelas de produção → Maintenance Planner (19.1)
3. Unificar “AI panels” com um contrato compartilhado de insights
4. Corrigir navegação top-menu → `production_planning`

---

### 5.7 Logistics (`src/logistics/`)

**Propósito:** torre de controle logística + mobile ops para manufatura medical (contexto El Paso), fluxo ST01–ST108.

**Maturidade:** Control towers Complete (mock); Mobile Ops **Partial** (inbound deep; outras áreas placeholder).

**Domínios mock**
- `logisticsMockData.ts`: materials, customers, carriers, WIP lanes, KPIs, QA, quarantine, sterilization, shipping, backorders, guided tasks, exceptions, genealogy
- `receivingMockData.ts`, `wipMockData.ts` (El Paso/Sandy/Curitiba), `palletVerificationMockData.ts`, `workshopDay2Data.ts`

**Cockpit**
- Macroflows IN01/IN02/WIP/OB*
- `aiSiteSummary` estático
- KPI drilldowns

**Mobile Ops**
- Implementado: area selection → inbound receiving → unload → pallet LP → delivery checklist
- Placeholders: Material Replenishment, WIP Movement, Finished Goods

**Destaque visual:** `pallet_verification` com viewer Three.js

**Próximas features**
- Completar mobile ops (replenishment / WIP / FG)
- Exceções → Action Tracker / Tier automaticamente
- Genealogia ↔ Production Lineage
- LLM para narrativa do cockpit a partir dos KPIs mock
- Integração ASN portal ↔ partner UX real

---

### 5.8 Document Management (`src/documentManagement/`)

**Propósito:** ciclo de vida de documentos controlados (inbox, library, workflow, search, compliance, e-sign, AI hub).

**Maturidade:** Complete (mock) nas telas existentes; **gaps grandes** nos fluxos AI de criação (doc `missing_document_features.md`).

**Hierarquia:** BD Global → region → plant → area/unit/line/zone (`documentHierarchy.ts`, reusa árvore de workstation).

**AI Hub documental:** Q&A, classification stages, IDP extraction, summarize/compare/tag/workflow suggestions — **canned**.

**Gaps documentados (ainda relevantes para roadmap)**
1. **Template-centric create/select** com smart search + favoritos/recentes + SQDCP folders — missing
2. **AI-guided new document setup/editor** (tipo, template, approval flow, permissions, editor live) — missing
3. **Upload + AI classification / similarity** (“create new version vs new doc”) — missing

Há PDF de feature em `src/PBI/` sobre hierarchical folder navigation.

**Próximas features**
- Implementar os 3 fluxos acima (maior gap de user stories)
- Conectar templates a Tier/Action Tracker evidence packs
- Gemini para classificação + similaridade (ótimo caso real de LLM)
- Diff de versões com highlight de mudanças críticas (QA/regulatory)

---

### 5.9 Shopfloor (`src/shopfloor/`)

**Propósito:** hubs de execução (dashboard, ESO, CIL/Centerline KPIs, changeover, tasks, notifications, WO hub) + seeds de shift config.

**Maturidade:** Complete (mock); operator construction pages são wrappers finos.

**Conexões:** alimenta settings iniciais de shift; widgets de workstation; nested sob Shopfloor/Workstation nav.

**Próximas:** fechar loop CIL/Centerline completion → Action Tracker / Maintenance request; OEE real-time story; role-gated operator mode.

---

### 5.10 Shift Management + Shift Entry

**Shift Management (`src/shiftManagement/`)**
- Logbook, schedule/crew patterns, planner settings, team management, organogram
- Context composto por vários hooks
- Tickets podem ter `reporterType: 'BLU.AI'`

**Shift Entry (`src/shiftEntry/`)**
Modos wired: ESO, General Notes, Maintenance, Production Output, Mold Log  
**Órfãos presentes:** Scrap, NonConformance, Incident (arquivos existem, shell não importa)

**Próximas (alinham com 19.6 e 19.12)**
- Handover inteligente turno-a-turno
- Certificações/PTO no planner
- Wire Scrap/NCR/Incident
- Auto-criar Action Tracker a partir de tickets críticos do logbook

---

### 5.11 Tier Meeting (`src/tierMeeting/`)

**Propósito:** board Tier 1 SQDCP com lanes, KPIs, AI insights, import/export, integração Action Tracker.

**Maturidade:** Complete (mock).

**Próximas**
- Escalação automática Maintenance/Logistics → Tier
- AI minutes / action extraction pós-meeting (LLM)
- Cross-tier rollup (1→2→3) mais rico

---

### 5.12 OTMS (`src/otms/`)

- `AssetExplorer.tsx` — hierarchy, timeline, performance, reliability, spare parts, filtros PM/PdM/CIL, create WO
- `OtAssetTypeWizardScreen.tsx` — wizard 3 steps (strategy → fields → review) com templates PLC/HMI/Inverter

**Próximas:** digital twin lite; feed ledger → planner (19.4); OT asset types como master data compartilhada.

---

### 5.13 Global View (`src/globalView/`)

Mapa enterprise de sites BD com overlays KPI SQDCP, heatmaps, rotas, drill-down (ex.: Columbus), AI tour insights estáticos.

**Próximas:** drill site → Control Tower contextual; ranking de risco multi-site; AI narrative por região.

---

## 6. Modelo de dados e persistência (como é hoje)

### 6.1 Fontes de verdade (protótipo)

| Tipo | Onde |
|---|---|
| Mocks embutidos em TS | `src/data/mockData.ts` (~1320 linhas), `*/mock*.ts`, arrays dentro de páginas |
| localStorage | workstations publicadas, layouts, theme, hierarchy selection/favorites, action tracker, tier meeting, notifications (disperso) |
| sessionStorage | flags de UX (ex.: abrir AI prioritization) |
| Sem API | não há REST/GraphQL de domínio |

### 6.2 Hierarquia operacional compartilhada (conceito)

Global → Region → Plant → Area → Unit → Line → Zone → System → Asset  
Usada em header picker, documents, action tracker, OTMS, workstations.

Storage keys exemplo:
- `bd-header-hierarchy-selection-v1`
- `bd-header-hierarchy-favorites-v1`

### 6.3 Implicação para próximas features

Qualquer feature “enterprise” deveria introduzir uma **`storageGateway`** (já recomendada no roadmap de arquitetura) antes de espalhar mais `localStorage` keys.

---

## 7. Mapa de conexões entre módulos

```text
AI Home / Smart Search
  ├─→ Maintenance (Follow-Up drawers, spare parts search)
  ├─→ Action Tracker (priorização)
  ├─→ Shift Entry / Logbook
  ├─→ Documents
  └─→ Production Planning (deep-link page id)

Maintenance AI Planner
  ├─← adapters: Follow-Up, CBM, Spare Parts
  ├─→ Control Tower widget snapshot
  ├─→ (futuro) Production windows, Action Tracker, Shift, Scenario, Cost
  └─→ Equipment Ledger / My Team (dados existem; feed AI incompleto)

Workstation widgets
  └─→ quase todos os domínios (hub UX)

Tier Meeting ↔ Action Tracker ↔ Documents
Logistics ↔ (futuro) Action Tracker / Lineage / Mobile completion
OTMS ↔ Maintenance Create WO
Shift Logbook ↔ Maintenance Request ↔ AI guides
```

---

## 8. Dívida técnica que bloqueia velocidade de feature

Do `ARCHITECTURE_DIAGNOSTIC_AND_REFACTORING_ROADMAP.md` + inventário atual:

### Crítico
1. **Dois `WorkstationProvider` aninhados** (auth vs app) — estados podem divergir
2. **Roteamento por switch + prop bag** em `AppRoutes`/`AppContent` — adicionar tela exige editar vários arquivos
3. **Arquivos monolíticos** (GlobalView, WorkstationDashboard, DocumentManagement, Follow-Up, Planner, Smart Search, AppContent ~3k+)
4. **Charts inconsistentes** (Recharts vs MUI X Charts vs SVG manual)
5. **Tokens de estilo fragmentados** (`theme.ts`, workstation theme, hex hardcoded, Tailwind + MUI)
6. **TS frouxo** (`allowJs`, sem strict, muitos `any`)
7. **Persistência espalhada** em localStorage
8. **Quality gates frágeis** (`lint`=tsc; testes só em fatias de PP)

### Importante
- SideNav morto vs App Library vivo
- Menu Production Planning aponta para tela errada
- Sign Out não wired
- AuthContext usa setters dummy de AI
- Módulos órfãos com testes (scenario, wo-readiness, daily report)
- `esbuild: false` no Vite (incomum)

### Direção recomendada de refactor (habilitador)
1. `screenRegistry` único (key, label, loader, nav, providers)
2. `AppProviders` single-instance
3. `storageGateway`
4. `common/charts` Recharts wrappers
5. Quebrar top 10 mega-files
6. Strictness incremental por domínio

---

## 9. O que a IA é / não é (para decisões de produto)

| Área | Tipo de IA hoje | Candidato a Gemini real? |
|---|---|---|
| AI Home chat | Keyword/rules | **Sim — primeiro candidado** |
| Smart Search | Local scoring | Híbrido (embeddings depois) |
| Maintenance Planner agents | Deterministic generators | Sim, para explainability / NL; manter engine de constraints mock |
| Planning Agent chat | Scripted phases | Sim |
| Action Tracker prioritization | Scripted story | Sim ranking + rationale |
| Control Tower narrative | Static copy | Sim (daily brief) |
| Document AI Hub | Canned IDP/Q&A | **Sim — classificação/similaridade** |
| Logistics cockpit summary | Static | Sim |
| Production Planning AI panels | Mock utils | Sim para NL filters / briefings |

**Princípio sugerido:** manter **constraint engines determinísticos** (capacidade, parts ETA, readiness, cascade) e usar LLM para **linguagem, classificação, sumarização, intenção e explicação**.

---

## 10. Personas e jobs-to-be-done

| Persona | Login demo | Jobs principais no app |
|---|---|---|
| Director | qualquer email | Control Tower, Global View, Action Tracker overview, AI brief |
| Leader | `leader@bd.com` | Tier, team notifications, workstation leader, shift overview |
| Operator | `operator@bd.com` | Workstation operator, CIL/Centerline/Changeover, logbook, docs |
| Technician | `technician@bd.com` | Maintenance calendar/CBM, follow-up, spare parts, AI MR guide |
| Planner | `planner@bd.com` | Demand/Capacity/MPS/Schedule/Lineage, maintenance planner AI |

---

## 11. Backlog sugerido de próximas funcionalidades (priorizado para pensar)

### Faixa A — alto impacto de demo, encaixa no que já existe
1. **Wire Scenario Planning + WO Readiness no shell de Production Planning**
2. **Corrigir nav “Production Planning” → shell real**
3. **Production windows → Maintenance Planner** (19.1 mínimo viável mock)
4. **Auto-draft Follow-Up WO quando AI Plan é aplicado** (19.5)
5. **Action Tracker auto-create a partir de riscos do Planner** (19.8)
6. **Control Tower daily narrative dinâmica** a partir do snapshot (19.10)
7. **Document upload + similaridade + create version/new** (gap DMS #3)
8. **Completar Logistics Mobile Ops placeholders**

### Faixa B — valor operacional / storytelling AI-first
9. CBM pull-forward alerts no calendário (19.2)
10. Spare parts ETA + procurement suggestions (19.3)
11. Equipment ledger pattern recognition no planner (19.4)
12. Shift/PTO/certificação constraints (19.6)
13. Shift handover panel no planner (19.12)
14. Cost projection por plano (19.11)
15. Gemini no AI Home composer com grounding e citations
16. Template-centric document creation (gap DMS #1–2)

### Faixa C — fundações técnicas (desbloqueiam velocidade)
17. screenRegistry + limpar AppContent
18. storageGateway
19. Unificar charts
20. Quebrar Follow-Up / Planner / Smart Search / Control Tower
21. Strict TS por domínio Maintenance + Action Tracker
22. CI: typecheck + selected tests verdes

### Faixa D — expansões de produto maiores
23. Quality module (hoje disabled)
24. Multi-site plan comparison
25. Backend adapter layer (mesmo que fake API)
26. RBAC real por tela/widget
27. Collaboration (comments, assignments live)
28. Offline mobile ops

---

## 12. Critérios sugeridos para escolher a próxima feature

Ao pedir recomendação ao Gemini, use estes pesos:

| Critério | Peso sugerido |
|---|---|
| Reaproveita dados/UI já existentes | 25% |
| Visibilidade em demo para executivo/cliente | 20% |
| Fecha um loop cross-module (não feature isolada) | 20% |
| Esforço relativo (evitar mega-rewrite) | 15% |
| Clareza de human-in-the-loop (AI sugere, humano aprova) | 10% |
| Abre caminho para LLM real sem quebrar mocks | 10% |

**Anti-padrões a evitar**
- Nova tela isolada sem deep-link do AI Home / Workstation / Control Tower
- “AI” que só adiciona texto estático sem mudar estado do board
- Expandir mega-files sem extrair componentes
- Novo `localStorage` key ad-hoc

---

## 13. Inventário de documentação interna já existente

| Doc | Conteúdo |
|---|---|
| `src/FilesMD/AI_CENTRIC_MAINTENANCE_PLANNER_PLAN.md` | Visão completa do AI Planner + Phase 8 §19 |
| `..._PHASE_4/5/7_PLAN.md` | Planos por fase |
| `ARCHITECTURE_DIAGNOSTIC_AND_REFACTORING_ROADMAP.md` | Dívida e alvo MUI/Recharts |
| `missing_document_features.md` | Gaps DMS AI create/upload |
| `NAVIGATION_AUDIT_REPORT.md` / `STYLE_AUDIT_REPORT.md` | Auditorias |
| `MODALS_AND_DRAWERS_INVENTORY.md` | Inventário de overlays |
| `DEPLOY_STATIC_WEB_APP.md` / `AZURE_DEVOPS_SETUP.md` | Deploy |
| `design-system/smart-factory/MASTER.md` | Tokens/visual (dark analytics) |
| `implementation_plan.md` | **vazio** |
| `src/PBI/*.pdf` | Spec hierarchical folders DMS |

---

## 14. Como rodar localmente

```bash
npm install
# criar .env.local com GEMINI_API_KEY (opcional para demos mock)
npm run dev          # Vite em :3000
npm run build
npm start            # serve dist via local-server.cjs
```

Scripts PowerShell auxiliares: `run-dev.ps1`, `run-build.ps1`, `bootstrap.ps1`.

Logins demo: ver §3.2.

---

## 15. Glossário rápido

| Termo | Significado |
|---|---|
| BLU.AI / BD Atlas AI | Marca do assistente no produto |
| SQDCP | Safety, Quality, Delivery, Cost, People |
| QCDPS | Categorias do Action Tracker (Q/C/D/P/S) |
| CIL / Centerline | Disciplinas de padronização operacional |
| ESO | Event / Shopfloor operational hub |
| CBM / PdM | Condition-Based / Predictive Maintenance |
| WO | Work Order |
| MPS / MRP | Master Production Schedule / Material Requirements Planning |
| Tier Meeting | Reunião em cascata operacional |
| Workstation | Dashboard configurável por persona |
| Control Tower | Visão executiva agregada |
| Follow-Up Board | Kanban de ciclo de vida de manutenção |
| Cascade | Propagação de mudanças entre horizontes de planejamento |
| ASN | Advanced Shipping Notice (portal externo) |

---

## 16. Snapshot de commits recentes (contexto repo)

```text
4068a40 Add Vercel config for static SPA hosting.
70bbeb9 Add GitHub Pages deployment workflow.
5b9b80e Initial import of bd-ai-poc from Azure DevOps archive.
```

Branch principal: `main`.

---

## 17. Prompt inicial sugerido para o Gemini Notebook

Cole algo assim após carregar este documento:

> Você é um product strategist e solutions architect para um POC de Smart Factory AI-first (BD).  
> Use APENAS o documento carregado como fonte de verdade.  
> Tarefa: propor as próximas 8 funcionalidades, em ordem, com: (1) persona beneficiada, (2) módulos tocados, (3) o que já existe para reaproveitar, (4) esforço relativo (S/M/L), (5) valor de demo vs valor operacional, (6) se precisa LLM real ou mock basta, (7) critérios de aceite de UX human-in-the-loop, (8) riscos técnicos por causa de AppContent/mega-files/localStorage.  
> Priorize features que fechem loops cross-module (Maintenance ↔ Production Planning ↔ Action Tracker ↔ Control Tower ↔ Documents).  
> Não proponha backend completo ainda; assuma mock-first com contratos limpos.

---

## 18. Apêndice — checklist mental “o que está de verdade pronto”

### Pronto para demo rica
- AI Assistant shell + Smart Search
- Workstations publicadas + App Library
- Maintenance Follow-Up + AI Planner (mock multi-agent)
- Spare Parts, CBM, Ledger, Performance
- Control Tower + Global View
- Action Tracker + Tier Meeting
- Shift Logbook / Schedule / Team
- Logistics Control Towers + Pallet Verification
- Production Planning shell (forecast→lineage) + scheduling workspace
- Document Management suite (telas principais)

### Parcial / incompleto
- Logistics Mobile Ops (fora inbound)
- Horizontes não-weekly do planner (overlays > mutação total)
- Dark mode em algumas telas AI
- Quality nav disabled
- Sign out / SideNav

### Código órfão (existe, falta ligar)
- Scenario Planning, WO Readiness, Daily Production Status Report, Priority Queue
- ShiftEntry Scrap / NCR / Incident
- ToolCribPage / MaintenanceRequestLogPage stubs

### Spec sem implementação plena
- DMS AI template/create/upload flows
- PBI hierarchical folders PDF

---

*Fim do documento. Gerado para uso em Gemini Notebook / NotebookLM como base de brainstorming de roadmap.*
