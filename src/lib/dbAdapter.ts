/**
 * Database & Authenticatie Adapter
 *
 * Praat met de Express backend (server/auth.ts), die accounts en gebruikersdata
 * in PostgreSQL bewaart. De sessie zit in een httpOnly-cookie, dus de browser
 * houdt zelf geen wachtwoorden of tokens bij.
 *
 * De functienamen (doc, getDoc, setDoc, ...) blijven gelijk aan de eerdere
 * Firestore-achtige API zodat de componenten niet herschreven hoeven te worden.
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  delete?: () => Promise<void>;
}

export type AuthStateCallback = (user: User | null) => void;

const authListeners = new Set<AuthStateCallback>();

async function apiRequest<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Serverfout (${res.status})`);
  }
  return data as T;
}

function withDelete(user: User): User {
  return {
    ...user,
    delete: async () => {
      await apiRequest('/api/auth/account', { method: 'DELETE' });
      clearLocalUserCache();
      setCurrentUser(null);
    },
  };
}

// Leervoortgang van de vorige gebruiker niet laten rondslingeren op gedeelde computers
function clearLocalUserCache() {
  localStorage.removeItem('geo_trainer_stats');
  localStorage.removeItem('geo_trainer_progress');
  localStorage.removeItem('geo_study_folders');
}

function setCurrentUser(user: User | null) {
  auth.currentUser = user ? withDelete(user) : null;
  authListeners.forEach(cb => {
    try {
      cb(auth.currentUser);
    } catch (e) {
      console.warn("Auth listener callback error:", e);
    }
  });
}

export const auth: { currentUser: User | null } = {
  currentUser: null,
};

// Sessie één keer bij het laden van de pagina ophalen
let sessionPromise: Promise<void> | null = null;
function loadSession(): Promise<void> {
  if (!sessionPromise) {
    sessionPromise = apiRequest<{ user: User | null }>('/api/auth/me')
      .then(({ user }) => {
        auth.currentUser = user ? withDelete(user) : null;
      })
      .catch((err) => {
        console.warn("Sessie ophalen mislukt:", err);
        auth.currentUser = null;
      });
  }
  return sessionPromise;
}

export async function signInWithEmailAndPassword(_authInstance: typeof auth, email: string, password: string): Promise<{ user: User }> {
  const { user } = await apiRequest<{ user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setCurrentUser(user);
  return { user: auth.currentUser! };
}

export async function createUserWithEmailAndPassword(_authInstance: typeof auth, email: string, password: string): Promise<{ user: User }> {
  const { user } = await apiRequest<{ user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setCurrentUser(user);
  return { user: auth.currentUser! };
}

export async function signOut(_authInstance: typeof auth): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } finally {
    clearLocalUserCache();
    setCurrentUser(null);
  }
}

export function onAuthStateChanged(_authInstance: typeof auth, callback: AuthStateCallback): () => void {
  authListeners.add(callback);
  loadSession().then(() => {
    if (authListeners.has(callback)) callback(auth.currentUser);
  });

  return () => {
    authListeners.delete(callback);
  };
}

// ----------------------------------------------------
// Documenten: collectie 'users' → /api/user/data
// ----------------------------------------------------

export interface DocumentReference {
  collection: string;
  id: string;
}

export interface DocumentSnapshot {
  exists: () => boolean;
  data: () => any;
  id: string;
}

interface UserDataResponse {
  data: {
    preferences: Record<string, any>;
    geoStats: Record<string, any>;
    geoProgress: Record<string, any>;
    folders: StudyFolder[] | null;
    settings: Record<string, string>;
    consent: Record<string, any> | null;
    updatedAt: string;
  } | null;
}

export const db = {
  type: 'postgres-api-adapter',
  version: '2.0',
};

export function doc(_dbInstance: any, collection: string, id: string): DocumentReference {
  if (collection !== 'users') {
    throw new Error(`Onbekende collectie: ${collection}`);
  }
  return { collection, id };
}

function assertCurrentUser(docRef: DocumentReference) {
  if (!auth.currentUser || auth.currentUser.uid !== docRef.id) {
    throw new Error("Niet ingelogd als deze gebruiker.");
  }
}

function fetchUserData() {
  return apiRequest<UserDataResponse>('/api/user/data').then(r => r.data);
}

function putUserData(fields: Record<string, any>) {
  return apiRequest<{ updatedAt: string }>('/api/user/data', {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

const isEmptyObject = (v: any) => !v || (typeof v === 'object' && Object.keys(v).length === 0);

export async function getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  assertCurrentUser(docRef);
  const data = await fetchUserData();
  return {
    exists: () => data !== null,
    data: () => data ? {
      // Lege voorkeuren weglaten zodat de app zijn standaardwaarden gebruikt
      preferences: isEmptyObject(data.preferences) ? undefined : data.preferences,
      geoStats: data.geoStats,
      geoProgress: data.geoProgress,
      settings: data.settings,
      consent: data.consent,
    } : undefined,
    id: docRef.id,
  };
}

export async function setDoc(docRef: DocumentReference, data: any): Promise<void> {
  assertCurrentUser(docRef);
  await putUserData({
    preferences: data.preferences ?? {},
    geoStats: data.geoStats ?? {},
    geoProgress: data.geoProgress ?? {},
  });
}

const UPDATABLE_FIELDS = ['preferences', 'geoStats', 'geoProgress'];

export async function updateDoc(docRef: DocumentReference, updateData: any): Promise<void> {
  assertCurrentUser(docRef);

  const merged: Record<string, any> = {};
  const dotted = Object.entries(updateData).filter(([prop]) => prop.includes('.'));

  for (const [prop, val] of Object.entries(updateData)) {
    if (!prop.includes('.')) merged[prop] = val;
  }

  // Velden als 'preferences.lastUpdated' samenvoegen met de bestaande waarde
  if (dotted.some(([prop]) => !(prop.split('.')[0] in merged))) {
    const existing = await fetchUserData();
    for (const [prop] of dotted) {
      const root = prop.split('.')[0];
      if (!(root in merged)) merged[root] = structuredClone((existing as any)?.[root] ?? {});
    }
  }
  for (const [prop, val] of dotted) {
    const parts = prop.split('.');
    let curr = merged;
    for (let i = 0; i < parts.length - 1; i++) {
      curr[parts[i]] = { ...(curr[parts[i]] || {}) };
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = val;
  }

  const fields = Object.fromEntries(Object.entries(merged).filter(([k]) => UPDATABLE_FIELDS.includes(k)));
  if (Object.keys(fields).length > 0) {
    await putUserData(fields);
  }
}

/** Bewaart het toestemmingsbewijs (AVG art. 7) bij het account. */
export async function saveUserConsent(consent: Record<string, any>): Promise<void> {
  if (!auth.currentUser) return;
  await putUserData({ consent });
}

