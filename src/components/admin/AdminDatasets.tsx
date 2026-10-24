import React, { useState, useEffect, useRef } from 'react';
import { Region, QuestionType } from '../../types/geography';
import { 
  Database, Trash2, CheckCircle2, Download, Upload, 
  FileText
} from 'lucide-react';
import belgiumData from '../../data/belgium.json';
import europeData from '../../data/europe.json';
import worldData from '../../data/world.json';

interface CustomItem {
  id: string;
  name: string;
  capital?: string;
  region: Region;
  category: QuestionType;
}

interface AdminDatasetsProps {
  onClearStats: () => void;
  theme: 'dark' | 'light';
}

export const AdminDatasets: React.FC<AdminDatasetsProps> = ({ theme }) => {
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom data from localstorage
  const loadCustomItems = () => {
    const saved = localStorage.getItem('geo_trainer_custom_items');
    if (saved) {
      try {
        setCustomItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setCustomItems([]);
      }
    } else {
      setCustomItems([]);
    }
  };

  useEffect(() => {
    loadCustomItems();
  }, []);

  const saveCustomItems = (list: CustomItem[]) => {
    setCustomItems(list);
    localStorage.setItem('geo_trainer_custom_items', JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = customItems.filter(item => item.id !== id);
    saveCustomItems(updated);
    showToast("Item verwijderd.");
  };

  // Full backup JSON export
  const exportFullBackupJSON = () => {
    const folders = localStorage.getItem('geo_study_folders');
    const parsedFolders = folders ? JSON.parse(folders) : [];

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const backupPayload = {
      app: "GeoTrainer",
      backupType: "full-dataset-backup",
      createdAt: now.toISOString(),
      timestamp,
      itemCount: customItems.length,
      folderCount: parsedFolders.length,
      customItems,
      studyFolders: parsedFolders
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geotrainer-dataset-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Volledige dataset backup gedownload!");
  };

  // Import / Restore JSON backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let itemsToImport: CustomItem[] = [];
        let foldersToImport: any[] = [];

        if (Array.isArray(parsed)) {
          // Legacy or bare list
          itemsToImport = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.customItems)) {
            itemsToImport = parsed.customItems;
          }
          if (Array.isArray(parsed.studyFolders)) {
            foldersToImport = parsed.studyFolders;
          }
        }

        if (itemsToImport.length === 0 && foldersToImport.length === 0) {
          alert("Het geüploade bestand bevat geen geldige GeoTrainer dataset-items.");
          return;
        }

        // Merge custom items
        const existingMap = new Map<string, CustomItem>();
        customItems.forEach(item => existingMap.set(item.id, item));
        itemsToImport.forEach(item => {
          if (item && item.name) {
            const id = item.id || `custom-${item.region || 'belgium'}-${item.category || 'province'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            existingMap.set(id, { ...item, id });
          }
        });

        const mergedItems = Array.from(existingMap.values());
        saveCustomItems(mergedItems);

        // Merge folders if available
        if (foldersToImport.length > 0) {
          const storedFolders = localStorage.getItem('geo_study_folders');
          const currentFolders = storedFolders ? JSON.parse(storedFolders) : [];
          const folderMap = new Map();
          currentFolders.forEach((f: any) => folderMap.set(f.id, f));
          foldersToImport.forEach((f: any) => {
            if (f && f.name) folderMap.set(f.id, f);
          });
          localStorage.setItem('geo_study_folders', JSON.stringify(Array.from(folderMap.values())));
        }

        showToast(`Backup succesvol hersteld: ${itemsToImport.length} items geïmporteerd!`);
      } catch (err) {
        console.error("Fout bij inlezen backup", err);
        alert("Ongeldig JSON-bestand: kon backup niet inlezen.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportCSV = () => {
    if (customItems.length === 0) {
      alert("Er zijn geen aangepaste items om te exporteren.");
      return;
    }
    const headers = ['id', 'name', 'capital', 'region', 'category'];
    const csvRows = [
      headers.join(','),
      ...customItems.map(item => {
        return headers.map(fieldName => {
          let value = (item[fieldName as keyof CustomItem] || '').toString();
          // Mitigate CSV Formula Injection in Excel and Google Sheets
          if (/^[=+\-@\t\r]/.test(value)) {
            value = `'${value}`;
          }
          const escaped = value.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      })
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geotrainer_custom_items_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("CSV bestand succesvol gedownload!");
  };

  // Filter custom items
  const filteredCustomItems = customItems.filter(item => {
    const matchesRegion = filterRegion === 'all' || item.region === filterRegion;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (item.capital && item.capital.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notifier */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Dataset Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className="text-[11px] font-mono uppercase font-bold text-slate-400">België Dataset</p>
          <p className="text-2xl font-extrabold text-blue-500 mt-1">
            {(belgiumData as any).features?.length || (belgiumData as any).provinces?.length || 45}
          </p>
          <p className="text-[10px] text-slate-400">Provincies, steden & water</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className="text-[11px] font-mono uppercase font-bold text-slate-400">Europa Dataset</p>
          <p className="text-2xl font-extrabold text-purple-500 mt-1">
            {(europeData as any).features?.length || 50}
          </p>
          <p className="text-[10px] text-slate-400">Landen & hoofdsteden</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className="text-[11px] font-mono uppercase font-bold text-slate-400">Wereld Dataset</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">
            {(worldData as any).features?.length || 195}
          </p>
          <p className="text-[10px] text-slate-400">Wereldwijde geodata</p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className="text-[11px] font-mono uppercase font-bold text-slate-400">Aangepast (Custom)</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{customItems.length}</p>
          <p className="text-[10px] text-slate-400">Door beheerder toegevoegd</p>
        </div>
      </div>

      {/* Dataset Backup & Restore Tool */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Dataset Backup & Herstel Tools</h3>
              <p className="text-xs text-slate-400">Download of herstel een volledige JSON backup van aangepaste items en leermapjes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportFullBackupJSON}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Herstel Backup</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Bij het herstellen van een backup worden de items en leermapjes automatisch samengevoegd met de actieve lokale databank zonder dubbele duplicaten.
        </p>
      </div>



      {/* Aangepaste Databank Items Lijst */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Aangepaste Items ({filteredCustomItems.length})</h3>
            <p className="text-xs text-slate-400">Beheer handmatig toegevoegde entiteiten</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Zoek in items..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />

            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">Alle Regio's</option>
              <option value="belgium">België</option>
              <option value="europe">Europa</option>
              <option value="world">Wereld</option>
            </select>

            <button
              onClick={exportCSV}
              disabled={customItems.length === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {filteredCustomItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs italic">
            Geen aangepaste items gevonden. Voeg er een toe via het bovenstaande formulier.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Naam</th>
                  <th className="py-2.5 px-3">Hoofdstad / Info</th>
                  <th className="py-2.5 px-3">Regio</th>
                  <th className="py-2.5 px-3">Categorie</th>
                  <th className="py-2.5 px-3 text-right">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCustomItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.capital || '—'}</td>
                    <td className="py-2.5 px-3 uppercase font-mono text-[11px] text-blue-500">{item.region}</td>
                    <td className="py-2.5 px-3 capitalize">{item.category}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Verwijder item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
