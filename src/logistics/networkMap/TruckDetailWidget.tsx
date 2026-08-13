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
  GripVertical,
  MessageSquare,
  Navigation,
  Phone,
  Radio,
  Truck as TruckIcon,
  Warehouse,
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
  type FleetStatus,
  type LiveTruck,
} from './fleetSimulation';

const DRAG_HANDLE = 'ct-v2-truck-detail-drag';

type TruckDetailWidgetProps = {
  truck: LiveTruck;
  onClose: () => void;
  onContact: (kind: 'driver' | 'carrier') => void;
  containerRef: React.RefObject<HTMLElement | null>;
};

function statusColor(status: FleetStatus) {
  if (status === 'on_time') return tokenSuccess.main;
  if (status === 'at_risk') return tokenWarning.main;
  if (status === 'customs') return tokenBrand.main;
  return tokenError.main;
}

function laneLabel(lane: FleetLane) {
  if (lane === 'inbound') return 'Inbound';
  if (lane === 'outbound') return 'Outbound';
  return 'Transfer';
}

function statusLabel(status: FleetStatus) {
  if (status === 'on_time') return 'On time';
  if (status === 'at_risk') return 'At risk';
  if (status === 'customs') return 'Customs';
  return 'Delayed';
}

type TabKey = 'overview' | 'vehicle' | 'driver' | 'cargo';

/**
 * Floating, draggable & resizable truck inspector — same interaction model as CT V2 widgets.
 * Overview keeps the original live-asset summary; Vehicle / Driver / Cargo are additional tabs.
 */
