export interface GeoFeature {
  id: string;
  name: string;
  category: 'river' | 'canal' | 'mountain' | 'peak' | 'sea' | 'ocean' | 'strait' | 'bay' | 'lake' | 'capital' | 'country' | 'province' | 'highway' | 'city' | 'line' | 'port' | 'continent';
  coordinates?: [number, number]; // [lon, lat] for capital points / interaction anchors
  coordinatesList?: [number, number][]; // [lon, lat][] line path for rivers / canals / highways
  polygon?: [number, number][]; // Polygon coordinates for mountains/custom regions
  alternatives?: string[];
  extraInfo?: string;
  difficulty?: 'makkelijk' | 'gemiddeld' | 'moeilijk' | string;
}

// ============================================================================
// 1. BELGIUM DATA (10 Provincies + Brussel, Waterlopen, Kanalen, Snelwegen)
// ============================================================================

export const belgiumProvinces: GeoFeature[] = [
  { id: "be-p-wvl", name: "West-Vlaanderen", category: "province", coordinates: [3.2247, 51.2093], extraInfo: "Hoofdstad: Brugge", difficulty: "makkelijk" },
  { id: "be-p-ovl", name: "Oost-Vlaanderen", category: "province", coordinates: [3.7174, 51.0543], extraInfo: "Hoofdstad: Gent", difficulty: "makkelijk" },
  { id: "be-p-ant", name: "Antwerpen", category: "province", coordinates: [4.4024, 51.2194], extraInfo: "Hoofdstad: Antwerpen", difficulty: "makkelijk" },
  { id: "be-p-lim", name: "Limburg", category: "province", coordinates: [5.3378, 50.9307], extraInfo: "Hoofdstad: Hasselt", difficulty: "makkelijk" },
  { id: "be-p-vbr", name: "Vlaams-Brabant", category: "province", coordinates: [4.7009, 50.8798], extraInfo: "Hoofdstad: Leuven", difficulty: "gemiddeld" },
  { id: "be-p-wbr", name: "Waals-Brabant", category: "province", coordinates: [4.6125, 50.7172], extraInfo: "Hoofdstad: Waver (Wavre)", difficulty: "gemiddeld" },
  { id: "be-p-hen", name: "Henegouwen", category: "province", coordinates: [3.9523, 50.4542], extraInfo: "Hoofdstad: Bergen (Mons)", difficulty: "gemiddeld" },
  { id: "be-p-lui", name: "Luik", category: "province", coordinates: [5.5797, 50.6326], extraInfo: "Hoofdstad: Luik (Liège)", difficulty: "makkelijk" },
  { id: "be-p-nam", name: "Namen", category: "province", coordinates: [4.8675, 50.4674], extraInfo: "Hoofdstad: Namen (Namur)", difficulty: "gemiddeld" },
  { id: "be-p-lux", name: "Luxemburg", category: "province", coordinates: [5.8137, 49.6833], extraInfo: "Hoofdstad: Aarlen (Arlon)", difficulty: "gemiddeld" },
  { id: "be-reg-bru", name: "Brussels Hoofdstedelijk Gewest", category: "province", coordinates: [4.3517, 50.8503], extraInfo: "Hoofdstad: Brussel", difficulty: "makkelijk" }
];