/** Volledige accountdata uit de database, voor de AVG-export. */
export async function fetchAccountDataExport() {
  if (!auth.currentUser) return null;
  return fetchUserData();
}

export async function deleteDoc(docRef: DocumentReference): Promise<void> {
  assertCurrentUser(docRef);
  await putUserData({ preferences: {}, geoStats: {}, geoProgress: {}, folders: [] });
}

// ----------------------------------------------------
// Accountgebonden Leermapjes (StudyFolders)
// ----------------------------------------------------

export interface StudyFolder {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
}

export const DEFAULT_STUDY_FOLDERS: StudyFolder[] = [
  {
    id: 'folder-gewesten',
    name: 'Belgische Gewesten',
    itemIds: ['be-reg-vla', 'be-reg-waa', 'be-reg-bru'],
    createdAt: 1700000000000,
  },
  {
    id: 'folder-provincies',
    name: 'Belgische Provincies',
    itemIds: [
      'be-p-wvl', 'be-p-ovl', 'be-p-ant', 'be-p-lim', 'be-p-vbr',
      'be-p-brw', 'be-p-hen', 'be-p-nam', 'be-p-lui', 'be-p-lux'
    ],
    createdAt: 1700000001000,
  }
];

export async function getUserStudyFolders(_userId: string): Promise<StudyFolder[]> {
  try {
    const data = await fetchUserData();
    if (data?.updatedAt) {
      updateSyncState({ status: 'synced', lastSynced: data.updatedAt, error: null });
    }
    // Nog nooit mappen opgeslagen → voorbeeldmappen tonen (worden bewaard bij de eerste wijziging)
    return Array.isArray(data?.folders) ? data!.folders! : DEFAULT_STUDY_FOLDERS;
  } catch (err) {
    console.error("Error loading user study folders:", err);
    updateSyncState({ status: 'error', error: 'Mappen konden niet geladen worden.' });
    return DEFAULT_STUDY_FOLDERS;
  }
}

export async function saveUserStudyFolders(userId: string, folders: StudyFolder[]): Promise<void> {
  await syncUserDataToBackend(userId, folders);
}

// ----------------------------------------------------
// Synchronisatiestatus (voor de indicator in Mijn Leerstof)
// ----------------------------------------------------

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  error?: string | null;
}

type SyncListener = (state: SyncState) => void;
const syncListeners = new Set<SyncListener>();

let currentSyncState: SyncState = {
  status: 'idle',
  lastSynced: null,
  error: null,
};

export function getSyncState(): SyncState {
  return currentSyncState;
}

export function onSyncStateChange(callback: SyncListener): () => void {
  syncListeners.add(callback);
  callback(currentSyncState);
  return () => {
    syncListeners.delete(callback);
  };
}

function updateSyncState(newState: Partial<SyncState>) {
  currentSyncState = { ...currentSyncState, ...newState };
  syncListeners.forEach(fn => {
    try {
      fn(currentSyncState);
    } catch (e) {
      console.warn("Sync listener callback error:", e);
    }
  });
}

/**
 * Met mappen: slaat ze op in de database.
 * Zonder mappen: controleert enkel of de server bereikbaar is en wat de laatste opslag was
 * (elke wijziging wordt al meteen opgeslagen, er staat dus niets klaar om te versturen).
 */
export async function syncUserDataToBackend(userId: string, customFolders?: StudyFolder[]): Promise<boolean> {
  if (!userId) return false;

  updateSyncState({ status: 'syncing', error: null });

  try {
    const lastSynced = customFolders
      ? (await putUserData({ folders: customFolders })).updatedAt
      : (await fetchUserData())?.updatedAt ?? new Date().toISOString();
    updateSyncState({ status: 'synced', lastSynced, error: null });
    return true;
  } catch (err: any) {
    console.warn("Backend sync failed:", err);
    updateSyncState({
      status: 'error',
      error: err?.message || 'Geen verbinding met de server',
    });
    return false;
  }
}
