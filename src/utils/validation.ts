import belgiumData from '../data/belgium.json';
import europeData from '../data/europe.json';
import worldData from '../data/world.json';

export interface FaultyItem {
  id: string;
  name: string;
  dataset: string;
  category: string;
  currentValue: string;
  correctedValue: [number, number];
}

export interface AuditReport {
  timestamp: string;
  isPassed: boolean;
  totalRecords: number;
  duplicateCount: number;
  emptyFieldsCount: number;
  missingCoordsCount: number;
  logs: string[];
  faultyItems: FaultyItem[];
}

export const CORRECTED_COORDINATES: Record<string, [number, number]> = {
  // Belgium regions (3 items with province category lacking coords)
  "be-reg-vl": [4.35, 51.0],
  "be-reg-vla": [4.35, 51.0],
  "be-reg-wa": [4.85, 50.3],
  "be-reg-waa": [4.85, 50.3],
  "be-reg-br": [4.35, 50.85],
  "be-reg-bru": [4.35, 50.85],

  // World cities (36 items with city category lacking coords)
  "wd-s-nyo": [-74.006, 40.7128],
  "wd-s-was": [-77.0369, 38.9072],
  "wd-s-nor": [-90.0715, 29.9511],
  "wd-s-mia": [-80.1918, 25.7617],
  "wd-s-chi": [-87.6298, 41.8781],
  "wd-s-los": [-118.2437, 34.0522],
  "wd-s-mex": [-99.1332, 19.4326],
  "wd-s-car": [-66.9036, 10.4806],
  "wd-s-rio": [-43.1729, -22.9068],
  "wd-s-sao": [-46.6333, -23.5505],
  "wd-s-lim": [-77.0428, -12.0464],
  "wd-s-bue": [-58.3816, -34.6037],
  "wd-s-bog": [-74.0721, 4.711],
  "wd-s-cai": [31.2357, 30.0444],
  "wd-s-kin": [15.3126, -4.3276],
  "wd-s-kaa": [18.4241, -33.9249],
  "wd-s-lag": [3.3792, 6.5244],
  "wd-s-nai": [36.8219, -1.2921],
  "wd-s-dak": [-17.4467, 14.7167],
  "wd-s-mos": [37.6173, 55.7558],
  "wd-s-bei": [116.4074, 39.9042],
  "wd-s-ist": [28.9784, 41.0082],
  "wd-s-kar": [67.0011, 24.8607],
  "wd-s-teh": [51.389, 35.6892],
  "wd-s-mum": [72.8777, 19.076],
  "wd-s-del": [77.209, 28.6139],
  "wd-s-kol": [88.3639, 22.5726],
  "wd-s-dha": [90.4125, 23.8103],
  "wd-s-sha": [121.4737, 31.2304],
  "wd-s-seo": [126.978, 37.5665],
  "wd-s-tok": [139.6917, 35.6762],
  "wd-s-sin": [103.8198, 1.3521],
  "wd-s-man": [120.9842, 14.5995],
  "wd-s-jak": [106.8456, -6.2088],
  "wd-s-syd": [151.2093, -33.8688],
  "wd-s-mel": [144.9631, -37.8136]
};

