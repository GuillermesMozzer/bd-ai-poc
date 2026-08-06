import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {type ReactNode, useEffect, useMemo, useState} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from '@mui/material';
import {
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
  RemoveCircle as RemoveCircleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

type TierKpiCustomizeDialogProps = {
  domain: string | null;
  open: boolean;
  allKpis: string[];
  shownKpis: string[];
  onApply: (nextShownKpis: string[]) => void;
  onClose: () => void;
};

export default function TierKpiCustomizeDialog({
  allKpis,
  domain,
  onApply,
  onClose,
  open,
  shownKpis,
}: TierKpiCustomizeDialogProps) {
  const [draftShownKpis, setDraftShownKpis] = useState<string[]>(shownKpis);
  const [hiddenSearch, setHiddenSearch] = useState('');
  const [shownSearch, setShownSearch] = useState('');

  useEffect(() => {
    if (open) {
      setDraftShownKpis(shownKpis);
      setHiddenSearch('');
      setShownSearch('');
    }
  }, [open, shownKpis]);

  const hiddenKpis = useMemo(
    () => allKpis.filter((kpi) => !draftShownKpis.includes(kpi)),
    [allKpis, draftShownKpis],
  );

  const filteredHiddenKpis = useMemo(
    () => hiddenKpis.filter((kpi) => kpi.toLowerCase().includes(hiddenSearch.trim().toLowerCase())),
    [hiddenKpis, hiddenSearch],
  );

  const filteredShownKpis = useMemo(
    () => draftShownKpis.filter((kpi) => kpi.toLowerCase().includes(shownSearch.trim().toLowerCase())),
    [draftShownKpis, shownSearch],
  );

  const addKpi = (kpi: string) => {
    setDraftShownKpis((current) => current.includes(kpi) ? current : [...current, kpi]);
  };

  const removeKpi = (kpi: string) => {
    setDraftShownKpis((current) => current.filter((item) => item !== kpi));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{zIndex: 1700}}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: tokenCommon.white,
          boxShadow: '0 24px 72px rgba(15, 23, 42, 0.28)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{px: 2.5, pt: 2.3, pb: 1.3}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2}}>
          <Box>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.textPrimary}}>
              {domain ?? 'Dashboard'} <Box component="span" sx={{fontWeight: 500}}>&gt; Customize</Box>
            </Typography>
            <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, mt: 1.3}}>
              Select a widget to add or remove it from your current dashboard
            </Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <Box sx={{textAlign: 'right'}}>
              <Typography sx={{fontSize: 10, fontWeight: 800, color: tokenNeutral.darkest, textTransform: 'uppercase'}}>
                Latest Updated:
              </Typography>
              <Typography sx={{fontSize: 10, fontWeight: 900, color: workstationVisuals.textPrimary}}>18/Mar/25</Typography>
            </Box>
            <IconButton aria-label="Close customize modal" onClick={onClose} size="small" sx={{color: tokenBrand.main}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{px: 2.5, py: 1.1}}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) 72px minmax(0, 1fr)'},
            gap: 1.4,
            minHeight: {xs: 'auto', md: 420},
          }}
        >
          <KpiListPanel
            emptyLabel="No hidden KPIs"
            icon={<VisibilityOffIcon sx={{fontSize: 15, color: workstationVisuals.textMuted}} />}
            items={filteredHiddenKpis}
            onItemAction={addKpi}
            search={hiddenSearch}
            setSearch={setHiddenSearch}
            title="Hidden"
            actionIcon="add"
          />
          <Box sx={{display: 'flex', flexDirection: {xs: 'row', md: 'column'}, alignItems: 'center', justifyContent: 'center', gap: 1}}>
            <Button
              disabled={!hiddenKpis.length}
              onClick={() => setDraftShownKpis(allKpis)}
              endIcon={<AddCircleIcon sx={{fontSize: 15}} />}
              sx={transferButtonSx}
            >
              Add
            </Button>
            <Button
              disabled={!draftShownKpis.length}
              onClick={() => setDraftShownKpis([])}
              startIcon={<RemoveCircleIcon sx={{fontSize: 15}} />}
              sx={transferButtonSx}
            >
              Remove
            </Button>
          </Box>
          <KpiListPanel
            emptyLabel="No visible KPIs"
            icon={<VisibilityIcon sx={{fontSize: 15, color: workstationVisuals.textMuted}} />}
            items={filteredShownKpis}
            onItemAction={removeKpi}
            search={shownSearch}
            setSearch={setShownSearch}
            title="Shown"
            actionIcon="remove"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{px: 2.5, py: 2, borderTop: `1px solid ${tokenNeutral.lighter}`}}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{height: 34, px: 2.2, borderRadius: 2, fontSize: 12, fontWeight: 900, color: tokenBrand.main, borderColor: tokenInfo.lightest}}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onApply(draftShownKpis)}
          sx={{height: 36, px: 2.5, borderRadius: 2, fontSize: 12, fontWeight: 900, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.main, boxShadow: 'none'}}}
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function KpiListPanel({
  actionIcon,
  emptyLabel,
  icon,
  items,
  onItemAction,
  search,
  setSearch,
  title,
}: {
  actionIcon: 'add' | 'remove';
  emptyLabel: string;
  icon: ReactNode;
  items: string[];
  onItemAction: (item: string) => void;
  search: string;
  setSearch: (value: string) => void;
  title: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.2,
        borderRadius: 1.4,
        border: `1px solid ${tokenNeutral.main}`,
        bgcolor: tokenNeutral.lightest,
        minHeight: 420,
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: 1,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{title}</Typography>
        {icon}
      </Box>
      <Paper
        elevation={0}
        sx={{
          height: 26,
          px: 0.9,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          border: `1px solid ${tokenNeutral.dark}`,
          borderRadius: 1,
          bgcolor: tokenCommon.white,
        }}
      >
        <SearchIcon sx={{fontSize: 15, color: tokenNeutral.darkest}} />
        <InputBase
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          sx={{flex: 1, fontSize: 11.5, color: workstationVisuals.tierTextHeading}}
        />
      </Paper>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.65, overflowY: 'auto', pr: 0.3}}>
        {items.length ? items.map((item) => (
          <Paper
            key={item}
            elevation={0}
            sx={{
              minHeight: 33,
              px: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              borderRadius: 0.8,
              border: `1px solid ${tokenNeutral.main}`,
              bgcolor: tokenNeutral.lighter,
              color: workstationVisuals.tierTextHeading,
            }}
          >
            <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading}}>{item}</Typography>
            <IconButton
              aria-label={`${actionIcon === 'add' ? 'Add' : 'Remove'} ${item}`}
              onClick={() => onItemAction(item)}
              size="small"
              sx={{width: 22, height: 22, color: tokenBrand.main}}
            >
              {actionIcon === 'add' ? <AddCircleIcon sx={{fontSize: 16}} /> : <RemoveCircleIcon sx={{fontSize: 16}} />}
            </IconButton>
          </Paper>
        )) : (
          <Box sx={{height: '100%', minHeight: 130, display: 'grid', placeItems: 'center', color: tokenNeutral.darkest, fontSize: 13, fontWeight: 800}}>
            {emptyLabel}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

const transferButtonSx = {
  minWidth: 70,
  height: 30,
  px: 1.4,
  borderRadius: 999,
  bgcolor: tokenNeutral.main,
  color: workstationVisuals.tierTextMeta,
  fontSize: 11,
  fontWeight: 900,
  textTransform: 'uppercase',
  boxShadow: 'none',
  '&:hover': {bgcolor: tokenNeutral.dark, boxShadow: 'none'},
  '&.Mui-disabled': {bgcolor: tokenNeutral.lighter, color: tokenNeutral.darker},
} as const;
