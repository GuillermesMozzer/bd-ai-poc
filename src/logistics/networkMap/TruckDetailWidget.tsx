import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  CheckCheck,
  FileUp,
  GripVertical,
  Mic,
  MessageSquare,
  Navigation,
  Paperclip,
  Phone,
  PhoneCall,
  Radio,
  Send,
  Truck as TruckIcon,
  Video,
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
  alertSeverityLabel,
  buildAssetAlerts,
  buildSeedChat,
  formatChatTime,
  type AssetAlert,
  type AssetAlertSeverity,
  type ChatMessage,
} from './assetComms';
import {
  demandDueStatusLabel,
  productTypeLabel,
  transportModeLabel,
  type FleetLane,
  type FleetStatus,
  type LiveTruck,
} from './fleetSimulation';
import {
  buildRouteTimeline,
  formatStopWhen,
  routeStopKindLabel,
  routeStopStatusLabel,
  type RouteDueTone,
  type RouteStop,
} from './routeTimeline';

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

type TabKey = 'overview' | 'vehicle' | 'driver' | 'cargo' | 'route' | 'messages' | 'alerts';

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
      x: Math.max(16, rect.width - 424),
      y: 16,
    });
    setSize({ w: 400, h: Math.min(600, Math.max(440, rect.height - 40)) });
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
        <Tab value="route" label="Route" />
        <Tab value="messages" label="Chat" />
        <Tab value="alerts" label="Alerts" />
      </Tabs>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: tab === 'messages' ? 'hidden' : 'auto',
          p: tab === 'messages' ? 0 : 1.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tab === 'overview' ? <OverviewTab truck={truck} onContact={onContact} /> : null}
        {tab === 'vehicle' ? <VehicleTab truck={truck} /> : null}
        {tab === 'driver' ? <DriverTab truck={truck} onContact={onContact} /> : null}
        {tab === 'cargo' ? <CargoTab truck={truck} /> : null}
        {tab === 'route' ? <RouteTab truck={truck} /> : null}
        {tab === 'messages' ? <MessagesTab truck={truck} /> : null}
        {tab === 'alerts' ? <AlertsTab truck={truck} /> : null}
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
  const carrier = truck.carrierProfile;

  return (
    <Stack spacing={1.15}>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        <Chip size="small" label={productTypeLabel(truck.productType)} sx={{ fontWeight: 800 }} />
        <Chip size="small" label={demandDueStatusLabel(truck.demandStatus)} sx={{ fontWeight: 800 }} />
        <Chip size="small" label={transportModeLabel(truck.mode)} sx={{ fontWeight: 800 }} />
      </Stack>

      <Box
        sx={{
          p: 1.15,
          borderRadius: 2,
          border: '1px solid var(--paper-border-color)',
          bgcolor: 'var(--surface-subtle-bg)',
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase', mb: 0.75 }}>
          Carrier company
        </Typography>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Box
            component="img"
            src={carrier.logoUrl}
            alt={`${carrier.name} logo`}
            sx={{
              height: 40,
              width: 'auto',
              maxWidth: 140,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: '1px solid var(--paper-border-color)',
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 850, fontSize: 15 }} noWrap>
              {carrier.name}
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }} noWrap>
              {carrier.legalName}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: tokenBrand.main, mt: 0.25 }}>
              {carrier.registrationLabel}: {carrier.registrationId}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        component="img"
        src={truck.vehicle.photoUrl}
        alt={`${truck.id} · ${truck.vehicle.makeModel}`}
        sx={{
          width: '100%',
          height: 140,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid var(--paper-border-color)',
          bgcolor: 'var(--surface-subtle-bg)',
        }}
      />

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
        <DetailRow
          icon={<TruckIcon size={14} />}
          label="Asset"
          value={`${truck.vehicle.makeModel} · ${truck.vehicle.plate}`}
        />
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

function routeDueToneColor(tone: RouteDueTone) {
  if (tone === 'completed') return tokenSuccess.main;
  if (tone === 'nearing_due') return tokenWarning.main;
  if (tone === 'overdue') return tokenError.main;
  if (tone === 'on_time') return tokenSuccess.main;
  return tokenText.secondary;
}

