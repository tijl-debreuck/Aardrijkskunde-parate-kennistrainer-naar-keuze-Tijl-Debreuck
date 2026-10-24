/**
 * Database & Authenticatie Adapter (Lokale & Cloud-agnotische Adapter)
 * 
 * Deze service biedt een abstractielaag voor authenticatie en database-operaties.
 * Standaard draait deze in een veilige, offline-first modus via browser localStorage.
 * 
 * Wanneer je je applicatie publiek lanceert of een backend (zoals Supabase, PostgreSQL,
 * SQLite of een eigen Express/REST API) wilt aansluiten, kun je de implementaties in
 * dit bestand vervangen zonder dat de frontend componenten aangepast hoeven te worden.
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  delete?: () => Promise<void>;
}

export type AuthStateCallback = (user: User | null) => void;

const AUTH_STORAGE_KEY = 'geo_auth_local_user';
const authListeners = new Set<AuthStateCallback>();

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      delete: async () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setCurrentUser(null);
      }
    };
  } catch {
    return null;
  }
}

function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null
    }));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  auth.currentUser = user ? {
    ...user,
    delete: async () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentUser(null);
    }
  } : null;

  authListeners.forEach(cb => {
    try {
      cb(auth.currentUser);
    } catch (e) {
      console.warn("Auth listener callback error:", e);
    }
  });
}

export const auth = {
  currentUser: getStoredUser(),
  isLocalAdapter: true,
};

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
}

export async function signInWithPopup(_authInstance: typeof auth, _provider?: any): Promise<{ user: User }> {
  // Gebruik een vast, persistent ID voor de Google account zodat alle opgeslagen mappen bewaard blijven
  const simulatedUser: User = {
    uid: 'local-user-google-primary',
    email: 'leerling@geotrainer.local',
    displayName: 'Google Account',
    photoURL: null,
  };
  setCurrentUser(simulatedUser);
  return { user: simulatedUser };
}

export async function signInWithEmailAndPassword(_authInstance: typeof auth, email: string, _password: string): Promise<{ user: User }> {
  const cleanEmail = email.trim().toLowerCase();
  const namePart = cleanEmail.split('@')[0] || 'Gebruiker';
  const simulatedUser: User = {
    uid: 'local-user-email-' + Math.abs(hashString(cleanEmail)).toString(36),
    email: cleanEmail,
    displayName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    photoURL: null,
  };
  setCurrentUser(simulatedUser);
  return { user: simulatedUser };
}

export async function createUserWithEmailAndPassword(_authInstance: typeof auth, email: string, _password: string): Promise<{ user: User }> {
  return signInWithEmailAndPassword(_authInstance, email, _password);
}

export async function signOut(_authInstance: typeof auth): Promise<void> {
  setCurrentUser(null);
}

export function onAuthStateChanged(_authInstance: typeof auth, callback: AuthStateCallback): () => void {
  authListeners.add(callback);
  setTimeout(() => {
    callback(auth.currentUser);
  }, 10);

  return () => {
    authListeners.delete(callback);
  };
}

// ----------------------------------------------------
// Datastructuur Document & Database Emulatie (localStorage)
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

function getDocStorageKey(collection: string, id: string): string {
  return `geo_db_${collection}_${id}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const db = {
  type: 'local-storage-adapter',
  version: '1.0',
};

export const app = {
  name: 'geotrainer-applet',
  options: {},
};

export function doc(_dbInstance: any, collection: string, id: string): DocumentReference {
  return { collection, id };
}

export async function getDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  try {
    const key = getDocStorageKey(docRef.collection, docRef.id);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        exists: () => false,
        data: () => undefined,
        id: docRef.id
      };
    }
    const data = JSON.parse(raw);
    return {
      exists: () => true,
      data: () => data,
      id: docRef.id
    };
  } catch (err) {
    console.error("Local db getDoc error:", err);
    return {
      exists: () => false,
      data: () => undefined,
      id: docRef.id
    };
  }
}

export async function setDoc(docRef: DocumentReference, data: any): Promise<void> {
  try {
    const key = getDocStorageKey(docRef.collection, docRef.id);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Local db setDoc error:", err);
  }
}

export async function updateDoc(docRef: DocumentReference, updateData: any): Promise<void> {
  try {
    const key = getDocStorageKey(docRef.collection, docRef.id);
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    
    const merged = { ...existing };
    for (const [prop, val] of Object.entries(updateData)) {
      if (prop.includes('.')) {
        const parts = prop.split('.');
        let curr = merged;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = val;
      } else {
        merged[prop] = val;
      }
    }

    localStorage.setItem(key, JSON.stringify(merged));
  } catch (err) {
    console.error("Local db updateDoc error:", err);
  }
}

export async function deleteDoc(docRef: DocumentReference): Promise<void> {
  try {
    const key = getDocStorageKey(docRef.collection, docRef.id);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Local db deleteDoc error:", err);
  }
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

export async function getUserStudyFolders(userId: string): Promise<StudyFolder[]> {
  try {
    const key = `geo_folders_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Auto-rescue: Controleer of er eerder aangemaakte mappen bestaan in localStorage
    // (bijvoorbeeld onder een eerdere sessie, geo_study_folders of een andere sleutel)
    const rescuedFolders: StudyFolder[] = [];
    const seenIds = new Set<string>();

    const checkAndMerge = (jsonStr: string | null) => {
      if (!jsonStr) return;
      try {
        const arr = JSON.parse(jsonStr);
        if (Array.isArray(arr)) {
          arr.forEach((f: any) => {
            if (f && f.id && !seenIds.has(f.id)) {
              seenIds.add(f.id);
              rescuedFolders.push(f);
            }
          });
        }
      } catch {}
    };

    // 1. Controleer generieke geo_study_folders
    checkAndMerge(localStorage.getItem('geo_study_folders'));

    // 2. Doorzoek alle eerdere geo_folders_* sleutels
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('geo_folders_')) {
        checkAndMerge(localStorage.getItem(k));
      }
    }

    const finalFolders = (rescuedFolders.length > 0) ? rescuedFolders : DEFAULT_STUDY_FOLDERS;
    localStorage.setItem(key, JSON.stringify(finalFolders));
    return finalFolders;
  } catch (err) {
    console.error("Error loading user study folders:", err);
    return DEFAULT_STUDY_FOLDERS;
  }
}

export async function saveUserStudyFolders(userId: string, folders: StudyFolder[]): Promise<void> {
  try {
    const key = `geo_folders_${userId}`;
    localStorage.setItem(key, JSON.stringify(folders));
    // Sla ook op in de generieke sleutel als persistente backup
    localStorage.setItem('geo_study_folders', JSON.stringify(folders));

    // Automatische synchronisatie naar de backend service!
    syncUserDataToBackend(userId, folders).catch((err) => {
      console.warn("Auto-sync naar backend op de achtergrond mislukt:", err);
    });
  } catch (err) {
    console.error("Error saving user study folders:", err);
  }
}

// ----------------------------------------------------
// Automatische Backend Synchronisatie Service & Status
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
 * Verstuurt alle lokale mappen, voortgang en instellingen automatisch
 * naar de backend service (/api/user/sync).
 */
