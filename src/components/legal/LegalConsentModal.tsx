import React, { useState } from 'react';
import { 
  ShieldCheck, Cookie, FileText, Globe, Key, 
  Check, Lock, ExternalLink, X, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { LEGAL_SECTIONS, CURRENT_LEGAL_VERSION } from './LegalDocuments';

interface LegalConsentModalProps {
  theme: 'dark' | 'light';
  onAccept?: () => void;
  isViewOnly?: boolean;
  onClose?: () => void;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({
  theme,
  onAccept,
  isViewOnly = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('privacy');
  const [hasCheckedTerms, setHasCheckedTerms] = useState<boolean>(false);

  const isDark = theme === 'dark';

  const getTabIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <ShieldCheck className="w-4 h-4" />;
      case 'Cookie': return <Cookie className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Key': return <Key className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const currentSection = LEGAL_SECTIONS.find(s => s.id === activeTab) || LEGAL_SECTIONS[0];

  const handleAcceptClick = () => {
    if (hasCheckedTerms && onAccept) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className={`relative w-full max-w-4xl my-auto rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isViewOnly ? 'Juridische Voorwaarden & Privacy' : 'Welkom bij GeoTrainer'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  AVG/GDPR v{CURRENT_LEGAL_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {isViewOnly 
                  ? 'Raadpleeg hier de volledige gebruiksvoorwaarden, privacyverklaring en licenties van GeoTrainer.'
                  : 'Voordat je begint met oefenen en trainen, dien je akkoord te gaan met onze voorwaarden, privacyverklaring en lokale gegevensopslag.'}
              </p>
            </div>
          </div>

          {isViewOnly && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body: Left Tab Navigator + Right Document Reader */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Navigation Bar / Tabs */}
          <div className={`w-full md:w-72 shrink-0 p-3 border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto space-y-1 ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'
          }`}>
            <p className="hidden md:block px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Juridische Onderdelen
            </p>
            <div className="flex md:flex-col gap-1.5">
              {LEGAL_SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold shrink-0 md:shrink ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : 'text-blue-500'}>
                        {getTabIcon(sec.icon)}
                      </span>
                      <span className="truncate">{sec.title.split('. ')[1]}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 hidden md:block opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Content View */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="text-blue-500">{getTabIcon(currentSection.icon)}</span>
                <span>{currentSection.title}</span>
              </h3>
              <p className="text-xs text-blue-500/90 font-medium mt-1">
                {currentSection.summary}
              </p>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {currentSection.content.map((paragraph, index) => {
                const isBullet = paragraph.startsWith('•');
                return (
                  <p 
                    key={index} 
                    className={isBullet ? 'pl-4 font-mono text-[11px] text-slate-500 dark:text-slate-400' : ''}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Rechten & Contact Box */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 mt-6 ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>AVG/GDPR Functionaris & Toezicht</span>
              </div>
              <p className="text-[11px]">
                Vragen over gegevensverwerking of verzoeken tot inzage/wissing? Neem contact op via <strong className="text-blue-500">privacy@geotrainer.app</strong>.
                Klachten kunnen worden ingediend bij de Gegevensbeschermingsautoriteit (GBA).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer (Only in interactive consent mode) */}
        {!isViewOnly ? (
          <div className={`p-5 sm:p-6 border-t shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-100 bg-slate-50'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasCheckedTerms}
                onChange={(e) => setHasCheckedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-blue-600 shrink-0"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                Ik ga akkoord met de <strong>gebruiksvoorwaarden</strong>, de <strong>privacyverklaring</strong> en het gebruik van <strong>strikt noodzakelijke lokale opslag</strong> voor educatieve doeleinden.
              </span>
            </label>

            <button
              onClick={handleAcceptClick}
              disabled={!hasCheckedTerms}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Akkoord en doorgaan naar GeoTrainer</span>
            </button>
          </div>
        ) : (
          <div className={`p-4 border-t shrink-0 flex justify-end ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-100 bg-slate-50'
          }`}>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
            >
              Sluiten
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
