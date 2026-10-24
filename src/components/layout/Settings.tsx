import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Volume2, VolumeX, Moon, Sun, 
  Sliders, Check, Languages, ShieldCheck, Download, Trash2, 
  FileText, RotateCcw, Lock
} from 'lucide-react';
import { Language, uiTranslations } from '../../utils/language';
import { LegalConsentModal } from '../legal/LegalConsentModal';
import { buildUserDataExport, getStoredConsent, revokeConsent } from '../legal/LegalDocuments';

interface SettingsProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  onClearStats: () => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  theme,
  setTheme,
  isSoundMuted,
  toggleSound,
  onClearStats,
  language = 'nl',
  onLanguageChange
}) => {
  const t = uiTranslations[language];

  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [consentRecord, setConsentRecord] = useState(() => getStoredConsent());

  const [wrongAnswerDelay, setWrongAnswerDelay] = useState<number>(() => {
    const val = localStorage.getItem('geo_wrong_answer_delay');
    return val ? parseFloat(val) : 3.0;
  });

  const [mapHighContrast, setMapHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('geo_map_contrast') === 'true';
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLanguageToggle = (nextLang: Language) => {
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    }
    localStorage.setItem('geo_language', nextLang);
    showToast(t.toastLangChanged(nextLang === 'nl' ? 'Nederlands' : 'English'));
  };

  const handleWrongDelayChange = (seconds: number) => {
    setWrongAnswerDelay(seconds);
    localStorage.setItem('geo_wrong_answer_delay', seconds.toString());
    showToast(`Pauze bij fout antwoord ingesteld op ${seconds.toFixed(1)}s`);
  };

  const handleToggleContrast = () => {
    const next = !mapHighContrast;
    setMapHighContrast(next);
    localStorage.setItem('geo_map_contrast', String(next));
    showToast(next ? 'Hoog-contrast kaartranden ingeschakeld' : 'Standaard kaartranden ingeschakeld');
  };

  const isDark = theme === 'dark';
  const cardClass = `p-6 rounded-3xl border shadow-xl space-y-4 ${
    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`;
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivideClass = isDark ? 'border-slate-800' : 'border-slate-100';
  const btnInactiveClass = isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200';

  return (
    <div className={`space-y-8 animate-fade-in max-w-4xl mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 border border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      <div className={`p-6 border rounded-3xl shadow-xl flex items-center justify-between ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-2xl">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Applicatie Instellingen
            </h2>
            <p className={`text-sm ${subtitleClass}`}>Pas de weergave, audio en quizvoorkeuren aan naar wens.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taal van Benamingen */}
        <div className={`${cardClass} md:col-span-2`}>
          <div className={`flex items-center gap-2 pb-3 border-b text-indigo-500 ${borderDivideClass}`}>
            <Languages className="w-5 h-5" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.languageSettingTitle}</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div>
              <span className="text-sm font-bold block">{t.languageSettingTitle}</span>
              <span className={`text-xs ${subtitleClass}`}>{t.languageSettingSubtitle}</span>
            </div>
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => handleLanguageToggle('nl')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  language === 'nl' ? 'bg-blue-600 text-white shadow-md' : `${subtitleClass} hover:text-blue-500`
                }`}
              >
                <span>🇳🇱</span> Nederlands
              </button>
              <button
                onClick={() => handleLanguageToggle('en')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  language === 'en' ? 'bg-blue-600 text-white shadow-md' : `${subtitleClass} hover:text-blue-500`
                }`}
              >
                <span>🇬🇧</span> English
              </button>
            </div>
          </div>
        </div>

        {/* Audio & Geluid */}
        <div className={cardClass}>
          <div className={`flex items-center gap-2 pb-3 border-b text-blue-500 ${borderDivideClass}`}>
            <Volume2 className="w-5 h-5" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Geluid & Audio</h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-bold block">Geluidseffecten</span>
              <span className={`text-xs ${subtitleClass}`}>Speel een geluid af bij het selecteren van antwoorden</span>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                !isSoundMuted 
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-md shadow-emerald-500/20' 
                  : btnInactiveClass
              }`}
            >
              {!isSoundMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{!isSoundMuted ? 'Ingeschakeld' : 'Gedempt'}</span>
            </button>
          </div>
        </div>

        {/* Weergave & Thema */}
        <div className={cardClass}>
          <div className={`flex items-center gap-2 pb-3 border-b text-purple-500 ${borderDivideClass}`}>
            <Sun className="w-5 h-5" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Weergave & Thema</h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-bold block">Interface Thema</span>
              <span className={`text-xs ${subtitleClass}`}>Schakel tussen een donkere of lichte lay-out</span>
            </div>
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => {
                  setTheme('dark');
                  showToast('Donker thema ingeschakeld');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  theme === 'dark' ? 'bg-blue-600 text-white shadow' : `${subtitleClass} hover:text-blue-500`
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Donker
              </button>
              <button
                onClick={() => {
                  setTheme('light');
                  showToast('Licht thema ingeschakeld');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  theme === 'light' ? 'bg-blue-600 text-white shadow' : `${subtitleClass} hover:text-blue-500`
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Licht
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-between py-2 border-t ${borderDivideClass}`}>
            <div>
              <span className="text-sm font-bold block">Hoog-contrast Kaartranden</span>
              <span className={`text-xs ${subtitleClass}`}>Duidelijkere grenzen en contouren op kaarten</span>
            </div>
            <button
              onClick={handleToggleContrast}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                mapHighContrast
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : btnInactiveClass
              }`}
            >
              {mapHighContrast ? 'Aan' : 'Uit'}
            </button>
          </div>
        </div>

        {/* Quiz Voorkeuren */}
        <div className={`${cardClass} md:col-span-2`}>
          <div className={`flex items-center gap-2 pb-3 border-b text-amber-500 ${borderDivideClass}`}>
            <Sliders className="w-5 h-5" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quiz Voorkeuren</h3>
          </div>

          {/* Slider for Wrong Answer Delay */}
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold block">Vertraging bij Fout Antwoord</span>
                <span className={`text-xs ${subtitleClass}`}>
                  Seconden wachten bij onjuist antwoord (bij een goed antwoord ga je direct snel door)
                </span>
              </div>
              <span className="text-sm font-mono font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/20 shrink-0">
                {wrongAnswerDelay.toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono font-bold text-slate-400">0.5s</span>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={wrongAnswerDelay}
                onChange={(e) => handleWrongDelayChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-xs font-mono font-bold text-slate-400">5.0s</span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium px-0.5">
              <span>⚡ Snel doorwerken</span>
              <span>🐢 Rustig antwoord bekijken</span>
            </div>
          </div>
        </div>

        {/* Privacy, Voorwaarden & Gegevensbeheer (AVG / GDPR) */}
        <div className={`${cardClass} md:col-span-2`}>
          <div className={`flex items-center justify-between pb-3 border-b ${borderDivideClass}`}>
            <div className="flex items-center gap-2 text-blue-500">
              <ShieldCheck className="w-5 h-5" />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Privacy, Voorwaarden & Gegevensbeheer (AVG / GDPR)
              </h3>
            </div>
            {consentRecord && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Toestemming Actief (v{consentRecord.version})
              </span>
            )}
          </div>

          <p className={`text-xs ${subtitleClass} leading-relaxed`}>
            GeoTrainer respecteert jouw privacy volledig conform de Europese Algemene Verordening Gegevensbescherming (AVG). We verzamelen geen overbodige persoonsgegevens, verkopen niets door en gebruiken uitsluitend strikt functionele browseropslag voor jouw leervoortgang.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Bekijk Voorwaarden Knop */}
            <button
              onClick={() => setShowLegalModal(true)}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-blue-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold">Voorwaarden & Privacy</span>
              </div>
              <span className={`text-[11px] ${subtitleClass}`}>
                Lees de complete gebruiksvoorwaarden, cookiebeleid en licenties
              </span>
            </button>

            {/* Download Data Knop */}
            <button
              onClick={() => {
                const data = buildUserDataExport();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                a.download = `mijn-geotrainer-data-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Jouw persoonsgegevens zijn gedownload als JSON (Art. 15/20 AVG)!');
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-emerald-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-xs font-bold">Download Mijn Data</span>
              </div>
              <span className={`text-[11px] ${subtitleClass}`}>
                Exporteer al je scores, leermapjes en instellingen als JSON (Recht op inzage)
              </span>
            </button>

            {/* Wis Data Knop */}
            <button
              onClick={() => {
                onClearStats();
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-rose-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-bold">Wis Al Mijn Gegevens</span>
              </div>
              <span className={`text-[11px] ${subtitleClass}`}>
                Permanent verwijderen van alle lokale en gesynchroniseerde data (Recht op vergetelheid)
              </span>
            </button>
          </div>

          <div className={`mt-2 pt-3 border-t ${borderDivideClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400`}>
            <div>
              Toestemming geregistreerd op:{' '}
              <strong className="text-slate-600 dark:text-slate-300">
                {consentRecord ? new Date(consentRecord.timestamp).toLocaleString() : 'Nog niet opgeslagen'}
              </strong>
            </div>

            <button
              onClick={() => {
                if (confirm('Weet je zeker dat je jouw toestemming voor de juridische voorwaarden wilt intrekken? De toestemmingsmodal zal direct opnieuw verschijnen.')) {
                  revokeConsent();
                  setConsentRecord(null);
                  window.location.reload();
                }
              }}
              className="text-rose-500 hover:text-rose-400 font-bold transition-all cursor-pointer underline flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Toestemming intrekken</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Legal Modal in read-only mode */}
      {showLegalModal && (
        <LegalConsentModal
          theme={theme}
          isViewOnly={true}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </div>
  );
};

export default Settings;