export function TruckDetailWidget({ truck, onClose, onContact, containerRef }: TruckDetailWidgetProps) {
  const [tab, setTab] = useState<TabKey>('overview');
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ w: 380, h: 520 });
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ ox: number; oy: number; sw: number; sh: number } | null>(null);

  useEffect(() => {
    setTab('overview');
    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPos({
      x: Math.max(16, rect.width - 404),
      y: 16,
    });
    setSize({ w: 380, h: Math.min(560, Math.max(420, rect.height - 40)) });
  }, [truck.id, containerRef]);

  const clamp = useCallback(() => {
    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPos((p) => ({
      x: Math.min(Math.max(8, p.x), Math.max(8, rect.width - 120)),
      y: Math.min(Math.max(8, p.y), Math.max(8, rect.height - 80)),
    }));
    setSize((s) => ({
      w: Math.min(Math.max(300, s.w), Math.max(300, rect.width - 16)),
      h: Math.min(Math.max(360, s.h), Math.max(360, rect.height - 16)),
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
          w: Math.max(300, r.sw + (e.clientX - r.ox)),
          h: Math.max(360, r.sh + (e.clientY - r.oy)),
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

  return (
    <Box
      onPointerDown={startDrag}
      sx={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex: 600,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.4,
        bgcolor: 'background.paper',
        border: '1px solid var(--paper-border-color)',
        boxShadow: 'var(--paper-shadow)',
        overflow: 'hidden',
        fontFamily: workstationVisuals.fontFamily,
        pointerEvents: 'auto',
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
              <Typography sx={{ ...ctV2Type.eyebrow, color: tokenBrand.main }}>LIVE ASSET · WIDGET</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 850, fontSize: 18, mt: 0.2 }}>{truck.id}</Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
              Unit {truck.trailer} · {Math.round(truck.progress * 100)}% en route
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close asset details" sx={{ mt: -0.25 }}>
            <X size={16} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
          <Chip size="small" label={transportModeLabel(truck.mode)} sx={{ fontWeight: 800 }} />
          <Chip size="small" label={laneLabel(truck.lane)} sx={{ fontWeight: 800 }} />
          <Chip
            size="small"
            label={statusLabel(truck.status)}
            sx={{
              fontWeight: 800,
              bgcolor: `${statusColor(truck.status)}22`,
              color: statusColor(truck.status),
            }}
          />
        </Stack>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, next: TabKey) => setTab(next)}
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
        <Tab value="overview" label="Overview" />
        <Tab value="vehicle" label="Vehicle" />
        <Tab value="driver" label="Driver" />
        <Tab value="cargo" label="Cargo" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1.5 }}>
        {tab === 'overview' ? <OverviewTab truck={truck} onContact={onContact} /> : null}
        {tab === 'vehicle' ? <VehicleTab truck={truck} /> : null}
        {tab === 'driver' ? <DriverTab truck={truck} onContact={onContact} /> : null}
        {tab === 'cargo' ? <CargoTab truck={truck} /> : null}
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box sx={{ color: tokenBrand.main, mt: 0.15, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 800, color: tokenText.secondary, textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 750, color: tokenText.primary }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

function OverviewTab({
  truck,
  onContact,
}: {
  truck: LiveTruck;
  onContact: (kind: 'driver' | 'carrier') => void;
}) {
  return (
    <Stack spacing={1.15}>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        <Chip size="small" label={productTypeLabel(truck.productType)} sx={{ fontWeight: 800 }} />
        <Chip size="small" label={demandDueStatusLabel(truck.demandStatus)} sx={{ fontWeight: 800 }} />
      </Stack>

      <Stack spacing={1}>
        <DetailRow
          icon={<Navigation size={14} />}
          label="Route"
          value={`${truck.origin.shortName} → ${truck.destination.shortName}`}
        />
        <DetailRow
          icon={<Warehouse size={14} />}
          label="Cargo"
          value={`${truck.cargo} · ${truck.cases} cases`}
        />
        <DetailRow
          icon={<Radio size={14} />}
          label="Temp / ETA"
          value={`${truck.temperature} · ${truck.etaLabel}`}
        />
        <DetailRow icon={<TruckIcon size={14} />} label="Carrier" value={truck.carrier} />
      </Stack>

      <Divider />

      <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
        Driver · {truck.driver}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<Phone size={14} />}
          onClick={() => onContact('driver')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Call driver
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<MessageSquare size={14} />}
          onClick={() => onContact('carrier')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Carrier
        </Button>
      </Stack>
      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
        {truck.driverPhone} · Dispatch {truck.carrierPhone}
      </Typography>
    </Stack>
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

function VehicleTab({ truck }: { truck: LiveTruck }) {
  const v = truck.vehicle;
  return (
    <Stack spacing={1.25}>
      <Box
        component="img"
        src={v.photoUrl}
        alt={`${truck.id} vehicle`}
        sx={{
          width: '100%',
          height: 160,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid var(--paper-border-color)',
          bgcolor: 'var(--surface-subtle-bg)',
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.1,
        }}
      >
        <Meta label="Plate" value={v.plate} />
        <Meta label="GPS unit" value={v.gpsId} />
        <Meta label="Make / model" value={v.makeModel} />
        <Meta label="Year" value={String(v.year)} />
        <Meta label="Asset type" value={v.type} />
        <Meta label="Transport mode" value={transportModeLabel(truck.mode)} />
        <Meta label="Product type" value={productTypeLabel(truck.productType)} />
        <Meta label="Demand status" value={demandDueStatusLabel(truck.demandStatus)} />
        <Meta label="Axles" value={String(v.axles)} />
        <Meta label="Last service" value={v.lastService} />
        <Meta label="Carrier" value={truck.carrier} />
      </Box>
      <Divider />
      <Meta
        label="Active route"
        value={`${truck.origin.shortName} → ${truck.destination.shortName}`}
      />
      <Meta label="Temp / ETA" value={`${truck.temperature} · ${truck.etaLabel}`} />
    </Stack>
  );
}

function DriverTab({
  truck,
  onContact,
}: {
  truck: LiveTruck;
  onContact: (kind: 'driver' | 'carrier') => void;
}) {
  const d = truck.driverProfile;
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          component="img"
          src={d.photoUrl}
          alt={d.name}
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${tokenBrand.light}`,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 850, fontSize: 16 }}>{d.name}</Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>{d.email}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: tokenBrand.main, mt: 0.35 }}>
            ★ {d.rating.toFixed(1)} · {d.experienceYears} yrs
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
        <Meta label="License" value={d.license} />
        <Meta label="Class" value={d.licenseClass} />
        <Meta label="Languages" value={d.languages} />
        <Meta label="Phone" value={truck.driverPhone} />
      </Box>

      <Divider />

      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<Phone size={14} />}
          onClick={() => onContact('driver')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Call driver
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<MessageSquare size={14} />}
          onClick={() => onContact('carrier')}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          Carrier
        </Button>
      </Stack>
      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }}>
        Dispatch {truck.carrierPhone} · {truck.carrier}
      </Typography>
    </Stack>
  );
}

function CargoTab({ truck }: { truck: LiveTruck }) {
  return (
    <Stack spacing={1.25}>
      <Meta label="Manifest" value={`${truck.cargo} · ${truck.cases} cases`} />
      <Meta label="Temperature" value={truck.temperature} />
      <Divider />
      <Typography sx={{ fontSize: 11, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase' }}>
        SKUs on board
      </Typography>
      <Stack spacing={1}>
        {truck.cargoLines.map((line) => (
          <Box
            key={line.sku}
            sx={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 1,
              p: 1,
              borderRadius: 2,
              border: '1px solid var(--paper-border-color)',
              bgcolor: 'var(--surface-subtle-bg)',
            }}
          >
            <Box
              component="img"
              src={line.imageUrl}
              alt={line.name}
              sx={{
                width: 72,
                height: 72,
                borderRadius: 1.5,
                objectFit: 'cover',
                bgcolor: 'background.paper',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: tokenBrand.main }}>{line.sku}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 750 }} noWrap>
                {line.name}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
                Qty {line.qty} {line.uom} · Lot {line.lot}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

export default TruckDetailWidget;
