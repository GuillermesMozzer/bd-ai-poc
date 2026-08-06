import {useState} from 'react';
import type {WorkstationSelectedItemType} from '../types';

export function useWorkstationDetailState(initialCycleTarget = 'Line 10') {
  const [selectedItemType, setSelectedItemType] = useState<WorkstationSelectedItemType>('lot');
  const [selectedCycleTarget, setSelectedCycleTarget] = useState(initialCycleTarget);

  return {
    selectedCycleTarget,
    selectedItemType,
    setSelectedCycleTarget,
    setSelectedItemType,
  };
}
