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
import { BD_PLANT_SITES, type BdPlantSite } from './bdPlantSites';
import {
  fleetKpis,
  sampleLiveFleet,
  type FleetLane,
  type FleetStatus,
  type LiveTruck,
} from './fleetSimulation';
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
  const size = selected ? 34 : 28;
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:999px;
      background:${color};border:2px solid #fff;
      box-shadow:0 6px 16px rgba(0,0,0,.35);
      display:grid;place-items:center;
      transform: rotate(${truck.bearing}deg);
      ${selected ? 'outline:3px solid rgba(62,131,255,.55);outline-offset:2px;' : ''}
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
      </svg>
    </div>`;
  return L.divIcon({
    className: 'ct-v2-truck-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitSelection({ truck }: { truck: LiveTruck | null }) {
  const map = useMap();
  useEffect(() => {
    if (!truck) return;
    map.flyTo([truck.lat, truck.lng], Math.max(map.getZoom(), 7), { duration: 0.75 });
  }, [truck?.id]); // eslint-disable-line react-hooks/exhaustive-deps
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

type LaneFilter = 'all' | FleetLane;

export function CtV2NetworkMapView({ onToast }: { onToast?: (msg: string) => void }) {
  const { themeMode } = useThemeMode();
  const mapStageRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [laneFilter, setLaneFilter] = useState<LaneFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(id);
  }, []);

  const trucks = useMemo(() => sampleLiveFleet(now), [now]);
  const kpis = useMemo(() => fleetKpis(trucks), [trucks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trucks.filter((t) => {
      if (laneFilter !== 'all' && t.lane !== laneFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q)
        || t.driver.toLowerCase().includes(q)
        || t.carrier.toLowerCase().includes(q)
        || t.cargo.toLowerCase().includes(q)
        || t.origin.shortName.toLowerCase().includes(q)
        || t.destination.shortName.toLowerCase().includes(q)
      );
    });
  }, [trucks, laneFilter, query]);

  const selected = filtered.find((t) => t.id === selectedId) ?? trucks.find((t) => t.id === selectedId) ?? null;

  const tileUrl =
    themeMode === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const contact = (kind: 'driver' | 'carrier', truck: LiveTruck) => {
    const who = kind === 'driver' ? truck.driver : truck.carrier;
    const phone = kind === 'driver' ? truck.driverPhone : truck.carrierPhone;
    onToast?.(`${kind === 'driver' ? 'Driver' : 'Carrier'} contact opened · ${who} · ${phone}`);
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
            Real-time inbound / outbound / transfer simulation across BD plants & DCs.
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
              { l: 'Active trucks', v: kpis.active },
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
            placeholder="Search truck, driver, cargo…"
            sx={{ mt: 1.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 1.25 }}>
            {([
              ['all', 'All'],
              ['inbound', 'Inbound'],
              ['outbound', 'Outbound'],
              ['transfer', 'Transfer'],
            ] as const).map(([value, label]) => (
              <Chip
                key={value}
                size="small"
                label={label}
                onClick={() => setLaneFilter(value)}
                sx={{
                  fontWeight: 800,
                  fontSize: 11,
                  bgcolor: laneFilter === value ? tokenBrand.softBg : 'transparent',
                  color: laneFilter === value ? tokenBrand.main : tokenText.secondary,
                  border: `1px solid ${laneFilter === value ? tokenBrand.light : 'var(--paper-border-color)'}`,
                }}
              />
            ))}
          </Stack>
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
                  onClick={() => setSelectedId(truck.id)}
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
                No trucks match filters.
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
          '& .ct-v2-truck-marker': { background: 'transparent', border: 0 },
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
          <FitSelection truck={selected} />

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
                click: () => onToast?.(`${plant.shortName} · ${plant.focus}`),
              }}
            >
              <Popup>
                <strong>{plant.name}</strong>
                <br />
                {plant.address}
                <br />
                <em>{plant.focus}</em>
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
                }}
              />
              <Marker
                position={[truck.lat, truck.lng]}
                icon={truckIcon(truck, truck.id === selected?.id)}
                eventHandlers={{ click: () => setSelectedId(truck.id) }}
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
      </Paper>
    </Box>
  );
}

export default CtV2NetworkMapView;
