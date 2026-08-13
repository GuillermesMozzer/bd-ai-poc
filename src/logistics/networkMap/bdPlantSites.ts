export type BdPlantCountry =
  | 'US'
  | 'MX'
  | 'CA'
  | 'BR'
  | 'AR'
  | 'IE'
  | 'FR'
  | 'DE'
  | 'ES'
  | 'UK'
  | 'CN'
  | 'SG'
  | 'JP'
  | 'IN'
  | 'ZA'
  | 'MA'
  | 'AU'
  | 'NZ';

export type BdPlantKind = 'manufacturing' | 'distribution' | 'campus' | 'pharma';
export type BdContinent = 'americas' | 'europe' | 'asia' | 'africa' | 'oceania';

export type BdPlantSite = {
  id: string;
  name: string;
  shortName: string;
  country: BdPlantCountry;
  continent: BdContinent;
  kind: BdPlantKind;
  address: string;
  city: string;
  focus: string;
  lat: number;
  lng: number;
};

export const BD_CONTINENTS: BdContinent[] = ['americas', 'europe', 'asia', 'africa', 'oceania'];

export function continentLabel(continent: BdContinent) {
  if (continent === 'americas') return 'Americas';
  if (continent === 'europe') return 'Europe';
  if (continent === 'asia') return 'Asia';
  if (continent === 'africa') return 'Africa';
  return 'Oceania';
}

