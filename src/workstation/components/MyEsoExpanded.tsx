import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Check as CheckIcon,
  OpenInFull as OpenInFullIcon,
  Search as SearchIcon,
  StarBorder as StarBorderIcon,
  SwapVert as SortIcon,
  Videocam as CameraIcon,
} from '@mui/icons-material';

type MyEsoExpandedProps = {
  onBack: () => void;
};

const expandedKpis = [
  ['13', 'Total Reports', tokenBrand.lighter, tokenNeutral.lighter],
  ['5', 'Action Item', tokenBrand.lighter, tokenNeutral.lighter],
  ['4', 'Open', tokenError.main, tokenNeutral.lighter],
  ['2', 'Closed', tokenSuccess.dark, tokenNeutral.main],
  ['1', 'Overdue', tokenError.main, tokenNeutral.lighter],
  ['1', 'High risk', tokenError.main, tokenNeutral.lighter],
] as const;

const observationRows = [
  ['Oil spill near machinery', 'Small oil leak detected near hydraulic press, creating slip hazard that requires immediate attention.', 'HAZARD', 'Environmental', 'HIGH', 'Autoguard - Line 1', 'Maria Lopez', 'Feb 11, 2026 14:30', '01', 'Maintenance Team'],
  ['Near miss - forklift operation', 'Forklift nearly collided with pedestrian in warehouse due to blind corner.', 'INCIDENT', 'Equipment Safety', 'MEDIUM', 'Autoguard - Line 2', 'Sarah Johnson', 'Feb 10, 2026 16:45', '02', 'Safety Officer'],
  ['Machine Overheating', 'Production line machine exceeded safe temperature limits, requiring immediate shutdown for inspection.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Conveyor Belt Jam', 'Material blockage caused a temporary stop in the conveyor system, impacting output for 45 minutes.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Hydraulic Leak Detected', 'Oil leakage identified in hydraulic press area, posing potential safety and environmental risk.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Forklift Collision', 'Minor collision between forklift and storage rack resulting in structural damage but no injuries.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Electrical Panel Failure', 'Power distribution panel malfunction caused interruption in Line 3 operations.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Worker Slip Incident', 'Operator slipped near assembly station due to wet floor conditions; no major injuries reported.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Raw Material Shortage', 'Production halted temporarily due to delayed delivery of critical raw materials.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Fire Alarm Triggered', 'Fire alarm activated due to smoke detected near welding area; false alarm confirmed after inspection.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
  ['Safety Guard Missing', 'Protective guard removed from cutting equipment, creating unsafe operating conditions.', 'INCIDENT', 'Safety First', '-', 'Nexiva - Line 1', 'Mike Williams', 'Feb 10, 2026 16:45', '01', '-'],
] as const;

function MiniProgress({color, label, value}: {color: string; label: string; value: string}) {
  return (
    <Box sx={{minWidth: 0}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.4}}>
        <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading}}>{label}</Typography>
        <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextMeta}}>{value}</Typography>
      </Box>
      <Box sx={{height: 5, borderRadius: 999, bgcolor: tokenNeutral.main, overflow: 'hidden'}}>
        <Box sx={{height: '100%', width: value === '7' ? '92%' : value === '4' ? '58%' : '72%', bgcolor: color}} />
      </Box>
    </Box>
  );
}

function InsightRow({children, color}: {children: string; color: string}) {
  return (
    <Box sx={{height: 28, px: 1.2, borderRadius: 1, bgcolor: tokenNeutral.main, display: 'flex', alignItems: 'center', gap: 0.8}}>
      <CameraIcon sx={{fontSize: 15, color}} />
      <Typography sx={{fontSize: 12, color: tokenBrand.dark, lineHeight: 1.1}}>{children}</Typography>
    </Box>
  );
}

function SummaryCard({bg, color, label, value}: {bg: string; color: string; label: string; value: string}) {
  return (
    <Box sx={{height: 55, bgcolor: bg, borderRadius: 0.7, px: 1.2, py: 0.8, position: 'relative', overflow: 'hidden'}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: color}} />
      <Typography sx={{fontSize: 24, lineHeight: 0.9, color, fontWeight: 400}}>{value}</Typography>
      <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, mt: 0.35}}>{label}</Typography>
    </Box>
  );
}

function FilterBox({label, wide = false}: {label: string; wide?: boolean}) {
  return (
    <Box sx={{height: 32, minWidth: wide ? 240 : 74, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 0.8, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: workstationVisuals.textSecondary, fontSize: 12, bgcolor: tokenCommon.white}}>
      {label}
      {wide ? <SearchIcon sx={{fontSize: 18, color: tokenBrand.main}} /> : <Box component="span" sx={{color: workstationVisuals.textSecondary}}>v</Box>}
    </Box>
  );
}

function SeverityBadge({value}: {value: string}) {
  if (value === '-') return <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>-</Typography>;
  const high = value === 'HIGH';
  return (
    <Box sx={{height: 16, px: 0.8, borderRadius: 999, border: `1px solid ${high ? '${tokenError.main}' : '${tokenWarning.dark}'}`, color: high ? tokenError.main : tokenError.main, fontSize: 9, fontWeight: 900, display: 'inline-flex', alignItems: 'center'}}>
      {value}
    </Box>
  );
}

