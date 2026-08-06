import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  Inventory2Outlined as InboundIcon,
  LocalShippingOutlined as FinishedGoodsIcon,
  MoveToInboxOutlined as ReplenishmentIcon,
  SwapHoriz as WipIcon,
} from '@mui/icons-material';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import AreaSelectionCard from '../mobileOps/components/AreaSelectionCard';
import InboundReceivingLanding, {
  inboundReceivingPlaceholderMessages,
  type InboundReceivingPlaceholder,
} from '../mobileOps/components/InboundReceivingLanding';
import MyActiveTasksView from '../mobileOps/components/MyActiveTasksView';
import { type DeliveryAcknowledgements } from '../mobileOps/components/DeliveryWorkChecklist';
import MobileOpsShell from '../mobileOps/components/MobileOpsShell';
import MobilePlaceholderView from '../mobileOps/components/MobilePlaceholderView';
import PalletLpDetail from '../mobileOps/components/PalletLpDetail';
import PalletLpModule from '../mobileOps/components/PalletLpModule';
import { type PalletLp } from '../mobileOps/components/PalletLpCard';
import ReadyToUnloadList from '../mobileOps/components/ReadyToUnloadList';
import UnloadingTaskDetail from '../mobileOps/components/UnloadingTaskDetail';
import { type OperatorAssignment, type UnloadingTask } from '../mobileOps/components/UnloadingTaskCard';

type MobileOpsView = 'areas' | 'inbound-receiving' | 'ready-to-unload' | 'my-active-tasks' | 'task-detail' | 'pallet-lps' | 'pallet-detail' | 'receiving-checklist-placeholder' | 'inbound-placeholder';
type TaskDetailOrigin = 'ready-to-unload' | 'my-active-tasks';

const charlesGavin: OperatorAssignment = { name: 'Charles Gavin', role: 'Warehouse Operator' };
const emptyAcknowledgements: DeliveryAcknowledgements = { palletsUnloaded: false, labelsApplied: false, issuesReviewed: false };

function createPallets(task: UnloadingTask): PalletLp[] {
  return Array.from({ length: task.expectedPallets }, (_, index) => ({
    deliveryId: task.id,
    sequence: index + 1,
    labelPrinted: false,
    confirmed: false,
    status: 'Not started',
  }));
}

const initialUnloadingTasks: UnloadingTask[] = [
  {
    id: 'inbound-trl-3302', priority: 'High', vendor: 'GlobalPack Solutions', carrier: 'El Paso Cartage', trailerId: 'TRL-3302',
    purchaseOrder: '4500123499', dock: 'RM Dock A', stagingLane: 'Staging Lane 1', expectedPallets: 4,
    materialSummary: 'Sterile barrier film roll', lot: 'LOT-26-0708-C', releaseStatus: 'Ready to unload', unloadingStatus: 'Not started', assignedOperators: [charlesGavin],
  },
  {
    id: 'inbound-trl-1187', priority: 'Medium', vendor: 'MedSupply Components', carrier: 'Borderline Freight', trailerId: 'TRL-1187',
    purchaseOrder: '4500123511', dock: 'RM Dock B', expectedPallets: 6,
    materialSummary: 'Plastic body components', releaseStatus: 'Ready to unload', unloadingStatus: 'In progress',
    assignedOperators: [charlesGavin, { name: 'Mia Torres', role: 'Warehouse Operator' }],
  },
];

const futureAreas = [
  { title: 'Material Replenishment', description: 'Line-side material supply', icon: <ReplenishmentIcon /> },
  { title: 'WIP Movement', description: 'Work-in-process material moves', icon: <WipIcon /> },
  { title: 'Finished Goods', description: 'Finished goods warehouse execution', icon: <FinishedGoodsIcon /> },
] as const;