export const runDatabaseAudit = (): AuditReport => {
  const logs: string[] = [];
  const faultyItems: FaultyItem[] = [];
  let totalRecords = 0;
  let duplicateCount = 0;
  let emptyFieldsCount = 0;
  let missingCoordsCount = 0;

  logs.push("--- STARTING SYSTEM DIAGNOSTICS & DATA VALIDATION SUITE ---");

  // Helper check for item duplicates or field voids
  const checkDatasetList = (
    listName: string,
    list: any[],
    _requiredFields?: string[]
  ) => {
    if (!list || !Array.isArray(list)) {
      logs.push(`⚠️ WARNING: ${listName} is empty or missing!`);
      return;
    }

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    let datasetName = "unknown";
    if (listName.startsWith("Belgium")) datasetName = "belgium";
    else if (listName.startsWith("Europe")) datasetName = "europe";
    else if (listName.startsWith("World")) datasetName = "world";

    list.forEach((item, index) => {
      totalRecords += 1;
      
      // 1. Check ID voids or duplications
      const id = item.id || `unassigned-${index}`;
      if (!item.id) {
        logs.push(`❌ ERROR: In ${listName} index ${index} lacks an ID attribute.`);
        emptyFieldsCount += 1;
      } else if (seenIds.has(item.id)) {
        logs.push(`❌ DUPLICATE ERROR: ID "${item.id}" is reused in ${listName}`);
        duplicateCount += 1;
      } else {
        seenIds.add(item.id);
      }

      // 2. Check Name voids or duplication
      const name = item.name || item.naam;
      if (!name) {
        logs.push(`❌ VOID ERROR: Item ID "${id}" in ${listName} has an empty or void name.`);
        emptyFieldsCount += 1;
      } else if (seenNames.has(name)) {
        logs.push(`⚠️ WARNING: Duplicate name matches in ${listName}: "${name}"`);
      } else {
        seenNames.add(name);
      }

      // 3. Coordinate validation - Treat as error for country, province, and city categories to ensure quiz consistency
      if (item.category === 'country' || item.category === 'province' || item.category === 'city') {
        const coords = item.coordinates;
        if (coords !== undefined && coords !== null) {
          if (!Array.isArray(coords) || coords.length !== 2) {
            logs.push(`❌ COORDINATE ERROR: Item "${name || id}" in ${listName} has malformed geographic coordinates format.`);
            missingCoordsCount += 1;
            faultyItems.push({
              id,
              name: name || id,
              dataset: datasetName,
              category: item.category,
              currentValue: "Vervormd of incompleet",
              correctedValue: CORRECTED_COORDINATES[id] || [0.0, 0.0]
            });
          } else {
            const [lon, lat] = coords;
            if (lon < -185 || lon > 185 || lat < -90 || lat > 90) {
              logs.push(`❌ OUT-OF-BOUNDS ERROR: Coordinates [${lon}, ${lat}] for "${name}" in ${listName} are mathematically invalid.`);
              missingCoordsCount += 1;
              faultyItems.push({
                id,
                name: name || id,
                dataset: datasetName,
                category: item.category,
                currentValue: `Ongeldige waarden: [${lon}, ${lat}]`,
                correctedValue: CORRECTED_COORDINATES[id] || [0.0, 0.0]
              });
            }
          }
        } else {
          logs.push(`❌ MISSING COORDINATE ERROR: Item "${name || id}" in ${listName} lacks coordinates entirely.`);
          missingCoordsCount += 1;
          faultyItems.push({
            id,
            name: name || id,
            dataset: datasetName,
            category: item.category,
            currentValue: "Ontbrekend (undefined)",
            correctedValue: CORRECTED_COORDINATES[id] || [0.0, 0.0]
          });
        }
      }

      // 4. Polygon validation
      if (item.polygon) {
        if (!Array.isArray(item.polygon) || item.polygon.length < 3) {
          logs.push(`❌ GEOMETRY ERROR: Item "${name || id}" in ${listName} has an invalid boundary polygon.`);
        }
      }
    });
  };

  // 1. Audit Belgium
  logs.push("Checking Belgium Dataset...");
  checkDatasetList("Belgium Provinces", belgiumData.provinces, ['id', 'naam', 'hoofdstad']);
  checkDatasetList("Belgium Rivers", belgiumData.rivers);
  checkDatasetList("Belgium Ports", belgiumData.ports);
  checkDatasetList("Belgium Regions", belgiumData.regions);

  // 2. Audit Europe
  logs.push("Checking Europe Dataset...");
  checkDatasetList("Europe Countries", europeData.countries, ['id', 'name', 'capital']);
  checkDatasetList("Europe Seas", europeData.seas);
  checkDatasetList("Europe Mountains", europeData.mountains);
  checkDatasetList("Europe Rivers", europeData.rivers);

  // 3. Audit World
  logs.push("Checking World Dataset...");
  checkDatasetList("World Countries", worldData.countries, ['id', 'name', 'capital']);
  checkDatasetList("World Cities", worldData.steden);
  checkDatasetList("World Continents", worldData.continents);
  checkDatasetList("World Oceans", worldData.oceans);
  checkDatasetList("World Rivers", worldData.rivers);
  checkDatasetList("World Mountains", worldData.mountains);

  // Cross check counts
  if (europeData.countries.length !== 41) {
    logs.push(`❌ SYLLABUS DISCREPANCY: Europe database contains exactly ${europeData.countries.length} course countries (Required: 41).`);
  } else {
    logs.push("✅ Europe syllabus country count is precisely verified at 41/41.");
  }

  const isPassed = duplicateCount === 0 && emptyFieldsCount === 0 && missingCoordsCount === 0;

  logs.push(`--- DIAGNOSTICS END: Passed: ${isPassed ? "YES" : "NO"} | total checked: ${totalRecords} | duplicates found: ${duplicateCount} | empty fields: ${emptyFieldsCount} | missing coordinates: ${missingCoordsCount} ---`);

  return {
    timestamp: new Date().toLocaleString(),
    isPassed,
    totalRecords,
    duplicateCount,
    emptyFieldsCount,
    missingCoordsCount,
    logs,
    faultyItems
  };
};
