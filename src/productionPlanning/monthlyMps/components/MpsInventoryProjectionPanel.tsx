import {Box, Typography} from '@mui/material';
import type {MpsBucketLine, MpsDemandLine} from '../types';
import {MpsBucketStatusBadge} from './Badges';

type Props = {
  selectedProductCode: string | null;
  bucketLines: MpsBucketLine[];
  demandLines: MpsDemandLine[];
};

export default function MpsInventoryProjectionPanel({selectedProductCode, bucketLines, demandLines}: Props) {
  if (!selectedProductCode) {
    return (
      <Box sx={{textAlign: 'center', py: 8, color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 15, fontWeight: 600}}>No product selected</Typography>
        <Typography sx={{fontSize: 13, mt: 0.6}}>Select a product from the Demand Summary to view stock projection.</Typography>
      </Box>
    );
  }

  const rows = bucketLines.filter((b) => b.productCode === selectedProductCode);
  const dl = demandLines.find((d) => d.productCode === selectedProductCode);

  if (rows.length === 0) {
    return <Box sx={{py: 4, textAlign: 'center', color: 'var(--planning-text-muted)'}}><Typography>No bucket data for {selectedProductCode}.</Typography></Box>;
  }

  const {productDescription} = rows[0];

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 0.4}}>
        Inventory Projection — {selectedProductCode}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mb: 2}}>{productDescription} · {dl?.uom ?? 'Units'}</Typography>

      <Box sx={{overflowX: 'auto'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '80px 100px 110px 110px 100px 80px 80px 80px 80px 100px', minWidth: 960}}>
          {['Bucket', 'Open Stock', 'Planned Prod', 'Forecast Cons.', 'End Stock', 'Min', 'Max', 'Target', 'Cov Days', 'Status'].map((h) => (
            <Typography key={h} sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', p: '6px 8px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>{h}</Typography>
          ))}
          {rows.map((row) => {
            const endColor = row.projectedEndingStock < row.minStock ? '#B42318'
              : row.projectedEndingStock > row.maxStock ? '#B54708'
              : '#027A48';
            const rowBg = row.projectedEndingStock < row.minStock ? '#FEF3F2'
              : row.projectedEndingStock > row.maxStock ? '#FFF7E8'
              : 'transparent';
            return (
              <>
                <TC key={`${row.id}-b`} bg={rowBg} bold>{row.bucketLabel}</TC>
                <TC key={`${row.id}-os`} bg={rowBg}>{row.projectedOpeningStock.toLocaleString()}</TC>
                <TC key={`${row.id}-pp`} bg={rowBg}>{row.plannedQuantity.toLocaleString()}</TC>
                <TC key={`${row.id}-fc`} bg={rowBg}>{row.projectedDemandConsumption.toLocaleString()}</TC>
                <Box key={`${row.id}-es`} sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: rowBg}}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: endColor}}>{row.projectedEndingStock.toLocaleString()}</Typography>
                </Box>
                <TC key={`${row.id}-min`} bg={rowBg}>{row.minStock.toLocaleString()}</TC>
                <TC key={`${row.id}-max`} bg={rowBg}>{row.maxStock.toLocaleString()}</TC>
                <TC key={`${row.id}-tgt`} bg={rowBg}>{row.targetStock.toLocaleString()}</TC>
                <TC key={`${row.id}-cov`} bg={rowBg}>{row.stockCoverageDays > 0 ? `${row.stockCoverageDays}d` : '—'}</TC>
                <Box key={`${row.id}-st`} sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: rowBg, display: 'flex', alignItems: 'center'}}>
                  <MpsBucketStatusBadge status={row.status} />
                </Box>
              </>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function TC({children, bg, bold}: {children: React.ReactNode; bg: string; bold?: boolean}) {
  return (
    <Box sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: bg}}>
      <Typography sx={{fontSize: 12, fontWeight: bold ? 700 : 400, color: 'var(--planning-text-secondary)'}}>{String(children)}</Typography>
    </Box>
  );
}
