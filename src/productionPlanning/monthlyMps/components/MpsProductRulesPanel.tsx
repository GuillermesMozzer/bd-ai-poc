import {Box, Stack, Typography} from '@mui/material';
import type {ProductLineCapability, ProductPlanningRule, ProductionLine} from '../types';

type Props = {
  selectedProductCode: string | null;
  planningRules: ProductPlanningRule[];
  capabilities: ProductLineCapability[];
  productionLines: ProductionLine[];
};

export default function MpsProductRulesPanel({selectedProductCode, planningRules, capabilities, productionLines}: Props) {
  if (!selectedProductCode) {
    return (
      <Box sx={{textAlign: 'center', py: 8, color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 15, fontWeight: 600}}>No product selected</Typography>
        <Typography sx={{fontSize: 13, mt: 0.6}}>Select a product from the Demand Summary to view its planning rules.</Typography>
      </Box>
    );
  }

  const rule = planningRules.find((r) => r.productCode === selectedProductCode);
  const caps = capabilities.filter((c) => c.productCode === selectedProductCode && c.active);
  const lineMap = new Map(productionLines.map((l) => [l.id, l.name]));

  if (!rule) {
    return (
      <Box sx={{py: 4, textAlign: 'center', color: 'var(--planning-text-muted)'}}>
        <Typography>No planning rule found for {selectedProductCode}.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 2}}>
        Product Planning Rules — {selectedProductCode}
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
        {/* Lot sizes */}
        <RuleCard title="Lot Sizes">
          <RuleRow label="Min Lot Size" value={rule.minLotSize.toLocaleString()} />
          <RuleRow label="Max Lot Size" value={rule.maxLotSize.toLocaleString()} />
          <RuleRow label="Preferred Lot Size" value={rule.preferredLotSize.toLocaleString()} />
        </RuleCard>

        {/* Stock policy */}
        <RuleCard title="Stock Policy">
          <RuleRow label="Min Stock" value={rule.stockMin.toLocaleString()} />
          <RuleRow label="Max Stock" value={rule.stockMax.toLocaleString()} />
          <RuleRow label="Target Stock" value={rule.stockTarget.toLocaleString()} />
          {rule.shelfLifeDays && <RuleRow label="Shelf Life" value={`${rule.shelfLifeDays} days`} />}
        </RuleCard>

        {/* Lines */}
        <RuleCard title="Production Lines">
          <RuleRow label="Eligible Lines" value={rule.eligibleLineIds.length > 0 ? rule.eligibleLineIds.map((id) => lineMap.get(id) ?? id).join(', ') : 'None'} alert={rule.eligibleLineIds.length === 0} />
          {rule.preferredLineId && <RuleRow label="Preferred Line" value={lineMap.get(rule.preferredLineId) ?? rule.preferredLineId} />}
        </RuleCard>

        {/* Attributes */}
        <RuleCard title="Attributes">
          {rule.campaignGroup && <RuleRow label="Campaign Group" value={rule.campaignGroup} />}
          {rule.changeoverFamily && <RuleRow label="Changeover Family" value={rule.changeoverFamily} />}
          {rule.notes && <RuleRow label="Notes" value={rule.notes} />}
        </RuleCard>
      </Stack>

      {/* Capability table */}
      <Box sx={{mt: 3}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: 'var(--planning-text-primary)', mb: 1}}>Production Rate by Line</Typography>
        {caps.length === 0 ? (
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>No active capabilities defined.</Typography>
        ) : (
          <Box sx={{display: 'grid', gridTemplateColumns: '120px 130px 100px 100px 100px', maxWidth: 580}}>
            {['Line', 'Rate (units/hr)', 'Min Lot', 'Max Lot', 'Pref Lot'].map((h) => (
              <Typography key={h} sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', p: '6px 8px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>{h}</Typography>
            ))}
            {caps.map((c) => {
              const noRate = c.productionRateUnitsPerHour === null;
              return (
                <>
                  <TC key={`${c.lineId}-n`}>{lineMap.get(c.lineId) ?? c.lineId}</TC>
                  <Box key={`${c.lineId}-r`} sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 12, fontWeight: noRate ? 700 : 400, color: noRate ? '#B42318' : '#475467'}}>
                      {noRate ? 'MISSING' : c.productionRateUnitsPerHour}
                    </Typography>
                  </Box>
                  <TC key={`${c.lineId}-min`}>{c.minLotSize.toLocaleString()}</TC>
                  <TC key={`${c.lineId}-max`}>{c.maxLotSize.toLocaleString()}</TC>
                  <TC key={`${c.lineId}-pref`}>{c.preferredLotSize.toLocaleString()}</TC>
                </>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function RuleCard({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Box sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, p: 1.6, minWidth: 200}}>
      <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>{title}</Typography>
      <Stack spacing={0.8}>{children}</Stack>
    </Box>
  );
}

function RuleRow({label, value, alert}: {label: string; value: string; alert?: boolean}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
      <Typography sx={{fontSize: 12, fontWeight: 600, color: alert ? '#B42318' : '#1E293B', textAlign: 'right'}}>{value}</Typography>
    </Stack>
  );
}

function TC({children}: {children: React.ReactNode}) {
  return (
    <Box sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)'}}>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{String(children)}</Typography>
    </Box>
  );
}
