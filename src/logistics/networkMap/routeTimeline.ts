import type { BdPlantSite } from './bdPlantSites';
import type { DemandDueStatus, FleetStatus, LiveTruck, TransportMode } from './fleetSimulation';

export type RouteStopKind =
  | 'depart'
  | 'arrive'
  | 'load'
  | 'unload'
  | 'transfer'
  | 'fuel'
  | 'bunker'
  | 'rest'
  | 'sleep'
  | 'meal'
  | 'toll'
  | 'customs'
  | 'waypoint'
  | 'port_call'
  | 'airport'
  | 'rail_yard'
  | 'pilot';

/** Color = deadline health. Blinking is controlled separately via `active`. */
export type RouteDueTone = 'completed' | 'on_time' | 'nearing_due' | 'overdue' | 'scheduled';

export type RouteStop = {
  id: string;
  seq: number;
  kind: RouteStopKind;
  title: string;
  location: string;
  address: string;
  plannedAt: Date;
  plannedEndAt: Date;
  progressAt: number;
  /** Deadline / schedule color signal. */
  dueTone: RouteDueTone;
  /** True only for the step currently underway (blinks in any dueTone color). */
  active: boolean;
  notes: string;
};

export function routeStopKindLabel(kind: RouteStopKind) {
  const map: Record<RouteStopKind, string> = {
    depart: 'Departure',
    arrive: 'Arrival',
    load: 'Loading',
    unload: 'Unloading',
    transfer: 'Transfer',
    fuel: 'Refuel',
    bunker: 'Bunkering',
    rest: 'Rest break',
    sleep: 'Driver sleep',
    meal: 'Meal stop',
    toll: 'Toll',
    customs: 'Customs / border',
    waypoint: 'Waypoint',
    port_call: 'Port call',
    airport: 'Airport handling',
    rail_yard: 'Rail yard',
    pilot: 'Pilot boarding',
  };
  return map[kind];
}

export function routeStopStatusLabel(stop: Pick<RouteStop, 'dueTone' | 'active'>) {
  if (stop.active) {
    if (stop.dueTone === 'overdue') return 'In progress · Overdue';
    if (stop.dueTone === 'nearing_due') return 'In progress · Nearing due';
    return 'In progress · On time';
  }
  if (stop.dueTone === 'completed') return 'Completed';
  if (stop.dueTone === 'nearing_due') return 'Nearing due';
  if (stop.dueTone === 'overdue') return 'Overdue';
  if (stop.dueTone === 'on_time') return 'On time';
  return 'Scheduled';
}

type StopSeed = {
  kind: RouteStopKind;
  progressAt: number;
  dwellMin: number;
  title: string;
  location: string;
  address: string;
  notes: string;
};

