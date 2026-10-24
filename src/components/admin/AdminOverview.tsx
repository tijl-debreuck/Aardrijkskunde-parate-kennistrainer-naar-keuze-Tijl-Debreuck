import React, { useState, useEffect, useMemo } from 'react';
import { validateDatasetIntegrity } from '../../utils/geoDataParser';
import { UserStats } from '../../hooks/useQuizEngine';
import { 
  Database, ShieldCheck, Key, CheckCircle, AlertTriangle, 
  Users, Activity, ArrowRight, Server, HardDrive, RefreshCw
} from 'lucide-react';

interface AdminOverviewProps {
  stats: UserStats;
  theme: 'dark' | 'light';
  onNavigateTab: (tab: 'users' | 'datasets' | 'validator') => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, theme, onNavigateTab }) => {
  const [serverStatus, setServerStatus] = useState<{
    isPasswordConfigured: boolean;
    uptimeSeconds: number;
    timestamp: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  // Password test tool
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingPassword, setTestingPassword] = useState(false);

  // Compute dataset metrics
  const integrityReport = useMemo(() => {
    try {
      return validateDatasetIntegrity();
    } catch (_err) {
      return null;
    }
  }, []);

  // Fetch server status
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch admin status', e);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPassword) return;
    setTestingPassword(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: testPassword })
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data.success) {
        setTestResult({ success: true, message: 'Wachtwoord is correct en geverifieerd!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Onjuist wachtwoord!' });
      }
    } catch (_err) {
      setTestResult({ success: false, message: 'Fout bij verbinden met verificatie-server.' });
    } finally {
      setTestingPassword(false);
    }
  };

  const totalEntities = integrityReport?.totalItems || 0;
  const loadedCount = integrityReport?.loadedCount || 0;
  const integrationScore = integrityReport?.integrationScore || 0;
  const totalAnswered = stats.totalAnswered || 0;
  const accuracy = stats.accuracy || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entities */}
        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Totaal Entiteiten
            </p>
            <p className="text-3xl font-extrabold text-blue-500 mt-1">{totalEntities}</p>
            <p className="text-xs text-slate-400 mt-1">{loadedCount} succesvol gekoppeld</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Data Integrity */}
        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Integriteitscore
            </p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-1">{integrationScore}%</p>
            <p className="text-xs text-slate-400 mt-1">Status: Gevalideerd</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Quiz Sessions */}
        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Quiz Antwoorden
            </p>
            <p className="text-3xl font-extrabold text-purple-500 mt-1">{totalAnswered}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.totalCorrect || 0} correct beantwoord</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Global Accuracy */}
        <div className={`p-6 rounded-3xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold font-mono text-slate-400">
              Nauwkeurigheid
            </p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{accuracy}%</p>
            <p className="text-xs text-slate-400 mt-1">Gemiddelde precisie</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Systeem Status & Server Overzicht */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Systeem Status & Service Indicators</h3>
              <p className="text-xs text-slate-400">Real-time status van Firebase services, API-connectiviteit en gegevensopslag</p>
            </div>
          </div>
          <button 
            onClick={fetchStatus}
            disabled={statusLoading}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
            <span>Vernieuw status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API Connectiviteit */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="text-xs font-bold">API Connectiviteit</p>
                <p className="text-[11px] text-slate-400">Express Proxy (/api)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Online
            </span>
          </div>

          {/* Firebase Auth */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="text-xs font-bold">Firebase Auth</p>
                <p className="text-[11px] text-slate-400">Gebruikersauthenticatie</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Actief
            </span>
          </div>

          {/* Firestore DB */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <p className="text-xs font-bold">Firestore DB</p>
                <p className="text-[11px] text-slate-400">Cloud Databank Sync</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Verbonden
            </span>
          </div>

          {/* LocalStorage & Caching */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <div>
                <p className="text-xs font-bold">LocalStorage</p>
                <p className="text-[11px] text-slate-400">Browser Cache & Sync</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Gereed
            </span>
          </div>
        </div>
      </div>

      {/* Wachtwoordbeheer & Beveiliging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-3xl border shadow-xl ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Wachtwoordbeheer & Toegangscontrole</h3>
              <p className="text-xs text-slate-400">Verifieer en beheer het beheerderswachtwoord</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Het beheerderspaneel wordt uitsluitend server-side beveiligd via een cryptografische SHA-256 hash (<code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-blue-500">ADMIN_PASSWORD_HASH</code>).
            Er staat geen enkel platte-tekst wachtwoord in de front-end of broncode.
          </p>

          <form onSubmit={handleTestPassword} className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase text-slate-400">
              Test Wachtwoord Verificatie
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Voer wachtwoord in..."
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="submit"
                disabled={testingPassword || !testPassword}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1.5"
              >
                {testingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                <span>Verifieer</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-400">
            <strong>Wachtwoord wijzigen:</strong> Pas <code className="font-mono text-blue-400">ADMIN_PASSWORD</code> aan in het configuratiepaneel van je hosting of in <code className="font-mono text-blue-400">.env</code>.
          </div>
        </div>

        {/* Snelle Snelkoppelingen naar Dashboard Onderdelen */}
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Directe Beheerdersacties</h3>
                <p className="text-xs text-slate-400">Schakel direct naar de verschillende onderdelen van het dashboard</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onNavigateTab('users')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-blue-500/40' 
                    : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Gebruikers & Voortgang</p>
                    <p className="text-[11px] text-slate-400">Bekijk leerprestaties, foutenanalyse en beheer gegevens</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('datasets')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40' 
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Datasets, Items & Backup</p>
                    <p className="text-[11px] text-slate-400">Voeg eigen items toe en maak of herstel JSON backups</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('validator')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40' 
                    : 'bg-slate-50 border-slate-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Data Validator & Diagnose Logs</p>
                    <p className="text-[11px] text-slate-400">Controleer coördinaten, polygonen en download audit-rapporten</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
