import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowLeft,
  GripVertical,
  Mail,
  MessageSquare,
  Phone,
  Truck as TruckIcon,
  X,
} from 'lucide-react';
import {
  ctV2Type,
  tokenBrand,
  tokenError,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../ctV2Theme';
import {
  demandDueStatusLabel,
  productTypeLabel,
  transportModeLabel,
  type FleetLane,
  type LiveTruck,
} from './fleetSimulation';
import type { BdPlantSite } from './bdPlantSites';
import {
  getPlantProfile,
  plantKindLabel,
  type PlantDemand,
  type PlantDemandKind,
  type PlantDemandPriority,
  type PlantDemandWorkflowStatus,
  type PlantProfile,
} from './plantProfiles';
import type { DemandDueStatus, ProductType, TransportMode } from './fleetSimulation';

const DRAG_HANDLE = 'ct-v2-plant-detail-drag';

type PlantDetailWidgetProps = {
  plant: BdPlantSite;
  relatedTrucks: LiveTruck[];
  onClose: () => void;
  onSelectTruck: (truckId: string) => void;
  onContact: (channel: 'call' | 'message' | 'email', plant: BdPlantSite, profile: PlantProfile) => void;
  containerRef: React.RefObject<HTMLElement | null>;
  modeFilter?: 'all' | TransportMode;
  productFilter?: 'all' | ProductType;
  demandStatusFilter?: 'all' | DemandDueStatus;
};

type TabKey = 'summary' | 'plant' | 'contact' | 'demands';

function priorityColor(p: PlantDemandPriority) {
  if (p === 'high') return tokenError.main;
  if (p === 'medium') return tokenWarning.main;
  return tokenSuccess.main;
}

function statusLabel(s: PlantDemandWorkflowStatus) {
  if (s === 'in_progress') return 'In progress';
  if (s === 'scheduled') return 'Scheduled';
  if (s === 'blocked') return 'Blocked';
  return 'Open';
}

function kindLabel(k: PlantDemandKind) {
  if (k === 'inbound') return 'Inbound';
  if (k === 'outbound') return 'Outbound';
  if (k === 'transfer') return 'Transfer';
  if (k === 'expedite') return 'Expedite';
  return 'Replenishment';
}

function laneLabel(lane: FleetLane) {
  if (lane === 'inbound') return 'Inbound';
  if (lane === 'outbound') return 'Outbound';
  return 'Transfer';
}

function plantRoleForTruck(plantId: string, truck: LiveTruck): 'inbound' | 'outbound' | 'transfer' {
  if (truck.lane === 'transfer') return 'transfer';
  if (truck.destination.id === plantId) return 'inbound';
  if (truck.origin.id === plantId) return 'outbound';
  return truck.lane;
}

/**
 * Floating, draggable & resizable plant inspector — mirrors TruckDetailWidget.
 */
export function PlantDetailWidget({
  plant,
  relatedTrucks,
  onClose,
  onSelectTruck,
  onContact,
  containerRef,
  modeFilter = 'all',
  productFilter = 'all',
  demandStatusFilter = 'all',
}: PlantDetailWidgetProps) {
  const profile = useMemo(() => getPlantProfile(plant.id), [plant.id]);
  const filteredDemands = useMemo(() => {
    if (!profile) return [] as PlantDemand[];
    return profile.demands.filter((d) => {
      if (modeFilter !== 'all' && d.mode !== modeFilter) return false;
      if (productFilter !== 'all' && d.productType !== productFilter) return false;
      if (demandStatusFilter !== 'all' && d.dueStatus !== demandStatusFilter) return false;
      return true;
    });
  }, [profile, modeFilter, productFilter, demandStatusFilter]);
  const [tab, setTab] = useState<TabKey>('summary');
  const [demandId, setDemandId] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ w: 400, h: 560 });
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ ox: number; oy: number; sw: number; sh: number } | null>(null);

  useEffect(() => {
    setTab('summary');
    setDemandId(null);
    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPos({
      x: Math.max(16, rect.width - 424),
      y: 16,
    });
    setSize({ w: 400, h: Math.min(600, Math.max(460, rect.height - 40)) });
  }, [plant.id, containerRef]);

  const clamp = useCallback(() => {
    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPos((p) => ({
      x: Math.min(Math.max(8, p.x), Math.max(8, rect.width - 120)),
      y: Math.min(Math.max(8, p.y), Math.max(8, rect.height - 80)),
    }));
    setSize((s) => ({
      w: Math.min(Math.max(320, s.w), Math.max(320, rect.width - 16)),
      h: Math.min(Math.max(400, s.h), Math.max(400, rect.height - 16)),
    }));
  }, [containerRef]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) {
        const d = dragRef.current;
        setPos({ x: d.sx + (e.clientX - d.ox), y: d.sy + (e.clientY - d.oy) });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        setSize({
          w: Math.max(320, r.sw + (e.clientX - r.ox)),
          h: Math.max(400, r.sh + (e.clientY - r.oy)),
        });
      }
    };
    const onUp = () => {
      if (dragRef.current || resizeRef.current) clamp();
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [clamp]);

  const startDrag = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest(`.${DRAG_HANDLE}`)) return;
    e.preventDefault();
    dragRef.current = { ox: e.clientX, oy: e.clientY, sx: pos.x, sy: pos.y };
  };

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { ox: e.clientX, oy: e.clientY, sw: size.w, sh: size.h };
  };

  if (!profile) return null;

  const selectedDemand = demandId
    ? filteredDemands.find((d) => d.id === demandId) ?? profile.demands.find((d) => d.id === demandId) ?? null
    : null;

  const inbound = relatedTrucks.filter((t) => plantRoleForTruck(plant.id, t) === 'inbound');
  const outbound = relatedTrucks.filter((t) => plantRoleForTruck(plant.id, t) === 'outbound');
  const transfer = relatedTrucks.filter((t) => plantRoleForTruck(plant.id, t) === 'transfer');

  return (
    <Box
      onPointerDown={startDrag}
      sx={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex: 620,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.4,
        bgcolor: 'background.paper',
        border: '1px solid var(--paper-border-color)',
        boxShadow: 'var(--paper-shadow)',
        overflow: 'hidden',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      <Box
        className={DRAG_HANDLE}
        sx={{
          px: 1.5,
          py: 1.15,
          cursor: 'grab',
          background: `linear-gradient(120deg, ${tokenBrand.softBg}, transparent)`,
          borderBottom: '1px solid var(--paper-border-color)',
          '&:active': { cursor: 'grabbing' },
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <GripVertical size={14} color={tokenText.secondary as string} aria-hidden />
              <Typography sx={{ ...ctV2Type.eyebrow, color: tokenBrand.main }}>PLANT · WIDGET</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 850, fontSize: 17, mt: 0.2 }} noWrap>
              {plant.shortName}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }} noWrap>
              {plant.city} · {plantKindLabel(plant.kind)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close plant details" sx={{ mt: -0.25 }}>
            <X size={16} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
          <Chip size="small" label={plant.country} sx={{ fontWeight: 800 }} />
          <Chip
            size="small"
            label={`${filteredDemands.length} demands`}
            sx={{ fontWeight: 800, bgcolor: tokenBrand.softBg, color: tokenBrand.main }}
          />
          <Chip
            size="small"
            label={`${relatedTrucks.length} live assets`}
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, next: TabKey) => {
          setTab(next);
          if (next !== 'demands') setDemandId(null);
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          flexShrink: 0,
          borderBottom: '1px solid var(--paper-border-color)',
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 800,
            fontSize: 12,
            fontFamily: workstationVisuals.fontFamily,
            minWidth: 0,
            px: 1.25,
          },
        }}
      >
        <Tab value="summary" label="Summary" />
        <Tab value="plant" label="Plant" />
        <Tab value="contact" label="Contact" />
        <Tab value="demands" label="Demands" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1.5 }}>
        {tab === 'summary' ? (
          <SummaryTab
            plant={plant}
            profile={profile}
            demands={filteredDemands}
            inbound={inbound}
            outbound={outbound}
            transfer={transfer}
            onSelectTruck={onSelectTruck}
            onOpenDemands={() => setTab('demands')}
          />
        ) : null}
        {tab === 'plant' ? <PlantTab plant={plant} profile={profile} /> : null}
        {tab === 'contact' ? (
          <ContactTab
            profile={profile}
            onContact={(channel) => onContact(channel, plant, profile)}
          />
        ) : null}
        {tab === 'demands' ? (
          selectedDemand ? (
            <DemandDetail demand={selectedDemand} onBack={() => setDemandId(null)} />
          ) : (
            <DemandsList demands={filteredDemands} onOpen={(id) => setDemandId(id)} />
          )
        ) : null}
      </Box>

      <Box
        onPointerDown={startResize}
        aria-label="Resize widget"
        title="Drag to resize"
        sx={{
          position: 'absolute',
          right: 2,
          bottom: 2,
          width: 16,
          height: 16,
          cursor: 'nwse-resize',
          zIndex: 2,
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 3,
            bottom: 3,
            width: 8,
            height: 8,
            borderRight: `2px solid ${tokenBrand.main}`,
            borderBottom: `2px solid ${tokenBrand.main}`,
            opacity: 0.7,
          },
        }}
      />
    </Box>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 10, fontWeight: 800, color: tokenText.secondary, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokenText.primary }}>{value}</Typography>
    </Box>
  );
}

