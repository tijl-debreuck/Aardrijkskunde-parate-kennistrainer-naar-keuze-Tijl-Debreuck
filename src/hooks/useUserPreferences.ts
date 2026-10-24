import { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc, updateDoc, onAuthStateChanged, saveUserConsent, User } from '../lib/dbAdapter';
import { applySettings, pushSettingsToServer } from '../lib/userSettings';
import { getStoredConsent } from '../components/legal/LegalDocuments';

// Instellingen uit de database winnen; heeft het account er nog geen, dan nemen we die van dit toestel over.
// Idem voor de toestemming: wie al lokaal akkoord ging, krijgt dat bewijs ook bij het account.
function syncSettingsAndConsent(data: { settings?: Record<string, string>; consent?: any } | undefined) {
  if (data?.settings && Object.keys(data.settings).length > 0) {
    applySettings(data.settings);
  } else {
    pushSettingsToServer();
  }
  const localConsent = getStoredConsent();
  if (localConsent && !data?.consent?.accepted) {
    saveUserConsent(localConsent).catch(err => console.warn("Toestemming opslaan mislukt:", err));
  }
}

export interface UserPreferences {
  selectedRegions: string[];
  selectedCategories: string[];
  selectedItemIds?: string[];
  difficulty?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedRegions: ['belgium'],
  selectedCategories: ['province'],
  selectedItemIds: [],
};

const GUEST_STORAGE_KEY = 'geoTrainerGuestData';

function safeParse<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

export function useUserPreferences() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [stats, setStats] = useState<any>({});
  const [progress, setProgress] = useState<any>({});

  const [pendingMigration, setPendingMigration] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // User logged in, fetch from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.preferences) setPreferences(data.preferences);
            
            // Sync cloud data to local storage for useQuizEngine
            if (data.geoStats) {
              localStorage.setItem('geo_trainer_stats', JSON.stringify(data.geoStats));
              setStats(data.geoStats);
            }
            if (data.geoProgress) {
              localStorage.setItem('geo_trainer_progress', JSON.stringify(data.geoProgress));
              setProgress(data.geoProgress);
            }
            syncSettingsAndConsent(data);
          } else {
            // New user! Check if there is local guest data
            const localData = localStorage.getItem(GUEST_STORAGE_KEY);
            const localStatsStr = localStorage.getItem('geo_trainer_stats');
            
            // Has the user done anything locally? Let's check stats safely.
            const parsedStats = safeParse<{ totalAnswered?: number }>(localStatsStr, {});
            const hasLocalStats = Boolean(parsedStats && parsedStats.totalAnswered && parsedStats.totalAnswered > 0);
            const hasLocalPrefs = localData !== null;
            
            if (hasLocalStats || hasLocalPrefs) {
               // We have local data. Prompt the user.
               setCurrentUserData(currentUser);
               setPendingMigration(true);
            } else {
               // No local data, just initialize quietly
               await setDoc(userDocRef, {
                 email: currentUser.email,
                 displayName: currentUser.displayName,
                 createdAt: new Date().toISOString(),
                 preferences: DEFAULT_PREFERENCES,
                 geoStats: {},
                 geoProgress: {},
               });
               syncSettingsAndConsent(undefined);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Guest mode
        const localData = localStorage.getItem(GUEST_STORAGE_KEY);
        if (localData) {
          const parsed = safeParse<{ preferences?: UserPreferences }>(localData, {});
          if (parsed.preferences) setPreferences(parsed.preferences);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMigrationChoice = async (shouldMigrate: boolean) => {
      if (!currentUserData) return;
      const userDocRef = doc(db, 'users', currentUserData.uid);
      
      let initialPrefs = DEFAULT_PREFERENCES;
      let localStats = {};
      let localProgress = {};
      
      if (shouldMigrate) {
          const localData = localStorage.getItem(GUEST_STORAGE_KEY);
          if (localData) {
            const parsed = safeParse<{ preferences?: UserPreferences }>(localData, {});
            if (parsed.preferences) initialPrefs = parsed.preferences;
          }
          localStats = safeParse(localStorage.getItem('geo_trainer_stats'), {});
          localProgress = safeParse(localStorage.getItem('geo_trainer_progress'), {});
      } else {
         // Wipe the local stuff so they start fresh
         localStorage.removeItem(GUEST_STORAGE_KEY);
         localStorage.removeItem('geo_trainer_stats');
         localStorage.removeItem('geo_trainer_progress');
      }

      await setDoc(userDocRef, {
        email: currentUserData.email,
        displayName: currentUserData.displayName,
        createdAt: new Date().toISOString(),
        preferences: initialPrefs,
        geoStats: localStats,
        geoProgress: localProgress,
      });
      
      syncSettingsAndConsent(undefined);
      setPreferences(initialPrefs);
      setStats(localStats);
      setProgress(localProgress);
      setPendingMigration(false);
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          preferences: updated,
          'preferences.lastUpdated': new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving preferences to Firestore:", error);
      }
    } else {
      const currentData = safeParse<Record<string, any>>(localStorage.getItem(GUEST_STORAGE_KEY), {});
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
        ...currentData,
        preferences: updated
      }));
    }
  };

  // Call this after a quiz session to sync local stats to cloud
  const syncLocalStatsToCloud = async () => {
    if (user) {
      try {
        const localStats = safeParse(localStorage.getItem('geo_trainer_stats'), {});
        const localProgress = safeParse(localStorage.getItem('geo_trainer_progress'), {});
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          geoStats: localStats,
          geoProgress: localProgress
        });
        setStats(localStats);
        setProgress(localProgress);
      } catch (error) {
        console.error("Error syncing stats to Firestore:", error);
      }
    }
  };

  return { user, loading, preferences, stats, progress, updatePreferences, syncLocalStatsToCloud, pendingMigration, handleMigrationChoice };
}
