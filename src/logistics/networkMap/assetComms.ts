import type { LiveTruck } from './fleetSimulation';

export type AssetAlertSeverity = 'info' | 'warning' | 'critical';
export type AssetAlertSource = 'driver' | 'carrier' | 'telematics' | 'system';

export type AssetAlertKind =
  | 'flat_tire'
  | 'refueling'
  | 'electrical_failure'
  | 'out_of_fuel'
  | 'police_stop'
  | 'breakdown'
  | 'accident_nearby'
  | 'speed_rain'
  | 'speed_snow'
  | 'speed_fog'
  | 'speed_wind'
  | 'flood_detour'
  | 'wildfire_smoke'
  | 'earthquake_advisory'
  | 'road_closure'
  | 'cargo_shift'
  | 'temperature_deviation'
  | 'seal_broken'
  | 'hos_rest'
  | 'customs_hold'
  | 'port_congestion'
  | 'engine_overheat'
  | 'low_oil_pressure'
  | 'trailer_abs'
  | 'gps_jamming';

export type AssetAlert = {
  id: string;
  kind: AssetAlertKind;
  severity: AssetAlertSeverity;
  source: AssetAlertSource;
  title: string;
  message: string;
  location: string;
  createdAt: Date;
  acknowledged: boolean;
};

export type ChatAttachmentKind = 'file' | 'image' | 'audio';

export type ChatAttachment = {
  id: string;
  kind: ChatAttachmentKind;
  name: string;
  sizeLabel: string;
};

