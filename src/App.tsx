import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Region, QuizMode, QuestionType } from './types/geography';
import { useQuizEngine } from './hooks/useQuizEngine';
import MultipleChoice from './components/exercises/MultipleChoice';
import FillInBlank from './components/exercises/FillInBlank';
import FlagQuiz from './components/exercises/FlagQuiz';
import Stats from './components/layout/Stats';
import SettingsView from './components/layout/Settings';
import { AdminDashboard } from './components/admin/AdminDashboard';
import GeoQuiz from './components/GeoQuiz';
import LoginMenu from './components/layout/LoginMenu';
import MyLearningPage from './components/study/MyLearningPage';
import { useUserPreferences } from './hooks/useUserPreferences';
import sound from './utils/audio';
import { LegalConsentModal } from './components/legal/LegalConsentModal';
import { getStoredConsent, saveConsent } from './components/legal/LegalDocuments';
import { saveSetting, SETTINGS_CHANGED_EVENT } from './lib/userSettings';
import { fetchCustomItems } from './lib/customItems';
import { 
  RefreshCw, ArrowLeft, Hourglass, Moon, Sun, Volume2, VolumeX, Lock
} from 'lucide-react';

import { Language, uiTranslations } from './utils/language';

const formatStopwatch = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface AdminLoginFormProps {
  theme: 'dark' | 'light';
  onSubmit: (e: React.FormEvent) => void;
  password: string;
  setPassword: (val: string) => void;
  error: string | null;
  loading: boolean;
}

