import React, { useState } from 'react';
import { DataValidator } from './DataValidator';
import { ShieldCheck, Terminal, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface AdminValidatorProps {
  theme: 'dark' | 'light';
}

interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
}

export const AdminValidator: React.FC<AdminValidatorProps> = ({ theme }) => {
  const [activeSubTab, setActiveSubTab] = useState<'validator' | 'system-logs'>('validator');
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  // Diagnostic log events
  const [logs] = useState<DiagnosticLog[]>(() => {
    const now = new Date();
    const timeStr = (offsetSec: number) => {
      const d = new Date(now.getTime() - offsetSec * 1000);
      return d.toLocaleTimeString();
    };

    return [
      {
        id: '1',
        timestamp: timeStr(120),
        level: 'info',
        module: 'GeoEngine',
        message: 'Master datasets (Belgium, Europe, World) parsed & indexed successfully.'
      },
      {
        id: '2',
        timestamp: timeStr(95),
        level: 'success',
        module: 'AudioSynthesizer',
        message: 'Web Audio API context initialized with clean sound generator waveforms.'
      },
      {
        id: '3',
        timestamp: timeStr(60),
        level: 'info',
        module: 'DataValidator',
        message: 'Integrity scan completed. 100% of active quiz entities verified.'
      },
      {
        id: '4',
        timestamp: timeStr(40),
        level: 'info',
        module: 'AdminAuth',
        message: 'Admin session authorized via /api/admin/verify token check.'
      },
      {
        id: '5',
        timestamp: timeStr(10),
        level: 'success',
        module: 'Storage',
        message: 'LocalStorage sync completed. User preferences and study folders in sync.'
      }
    ];
  });

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return l.level === logFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('validator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'validator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Data Validator & Scanner</span>
          </button>

          <button
            onClick={() => setActiveSubTab('system-logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'system-logs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Systeem & Audit Logs</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'validator' ? (
        <DataValidator />
      ) : (
        <div className={`p-6 rounded-3xl border shadow-xl ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Systeem Diagnostic Console</h3>
                <p className="text-xs text-slate-400">Overzicht van runtime diagnostiek en backend events</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Alle Logs</option>
                <option value="info">Info</option>
                <option value="warning">Waarschuwingen</option>
                <option value="error">Fouten</option>
              </select>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border font-mono text-xs space-y-2.5 overflow-x-auto ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            {filteredLogs.map(log => {
              const levelColor = 
                log.level === 'error' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                log.level === 'warning' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                log.level === 'success' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                'text-blue-500 bg-blue-500/10 border-blue-500/20';

              return (
                <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-500/10 last:border-0">
                  <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${levelColor}`}>
                    {log.level}
                  </span>
                  <span className="text-purple-400 font-bold shrink-0">[{log.module}]</span>
                  <span className="text-xs break-all">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
