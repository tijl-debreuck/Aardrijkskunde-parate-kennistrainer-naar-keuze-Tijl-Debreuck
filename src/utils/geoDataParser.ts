import { Region, QuestionType, GeoItem } from '../types/geography';
import belgiumData from '../data/belgium.json';
import europeData from '../data/europe.json';
import worldData from '../data/world.json';
import { allGeoFeatures, belgiumCapitals, belgiumRivers, belgiumHighways, belgiumPorts, belgiumCommunities, belgiumPeaks, belgiumTaalgrens, europeCapitals, europeRivers, europeMountains, europeSeas, worldCapitals, worldRivers, worldMountains, worldPeaks, worldSeas, GeoFeature } from '../data/geoData';
import { translateName, Language } from './language';

export interface NormalizedGeoItem extends GeoItem {
  rawName: string;
  rawCapital?: string | null;
  region: Region;
  hasVector: boolean;
  vectorType: 'point' | 'polyline' | 'polygon' | 'none';
}

export interface DatasetAuditLog {
  totalItems: number;
  byRegion: Record<Region, number>;
  byCategory: Record<string, number>;
  itemsWithoutCoordinates: string[];
  itemsVerified: number;
  loadedCount: number;
  unloadedCount: number;
  integrationScore: number;
  status: 'valid' | 'warning' | 'error';
  auditEntries: {
    id: string;
    name: string;
    region: Region;
    category: string;
    vectorType: 'point' | 'polyline' | 'polygon' | 'none';
    status: 'Geladen' | 'Niet geladen';
    validationMessage: string;
    isReadyForMap: boolean;
    isReadyForQuiz: boolean;
  }[];
}

// Master index of all known GeoFeatures from geoData.ts for fast enrichment
const geoFeaturesMap = new Map<string, GeoFeature>();
allGeoFeatures.forEach(f => {
  geoFeaturesMap.set(f.id, f);
});

/**
 * Normalizes an item from raw data and attaches high-detail vectors from geoData.ts.
 */