export const belgiumCapitals: GeoFeature[] = [
  { id: "be-c-bru", name: "Brussel", category: "capital", coordinates: [4.3517, 50.8503], difficulty: "makkelijk", extraInfo: "Hoofdstad van België en Europa" },
  { id: "be-c-ant", name: "Antwerpen", category: "capital", coordinates: [4.4024, 51.2194], difficulty: "makkelijk", extraInfo: "Hoofdstad van Antwerpen" },
  { id: "be-c-gen", name: "Gent", category: "capital", coordinates: [3.7174, 51.0543], difficulty: "makkelijk", extraInfo: "Hoofdstad van Oost-Vlaanderen" },
  { id: "be-c-brg", name: "Brugge", category: "capital", coordinates: [3.2247, 51.2093], difficulty: "makkelijk", extraInfo: "Hoofdstad van West-Vlaanderen" },
  { id: "be-c-has", name: "Hasselt", category: "capital", coordinates: [5.3378, 50.9307], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Limburg" },
  { id: "be-c-leu", name: "Leuven", category: "capital", coordinates: [4.7009, 50.8798], difficulty: "makkelijk", extraInfo: "Hoofdstad van Vlaams-Brabant" },
  { id: "be-c-wav", name: "Waver", category: "capital", coordinates: [4.6125, 50.7172], difficulty: "gemiddeld", alternatives: ["Wavre"], extraInfo: "Hoofdstad van Waals-Brabant" },
  { id: "be-c-ber", name: "Bergen", category: "capital", coordinates: [3.9523, 50.4542], difficulty: "gemiddeld", alternatives: ["Mons"], extraInfo: "Hoofdstad van Henegouwen" },
  { id: "be-c-lui", name: "Luik", category: "capital", coordinates: [5.5797, 50.6326], difficulty: "makkelijk", alternatives: ["Liège", "Liege"], extraInfo: "Hoofdstad van Luik" },
  { id: "be-c-nam", name: "Namen", category: "capital", coordinates: [4.8675, 50.4674], difficulty: "gemiddeld", alternatives: ["Namur"], extraInfo: "Hoofdstad van Namen" },
  { id: "be-c-aar", name: "Aarlen", category: "capital", coordinates: [5.8137, 49.6833], difficulty: "gemiddeld", alternatives: ["Arlon"], extraInfo: "Hoofdstad van Luxemburg" }
];

export const belgiumRivers: GeoFeature[] = [
  {
    id: "be-r-sch",
    name: "Schelde",
    category: "river",
    coordinates: [3.9, 51.0],
    coordinatesList: [
      [3.40, 50.48], [3.44, 50.60], [3.58, 50.82], [3.72, 51.05],
      [3.88, 51.02], [4.10, 51.03], [4.28, 51.12], [4.33, 51.13],
      [4.40, 51.23], [4.32, 51.34], [4.25, 51.38]
    ],
    difficulty: "makkelijk",
    extraInfo: "Stroomt via Gent en Antwerpen naar de Noordzee"
  },
  {
    id: "be-r-maa",
    name: "Maas",
    category: "river",
    coordinates: [5.1, 50.45],
    coordinatesList: [
      [4.84, 50.15], [4.90, 50.26], [4.88, 50.36], [4.86, 50.46],
      [5.05, 50.48], [5.23, 50.52], [5.57, 50.64], [5.69, 50.71],
      [5.70, 50.85], [5.78, 51.10], [5.82, 51.20]
    ],
    difficulty: "makkelijk",
    extraInfo: "Stroomt via Dinant, Namen en Luik"
  },
  {
    id: "be-r-lei",
    name: "Leie",
    category: "river",
    coordinates: [3.45, 50.85],
    coordinatesList: [
      [3.17, 50.79], [3.26, 50.83], [3.38, 50.88], [3.45, 50.92],
      [3.52, 50.98], [3.64, 51.03], [3.72, 51.05]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Mondt te Gent uit in de Schelde"
  },
  {
    id: "be-r-ijz",
    name: "IJzer",
    category: "river",
    coordinates: [2.75, 51.0],
    coordinatesList: [
      [2.63, 50.90], [2.74, 50.94], [2.86, 51.03], [2.75, 51.13]
    ],
    difficulty: "makkelijk",
    extraInfo: "Stroomt via Diksmuide naar Nieuwpoort"
  },
  {
    id: "be-r-dender",
    name: "Dender",
    category: "river",
    coordinates: [4.02, 50.83],
    coordinatesList: [
      [3.75, 50.63], [3.88, 50.77], [4.02, 50.83], [4.04, 50.94], [4.10, 51.03]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt via Geraardsbergen en Aalst naar Dendermonde"
  },
  {
    id: "be-r-dijle",
    name: "Dijle",
    category: "river",
    coordinates: [4.65, 50.85],
    coordinatesList: [
      [4.52, 50.60], [4.61, 50.72], [4.64, 50.78], [4.70, 50.88],
      [4.67, 50.98], [4.48, 51.03], [4.42, 51.07]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt via Waver, Leuven en Mechelen naar de Rupel"
  },
  {
    id: "be-r-samber",
    name: "Samber",
    category: "river",
    coordinates: [4.44, 50.41],
    coordinatesList: [
      [4.12, 50.31], [4.28, 50.34], [4.44, 50.41], [4.58, 50.44], [4.70, 50.45], [4.86, 50.46]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt via Charleroi naar Namen waar ze in de Maas vloeit"
  },
  {
    id: "be-r-demer",
    name: "Demer",
    category: "river",
    coordinates: [5.05, 50.98],
    coordinatesList: [
      [5.40, 50.88], [5.33, 50.93], [5.18, 50.96], [5.05, 50.98], [4.83, 50.97], [4.70, 50.97]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt via Hasselt, Diest en Aarschot naar Werchter"
  },
  {
    id: "be-r-rupel",
    name: "Rupel",
    category: "river",
    coordinates: [4.37, 51.08],
    coordinatesList: [
      [4.42, 51.07], [4.37, 51.08], [4.33, 51.13]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Korte getijdenrivier van Rumst naar Rupelmonde"
  },
  {
    id: "be-r-nete",
    name: "Nete",
    category: "river",
    coordinates: [4.65, 51.13],
    coordinatesList: [
      [5.12, 51.18], [4.88, 51.17], [4.57, 51.13], [4.45, 51.09], [4.42, 51.07]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grote en Kleine Nete vloeien samen te Lier"
  },
  {
    id: "be-r-ourthe",
    name: "Ourthe",
    category: "river",
    coordinates: [5.55, 50.35],
    coordinatesList: [
      [5.72, 50.05], [5.58, 50.18], [5.45, 50.35], [5.58, 50.48], [5.60, 50.58], [5.58, 50.63]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Ardense zijrivier van de Maas die uitmondt te Luik"
  },
  {
    id: "be-r-ambleve",
    name: "Amblève",
    category: "river",
    coordinates: [5.87, 50.45],
    coordinatesList: [
      [6.22, 50.38], [5.93, 50.40], [5.87, 50.47], [5.72, 50.48], [5.58, 50.48]
    ],
    difficulty: "moeilijk",
    extraInfo: "Bekend van de watervallen van Coo, mondt uit in de Ourthe"
  },
  {
    id: "be-r-semois",
    name: "Semois",
    category: "river",
    coordinates: [5.25, 49.75],
    coordinatesList: [
      [5.81, 49.68], [5.53, 49.71], [5.34, 49.74], [5.07, 49.79], [4.93, 49.83], [4.80, 49.88]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Kronkelt door het zuiden van België via Bouillon"
  },
  {
    id: "be-r-lesse",
    name: "Lesse",
    category: "river",
    coordinates: [5.15, 50.15],
    coordinatesList: [
      [5.38, 49.95], [5.25, 50.08], [5.19, 50.12], [5.00, 50.18], [4.91, 50.23]
    ],
    difficulty: "moeilijk",
    extraInfo: "Stroomt door de grotten van Han en mondt uit te Anseremme"
  },
  {
    id: "be-r-zenne",
    name: "Zenne",
    category: "river",
    coordinates: [4.33, 50.83],
    coordinatesList: [
      [4.12, 50.62], [4.20, 50.69], [4.24, 50.73], [4.33, 50.83], [4.43, 50.93], [4.46, 51.02]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt onder Brussel door en vloeit nabij Mechelen in de Dijle"
  },
  {
    id: "be-r-gete",
    name: "Gete",
    category: "river",
    coordinates: [5.10, 50.88],
    coordinatesList: [
      [5.08, 50.72], [5.07, 50.80], [5.11, 50.84], [5.12, 50.93], [5.10, 50.95]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Zijrivier van de Demer, stroomt via Tienen en Zoutleeuw naar Halen"
  },
  {
    id: "be-r-vesder",
    name: "Vesder",
    category: "river",
    coordinates: [5.80, 50.59],
    coordinatesList: [
      [6.10, 50.62], [6.03, 50.63], [5.86, 50.59], [5.72, 50.58], [5.62, 50.60]
    ],
    alternatives: ["Vesdre"],
    difficulty: "gemiddeld",
    extraInfo: "Zijrivier van de Ourthe, stroomt via Eupen en Verviers naar Chênée (Luik)"
  },
  // Belangrijkste Belgische Kanalen
  {
    id: "be-c-albert",
    name: "Albertkanaal",
    category: "canal",
    coordinates: [5.0, 51.1],
    coordinatesList: [
      [5.58, 50.64], [5.60, 50.78], [5.48, 50.92], [5.33, 50.94],
      [5.18, 51.05], [4.88, 51.15], [4.52, 51.22], [4.41, 51.24]
    ],
    difficulty: "makkelijk",
    extraInfo: "Verbindt de haven van Antwerpen met Luik en de Maas"
  },
  {
    id: "be-c-zeekanaal",
    name: "Zeekanaal Brussel-Schelde",
    category: "canal",
    coordinates: [4.38, 50.98],
    coordinatesList: [
      [4.35, 50.86], [4.42, 50.94], [4.36, 51.06], [4.33, 51.10]
    ],
    alternatives: ["Willebroekkanaal"],
    difficulty: "gemiddeld",
    extraInfo: "Historisch zeekanaal van Brussel naar de Schelde via Willebroek"
  },
  {
    id: "be-c-gent-terneuzen",
    name: "Kanaal Gent-Terneuzen",
    category: "canal",
    coordinates: [3.78, 51.20],
    coordinatesList: [
      [3.73, 51.08], [3.79, 51.19], [3.83, 51.33]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Groot zeekanaal dat de haven van Gent verbindt met de Westerschelde"
  },
  {
    id: "be-c-boudewijn",
    name: "Boudewijnkanaal",
    category: "canal",
    coordinates: [3.21, 51.27],
    coordinatesList: [
      [3.22, 51.22], [3.20, 51.33]
    ],
    difficulty: "moeilijk",
    extraInfo: "Verbindt de binnenhaven van Brugge met Zeebrugge"
  }
];

export const belgiumHighways: GeoFeature[] = [
  { id: "be-h-e40", name: "E40", category: "highway", coordinates: [3.70, 51.02], coordinatesList: [[2.55, 51.05], [3.10, 51.18], [3.70, 51.02], [4.05, 50.94], [4.35, 50.85], [4.70, 50.88], [5.55, 50.63], [6.00, 50.68]] },
  { id: "be-h-e403", name: "E403", category: "highway", coordinates: [3.10, 50.98], coordinatesList: [[3.22, 51.30], [3.20, 51.18], [3.10, 50.98], [3.25, 50.82], [3.38, 50.60]] },
  { id: "be-h-e17", name: "E17", category: "highway", coordinates: [3.72, 51.03], coordinatesList: [[4.40, 51.22], [4.15, 51.16], [3.72, 51.03], [3.28, 50.83], [3.18, 50.78]] },
  { id: "be-h-e19", name: "E19", category: "highway", coordinates: [4.45, 51.03], coordinatesList: [[4.42, 51.25], [4.45, 51.03], [4.35, 50.85], [4.32, 50.60], [3.95, 50.45], [3.78, 50.38]] },
  { id: "be-h-e411", name: "E411", category: "highway", coordinates: [4.86, 50.46], coordinatesList: [[4.38, 50.82], [4.60, 50.72], [4.86, 50.46], [5.10, 50.15], [5.80, 49.68]] },
  { id: "be-h-e42", name: "E42", category: "highway", coordinates: [4.44, 50.41], coordinatesList: [[3.38, 50.60], [3.95, 50.45], [4.44, 50.41], [4.86, 50.46], [5.56, 50.63], [6.12, 50.28]] },
  { id: "be-h-e313", name: "E313", category: "highway", coordinates: [4.75, 51.12], coordinatesList: [[4.42, 51.20], [4.75, 51.12], [5.33, 50.93], [5.60, 50.65]] },
  { id: "be-h-e314", name: "E314", category: "highway", coordinates: [5.05, 50.98], coordinatesList: [[4.70, 50.88], [5.05, 50.98], [5.50, 50.96], [5.70, 50.96]] },
  { id: "be-h-e34", name: "E34", category: "highway", coordinates: [4.85, 51.30], coordinatesList: [[4.40, 51.22], [4.90, 51.32], [5.15, 51.36]] },
  { id: "be-h-e25", name: "E25", category: "highway", coordinates: [5.70, 50.15], coordinatesList: [[5.68, 50.76], [5.56, 50.63], [5.65, 50.25], [5.72, 49.95], [5.80, 49.68]] }
];

export const belgiumPorts: GeoFeature[] = [
  { id: "be-po-ant", name: "Haven van Antwerpen", category: "city", coordinates: [4.38, 51.27], alternatives: ["Port of Antwerp", "Antwerpen haven"], difficulty: "makkelijk", extraInfo: "Tweede grootste zeehaven van Europa aan de Schelde" },
  { id: "be-po-zee", name: "Haven van Zeebrugge", category: "city", coordinates: [3.20, 51.34], alternatives: ["Port of Zeebrugge", "Zeebrugge haven"], difficulty: "makkelijk", extraInfo: "Diepzeehaven aan de Noordzee en LNG-knooppunt" },
  { id: "be-po-gen", name: "Haven van Gent", category: "city", coordinates: [3.73, 51.10], alternatives: ["Port of Gent", "North Sea Port Gent", "Gent haven"], difficulty: "makkelijk", extraInfo: "Binnenhaven verbonden via het Kanaal Gent-Terneuzen" }
];

export const belgiumCommunities: GeoFeature[] = [
  { id: "be-com-vla", name: "Vlaamse Gemeenschap", category: "province", coordinates: [4.35, 51.05], alternatives: ["Flemish Community"], difficulty: "makkelijk", extraInfo: "Bevoegd voor Nederlandstaligen in Vlaanderen en Brussel" },
  { id: "be-com-fra", name: "Franse Gemeenschap", category: "province", coordinates: [4.85, 50.35], alternatives: ["Fédération Wallonie-Bruxelles", "French Community"], difficulty: "makkelijk", extraInfo: "Bevoegd voor Franstaligen in Wallonië en Brussel" },
  { id: "be-com-dui", name: "Duitstalige Gemeenschap", category: "province", coordinates: [6.05, 50.40], alternatives: ["Deutschsprachige Gemeinschaft", "German-speaking Community", "Oostkantons"], difficulty: "gemiddeld", extraInfo: "Bevoegd voor het Duitstalige taalgebied in het oosten (Eupen, Sankt Vith)" }
];

export const belgiumPeaks: GeoFeature[] = [
  { id: "be-peak-botrange", name: "Signaal van Botrange", category: "peak", coordinates: [6.0933, 50.5019], alternatives: ["Botrange"], difficulty: "makkelijk", extraInfo: "Hoogste punt van België (694 meter) in de Hoge Venen" }
];

export const belgiumTaalgrens: GeoFeature = {
  id: "be-line-taalgrens",
  name: "Taalgrens",
  category: "highway",
  coordinates: [4.5, 50.74],
  coordinatesList: [
    [2.65, 50.75], [3.0, 50.73], [3.45, 50.72], [3.85, 50.74],
    [4.25, 50.72], [4.65, 50.75], [5.10, 50.73], [5.50, 50.75], [5.80, 50.72]
  ],
  difficulty: "gemiddeld",
  extraInfo: "De taalgrens tussen het Nederlandse en Franse taalgebied dwars door België"
};



// ============================================================================
// 2. EUROPE DATA (Rivieren, Gebergten, Zeeën, Hoofdsteden)
// ============================================================================

export const europeCapitals: GeoFeature[] = [
  { id: "eu-l-ned", name: "Amsterdam", category: "capital", coordinates: [4.9041, 52.3676], difficulty: "makkelijk" },
  { id: "eu-l-bel", name: "Brussel", category: "capital", coordinates: [4.3517, 50.8503], difficulty: "makkelijk" },
  { id: "eu-l-lux", name: "Luxemburg", category: "capital", coordinates: [6.1296, 49.8153], difficulty: "makkelijk" },
  { id: "eu-l-fra", name: "Parijs", category: "capital", coordinates: [2.3522, 48.8566], difficulty: "makkelijk" },
  { id: "eu-l-dui", name: "Berlijn", category: "capital", coordinates: [13.4050, 52.5200], difficulty: "makkelijk" },
  { id: "eu-l-gbr", name: "Londen", category: "capital", coordinates: [-0.1278, 51.5074], difficulty: "makkelijk" },
  { id: "eu-l-ier", name: "Dublin", category: "capital", coordinates: [-6.2603, 53.3498], difficulty: "makkelijk" },
  { id: "eu-l-ita", name: "Rome", category: "capital", coordinates: [12.4964, 41.9028], difficulty: "makkelijk" },
  { id: "eu-l-spa", name: "Madrid", category: "capital", coordinates: [-3.7492, 40.4637], difficulty: "makkelijk" },
  { id: "eu-l-por", name: "Lissabon", category: "capital", coordinates: [-9.1393, 38.7223], difficulty: "makkelijk" },
  { id: "eu-l-pol", name: "Warschau", category: "capital", coordinates: [21.0122, 52.2297], difficulty: "gemiddeld" },
  { id: "eu-l-tsj", name: "Praag", category: "capital", coordinates: [14.4378, 50.0755], difficulty: "gemiddeld" },
  { id: "eu-l-slo", name: "Bratislava", category: "capital", coordinates: [17.1077, 48.1486], difficulty: "gemiddeld" },
  { id: "eu-l-hon", name: "Boedapest", category: "capital", coordinates: [19.0402, 47.4979], difficulty: "gemiddeld" },
  { id: "eu-l-kro", name: "Zagreb", category: "capital", coordinates: [15.9819, 45.8150], difficulty: "gemiddeld" },
  { id: "eu-l-slv", name: "Ljubljana", category: "capital", coordinates: [14.5058, 46.0569], difficulty: "gemiddeld" },
  { id: "eu-l-ser", name: "Belgrado", category: "capital", coordinates: [20.4489, 44.7866], difficulty: "gemiddeld" },
  { id: "eu-l-mon", name: "Podgorica", category: "capital", coordinates: [19.2636, 42.4304], difficulty: "gemiddeld" },
  { id: "eu-l-kos", name: "Pristina", category: "capital", coordinates: [21.1655, 42.6629], difficulty: "gemiddeld" },
  { id: "eu-l-alb", name: "Tirana", category: "capital", coordinates: [19.8187, 41.3275], difficulty: "gemiddeld" },
  { id: "eu-l-bos", name: "Sarajevo", category: "capital", coordinates: [18.4131, 43.8563], difficulty: "gemiddeld" },
  { id: "eu-l-nma", name: "Skopje", category: "capital", coordinates: [21.4280, 41.9981], difficulty: "gemiddeld" },
  { id: "eu-l-gri", name: "Athene", category: "capital", coordinates: [23.7275, 37.9838], difficulty: "makkelijk" },
  { id: "eu-l-bul", name: "Sofia", category: "capital", coordinates: [23.3219, 42.6977], difficulty: "gemiddeld" },
  { id: "eu-l-roe", name: "Boekarest", category: "capital", coordinates: [26.1025, 44.4268], difficulty: "gemiddeld" },
  { id: "eu-l-mol", name: "Chisinau", category: "capital", coordinates: [28.8638, 47.0105], difficulty: "gemiddeld" },
  { id: "eu-l-oek", name: "Kiev", category: "capital", coordinates: [30.5234, 50.4501], difficulty: "makkelijk" },
  { id: "eu-l-wit", name: "Minsk", category: "capital", coordinates: [27.5615, 53.9006], difficulty: "gemiddeld" },
  { id: "eu-l-lit", name: "Vilnius", category: "capital", coordinates: [25.2797, 54.6872], difficulty: "gemiddeld" },
  { id: "eu-l-let", name: "Riga", category: "capital", coordinates: [24.1052, 56.9496], difficulty: "gemiddeld" },
  { id: "eu-l-est", name: "Tallinn", category: "capital", coordinates: [24.7535, 59.4370], difficulty: "gemiddeld" },
  { id: "eu-l-rus", name: "Moskou", category: "capital", coordinates: [37.6173, 55.7558], difficulty: "makkelijk" },
  { id: "eu-l-mal", name: "Valletta", category: "capital", coordinates: [14.5146, 35.8989], difficulty: "gemiddeld" },
  { id: "eu-l-cyp", name: "Nicosia", category: "capital", coordinates: [33.3823, 35.1856], difficulty: "gemiddeld" },
  { id: "eu-l-oos", name: "Wenen", category: "capital", coordinates: [16.3738, 48.2082], difficulty: "makkelijk" },
  { id: "eu-l-zwi", name: "Bern", category: "capital", coordinates: [7.4474, 46.9480], difficulty: "makkelijk" },
  { id: "eu-l-den", name: "Kopenhagen", category: "capital", coordinates: [12.5683, 55.6761], difficulty: "makkelijk" },
  { id: "eu-l-nor", name: "Oslo", category: "capital", coordinates: [10.7522, 59.9139], difficulty: "makkelijk" },
  { id: "eu-l-swe", name: "Stockholm", category: "capital", coordinates: [18.0686, 59.3293], difficulty: "makkelijk" },
  { id: "eu-l-fin", name: "Helsinki", category: "capital", coordinates: [24.9384, 60.1699], difficulty: "makkelijk" },
  { id: "eu-l-isl", name: "Reykjavik", category: "capital", coordinates: [-21.9426, 64.1466], difficulty: "makkelijk" }
];

export const europeRivers: GeoFeature[] = [
  {
    id: "eu-r-donau",
    name: "Donau",
    category: "river",
    coordinates: [19.0, 46.5],
    coordinatesList: [
      [8.19, 48.04], [10.00, 48.40], [12.10, 49.02], [14.28, 48.30],
      [16.37, 48.21], [17.11, 48.15], [19.04, 47.50], [20.45, 44.82],
      [22.50, 44.40], [26.00, 43.85], [28.00, 44.40], [29.65, 45.30]
    ],
    difficulty: "makkelijk",
    extraInfo: "Op een na langste rivier van Europa, stroomt door 10 landen naar de Zwarte Zee"
  },
  {
    id: "eu-r-rijn",
    name: "Rijn",
    category: "river",
    coordinates: [7.8, 50.1],
    coordinatesList: [
      [9.50, 46.60], [9.10, 47.60], [7.60, 47.56], [7.75, 48.58],
      [8.46, 49.48], [8.27, 50.00], [7.60, 50.36], [6.96, 50.94],
      [6.77, 51.22], [6.00, 51.85], [4.48, 51.92]
    ],
    difficulty: "makkelijk",
    extraInfo: "Belangrijke Europese waterweg van de Zwitserse Alpen naar de Noordzee"
  },
  {
    id: "eu-r-wolga",
    name: "Wolga",
    category: "river",
    coordinates: [46.0, 51.0],
    coordinatesList: [
      [32.50, 57.25], [36.00, 56.86], [39.88, 57.62], [43.90, 56.32],
      [49.12, 55.78], [48.74, 53.20], [46.00, 51.53], [44.50, 48.70],
      [48.00, 46.35]
    ],
    difficulty: "makkelijk",
    extraInfo: "Langste rivier van Europa (3.530 km), mondt uit in de Kaspische Zee"
  },
  {
    id: "eu-r-seine",
    name: "Seine",
    category: "river",
    coordinates: [1.8, 49.0],
    coordinatesList: [
      [4.70, 47.50], [4.10, 48.00], [3.20, 48.40], [2.35, 48.86],
      [1.40, 49.05], [1.10, 49.44], [0.10, 49.45]
    ],
    difficulty: "makkelijk",
    extraInfo: "Stroomt dwars door Parijs naar Het Kanaal bij Le Havre"
  },
  {
    id: "eu-r-loire",
    name: "Loire",
    category: "river",
    coordinates: [1.5, 47.3],
    coordinatesList: [
      [4.20, 44.80], [4.00, 45.60], [3.50, 46.80], [2.50, 47.30],
      [1.90, 47.90], [0.70, 47.40], [-0.55, 47.47], [-1.55, 47.22], [-2.15, 47.28]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Langste rivier van Frankrijk, mondt uit in de Golf van Biskaje"
  },
  {
    id: "eu-r-elbe",
    name: "Elbe",
    category: "river",
    coordinates: [11.8, 52.1],
    coordinatesList: [
      [15.55, 50.77], [14.40, 50.50], [13.73, 51.05], [12.20, 51.85],
      [11.63, 52.13], [10.00, 53.55], [8.70, 53.88]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt van Tsjechië via Dresden en Hamburg naar de Noordzee"
  },
  {
    id: "eu-r-oder",
    name: "Oder",
    category: "river",
    coordinates: [14.5, 52.5],
    coordinatesList: [
      [17.50, 49.60], [18.25, 49.85], [17.03, 51.10], [15.50, 51.95],
      [14.55, 52.35], [14.40, 53.00], [14.55, 53.43], [14.30, 53.90]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grensrivier tussen Duitsland en Polen, mondt uit in de Oostzee"
  },
  {
    id: "eu-r-weichsel",
    name: "Weichsel",
    category: "river",
    coordinates: [19.5, 52.3],
    coordinatesList: [
      [19.00, 49.60], [19.94, 50.06], [21.80, 50.70], [21.01, 52.23],
      [19.70, 52.55], [18.60, 53.02], [18.70, 53.80], [18.95, 54.35]
    ],
    alternatives: ["Wisła", "Wisla", "Vistula"],
    difficulty: "gemiddeld",
    extraInfo: "Belangrijkste rivier van Polen, stroomt via Krakau en Warschau naar Gdańsk"
  },
  {
    id: "eu-r-taag",
    name: "Taag",
    category: "river",
    coordinates: [-6.5, 39.8],
    coordinatesList: [
      [-1.70, 40.35], [-3.10, 40.05], [-4.02, 39.86], [-6.00, 39.75],
      [-7.50, 39.50], [-8.40, 39.20], [-9.14, 38.72]
    ],
    alternatives: ["Tejo", "Tajo", "Tagus"],
    difficulty: "gemiddeld",
    extraInfo: "Langste rivier van het Iberisch Schiereiland, mondt bij Lissabon uit"
  },
  {
    id: "eu-r-ebro",
    name: "Ebro",
    category: "river",
    coordinates: [-0.8, 41.6],
    coordinatesList: [
      [-4.10, 43.00], [-2.50, 42.60], [-1.60, 42.10], [-0.88, 41.65],
      [0.10, 41.25], [0.55, 40.80], [0.85, 40.70]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grootste rivier die geheel in Spanje stroomt, mondt uit in de Middellandse Zee"
  },
  {
    id: "eu-r-po",
    name: "Po",
    category: "river",
    coordinates: [10.5, 45.0],
    coordinatesList: [
      [7.10, 44.70], [7.68, 45.07], [9.15, 45.18], [10.50, 45.00],
      [11.60, 44.95], [12.30, 44.95], [12.50, 44.85]
    ],
    difficulty: "makkelijk",
    extraInfo: "Langste rivier van Italië, stroomt door de Povlakte naar de Adriatische Zee"
  },
  {
    id: "eu-r-rhone",
    name: "Rhône",
    category: "river",
    coordinates: [4.8, 44.5],
    coordinatesList: [
      [8.40, 46.55], [7.35, 46.20], [6.15, 46.20], [5.30, 45.75],
      [4.83, 45.76], [4.80, 44.93], [4.80, 43.95], [4.65, 43.68], [4.85, 43.35]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt via het Meer van Genève en Lyon naar de Middellandse Zee"
  },
  {
    id: "eu-r-theems",
    name: "Theems",
    category: "river",
    coordinates: [-0.1, 51.5],
    coordinatesList: [
      [-2.00, 51.70], [-1.25, 51.75], [-0.95, 51.45], [-0.50, 51.48],
      [-0.12, 51.50], [0.50, 51.50], [0.90, 51.52]
    ],
    alternatives: ["Thames"],
    difficulty: "makkelijk",
    extraInfo: "Beroemde Britse rivier die door Londen naar de Noordzee stroomt"
  },
  {
    id: "eu-r-dnjepr",
    name: "Dnjepr",
    category: "river",
    coordinates: [32.0, 49.5],
    coordinatesList: [
      [34.00, 55.85], [30.90, 54.40], [30.50, 52.00], [30.52, 50.45],
      [32.00, 49.40], [35.00, 48.45], [35.15, 47.85], [33.50, 46.80], [32.20, 46.60]
    ],
    alternatives: ["Dnipro", "Dnieper"],
    difficulty: "gemiddeld",
    extraInfo: "Belangrijkste rivier van Oekraïne, stroomt via Kiev naar de Zwarte Zee"
  },
  {
    id: "eu-r-douro",
    name: "Douro",
    category: "river",
    coordinates: [-5.5, 41.3],
    coordinatesList: [
      [-2.50, 41.80], [-4.70, 41.50], [-6.40, 41.40], [-7.50, 41.15], [-8.65, 41.14]
    ],
    alternatives: ["Duero"],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt door Noord-Spanje en Portugal en mondt uit bij Porto"
  },
  {
    id: "eu-r-don",
    name: "Don",
    category: "river",
    coordinates: [40.0, 48.5],
    coordinatesList: [
      [38.2, 54.0], [39.0, 52.0], [40.5, 49.5], [43.5, 49.0], [42.0, 47.5], [39.3, 47.1]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grote Russische rivier die uitmondt in de Zee van Azov"
  },
  {
    id: "eu-r-garonne",
    name: "Garonne",
    category: "river",
    coordinates: [0.0, 44.5],
    coordinatesList: [
      [0.8, 42.7], [1.4, 43.6], [0.6, 44.2], [-0.6, 45.0], [-1.0, 45.6]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Stroomt vanuit de Spaanse Pyreneeën via Toulouse en Bordeaux naar de Atlantische Oceaan"
  },
  {
    id: "eu-r-oeral",
    name: "Oeral",
    category: "river",
    coordinates: [52.0, 49.0],
    coordinatesList: [
      [59.5, 54.5], [59.0, 52.0], [55.0, 51.5], [51.4, 51.2], [51.5, 48.0], [51.8, 47.0]
    ],
    alternatives: ["Ural"],
    difficulty: "gemiddeld",
    extraInfo: "Grensrivier tussen Europa en Azië, mondt uit in de Kaspische Zee"
  }
];

export const europeMountains: GeoFeature[] = [
  {
    id: "eu-m-alpen",
    name: "Alpen",
    category: "mountain",
    coordinates: [10.0, 46.5],
    polygon: [
      [5.8, 43.5], [6.8, 45.2], [7.8, 46.4], [9.5, 47.3], [12.0, 47.6],
      [15.2, 47.8], [16.2, 47.0], [14.0, 46.0], [11.2, 45.8], [8.5, 44.5],
      [7.2, 43.8], [5.8, 43.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Hoogste gebergteketen van Centraal-Europa met de Mont Blanc (4.808 m)"
  },
  {
    id: "eu-m-pyreneen",
    name: "Pyreneeën",
    category: "mountain",
    coordinates: [0.5, 42.6],
    polygon: [
      [-2.5, 43.4], [-1.5, 43.2], [0.0, 42.8], [1.8, 42.6], [3.2, 42.4],
      [3.1, 42.1], [1.5, 42.2], [-0.5, 42.5], [-2.2, 43.0], [-2.5, 43.4]
    ],
    alternatives: ["Pyreneeën", "Pyrenees"],
    difficulty: "makkelijk",
    extraInfo: "Natuurlijke grens tussen Frankrijk en Spanje"
  },
  {
    id: "eu-m-karpaten",
    name: "Karpaten",
    category: "mountain",
    coordinates: [23.5, 46.8],
    polygon: [
      [17.8, 49.6], [19.5, 49.3], [22.5, 49.0], [25.5, 48.2], [26.8, 46.5],
      [26.5, 45.5], [25.2, 45.2], [22.8, 44.7], [21.5, 44.9], [23.5, 45.8],
      [25.2, 46.8], [23.8, 48.2], [20.2, 48.8], [17.8, 49.6]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Boogvormige bergketen in Midden- en Oost-Europa (oa. Roemenië, Slowakije)"
  },
  {
    id: "eu-m-apennijnen",
    name: "Apennijnen",
    category: "mountain",
    coordinates: [13.0, 42.5],
    polygon: [
      [9.5, 44.5], [11.0, 44.2], [12.5, 43.5], [13.5, 42.5], [14.5, 41.8],
      [15.5, 40.8], [16.0, 39.0], [15.5, 38.5], [15.0, 39.5], [14.0, 41.0],
      [12.5, 42.0], [11.0, 43.5], [9.5, 44.5]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Ruggengraat van het Italiaanse schiereiland"
  },
  {
    id: "eu-m-scandinavisch",
    name: "Scandinavisch Hoogland",
    category: "mountain",
    coordinates: [13.0, 63.5],
    polygon: [
      [5.5, 59.5], [6.5, 61.5], [10.5, 64.5], [15.0, 67.5], [20.0, 69.5],
      [24.0, 70.0], [21.0, 68.0], [15.5, 65.0], [11.5, 62.0], [7.5, 59.8], [5.5, 59.5]
    ],
    alternatives: ["Scandinavische Alpen", "Scandes"],
    difficulty: "gemiddeld",
    extraInfo: "Bergketen door Noorwegen en Zweden"
  },
  {
    id: "eu-m-kaukasus",
    name: "Kaukasus",
    category: "mountain",
    coordinates: [43.0, 42.8],
    polygon: [
      [37.5, 44.8], [40.2, 44.0], [44.5, 42.5], [48.2, 41.2],
      [47.5, 40.5], [43.8, 41.8], [39.8, 43.2], [37.5, 44.8]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Bergketen tussen Zwarte en Kaspische Zee met de Elbroes (5.642 m)"
  },
  {
    id: "eu-m-oeral",
    name: "Oeral",
    category: "mountain",
    coordinates: [60.0, 60.0],
    polygon: [
      [58.5, 68.5], [60.2, 64.0], [59.5, 58.0], [58.8, 53.0],
      [61.2, 51.5], [61.8, 56.5], [61.5, 63.5], [60.5, 68.5], [58.5, 68.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Traditionele grens tussen Europa en Azië"
  }
];

export const europeSeas: GeoFeature[] = [
  { id: "eu-s-noordzee", name: "Noordzee", category: "sea", coordinates: [3.0, 56.0], difficulty: "makkelijk" },
  { id: "eu-s-oostzee", name: "Oostzee", category: "sea", coordinates: [19.0, 58.0], alternatives: ["Baltische Zee"], difficulty: "makkelijk" },
  { id: "eu-s-middellandse", name: "Middellandse Zee", category: "sea", coordinates: [15.0, 36.0], difficulty: "makkelijk" },
  { id: "eu-s-zwartezee", name: "Zwarte Zee", category: "sea", coordinates: [34.0, 43.5], difficulty: "makkelijk" },
  { id: "eu-s-kaspische", name: "Kaspische Zee", category: "lake", coordinates: [51.0, 41.5], difficulty: "makkelijk", extraInfo: "Grootste binnenmeer ter wereld" },
  { id: "eu-s-noorsezee", name: "Noorse Zee", category: "sea", coordinates: [2.0, 67.0], difficulty: "gemiddeld" },
  { id: "eu-s-kanaal", name: "Het Kanaal", category: "strait", coordinates: [-1.0, 50.0], alternatives: ["Nauw van Calais", "Engels Kanaal"], difficulty: "makkelijk" },
  { id: "eu-s-gibraltar", name: "Straat van Gibraltar", category: "strait", coordinates: [-5.6, 35.95], difficulty: "makkelijk", extraInfo: "Verbindt de Atlantische Oceaan met de Middellandse Zee" },
  { id: "eu-s-biskaje", name: "Golf van Biskaje", category: "bay", coordinates: [-4.0, 45.5], difficulty: "makkelijk" },
  { id: "eu-s-bosporus", name: "Bosporus", category: "strait", coordinates: [29.05, 41.1], difficulty: "gemiddeld", extraInfo: "Zeestraat te Istanboel tussen Europa en Azië" },
  { id: "eu-s-adriatische", name: "Adriatische Zee", category: "sea", coordinates: [16.0, 42.5], difficulty: "gemiddeld" },
  { id: "eu-s-egeische", name: "Egeïsche Zee", category: "sea", coordinates: [25.0, 38.5], difficulty: "gemiddeld" },
  { id: "eu-s-tyrreense", name: "Tyrreense Zee", category: "sea", coordinates: [12.5, 39.5], difficulty: "gemiddeld", extraInfo: "Deel van de Middellandse Zee tussen Italië, Corsica, Sardinië en Sicilië" },
  { id: "eu-s-ionische", name: "Ionische Zee", category: "sea", coordinates: [18.5, 38.0], difficulty: "gemiddeld", extraInfo: "Zee ten zuiden van de Adriatische Zee tussen Italië en Griekenland" },
  { id: "eu-s-ierse", name: "Ierse Zee", category: "sea", coordinates: [-4.5, 53.5], difficulty: "gemiddeld", extraInfo: "Zee tussen Ierland en Groot-Brittannië" },
  { id: "eu-s-ijszee", name: "Noordelijke IJszee", category: "ocean", coordinates: [15.0, 75.0], alternatives: ["Arctische Oceaan"], difficulty: "makkelijk", extraInfo: "Oceaan rond de Noordpool" },
  { id: "eu-s-atlantische", name: "Atlantische Oceaan", category: "ocean", coordinates: [-15.0, 50.0], difficulty: "makkelijk", extraInfo: "Oceaan ten westen van Europa" }
];


// ============================================================================
// 3. WORLD DATA (Rivieren, Gebergten, Oceanen & Zeeën, Hoofdsteden)
// ============================================================================

export const worldCapitals: GeoFeature[] = [
  // Noord-Amerika
  { id: "wd-c-was", name: "Washington D.C.", category: "capital", coordinates: [-77.0369, 38.9072], difficulty: "makkelijk", extraInfo: "Hoofdstad van de Verenigde Staten" },
  { id: "wd-c-ott", name: "Ottawa", category: "capital", coordinates: [-75.6972, 45.4215], difficulty: "makkelijk", extraInfo: "Hoofdstad van Canada" },
  { id: "wd-c-mex", name: "Mexico-Stad", category: "capital", coordinates: [-99.1332, 19.4326], difficulty: "makkelijk", extraInfo: "Hoofdstad van Mexico" },
  { id: "wd-c-hav", name: "Havana", category: "capital", coordinates: [-82.3666, 23.1136], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Cuba" },
  // Zuid-Amerika
  { id: "wd-c-bra", name: "Brasilia", category: "capital", coordinates: [-47.9292, -15.7801], difficulty: "makkelijk", extraInfo: "Hoofdstad van Brazilië" },
  { id: "wd-c-bue", name: "Buenos Aires", category: "capital", coordinates: [-58.3816, -34.6037], difficulty: "makkelijk", extraInfo: "Hoofdstad van Argentinië" },
  { id: "wd-c-san", name: "Santiago", category: "capital", coordinates: [-70.6693, -33.4489], difficulty: "makkelijk", extraInfo: "Hoofdstad van Chili" },
  { id: "wd-c-lim", name: "Lima", category: "capital", coordinates: [-77.0428, -12.0464], difficulty: "makkelijk", extraInfo: "Hoofdstad van Peru" },
  { id: "wd-c-bog", name: "Bogota", category: "capital", coordinates: [-74.0721, 4.7110], difficulty: "makkelijk", extraInfo: "Hoofdstad van Colombia" },
  { id: "wd-c-car", name: "Caracas", category: "capital", coordinates: [-66.9036, 10.4806], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Venezuela" },
  // Afrika
  { id: "wd-c-cai", name: "Caïro", category: "capital", coordinates: [31.2357, 30.0444], difficulty: "makkelijk", extraInfo: "Hoofdstad van Egypte" },
  { id: "wd-c-rab", name: "Rabat", category: "capital", coordinates: [-6.8498, 33.9716], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Marokko" },
  { id: "wd-c-alg", name: "Algiers", category: "capital", coordinates: [3.0588, 36.7538], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Algerije" },
  { id: "wd-c-pre", name: "Pretoria", category: "capital", coordinates: [28.1881, -25.7479], difficulty: "makkelijk", extraInfo: "Bestuurlijke hoofdstad van Zuid-Afrika" },
  { id: "wd-c-nai", name: "Nairobi", category: "capital", coordinates: [36.8219, -1.2921], difficulty: "makkelijk", extraInfo: "Hoofdstad van Kenia" },
  { id: "wd-c-add", name: "Addis Abeba", category: "capital", coordinates: [38.7578, 9.0192], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Ethiopië" },
  { id: "wd-c-kin", name: "Kinshasa", category: "capital", coordinates: [15.3101, -4.3276], difficulty: "gemiddeld", extraInfo: "Hoofdstad van DR Congo" },
  { id: "wd-c-abu", name: "Abuja", category: "capital", coordinates: [7.4951, 9.0765], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Nigeria" },
  // Azië
  { id: "wd-c-bei", name: "Beijing", category: "capital", coordinates: [116.4074, 39.9042], difficulty: "makkelijk", alternatives: ["Peking"], extraInfo: "Hoofdstad van China" },
  { id: "wd-c-tok", name: "Tokyo", category: "capital", coordinates: [139.6917, 35.6762], difficulty: "makkelijk", extraInfo: "Hoofdstad van Japan" },
  { id: "wd-c-del", name: "New Delhi", category: "capital", coordinates: [77.2090, 28.6139], difficulty: "makkelijk", extraInfo: "Hoofdstad van India" },
  { id: "wd-c-seo", name: "Seoel", category: "capital", coordinates: [126.9780, 37.5665], difficulty: "makkelijk", alternatives: ["Seoul"], extraInfo: "Hoofdstad van Zuid-Korea" },
  { id: "wd-c-ban", name: "Bangkok", category: "capital", coordinates: [100.5018, 13.7563], difficulty: "makkelijk", extraInfo: "Hoofdstad van Thailand" },
  { id: "wd-c-jak", name: "Jakarta", category: "capital", coordinates: [106.8456, -6.2115], difficulty: "makkelijk", extraInfo: "Hoofdstad van Indonesië" },
  { id: "wd-c-riy", name: "Riyad", category: "capital", coordinates: [46.7154, 24.7136], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Saoedi-Arabië" },
  { id: "wd-c-teh", name: "Teheran", category: "capital", coordinates: [51.3890, 35.6892], difficulty: "gemiddeld", extraInfo: "Hoofdstad van Iran" },
  { id: "wd-c-ank", name: "Ankara", category: "capital", coordinates: [32.8597, 39.9334], difficulty: "makkelijk", extraInfo: "Hoofdstad van Turkije" },
  // Oceanië
  { id: "wd-c-can", name: "Canberra", category: "capital", coordinates: [149.1300, -35.2809], difficulty: "makkelijk", extraInfo: "Hoofdstad van Australië" },
  { id: "wd-c-wel", name: "Wellington", category: "capital", coordinates: [174.7762, -41.2865], difficulty: "makkelijk", extraInfo: "Hoofdstad van Nieuw-Zeeland" }
];

export const worldRivers: GeoFeature[] = [
  {
    id: "wd-r-nijl",
    name: "Nijl",
    category: "river",
    coordinates: [31.5, 20.0],
    coordinatesList: [
      [31.2, 31.4], [31.2, 30.1], [32.5, 24.1], [32.5, 15.6],
      [32.5, 9.5], [31.5, 4.0], [33.5, 0.5], [31.0, -2.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Langste rivier van Afrika en ter wereld (6.650 km), mondt uit in de Middellandse Zee"
  },
  {
    id: "wd-r-amazone",
    name: "Amazone",
    category: "river",
    coordinates: [-60.0, -3.5],
    coordinatesList: [
      [-50.0, -0.1], [-52.0, -1.5], [-55.0, -2.4], [-60.0, -3.1],
      [-65.0, -3.5], [-70.0, -4.0], [-73.5, -3.8], [-76.0, -4.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Waterrijkste rivier ter wereld, doorkruist het Amazoneregenwoud naar de Atlantische Oceaan"
  },
  {
    id: "wd-r-mississippi",
    name: "Mississippi",
    category: "river",
    coordinates: [-91.0, 36.0],
    coordinatesList: [
      [-89.2, 29.1], [-91.2, 32.5], [-90.1, 38.6], [-90.5, 41.5],
      [-92.5, 44.5], [-95.2, 47.2]
    ],
    difficulty: "makkelijk",
    extraInfo: "Grootste rivierensysteem van Noord-Amerika, mondt uit in de Golf van Mexico"
  },
  {
    id: "wd-r-jangtsekiang",
    name: "Jangtsekiang",
    category: "river",
    coordinates: [112.0, 30.0],
    coordinatesList: [
      [121.8, 31.5], [118.8, 32.1], [114.3, 30.6], [111.3, 30.7],
      [106.6, 29.6], [104.6, 28.8], [99.5, 27.8], [94.0, 33.5]
    ],
    alternatives: ["Yangtze", "Yangtse", "Chang Jiang"],
    difficulty: "makkelijk",
    extraInfo: "Langste rivier van Azië (6.300 km), stroomt geheel in China"
  },
  {
    id: "wd-r-huanghe",
    name: "Huanghe",
    category: "river",
    coordinates: [110.0, 38.0],
    coordinatesList: [
      [119.3, 37.8], [116.5, 36.8], [111.0, 34.8], [110.5, 39.5],
      [106.5, 38.5], [103.8, 36.0], [98.0, 35.0]
    ],
    alternatives: ["Gele Rivier", "Yellow River"],
    difficulty: "makkelijk",
    extraInfo: "De Gele Rivier, bakermat van de Chinese beschaving"
  },
  {
    id: "wd-r-kongo",
    name: "Kongo",
    category: "river",
    coordinates: [20.0, -1.0],
    coordinatesList: [
      [12.3, -6.1], [15.3, -4.3], [18.1, -0.1], [23.0, 0.5],
      [25.2, 0.5], [26.0, -2.5], [26.5, -5.0]
    ],
    alternatives: ["Congo"],
    difficulty: "makkelijk",
    extraInfo: "Diepste rivier ter wereld en tweede waterrijkste na de Amazone"
  },
  {
    id: "wd-r-ganges",
    name: "Ganges",
    category: "river",
    coordinates: [84.0, 25.5],
    coordinatesList: [
      [89.8, 22.1], [88.2, 24.0], [85.1, 25.6], [82.0, 25.3],
      [80.3, 26.5], [78.5, 30.1]
    ],
    difficulty: "makkelijk",
    extraInfo: "Heilige rivier in India, mondt uit in de Golf van Bengalen"
  },
  {
    id: "wd-r-indus",
    name: "Indus",
    category: "river",
    coordinates: [70.0, 28.0],
    coordinatesList: [
      [67.5, 24.0], [68.5, 26.0], [70.5, 29.0], [71.5, 32.5],
      [73.5, 35.0], [77.5, 34.0], [81.5, 31.5]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Levensader van Pakistan, ontspringt op het Tibetaans Plateau"
  },
  {
    id: "wd-r-mekong",
    name: "Mekong",
    category: "river",
    coordinates: [104.0, 16.0],
    coordinatesList: [
      [106.5, 10.2], [105.0, 11.5], [105.8, 15.0], [102.5, 18.0],
      [101.0, 21.5], [99.5, 24.0], [94.5, 33.0]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grote rivier in Zuidoost-Azië die door 6 landen stroomt"
  },
  {
    id: "wd-r-parana",
    name: "Paraná",
    category: "river",
    coordinates: [-56.0, -26.0],
    coordinatesList: [
      [-58.4, -34.5], [-60.5, -31.7], [-58.8, -27.5], [-54.6, -25.5],
      [-51.0, -20.0], [-48.0, -18.5]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grote rivier in Zuid-Amerika, mondt via de Río de la Plata uit"
  },
  {
    id: "wd-r-jenisej",
    name: "Jenisej",
    category: "river",
    coordinates: [90.0, 62.0],
    coordinatesList: [
      [86.2, 71.8], [87.5, 66.0], [90.0, 60.0], [92.5, 56.0], [94.0, 51.5]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grootste rivier die in de Noordelijke IJszee uitmondt"
  },
  {
    id: "wd-r-lena",
    name: "Lena",
    category: "river",
    coordinates: [124.0, 64.0],
    coordinatesList: [
      [127.0, 72.5], [124.0, 67.0], [129.7, 62.0], [120.0, 59.0], [106.0, 54.0]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Grote Siberische rivier met spectaculaire Lenapilaren"
  },
  {
    id: "wd-r-ob",
    name: "Ob",
    category: "river",
    coordinates: [74.0, 61.0],
    coordinatesList: [
      [73.5, 66.5], [69.0, 61.0], [77.0, 61.0], [83.0, 55.0], [85.5, 52.0]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Belangrijke West-Siberische rivier"
  },
  {
    id: "wd-r-darling",
    name: "Murray-Darling",
    category: "river",
    coordinates: [142.0, -33.0],
    coordinatesList: [
      [139.0, -35.5], [141.0, -34.0], [142.0, -32.5], [146.0, -30.0], [150.0, -28.0]
    ],
    alternatives: ["Darling", "Murray"],
    difficulty: "gemiddeld",
    extraInfo: "Belangrijkste rivierensysteem van Australië"
  },
  {
    id: "wd-r-colorado",
    name: "Colorado",
    category: "river",
    coordinates: [-113.0, 36.0],
    coordinatesList: [
      [-114.8, 31.8], [-114.6, 35.0], [-113.0, 36.1], [-110.0, 38.0], [-106.0, 40.0]
    ],
    difficulty: "gemiddeld",
    extraInfo: "Beroemd om het uitslijten van de Grand Canyon"
  }
];

export const worldMountains: GeoFeature[] = [
  {
    id: "wd-m-himalaya",
    name: "Himalaya",
    category: "mountain",
    coordinates: [85.0, 29.0],
    polygon: [
      [73.5, 35.5], [77.0, 32.5], [82.0, 29.5], [88.0, 27.8], [95.0, 28.2],
      [96.5, 29.5], [94.5, 27.0], [87.5, 26.5], [81.5, 28.0], [76.5, 31.0], [73.5, 35.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Hoogste gebergte ter wereld met 14 toppen boven de 8.000 meter"
  },
  {
    id: "wd-m-andes",
    name: "Andes",
    category: "mountain",
    coordinates: [-71.0, -22.0],
    polygon: [
      [-73.5, 10.5], [-76.5, 5.0], [-79.0, -2.0], [-78.0, -10.0], [-74.0, -18.0],
      [-69.5, -28.0], [-71.5, -42.0], [-73.5, -53.0], [-69.5, -54.0], [-68.5, -41.0],
      [-67.0, -26.0], [-70.5, -16.0], [-75.0, -8.0], [-74.5, 2.0], [-71.5, 10.5], [-73.5, 10.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Langste continentale bergketen ter wereld (ca. 7.000 km) langs de westkust van Zuid-Amerika"
  },
  {
    id: "wd-m-rocky",
    name: "Rocky Mountains",
    category: "mountain",
    coordinates: [-112.0, 45.0],
    polygon: [
      [-125.0, 62.0], [-119.0, 53.0], [-112.0, 45.0], [-106.0, 37.0], [-104.5, 33.5],
      [-108.0, 33.5], [-111.5, 39.0], [-116.0, 47.0], [-122.0, 56.0], [-127.0, 62.0], [-125.0, 62.0]
    ],
    difficulty: "makkelijk",
    extraInfo: "Grote bergketen in het westen van Noord-Amerika van Canada tot New Mexico"
  },
  {
    id: "wd-m-atlas",
    name: "Atlas",
    category: "mountain",
    coordinates: [-5.0, 32.0],
    polygon: [
      [-9.5, 30.5], [-6.5, 31.8], [-2.0, 33.5], [3.0, 35.2], [8.5, 36.8],
      [8.0, 35.5], [2.0, 34.0], [-4.0, 31.8], [-8.5, 29.8], [-9.5, 30.5]
    ],
    alternatives: ["Atlasgebergte"],
    difficulty: "makkelijk",
    extraInfo: "Bergketen in Noordwest-Afrika (Marokko, Algerije, Tunesië)"
  },
  {
    id: "wd-m-oeral",
    name: "Oeral",
    category: "mountain",
    coordinates: [60.0, 60.0],
    polygon: [
      [58.5, 68.5], [60.2, 64.0], [59.5, 58.0], [58.8, 53.0],
      [61.2, 51.5], [61.8, 56.5], [61.5, 63.5], [60.5, 68.5], [58.5, 68.5]
    ],
    difficulty: "makkelijk",
    extraInfo: "Noord-zuid bergketen in Rusland die Europa van Azië scheidt"
  },
  {
    id: "wd-m-tibet",
    name: "Hoogland van Tibet",
    category: "mountain",
    coordinates: [88.0, 33.0],
    polygon: [
      [78.0, 35.0], [88.0, 36.0], [98.0, 34.0], [101.0, 30.0],
      [95.0, 28.0], [85.0, 28.5], [79.0, 31.0], [78.0, 35.0]
    ],
    alternatives: ["Tibetaans Plateau", "Dak van de wereld"],
    difficulty: "gemiddeld",
    extraInfo: "Hoogste en grootste plateau ter wereld, gemiddeld 4.500 m hoogte"
  },
  {
    id: "wd-m-greatdividing",
    name: "Grote Scheidingsgebergte",
    category: "mountain",
    coordinates: [148.0, -32.0],
    polygon: [
      [143.0, -14.0], [146.0, -19.0], [150.0, -25.0], [152.0, -30.0],
      [149.0, -36.0], [146.0, -37.5], [143.0, -37.0], [147.0, -35.0],
      [149.0, -29.0], [145.0, -23.0], [142.0, -16.0], [143.0, -14.0]
    ],
    alternatives: ["Great Dividing Range"],
    difficulty: "gemiddeld",
    extraInfo: "Belangrijkste bergketen van Australië langs de oostkust"
  },
  {
    id: "wd-m-appalachen",
    name: "Appalachen",
    category: "mountain",
    coordinates: [-80.0, 38.0],
    polygon: [
      [-85.0, 34.0], [-82.0, 36.0], [-78.0, 40.0], [-72.0, 44.0],
      [-69.0, 47.0], [-71.0, 46.0], [-76.0, 42.0], [-81.0, 38.0], [-85.0, 34.0]
    ],
    alternatives: ["Appalachians"],
    difficulty: "gemiddeld",
    extraInfo: "Oud gebergte in het oosten van Noord-Amerika"
  }
];

export const worldPeaks: GeoFeature[] = [
  { id: "wd-p-everest", name: "Mount Everest", category: "peak", coordinates: [86.9250, 27.9881], difficulty: "makkelijk", extraInfo: "Hoogste berg ter wereld (8.848 m, Nepal/China)" },
  { id: "wd-p-k2", name: "K2", category: "peak", coordinates: [76.5133, 35.8814], difficulty: "gemiddeld", extraInfo: "Tweede hoogste berg ter wereld (8.611 m, Pakistan/China)" },
  { id: "wd-p-aconcagua", name: "Aconcagua", category: "peak", coordinates: [-70.0109, -32.6532], difficulty: "makkelijk", extraInfo: "Hoogste berg van Zuid-Amerika en het westelijk halfrond (6.961 m)" },
  { id: "wd-p-denali", name: "Denali", category: "peak", coordinates: [-151.0074, 63.0692], alternatives: ["Mount McKinley"], difficulty: "makkelijk", extraInfo: "Hoogste piek van Noord-Amerika (6.190 m, Alaska)" },
  { id: "wd-p-kilimanjaro", name: "Kilimanjaro", category: "peak", coordinates: [37.3556, -3.0674], difficulty: "makkelijk", extraInfo: "Hoogste berg van Afrika (5.895 m, Tanzania)" },
  { id: "wd-p-elbroes", name: "Elbroes", category: "peak", coordinates: [42.4392, 43.3499], alternatives: ["Elbrus"], difficulty: "gemiddeld", extraInfo: "Hoogste berg van Europa (5.642 m, Kaukasus)" },
  { id: "wd-p-montblanc", name: "Mont Blanc", category: "peak", coordinates: [6.8656, 45.8326], difficulty: "makkelijk", extraInfo: "Hoogste berg van de Alpen (4.808 m, Frankrijk/Italië)" },
  { id: "wd-p-fuji", name: "Fuji", category: "peak", coordinates: [138.7274, 35.3606], difficulty: "makkelijk", extraInfo: "Heilige vulkaan en hoogste berg van Japan (3.776 m)" }
];

export const worldSeas: GeoFeature[] = [
  // Oceanen
  { id: "wd-o-stille", name: "Stille Oceaan", category: "ocean", coordinates: [-160.0, 0.0], alternatives: ["Grote Oceaan", "Pacific"], difficulty: "makkelijk" },
  { id: "wd-o-atlantische", name: "Atlantische Oceaan", category: "ocean", coordinates: [-30.0, 15.0], alternatives: ["Atlantic Ocean"], difficulty: "makkelijk" },
  { id: "wd-o-indische", name: "Indische Oceaan", category: "ocean", coordinates: [80.0, -10.0], alternatives: ["Indian Ocean"], difficulty: "makkelijk" },
  { id: "wd-o-zuidelijke", name: "Zuidelijke Oceaan", category: "ocean", coordinates: [0.0, -65.0], alternatives: ["Antarctische Oceaan"], difficulty: "gemiddeld" },
  { id: "wd-o-arctische", name: "Noordelijke IJszee", category: "ocean", coordinates: [0.0, 85.0], alternatives: ["Arctische Oceaan"], difficulty: "gemiddeld" },
  // Belangrijke wereldzeeën, baaien & zeestraten
  { id: "wd-s-caribische", name: "Caribische Zee", category: "sea", coordinates: [-75.0, 15.0], difficulty: "makkelijk" },
  { id: "wd-s-golfmexico", name: "Golf van Mexico", category: "bay", coordinates: [-90.0, 25.0], difficulty: "makkelijk" },
  { id: "wd-s-rodezee", name: "Rode Zee", category: "sea", coordinates: [38.0, 22.0], difficulty: "makkelijk" },
  { id: "wd-s-perzische", name: "Perzische Golf", category: "bay", coordinates: [51.0, 27.0], difficulty: "makkelijk" },
  { id: "wd-s-arabische", name: "Arabische Zee", category: "sea", coordinates: [65.0, 15.0], difficulty: "gemiddeld" },
  { id: "wd-s-golfbengalen", name: "Golf van Bengalen", category: "bay", coordinates: [90.0, 15.0], difficulty: "gemiddeld" },
  { id: "wd-s-zuidchinese", name: "Zuid-Chinese Zee", category: "sea", coordinates: [115.0, 12.0], difficulty: "makkelijk" },
  { id: "wd-s-japansezee", name: "Japanse Zee", category: "sea", coordinates: [135.0, 40.0], difficulty: "gemiddeld" },
  { id: "wd-s-beringzee", name: "Beringzee", category: "sea", coordinates: [-175.0, 58.0], difficulty: "gemiddeld" },
  { id: "wd-s-hudsonbaai", name: "Hudsonbaai", category: "bay", coordinates: [-85.0, 60.0], difficulty: "gemiddeld" },
  { id: "wd-s-koraalzee", name: "Koraalzee", category: "sea", coordinates: [155.0, -18.0], difficulty: "gemiddeld" },
  { id: "wd-s-malakka", name: "Straat van Malakka", category: "strait", coordinates: [100.5, 4.0], difficulty: "gemiddeld" },
  { id: "wd-s-beringstraat", name: "Beringstraat", category: "strait", coordinates: [-169.0, 66.0], difficulty: "makkelijk" },
  { id: "wd-s-panama", name: "Panamakanaal", category: "canal", coordinates: [-79.6, 9.1], difficulty: "makkelijk" },
  { id: "wd-s-suez", name: "Suezkanaal", category: "canal", coordinates: [32.3, 30.5], difficulty: "makkelijk" }
];

export const worldReferenceLines: GeoFeature[] = [
  {
    id: "wd-rl-nul",
    name: "Nulmeridiaan",
    category: "line",
    coordinates: [0, 20],
    coordinatesList: [[0, 85], [0, 60], [0, 30], [0, 0], [0, -30], [0, -60], [0, -85]],
    alternatives: ["Greenwichmeridiaan", "Prime Meridian"],
    difficulty: "makkelijk",
    extraInfo: "Loopt door Greenwich (Londen) en verdeelt de aarde in oostelijk en westelijk halfrond"
  },
  {
    id: "wd-rl-eve",
    name: "Evenaar",
    category: "line",
    coordinates: [0, 0],
    coordinatesList: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]],
    alternatives: ["Equator"],
    difficulty: "makkelijk",
    extraInfo: "Breedtecirkel op 0° die de aarde verdeelt in noordelijk en zuidelijk halfrond"
  },
  {
    id: "wd-rl-kre",
    name: "Kreeftskeerkring",
    category: "line",
    coordinates: [0, 23.436],
    coordinatesList: [[-180, 23.436], [-90, 23.436], [0, 23.436], [90, 23.436], [180, 23.436]],
    alternatives: ["Tropic of Cancer"],
    difficulty: "gemiddeld",
    extraInfo: "Breedtecirkel op circa 23,5° Noorderbreedte"
  },
  {
    id: "wd-rl-ste",
    name: "Steenbokskeerkring",
    category: "line",
    coordinates: [0, -23.436],
    coordinatesList: [[-180, -23.436], [-90, -23.436], [0, -23.436], [90, -23.436], [180, -23.436]],
    alternatives: ["Tropic of Capricorn"],
    difficulty: "gemiddeld",
    extraInfo: "Breedtecirkel op circa 23,5° Zuiderbreedte"
  },
  {
    id: "wd-rl-npo",
    name: "Noordpoolcirkel",
    category: "line",
    coordinates: [0, 66.56],
    coordinatesList: [[-180, 66.56], [-90, 66.56], [0, 66.56], [90, 66.56], [180, 66.56]],
    alternatives: ["Arctic Circle"],
    difficulty: "gemiddeld",
    extraInfo: "Poolcirkel op circa 66,5° Noorderbreedte"
  },
  {
    id: "wd-rl-zpo",
    name: "Zuidpoolcirkel",
    category: "line",
    coordinates: [0, -66.56],
    coordinatesList: [[-180, -66.56], [-90, -66.56], [0, -66.56], [90, -66.56], [180, -66.56]],
    alternatives: ["Antarctic Circle"],
    difficulty: "gemiddeld",
    extraInfo: "Poolcirkel op circa 66,5° Zuiderbreedte"
  }
];

export const additionalMissingFeatures: GeoFeature[] = [
  // European Seas, Islands & Peninsulas
  { id: "eu-s-zwarte", name: "Zwarte Zee", category: "sea", coordinates: [34.0, 43.0], extraInfo: "Zee tussen Zuidoost-Europa en West-Azië" },
  { id: "eu-i-corsica", name: "Corsica", category: "mountain", coordinates: [9.08, 42.15], extraInfo: "Frans eiland in de Middellandse Zee" },
  { id: "eu-i-sardinie", name: "Sardinië", category: "mountain", coordinates: [9.01, 40.12], extraInfo: "Italiaans eiland in de Middellandse Zee" },
  { id: "eu-i-sicilie", name: "Sicilië", category: "mountain", coordinates: [14.01, 37.60], extraInfo: "Grootste Italiaanse eiland in de Middellandse Zee" },
  { id: "eu-i-kreta", name: "Kreta", category: "mountain", coordinates: [24.81, 35.24], extraInfo: "Grootste Griekse eiland" },
  { id: "eu-i-cyprus", name: "Cyprus (Eiland)", category: "mountain", coordinates: [33.43, 35.12], extraInfo: "Eiland in de oostelijke Middellandse Zee" },
  { id: "eu-i-britseeilanden", name: "Britse Eilanden", category: "mountain", coordinates: [-4.0, 54.0], extraInfo: "Eilandengroep met Groot-Brittannië en Ierland" },
  { id: "eu-i-ijsland", name: "IJsland (Eiland)", category: "mountain", coordinates: [-19.02, 64.96], extraInfo: "Vulkanisch eiland in de Noord-Atlantische Oceaan" },
  { id: "eu-p-scandinavie", name: "Scandinavië", category: "mountain", coordinates: [15.0, 63.0], extraInfo: "Schiereiland in Noord-Europa" },
  { id: "eu-p-balkan", name: "Balkan", category: "mountain", coordinates: [22.0, 42.0], extraInfo: "Schiereiland in Zuidoost-Europa" },
  { id: "eu-p-italie", name: "Italiaans Schiereiland", category: "mountain", coordinates: [12.5, 42.5], extraInfo: "Laarsvormig schiereiland in Zuid-Europa" },
  { id: "eu-p-iberisch", name: "Iberisch Schiereiland", category: "mountain", coordinates: [-4.0, 40.0], extraInfo: "Schiereiland met Spanje en Portugal" },

  // World Rivers, Mountains & Highlands
  { id: "wd-r-niger", name: "Niger", category: "river", coordinates: [2.0, 13.5], coordinatesList: [[-8.2, 9.5], [-4.5, 13.8], [-3.0, 16.5], [0.2, 13.8], [6.0, 4.5]], extraInfo: "Belangrijkste rivier in West-Afrika" },
  { id: "wd-m-madre", name: "Sierra Madre", category: "mountain", coordinates: [-102.5, 23.5], extraInfo: "Bergketen in Mexico" },
  { id: "wd-m-kunlun", name: "Kunlun Shan", category: "mountain", coordinates: [84.0, 36.0], extraInfo: "Grote bergketen in Azië ten noorden van Tibet" },
  { id: "wd-m-taurus", name: "Taurus", category: "mountain", coordinates: [33.0, 37.0], extraInfo: "Bergketen in Zuid-Turkije" },
  { id: "wd-m-coast", name: "Coast Range", category: "mountain", coordinates: [-125.0, 52.0], extraInfo: "Kustgebergte in West-Noord-Amerika" },
  { id: "wd-m-iran", name: "Hoogland van Iran", category: "mountain", coordinates: [53.0, 32.0], extraInfo: "Hoogvlakte in Zuidwest-Azië" },
  { id: "wd-m-ethiopisch", name: "Ethiopisch Hoogland", category: "mountain", coordinates: [39.0, 9.0], extraInfo: "Ruig berggebied in de Hoorn van Afrika" },
  { id: "wd-m-oostafrikaans", name: "Oost-Afrikaans Hoogland", category: "mountain", coordinates: [37.0, -3.0], extraInfo: "Hooglandgebied rond de Grote Slenk" },

  // World Oceans
  { id: "wd-oc-gro", name: "Grote Oceaan", category: "ocean", coordinates: [-160.0, 0.0], extraInfo: "Grootste en diepste oceaan op aarde (Stille Oceaan)" },
  { id: "wd-oc-atl", name: "Atlantische Oceaan", category: "ocean", coordinates: [-30.0, 0.0], extraInfo: "Oceaan tussen Amerika, Europa en Afrika" },
  { id: "wd-oc-ind", name: "Indische Oceaan", category: "ocean", coordinates: [80.0, -20.0], extraInfo: "Oceaan ten zuiden van Azië" },
  { id: "wd-oc-nij", name: "Noordelijke IJszee", category: "ocean", coordinates: [0.0, 80.0], extraInfo: "Oceaan rond de Noordpool" },

  // Continents / Werelddelen
  { id: "wd-wd-eur", name: "Europa", category: "continent", coordinates: [15.25, 54.52], extraInfo: "Werelddeel tussen de Atlantische Oceaan en Azië" },
  { id: "wd-wd-azi", name: "Azië", category: "continent", coordinates: [100.61, 34.04], extraInfo: "Grootste werelddeel van de aarde" },
  { id: "wd-wd-afr", name: "Afrika", category: "continent", coordinates: [17.30, 1.65], extraInfo: "Tweede grootste werelddeel" },
  { id: "wd-wd-ame", name: "Amerika", category: "continent", coordinates: [-99.0, 19.0], extraInfo: "Werelddeel bestaande uit Noord- en Zuid-Amerika" },
  { id: "wd-wd-oce", name: "Oceanië", category: "continent", coordinates: [140.01, -22.73], extraInfo: "Werelddeel inclusief Australië en Nieuw-Zeeland" },
  { id: "wd-wd-ant", name: "Antarctica", category: "continent", coordinates: [135.0, -82.86], extraInfo: "Koudste werelddeel rond de Zuidpool" }
];

export const allGeoFeatures: GeoFeature[] = [
  ...belgiumProvinces,
  ...belgiumCapitals,
  ...belgiumRivers,
  ...belgiumHighways,
  ...belgiumPorts,
  ...belgiumCommunities,
  ...belgiumPeaks,
  belgiumTaalgrens,
  ...europeCapitals,
  ...europeRivers,
  ...europeMountains,
  ...europeSeas,
  ...worldCapitals,
  ...worldRivers,
  ...worldMountains,
  ...worldPeaks,
  ...worldSeas,
  ...worldReferenceLines,
  ...additionalMissingFeatures
];