function RouteTab({ truck }: { truck: LiveTruck }) {
  const stops = useMemo(() => buildRouteTimeline(truck, Date.now()), [truck]);

  return (
    <Stack spacing={1.25}>
      <Typography sx={{ fontSize: 12, color: tokenText.secondary, lineHeight: 1.45 }}>
        Operational timeline for this {transportModeLabel(truck.mode).toLowerCase()} move — stops for load/unload,
        fuel or bunker, rest, meals, tolls, customs, and handoffs. Color shows deadline health; blinking marks the
        step currently in progress.
      </Typography>

      <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
        <Chip size="small" label="Green · on time / done" sx={{ fontWeight: 800, bgcolor: `${tokenSuccess.main}22`, color: tokenSuccess.main }} />
        <Chip size="small" label="Yellow · nearing due" sx={{ fontWeight: 800, bgcolor: `${tokenWarning.main}22`, color: tokenWarning.main }} />
        <Chip size="small" label="Red · overdue" sx={{ fontWeight: 800, bgcolor: `${tokenError.main}22`, color: tokenError.main }} />
        <Chip size="small" label="Blink · in progress" sx={{ fontWeight: 800, bgcolor: `${tokenBrand.main}22`, color: tokenBrand.main }} />
      </Stack>

      <Box sx={{ position: 'relative', pl: 0.5 }}>
        {stops.map((stop, index) => (
          <RouteTimelineRow
            key={stop.id}
            stop={stop}
            isLast={index === stops.length - 1}
          />
        ))}
      </Box>
    </Stack>
  );
}

function RouteTimelineRow({ stop, isLast }: { stop: RouteStop; isLast: boolean }) {
  const color = routeDueToneColor(stop.dueTone);
  const blink = stop.active;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 1, mb: isLast ? 0 : 0.35 }}>
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: 99,
            bgcolor: color,
            border: `2px solid ${color}`,
            mt: 0.55,
            flexShrink: 0,
            zIndex: 1,
            boxShadow: blink ? `0 0 0 0 ${color}` : 'none',
            animation: blink ? 'ctRoutePulse 1.25s ease-out infinite' : 'none',
            '@keyframes ctRoutePulse': {
              '0%': { boxShadow: `0 0 0 0 ${color}` },
              '70%': { boxShadow: `0 0 0 8px transparent` },
              '100%': { boxShadow: `0 0 0 0 transparent` },
            },
          }}
        />
        {!isLast ? (
          <Box
            sx={{
              width: 2,
              flex: 1,
              minHeight: 28,
              bgcolor: 'var(--paper-border-color)',
              mt: 0.35,
            }}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          p: 1.05,
          mb: 0.75,
          borderRadius: 2,
          border: `1px solid ${stop.dueTone === 'scheduled' && !blink ? 'var(--paper-border-color)' : `${color}55`}`,
          bgcolor: stop.dueTone === 'scheduled' && !blink ? 'var(--surface-subtle-bg)' : `${color}14`,
          animation: blink ? 'ctRouteCardBlink 1.6s ease-in-out infinite' : 'none',
          '@keyframes ctRouteCardBlink': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.72 },
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.75}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 850, color: tokenText.secondary, textTransform: 'uppercase' }}>
              #{stop.seq} · {routeStopKindLabel(stop.kind)}
            </Typography>
            <Typography sx={{ fontWeight: 850, fontSize: 13, mt: 0.15 }}>{stop.title}</Typography>
          </Box>
          <Chip
            size="small"
            label={routeStopStatusLabel(stop)}
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 850,
              bgcolor: `${color}22`,
              color,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.45 }}>
          {formatStopWhen(stop.plannedAt)}
          {stop.plannedEndAt.getTime() - stop.plannedAt.getTime() > 5 * 60_000
            ? ` → ${formatStopWhen(stop.plannedEndAt)}`
            : ''}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 750, mt: 0.35 }}>{stop.location}</Typography>
        <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.2 }}>
          {stop.address}
        </Typography>
        <Typography sx={{ fontSize: 11, color: tokenText.secondary, mt: 0.45, lineHeight: 1.4 }}>
          {stop.notes}
        </Typography>
      </Box>
    </Box>
  );
}

function alertSeverityColor(severity: AssetAlertSeverity) {
  if (severity === 'critical') return tokenError.main;
  if (severity === 'warning') return tokenWarning.main;
  return tokenBrand.main;
}

