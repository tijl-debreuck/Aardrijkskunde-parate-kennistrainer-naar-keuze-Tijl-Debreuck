import React, { useState, useEffect } from 'react';
import { UserStats } from '../../hooks/useQuizEngine';
import { 
  Users, Target, Clock, AlertTriangle, Trash2, Folder, 
  RotateCcw, CheckCircle, Cloud, HardDrive, RefreshCw
} from 'lucide-react';
import { StudyFolder } from '../../types/geography';

interface AdminUsersProps {
  stats: UserStats;
  theme: 'dark' | 'light';
  onClearStats: () => void;
  user: any;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ stats, theme, onClearStats, user }) => {
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadFolders = () => {
    try {
      const userKey = user?.uid ? `geo_folders_${user.uid}` : null;
      const stored = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('geo_study_folders');
      if (stored) {
        setFolders(JSON.parse(stored));
      } else {
        setFolders([]);
      }
    } catch (_e) {
      setFolders([]);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetFolders = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Aangepaste Leermapjes Wissen?',
      description: 'Weet je zeker dat je alle lokaal aangemaakte studiemapjes wilt wissen? De standaard voorbeeldmappen worden daarna opnieuw aangemaakt bij het herladen.',
      onConfirm: () => {
        if (user?.uid) {
          localStorage.removeItem(`geo_folders_${user.uid}`);
        }
        localStorage.removeItem('geo_study_folders');
        loadFolders();
        showToast('Leermapjes succesvol gewist!');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetProgress = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Gebruikersvoortgang & Statistieken Wissen?',
      description: 'Weet je zeker dat je alle scores, quizantwoorden en spaced repetition gegevens permanent wilt wissen?',
      onConfirm: () => {
        onClearStats();
        showToast('Voortgang en scores zijn gereset!');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const totalAnswered = stats.totalAnswered || 0;
  const accuracy = stats.accuracy || 0;
  const avgTime = stats.avgTime || 0;
  const weaknesses = stats.weaknesses || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {confirmModal.description}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Annuleren
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Ja, definitief wissen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Beantwoorde Vragen
            </p>
            <p className="text-3xl font-extrabold text-blue-500 mt-1">{totalAnswered}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.totalCorrect || 0} goed beantwoord</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Gemiddelde Tijd
            </p>
            <p className="text-3xl font-extrabold text-purple-500 mt-1">{avgTime}s</p>
            <p className="text-xs text-slate-400 mt-1">Per vraag respons</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Nauwkeurigheid
            </p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-1">{accuracy}%</p>
            <p className="text-xs text-slate-400 mt-1">Algemene leerscore</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cloud & Account Status */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Actieve Account & Gegevensopslag</h3>
            <p className="text-xs text-slate-400">Status van lokale browseropslag en backend adapter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Actieve Gebruiker</p>
            <p className="text-sm font-bold mt-1">
              {user ? (user.email || user.displayName || user.uid) : 'Gastgebruiker (Niet ingelogd)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {user ? 'Prestaties worden lokaal bewaard en staan gereed voor synchronisatie.' : 'Gegevens worden veilig lokaal in de browser bewaard.'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Opslag Medium</p>
            <div className="flex items-center gap-2 mt-1">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">LocalStorage (Offline-first)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Snelle lokale werking met voorbereide adapter voor nieuwe databasekoppeling.
            </p>
          </div>
        </div>
      </div>

      {/* Leermapjes & Moeilijke Onderwerpen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Folders Overview */}
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Aangemaakte Leermapjes</h3>
                  <p className="text-xs text-slate-400">{folders.length} mapjes geregistreerd in opslag</p>
                </div>
              </div>
              <button
                onClick={loadFolders}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
                title="Herlaad mappen"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Geen aangepaste leermapjes gevonden in lokale opslag.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{folder.name}</p>
                      <p className="text-slate-400 text-[11px]">
                        {folder.itemIds?.length || 0} leerelementen gekoppeld
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 font-mono font-bold text-[10px]">
                      {new Date(folder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleResetFolders}
              disabled={folders.length === 0}
              className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 disabled:opacity-40 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Mapjes Resetten</span>
            </button>
          </div>
        </div>

        {/* Fouten & Moeilijke Onderwerpen */}
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Aandachtspunten & Zwakke Plekken</h3>
                <p className="text-xs text-slate-400">Onderwerpen met lagere score volgens spaced repetition</p>
              </div>
            </div>

            {weaknesses.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-slate-400 font-medium">
                  Geen hardnekkige fouten geregistreerd. De prestaties zijn uitstekend!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {weaknesses.map((w, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{w.name}</p>
                      <p className="text-slate-400 text-[11px] capitalize">
                        {w.category} • {w.region}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 font-mono font-bold text-[10px]">
                      {w.errorCount}x fout
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleResetProgress}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Wis Voortgang & Scores</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