export default function MyEsoExpanded({onBack}: MyEsoExpandedProps) {
  return (
    <Box sx={{height: 'calc(100vh - 176px)', minHeight: 650, bgcolor: tokenCommon.white, border: `1px solid ${tokenInfo.lightest}`, borderRadius: 1, overflow: 'hidden', display: 'grid', gridTemplateRows: '45px minmax(0, 1fr)'}}>
      <Box sx={{height: 45, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.3, borderBottom: `1px solid ${tokenNeutral.main}`}}>
        <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{fontSize: 18}} />} sx={{minWidth: 0, px: 0.2, color: tokenBrand.main, fontWeight: 900, fontSize: 16, textTransform: 'none'}}>
          ESO
        </Button>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, color: tokenBrand.main}}>
          <AutoAwesomeIcon sx={{fontSize: 17, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 17}} />
          <OpenInFullIcon sx={{fontSize: 18}} />
        </Box>
      </Box>

      <Box sx={{p: 1.45, minHeight: 0, overflow: 'auto'}}>
        <Paper elevation={0} sx={{p: 1.1, borderRadius: 1, bgcolor: tokenNeutral.lighter, mb: 1.45}}>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenBrand.main, display: 'flex', alignItems: 'center', gap: 0.35, mb: 0.9}}>
            <AutoAwesomeIcon sx={{fontSize: 16, color: tokenWarning.dark}} />
            BLU.AI Insights
          </Typography>
          <Box sx={{display: 'grid', gap: 0.7}}>
            <InsightRow color={tokenError.main}>Operator missing helmet, during maintenance procedure</InsightRow>
            <InsightRow color={tokenWarning.dark}>Cell phone use during procedure, according to history files, that is the second time.</InsightRow>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 0.8}}>
            <Button variant="contained" sx={{height: 28, borderRadius: 1, bgcolor: tokenBrand.main, fontSize: 10, fontWeight: 900, boxShadow: 'none'}}>
              X&nbsp; MORE AI INSIGHTS &gt;
            </Button>
          </Box>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1.1fr 1.15fr', gap: 1.1, mb: 1.25}}>
          <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, bgcolor: tokenNeutral.lightest}}>
            <Typography sx={{fontSize: 12, fontWeight: 900, mb: 0.9}}>Severity Distribution</Typography>
            <Typography sx={{fontSize: 10, fontWeight: 900, color: workstationVisuals.tierTextHeading, mb: 1}}>Hazards & Incidents Only</Typography>
            <MiniProgress label="High" value="7" color={tokenError.main} />
            <Box sx={{height: 8}} />
            <MiniProgress label="Medium" value="4" color={tokenWarning.main} />
            <Box sx={{height: 8}} />
            <MiniProgress label="Low" value="6" color={tokenSuccess.darker} />
          </Paper>
          <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, bgcolor: tokenNeutral.lightest}}>
            <Typography sx={{fontSize: 12, fontWeight: 900, textAlign: 'center', mb: 1}}>Completion Rate</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1.3fr 0.6fr', gap: 0.8}}>
              <Box sx={{bgcolor: tokenNeutral.lighter, borderRadius: 0.7, p: 1, borderLeft: `4px solid ${tokenInfo.light}`}}>
                <Typography sx={{fontSize: 28, lineHeight: 0.9}}>70%</Typography>
                <Typography sx={{fontSize: 12}}>Items Completed</Typography>
                <Box sx={{height: 5, borderRadius: 999, bgcolor: tokenNeutral.dark, overflow: 'hidden', mt: 1}}>
                  <Box sx={{height: '100%', width: '70%', bgcolor: tokenBrand.dark}} />
                </Box>
              </Box>
              <Box sx={{display: 'grid', gap: 0.7}}>
                <Box sx={{bgcolor: tokenNeutral.lighter, borderRadius: 0.7, p: 0.8, borderLeft: `4px solid ${tokenBrand.lighter}`}}><Typography sx={{fontSize: 20, color: tokenInfo.darkest}}>03</Typography><Typography sx={{fontSize: 10}}>Opened</Typography></Box>
                <Box sx={{bgcolor: tokenNeutral.main, borderRadius: 0.7, p: 0.8, borderLeft: `4px solid ${tokenSuccess.dark}`}}><Typography sx={{fontSize: 20, color: tokenSuccess.dark}}>07</Typography><Typography sx={{fontSize: 10}}>Closed</Typography></Box>
              </Box>
            </Box>
          </Paper>
          <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, bgcolor: tokenNeutral.lightest}}>
            <Typography sx={{fontSize: 12, fontWeight: 900, mb: 0.9}}>Type Distribution</Typography>
            <Typography sx={{fontSize: 10, fontWeight: 900, color: workstationVisuals.tierTextHeading, mb: 1}}>All Observation Types</Typography>
            <MiniProgress label="Hazard" value="7" color={tokenError.main} />
            <Box sx={{height: 8}} />
            <MiniProgress label="Incident" value="4" color={tokenWarning.main} />
            <Box sx={{height: 8}} />
            <MiniProgress label="Good Behavior" value="6" color={tokenSuccess.darker} />
          </Paper>
          <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, bgcolor: tokenNeutral.lightest}}>
            <Typography sx={{fontSize: 12, fontWeight: 900, mb: 0.9}}>Top Behaviors</Typography>
            <Typography sx={{fontSize: 10, fontWeight: 900, color: workstationVisuals.tierTextHeading, mb: 1}}>Most Frequently Reported</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8}}>
              <Box sx={{p: 1, bgcolor: tokenNeutral.lighter, borderRadius: 0.7}}><Typography sx={{fontSize: 12}}>Teamwork</Typography><Typography sx={{fontSize: 20, color: tokenWarning.dark}}>12</Typography><Box sx={{height: 4, bgcolor: tokenNeutral.dark}}><Box sx={{height: '100%', width: '62%', bgcolor: tokenWarning.dark}} /></Box></Box>
              <Box sx={{p: 1, bgcolor: tokenNeutral.lighter, borderRadius: 0.7}}><Typography sx={{fontSize: 12}}>Safety First</Typography><Typography sx={{fontSize: 20, color: tokenSuccess.dark}}>07</Typography><Box sx={{height: 4, bgcolor: tokenNeutral.dark}}><Box sx={{height: '100%', width: '55%', bgcolor: tokenSuccess.dark}} /></Box></Box>
            </Box>
          </Paper>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 0.9, mb: 1.2}}>
          {expandedKpis.map(([value, label, color, bg]) => <SummaryCard key={label} value={value} label={label} color={color} bg={bg} />)}
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, mb: 1.1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85}}>
            <Typography sx={{fontSize: 12, color: tokenBrand.main, fontWeight: 900, borderBottom: `2px solid ${tokenBrand.main}`, pb: 0.7}}>OPEN <Chip label="1" size="small" sx={{height: 18, ml: 0.4, bgcolor: tokenBrand.main, color: tokenCommon.white, fontSize: 10}} /></Typography>
            <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>CLOSED <Chip label="1" size="small" sx={{height: 18, ml: 0.4, bgcolor: tokenBrand.main, color: tokenCommon.white, fontSize: 10}} /></Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
            <FilterBox wide label="Search ID, location, description, ..." />
            <FilterBox label="Type All" />
            <FilterBox label="Zone All" />
            <FilterBox label="Risk Level All" />
          </Box>
          <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>10 total observations&nbsp; | <Box component="span" sx={{color: tokenWarning.dark}}>4 Open</Box> &nbsp;<Box component="span" sx={{color: tokenSuccess.dark}}>2 Closed</Box></Typography>
        </Box>

        <Box sx={{minWidth: 1220}}>
          <Box sx={{display: 'grid', gridTemplateColumns: '150px minmax(280px, 1.7fr) 90px 130px 84px 110px 104px 142px 92px 120px', alignItems: 'center', height: 40, px: 1, color: workstationVisuals.tierTextHeading, fontSize: 12, fontWeight: 900}}>
            {['Title', 'Description', 'Type', 'Category / Value', 'Severity', 'Location', 'Created by', 'Created date', 'Action Item', 'Assigned to'].map((head) => <Box key={head}>{head} <SortIcon sx={{fontSize: 15, verticalAlign: 'middle', color: workstationVisuals.textSecondary}} /></Box>)}
          </Box>
          {observationRows.map((row, index) => (
            <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '150px minmax(280px, 1.7fr) 90px 130px 84px 110px 104px 142px 92px 120px', minHeight: 48, alignItems: 'center', px: 1, mb: 0.55, borderRadius: 0.7, bgcolor: index % 2 ? tokenNeutral.lighter : tokenNeutral.lightest, position: 'relative', overflow: 'hidden'}}>
              <Box sx={{position: 'absolute', left: 0, top: 6, bottom: 6, width: 4, borderRadius: 999, bgcolor: index === 0 ? tokenError.dark : tokenError.main}} />
              <Typography sx={{fontSize: 12, fontWeight: 900, color: workstationVisuals.textPrimary, px: 1}}>{row[0]}</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading, lineHeight: 1.25, px: 1}}>{row[1]}</Typography>
              <Box><Chip label={row[2]} size="small" sx={{height: 17, border: `1px solid ${tokenError.main}`, color: tokenError.main, bgcolor: tokenCommon.white, fontSize: 9, fontWeight: 900}} /></Box>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>{row[3]}</Typography>
              <SeverityBadge value={row[4]} />
              <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary, lineHeight: 1.1}}>{row[5]}</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary, lineHeight: 1.1}}>{row[6]}</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary}}>{row[7]}</Typography>
              <Typography sx={{fontSize: 12, color: tokenBrand.main, textDecoration: 'underline'}}>{row[8]}</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary}}>{row[9]}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
