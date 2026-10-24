import React, { useState } from 'react';
import { UserStats } from '../../hooks/useQuizEngine';
import { 
  ShieldCheck, Lock, LogOut, LayoutDashboard, 
  Users, Database, FileCheck, CheckCircle2 
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminDatasets } from './AdminDatasets';
import { AdminValidator } from './AdminValidator';

export type AdminTab = 'overview' | 'users' | 'datasets' | 'validator';

interface AdminDashboardProps {
  theme: 'dark' | 'light';
  onLogout: () => void;
  stats: UserStats;
  onClearStats: () => void;
  user: any;
  initialTab?: AdminTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  theme,
  onLogout,
  stats,
  onClearStats,
  user,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-900 dark:text-white">
      {/* Top Admin Header Bar */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Geautoriseerd</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Centraal beheersysteem voor data-integriteit, gebruikers, datasets en systeemanalyse.
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="self-start md:self-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log uit</span>
        </button>
      </div>

      {/* Admin Tab Switcher Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overzicht & Statistieken</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gebruikers & Voortgang</span>
        </button>

        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'datasets'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Datasets & Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('validator')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'validator'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Data Validator & Logs</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <AdminOverview 
            stats={stats} 
            theme={theme} 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        )}

        {activeTab === 'users' && (
          <AdminUsers 
            stats={stats} 
            theme={theme} 
            onClearStats={onClearStats} 
            user={user} 
          />
        )}

        {activeTab === 'datasets' && (
          <AdminDatasets 
            onClearStats={onClearStats} 
            theme={theme} 
            user={user}
          />
        )}

        {activeTab === 'validator' && (
          <AdminValidator 
            theme={theme} 
          />
        )}
      </div>
    </div>
  );
};