export default function LogisticsMobileOpsPage() {
  const [view, setView] = useState<MobileOpsView>('areas');
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<InboundReceivingPlaceholder>('releasedForPutaway');
  const [tasks, setTasks] = useState<UnloadingTask[]>(initialUnloadingTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDetailOrigin, setTaskDetailOrigin] = useState<TaskDetailOrigin>('ready-to-unload');
  const [palletsByDelivery, setPalletsByDelivery] = useState<Record<string, PalletLp[]>>({});
  const [acknowledgementsByDelivery, setAcknowledgementsByDelivery] = useState<Record<string, DeliveryAcknowledgements>>({});
  const [selectedPalletSequence, setSelectedPalletSequence] = useState<number | null>(null);
  const { setCurrentScreen } = useWorkstationContext();
  const isAreaSelection = view === 'areas';
  const readyToUnloadTasks = tasks.filter((task) => task.releaseStatus === 'Ready to unload');
  const activeTasks = tasks.filter((task) => task.assignedOperators.some((operator) => operator.name === charlesGavin.name) && task.unloadingStatus !== 'Completed');
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedPallets = selectedTask ? palletsByDelivery[selectedTask.id] ?? createPallets(selectedTask) : [];
  const selectedPallet = selectedPallets.find((pallet) => pallet.sequence === selectedPalletSequence) ?? null;
  const selectedAcknowledgements = selectedTask ? acknowledgementsByDelivery[selectedTask.id] ?? emptyAcknowledgements : emptyAcknowledgements;
  const confirmedPalletCount = selectedPallets.filter((pallet) => pallet.confirmed).length;
  const receivingChecksReady = !!selectedTask && confirmedPalletCount === selectedTask.expectedPallets && selectedAcknowledgements.palletsUnloaded && selectedAcknowledgements.labelsApplied && selectedAcknowledgements.issuesReviewed;

  const openTask = (taskId: string, origin: TaskDetailOrigin) => {
    setSelectedTaskId(taskId);
    setTaskDetailOrigin(origin);
    setView('task-detail');
  };

  const assignCharles = () => {
    if (!selectedTaskId) return;
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === selectedTaskId && !task.assignedOperators.some((operator) => operator.name === charlesGavin.name)
        ? { ...task, assignedOperators: [...task.assignedOperators, charlesGavin] }
        : task
    )));
  };

  const unassignCharles = () => {
    if (!selectedTaskId) return;
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === selectedTaskId
        ? { ...task, assignedOperators: task.assignedOperators.filter((operator) => operator.name !== charlesGavin.name) }
        : task
    )));
  };

  const startUnloading = () => {
    if (!selectedTaskId) return;
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === selectedTaskId ? { ...task, unloadingStatus: 'In progress' } : task
    )));
  };

  const openPallets = () => {
    if (!selectedTask) return;
    setPalletsByDelivery((current) => current[selectedTask.id] ? current : { ...current, [selectedTask.id]: createPallets(selectedTask) });
    setView('pallet-lps');
  };

  const toggleAcknowledgement = (key: keyof DeliveryAcknowledgements) => {
    if (!selectedTask) return;
    setAcknowledgementsByDelivery((current) => {
      const acknowledgements = current[selectedTask.id] ?? emptyAcknowledgements;
      return { ...current, [selectedTask.id]: { ...acknowledgements, [key]: !acknowledgements[key] } };
    });
  };

  const updateSelectedPallet = (update: (pallet: PalletLp) => PalletLp) => {
    if (!selectedTask || selectedPalletSequence === null) return;
    setPalletsByDelivery((current) => {
      const pallets = current[selectedTask.id] ?? createPallets(selectedTask);
      return { ...current, [selectedTask.id]: pallets.map((pallet) => pallet.sequence === selectedPalletSequence ? update(pallet) : pallet) };
    });
  };

  const generateLp = () => {
    if (!selectedTask || selectedPalletSequence === null) return;
    const trailerCode = selectedTask.trailerId.replace(/[^A-Za-z0-9]/g, '');
    updateSelectedPallet((pallet) => ({ ...pallet, lpId: `LP-${trailerCode}-${String(pallet.sequence).padStart(3, '0')}`, status: 'LP generated' }));
  };

  const printLabel = () => updateSelectedPallet((pallet) => ({ ...pallet, labelPrinted: true, status: pallet.confirmed ? 'LP confirmed' : 'Label printed' }));
  const confirmLp = () => updateSelectedPallet((pallet) => ({ ...pallet, confirmed: true, status: 'LP confirmed' }));

  return (
    <MobileOpsShell
      title={isAreaSelection ? 'Logistics Mobile Ops' : 'Inbound Receiving'}
      operatorName="Charles Gavin"
      operatorRole="Warehouse Operator"
      navigationLabel={
        isAreaSelection
          ? 'Back to app library'
          : view === 'task-detail'
            ? taskDetailOrigin === 'ready-to-unload' ? 'Back to Ready to unload' : 'Back to My active tasks'
            : view === 'pallet-detail'
              ? 'Back to Pallets / LPs'
              : view === 'pallet-lps' || view === 'receiving-checklist-placeholder'
                ? 'Back to delivery execution'
              : view === 'inbound-placeholder'
                ? 'Back to Inbound Receiving'
                : view === 'ready-to-unload' || view === 'my-active-tasks'
                  ? 'Back to Inbound Receiving'
                  : 'Back to area selection'
      }
      navigationMode={isAreaSelection ? 'library' : 'back'}
      onNavigate={() => {
        if (isAreaSelection) {
          setCurrentScreen('workstations');
        } else if (view === 'task-detail') {
          setView(taskDetailOrigin);
        } else if (view === 'pallet-detail') {
          setView('pallet-lps');
        } else if (view === 'pallet-lps' || view === 'receiving-checklist-placeholder') {
          setView('task-detail');
        } else if (view === 'inbound-placeholder') {
          setView('inbound-receiving');
        } else if (view === 'ready-to-unload' || view === 'my-active-tasks') {
          setView('inbound-receiving');
        } else {
          setView('areas');
        }
      }}
    >
      {isAreaSelection ? (
        <Stack spacing={2.5}>
          <Box>
            <Typography component="h2" sx={{ color: '#102A43', fontSize: { xs: 22, sm: 25 }, fontWeight: 900, lineHeight: 1.2 }}>
              Select an area
            </Typography>
            <Typography sx={{ color: '#557086', fontSize: 14, fontWeight: 600, mt: 0.75, lineHeight: 1.5 }}>
              Choose your assigned logistics work area to continue.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <AreaSelectionCard title="Inbound Receiving" description="Receive and stage inbound materials" icon={<InboundIcon />} onClick={() => setView('inbound-receiving')} />
            {futureAreas.map((area) => (
              <AreaSelectionCard key={area.title} title={area.title} description={area.description} icon={area.icon} disabled />
            ))}
          </Stack>
        </Stack>
      ) : view === 'inbound-receiving' ? (
        <InboundReceivingLanding
          readyToUnloadCount={readyToUnloadTasks.length}
          activeTasksCount={activeTasks.length}
          onOpenReadyToUnload={() => setView('ready-to-unload')}
          onOpenActiveTasks={() => setView('my-active-tasks')}
          onOpenPlaceholder={(placeholder) => {
            setSelectedPlaceholder(placeholder);
            setView('inbound-placeholder');
          }}
        />
      ) : view === 'ready-to-unload' ? (
        <ReadyToUnloadList tasks={readyToUnloadTasks} operatorName={charlesGavin.name} onOpenTask={(taskId) => openTask(taskId, 'ready-to-unload')} />
      ) : view === 'my-active-tasks' ? (
        <MyActiveTasksView tasks={activeTasks} operatorName={charlesGavin.name} onOpenTask={(taskId) => openTask(taskId, 'my-active-tasks')} />
      ) : view === 'task-detail' && selectedTask ? (
        <UnloadingTaskDetail task={selectedTask} operatorName={charlesGavin.name} onAssign={assignCharles} onUnassign={unassignCharles} onStart={startUnloading} acknowledgements={selectedAcknowledgements} confirmedPallets={confirmedPalletCount} onToggleAcknowledgement={toggleAcknowledgement} onOpenPallets={openPallets} onOpenReceivingChecks={() => setView('receiving-checklist-placeholder')} />
      ) : view === 'pallet-lps' && selectedTask ? (
        <PalletLpModule task={selectedTask} pallets={selectedPallets} receivingChecksReady={receivingChecksReady} onOpenPallet={(sequence) => { setSelectedPalletSequence(sequence); setView('pallet-detail'); }} onOpenReceivingChecks={() => setView('receiving-checklist-placeholder')} />
      ) : view === 'pallet-detail' && selectedPallet ? (
        <PalletLpDetail pallet={selectedPallet} onGenerateLp={generateLp} onPrintLabel={printLabel} onReprintLabel={printLabel} onConfirmLp={confirmLp} />
      ) : view === 'receiving-checklist-placeholder' ? (
        <MobilePlaceholderView title="Receiving checks" message="Receiving checklist coming next" backLabel="Back to delivery execution" onBack={() => setView('task-detail')} />
      ) : (
        <MobilePlaceholderView
          title={inboundReceivingPlaceholderMessages[selectedPlaceholder].title}
          message={inboundReceivingPlaceholderMessages[selectedPlaceholder].message}
          onBack={() => setView('inbound-receiving')}
        />
      )}
    </MobileOpsShell>
  );
}
