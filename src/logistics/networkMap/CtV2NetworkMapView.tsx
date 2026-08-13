import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Truck as TruckIcon,
  Plane,
  Ship,
  TrainFront,
  Bus,
} from 'lucide-react';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import {
  ctV2Type,
  tokenBrand,
  tokenError,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../ctV2Theme';
import { BD_PLANT_SITES, getPlantById, type BdPlantSite } from './bdPlantSites';
import {
  DEMAND_DUE_STATUSES,
  demandDueStatusLabel,
  fleetKpis,
  productTypeLabel,
  sampleLiveFleet,
  transportModeLabel,
  type DemandDueStatus,
  type FleetLane,
  type FleetStatus,
  type LiveTruck,
  type ProductType,
  type TransportMode,
} from './fleetSimulation';
import { PlantDetailWidget } from './PlantDetailWidget';
import { PlantMapPopup } from './PlantMapPopup';
import type { PlantProfile } from './plantProfiles';
import { TruckDetailWidget } from './TruckDetailWidget';

const MAP_CENTER: [number, number] = [24.2, -102.5];
const MAP_ZOOM = 5;

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

function plantKindColor(kind: BdPlantSite['kind']) {
  if (kind === 'distribution') return tokenBrand.main;
  if (kind === 'campus') return tokenWarning.main;
  if (kind === 'pharma') return tokenSuccess.main;
  return '#0EA5E9';
}

function truckIcon(truck: LiveTruck, selected: boolean) {
  const color = statusColor(truck.status);
  const size = selected ? 36 : 32;
  const rotate =
    truck.mode === 'plane' || truck.mode === 'ship' || truck.mode === 'train'
      ? 0
      : Math.round(truck.bearing / 20) * 20;
  const svg =
    truck.mode === 'plane'
      ? `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`
      : truck.mode === 'ship'
        ? `<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H9"/><path d="M12 10V3"/><circle cx="12" cy="3" r="1"/>`
        : truck.mode === 'train'
          ? `<path d="M8 3h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/><path d="M8 19h8"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/><path d="M4 11h16"/>`
          : truck.mode === 'van'
            ? `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.48-3.1A1 1 0 0 0 18.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`
            : `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`;

  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:999px;
      background:${color};border:2px solid #fff;
      box-shadow:0 6px 16px rgba(0,0,0,.35);
      display:grid;place-items:center;
      transform: rotate(${rotate}deg);
      ${selected ? 'outline:3px solid rgba(62,131,255,.55);outline-offset:2px;' : ''}
      pointer-events:auto;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        ${svg}
      </svg>
    </div>`;
  return L.divIcon({
    className: 'ct-v2-truck-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/** Stable marker: updates lat/lng without remounting on every animation tick (fixes missed clicks). */
function FleetAssetMarker({
  truck,
  selected,
  onSelect,
}: {
  truck: LiveTruck;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const bearingBucket = Math.round(truck.bearing / 20) * 20;
  const icon = useMemo(
    () => truckIcon(truck, selected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [truck.id, truck.mode, truck.status, selected, bearingBucket],
  );

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([truck.lat, truck.lng]);
  }, [truck.lat, truck.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[truck.lat, truck.lng]}
      icon={icon}
      zIndexOffset={selected ? 1200 : 650}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(truck.id);
        },
      }}
    />
  );
}

function FitSelection({ truck, plant }: { truck: LiveTruck | null; plant: BdPlantSite | null }) {
  const map = useMap();
  useEffect(() => {
    if (truck) {
      map.flyTo([truck.lat, truck.lng], Math.max(map.getZoom(), 7), { duration: 0.75 });
      return;
    }
    if (plant) {
      map.flyTo([plant.lat, plant.lng], Math.max(map.getZoom(), 8), { duration: 0.75 });
    }
  }, [truck?.id, plant?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
}

function ClosePopupWhenPlantOpens({ plantId }: { plantId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (plantId) map.closePopup();
  }, [plantId, map]);
  return null;
}

type LaneFilter = 'all' | FleetLane;
type ModeFilter = 'all' | TransportMode;
type ProductFilter = 'all' | ProductType;
type DemandStatusFilter = 'all' | DemandDueStatus;

function FilterChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; icon?: React.ReactNode }>;
  onChange: (next: T) => void;
}) {
  return (
    <Box sx={{ mt: 1.1 }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 850,
          color: tokenText.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          mb: 0.55,
        }}
      >
        {label}
      </Typography>
      <Stack direction="row" spacing={0.55} useFlexGap flexWrap="wrap">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Chip
              key={opt.value}
              size="small"
              icon={opt.icon ? <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>{opt.icon}</Box> : undefined}
              label={opt.label}
              onClick={() => onChange(opt.value)}
              sx={{
                fontWeight: 800,
                fontSize: 11,
                bgcolor: active ? tokenBrand.softBg : 'transparent',
                color: active ? tokenBrand.main : tokenText.secondary,
                border: `1px solid ${active ? tokenBrand.light : 'var(--paper-border-color)'}`,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export function CtV2NetworkMapView({ onToast }: { onToast?: (msg: string) => void }) {
  const { themeMode } = useThemeMode();
  const mapStageRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [laneFilter, setLaneFilter] = useState<LaneFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [demandStatusFilter, setDemandStatusFilter] = useState<DemandStatusFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const trucks = useMemo(() => sampleLiveFleet(now), [now]);
  const kpis = useMemo(() => fleetKpis(trucks), [trucks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trucks.filter((t) => {
      if (laneFilter !== 'all' && t.lane !== laneFilter) return false;
      if (modeFilter !== 'all' && t.mode !== modeFilter) return false;
      if (productFilter !== 'all' && t.productType !== productFilter) return false;
      if (demandStatusFilter !== 'all' && t.demandStatus !== demandStatusFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q)
        || t.driver.toLowerCase().includes(q)
        || t.carrier.toLowerCase().includes(q)
        || t.cargo.toLowerCase().includes(q)
        || t.mode.toLowerCase().includes(q)
        || t.origin.shortName.toLowerCase().includes(q)
        || t.destination.shortName.toLowerCase().includes(q)
      );
    });
  }, [trucks, laneFilter, modeFilter, productFilter, demandStatusFilter, query]);

  const selected = filtered.find((t) => t.id === selectedId) ?? trucks.find((t) => t.id === selectedId) ?? null;
  const selectedPlant = selectedPlantId ? getPlantById(selectedPlantId) ?? null : null;

  const plantTrucks = useMemo(() => {
    if (!selectedPlant) return [] as LiveTruck[];
    return trucks.filter((t) => {
      if (t.origin.id !== selectedPlant.id && t.destination.id !== selectedPlant.id) return false;
      if (modeFilter !== 'all' && t.mode !== modeFilter) return false;
      if (productFilter !== 'all' && t.productType !== productFilter) return false;
      if (demandStatusFilter !== 'all' && t.demandStatus !== demandStatusFilter) return false;
      return true;
    });
  }, [trucks, selectedPlant, modeFilter, productFilter, demandStatusFilter]);

  const openTruck = (truckId: string) => {
    setSelectedPlantId(null);
    setSelectedId(truckId);
  };

  const openPlantWidget = (plantId: string) => {
    setSelectedId(null);
    setSelectedPlantId(plantId);
  };

  const tileUrl =
    themeMode === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const contact = (kind: 'driver' | 'carrier', truck: LiveTruck) => {
    const who = kind === 'driver' ? truck.driver : truck.carrier;
    const phone = kind === 'driver' ? truck.driverPhone : truck.carrierPhone;
    onToast?.(`${kind === 'driver' ? 'Driver' : 'Carrier'} contact opened · ${who} · ${phone}`);
  };

  const plantContact = (
    channel: 'call' | 'message' | 'email',
    plant: BdPlantSite,
    profile: PlantProfile,
  ) => {
    const c = profile.contact;
    if (channel === 'call') onToast?.(`Calling ${c.name} · ${c.phone} · ${plant.shortName}`);
    else if (channel === 'message') onToast?.(`Message to ${c.name} · ${c.mobile}`);
    else onToast?.(`Email draft · ${c.email}`);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
        gap: 1.5,
        height: { xs: 'auto', lg: 'calc(100vh - 220px)' },
        minHeight: { xs: 640, lg: 560 },
      }}
    >
      {/* Left ops rail */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.4,
          border: workstationVisuals.shellBorder,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 1.75, pb: 1.25 }}>
          <Typography sx={{ ...ctV2Type.eyebrow, color: tokenBrand.main }}>4PL · NETWORK CONTROL</Typography>
          <Typography sx={{ ...ctV2Type.sectionTitle, mt: 0.4 }}>Live Mexico Corridor</Typography>
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>
            Multi-modal inbound / outbound / transfer simulation across BD plants & DCs.
          </Typography>

          <Box
            sx={{
              mt: 1.5,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.85,
            }}
          >
            {[
              { l: 'Active assets', v: kpis.active },
              { l: 'At risk', v: kpis.atRisk },
              { l: 'Inbound', v: kpis.inbound },
              { l: 'Sites', v: kpis.plants },
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
                <Typography sx={{ fontSize: 22, fontWeight: 850, color: tokenText.primary, lineHeight: 1.15 }}>
                  {kpi.v}
                </Typography>
              </Box>
            ))}
          </Box>

          <TextField
            size="small"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search asset, driver, cargo, mode…"
            sx={{ mt: 1.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} />
                </InputAdornment>
              ),
            }}
          />

          <FilterChipRow<ModeFilter>
            label="Transport mode"
            value={modeFilter}
            onChange={setModeFilter}
            options={[
              { value: 'all', label: 'All modes' },
              { value: 'plane', label: 'Plane', icon: <Plane size={12} /> },
              { value: 'truck', label: 'Truck', icon: <TruckIcon size={12} /> },
              { value: 'van', label: 'Van', icon: <Bus size={12} /> },
              { value: 'ship', label: 'Ship', icon: <Ship size={12} /> },
              { value: 'train', label: 'Train', icon: <TrainFront size={12} /> },
            ]}
          />

          <FilterChipRow<ProductFilter>
            label="Product type"
            value={productFilter}
            onChange={setProductFilter}
            options={[
              { value: 'all', label: 'All products' },
              { value: 'raw_material', label: 'Raw material' },
              { value: 'finished_good', label: 'Finished good' },
            ]}
          />

          <FilterChipRow<DemandStatusFilter>
            label="Demand status"
            value={demandStatusFilter}
            onChange={setDemandStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              ...DEMAND_DUE_STATUSES.map((s) => ({ value: s as DemandStatusFilter, label: demandDueStatusLabel(s) })),
            ]}
          />

          <FilterChipRow<LaneFilter>
            label="Lane"
            value={laneFilter}
            onChange={setLaneFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'inbound', label: 'Inbound' },
              { value: 'outbound', label: 'Outbound' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 1.25 }}>
          <Stack spacing={0.85}>
            {filtered.map((truck) => {
              const active = truck.id === selected?.id;
              return (
                <Box
                  key={truck.id}
                  component="button"
                  type="button"
                  onClick={() => openTruck(truck.id)}
                  sx={{
                    textAlign: 'left',
                    border: `1px solid ${active ? tokenBrand.main : 'var(--paper-border-color)'}`,
                    bgcolor: active ? tokenBrand.softBg : 'var(--surface-subtle-bg)',
                    borderRadius: 2,
                    p: 1.15,
                    cursor: 'pointer',
                    font: 'inherit',
                    transition: 'border-color 120ms ease, background 120ms ease',
                    '&:hover': { borderColor: tokenBrand.light },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: statusColor(truck.status) }} />
                      <Typography sx={{ fontWeight: 850, fontSize: 13 }}>{truck.id}</Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={laneLabel(truck.lane)}
                      sx={{ height: 20, fontSize: 10, fontWeight: 800 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.55 }}>
                    <Chip size="small" label={transportModeLabel(truck.mode)} sx={{ height: 18, fontSize: 9, fontWeight: 800 }} />
                    <Chip size="small" label={productTypeLabel(truck.productType)} sx={{ height: 18, fontSize: 9, fontWeight: 800 }} />
                    <Chip
                      size="small"
                      label={demandDueStatusLabel(truck.demandStatus)}
                      sx={{ height: 18, fontSize: 9, fontWeight: 800 }}
                    />
                  </Stack>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.45 }}>
                    {truck.origin.shortName} → {truck.destination.shortName}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, mt: 0.35 }} noWrap>
                    {truck.cargo}
                  </Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.25 }}>
                    {statusLabel(truck.status)} · ETA {truck.etaLabel}
                  </Typography>
                </Box>
              );
            })}
            {filtered.length === 0 ? (
              <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, p: 1 }}>
                No assets match the current filters.
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </Paper>

      {/* Map stage */}
      <Paper
        ref={mapStageRef}
        elevation={0}
        sx={{
          position: 'relative',
          borderRadius: 2.4,
          border: workstationVisuals.shellBorder,
          overflow: 'hidden',
          minHeight: { xs: 420, lg: 0 },
          bgcolor: 'var(--surface-muted-bg)',
          '& .leaflet-container': {
            width: '100%',
            height: '100%',
            fontFamily: workstationVisuals.fontFamily,
            background: themeMode === 'dark' ? '#0B0F19' : '#E8EEF5',
          },
          '& .ct-v2-truck-marker': {
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
          },
          '& .leaflet-popup-content-wrapper': {
            borderRadius: 12,
            boxShadow: 'var(--paper-shadow)',
            border: '1px solid var(--paper-border-color)',
            padding: 0,
          },
          '& .leaflet-popup-content': {
            margin: '10px 12px 12px',
            minWidth: 220,
          },
          '& .leaflet-popup-tip': {
            boxShadow: 'none',
          },
        }}
      >
        <MapContainer
          key={themeMode}
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          minZoom={4}
          maxZoom={12}
          scrollWheelZoom
          style={{ width: '100%', height: '100%', minHeight: 420 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />
          <InvalidateSizeOnMount />
          <FitSelection truck={selected} plant={selectedPlant} />
          <ClosePopupWhenPlantOpens plantId={selectedPlantId} />

          {BD_PLANT_SITES.map((plant) => (
            <CircleMarker
              key={plant.id}
              center={[plant.lat, plant.lng]}
              radius={plant.kind === 'distribution' ? 9 : 7}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: plantKindColor(plant.kind),
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  // Keep popup as primary; clear truck so plant focus is clear
                  setSelectedId(null);
                },
              }}
            >
              <Popup>
                <PlantMapPopup
                  plant={plant}
                  onSeeMore={() => openPlantWidget(plant.id)}
                />
              </Popup>
            </CircleMarker>
          ))}

          {filtered.map((truck) => (
            <React.Fragment key={`route-${truck.id}`}>
              <Polyline
                positions={[
                  [truck.origin.lat, truck.origin.lng],
                  [truck.destination.lat, truck.destination.lng],
                ]}
                pathOptions={{
                  color: statusColor(truck.status),
                  weight: truck.id === selected?.id ? 4 : 2,
                  opacity: truck.id === selected?.id ? 0.85 : 0.35,
                  dashArray: truck.status === 'customs' ? '6 8' : undefined,
                  interactive: false,
                }}
              />
              <FleetAssetMarker
                truck={truck}
                selected={truck.id === selected?.id}
                onSelect={openTruck}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Map legend */}
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            zIndex: 500,
            px: 1.25,
            py: 1,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid var(--paper-border-color)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" useFlexGap flexWrap="wrap">
            {[
              { c: tokenSuccess.main, l: 'On time' },
              { c: tokenWarning.main, l: 'At risk' },
              { c: tokenError.main, l: 'Delayed' },
              { c: tokenBrand.main, l: 'Customs' },
            ].map((item) => (
              <Stack key={item.l} direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: item.c }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: tokenText.secondary }}>{item.l}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Selected truck inspector — movable / resizable widget with tabs */}
        {selected ? (
          <TruckDetailWidget
            truck={selected}
            containerRef={mapStageRef}
            onClose={() => setSelectedId(null)}
            onContact={(kind) => contact(kind, selected)}
          />
        ) : null}

        {/* Selected plant inspector — movable / resizable widget with tabs */}
        {selectedPlant ? (
          <PlantDetailWidget
            plant={selectedPlant}
            relatedTrucks={plantTrucks}
            containerRef={mapStageRef}
            onClose={() => setSelectedPlantId(null)}
            onSelectTruck={openTruck}
            onContact={plantContact}
            modeFilter={modeFilter}
            productFilter={productFilter}
            demandStatusFilter={demandStatusFilter}
          />
        ) : null}
      </Paper>
    </Box>
  );
}

export default CtV2NetworkMapView;
