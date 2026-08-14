/** Keep in sync with `TransportMode` in fleetSimulation. */
type TransportMode = 'plane' | 'truck' | 'van' | 'ship' | 'train';

/** Resolve public asset paths for GitHub Pages (`/bd-ai-poc/`) and local `/`. */
export function fleetAssetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\//, '')}`;
}

export type CarrierProfile = {
  name: string;
  legalName: string;
  /** Registration / inscription id (SCAC, IATA, IMO DOC, MC#, CNPJ, etc.). */
  registrationId: string;
  registrationLabel: string;
  logoUrl: string;
  mode: TransportMode;
};

const MODE_PHOTOS: Record<TransportMode, string[]> = {
  plane: [
    'images/fleet/plane/Boeing-747-freighter.jpg',
    'images/fleet/plane/cargo-aircraft-FedEx.jpg',
    'images/fleet/plane/Airbus-freighter.jpg',
    'images/fleet/plane/plane1.jpg',
    'images/fleet/plane/plane2.jpg',
  ],
  truck: [
    'images/fleet/truck/truck-cascadia.jpg',
    'images/fleet/truck/truck3.jpg',
    'images/fleet/truck/truck2.jpg',
    'images/fleet/truck/truck5.jpg',
    'images/fleet/truck/truck1.jpg',
  ],
  van: [
    'images/fleet/van/van-ford.jpg',
    'images/fleet/van/van-renault.jpg',
    'images/fleet/van/van1.jpg',
    'images/fleet/van/van3.jpg',
  ],
  ship: [
    'images/fleet/ship/MSC-container-ship.jpg',
    'images/fleet/ship/HMM-container-ship.jpg',
    'images/fleet/ship/COSCO-container-ship.jpg',
    'images/fleet/ship/ship-one.jpg',
    'images/fleet/ship/ship-msc.jpg',
    'images/fleet/ship/ship1.jpg',
    'images/fleet/ship/ship2.jpg',
  ],
  train: [
    'images/fleet/train/BNSF-locomotive-orange.jpg',
    'images/fleet/train/train-bnsf2.jpg',
    'images/fleet/train/train-all.jpg',
    'images/fleet/train/train-br.jpg',
    'images/fleet/train/freight-train-locomotive.jpg',
    'images/fleet/train/train1.jpg',
  ],
};

export function vehiclePhotoFor(mode: TransportMode, seed: number) {
  const list = MODE_PHOTOS[mode];
  return fleetAssetUrl(list[seed % list.length]);
}

