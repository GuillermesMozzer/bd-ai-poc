import {Box, LinearProgress, Stack, Typography} from '@mui/material';
import type {MpsDemandLine} from '../types';
import {MpsDemandStatusBadge} from './Badges';

type Props = {
  demandLines: MpsDemandLine[];
  selectedProductCode: string | null;
  onSelectProduct: (code: string | null) => void;
};

const priorityColor: Record<string, string> = {
  Critical: '#B42318',
  High: '#B54708',
  Medium: '#0369A1',
  Low: '#475467',
};

const riskColor: Record<string, string> = {
  High: '#B42318',
  Medium: '#B54708',
  Low: '#027A48',
};

export default function MpsDemandSummary({demandLines, selectedProductCode, onSelectProduct}: Props) {
  return (
    <Box sx={{mb: 2}}>
      <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1}}>
        Demand Summary
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mb: 1.1}}>
        Click a product to focus the planning grid on that SKU.
      </Typography>
      <Box sx={{overflowX: 'auto', border: '1px solid #D8DEE8', borderRadius: 2.8, bgcolor: 'var(--planning-surface)', boxShadow: '0 8px 24px rgba(15,23,42,0.04)'}}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 100px 120px 130px 80px 80px 80px 110px',
            minWidth: 900,
          }}
        >
          {['Product', 'Description', 'Monthly Demand', 'Planned', 'Remaining', 'UOM', 'Priority', 'Risk', 'Status'].map((h) => (
            <Typography key={h} sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', p: '8px 10px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>
              {h}
            </Typography>
          ))}

          {demandLines.map((dl) => {
            const pct = dl.approvedMonthlyDemand > 0
              ? Math.min(100, (dl.alreadyPlannedQuantity / dl.approvedMonthlyDemand) * 100)
              : 0;
            const isSelected = selectedProductCode === dl.productCode;
            const isOver = dl.remainingQuantityToPlan < 0;

            return (
              <Box
                key={dl.id}
                component="button"
                onClick={() => onSelectProduct(isSelected ? null : dl.productCode)}
                sx={{
                  display: 'contents',
                  cursor: 'pointer',
                }}
              >
                <CellBox selected={isSelected} first>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{dl.productCode}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{dl.productDescription}</Typography>
                  <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)'}}>{dl.productFamily}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, fontWeight: 600, color: 'var(--planning-text-primary)'}}>{dl.approvedMonthlyDemand.toLocaleString()}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Stack spacing={0.4}>
                    <Typography sx={{fontSize: 12, fontWeight: 600, color: 'var(--planning-text-primary)'}}>{dl.alreadyPlannedQuantity.toLocaleString()}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{height: 5, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': {bgcolor: isOver ? '#B42318' : '#6D28D9'}}}
                    />
                  </Stack>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, fontWeight: 600, color: isOver ? '#B42318' : '#475467'}}>
                    {dl.remainingQuantityToPlan < 0 ? `+${Math.abs(dl.remainingQuantityToPlan).toLocaleString()} over` : dl.remainingQuantityToPlan.toLocaleString()}
                  </Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{dl.uom}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: priorityColor[dl.priority] ?? '#475467'}}>{dl.priority}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: riskColor[dl.riskLevel] ?? '#475467'}}>{dl.riskLevel}</Typography>
                </CellBox>
                <CellBox selected={isSelected}>
                  <MpsDemandStatusBadge status={dl.status} />
                </CellBox>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function CellBox({children, selected, first}: {children: React.ReactNode; selected: boolean; first?: boolean}) {
  return (
    <Box sx={{
      p: '8px 10px',
      borderBottom: '1px solid var(--planning-border)',
      borderLeft: first ? (selected ? '3px solid #6D28D9' : '3px solid transparent') : 'none',
      bgcolor: selected ? '#F5F3FF' : '#FFFFFF',
      transition: 'background-color 0.15s',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 48,
      cursor: 'pointer',
      '&:hover': {bgcolor: selected ? '#EDE9FE' : '#F8FAFC'},
    }}>
      {children}
    </Box>
  );
}
