import React from 'react';
import WorkOrderManagementScreen from './WorkOrderManagementScreen';

type WorkOrdersPageProps = {
  onBack?: () => void;
  onOpenBluAiWorkflow?: () => void;
  onCreateOrder?: () => void;
};

export default function WorkOrdersPage({ onBack, onOpenBluAiWorkflow, onCreateOrder }: WorkOrdersPageProps) {
  return <WorkOrderManagementScreen onBack={onBack} onOpenBluAiWorkflow={onOpenBluAiWorkflow} onCreateOrder={onCreateOrder} />;
}