/** Demo carriers with logo + inscription id — one catalog per modal. */
export const CARRIERS_BY_MODE: Record<TransportMode, CarrierProfile[]> = {
  plane: [
    {
      mode: 'plane',
      name: 'Cargolux',
      legalName: 'Cargolux Airlines International S.A.',
      registrationId: 'CV / CLX',
      registrationLabel: 'IATA / ICAO',
      logoUrl: fleetAssetUrl('images/carriers/cargolux.svg'),
    },
    {
      mode: 'plane',
      name: 'FedEx Express',
      legalName: 'Federal Express Corporation',
      registrationId: 'FX / FDX',
      registrationLabel: 'IATA / ICAO',
      logoUrl: fleetAssetUrl('images/carriers/fedex.svg'),
    },
    {
      mode: 'plane',
      name: 'Atlas Air',
      legalName: 'Atlas Air, Inc.',
      registrationId: '5Y / GTI',
      registrationLabel: 'IATA / ICAO',
      logoUrl: fleetAssetUrl('images/carriers/atlas-air.svg'),
    },
    {
      mode: 'plane',
      name: 'DHL Aviation',
      legalName: 'European Air Transport Leipzig GmbH',
      registrationId: 'QY / BCS',
      registrationLabel: 'IATA / ICAO',
      logoUrl: fleetAssetUrl('images/carriers/dhl.svg'),
    },
  ],
  truck: [
    {
      mode: 'truck',
      name: 'Northern Corridor 4PL',
      legalName: 'Northern Corridor Freight LLC',
      registrationId: 'NCFQ',
      registrationLabel: 'SCAC',
      logoUrl: fleetAssetUrl('images/carriers/northern-corridor.svg'),
    },
    {
      mode: 'truck',
      name: 'BorderLink Logistics',
      legalName: 'BorderLink Logistics Inc.',
      registrationId: 'BDLK · MC-884210',
      registrationLabel: 'SCAC · MC#',
      logoUrl: fleetAssetUrl('images/carriers/borderlink.svg'),
    },
    {
      mode: 'truck',
      name: 'Gulf Pharma Transport',
      legalName: 'Gulf Pharma Transport S.A. de C.V.',
      registrationId: 'GPTX · MC-771045',
      registrationLabel: 'SCAC · MC#',
      logoUrl: fleetAssetUrl('images/carriers/gulf-pharma.svg'),
    },
    {
      mode: 'truck',
      name: 'Desert Corridor Freight',
      legalName: 'Desert Corridor Freight LLC',
      registrationId: 'DCRF',
      registrationLabel: 'SCAC',
      logoUrl: fleetAssetUrl('images/carriers/desert-corridor.svg'),
    },
  ],
  van: [
    {
      mode: 'van',
      name: 'Midwest BD Shuttle',
      legalName: 'Midwest BD Shuttle Co.',
      registrationId: 'MBDS · MC-552019',
      registrationLabel: 'SCAC · MC#',
      logoUrl: fleetAssetUrl('images/carriers/midwest-shuttle.svg'),
    },
    {
      mode: 'van',
      name: 'Nogales Crossdock',
      legalName: 'Nogales Crossdock Express',
      registrationId: 'NGXD',
      registrationLabel: 'SCAC',
      logoUrl: fleetAssetUrl('images/carriers/nogales.svg'),
    },
    {
      mode: 'van',
      name: 'Pacific Medical Freight',
      legalName: 'Pacific Medical Freight LLC',
      registrationId: 'PMFL',
      registrationLabel: 'SCAC',
      logoUrl: fleetAssetUrl('images/carriers/pacific-medical.svg'),
    },
  ],
  ship: [
    {
      mode: 'ship',
      name: 'MSC',
      legalName: 'Mediterranean Shipping Company S.A.',
      registrationId: 'MSCU · IMO 0154187',
      registrationLabel: 'SCAC · IMO DOC',
      logoUrl: fleetAssetUrl('images/carriers/msc.svg'),
    },
    {
      mode: 'ship',
      name: 'HMM',
      legalName: 'HMM Company Limited',
      registrationId: 'HDMU · IMO 0015927',
      registrationLabel: 'SCAC · IMO DOC',
      logoUrl: fleetAssetUrl('images/carriers/hmm.svg'),
    },
    {
      mode: 'ship',
      name: 'COSCO Shipping',
      legalName: 'COSCO SHIPPING Lines Co., Ltd.',
      registrationId: 'COSU · IMO 0196500',
      registrationLabel: 'SCAC · IMO DOC',
      logoUrl: fleetAssetUrl('images/carriers/cosco.svg'),
    },
    {
      mode: 'ship',
      name: 'ONE',
      legalName: 'Ocean Network Express Pte. Ltd.',
      registrationId: 'ONEY · IMO 0261827',
      registrationLabel: 'SCAC · IMO DOC',
      logoUrl: fleetAssetUrl('images/carriers/one.svg'),
    },
  ],
  train: [
    {
      mode: 'train',
      name: 'BNSF Railway',
      legalName: 'BNSF Railway Company',
      registrationId: 'BNSF',
      registrationLabel: 'SCAC / Mark',
      logoUrl: fleetAssetUrl('images/carriers/bnsf.svg'),
    },
    {
      mode: 'train',
      name: 'ALL',
      legalName: 'América Latina Logística S.A.',
      registrationId: 'ALL · CNPJ 02.387.241/0001-60',
      registrationLabel: 'Mark · CNPJ',
      logoUrl: fleetAssetUrl('images/carriers/all.svg'),
    },
    {
      mode: 'train',
      name: 'Brado Logistics',
      legalName: 'Brado Logística S.A.',
      registrationId: 'BRADO · CNPJ 11.315.548/0001-06',
      registrationLabel: 'Mark · CNPJ',
      logoUrl: fleetAssetUrl('images/carriers/brado.svg'),
    },
    {
      mode: 'train',
      name: 'RailMed Intermodal',
      legalName: 'RailMed Intermodal LLC',
      registrationId: 'RMID',
      registrationLabel: 'SCAC',
      logoUrl: fleetAssetUrl('images/carriers/railmed.svg'),
    },
  ],
};

export function carrierFor(mode: TransportMode, seed: number): CarrierProfile {
  const list = CARRIERS_BY_MODE[mode];
  return list[seed % list.length];
}
