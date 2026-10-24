export type Region = 'belgium' | 'europe' | 'world';
export type QuizMode = 'multiple-choice' | 'fill-in' | 'flag' | 'review-errors';
export type QuestionType = 'capital' | 'country' | 'province' | 'region' | 'river' | 'mountain' | 'peak' | 'sea' | 'highway' | 'port' | 'continent' | 'ocean' | 'line' | 'city' | 'flag' | 'canal' | 'lake' | 'strait' | 'bay' | 'waterway';

export interface StudyFolder {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
}

export interface GeoItem {
  id: string;
  name: string;
  capital?: string | null;
  type?: string;
  category?: string;
  continent?: string;
  coordinates?: [number, number]; // [lon, lat]
  coordinatesList?: [number, number][]; // Line segments for rivers/highways (features)
  polygon?: [number, number][]; // Boundary for simple map hover/clicking
  polygons?: [number, number][][]; // Multiple polygons (multipolygon support for islands)
  alternatives?: string[];
  extraInfo?: string;
  difficulty?: 'makkelijk' | 'gemiddeld' | 'moeilijk';
}

export interface Dataset {
  countries?: GeoItem[];
  provinces?: GeoItem[];
  rivers?: GeoItem[];
  canals?: GeoItem[];
  mountains?: GeoItem[];
  peaks?: GeoItem[];
  communities?: GeoItem[];
  seas?: GeoItem[];
  lakes?: GeoItem[];
  straits?: GeoItem[];
  bays?: GeoItem[];
  highways?: GeoItem[];
  ports?: GeoItem[];
  regions?: GeoItem[];
  continents?: GeoItem[];
  oceans?: GeoItem[];
  referenceLines?: GeoItem[];
}

export interface Question {
  id: string;
  type: QuizMode;
  category: QuestionType;
  text: string;
  correctAnswer: string;
  options?: string[];
  targetId: string;
  dataset: Region;
  hint?: string;
  geoItem: GeoItem;
}

export interface ProgressState {
  id: string;
  correctCount: number;
  attemptsCount: number;
  consecutiveCorrect: number;
  nextReviewDate: number; // TS timestamp
}

export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
}
