# SUPER PROMPT DE SISTEMA DEFINITIVO (V7): WIDGETS & MODULES EXPANSION (BD SMART FACTORY)

Este documento funciona como um **Super Prompt de Sistema mestre de nível máximo de fidelidade e engenharia** para ser copiado e colado integralmente no **Cursor Composer** (ou assistente AI do Cursor) para refatorar, implementar e expandir o ecossistema **`bd-ai-poc`** da Radix para a Becton Dickinson (BD), acoplando a área de **Inside Logistics** por meio de **Módulos Independentes** e **Widgets Reutilizáveis** integrados ao dashboard dinâmico da workstation.

---

## 👁️ 1. CONCEPÇÃO DE PRODUTO, ARQUITETURA E METODOLOGIA GLOBAL (BD CORE)

Você é um Engenheiro de Software Principal e Arquiteto de Soluções de UI/UX, especialista em **React 19, TypeScript 5.8, Material UI (MUI 7.3)** e **Tailwind CSS v4** atuando na Radix.
Sua missão é refatorar o repositório **`bd-ai-poc`** para que as soluções de Inside Logistics de El Paso e do rollout de 10 plantas sejam implementadas de forma **100% modular e baseada em widgets arrastáveis**, em perfeita consonância com a arquitetura existente.

### A Espinha Dorsal: Os 3 Contratos de Capacidade (Capacity Contracts)
Todo o fluxo físico e lógico (IN01 a OB03 - 5 fluxos, 166 passos) deve ser governado por 3 contratos abstratos e reutilizáveis, garantindo que o núcleo transacional seja imutável e as interfaces de tela (Adaptadores) sejam configuradas por site:
1.  **Directed Movement (MD) [Movimento Dirigido]:** Mover uma unidade física (pallet/caixa) de uma origem a um destino.
    *   *Rigor de Engenharia:* **Idempotência**. Confirmar a mesma tarefa duas vezes (devido a oscilações de Wi-Fi no armazém) não pode mover o material ou decrementar estoque no SAP em dobro. A confirmação é uma transição de estado ancorada em chaves imutáveis (`idempotency_key` / `LP`). Toda exceção físico-financeira (avaria, saldo aberto) gera desvio imediato para tratamento humano, impedindo "movimentações no escuro".
2.  **Assisted Decision (DA) [Decisão Assistida]:** Motor inteligente calcula priorizações, sequenciamentos e roteamentos; o humano governa (aprova ou realiza overrides auditáveis com registro de motivo).
    *   *Rigor de Engenharia:* **Autonomy Threshold**. O sistema calcula a prioridade dinâmica (risco de parada de linha), mas restrições de quarentena regulada ou bloqueios de qualidade nunca podem ser auto-sobrepostas pelo software.
3.  **Inspect & Disposition (ID) [Inspeção e Disposição]:** Coletar evidências físicas e emitir vereditos legais de quarentena (Aprovar / Reter / Rejeitar).
    *   *Rigor de Engenharia:* **Teto Regulatório (Regulatory Ceiling)**. Devido ao compliance rigoroso da FDA (21 CFR Part 11) para dispositivos de classe médica, a disposição final de liberação comercial **NUNCA pode ser automática (N3)**. O sistema automatiza a evidência (N2), mas a liberação física e lógica permanece como um gate humano (N1 permanente por design).

---

## 🛠️ 2. RESOLUÇÃO DE DÍVIDAS TÉCNICAS E INTEGRAÇÃO À SMARTFACTORY

Antes de construir as interfaces, o Cursor deve aplicar o seguinte saneamento de arquitetura para preparar o repositório da SmartFactory (`bd-ai-poc`):

### Passo 1: Unificar o Duplo `WorkstationProvider` em `App.tsx`
No arquivo `src/App.tsx`, elimine o aninhamento indevido de dois `WorkstationProvider` que causa colisão de estado entre autenticação (auth) e navegação. Funda-os em uma árvore unificada:
```tsx
// src/App.tsx - Provider Tree Correta e Unificada
return (
  <ThemeModeProvider>
    <AuthProvider>
      <WorkstationProvider>
        <ActionTrackerProvider>
          <ShiftManagementProvider>
            <AiProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </AiProvider>
          </ShiftManagementProvider>
        </ActionTrackerProvider>
      </WorkstationProvider>
    </AuthProvider>
  </ThemeModeProvider>
);
```