function AdminLoginForm({ theme, onSubmit, password, setPassword, error, loading }: AdminLoginFormProps) {
  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in">
      <div className={`p-8 rounded-3xl border shadow-2xl ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
      }`}>
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`p-4 rounded-full mb-3 ${
            theme === 'dark' ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-105/50'
          }`}>
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Admin Toegang Vergrendeld</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Voer het beheerderswachtwoord in om toegang te krijgen tot het Admin Dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-550 animate-pulse shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Ontgrendel Toegang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // Legal Consent Gate (AVG / GDPR Compliance)
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState<boolean>(() => {
    return Boolean(getStoredConsent());
  });

  // Global View Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'study' | 'stats' | 'settings' | 'advice' | 'debug' | 'admin'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('geo_theme') as 'dark' | 'light') || 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('geo_language') as Language) || 'nl';
  });

  const t = uiTranslations[language];

  // Instellingen die na het inloggen uit de database komen, opnieuw inlezen
  useEffect(() => {
    const reload = () => {
      setTheme((localStorage.getItem('geo_theme') as 'dark' | 'light') || 'light');
      setLanguage((localStorage.getItem('geo_language') as Language) || 'nl');
      const muted = localStorage.getItem('geoSoundMuted') === 'true';
      sound.setMuted(muted);
      setIsSoundMuted(muted);
    };
    window.addEventListener(SETTINGS_CHANGED_EVENT, reload);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, reload);
  }, []);

  // Door de beheerder toegevoegde quizitems ophalen
  useEffect(() => {
    fetchCustomItems();
  }, []);

  useEffect(() => {
    saveSetting('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Study Config State
  const [activeRegion, setActiveRegion] = useState<Region>('belgium');
  const [activeCategory, setActiveCategory] = useState<QuestionType>('province');
  const [activeMode, setActiveCategoryMode] = useState<QuizMode>('multiple-choice');

  // Active quiz gameplay session variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizTimer, setQuizTimer] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const { user, preferences, updatePreferences, syncLocalStatsToCloud, pendingMigration, handleMigrationChoice } = useUserPreferences();

  const handleStartFolderMapQuiz = (_folderName: string, itemIds: string[]) => {
    updatePreferences({
      selectedItemIds: itemIds,
      selectedRegions: ['belgium', 'europe', 'world'],
      selectedCategories: ['province', 'region', 'country', 'river', 'mountain', 'sea', 'highway', 'capital', 'continent']
    });

    const hasBelgium = itemIds.some(id => id.startsWith('be-'));
    const isOnlyRegions = itemIds.every(id => id.startsWith('be-reg-'));

    if (hasBelgium) {
      setActiveRegion('belgium');
      if (isOnlyRegions) {
        setActiveCategory('region');
      } else {
        setActiveCategory('province');
      }
    } else {
      const hasEurope = itemIds.some(id => id.startsWith('eu-') || id.startsWith('e-'));
      setActiveRegion(hasEurope ? 'europe' : 'world');
      setActiveCategory('country');
    }

    setActiveCategoryMode('multiple-choice');
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    resetSession();
    setTimeout(() => {
      generateQuestion();
      setQuizCompleted(false);
      setIsPlaying(true);
      questionStartTimeRef.current = Date.now();
    }, 60);
  };

  const handleStartFolderFlagQuiz = (_folderName: string, itemIds: string[]) => {
    updatePreferences({
      selectedItemIds: itemIds,
      selectedRegions: ['europe', 'world', 'belgium'],
      selectedCategories: ['country']
    });

    const hasEurope = itemIds.some(id => id.startsWith('eu-') || id.startsWith('e-'));
    setActiveRegion(hasEurope ? 'europe' : 'world');
    setActiveCategory('country');
    setActiveCategoryMode('flag');

    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    resetSession();
    setTimeout(() => {
      generateQuestion();
      setQuizCompleted(false);
      setIsPlaying(true);
      questionStartTimeRef.current = Date.now();
    }, 60);
  };

  const startQuizSession = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    resetSession();
    generateQuestion();
    setQuizCompleted(false);
    setIsPlaying(true);
    questionStartTimeRef.current = Date.now();
  };

  const quizEngineOptions = useMemo(() => ({
    subType: (activeCategory === 'capital' ? 'capital' : 'name') as 'capital' | 'name' | 'flag',
    preferences // Pass preferences so useQuizEngine uses them when extracting data
  }), [activeCategory, preferences]);

  const {
    currentQuestion,
    generateQuestion,
    submitAnswer,
    sessionScore,
    sessionTotal,
    totalPoolSize,
    userStats,
    resetSession,
    sessionErrors,
    remainingPool
  } = useQuizEngine(activeRegion, activeCategory, activeMode, quizEngineOptions, language);


  // Admin authentication states
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin-sessie zit in een httpOnly-cookie; de server zegt of die nog geldig is
  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Sound effect state
  const [isSoundMuted, setIsSoundMuted] = useState(() => sound.getMuted());

  const toggleSound = () => {
    const nextMute = !isSoundMuted;
    sound.setMuted(nextMute);
    setIsSoundMuted(nextMute);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Ongeldig antwoord van server' }));
      if (res.ok && data.success) {
        setIsAdmin(true);
        setAdminPasswordInput('');
      } else {
        setAdminError(data.error || 'Onjuist wachtwoord!');
      }
    } catch (_err) {
      setAdminError('Er is een fout opgetreden bij het verbinden met de server.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  };

  // Track gameplay stopwatch (count up)
  useEffect(() => {
    if (isPlaying) {
      setQuizTimer(0);
      quizTimerRef.current = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [isPlaying]);

  const handleQuizTimeExpiry = (_overrideScore?: number, _overrideTotal?: number) => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    sound.playComplete();
    setQuizCompleted(true);
    
    // Sync stats to cloud if logged in
    syncLocalStatsToCloud();
  };

  // Auto-generate question if active session has no question loaded
  useEffect(() => {
    if (isPlaying && !quizCompleted && !currentQuestion) {
      if (sessionTotal > 0 && remainingPool.length === 0) {
        handleQuizTimeExpiry();
      } else {
        generateQuestion();
      }
    }
  }, [isPlaying, quizCompleted, currentQuestion, sessionTotal, remainingPool.length, generateQuestion]);

  const handleStartFlagQuiz = (region: Region, _mode: QuizMode) => {
    if (region === 'belgium') return;
    const targetCategory = 'country';
    setActiveRegion(region);
    setActiveCategory(targetCategory);
    setActiveCategoryMode('flag');
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    resetSession();
    generateQuestion(region, targetCategory, 'flag');
    setQuizCompleted(false);
    setIsPlaying(true);
    questionStartTimeRef.current = Date.now();
  };

  const handleStartMultipleChoiceQuiz = (region: Region, category: QuestionType = 'capital') => {
    setActiveRegion(region);
    setActiveCategory(category);
    setActiveCategoryMode('multiple-choice');
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    resetSession();
    generateQuestion(region, category, 'multiple-choice');
    setQuizCompleted(false);
    setIsPlaying(true);
    questionStartTimeRef.current = Date.now();
  };

  const handleNextQuestion = () => {
    generateQuestion();
    questionStartTimeRef.current = Date.now();
  };

  const handleResultSubmit = (isCorrect: boolean, chosenVal: string) => {
    const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
    
    // Play synthesized custom tone live
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    const nextScore = sessionScore + (isCorrect ? 1 : 0);
    const nextTotal = sessionTotal + 1;

    submitAnswer(isCorrect ? currentQuestion!.correctAnswer : chosenVal, elapsed);

    // Limit or single session end trigger checks
    if (activeMode === 'review-errors' && isCorrect && sessionErrors.length <= 1) {
      setTimeout(() => {
        setIsPlaying(false);
        setQuizCompleted(true);
      }, 600);
    } else if (totalPoolSize > 0 && nextTotal >= totalPoolSize) {
      // Finished full dataset round!
      handleQuizTimeExpiry(nextScore, nextTotal);
    } else {
      // Advance to next question
      handleNextQuestion();
    }
  };

  const quitQuizSession = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    setIsPlaying(false);
    setQuizCompleted(false);
    resetSession();
  };

  const clearProgressAndStats = async () => {
    if (confirm("Weet je zeker dat je alle behaalde scores en spaced repetition records permanent wilt wissen? Dit kan niet ongedaan worden gemaakt.")) {
      localStorage.removeItem('geo_trainer_stats');
      localStorage.removeItem('geo_trainer_progress');
      
      if (user) {
         try {
            const { doc, updateDoc, db } = await import('./lib/dbAdapter');
            await updateDoc(doc(db, 'users', user.uid), {
               geoStats: {},
               geoProgress: {}
            });
         } catch(e) {
            console.error("Error clearing cloud stats", e);
         }
      }
      window.location.reload();
    }
  };

  return (
    <>
      {!hasAcceptedConsent && (
        <LegalConsentModal
          theme={theme}
          onAccept={() => {
            saveConsent();
            setHasAcceptedConsent(true);
          }}
        />
      )}
      <header className="top-nav">
        <div className="logo">
          <div className="logo-mark">G</div>
          GeoTrainer
        </div>
        <div className="nav-links">
          <a href="#" className={`nav-link ${activeTab === 'home' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('home'); }}>{t.navHome}</a>
          <a href="#" className={`nav-link ${activeTab === 'dashboard' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('dashboard'); }}>{t.navDashboard}</a>
          <a href="#" className={`nav-link ${activeTab === 'study' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('study'); }}>Mijn Leerstof</a>
          
          {user && (
             <a href="#" className={`nav-link ${activeTab === 'stats' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('stats'); }}>Mijn voortgang</a>
          )}
          
          <a href="#" className={`nav-link ${activeTab === 'settings' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('settings'); }}>{t.navSettings}</a>
          <a href="#" className={`nav-link ${activeTab === 'admin' && !isPlaying ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); quitQuizSession(); setActiveTab('admin'); }}>{t.navAdmin}</a>
        </div>
        <div className="top-actions flex items-center gap-2">
          <LoginMenu user={user} theme={theme} onShowProgress={() => { quitQuizSession(); setActiveTab('stats'); }} />
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="logo-mark" 
            style={{background: 'var(--ink-faint)', color: 'var(--ink)', border: 'none', cursor: 'pointer', outline: 'none'}}
            title={theme === 'dark' ? "Schakel naar licht thema" : "Schakel naar donker thema"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={toggleSound} 
            className="logo-mark" 
            style={{background: 'var(--ink-faint)', color: 'var(--ink)', border: 'none', cursor: 'pointer', outline: 'none'}}
            title={isSoundMuted ? "Geluidseffecten aanzetten" : "Geluidseffecten dempen"}
          >
             {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>
      
      <AnimatePresence>
        {pendingMigration && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">Lokale Gegevens Gevonden!</h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Je hebt als gast geoefend. Wil je deze voortgang en je instellingen meenemen naar je nieuwe account?
              </p>
              
              <div className="flex flex-col gap-3">
                 <button
                    onClick={() => {
                        handleMigrationChoice(true);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md"
                 >
                    Ja, neem mijn gegevens mee
                 </button>
                 <button
                    onClick={() => {
                        handleMigrationChoice(false);
                    }}
                    className={`w-full py-3 rounded-xl text-sm font-bold ${
                       theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                 >
                    Nee, begin met een schone lei
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="page-container">
        {isPlaying ? (
          <div className="content-main" style={{ gridColumn: '1 / -1' }}>
            <div className={`p-4 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            {/* Countdown Clock HUD banner */}
            <div className={`flex justify-between items-center pb-4 border-b mb-6 ${
              theme === 'dark' ? 'border-white/10' : 'border-slate-200'
            }`}>
              <button
                onClick={quitQuizSession}
                className="flex items-center gap-1.5 text-slate-450 hover:text-rose-450 transition-all font-bold font-sans text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Terug naar Dashboard</span>
              </button>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-extrabold ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  <Hourglass className="w-4 h-4 shrink-0 animate-spin-slow" />
                  <span>{formatStopwatch(quizTimer)}</span>
                </div>
                
                <div className={`font-mono text-sm px-3.5 py-1.5 rounded-xl border font-bold ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  Vraag: <span className="text-blue-500 dark:text-blue-400 font-extrabold">{Math.min(sessionTotal + 1, totalPoolSize || sessionTotal + 1 || 1)}</span> / {totalPoolSize || sessionTotal + 1 || 1} &nbsp;|&nbsp; Juist: <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">{sessionScore}</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Stage Box */}
            {quizCompleted ? (
              <div className="text-center py-12 max-w-sm mx-auto">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center rounded-3xl mx-auto mb-6 text-4xl shadow-lg shadow-emerald-500/10">
                  🏆
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">Oefening Afgerond!</h3>
                <p className="text-slate-400 text-sm mt-2">Je hebt met succes de geplande sessie afgerond.</p>

                <div className={`grid grid-cols-3 gap-4 mt-6 p-5 rounded-2xl border border-dashed ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="text-slate-400 text-xs font-mono font-bold uppercase block">Juiste antwoorden</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1">{sessionScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-mono font-bold uppercase block">Nauwkeurigheid</span>
                    <span className="text-2xl font-black text-blue-400 mt-1">
                      {sessionTotal > 0 ? Math.round((sessionScore / sessionTotal) * 100) : 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-mono font-bold uppercase block">Totale Tijd</span>
                    <span className="text-2xl font-black text-amber-400 mt-1">{formatStopwatch(quizTimer)}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={startQuizSession}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl border border-blue-400/30 font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Nieuwe Start</span>
                  </button>
                  <button
                    onClick={quitQuizSession}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 font-bold transition-all cursor-pointer"
                  >
                    Menu sluiten
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="py-6"
                >
                  {(activeMode === 'multiple-choice' || (activeMode === 'review-errors' && currentQuestion.type === 'multiple-choice')) && (
                    <MultipleChoice question={currentQuestion} onResult={handleResultSubmit} />
                  )}
                  {(activeMode === 'fill-in' || (activeMode === 'review-errors' && currentQuestion.type === 'fill-in')) && (
                    <FillInBlank question={currentQuestion} onResult={handleResultSubmit} />
                  )}
                  {(activeMode === 'flag' || (activeMode === 'review-errors' && currentQuestion.type === 'flag')) && (
                    <FlagQuiz question={currentQuestion} onResult={handleResultSubmit} />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 text-slate-500 font-semibold font-mono uppercase text-xs">
                Leermateriaal aan het laden...
              </div>
            )}
            </div>
          </div>
        ) : (
          /* Normal Tab selections viewports */
          <div className="content-main" style={{ gridColumn: '1 / -1' }}>
             {activeTab === 'home' && (
              <div className={`text-center py-20 border rounded-3xl shadow-xl px-6 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                 <h1 className={`text-5xl font-extrabold mb-6 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Welkom bij GeoTrainer</h1>
                 <p className={`mb-10 max-w-2xl mx-auto text-lg font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>De ultieme applicatie om je topografie en geografische kennis te trainen. Gebruik het dashboard om te beginnen met interactieve kaart- en vlaggenquizzen.</p>
                 <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all cursor-pointer">Ga naar Dashboard</button>
              </div>
            )}
            
            {/* View Tab Kaart Quiz */}
            {activeTab === 'dashboard' && (
              <GeoQuiz 
                onStartFlagQuiz={handleStartFlagQuiz}
                onStartMultipleChoiceQuiz={handleStartMultipleChoiceQuiz}
                language={language} 
              />
            )}

            {/* View Tab Mijn Leerstof */}
            {activeTab === 'study' && (
              <MyLearningPage
                user={user}
                theme={theme}
                language={language}
                onStartMapQuizWithItems={handleStartFolderMapQuiz}
                onStartFlagQuizWithItems={handleStartFolderFlagQuiz}
                onGoToDashboard={() => setActiveTab('dashboard')}
                preferences={preferences}
                updatePreferences={updatePreferences}
              />
            )}

            {/* View Tab Stats */}
            {activeTab === 'stats' && (
              <Stats stats={userStats} onClearStats={clearProgressAndStats} />
            )}

            {/* View Tab Instellingen */}
            {activeTab === 'settings' && (
              <SettingsView 
                theme={theme}
                setTheme={setTheme}
                isSoundMuted={isSoundMuted}
                toggleSound={toggleSound}
                onClearStats={clearProgressAndStats}
                language={language}
                onLanguageChange={(l) => setLanguage(l)}
              />
            )}



            {/* View Tab Admin Dashboard */}
            {activeTab === 'admin' && (
              !isAdmin ? (
                <AdminLoginForm
                  theme={theme}
                  onSubmit={handleAdminLogin}
                  password={adminPasswordInput}
                  setPassword={setAdminPasswordInput}
                  error={adminError}
                  loading={adminLoading}
                />
              ) : (
                <AdminDashboard
                  theme={theme}
                  onLogout={handleAdminLogout}
                  stats={userStats}
                  onClearStats={clearProgressAndStats}
                  user={user}
                  initialTab="overview"
                />
              )
            )}

            {/* View Tab Debugger / Validator Shortcut */}
            {activeTab === 'debug' && (
              !isAdmin ? (
                <AdminLoginForm
                  theme={theme}
                  onSubmit={handleAdminLogin}
                  password={adminPasswordInput}
                  setPassword={setAdminPasswordInput}
                  error={adminError}
                  loading={adminLoading}
                />
              ) : (
                <AdminDashboard
                  theme={theme}
                  onLogout={handleAdminLogout}
                  stats={userStats}
                  onClearStats={clearProgressAndStats}
                  user={user}
                  initialTab="validator"
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