function MessagesTab({ truck }: { truck: LiveTruck }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildSeedChat(truck));
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessages(buildSeedChat(truck));
    setDraft('');
  }, [truck.id]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const pushMessage = (partial: Omit<ChatMessage, 'id' | 'sentAt'> & { sentAt?: Date }) => {
    setMessages((prev) => [
      ...prev,
      {
        ...partial,
        id: `${truck.id}-local-${Date.now()}-${prev.length}`,
        sentAt: partial.sentAt ?? new Date(),
      },
    ]);
  };

  const sendText = () => {
    const text = draft.trim();
    if (!text) return;
    pushMessage({ from: 'ops', author: 'You', text });
    setDraft('');
  };

  const onAttachFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const attachments = Array.from(files).slice(0, 4).map((file, i) => ({
      id: `f-${Date.now()}-${i}`,
      kind: (file.type.startsWith('image/') ? 'image' : 'file') as 'image' | 'file',
      name: file.name,
      sizeLabel: file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    pushMessage({
      from: 'ops',
      author: 'You',
      text: attachments.length === 1 ? 'Attachment sent' : `${attachments.length} attachments sent`,
      attachments,
    });
    setToast(`Attached ${attachments.map((a) => a.name).join(', ')}`);
  };

  const onAttachAudio = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const seconds = 8 + Math.round((file.size % 40) / 2);
    pushMessage({
      from: 'ops',
      author: 'You',
      text: 'Audio message',
      audioSeconds: seconds,
      attachments: [
        {
          id: `aud-${Date.now()}`,
          kind: 'audio',
          name: file.name || 'voice-note.m4a',
          sizeLabel: `${seconds}s`,
        },
      ],
    });
    setRecording(false);
    setToast('Audio message sent');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{
          px: 1.25,
          py: 0.9,
          borderBottom: '1px solid var(--paper-border-color)',
          bgcolor: 'var(--surface-subtle-bg)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 850, fontSize: 13 }} noWrap>
            {truck.driver}
          </Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }} noWrap>
            {truck.carrier} · {truck.driverPhone}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Voice call"
          onClick={() => setToast(`Voice call started · ${truck.driver} · ${truck.driverPhone}`)}
          sx={{ color: tokenSuccess.main }}
        >
          <PhoneCall size={16} />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Video call"
          onClick={() => setToast(`Video call started · ${truck.driver}`)}
          sx={{ color: tokenBrand.main }}
        >
          <Video size={16} />
        </IconButton>
      </Stack>

      <Box ref={listRef} sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.25, py: 1.1 }}>
        <Stack spacing={1}>
          {messages.map((msg) => {
            const mine = msg.from === 'ops';
            const system = msg.from === 'system';
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: system ? 'center' : mine ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: system ? '92%' : '84%',
                    px: 1.1,
                    py: 0.85,
                    borderRadius: system ? 2 : mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    bgcolor: system
                      ? 'transparent'
                      : mine
                        ? `${tokenBrand.main}22`
                        : 'var(--surface-subtle-bg)',
                    border: system
                      ? 'none'
                      : `1px solid ${mine ? `${tokenBrand.main}44` : 'var(--paper-border-color)'}`,
                  }}
                >
                  {!system ? (
                    <Typography sx={{ fontSize: 10, fontWeight: 850, color: tokenBrand.main, mb: 0.25 }}>
                      {msg.author}
                    </Typography>
                  ) : null}
                  <Typography
                    sx={{
                      fontSize: system ? 11 : 13,
                      fontWeight: system ? 700 : 650,
                      color: system ? tokenText.secondary : tokenText.primary,
                      lineHeight: 1.4,
                      textAlign: system ? 'center' : 'left',
                    }}
                  >
                    {msg.text}
                  </Typography>
                  {msg.audioSeconds ? (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      sx={{
                        mt: 0.65,
                        px: 0.85,
                        py: 0.55,
                        borderRadius: 99,
                        bgcolor: 'background.paper',
                        border: '1px solid var(--paper-border-color)',
                      }}
                    >
                      <Mic size={12} color={tokenBrand.main as string} />
                      <Box
                        sx={{
                          flex: 1,
                          height: 3,
                          borderRadius: 99,
                          bgcolor: `${tokenBrand.main}33`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '62%',
                            bgcolor: tokenBrand.main,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{msg.audioSeconds}s</Typography>
                    </Stack>
                  ) : null}
                  {msg.attachments?.length ? (
                    <Stack spacing={0.45} sx={{ mt: 0.65 }}>
                      {msg.attachments.map((att) => (
                        <Stack
                          key={att.id}
                          direction="row"
                          spacing={0.6}
                          alignItems="center"
                          sx={{
                            px: 0.75,
                            py: 0.45,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid var(--paper-border-color)',
                          }}
                        >
                          {att.kind === 'audio' ? <Mic size={12} /> : <Paperclip size={12} />}
                          <Typography sx={{ fontSize: 11, fontWeight: 750 }} noWrap>
                            {att.name}
                          </Typography>
                          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, ml: 'auto' }}>
                            {att.sizeLabel}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : null}
                  <Typography
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: tokenText.secondary,
                      mt: 0.4,
                      textAlign: system ? 'center' : 'right',
                    }}
                  >
                    {formatChatTime(msg.sentAt)}
                    {mine ? ' · ✓✓' : ''}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          px: 1,
          py: 0.9,
          borderTop: '1px solid var(--paper-border-color)',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="flex-end">
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={(e) => {
              onAttachFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            ref={audioRef}
            type="file"
            hidden
            accept="audio/*"
            onChange={(e) => {
              onAttachAudio(e.target.files);
              e.target.value = '';
            }}
          />
          <IconButton
            size="small"
            aria-label="Attach file"
            onClick={() => fileRef.current?.click()}
            sx={{ color: tokenText.secondary }}
          >
            <Paperclip size={16} />
          </IconButton>
          <IconButton
            size="small"
            aria-label={recording ? 'Recording… pick audio file' : 'Send audio'}
            onClick={() => {
              setRecording(true);
              audioRef.current?.click();
            }}
            sx={{ color: recording ? tokenError.main : tokenText.secondary }}
          >
            <Mic size={16} />
          </IconButton>
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
            multiline
            maxRows={3}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Send message"
                    onClick={sendText}
                    disabled={!draft.trim()}
                    sx={{ color: tokenBrand.main }}
                  >
                    <Send size={15} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 13,
                fontFamily: workstationVisuals.fontFamily,
                borderRadius: 2,
              },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PhoneCall size={13} />}
            onClick={() => setToast(`Voice call started · ${truck.driver}`)}
            sx={{ textTransform: 'none', fontWeight: 800, flex: 1 }}
          >
            Voice
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Video size={13} />}
            onClick={() => setToast(`Video call started · ${truck.driver}`)}
            sx={{ textTransform: 'none', fontWeight: 800, flex: 1 }}
          >
            Video
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileUp size={13} />}
            onClick={() => fileRef.current?.click()}
            sx={{ textTransform: 'none', fontWeight: 800, flex: 1 }}
          >
            File
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

function AlertsTab({ truck }: { truck: LiveTruck }) {
  const seed = useMemo(() => buildAssetAlerts(truck), [truck.id, truck.progress, truck.mode]);
  const [alerts, setAlerts] = useState<AssetAlert[]>(seed);

  useEffect(() => {
    setAlerts(buildAssetAlerts(truck));
  }, [truck.id, truck.progress, truck.mode]);

  const openCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Stack spacing={1.15}>
      <Typography sx={{ fontSize: 12, color: tokenText.secondary, lineHeight: 1.45 }}>
        Driver, carrier, and telematics notifications — roadside issues, weather slowdowns, mechanical faults,
        security, and natural-hazard advisories.
      </Typography>

      <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
        <Chip
          size="small"
          icon={<AlertTriangle size={12} />}
          label={`${openCount} open`}
          sx={{ fontWeight: 800, bgcolor: `${tokenError.main}18`, color: tokenError.main }}
        />
        <Chip size="small" label={`${alerts.length} total`} sx={{ fontWeight: 800 }} />
      </Stack>

      <Stack spacing={0.9}>
        {alerts.map((alert) => {
          const color = alertSeverityColor(alert.severity);
          return (
            <Box
              key={alert.id}
              sx={{
                p: 1.1,
                borderRadius: 2,
                border: `1px solid ${color}55`,
                bgcolor: alert.acknowledged ? 'var(--surface-subtle-bg)' : `${color}12`,
                opacity: alert.acknowledged ? 0.78 : 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={0.75}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mb: 0.35 }}>
                    <Chip
                      size="small"
                      label={alertSeverityLabel(alert.severity)}
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 850,
                        bgcolor: `${color}22`,
                        color,
                      }}
                    />
                    <Chip
                      size="small"
                      label={alert.source}
                      sx={{ height: 18, fontSize: 10, fontWeight: 800, textTransform: 'capitalize' }}
                    />
                  </Stack>
                  <Typography sx={{ fontWeight: 850, fontSize: 13 }}>{alert.title}</Typography>
                </Box>
                {!alert.acknowledged ? (
                  <IconButton
                    size="small"
                    aria-label="Acknowledge alert"
                    onClick={() =>
                      setAlerts((prev) =>
                        prev.map((row) => (row.id === alert.id ? { ...row, acknowledged: true } : row)),
                      )
                    }
                    sx={{ color: tokenSuccess.main }}
                  >
                    <CheckCheck size={15} />
                  </IconButton>
                ) : (
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: tokenSuccess.main, pt: 0.35 }}>
                    ACK
                  </Typography>
                )}
              </Stack>
              <Typography sx={{ fontSize: 12, color: tokenText.secondary, mt: 0.45, lineHeight: 1.4 }}>
                {alert.message}
              </Typography>
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.55 }}>
                {formatChatTime(alert.createdAt)} · {alert.location}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default TruckDetailWidget;
