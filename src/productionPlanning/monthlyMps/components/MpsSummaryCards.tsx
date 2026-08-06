import {
  ErrorOutline as ErrorOutlineIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import type {MpsAssistantFinalReadinessStatus, MpsHealthSummary} from '../types';

type Props = {
  health: MpsHealthSummary;
  blockerCount: number;
  warningCount: number;
  materialRiskCount: number;
  readinessStatus: MpsAssistantFinalReadinessStatus;
};

export default function MpsSummaryCards({health, blockerCount, warningCount, materialRiskCount, readinessStatus}: Props) {
  const values = {
    totalDemand: health.totalApprovedDemand.toLocaleString(),
    planned: health.totalPlannedQuantity.toLocaleString(),
    remaining: health.remainingUnplanned.toLocaleString(),
    overloaded: String(health.overloadedCount),
    stockRisk: String(health.stockRiskCount),
    materialRisk: String(materialRiskCount),
    blockers: String(blockerCount),
    warnings: String(warningCount),
  };

}
