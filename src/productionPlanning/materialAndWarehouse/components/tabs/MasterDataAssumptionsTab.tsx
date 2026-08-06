import React, {useState} from 'react';
import {Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockMasterData} from '../../mocks';
import {ApprovalStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
}

const CATEGORIES = ['All', 'Safety Stock', 'Scrap Factor', 'Material-to-PCN Mapping', 'Supplier Data', 'Conversion Rules'] as const;
type Category = typeof CATEGORIES[number];

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function MasterDataAssumptionsTab({onAction}: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const rows = activeCategory === 'All'
    ? mockMasterData
    : mockMasterData.filter((r) => r.category === activeCategory);

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Master Data & Assumptions — {rows.length} Records
        </Typography>
        <Button size="small" variant="outlined" onClick={() => onAction('Mock change request submitted.')}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700, borderRadius: 1.5}}>
          + Request Change
        </Button>
      </Box>

      <Box sx={{display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap'}}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            size="small"
            onClick={() => setActiveCategory(cat)}
            sx={{
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              bgcolor: activeCategory === cat ? '#7C3AED' : '#F8FAFC',
              color: activeCategory === cat ? '#FFFFFF' : '#475467',
              border: activeCategory === cat ? '1px solid #7C3AED' : '1px solid #D0D5DD',
              borderRadius: 1.5,
              '&:hover': {bgcolor: activeCategory === cat ? '#5B21B6' : '#F5F3FF'},
            }}
          />
        ))}
      </Box>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Category', 'Key', 'Description', 'Current Value', 'Previous Value', 'Effective From', 'Effective To', 'Owner', 'Approval', 'Last Changed', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                    No records for this category.
                  </TableCell>
                </TableRow>
              ) : rows.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={tdSx}>{r.category}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.key}</TableCell>
                  <TableCell sx={tdSx}>{r.description}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{r.currentValue}</TableCell>
                  <TableCell sx={{...tdSx, color: 'var(--planning-text-muted)', textDecoration: 'line-through'}}>{r.previousValue}</TableCell>
                  <TableCell sx={tdSx}>{r.effectiveFrom}</TableCell>
                  <TableCell sx={{...tdSx, color: 'var(--planning-text-muted)'}}>{r.effectiveTo ?? 'Ongoing'}</TableCell>
                  <TableCell sx={tdSx}>{r.owner}</TableCell>
                  <TableCell sx={tdSx}><ApprovalStatusBadge status={r.approvalStatus} /></TableCell>
                  <TableCell sx={tdSx}>{r.lastChanged}</TableCell>
                  <TableCell sx={{...tdSx, minWidth: 200}}>
                    <Box sx={{display: 'flex', gap: 0.5}}>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock change request submitted.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Request Change</Button>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock history view opened.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>History</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
