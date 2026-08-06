import MRPExplorerPage from '../mrpExplorer/MRPExplorerPage';
import type {MrpVersion} from './types';

interface MrpPlanningPageProps {
  version: MrpVersion;
}

export default function MrpPlanningPage({version}: MrpPlanningPageProps) {
  return <MRPExplorerPage version={version} />;
}