export async function syncUserDataToBackend(userId: string, customFolders?: StudyFolder[]): Promise<boolean> {
  if (!userId) return false;

  updateSyncState({ status: 'syncing', error: null });

  try {
    const foldersToSync = customFolders || (await getUserStudyFolders(userId));
    const statsRaw = localStorage.getItem('geo_trainer_stats');
    const progressRaw = localStorage.getItem('geo_trainer_progress');
    const guestPrefsRaw = localStorage.getItem('geoTrainerGuestData');

    const payload = {
      userId,
      folders: foldersToSync,
      stats: statsRaw ? JSON.parse(statsRaw) : {},
      progress: progressRaw ? JSON.parse(progressRaw) : {},
      preferences: guestPrefsRaw ? JSON.parse(guestPrefsRaw) : {},
      syncedAt: new Date().toISOString()
    };

    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      const lastSynced = data.lastSynced || new Date().toISOString();
      updateSyncState({ status: 'synced', lastSynced, error: null });
      localStorage.setItem(`geo_last_synced_${userId}`, lastSynced);
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      updateSyncState({ 
        status: 'error', 
        error: errData.error || 'Server gaf foutmelding bij synchronisatie' 
      });
      return false;
    }
  } catch (err: any) {
    console.warn("Backend sync failed:", err);
    updateSyncState({ 
      status: 'error', 
      error: 'Geen verbinding met backend (data veilig lokaal bewaard)' 
    });
    return false;
  }
}