function SummaryTab({
  plant,
  profile,
  demands,
  inbound,
  outbound,
  transfer,
  onSelectTruck,
  onOpenDemands,
}: {
  plant: BdPlantSite;
  profile: PlantProfile;
  demands: PlantDemand[];
  inbound: LiveTruck[];
  outbound: LiveTruck[];
  transfer: LiveTruck[];
  onSelectTruck: (id: string) => void;
  onOpenDemands: () => void;
}) {
  const openDemands = demands.filter((d) => d.status !== 'scheduled').length;

  return (
    <Stack spacing={1.35}>
      <Typography sx={{ fontSize: 13, color: tokenText.secondary, lineHeight: 1.45 }}>
        {plant.focus}. Live multi-modal network activity for this site — inbound, outbound, and transfer moves plus open demands.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.85,
        }}
      >
        {[
          { l: 'Inbound', v: inbound.length },
          { l: 'Outbound', v: outbound.length },
          { l: 'Transfer', v: transfer.length },
          { l: 'Open demands', v: openDemands },
        ].map((kpi) => (
          <Box
            key={kpi.l}
            sx={{
              p: 1,
              borderRadius: 1.8,
              bgcolor: 'var(--surface-subtle-bg)',
              border: '1px solid var(--paper-border-color)',
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: tokenText.secondary, textTransform: 'uppercase' }}>
              {kpi.l}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 850, lineHeight: 1.15 }}>{kpi.v}</Typography>
          </Box>
        ))}
      </Box>

      <Meta label="Site" value={plant.name} />
      <Meta label="Address" value={plant.address} />
      <Meta label="Docks / shifts" value={`${profile.docks} docks · ${profile.shifts}`} />

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 11, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase' }}>
          Live assets at this plant
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: tokenBrand.main }}>
          {inbound.length + outbound.length + transfer.length} active
        </Typography>
      </Stack>

      <TruckGroup title="Inbound" trucks={inbound} plantId={plant.id} onSelectTruck={onSelectTruck} />
      <TruckGroup title="Outbound" trucks={outbound} plantId={plant.id} onSelectTruck={onSelectTruck} />
      <TruckGroup title="Transfer" trucks={transfer} plantId={plant.id} onSelectTruck={onSelectTruck} />

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 11, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase' }}>
          Demands snapshot
        </Typography>
        <Button size="small" onClick={onOpenDemands} sx={{ textTransform: 'none', fontWeight: 800 }}>
          View all
        </Button>
      </Stack>
      <Stack spacing={0.75}>
        {demands.slice(0, 3).map((d) => (
          <Box
            key={d.id}
            sx={{
              p: 1,
              borderRadius: 1.8,
              border: '1px solid var(--paper-border-color)',
              bgcolor: 'var(--surface-subtle-bg)',
            }}
          >
            <Stack direction="row" spacing={0.6} alignItems="center" useFlexGap flexWrap="wrap">
              <Chip size="small" label={kindLabel(d.kind)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
              <Chip size="small" label={transportModeLabel(d.mode)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
              <Chip size="small" label={productTypeLabel(d.productType)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
              <Chip
                size="small"
                label={demandDueStatusLabel(d.dueStatus)}
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 800,
                  bgcolor: `${priorityColor(d.priority)}22`,
                  color: priorityColor(d.priority),
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: 13, fontWeight: 750, mt: 0.45 }}>{d.title}</Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
              {d.dueLabel} · {d.cases} cases
            </Typography>
          </Box>
        ))}
        {demands.length === 0 ? (
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
            No demands match the current filters.
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

function TruckGroup({
  title,
  trucks,
  plantId,
  onSelectTruck,
}: {
  title: string;
  trucks: LiveTruck[];
  plantId: string;
  onSelectTruck: (id: string) => void;
}) {
  if (trucks.length === 0) {
    return (
      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
        {title}: none right now
      </Typography>
    );
  }
  return (
    <Stack spacing={0.65}>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: tokenText.secondary }}>{title}</Typography>
      {trucks.map((truck) => {
        const other = truck.origin.id === plantId ? truck.destination.shortName : truck.origin.shortName;
        return (
          <Box
            key={truck.id}
            component="button"
            type="button"
            onClick={() => onSelectTruck(truck.id)}
            sx={{
              textAlign: 'left',
              border: '1px solid var(--paper-border-color)',
              bgcolor: 'background.paper',
              borderRadius: 1.8,
              p: 1,
              cursor: 'pointer',
              font: 'inherit',
              '&:hover': { borderColor: tokenBrand.light },
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <TruckIcon size={14} color={tokenBrand.main as string} />
              <Typography sx={{ fontWeight: 850, fontSize: 12 }}>{truck.id}</Typography>
              <Chip size="small" label={transportModeLabel(truck.mode)} sx={{ height: 18, fontSize: 9, fontWeight: 800 }} />
              <Chip size="small" label={laneLabel(truck.lane)} sx={{ height: 18, fontSize: 9, fontWeight: 800 }} />
            </Stack>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.3 }}>
              ↔ {other} · {productTypeLabel(truck.productType)} · {truck.cargo} · ETA {truck.etaLabel}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

function PlantTab({ plant, profile }: { plant: BdPlantSite; profile: PlantProfile }) {
  return (
    <Stack spacing={1.25}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.75,
        }}
      >
        {profile.facadePhotoUrls.map((src, i) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt={`${plant.shortName} facade ${i + 1}`}
            sx={{
              width: '100%',
              height: i === 0 ? 140 : 100,
              gridColumn: i === 0 ? '1 / -1' : undefined,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid var(--paper-border-color)',
              bgcolor: 'var(--surface-subtle-bg)',
            }}
          />
        ))}
      </Box>
      <Box
        component="img"
        src={profile.interiorPhotoUrl}
        alt={`${plant.shortName} interior`}
        sx={{
          width: '100%',
          height: 110,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid var(--paper-border-color)',
        }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
        <Meta label="Type" value={plantKindLabel(plant.kind)} />
        <Meta label="Country" value={plant.country} />
        <Meta label="Employees" value={String(profile.employees)} />
        <Meta label="Floor area" value={`${profile.floorSqm.toLocaleString()} m²`} />
        <Meta label="Docks" value={String(profile.docks)} />
        <Meta label="Shifts" value={profile.shifts} />
        <Meta label="Timezone" value={profile.timezone} />
        <Meta label="Plant manager" value={profile.plantManager} />
      </Box>
      <Meta label="Address" value={plant.address} />
      <Meta label="Focus" value={plant.focus} />
      <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
        {profile.certifications.map((c) => (
          <Chip key={c} size="small" label={c} sx={{ fontWeight: 800 }} />
        ))}
      </Stack>
    </Stack>
  );
}

function ContactTab({
  profile,
  onContact,
}: {
  profile: PlantProfile;
  onContact: (channel: 'call' | 'message' | 'email') => void;
}) {
  const c = profile.contact;
  return (
    <Stack spacing={1.35}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          component="img"
          src={c.photoUrl}
          alt={c.name}
          sx={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${tokenBrand.light}`,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 850, fontSize: 16 }}>{c.name}</Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{c.role}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: tokenBrand.main, mt: 0.35 }}>
            {c.shift}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
        <Meta label="Desk" value={c.phone} />
        <Meta label="Mobile" value={c.mobile} />
      </Box>
      <Meta label="Email" value={c.email} />

      <Divider />

      <Stack spacing={1}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Phone size={14} />}
          onClick={() => onContact('call')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Call
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MessageSquare size={14} />}
          onClick={() => onContact('message')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Send message
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Mail size={14} />}
          onClick={() => onContact('email')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Send email
        </Button>
      </Stack>
    </Stack>
  );
}

function DemandsList({
  demands,
  onOpen,
}: {
  demands: PlantDemand[];
  onOpen: (id: string) => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ fontSize: 11, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase' }}>
        All plant demands
      </Typography>
      {demands.length === 0 ? (
        <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
          No demands match the current filters.
        </Typography>
      ) : null}
      {demands.map((d) => (
        <Box
          key={d.id}
          component="button"
          type="button"
          onClick={() => onOpen(d.id)}
          sx={{
            textAlign: 'left',
            border: '1px solid var(--paper-border-color)',
            bgcolor: 'var(--surface-subtle-bg)',
            borderRadius: 2,
            p: 1.15,
            cursor: 'pointer',
            font: 'inherit',
            '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
          }}
        >
          <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Chip size="small" label={kindLabel(d.kind)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
            <Chip size="small" label={transportModeLabel(d.mode)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
            <Chip size="small" label={productTypeLabel(d.productType)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
            <Chip
              size="small"
              label={demandDueStatusLabel(d.dueStatus)}
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 800,
                bgcolor: `${priorityColor(d.priority)}22`,
                color: priorityColor(d.priority),
              }}
            />
            <Chip size="small" label={statusLabel(d.status)} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
          </Stack>
          <Typography sx={{ fontWeight: 850, fontSize: 13 }}>{d.title}</Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
            {d.lanePartner} · {d.cases} cases · {d.skuCount} SKUs · {d.dueLabel}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function DemandDetail({ demand, onBack }: { demand: PlantDemand; onBack: () => void }) {
  return (
    <Stack spacing={1.25}>
      <Button
        size="small"
        startIcon={<ArrowLeft size={14} />}
        onClick={onBack}
        sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 800 }}
      >
        Back to demands
      </Button>

      <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
        <Chip size="small" label={kindLabel(demand.kind)} sx={{ fontWeight: 800 }} />
        <Chip size="small" label={transportModeLabel(demand.mode)} sx={{ fontWeight: 800 }} />
        <Chip size="small" label={productTypeLabel(demand.productType)} sx={{ fontWeight: 800 }} />
        <Chip
          size="small"
          label={demandDueStatusLabel(demand.dueStatus)}
          sx={{
            fontWeight: 800,
            bgcolor: `${priorityColor(demand.priority)}22`,
            color: priorityColor(demand.priority),
          }}
        />
        <Chip size="small" label={statusLabel(demand.status)} sx={{ fontWeight: 800 }} />
      </Stack>

      <Typography sx={{ fontWeight: 850, fontSize: 17 }}>{demand.title}</Typography>
      <Typography sx={{ fontSize: 13, color: tokenText.secondary, lineHeight: 1.5 }}>
        {demand.description}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
        <Meta label="Demand ID" value={demand.id} />
        <Meta label="Due" value={demand.dueLabel} />
        <Meta label="Transport mode" value={transportModeLabel(demand.mode)} />
        <Meta label="Product type" value={productTypeLabel(demand.productType)} />
        <Meta label="Demand status" value={demandDueStatusLabel(demand.dueStatus)} />
        <Meta label="Cases" value={String(demand.cases)} />
        <Meta label="SKUs" value={String(demand.skuCount)} />
        <Meta label="Lane partner" value={demand.lanePartner} />
        <Meta label="Requester" value={demand.requester} />
      </Box>

      <Divider />
      <Meta label="Ops notes" value={demand.notes} />
    </Stack>
  );
}

export default PlantDetailWidget;
