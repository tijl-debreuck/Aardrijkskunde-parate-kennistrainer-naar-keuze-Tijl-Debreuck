/**
 * Apparaatoverschrijdende instellingen (thema, taal, geluid, ...).
 *
 * localStorage blijft de snelle bron die componenten synchroon uitlezen;
 * voor ingelogde gebruikers wordt elke wijziging ook in de database bewaard
 * en bij het inloggen terug naar localStorage gezet.
 */
import { auth } from './dbAdapter';

// Instellingsnaam in de database → localStorage-sleutel
const SETTING_KEYS = {
  theme: 'geo_theme',
  language: 'geo_language',
  wrongAnswerDelay: 'geo_wrong_answer_delay',
  mapContrast: 'geo_map_contrast',
  soundMuted: 'geoSoundMuted',
} as const;

export type SettingName = keyof typeof SETTING_KEYS;
export type UserSettings = Partial<Record<SettingName, string>>;

export const SETTINGS_CHANGED_EVENT = 'geo_settings_changed';

export function collectLocalSettings(): UserSettings {
  const settings: UserSettings = {};
  for (const [name, key] of Object.entries(SETTING_KEYS)) {
    const val = localStorage.getItem(key);
    if (val !== null) settings[name as SettingName] = val;
  }
  return settings;
}

/** Zet instellingen uit de database in localStorage en laat de app ze opnieuw inlezen. */
export function applySettings(settings: UserSettings) {
  for (const [name, val] of Object.entries(settings)) {
    const key = SETTING_KEYS[name as SettingName];
    if (key && typeof val === 'string') localStorage.setItem(key, val);
  }
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function pushSettingsToServer() {
  if (!auth.currentUser) return;
  if (pushTimer) clearTimeout(pushTimer);
  // Kort wachten zodat snel na elkaar gewijzigde instellingen samen verstuurd worden
  pushTimer = setTimeout(() => {
    pushTimer = null;
    fetch('/api/user/data', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: collectLocalSettings() }),
    }).catch(err => console.warn("Instellingen opslaan mislukt:", err));
  }, 500);
}

export function saveSetting(name: SettingName, value: string) {
  const key = SETTING_KEYS[name];
  if (localStorage.getItem(key) === value) return;
  localStorage.setItem(key, value);
  pushSettingsToServer();
}