### Passo 2: Quebrar o Monolito de Roteamento de ~3.000 Linhas (`AppContent.tsx`)
Crie o arquivo de rotas isolado da logística em **`src/logistics/AppRoutesLogistics.tsx`**.
*   Utilize `React.lazy()` para carregar as telas de logística sob demanda, protegendo o tempo de inicialização da SPA.
*   Envolva as rotas em um `<Suspense fallback={<CircularProgress />} />`.
*   No switch principal do `src/navigation/AppRoutes.tsx`, direcione as keys de logística para este sub-roteador.

### Passo 3: Registrar Módulos e Screen Keys na Navegação Central
No arquivo **`src/navigation/navigationConfig.tsx`**, adicione sob o escopo do menu de logística (`Logistic`):
*   `logistics_mobile_ops` ──> María Guadalupe "Lupita" (Tablet de Doca)
*   `guided_tasks` ──> José Luis "Pepe" (Zebra RF Scanner)
*   `quality_release` ──> Dra. Alejandra (Quality Workstation)
*   `shipment_readiness` ──> Gabriela "Gaby" (SpaceX Shipping Cockpit)

---

## 🧩 3. ENGENHARIA DE WIDGETS: EXPANSÃO DO `widgetRegistry.ts`

A SmartFactory é uma plataforma baseada em widgets que o usuário pode arrastar e organizar na Workstation utilizando `react-grid-layout`. Para acoplar o Inside Logistics de forma integrada, o Cursor deve registrar **4 novos widgets de alta performance** no arquivo **`src/workstation/data/widgetRegistry.ts`**:

```typescript
// Adicionar ao widgetRegistry.ts de forma integrada:
export const LOGISTICS_WIDGETS = {
  'inbound_sla_chart': {
    id: 'inbound_sla_chart',
    title: 'KPI: Inbound Dock-to-Stock SLA',
    description: 'Monitoramento em tempo real do tempo de ciclo de recebimento e liberação.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'InboundSlaWidget'
  },
  'active_loads_timeline': {
    id: 'active_loads_timeline',
    title: 'Rastreamento de Cargas de Esterilização',
    description: 'Custódia física de caminhões em trânsito com provedor externo (Sterigenics).',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'ActiveLoadsTimelineWidget'
  },
  'line_shortage_risk': {
    id: 'line_shortage_risk',
    title: 'Risco de Abastecimento (Shortage)',
    description: 'Filas de picking priorizadas por risco iminente de parada de linha.',
    category: 'Logistics',
    size: { w: 6, h: 4 },
    component: 'LineShortageRiskWidget'
  },
  'spacex_shipping_gating': {
    id: 'spacex_shipping_gating',
    title: 'Console de Embarque SpaceX Gating',
    description: 'Status de conformidade das 4 travas de liberação antes de carregar o caminhão.',
    category: 'Logistics',
    size: { w: 4, h: 4 },
    component: 'SpaceXShippingGatingWidget'
  }
};
```

---

## 💾 4. ARQUITETURA DE DADOS REATIVOS (`logisticsMockData.ts`)

Crie o arquivo **`src/logistics/data/logisticsMockData.ts`**. Este arquivo conterá a tipagem estrita de dados e utilizará o **`localStorage`** do navegador como barramento síncrono. Isso garante que a aprovação eletrônica do lote na tela da Dra. Alejandra altere o estado no cache e destrave automaticamente as luzes do console de expedição da Gaby em tempo real:

```typescript
export interface PalletUnit {
  id: string; // Ex: ELP2026.101
  poNumber: string;
  sku: string;
  materialName: string;
  batch: string;
  expectedQty: number;
  receivedQty: number;
  status: 'EXPECTED' | 'RECEIVED' | 'IN_INSPECTION' | 'HOLD' | 'RELEASED' | 'REJECTED';
  location: string;
  coaAttached: boolean;
  divergences?: string[];
}

export interface SterilizationLoad {
  id: string;
  route: 'A_NO_STERILIZATION' | 'B_INTERNAL' | 'C_INTERCOMPANY' | 'D_EXTERNAL';
  providerName: string;
  status: 'PENDING_DISPATCH' | 'IN_TRANSIT_TO' | 'AT_PROVIDER' | 'IN_TRANSIT_BACK' | 'RETURNED_QUARANTINE' | 'RELEASED';
  pallets: string[];
  biIndicatorChecked: boolean;
  bioburdenTestPassed: boolean;
  carrierPlate: string;
  eta: string;
}

export interface OutboundShipment {
  id: string;
  destination: string;
  needDate: string;
  status: 'READINESS_CHECK' | 'PICKING' | 'LOADING' | 'RELEASED' | 'BLOCKED';
  checks: {
    batchRecord: 'GREEN' | 'YELLOW' | 'RED';
    sterilizationPass: 'GREEN' | 'YELLOW' | 'RED';
    customsClearance: 'GREEN' | 'YELLOW' | 'RED';
    lineClearance: 'GREEN' | 'YELLOW' | 'RED';
  };
  carrierName: string;
  dockSlot: string;
}

// ESTADO INICIAL
export const initialPallets: PalletUnit[] = [
  {
    id: 'ELP2026.101',
    poNumber: 'PO-98440',
    sku: 'BD-8805-SYR',
    materialName: 'Syringe Plunger 5ml',
    batch: 'LOT-A-114',
    expectedQty: 500,
    receivedQty: 500,
    status: 'EXPECTED',
    location: 'STAGING-DOCK-3',
    coaAttached: false
  },
  {
    id: 'ELP2026.102', // Caminhão de Exceção do SAP
    poNumber: 'PO-98445',
    sku: 'BD-3304-NDL',
    materialName: 'Precision Needle 22G',
    batch: 'LOT-E-509',
    expectedQty: 1200,
    receivedQty: 0,
    status: 'EXPECTED',
    location: 'STAGING-DOCK-3',
    coaAttached: false,
    divergences: ['SAP_SYNC_FAILED']
  }
];

export const initialLoads: SterilizationLoad[] = [
  {
    id: 'LOAD-ELP-61',
    route: 'D_EXTERNAL',
    providerName: 'Sterigenics External',
    status: 'IN_TRANSIT_BACK',
    pallets: ['ELP2026.204', 'ELP2026.205'],
    biIndicatorChecked: false,
    bioburdenTestPassed: false,
    carrierPlate: 'TX-R-4402',
    eta: '10:45 AM'
  }
];

export const initialShipments: OutboundShipment[] = [
  {
    id: 'SHIP-QRO-15',
    destination: 'Querétaro, MX (Export)',
    needDate: '2026-08-12',
    status: 'READINESS_CHECK',
    checks: {
      batchRecord: 'GREEN',
      sterilizationPass: 'RED', // Inicia Vermelho, destrava quando Dra. Alejandra libera o lote Lot A-114
      customsClearance: 'GREEN',
      lineClearance: 'GREEN'
    },
    carrierName: 'Swift Transport',
    dockSlot: 'DOCK-14'
  },
  {
    id: 'SHIP-RNO-08', // Caminhão de Exceção de Aduana
    destination: 'Reno, NV (Domestic)',
    needDate: '2026-08-11',
    status: 'BLOCKED',
    checks: {
      batchRecord: 'GREEN',
      sterilizationPass: 'GREEN',
      customsClearance: 'RED',
      lineClearance: 'GREEN'
    },
    carrierName: 'FedEx Freight',
    dockSlot: 'DOCK-15'
  }
];
```

---

## 📈 5. CÓDIGO FONTE DOS WIDGETS (COMPLETOS E PRONTOS PARA RECHARTS)

Implemente os arquivos dos widgets de logística na pasta **`src/logistics/widgets/`**. Utilize as cores oficiais da BD (Azul `#044ED7`) e da Radix (Laranja `#FF5F00` como indicador de alerta e destaque).