/** BD manufacturing / DC network used by the 4PL live map (approx. site centroids). */
export const BD_PLANT_SITES: BdPlantSite[] = [
  // Americas — USA / Mexico corridor
  {
    id: 'us-canaan',
    name: 'Becton Dickinson & Co — Canaan',
    shortName: 'Canaan CT',
    country: 'US',
    continent: 'americas',
    kind: 'manufacturing',
    address: '7 Grace Way, Canaan, CT 06018, USA',
    city: 'Canaan, CT',
    focus: 'Syringes & needles (legacy flagship)',
    lat: 41.9612,
    lng: -73.3293,
  },
  {
    id: 'us-columbus-west',
    name: 'Columbus West (Nebraska)',
    shortName: 'Columbus West',
    country: 'US',
    continent: 'americas',
    kind: 'manufacturing',
    address: '1852 10th Ave, Columbus, NE 68601, USA',
    city: 'Columbus, NE',
    focus: 'High-scale syringes & delivery systems',
    lat: 41.4298,
    lng: -97.3684,
  },
  {
    id: 'us-columbus-pharma',
    name: 'BD Medical — Pharmaceutical Systems',
    shortName: 'Columbus Pharma',
    country: 'US',
    continent: 'americas',
    kind: 'pharma',
    address: '920 E 19th St, Columbus, NE 68601, USA',
    city: 'Columbus, NE',
    focus: 'Advanced pharmaceutical systems',
    lat: 41.4331,
    lng: -97.3502,
  },
  {
    id: 'us-sandy',
    name: 'Becton Dickinson — Sandy',
    shortName: 'Sandy UT',
    country: 'US',
    continent: 'americas',
    kind: 'manufacturing',
    address: '9450 S State St, Sandy, UT 84070, USA',
    city: 'Sandy, UT',
    focus: 'IV catheters & surgical devices',
    lat: 40.5724,
    lng: -111.8601,
  },
  {
    id: 'us-elpaso',
    name: 'Becton Dickinson — El Paso',
    shortName: 'El Paso TX',
    country: 'US',
    continent: 'americas',
    kind: 'manufacturing',
    address: '1550 Northwestern Dr, El Paso, TX 79912, USA',
    city: 'El Paso, TX',
    focus: 'Infusion / CareFusion logistics hub',
    lat: 31.8615,
    lng: -106.5459,
  },
  {
    id: 'us-franklin',
    name: 'BD Franklin Lakes Campus',
    shortName: 'Franklin Lakes',
    country: 'US',
    continent: 'americas',
    kind: 'campus',
    address: '1 Becton Drive, Franklin Lakes, NJ 07417, USA',
    city: 'Franklin Lakes, NJ',
    focus: 'Global HQ & research campus',
    lat: 41.0167,
    lng: -74.2058,
  },
  {
    id: 'mx-cuautitlan',
    name: 'Cuautitlan Izcalli — Manufacturing',
    shortName: 'Cuautitlan',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Autopista Queretaro - Mexico Km 37.4, Industrial Cuamatla, 54730 Cuautitlan Izcalli, Mexico',
    city: 'Cuautitlan Izcalli',
    focus: 'Disposable syringes & needles',
    lat: 19.6436,
    lng: -99.2118,
  },
  {
    id: 'mx-tepotzotlan',
    name: 'Tepotzotlan — Primary DC',
    shortName: 'Tepotzotlan DC',
    country: 'MX',
    continent: 'americas',
    kind: 'distribution',
    address: 'Carretera Tepotzotlan La Aurora Km 1 S/N, Col. Axotlan, C.P. 54716 Cuautitlan Izcalli, Mexico',
    city: 'Tepotzotlan',
    focus: 'Primary distribution hub',
    lat: 19.7142,
    lng: -99.2219,
  },
  {
    id: 'mx-tijuana-1',
    name: 'Tijuana — Plant 1',
    shortName: 'Tijuana P1',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Calle 12 Norte No. 120, Ciudad Industrial Nueva Tijuana, C.P. 22444 Tijuana, B.C., Mexico',
    city: 'Tijuana, BC',
    focus: 'Infusion & medication management',
    lat: 32.5149,
    lng: -116.9701,
  },
  {
    id: 'mx-tijuana-2',
    name: 'Tijuana — Plant 2 (Alaris / CareFusion)',
    shortName: 'Tijuana Alaris',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. Produccion No. 20, Parque Industrial Internacional Tijuana, C.P. 22424 Tijuana, B.C., Mexico',
    city: 'Tijuana, BC',
    focus: 'Alaris infusion pumps',
    lat: 32.5052,
    lng: -116.9504,
  },
  {
    id: 'mx-nogales-norte',
    name: 'Nogales Norte',
    shortName: 'Nogales Norte',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. De los Anhelos No. 35, Parque Industrial Nuevo Nogales, C.P. 84094 Nogales, Son., Mexico',
    city: 'Nogales, Son.',
    focus: 'Medical components',
    lat: 31.3085,
    lng: -110.9421,
  },
  {
    id: 'mx-nogales-sur',
    name: 'Nogales Sur',
    shortName: 'Nogales Sur',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Carretera Internacional Km 6.5, Parque Industrial San Carlos, C.P. 84090 Nogales, Son., Mexico',
    city: 'Nogales, Son.',
    focus: 'Sterile assembly',
    lat: 31.2804,
    lng: -110.9452,
  },
  {
    id: 'mx-hermosillo',
    name: 'Hermosillo',
    shortName: 'Hermosillo',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Calle De la Plata S/N, Parque Industrial Hermosillo, C.P. 83299 Hermosillo, Son., Mexico',
    city: 'Hermosillo, Son.',
    focus: 'Collection & diagnostics',
    lat: 29.0892,
    lng: -110.9613,
  },
  {
    id: 'mx-juarez',
    name: 'Ciudad Juarez',
    shortName: 'Ciudad Juarez',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. Intermex No. 1651, Parque Industrial Intermex, C.P. 32690 Ciudad Juarez, Chih., Mexico',
    city: 'Ciudad Juarez',
    focus: 'Advanced infusion devices',
    lat: 31.6904,
    lng: -106.4245,
  },
  {
    id: 'mx-reynosa',
    name: 'Reynosa',
    shortName: 'Reynosa',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. Industrial Falcon S/N, Parque Industrial del Norte, C.P. 88730 Reynosa, Tamps., Mexico',
    city: 'Reynosa, Tamps.',
    focus: 'Diabetes & control products',
    lat: 26.0508,
    lng: -98.2978,
  },
  {
    id: 'mx-slp',
    name: 'San Luis Potosi',
    shortName: 'San Luis Potosi',
    country: 'MX',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. CFE No. 630, Zona Industrial, C.P. 78395 San Luis Potosi, S.L.P., Mexico',
    city: 'San Luis Potosi',
    focus: 'Diagnostics & culture systems',
    lat: 22.1498,
    lng: -100.9792,
  },
  // Americas — Canada / South America
  {
    id: 'ca-mississauga',
    name: 'BD Canada — Mississauga',
    shortName: 'Mississauga',
    country: 'CA',
    continent: 'americas',
    kind: 'distribution',
    address: '2100 Derry Rd W, Mississauga, ON L5N 0B3, Canada',
    city: 'Mississauga, ON',
    focus: 'Canada distribution & cold chain',
    lat: 43.5890,
    lng: -79.6441,
  },
  {
    id: 'br-sao-paulo',
    name: 'BD Brazil — Sao Paulo',
    shortName: 'Sao Paulo',
    country: 'BR',
    continent: 'americas',
    kind: 'manufacturing',
    address: 'Av. das Nacoes Unidas 12901, Sao Paulo, SP, Brazil',
    city: 'Sao Paulo',
    focus: 'LatAm manufacturing & market hub',
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    id: 'ar-buenos-aires',
    name: 'BD Argentina — Buenos Aires',
    shortName: 'Buenos Aires',
    country: 'AR',
    continent: 'americas',
    kind: 'distribution',
    address: 'Av. del Libertador 498, Buenos Aires, Argentina',
    city: 'Buenos Aires',
    focus: 'Southern Cone distribution',
    lat: -34.6037,
    lng: -58.3816,
  },
  // Europe
  {
    id: 'ie-drogheda',
    name: 'BD Ireland — Drogheda',
    shortName: 'Drogheda',
    country: 'IE',
    continent: 'europe',
    kind: 'manufacturing',
    address: 'Donore Rd, Drogheda, Co. Louth, Ireland',
    city: 'Drogheda',
    focus: 'European syringe manufacturing',
    lat: 53.7179,
    lng: -6.3561,
  },
  {
    id: 'fr-grenoble',
    name: 'BD France — Grenoble',
    shortName: 'Grenoble',
    country: 'FR',
    continent: 'europe',
    kind: 'pharma',
    address: '11 Rue Aristide Berges, 38800 Le Pont-de-Claix, France',
    city: 'Grenoble',
    focus: 'Pharmaceutical systems Europe',
    lat: 45.1885,
    lng: 5.7245,
  },
  {
    id: 'de-heidelberg',
    name: 'BD Germany — Heidelberg',
    shortName: 'Heidelberg',
    country: 'DE',
    continent: 'europe',
    kind: 'manufacturing',
    address: 'Tullastrasse 8-12, 69126 Heidelberg, Germany',
    city: 'Heidelberg',
    focus: 'Diagnostics & specimen management',
    lat: 49.3988,
    lng: 8.6724,
  },
  {
    id: 'es-madrid',
    name: 'BD Iberia — Madrid DC',
    shortName: 'Madrid DC',
    country: 'ES',
    continent: 'europe',
    kind: 'distribution',
    address: 'Calle de Albasanz 16, 28037 Madrid, Spain',
    city: 'Madrid',
    focus: 'Iberia distribution hub',
    lat: 40.4168,
    lng: -3.7038,
  },
  {
    id: 'uk-plymouth',
    name: 'BD UK — Plymouth',
    shortName: 'Plymouth',
    country: 'UK',
    continent: 'europe',
    kind: 'manufacturing',
    address: 'Belliver Way, Roborough, Plymouth PL6 7BP, UK',
    city: 'Plymouth',
    focus: 'UK manufacturing & export',
    lat: 50.4110,
    lng: -4.1230,
  },
  // Asia
  {
    id: 'cn-suzhou',
    name: 'BD China — Suzhou',
    shortName: 'Suzhou',
    country: 'CN',
    continent: 'asia',
    kind: 'manufacturing',
    address: 'No. 5 Baiyu Rd, Suzhou Industrial Park, Jiangsu, China',
    city: 'Suzhou',
    focus: 'Asia manufacturing campus',
    lat: 31.2989,
    lng: 120.5853,
  },
  {
    id: 'sg-singapore',
    name: 'BD Singapore — Regional Hub',
    shortName: 'Singapore',
    country: 'SG',
    continent: 'asia',
    kind: 'distribution',
    address: '2 International Business Park, Singapore 609930',
    city: 'Singapore',
    focus: 'ASEAN distribution & air hub',
    lat: 1.3294,
    lng: 103.7765,
  },
  {
    id: 'jp-tokyo',
    name: 'BD Japan — Tokyo',
    shortName: 'Tokyo',
    country: 'JP',
    continent: 'asia',
    kind: 'distribution',
    address: '1-2-70 Konan, Minato-ku, Tokyo 108-0075, Japan',
    city: 'Tokyo',
    focus: 'Japan market & quality ops',
    lat: 35.6284,
    lng: 139.7387,
  },
  {
    id: 'in-chennai',
    name: 'BD India — Chennai',
    shortName: 'Chennai',
    country: 'IN',
    continent: 'asia',
    kind: 'manufacturing',
    address: 'SIPCOT Industrial Park, Irungattukottai, Chennai, India',
    city: 'Chennai',
    focus: 'India manufacturing & export',
    lat: 12.9716,
    lng: 80.0410,
  },
  // Africa
  {
    id: 'za-johannesburg',
    name: 'BD Africa — Johannesburg',
    shortName: 'Johannesburg',
    country: 'ZA',
    continent: 'africa',
    kind: 'distribution',
    address: '14 Midrand Blvd, Midrand, Johannesburg, South Africa',
    city: 'Johannesburg',
    focus: 'Southern Africa distribution',
    lat: -26.1076,
    lng: 28.0567,
  },
  {
    id: 'ma-casablanca',
    name: 'BD Maghreb — Casablanca',
    shortName: 'Casablanca',
    country: 'MA',
    continent: 'africa',
    kind: 'distribution',
    address: 'Boulevard Mohamed Zerktouni, Casablanca, Morocco',
    city: 'Casablanca',
    focus: 'North Africa gateway',
    lat: 33.5731,
    lng: -7.5898,
  },
  // Oceania
  {
    id: 'au-sydney',
    name: 'BD Australia — Sydney',
    shortName: 'Sydney',
    country: 'AU',
    continent: 'oceania',
    kind: 'distribution',
    address: '4 Research Park Dr, Macquarie Park NSW 2113, Australia',
    city: 'Sydney',
    focus: 'ANZ distribution hub',
    lat: -33.7760,
    lng: 151.1240,
  },
  {
    id: 'nz-auckland',
    name: 'BD New Zealand — Auckland',
    shortName: 'Auckland',
    country: 'NZ',
    continent: 'oceania',
    kind: 'distribution',
    address: '12 Viaduct Harbour Ave, Auckland 1010, New Zealand',
    city: 'Auckland',
    focus: 'New Zealand market support',
    lat: -36.8485,
    lng: 174.7633,
  },
];

export function getPlantById(id: string): BdPlantSite | undefined {
  return BD_PLANT_SITES.find((p) => p.id === id);
}

export function plantsByContinent(continent: BdContinent | 'all') {
  if (continent === 'all') return BD_PLANT_SITES;
  return BD_PLANT_SITES.filter((p) => p.continent === continent);
}

export const CONTINENT_BOUNDS: Record<BdContinent | 'all', { center: [number, number]; zoom: number }> = {
  all: { center: [20, 10], zoom: 2 },
  americas: { center: [15, -90], zoom: 3 },
  europe: { center: [48, 8], zoom: 4 },
  asia: { center: [25, 105], zoom: 3 },
  africa: { center: [5, 20], zoom: 3 },
  oceania: { center: [-28, 145], zoom: 4 },
};