function normalizeEntity(
  item: any,
  defaultCategory: QuestionType,
  region: Region,
  language: Language = 'nl'
): NormalizedGeoItem {
  const rawName = item.naam || item.name || '';
  const rawCapital = item.hoofdstad || item.capital || null;
  const id = item.id || `item-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const feature = geoFeaturesMap.get(id);

  const coordinates = item.coordinates || feature?.coordinates || null;
  const coordinatesList = item.coordinatesList || feature?.coordinatesList || null;
  const polygon = item.polygon || feature?.polygon || null;
  const polygons = item.polygons || null;

  let vectorType: 'point' | 'polyline' | 'polygon' | 'none' = 'none';
  if (polygon || (polygons && polygons.length > 0)) {
    vectorType = 'polygon';
  } else if (coordinatesList && coordinatesList.length > 0) {
    vectorType = 'polyline';
  } else if (coordinates && coordinates.length === 2) {
    vectorType = 'point';
  }

  const category = item.category || defaultCategory;

  return {
    id,
    rawName,
    rawCapital,
    name: translateName(rawName, language),
    capital: rawCapital ? translateName(rawCapital, language) : null,
    type: item.type || category,
    category,
    region,
    coordinates: coordinates || undefined,
    coordinatesList: coordinatesList || undefined,
    polygon: polygon || undefined,
    polygons: polygons || undefined,
    hasVector: vectorType !== 'none',
    vectorType,
    difficulty: item.difficulty || feature?.difficulty || 'gemiddeld',
    extraInfo: item.extraInfo || feature?.extraInfo || undefined,
    alternatives: Array.from(new Set([
      rawName,
      translateName(rawName, 'nl'),
      translateName(rawName, 'en'),
      ...(rawCapital ? [rawCapital, translateName(rawCapital, 'nl'), translateName(rawCapital, 'en')] : []),
      ...(item.alternatives || []),
      ...(feature?.alternatives || [])
    ])).filter(Boolean)
  };
}

/**
 * Parses and returns the Belgium dataset organized cleanly by category.
 */
export function parseBelgiumDataset(lang: Language = 'nl') {
  const raw = belgiumData as any;
  const provinces = (raw.provinces || []).map((p: any) => normalizeEntity(p, 'province', 'belgium', lang));
  const capitals = (raw.capitals || belgiumCapitals || []).map((c: any) => normalizeEntity(c, 'capital', 'belgium', lang));
  const rivers = (raw.rivers || belgiumRivers || []).map((r: any) => normalizeEntity(r, 'river', 'belgium', lang));
  const canals = (raw.canals || []).map((c: any) => normalizeEntity(c, 'canal', 'belgium', lang));
  const highways = (raw.highways || belgiumHighways || []).map((h: any) => normalizeEntity(h, 'highway', 'belgium', lang));
  const ports = (raw.ports && raw.ports.length > 0 ? raw.ports : belgiumPorts).map((p: any) => normalizeEntity(p, 'port', 'belgium', lang));
  const regions = (raw.regions || []).map((r: any) => normalizeEntity(r, 'province', 'belgium', lang));
  const communities = (raw.communities && raw.communities.length > 0 ? raw.communities : belgiumCommunities).map((cm: any) => normalizeEntity(cm, 'province', 'belgium', lang));
  const peaks = (raw.peaks && raw.peaks.length > 0 ? raw.peaks : belgiumPeaks).map((pk: any) => normalizeEntity(pk, 'peak', 'belgium', lang));
  const lines = (raw.referenceLines || raw.lines || [belgiumTaalgrens]).map((l: any) => normalizeEntity(l, 'line', 'belgium', lang));

  return {
    provinces,
    capitals,
    rivers,
    canals,
    highways,
    ports,
    regions,
    communities,
    peaks,
    lines,
    all: [
      ...provinces,
      ...capitals,
      ...rivers,
      ...canals,
      ...highways,
      ...ports,
      ...regions,
      ...communities,
      ...peaks,
      ...lines
    ]
  };
}

/**
 * Parses and returns the Europe dataset organized by category.
 */
export function parseEuropeDataset(lang: Language = 'nl') {
  const raw = europeData as any;
  const countries = (raw.countries || []).map((c: any) => normalizeEntity(c, 'country', 'europe', lang));
  const capitals = europeCapitals.map(c => normalizeEntity(c, 'capital', 'europe', lang));
  const rivers = (raw.rivers || europeRivers || []).map((r: any) => normalizeEntity(r, 'river', 'europe', lang));
  const mountains = (raw.mountains || europeMountains || []).map((m: any) => normalizeEntity(m, 'mountain', 'europe', lang));
  const seas = (raw.seas || europeSeas || []).map((s: any) => normalizeEntity(s, 'sea', 'europe', lang));
  const islandsPeninsulas = (raw.islands_peninsulas || []).map((ip: any) => normalizeEntity(ip, 'mountain', 'europe', lang));

  return {
    countries,
    capitals,
    rivers,
    mountains,
    seas,
    islandsPeninsulas,
    all: [
      ...countries,
      ...capitals,
      ...rivers,
      ...mountains,
      ...seas,
      ...islandsPeninsulas
    ]
  };
}

/**
 * Parses and returns the World dataset organized by category.
 */
export function parseWorldDataset(lang: Language = 'nl') {
  const raw = worldData as any;
  const countries = (raw.countries || []).map((c: any) => normalizeEntity(c, 'country', 'world', lang));
  const capitals = worldCapitals.map(c => normalizeEntity(c, 'capital', 'world', lang));
  const cities = (raw.steden || raw.cities || []).map((s: any) => normalizeEntity(s, 'city', 'world', lang));
  const rivers = (raw.rivers || worldRivers || []).map((r: any) => normalizeEntity(r, 'river', 'world', lang));
  const mountains = (raw.mountains || worldMountains || []).map((m: any) => normalizeEntity(m, 'mountain', 'world', lang));
  const peaks = (raw.peaks || worldPeaks || []).map((p: any) => normalizeEntity(p, 'peak', 'world', lang));
  const oceansSeas = (raw.oceans || raw.seas || worldSeas || []).map((o: any) => normalizeEntity(o, 'ocean', 'world', lang));
  const continents = (raw.continents || []).map((co: any) => normalizeEntity(co, 'continent', 'world', lang));
  const werelddelen = (raw.werelddelen || []).map((wd: any) => normalizeEntity(wd, 'continent', 'world', lang));
  const lines = (raw.referenceLines || []).map((l: any) => normalizeEntity(l, 'line', 'world', lang));

  return {
    countries,
    capitals,
    cities,
    rivers,
    mountains,
    peaks,
    oceansSeas,
    continents,
    werelddelen,
    lines,
    all: [
      ...countries,
      ...capitals,
      ...cities,
      ...rivers,
      ...mountains,
      ...peaks,
      ...oceansSeas,
      ...continents,
      ...werelddelen,
      ...lines
    ]
  };
}

/**
 * Retrieves all normalized items across specified or all regions.
 */
export function getAllNormalizedItems(region?: Region, lang: Language = 'nl'): NormalizedGeoItem[] {
  if (region === 'belgium') return parseBelgiumDataset(lang).all;
  if (region === 'europe') return parseEuropeDataset(lang).all;
  if (region === 'world') return parseWorldDataset(lang).all;

  const b = parseBelgiumDataset(lang).all;
  const e = parseEuropeDataset(lang).all;
  const w = parseWorldDataset(lang).all;

  // Deduplicate by ID
  const map = new Map<string, NormalizedGeoItem>();
  [...b, ...e, ...w].forEach(item => {
    map.set(item.id, item);
  });

  return Array.from(map.values());
}

/**
 * Performs a comprehensive integrity check on all datasets for the DataValidator audit log.
 */
export function validateDatasetIntegrity(): DatasetAuditLog {
  const allItems = getAllNormalizedItems();
  const byRegion: Record<Region, number> = { belgium: 0, europe: 0, world: 0 };
  const byCategory: Record<string, number> = {};
  const itemsWithoutCoordinates: string[] = [];
  let loadedCount = 0;
  let unloadedCount = 0;

  const auditEntries = allItems.map(item => {
    byRegion[item.region] = (byRegion[item.region] || 0) + 1;
    byCategory[item.category || 'unknown'] = (byCategory[item.category || 'unknown'] || 0) + 1;

    const hasCoords = Boolean(
      (item.coordinates && item.coordinates.length === 2) ||
      (item.coordinatesList && item.coordinatesList.length > 0) ||
      item.polygon ||
      (item.polygons && item.polygons.length > 0)
    );

    let status: 'Geladen' | 'Niet geladen';
    let validationMessage: string;

    if (hasCoords) {
      status = 'Geladen';
      loadedCount++;
      const vectorDesc = item.vectorType === 'polygon' 
        ? 'Polygoon' 
        : item.vectorType === 'polyline' 
        ? 'Polyline' 
        : item.vectorType === 'point' 
        ? 'Punt' 
        : 'Vector';
      validationMessage = `Gekoppeld aan dataset ${item.region} (${vectorDesc} geverifieerd)`;
    } else {
      status = 'Niet geladen';
      unloadedCount++;
      itemsWithoutCoordinates.push(`${item.id} (${item.rawName})`);
      validationMessage = `Ontbrekend in GeoJSON / ontbrekende coördinaten voor ${item.region}`;
    }

    const isReadyForMap = hasCoords;
    const isReadyForQuiz = Boolean(item.rawName && item.id);

    return {
      id: item.id,
      name: item.rawName,
      region: item.region,
      category: item.category || 'unknown',
      vectorType: item.vectorType,
      status,
      validationMessage,
      isReadyForMap,
      isReadyForQuiz
    };
  });

  const totalItems = allItems.length;
  const integrationScore = totalItems > 0 ? Math.round((loadedCount / totalItems) * 100) : 0;
  const status: 'valid' | 'warning' | 'error' = unloadedCount === 0 ? 'valid' : 'warning';

  return {
    totalItems,
    byRegion,
    byCategory,
    itemsWithoutCoordinates,
    itemsVerified: loadedCount,
    loadedCount,
    unloadedCount,
    integrationScore,
    status,
    auditEntries
  };
}
