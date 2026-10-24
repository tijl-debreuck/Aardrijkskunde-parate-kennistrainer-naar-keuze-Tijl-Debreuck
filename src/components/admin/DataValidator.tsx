import React, { useState, useMemo } from 'react';
import { runDatabaseAudit, AuditReport, CORRECTED_COORDINATES } from '../../utils/validation';
import { validateDatasetIntegrity } from '../../utils/geoDataParser';
import { 
  Database, Play, CheckCircle2, AlertTriangle, ShieldCheck, FileText, 
  ChevronRight, Download, MapPin, Search, Info, HelpCircle, Layers, Compass
} from 'lucide-react';
import belgiumData from '../../data/belgium.json';
import europeData from '../../data/europe.json';
import worldData from '../../data/world.json';
import { getDutchCategoryLabel } from '../../utils/questionDescriptions';

export const DataValidator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entity-audit' | 'coordinate-scanner'>('entity-audit');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [datasetFilter, setDatasetFilter] = useState<'all' | 'belgium' | 'world' | 'europe'>('all');

  // Entity Audit states
  const [entitySearch, setEntitySearch] = useState('');
  const [entityRegionFilter, setEntityRegionFilter] = useState<'all' | 'belgium' | 'europe' | 'world'>('all');
  const [entityVectorFilter, setEntityVectorFilter] = useState<'all' | 'point' | 'polyline' | 'polygon'>('all');
  const [entityStatusFilter, setEntityStatusFilter] = useState<'all' | 'Geladen' | 'Niet geladen'>('all');

  const entityAuditReport = useMemo(() => {
    return validateDatasetIntegrity();
  }, []);

  const filteredEntityEntries = useMemo(() => {
    return entityAuditReport.auditEntries.filter(entry => {
      const matchesSearch = entry.name.toLowerCase().includes(entitySearch.toLowerCase()) || 
                            entry.id.toLowerCase().includes(entitySearch.toLowerCase());
      const matchesRegion = entityRegionFilter === 'all' || entry.region === entityRegionFilter;
      const matchesVector = entityVectorFilter === 'all' || entry.vectorType === entityVectorFilter;
      const matchesStatus = entityStatusFilter === 'all' || entry.status === entityStatusFilter;
      return matchesSearch && matchesRegion && matchesVector && matchesStatus;
    });
  }, [entityAuditReport, entitySearch, entityRegionFilter, entityVectorFilter, entityStatusFilter]);

  // Export full audit log report as formatted JSON file
  const downloadAuditReportJson = () => {
    const exportData = {
      rapportTitel: "Geografische Entiteiten Data-Integratie & Audit Rapport",
      gegenereerdOp: new Date().toISOString(),
      voortgangsscore: `${entityAuditReport.integrationScore}%`,
      status: entityAuditReport.status,
      samenvatting: {
        totaalEntiteiten: entityAuditReport.totalItems,
        geladenEntiteiten: entityAuditReport.loadedCount,
        nietGeladenEntiteiten: entityAuditReport.unloadedCount,
        voortgangsscorePercentage: entityAuditReport.integrationScore,
        itemsZonderCoordinaten: entityAuditReport.itemsWithoutCoordinates,
        perRegio: entityAuditReport.byRegion,
        perCategorie: entityAuditReport.byCategory
      },
      auditLog: entityAuditReport.auditEntries.map(e => ({
        id: e.id,
        entity: e.name,
        regio: e.region,
        categorie: e.category,
        vectorType: e.vectorType,
        status: e.status,
        validatiebericht: e.validationMessage,
        isReadyForMap: e.isReadyForMap,
        isReadyForQuiz: e.isReadyForQuiz
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    link.download = `audit-rapport-geodata-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const triggerAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runDatabaseAudit();
      setReport(result);
      setIsRunning(false);
      
      // Print directly to developer console as requested
      if (result.isPassed) {
        console.log("DATABASE AUDIT SUCCESS: All datasets are 100% compliant.");
      } else {
        console.error("DATABASE AUDIT FAILED: Discrepancies found in datasets:", result);
      }
    }, 600);
  };

  // Helper function to build and download the fully corrected JSON source data
  const downloadCorrectedJson = (datasetName: 'belgium' | 'world' | 'europe') => {
    let sourceData: any;
    if (datasetName === 'belgium') {
      sourceData = JSON.parse(JSON.stringify(belgiumData));
      if (sourceData.provinces) {
        sourceData.provinces = sourceData.provinces.map((item: any) => {
          if (CORRECTED_COORDINATES[item.id]) {
            return { ...item, coordinates: CORRECTED_COORDINATES[item.id] };
          }
          return item;
        });
      }
      if (sourceData.regions) {
        sourceData.regions = sourceData.regions.map((item: any) => {
          if (CORRECTED_COORDINATES[item.id]) {
            return { ...item, coordinates: CORRECTED_COORDINATES[item.id] };
          }
          return item;
        });
      }
    } else if (datasetName === 'world') {
      sourceData = JSON.parse(JSON.stringify(worldData));
      if (sourceData.steden) {
        sourceData.steden = sourceData.steden.map((item: any) => {
          if (CORRECTED_COORDINATES[item.id]) {
            return { ...item, coordinates: CORRECTED_COORDINATES[item.id] };
          }
          return item;
        });
      }
      if (sourceData.countries) {
        sourceData.countries = sourceData.countries.map((item: any) => {
          if (CORRECTED_COORDINATES[item.id]) {
            return { ...item, coordinates: CORRECTED_COORDINATES[item.id] };
          }
          return item;
        });
      }
    } else if (datasetName === 'europe') {
      sourceData = JSON.parse(JSON.stringify(europeData));
      if (sourceData.countries) {
        sourceData.countries = sourceData.countries.map((item: any) => {
          if (CORRECTED_COORDINATES[item.id]) {
            return { ...item, coordinates: CORRECTED_COORDINATES[item.id] };
          }
          return item;
        });
      }
    }

    if (!sourceData) return;

    const jsonString = JSON.stringify(sourceData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered list of faulty coordinate items for live display/search queries
  const filteredFaultyItems = useMemo(() => {
    if (!report) return [];
    return report.faultyItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = datasetFilter === 'all' || item.dataset === datasetFilter;
      return matchesSearch && matchesFilter;
    });
  }, [report, searchQuery, datasetFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        {/* Header section with brand audit title & trigger button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/50 rounded-2xl border border-cyan-500/30">
              <Database className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-sans tracking-tight text-white">Systeemdiagnose & Datavalidatie</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Controleer alle JSON databronnen, coördinaten en ID-koppelingen live.</p>
            </div>
          </div>

          <button
            onClick={triggerAudit}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isRunning ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
            ) : (
              <Play className="w-5 h-5 fill-white" />
            )}
            <span>Controleer databank</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('entity-audit')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'entity-audit'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Entiteiten Detailaudit ({entityAuditReport.totalItems})</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {entityAuditReport.integrationScore}% Geverifieerd
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coordinate-scanner')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'coordinate-scanner'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Coördinaten Scanner & Reparatie</span>
          </button>
        </div>

        {activeTab === 'entity-audit' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Samenvattings-header met Voortgangsscore & Download Rapport knop */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-2 bg-emerald-500/15 rounded-xl border border-emerald-500/30">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Voortgangsscore Data-Integratie
                      </h3>
                      <p className="text-xs text-slate-400">
                        Status en koppeling van alle geografische entiteiten (provincies, steden, rivieren, gebergten, zeeën) met vector- en kaartdatasets.
                      </p>
                    </div>
                    <span className="ml-auto lg:ml-2 px-3 py-1 rounded-full text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 shadow-sm">
                      {entityAuditReport.integrationScore}% Voltooid
                    </span>
                  </div>

                  {/* Voortgangsbalk */}
                  <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${entityAuditReport.integrationScore}%` }}
                    />
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Geladen: <strong className="font-mono text-emerald-200">{entityAuditReport.loadedCount}</strong> entiteiten
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                      entityAuditReport.unloadedCount > 0 
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}>
                      <AlertTriangle className={`w-3.5 h-3.5 ${entityAuditReport.unloadedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
                      Niet geladen: <strong className="font-mono">{entityAuditReport.unloadedCount}</strong> entiteiten
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      Totaal geauditeerd: <strong className="font-mono text-cyan-200">{entityAuditReport.totalItems}</strong>
                    </span>
                  </div>
                </div>

                {/* Download Rapport knop */}
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={downloadAuditReportJson}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title="Exporteer een JSON-bestand met de volledige audit log en alle entiteiten"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Rapport</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">Totaal Entiteiten</p>
                <p className="text-3xl font-extrabold text-cyan-400 mt-1">{entityAuditReport.totalItems}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Inclusief parate kennis</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">🇧🇪 België</p>
                <p className="text-3xl font-extrabold text-amber-400 mt-1">{entityAuditReport.byRegion.belgium}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Provincies, rivieren, havens</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">🇪🇺 Europa</p>
                <p className="text-3xl font-extrabold text-blue-400 mt-1">{entityAuditReport.byRegion.europe}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">41 Landen, rivieren, zeeën</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">🌍 Wereld</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{entityAuditReport.byRegion.world}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Continenten, oceanen, lijnen</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Zoek geografische entiteit op naam of ID..."
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                  {(['all', 'Geladen', 'Niet geladen'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setEntityStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        entityStatusFilter === st
                          ? st === 'Niet geladen' 
                            ? 'bg-rose-600 text-white shadow-sm' 
                            : 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st === 'all' ? 'Alle statussen' : st}
                    </button>
                  ))}
                </div>

                {/* Region Filter */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                  {(['all', 'belgium', 'europe', 'world'] as const).map(reg => (
                    <button
                      key={reg}
                      onClick={() => setEntityRegionFilter(reg)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        entityRegionFilter === reg
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {reg === 'all' ? 'Alle regio\'s' : reg === 'belgium' ? 'België' : reg === 'europe' ? 'Europa' : 'Wereld'}
                    </button>
                  ))}
                </div>

                {/* Vector Filter */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                  {(['all', 'point', 'polyline', 'polygon'] as const).map(vType => (
                    <button
                      key={vType}
                      onClick={() => setEntityVectorFilter(vType)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        entityVectorFilter === vType
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {vType === 'all' ? 'Alle vectoren' : vType === 'point' ? 'Punt' : vType === 'polyline' ? 'Lijn' : 'Vlak'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Entity Audit Table */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Resultaten: <strong className="text-white font-mono">{filteredEntityEntries.length}</strong> van de {entityAuditReport.totalItems} entiteiten</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Voortgangsscore: {entityAuditReport.integrationScore}% Gekoppeld
                </span>
              </div>
              <div className="max-h-[550px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                      <th className="py-3.5 px-4 font-bold text-slate-300">Entiteit</th>
                      <th className="py-3.5 px-4 font-bold text-slate-300 w-36">Status</th>
                      <th className="py-3.5 px-4 font-bold text-slate-300">Validatiebericht</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredEntityEntries.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500 font-medium">
                          Geen geografische entiteiten gevonden die aan de filters voldoen.
                        </td>
                      </tr>
                    ) : (
                      filteredEntityEntries.map((item, idx) => {
                        const isUnloaded = item.status === 'Niet geladen';
                        return (
                          <tr 
                            key={item.id + idx} 
                            className={`transition-colors ${
                              isUnloaded 
                                ? 'bg-rose-950/70 hover:bg-rose-900/80 border-l-4 border-rose-500 text-rose-100 ring-1 ring-rose-500/30' 
                                : 'hover:bg-slate-900/50 border-l-4 border-transparent'
                            }`}
                          >
                            {/* Kolom 1: Entiteit */}
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-bold text-sm ${isUnloaded ? 'text-rose-200' : 'text-white'}`}>
                                    {item.name}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.region === 'belgium' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' :
                                    item.region === 'europe' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25' :
                                    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                  }`}>
                                    {item.region === 'belgium' ? '🇧🇪 België' : item.region === 'europe' ? '🇪🇺 Europa' : '🌍 Wereld'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                                    ID: {item.id}
                                  </span>
                                  <span>•</span>
                                  <span className="capitalize text-slate-300 font-medium">
                                    {getDutchCategoryLabel(item.category as any)}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-400">
                                    {item.vectorType === 'polygon' ? '⬡ Polygoon' : item.vectorType === 'polyline' ? '〰️ Polyline' : item.vectorType === 'point' ? '📍 Punt' : 'Geen vector'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Kolom 2: Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              {item.status === 'Geladen' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Geladen
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                  Niet geladen
                                </span>
                              )}
                            </td>

                            {/* Kolom 3: Validatiebericht */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs ${isUnloaded ? 'text-rose-200 font-semibold' : 'text-slate-300'}`}>
                                  {item.validationMessage}
                                </span>
                                {item.isReadyForQuiz && item.status === 'Geladen' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                                    Quizklaar
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 animate-fade-in">
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">Status</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {report.isPassed ? (
                    <>
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-extrabold text-lg">Valide</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                      <span className="text-rose-400 font-extrabold text-lg">Conflict</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">Records Gescand</p>
                <p className="text-3xl font-extrabold text-white mt-1">{report.totalRecords}</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">Coördinaten Fouten</p>
                <p className={`text-3xl font-extrabold mt-1 ${report.missingCoordsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {report.missingCoordsCount}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold font-mono mb-1">Duplicaten</p>
                <p className={`text-3xl font-extrabold mt-1 ${report.duplicateCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {report.duplicateCount}
                </p>
              </div>
            </div>

            {/* Downloader Widget container */}
            <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl animate-fade-in relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Download className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Download Databestanden</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {report.missingCoordsCount > 0 
                      ? `Er zijn ${report.missingCoordsCount} items geïdentificeerd met ontbrekende of onjuiste coördinaten. Klik op de knoppen hieronder om directe gecorrigeerde versies van de JSON databestanden lokaal op te slaan.`
                      : 'Alle databestanden zijn 100% gevalideerd. Er zijn 0 foute coördinaten gevonden in de databank.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => downloadCorrectedJson('world')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600/25 to-teal-600/20 hover:from-emerald-600/35 hover:to-teal-600/30 border border-emerald-500/25 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download world.json</span>
                </button>
                <button
                  onClick={() => downloadCorrectedJson('belgium')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600/25 to-yellow-600/20 hover:from-amber-600/35 hover:to-yellow-600/30 border border-amber-500/25 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download belgium.json</span>
                </button>
                <button
                  onClick={() => downloadCorrectedJson('europe')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800/65 border border-slate-700/50 text-slate-300 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download europe.json</span>
                </button>
              </div>
            </div>

            {/* List and Table of Specific Anomalies */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-slate-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Live Overzicht: {report.missingCoordsCount} Anomalieën</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Hieronder staan de specifieke records die ontbrekende of onjuiste coördinaten hebben.</p>
                </div>

                {/* Filter and search bars */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Zoeken op naam of ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-full sm:w-48"
                    />
                  </div>

                  <select
                    value={datasetFilter}
                    onChange={(e) => setDatasetFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Alle Datasets</option>
                    <option value="world">World.json ({report.faultyItems.filter(it => it.dataset === 'world').length})</option>
                    <option value="belgium">Belgium.json ({report.faultyItems.filter(it => it.dataset === 'belgium').length})</option>
                    <option value="europe">Europe.json ({report.faultyItems.filter(it => it.dataset === 'europe').length})</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                {filteredFaultyItems.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-3.5 px-5">ID</th>
                        <th className="py-3.5 px-4">Item Naam</th>
                        <th className="py-3.5 px-4">Dataset</th>
                        <th className="py-3.5 px-4">Categorie</th>
                        <th className="py-3.5 px-4">Huidige Waarde</th>
                        <th className="py-3.5 px-5">Aanbevolen Correctie [Lon, Lat]</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {filteredFaultyItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="py-3 px-5 font-mono text-[11px] text-slate-400 font-semibold">{item.id}</td>
                          <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                            <span className={`px-2 py-1 rounded-md ${
                              item.dataset === 'world' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15' : 
                              item.dataset === 'belgium' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/15' :
                              'bg-cyan-500/10 text-cyan-300 border border-cyan-500/15'
                            }`}>
                              {item.dataset}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                            {getDutchCategoryLabel(item.category)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-rose-400 bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                              {item.currentValue}
                            </span>
                          </td>
                          <td className="py-3 px-5">
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold flex items-center gap-1.5 w-max">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>[{item.correctedValue[0].toFixed(4)}, {item.correctedValue[1].toFixed(4)}]</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center">
                    <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-semibold">Geen records gevonden die voldoen aan de zoekcriteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit CLI log terminal */}
            <div className="bg-slate-950 rounded-2xl border border-slate-850 p-6 shadow-inner animate-fade-in">
              <h3 className="text-emerald-400 font-mono text-sm uppercase tracking-wider mb-3 pb-3 border-b border-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Systeem Logconsole</span>
              </h3>
              <div className="h-64 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-2">
                {report.logs.map((log, i) => {
                  let colorClass = "text-slate-400";
                  if (log.includes("❌")) colorClass = "text-rose-400 font-bold";
                  else if (log.includes("⚠️")) colorClass = "text-amber-400 font-bold";
                  else if (log.includes("✅")) colorClass = "text-emerald-400 font-semibold";
                  else if (log.includes("STARTING") || log.includes("DIAGNOSTICS END")) colorClass = "text-cyan-400 font-extrabold border-y border-cyan-950/65 py-1.5 block my-2";

                  return (
                    <div key={i} className={`flex gap-2 items-start ${colorClass}`}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                      <span>{log}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 bg-slate-950/10 p-12 rounded-3xl text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-slate-400 font-semibold mb-1">Geen audit rapport geladen</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Klik hierboven op "Controleer databank" om een uitgebreide diagnose op te bouwen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataValidator;