function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fmtCoord(lat: number, lng: number) {
  return `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
}

function plantAddress(plant: BdPlantSite) {
  return plant.address;
}

function midPathPoint(truck: LiveTruck, t: number): { lat: number; lng: number } {
  const path = truck.path;
  if (!path || path.length < 2) {
    return {
      lat: truck.origin.lat + (truck.destination.lat - truck.origin.lat) * t,
      lng: truck.origin.lng + (truck.destination.lng - truck.origin.lng) * t,
    };
  }
  const idx = Math.min(path.length - 1, Math.max(0, Math.round(t * (path.length - 1))));
  const p = path[idx];
  return { lat: p[0], lng: p[1] };
}

function crossBorder(truck: LiveTruck) {
  return truck.origin.country !== truck.destination.country;
}

function modeStops(truck: LiveTruck): StopSeed[] {
  const o = truck.origin;
  const d = truck.destination;
  const border = crossBorder(truck);
  const midA = midPathPoint(truck, 0.22);
  const midB = midPathPoint(truck, 0.48);
  const midC = midPathPoint(truck, 0.72);

  if (truck.mode === 'plane') {
    return [
      {
        kind: 'load',
        progressAt: 0.02,
        dwellMin: 55,
        title: 'Cargo acceptance & ULD build',
        location: `${o.shortName} air cargo`,
        address: plantAddress(o),
        notes: 'Security screening · Temperature logger armed · AWB check',
      },
      {
        kind: 'airport',
        progressAt: 0.08,
        dwellMin: 35,
        title: 'Ramp departure',
        location: `${o.city} apron`,
        address: plantAddress(o),
        notes: 'Pushback · Weight & balance confirmed',
      },
      {
        kind: 'depart',
        progressAt: 0.12,
        dwellMin: 10,
        title: 'Wheels up',
        location: o.shortName,
        address: plantAddress(o),
        notes: `Flight ${truck.trailer} · Climb to cruise`,
      },
      {
        kind: 'waypoint',
        progressAt: 0.35,
        dwellMin: 5,
        title: 'En-route waypoint',
        location: `Air corridor · ${fmtCoord(midA.lat, midA.lng)}`,
        address: `ATC sector near ${fmtCoord(midA.lat, midA.lng)}`,
        notes: 'Position report · Fuel burn check',
      },
      {
        kind: 'waypoint',
        progressAt: 0.55,
        dwellMin: 5,
        title: 'Oceanic / FIR handoff',
        location: `Waypoint · ${fmtCoord(midB.lat, midB.lng)}`,
        address: fmtCoord(midB.lat, midB.lng),
        notes: 'Crew meal on flight deck · SATCOM update',
      },
      {
        kind: 'customs',
        progressAt: 0.82,
        dwellMin: 40,
        title: border ? 'Arrival customs & agriculture' : 'Inbound cargo hold inspection',
        location: `${d.shortName} cargo terminal`,
        address: plantAddress(d),
        notes: border ? 'Manifest · Bonds · Hold for clearance' : 'Random QA sampling',
      },
      {
        kind: 'unload',
        progressAt: 0.92,
        dwellMin: 50,
        title: 'ULD breakdown & dock handoff',
        location: `${d.shortName} receiving`,
        address: plantAddress(d),
        notes: 'Cold-chain unbroken · ASN match',
      },
      {
        kind: 'arrive',
        progressAt: 0.98,
        dwellMin: 15,
        title: 'Flight closed',
        location: d.shortName,
        address: plantAddress(d),
        notes: 'Crew rest window starts',
      },
    ];
  }

  if (truck.mode === 'ship') {
    return [
      {
        kind: 'load',
        progressAt: 0.03,
        dwellMin: 180,
        title: 'Berth loading',
        location: `${o.shortName} terminal`,
        address: plantAddress(o),
        notes: 'Stow plan · Lashing · Bill of lading draft',
      },
      {
        kind: 'pilot',
        progressAt: 0.1,
        dwellMin: 45,
        title: 'Pilot on board · Departure',
        location: `${o.city} approaches`,
        address: plantAddress(o),
        notes: 'Harbor speed · Tug assist released',
      },
      {
        kind: 'bunker',
        progressAt: 0.18,
        dwellMin: 90,
        title: 'Bunkering / stores',
        location: `Offshore bunker · ${fmtCoord(midA.lat, midA.lng)}`,
        address: fmtCoord(midA.lat, midA.lng),
        notes: 'Fuel receipt · MARPOL checklist',
      },
      {
        kind: 'waypoint',
        progressAt: 0.4,
        dwellMin: 20,
        title: 'Sea lane waypoint',
        location: `Shipping lane · ${fmtCoord(midB.lat, midB.lng)}`,
        address: fmtCoord(midB.lat, midB.lng),
        notes: 'Watch change · Weather routing update',
      },
      {
        kind: 'port_call',
        progressAt: 0.58,
        dwellMin: 120,
        title: 'Intermediate port call',
        location: `Feeder hub · ${fmtCoord(midC.lat, midC.lng)}`,
        address: fmtCoord(midC.lat, midC.lng),
        notes: 'Pilotage · Partial restow if required',
      },
      {
        kind: 'customs',
        progressAt: 0.78,
        dwellMin: 150,
        title: border ? 'Port customs & quarantine' : 'Arrival notice',
        location: `${d.shortName} port authority`,
        address: plantAddress(d),
        notes: border ? 'ISF / entry filing · Hold if docs lag' : 'Harbor master slot',
      },
      {
        kind: 'pilot',
        progressAt: 0.86,
        dwellMin: 40,
        title: 'Arrival pilot · Berthing',
        location: `${d.city} channel`,
        address: plantAddress(d),
        notes: 'Tug make-fast · Mooring complete',
      },
      {
        kind: 'unload',
        progressAt: 0.94,
        dwellMin: 200,
        title: 'Discharge to shore',
        location: `${d.shortName} quay`,
        address: plantAddress(d),
        notes: 'Survey · Gate out to DC',
      },
      {
        kind: 'arrive',
        progressAt: 0.99,
        dwellMin: 20,
        title: 'Voyage complete',
        location: d.shortName,
        address: plantAddress(d),
        notes: 'Crew shore leave window',
      },
    ];
  }

  if (truck.mode === 'train') {
    return [
      {
        kind: 'load',
        progressAt: 0.04,
        dwellMin: 90,
        title: 'Railcar loading',
        location: `${o.shortName} spur`,
        address: plantAddress(o),
        notes: 'Block train build · Seal check',
      },
      {
        kind: 'rail_yard',
        progressAt: 0.12,
        dwellMin: 60,
        title: 'Origin classification yard',
        location: `${o.city} yard`,
        address: plantAddress(o),
        notes: 'Consist verification · Brake test',
      },
      {
        kind: 'depart',
        progressAt: 0.16,
        dwellMin: 10,
        title: 'Train departs',
        location: o.shortName,
        address: plantAddress(o),
        notes: `Unit ${truck.trailer}`,
      },
      {
        kind: 'waypoint',
        progressAt: 0.38,
        dwellMin: 25,
        title: 'Crew change / siding',
        location: `Rail siding · ${fmtCoord(midB.lat, midB.lng)}`,
        address: fmtCoord(midB.lat, midB.lng),
        notes: 'Hotbox scan · Continuity test',
      },
      {
        kind: 'customs',
        progressAt: 0.62,
        dwellMin: 75,
        title: border ? 'Border rail customs' : 'Interchange inspection',
        location: border ? `Border yard · ${fmtCoord(midC.lat, midC.lng)}` : `${d.city} interchange`,
        address: border ? fmtCoord(midC.lat, midC.lng) : plantAddress(d),
        notes: border ? 'Manifest · Seal integrity' : 'Handoff to connecting road',
      },
      {
        kind: 'rail_yard',
        progressAt: 0.84,
        dwellMin: 70,
        title: 'Destination yard',
        location: `${d.shortName} yard`,
        address: plantAddress(d),
        notes: 'Cut cars · Spot to dock',
      },
      {
        kind: 'unload',
        progressAt: 0.93,
        dwellMin: 80,
        title: 'Rail unloading',
        location: `${d.shortName} dock`,
        address: plantAddress(d),
        notes: 'Transfer to warehouse staging',
      },
      {
        kind: 'arrive',
        progressAt: 0.98,
        dwellMin: 15,
        title: 'Rail move closed',
        location: d.shortName,
        address: plantAddress(d),
        notes: 'Empty release planned',
      },
    ];
  }

  // Truck / van — road itinerary with tolls, fuel, meals, rest, customs
  const stops: StopSeed[] = [
    {
      kind: 'load',
      progressAt: 0.03,
      dwellMin: 45,
      title: 'Dock loading',
      location: `${o.shortName} shipping dock`,
      address: plantAddress(o),
      notes: 'Seal applied · Temperature set · Driver briefing',
    },
    {
      kind: 'depart',
      progressAt: 0.08,
      dwellMin: 5,
      title: 'Gate out',
      location: o.shortName,
      address: plantAddress(o),
      notes: `Unit ${truck.trailer} · GPS armed`,
    },
    {
      kind: 'toll',
      progressAt: 0.16,
      dwellMin: 8,
      title: 'Toll plaza',
      location: `Toll · near ${fmtCoord(midA.lat, midA.lng)}`,
      address: fmtCoord(midA.lat, midA.lng),
      notes: 'Electronic toll · Axle class check',
    },
    {
      kind: 'fuel',
      progressAt: 0.28,
      dwellMin: 25,
      title: truck.mode === 'van' ? 'Fuel / EV charge' : 'Fuel stop',
      location: `Service plaza · ${fmtCoord(midA.lat, midA.lng)}`,
      address: fmtCoord(midA.lat, midA.lng),
      notes: 'DEF top-up · Walk-around inspection',
    },
    {
      kind: 'meal',
      progressAt: 0.36,
      dwellMin: 35,
      title: 'Driver meal',
      location: `Rest food court · ${fmtCoord(midB.lat, midB.lng)}`,
      address: fmtCoord(midB.lat, midB.lng),
      notes: 'HOS meal credit · Secure parking',
    },
  ];

  if (border) {
    stops.push({
      kind: 'customs',
      progressAt: 0.5,
      dwellMin: 70,
      title: 'Border / customs clearance',
      location: `${o.country} → ${d.country} crossing`,
      address: fmtCoord(midB.lat, midB.lng),
      notes: 'Papers · X-ray lane · Possible secondary',
    });
  } else {
    stops.push({
      kind: 'waypoint',
      progressAt: 0.5,
      dwellMin: 12,
      title: 'Corridor checkpoint',
      location: `Highway waypoint · ${fmtCoord(midB.lat, midB.lng)}`,
      address: fmtCoord(midB.lat, midB.lng),
      notes: 'Weigh station bypass if pre-pass OK',
    });
  }

  stops.push(
    {
      kind: 'rest',
      progressAt: 0.62,
      dwellMin: 40,
      title: 'Mandatory rest break',
      location: `Rest area · ${fmtCoord(midC.lat, midC.lng)}`,
      address: fmtCoord(midC.lat, midC.lng),
      notes: 'HOS compliance · Cab secure',
    },
    {
      kind: 'sleep',
      progressAt: 0.7,
      dwellMin: truck.mode === 'van' ? 50 : 90,
      title: truck.mode === 'van' ? 'Extended rest' : 'Sleeper berth',
      location: `Truck stop · ${fmtCoord(midC.lat, midC.lng)}`,
      address: fmtCoord(midC.lat, midC.lng),
      notes: 'Quiet lot · Dual-driver handoff if team',
    },
    {
      kind: 'fuel',
      progressAt: 0.8,
      dwellMin: 20,
      title: 'Final fuel top-up',
      location: `Fuel island · approach ${d.shortName}`,
      address: fmtCoord(
        midPathPoint(truck, 0.8).lat,
        midPathPoint(truck, 0.8).lng,
      ),
      notes: 'Range to destination confirmed',
    },
    {
      kind: 'transfer',
      progressAt: 0.88,
      dwellMin: 30,
      title: 'Cross-dock / yard transfer',
      location: `${d.shortName} yard`,
      address: plantAddress(d),
      notes: 'Appointment window · Gate check-in',
    },
    {
      kind: 'unload',
      progressAt: 0.94,
      dwellMin: 55,
      title: 'Unloading at dock',
      location: `${d.shortName} receiving`,
      address: plantAddress(d),
      notes: 'Seal broken with witness · Count verify',
    },
    {
      kind: 'arrive',
      progressAt: 0.99,
      dwellMin: 10,
      title: 'Trip closed',
      location: d.shortName,
      address: plantAddress(d),
      notes: 'POD signed · Empty instructions',
    },
  );

  return stops;
}

function tripDueTone(demandStatus: DemandDueStatus, fleetStatus: FleetStatus): RouteDueTone {
  if (demandStatus === 'overdue' || demandStatus === 'delayed' || fleetStatus === 'delayed') return 'overdue';
  if (
    demandStatus === 'nearing_due'
    || demandStatus === 'at_risk'
    || fleetStatus === 'at_risk'
    || fleetStatus === 'customs'
  ) {
    return 'nearing_due';
  }
  return 'on_time';
}

function resolveDueTone(
  progressAt: number,
  actualProgress: number,
  demandStatus: DemandDueStatus,
  fleetStatus: FleetStatus,
  plannedEndAt: Date,
  plannedAt: Date,
  nowMs: number,
  active: boolean,
): RouteDueTone {
  const completedCut = progressAt + 0.025;
  if (actualProgress >= completedCut && !active) return 'completed';

  const health = tripDueTone(demandStatus, fleetStatus);

  if (active) return health === 'scheduled' ? 'on_time' : health;

  // Upcoming
  if (actualProgress < progressAt) {
    if (plannedEndAt.getTime() < nowMs) return 'overdue';
    if (health === 'overdue' && progressAt < actualProgress + 0.28) return 'overdue';
    if (health === 'nearing_due' && progressAt <= actualProgress + 0.22) return 'nearing_due';
    if (
      plannedAt.getTime() - nowMs < 45 * 60_000
      && plannedAt.getTime() > nowMs
      && health === 'nearing_due'
    ) {
      return 'nearing_due';
    }
    return 'scheduled';
  }

  return health === 'on_time' ? 'scheduled' : health;
}

/**
 * Build a detailed operational timeline for the live asset,
 * keyed to current trip progress (0..1).
 */
export function buildRouteTimeline(truck: LiveTruck, nowMs = Date.now()): RouteStop[] {
  const seeds = modeStops(truck).sort((a, b) => a.progressAt - b.progressAt);
  const tripMs = Math.max(45, truck.durationSec) * 1000;
  const startMs = nowMs - truck.progress * tripMs;

  let inProgressIndex = 0;
  for (let i = 0; i < seeds.length; i += 1) {
    if (truck.progress >= seeds[i].progressAt - 0.02) inProgressIndex = i;
  }
  if (truck.progress >= (seeds[seeds.length - 1]?.progressAt ?? 1) + 0.02) {
    inProgressIndex = -1;
  }

  return seeds.map((seed, index) => {
    const plannedAt = new Date(startMs + seed.progressAt * tripMs);
    const plannedEndAt = new Date(plannedAt.getTime() + seed.dwellMin * 60_000);
    const active = index === inProgressIndex;
    const dueTone = resolveDueTone(
      seed.progressAt,
      truck.progress,
      truck.demandStatus,
      truck.status,
      plannedEndAt,
      plannedAt,
      nowMs,
      active,
    );

    return {
      id: `${truck.id}-stop-${index}-${seed.kind}`,
      seq: index + 1,
      kind: seed.kind,
      title: seed.title,
      location: seed.location,
      address: seed.address,
      plannedAt,
      plannedEndAt,
      progressAt: seed.progressAt,
      dueTone: active && dueTone === 'completed' ? 'on_time' : dueTone,
      active,
      notes: seed.notes,
    };
  });
}

export function formatStopWhen(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Stable-ish jitter helper kept for future seed variation. */
export function routeSeedSalt(truckId: string) {
  return hashId(truckId) % 97;
}

export type { TransportMode };