export type ChatMessage = {
  id: string;
  from: 'ops' | 'driver' | 'carrier' | 'system';
  author: string;
  text: string;
  sentAt: Date;
  attachments?: ChatAttachment[];
  audioSeconds?: number;
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ALERT_CATALOG: Array<Omit<AssetAlert, 'id' | 'createdAt' | 'acknowledged' | 'location'>> = [
  {
    kind: 'flat_tire',
    severity: 'critical',
    source: 'driver',
    title: 'Flat tire',
    message: 'Right outer drive tire flat. Requesting roadside and ETA revision.',
  },
  {
    kind: 'refueling',
    severity: 'info',
    source: 'driver',
    title: 'Refueling',
    message: 'Stopped at service plaza for fuel / DEF. Back rolling in ~20 minutes.',
  },
  {
    kind: 'electrical_failure',
    severity: 'critical',
    source: 'telematics',
    title: 'Electrical failure',
    message: 'Alternator / battery voltage drop detected. Lights unstable.',
  },
  {
    kind: 'out_of_fuel',
    severity: 'critical',
    source: 'driver',
    title: 'Out of fuel (dry run)',
    message: 'Unit stopped — fuel exhausted before next planned stop. Need emergency fuel.',
  },
  {
    kind: 'police_stop',
    severity: 'warning',
    source: 'driver',
    title: 'Police stop',
    message: 'Pulled over for inspection. Papers ready. Will update when released.',
  },
  {
    kind: 'breakdown',
    severity: 'critical',
    source: 'carrier',
    title: 'Vehicle breakdown',
    message: 'Mechanical failure reported. Tow / mobile mechanic dispatched.',
  },
  {
    kind: 'speed_rain',
    severity: 'warning',
    source: 'telematics',
    title: 'Reduced speed · rain',
    message: 'Heavy rain — speed reduced for safety. Expect +25–40 min delay.',
  },
  {
    kind: 'speed_snow',
    severity: 'warning',
    source: 'driver',
    title: 'Reduced speed · snow / ice',
    message: 'Snow pack on corridor. Chains/check required. Rolling at reduced speed.',
  },
  {
    kind: 'speed_fog',
    severity: 'warning',
    source: 'telematics',
    title: 'Reduced speed · fog',
    message: 'Dense fog. Hazard lights on. Speed limited by visibility.',
  },
  {
    kind: 'speed_wind',
    severity: 'warning',
    source: 'telematics',
    title: 'High wind advisory',
    message: 'Crosswinds above threshold for high cube. Temporary hold at turnout.',
  },
  {
    kind: 'flood_detour',
    severity: 'critical',
    source: 'carrier',
    title: 'Flood detour',
    message: 'Primary highway closed due to flooding. Reroute approved via alternate.',
  },
  {
    kind: 'wildfire_smoke',
    severity: 'warning',
    source: 'carrier',
    title: 'Wildfire / smoke corridor',
    message: 'Smoke reducing visibility. Following civil defense guidance.',
  },
  {
    kind: 'earthquake_advisory',
    severity: 'critical',
    source: 'system',
    title: 'Natural disaster advisory',
    message: 'Seismic / disaster advisory on lane. Holding until route cleared.',
  },
  {
    kind: 'road_closure',
    severity: 'warning',
    source: 'carrier',
    title: 'Road closure',
    message: 'Unexpected closure ahead. Waiting for updated appointment window.',
  },
  {
    kind: 'cargo_shift',
    severity: 'warning',
    source: 'driver',
    title: 'Cargo shift suspected',
    message: 'Felt load movement after hard brake. Requesting secure-check stop.',
  },
  {
    kind: 'temperature_deviation',
    severity: 'critical',
    source: 'telematics',
    title: 'Temperature deviation',
    message: 'Reefer / ambient probe outside band for 12+ minutes.',
  },
  {
    kind: 'seal_broken',
    severity: 'critical',
    source: 'driver',
    title: 'Seal anomaly',
    message: 'Seal number mismatch or broken seal observed at stop.',
  },
  {
    kind: 'hos_rest',
    severity: 'info',
    source: 'driver',
    title: 'HOS rest break',
    message: 'Mandatory hours-of-service rest started. Resume after break.',
  },
  {
    kind: 'customs_hold',
    severity: 'warning',
    source: 'carrier',
    title: 'Customs hold',
    message: 'Shipment held at border for secondary review / docs.',
  },
  {
    kind: 'port_congestion',
    severity: 'info',
    source: 'carrier',
    title: 'Port / yard congestion',
    message: 'Berth or gate congestion. Slot slipped; new ETA pending.',
  },
  {
    kind: 'engine_overheat',
    severity: 'critical',
    source: 'telematics',
    title: 'Engine overheat',
    message: 'Coolant temp high. Pulled over safely. Waiting on service.',
  },
  {
    kind: 'low_oil_pressure',
    severity: 'critical',
    source: 'telematics',
    title: 'Low oil pressure',
    message: 'Oil pressure warning lamp. Engine shut down per SOP.',
  },
  {
    kind: 'trailer_abs',
    severity: 'warning',
    source: 'telematics',
    title: 'Trailer ABS fault',
    message: 'ABS fault code on trailer. Continuing at reduced speed to shop.',
  },
  {
    kind: 'gps_jamming',
    severity: 'warning',
    source: 'telematics',
    title: 'GPS signal loss',
    message: 'Intermittent GPS / possible jamming corridor. Using last known + dead reckoning.',
  },
  {
    kind: 'accident_nearby',
    severity: 'warning',
    source: 'driver',
    title: 'Accident on route',
    message: 'Multi-vehicle accident ahead. Queued in traffic; seeking alternate.',
  },
];

export function buildAssetAlerts(truck: LiveTruck, nowMs = Date.now()): AssetAlert[] {
  const h = hash(truck.id + truck.mode);
  const count = 5 + (h % 5);
  const alerts: AssetAlert[] = [];
  for (let i = 0; i < count; i += 1) {
    const catalog = ALERT_CATALOG[(h + i * 7) % ALERT_CATALOG.length];
    const minsAgo = 8 + ((h + i * 13) % 280);
    const pathIdx = Math.min(
      Math.max(0, truck.path.length - 1),
      Math.floor((truck.progress * 0.85 + i * 0.03) * Math.max(1, truck.path.length - 1)),
    );
    const pt = truck.path[pathIdx] ?? [truck.lat, truck.lng];
    alerts.push({
      ...catalog,
      id: `${truck.id}-alert-${i}-${catalog.kind}`,
      createdAt: new Date(nowMs - minsAgo * 60_000),
      acknowledged: i > 2 && (h + i) % 3 === 0,
      location: `${pt[0].toFixed(3)}°, ${pt[1].toFixed(3)}° · near ${truck.progress > 0.5 ? truck.destination.shortName : truck.origin.shortName}`,
    });
  }
  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function buildSeedChat(truck: LiveTruck, nowMs = Date.now()): ChatMessage[] {
  const driver = truck.driver;
  const carrier = truck.carrier;
  return [
    {
      id: `${truck.id}-m1`,
      from: 'system',
      author: 'Control Tower',
      text: `Thread opened for ${truck.id} · ${truck.origin.shortName} → ${truck.destination.shortName}`,
      sentAt: new Date(nowMs - 3 * 3600_000),
    },
    {
      id: `${truck.id}-m2`,
      from: 'ops',
      author: 'You',
      text: `Hi ${driver.split(' ')[0]} — please confirm seal and temp before rolling.`,
      sentAt: new Date(nowMs - 2.6 * 3600_000),
    },
    {
      id: `${truck.id}-m3`,
      from: 'driver',
      author: driver,
      text: 'Seal matched. Temp stable. Gate out in 10.',
      sentAt: new Date(nowMs - 2.4 * 3600_000),
      attachments: [
        { id: 'a1', kind: 'image', name: 'seal-photo.jpg', sizeLabel: '840 KB' },
      ],
    },
    {
      id: `${truck.id}-m4`,
      from: 'carrier',
      author: carrier,
      text: 'Dispatch copied. Toll pre-pass active on this lane.',
      sentAt: new Date(nowMs - 2.1 * 3600_000),
    },
    {
      id: `${truck.id}-m5`,
      from: 'driver',
      author: driver,
      text: 'Voice note: traffic ahead, may take rest earlier.',
      sentAt: new Date(nowMs - 55 * 60_000),
      audioSeconds: 18,
    },
    {
      id: `${truck.id}-m6`,
      from: 'ops',
      author: 'You',
      text: 'Understood. Keep us posted if weather worsens.',
      sentAt: new Date(nowMs - 50 * 60_000),
    },
  ];
}

export function formatChatTime(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function alertSeverityLabel(s: AssetAlertSeverity) {
  if (s === 'critical') return 'Critical';
  if (s === 'warning') return 'Warning';
  return 'Info';
}
