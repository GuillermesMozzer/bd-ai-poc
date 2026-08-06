import WorkstationTraceabilityDetailTable from './WorkstationTraceabilityDetailTable';
import type {
  WorkstationSelectedItemDetail,
  WorkstationSelectedItemType,
  WorkstationTraceabilityEvent,
} from '../types';
import WidgetShell from './WidgetShell';

type WorkstationSelectedItemDetailsWidgetProps = {
  selectedItemType: WorkstationSelectedItemType;
  selectedItems: Record<WorkstationSelectedItemType, WorkstationSelectedItemDetail>;
  traceabilityHistory: WorkstationTraceabilityEvent[];
  onSelectItemType: (itemType: WorkstationSelectedItemType) => void;
};

export default function WorkstationSelectedItemDetailsWidget({
  selectedItemType,
  selectedItems,
  traceabilityHistory,
  onSelectItemType,
}: WorkstationSelectedItemDetailsWidgetProps) {
  return (
    <WidgetShell title="Traceability Details" noPadding>
      <WorkstationTraceabilityDetailTable
        selectedItemType={selectedItemType}
        selectedItems={selectedItems}
        traceabilityHistory={traceabilityHistory}
        onSelectItemType={onSelectItemType}
      />
    </WidgetShell>
  );
}