### Widget 1: `InboundSlaWidget.tsx` (Área de Recharts)
```tsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const slaData = [
  { time: '08:00', cycleTime: 45, target: 60 },
  { time: '09:00', cycleTime: 52, target: 60 },
  { time: '10:00', cycleTime: 58, target: 60 },
  { time: '11:00', cycleTime: 42, target: 60 },
  { time: '12:00', cycleTime: 38, target: 60 },
  { time: '13:00', cycleTime: 65, target: 60 }, // Spike acima do SLA
  { time: '14:00', cycleTime: 48, target: 60 },
];

export const InboundSlaWidget: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          Dock-to-Stock Cycle Time (SLA Mapped)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Target: 60 min. Linha Laranja representa o limite de tolerância regulatória.
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#044ED7" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#044ED7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="cycleTime" stroke="#044ED7" strokeWidth={2} fillOpacity={1} fill="url(#colorCycle)" name="Tempo (Minutos)" />
            <Area type="monotone" dataKey="target" stroke="#FF5F00" strokeDasharray="4 4" fill="none" name="SLA Limit" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

### Widget 2: `ActiveLoadsTimelineWidget.tsx` (Esterilização UPS Timeline Style)
```tsx
import React from 'react';
import { Card, Box, Typography, CardContent } from '@mui/material';
import { Truck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export const ActiveLoadsTimelineWidget: React.FC = () => {
  const steps = [
    { label: 'Carga Despachada', status: 'COMPLETE', time: '08:15 AM' },
    { label: 'Chegada Provedor', status: 'COMPLETE', time: '09:30 AM' },
    { label: 'Em Esterilização', status: 'COMPLETE', time: '11:00 AM' },
    { label: 'Trânsito de Retorno', status: 'ACTIVE', time: 'ETA 10:45 AM' },
    { label: 'Liberação de Quarentena', status: 'PENDING', time: '--:--' }
  ];

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Rastreamento de Custódia: LOAD-ELP-61
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Caminhão TX-R-4402 retornando do esterilizador externo (Sterigenics).
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((step, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {idx < steps.length - 1 && (
                <Box sx={{
                  position: 'absolute', left: 12, top: 24, bottom: -16, width: 2,
                  bgcolor: step.status === 'COMPLETE' ? '#044ED7' : 'divider'
                }} />
              )}
              <Box sx={{ zIndex: 2 }}>
                {step.status === 'COMPLETE' && <CheckCircle2 size={24} color="#044ED7" />}
                {step.status === 'ACTIVE' && <Truck size={24} color="#FF5F00" className="animate-bounce" />}
                {step.status === 'PENDING' && <Circle size={24} color="#bdc3c7" />}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={step.status === 'ACTIVE' ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
```

### Widget 3: `SpaceXShippingGatingWidget.tsx` (SpaceX Shipping Cockpit 4-Light Console)
```tsx
import React, { useState, useEffect } from 'react';
import { Card, Box, Typography, Button, Grid, Chip } from '@mui/material';
import { Play, ShieldAlert, CheckCircle } from 'lucide-react';

export const SpaceXShippingGatingWidget: React.FC = () => {
  const [palletStatus, setPalletStatus] = useState<string>('IN_INSPECTION');

  useEffect(() => {
    const handleStorageChange = () => {
      const pallets = JSON.parse(localStorage.getItem('inbound_pallets') || '[]');
      const plungerPallet = pallets.find((p: any) => p.id === 'ELP2026.101');
      if (plungerPallet) {
        setPalletStatus(plungerPallet.status);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Verificar inicial
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isReleased = palletStatus === 'RELEASED';

  return (
    <Card sx={{ height: '100%', bgcolor: '#0B132B', color: '#ffffff', p: 2, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" color="#ffffff">
          SpaceX Release Console: SHIP-QRO-15
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          Destino: Querétaro, MX (Export) - Carga crítica de Plungers.
        </Typography>
      </Box>

      <Box sx={{ my: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
              <Typography variant="caption">Batch Record</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isReleased ? '#2e7d32' : '#d32f2f', className: !isReleased ? 'animate-pulse' : '' }} />
              <Typography variant="caption">Esterilização</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
              <Typography variant="caption">Customs XML</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
              <Typography variant="caption">Line Clearance</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        {isReleased ? (
          <Button variant="contained" color="success" fullWidth startIcon={<Play />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            LAUNCH SHIPMENT (GO)
          </Button>
        ) : (
          <Box sx={{ p: 1, borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(211,47,47,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f44336' }}>
              <ShieldAlert size={16} />
              <Typography variant="caption" fontWeight="bold">CUSTODY LOCKED</Typography>
            </Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" sx={{ mt: 0.5 }}>
              Lote LOT-A-114 pendente de Assinatura Digital de liberação de quarentena.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};
```

---

## 💻 6. CODIFICAÇÃO REATIVA E INTERATIVA DAS 4 JORNADAS DE LOGÍSTICA

Implemente e renderize de forma polida e responsiva as quatro telas principais na pasta `src/logistics/`. Sincronize os estados lógicos por meio do `localStorage` para que as telas reajam entre si instantaneamente.

### 📥 1. María Guadalupe "Lupita" Hernández López: Tablet Receiving (Doca)
*   *Componente:* `src/logistics/MobileReceivingPage.tsx` (Screen key: `logistics_mobile_ops`)
*   *UX/UI (Tablet View):* Layout de 10" responsivo. Exibe a fila de agendamentos baseados na integração síncrona do SAP. Ao selecionar o caminhão **"Swift Transport - Dock 3 (10:40 AM)"**, abre o checklist de 4 pontos obrigatórios:
    1.  *Físico vs Documental bate?* (Checkbox)
    2.  *Nota Fiscal & BOL batem com PO?* (Checkbox)
    3.  *Etiqueta física de Pallet ID impressa?* (Checkbox)
    4.  *Laudo de fornecedor (COA) anexado?* (Checkbox - inicia desmarcado)
*   *Reatividade:* O botão principal **"MARK DOCK READY (TRANSFER CUSTODY)"** inicia desabilitado. Habilita-se assim que os 4 pontos são marcados. Ao clicar, simula a barcodização da etiqueta física (`ELP2026.101`), salva o status como `IN_INSPECTION` no `localStorage`, emite um toast e gera a pendência correspondente na fila da Dra. Alejandra.
*   *Tratamento de Exceções:* Clicar no caminhão **"DHL Freight - Dock 1 (11:15 AM)"** deve renderizar um banner de erro vermelho proeminente: `⚠️ "PO Paperwork could not be verified — SAP sync failed [URS-400-003]"`. Exiba o botão **"Retry SAP Sync"** que roda um loading de 1.2 segundos e, ao resolver com sucesso, muda o banner para verde e destrava o checklist.

### 📦 2. José Luis "Pepe" Martínez Gómez: Zebra RF Guided Picking (Mobile Scanner)
*   *Componente:* `src/logistics/guided_tasks/ZebraPickingPage.tsx` (Screen key: `guided_tasks`)
*   *UX/UI (RF View):* Caixa vertical dark-mode estreita simulando o visor do terminal Zebra TC57. Tipografia gigante em branco e botões azuis largos. Exibe rigorosamente **um item por vez** (Instacart-style):
    *   `TASK ID: PW-9021` (Put-away/Picking task)
    *   `LOCATION: BIN-RMW-B-14-02` (Posição sugerida de prateleira)
    *   `SKU: BD-8805-SYR (Syringe Plunger)`
    *   `QTY: PICK 3x UNITS`
    *   `PROGRESS BAR:` Reativa (Item 1 de 3).
*   *Reatividade:* O botão **"SCAN BIN BARCODE"** simula a leitura. Se correto, destrava o botão **"SCAN PALLET ID [URS-170-002]"**. Se o operador simular a leitura do código de barras de um local incorreto, o visor pisca em vermelho agressivo com aviso sonoro (buzzer): `❌ "SOURCE_MISMATCH: Posição física em desacordo com as regras de FIFO e lote [URS-150-003, URS-170-002]"`.
*   *Botão F2 - Exception:* Tecla flutuante de desvio. Ao ser clicada, Pepe pode relatar divergências de pátio (ex: "Corredor sem estoque", "Pallet avariado"). Cancela a tarefa física com segurança, abre um chamado de recount na Control Tower e direciona Pepe para outro bin livre.

### 🔬 3. Dra. Alejandra González Sánchez: QA Workstation & E-Signature (Desktop)
*   *Componente:* `src/logistics/QualityReleasePage.tsx` (Screen key: `quality_release`)
*   *UX/UI (Widescreen View):* Painel administrativo de alta densidade visual. Tabela listando lotes de matéria-prima sob quarentena regulatória, ordenados dinamicamente por **risco de parada iminente de linha**.
*   *Reatividade (Compliance FDA 21 CFR Part 11):* Ao selecionar o lote `Lot A-114 (Urgente - Parada de Linha)` na tabela, abre o painel de auditoria consolidando as evidências do laboratório: `COA Uploaded (OK)`, `Bioburden Micro Test (Passed)`, `Biological Indicators (Sterile)`.
*   *E-Signature Gateway:* O botão de liberação abre o modal regulado de **Assinatura Eletrônica (E-Signature)** contendo:
    *   Campo obrigatório para senha de login do usuário.
    *   Dropdown obrigatório para seleção do "Motivo da Disposição" (ex: Liberação pós-esterilização).
    *   Termo legal imutável: *"Eu atesto sob as penalidades de compliance que revisei todas as evidências físicas de laboratório e as submeto em conformidade com as normas regulatórias da FDA e 21 CFR Part 11 [URS-610-002]."*
    *   O botão de confirmação só habilita após a inserção da senha. Ao salvar, grava os logs imutáveis de trilha de auditoria (`src/FilesMD/AUDIT_TRAIL`) no localStorage, atualiza o status do lote para `RELEASED` e destrava síncronamente o check do SpaceX cockpit da Gaby.

### 🚀 4. Gabriela "Gaby" Rodríguez Pérez: SpaceX Shipment Cockpit (Control Tower)
*   *Componente:* `src/logistics/ShipmentReadinessPage.tsx` (Screen key: `shipment_readiness`)
*   *UX/UI (Widescreen View):* Painel de expedição e faturamento simulando a Control Tower de voo.
*   *Reatividade:* Ao selecionar o caminhão **"Querétaro, MX (SHIP-QRO-15)"**, exibe as 4 luzes de segurança de prontidão integradas ao estado do localStorage:
    1.  `BATCH RECORD VALIDATION` (Verde)
    2.  `STERILIZATION CYCLE CONFIRMED` (Verde se o lote LOT-A-114 estiver `RELEASED` no localStorage; senão, Vermelho Piscante)
    3.  `CUSTOMS DOCUMENTATION READY` (Verde)
    4.  `LINE CLEARANCE OK` (Verde)
*   *GO/NO-GO Control:* Se todos os 4 checks estiverem verdes, o botão central de despacho `"GO — RELEASE SHIPMENT"` fica ativo e pulsante. Ao ser clicado, exibe animação de carregamento e confirma a PGI e saída do caminhão no SAP.
*   *Tratamento de Exceções:* Ao selecionar o caminhão de exceção **"Reno, NV (SHIP-RNO-08)"**, a luz de `CUSTOMS DOCUMENTATION` pisca em vermelho. O botão central "GO" fica cinza. Para resolver, exiba o botão **"Re-Verify Customs XML"** que simula uma verificação assíncrona de 2 segundos com o SAP QM/Receita e muda a luz para verde, desbloqueando o caminhão.

---

## 🔁 7. BOTÃO CRÍTICO DE APRESENTAÇÃO: "RESET DEMO DATA"

Para garantir o sucesso absoluto de sua apresentação para a Julia Kalil e os diretores da BD, inclua um botão flutuante ou ícone de reciclagem no cabeçalho das páginas de Inside Logistics com a legenda **`"Reset Demo Data"`**:
*   **Comportamento do Clique:** Ele deve limpar todas as chaves de dados logísticos criadas e manipuladas no `localStorage` do navegador e forçar um reload limpo da página (`window.location.reload()`).
*   **A Força do Reset:** Isso garante que você e a Julia possam rodar a demonstração e o Happy Path do início quantas vezes forem necessárias sem que as aprovações de "Approved" ou "Released" de testes passados interfiram na sua apresentação ao vivo amanhã!

---

*Copie esta especificação mestre de forma integral e cole-a no Cursor Composer. O Cursor irá reestruturar e modularizar o seu projeto React de forma perfeita, polida e reativa!*
