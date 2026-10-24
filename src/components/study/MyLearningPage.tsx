import React, { useState, useMemo, useEffect } from 'react';
import { 
  FolderPlus, Folder, Map as MapIcon, Flag, Edit3, Trash2, Search, Check, 
  X, ChevronDown, ChevronRight, BookOpen, Lock, LogIn, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { StudyFolder } from '../../types/geography';
import { UserPreferences } from '../../hooks/useUserPreferences';
import { Language, translateName } from '../../utils/language';
import { 
  User, getUserStudyFolders, saveUserStudyFolders, DEFAULT_STUDY_FOLDERS,
  SyncState, onSyncStateChange, syncUserDataToBackend
} from '../../lib/dbAdapter';
import { triggerOpenLoginModal } from '../layout/LoginMenu';

// Datasets
import * as belgiumData from '../../data/belgium.json';
import * as europeData from '../../data/europe.json';
import * as worldData from '../../data/world.json';
import {
  belgiumRivers,
  europeRivers,
  worldRivers,
  europeMountains,
  worldMountains,
  worldSeas,
  europeSeas,
  worldPeaks
} from '../../data/geoData';

export interface MyLearningPageProps {
  user: User | null;
  theme: 'dark' | 'light';
  language: Language;
  onStartMapQuizWithItems: (folderName: string, itemIds: string[]) => void;
  onStartFlagQuizWithItems: (folderName: string, itemIds: string[]) => void;
  onGoToDashboard?: () => void;
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
}

export interface ItemEntry {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  region: 'belgium' | 'europe' | 'world';
  regionLabel: string;
  extraInfo?: string;
  hasFlag?: boolean;
}

export const MyLearningPage: React.FC<MyLearningPageProps> = ({
  user,
  theme,
  language,
  onStartMapQuizWithItems,
  onStartFlagQuizWithItems,
  onGoToDashboard,
  preferences,
  updatePreferences
}) => {
  const isDark = theme === 'dark';

  // Folders state - strictly bound to the active logged-in user
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    if (!user) {
      setFolders([]);
      setIsLoadingFolders(false);
      return;
    }

    setIsLoadingFolders(true);
    getUserStudyFolders(user.uid).then((userFolders) => {
      if (!isCancelled) {
        setFolders(userFolders);
        setIsLoadingFolders(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [user?.uid]);

  // Synchronisatiestatus met de backend service
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', lastSynced: null });

  useEffect(() => {
    const unsubscribe = onSyncStateChange((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  // Bij inloggen initiële sync uitvoeren
  useEffect(() => {
    if (user?.uid) {
      syncUserDataToBackend(user.uid).catch(() => {});
    }
  }, [user?.uid]);

  // Save folders to user-isolated storage and sync preferences
  const saveFolders = (newFolders: StudyFolder[]) => {
    setFolders(newFolders);
    if (user) {
      saveUserStudyFolders(user.uid, newFolders);
      if (updatePreferences) {
        updatePreferences({ studyFolders: newFolders } as any);
      }
    }
    // Bewaar ook altijd een backup zodat data nooit per ongeluk verdwijnt
    localStorage.setItem('geo_study_folders', JSON.stringify(newFolders));
  };

  // Active modal/editor state: null = viewing overview, 'create' | folderId = editing
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Compile all available geographical items with Gewesten clearly separate from provinces
  const allAvailableItems = useMemo<ItemEntry[]>(() => {
    const list: ItemEntry[] = [];
    const seenIds = new Set<string>();

    const addItem = (
      id: string,
      rawName: string,
      category: string,
      categoryLabel: string,
      region: 'belgium' | 'europe' | 'world',
      regionLabel: string,
      extraInfo?: string,
      hasFlag: boolean = false
    ) => {
      if (!id || seenIds.has(id)) return;
      seenIds.add(id);
      list.push({
        id,
        name: translateName(rawName, language),
        category,
        categoryLabel,
        region,
        regionLabel,
        extraInfo,
        hasFlag
      });
    };

    // 1. Belgische Gewesten (Strictly separated!)
    const bReg = (belgiumData as any).regions || [];
    bReg.forEach((r: any) => {
      addItem(r.id, r.name, 'region', 'Belgische Gewesten', 'belgium', 'België', 'Gewest van België', false);
    });

    // 2. Belgische Provincies (10 Provincies)
    const bProv = (belgiumData as any).provinces || [];
    bProv.forEach((p: any) => {
      addItem(p.id, p.name, 'province', 'Belgische Provincies', 'belgium', 'België', p.capital ? `Hoofdstad: ${p.capital}` : undefined, false);
    });

    // 3. Belgische Rivieren & Kanalen
    belgiumRivers.forEach(r => {
      addItem(r.id, r.name, r.category || 'river', 'Belgische Waterlopen', 'belgium', 'België', r.extraInfo, false);
    });

    // 4. Belgische Snelwegen
    const bHigh = (belgiumData as any).highways || [];
    bHigh.forEach((h: any) => {
      addItem(h.id, h.name, 'highway', 'Belgische Autosnelwegen', 'belgium', 'België', 'Snelweg', false);
    });

    // 5. Europese Landen (met vlaggen)
    const eCountries = (europeData as any).countries || [];
    eCountries.forEach((c: any) => {
      addItem(c.id, c.name, 'country', 'Europese Landen', 'europe', 'Europa', c.capital ? `Hoofdstad: ${c.capital}` : undefined, true);
    });

    // 6. Europese Wateren & Gebergten
    europeRivers.forEach(r => {
      addItem(r.id, r.name, 'river', 'Europese Rivieren', 'europe', 'Europa', r.extraInfo, false);
    });
    europeMountains.forEach(m => {
      addItem(m.id, m.name, 'mountain', 'Europese Gebergten', 'europe', 'Europa', m.extraInfo, false);
    });
    europeSeas.forEach(s => {
      addItem(s.id, s.name, 'sea', 'Europese Zeeën & Oceanen', 'europe', 'Europa', s.extraInfo, false);
    });

    // 7. Wereldlanden (met vlaggen)
    const wCountries = (worldData as any).countries || [];
    wCountries.forEach((c: any) => {
      addItem(c.id, c.name, 'country', 'Wereldlanden', 'world', 'Wereld', c.capital ? `Hoofdstad: ${c.capital}` : undefined, true);
    });

    // 8. Werelddelen & Oceanen
    const wContinents = (worldData as any).continents || (worldData as any).werelddelen || [];
    wContinents.forEach((co: any) => {
      addItem(co.id, co.name, 'continent', 'Continenten & Werelddelen', 'world', 'Wereld', 'Werelddeel', false);
    });
    worldRivers.forEach(r => {
      addItem(r.id, r.name, 'river', 'Wereldrivieren', 'world', 'Wereld', r.extraInfo, false);
    });
    worldMountains.forEach(m => {
      addItem(m.id, m.name, 'mountain', 'Wereldgebergten', 'world', 'Wereld', m.extraInfo, false);
    });
    worldPeaks.forEach(p => {
      addItem(p.id, p.name, 'peak', 'Hoogste Bergtoppen', 'world', 'Wereld', p.extraInfo, false);
    });
    worldSeas.forEach(s => {
      addItem(s.id, s.name, s.category || 'sea', 'Wereldzeeën & Oceanen', 'world', 'Wereld', s.extraInfo, false);
    });

    return list;
  }, [language]);

  // Lookup map for easy item retrieval by ID
  const itemMap = useMemo(() => {
    const map = new Map<string, ItemEntry>();
    allAvailableItems.forEach(it => map.set(it.id, it));
    return map;
  }, [allAvailableItems]);

  // Filtered items based on live search query (case-insensitive, e.g. "Bel") and category
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return allAvailableItems.filter(item => {
      // Category filter
      if (activeCategoryFilter !== 'all' && item.categoryLabel !== activeCategoryFilter) {
        return false;
      }
      // Live search term matching: matches name, category, or extraInfo
      if (query) {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(query);
        const matchesExtra = (item.extraInfo || '').toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesExtra;
      }
      return true;
    });
  }, [allAvailableItems, searchTerm, activeCategoryFilter]);

  // Group filtered items by category label
  const groupedItems = useMemo<Record<string, ItemEntry[]>>(() => {
    const groups: Record<string, ItemEntry[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.categoryLabel]) {
        groups[item.categoryLabel] = [];
      }
      groups[item.categoryLabel].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Available category tabs
  const categoryLabels = useMemo(() => {
    const cats = new Set<string>();
    allAvailableItems.forEach(item => cats.add(item.categoryLabel));
    return Array.from(cats);
  }, [allAvailableItems]);

  // Open editor for a new folder
  const handleOpenCreateFolder = () => {
    setEditingFolderId('new');
    setFolderNameInput('Mijn Nieuwe Map');
    setSelectedItemIds([]);
    setSearchTerm('');
    setActiveCategoryFilter('all');
  };

  // Open editor for an existing folder
  const handleOpenEditFolder = (folder: StudyFolder) => {
    setEditingFolderId(folder.id);
    setFolderNameInput(folder.name);
    setSelectedItemIds([...folder.itemIds]);
    setSearchTerm('');
    setActiveCategoryFilter('all');
  };

  // Save folder (new or update)
  const handleSaveCurrentFolder = () => {
    const name = folderNameInput.trim() || 'Naamloze Map';
    if (editingFolderId === 'new') {
      const newFolder: StudyFolder = {
        id: `folder-${Date.now()}`,
        name,
        itemIds: selectedItemIds,
        createdAt: Date.now()
      };
      saveFolders([...folders, newFolder]);
    } else if (editingFolderId) {
      const updated = folders.map(f => 
        f.id === editingFolderId ? { ...f, name, itemIds: selectedItemIds } : f
      );
      saveFolders(updated);
    }
    setEditingFolderId(null);
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    if (confirm("Weet je zeker dat je deze map wilt verwijderen?")) {
      const updated = folders.filter(f => f.id !== folderId);
      saveFolders(updated);
    }
  };

  // Toggle selection of an individual item
  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all items in a group
  const selectAllInGroup = (items: ItemEntry[]) => {
    const idsToAdd = items.map(it => it.id);
    setSelectedItemIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  // Deselect all items in a group
  const deselectAllInGroup = (items: ItemEntry[]) => {
    const idsToRemove = new Set(items.map(it => it.id));
    setSelectedItemIds(prev => prev.filter(id => !idsToRemove.has(id)));
  };

  // Global select all visible
  const selectAllVisible = () => {
    const visibleIds = filteredItems.map(it => it.id);
    setSelectedItemIds(prev => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Global deselect all
  const deselectAll = () => {
    setSelectedItemIds([]);
  };

  // Start map quiz for a folder
  const handleLaunchMapQuiz = (folder: StudyFolder) => {
    if (folder.itemIds.length === 0) {
      alert("Deze map bevat nog geen geografische onderdelen. Klik eerst op 'Bewerken' om onderdelen toe te voegen.");
      return;
    }
    onStartMapQuizWithItems(folder.name, folder.itemIds);
  };

  // Start flag quiz for a folder
  const handleLaunchFlagQuiz = (folder: StudyFolder) => {
    // Check if folder contains items with flags (countries)
    const itemsWithFlags = folder.itemIds.filter(id => {
      const it = itemMap.get(id);
      return it && (it.hasFlag || it.category === 'country');
    });

    if (itemsWithFlags.length === 0) {
      alert("Deze map bevat geen landen met vlaggen. Voeg eerst Europese of Wereldlanden toe aan deze map om vlaggen te kunnen oefenen.");
      return;
    }
    onStartFlagQuizWithItems(folder.name, itemsWithFlags);
  };

  // Slotscherm wanneer de bezoeker niet is ingelogd
  if (!user) {
    return (
      <div className={`space-y-8 animate-fade-in max-w-4xl mx-auto pb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <div className={`p-8 sm:p-12 border rounded-3xl shadow-2xl text-center relative overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/15 border border-blue-500/30 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Persoonlijke Leermapjes zijn gekoppeld aan je account
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Log in of maak een gratis account aan om je eigen leermateriaal samen te stellen en te bewaren. Als gast kun je direct alle topografie- en vlaggenquizzen op het Dashboard blijven maken!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-2 font-bold text-xs">
                  01. Zelf Kiezen
                </div>
                <h4 className="font-bold text-xs sm:text-sm mb-1">Eigen Leerstof</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Combineer gewesten, provincies, rivieren en landen in je eigen mappen.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 w-fit rounded-xl bg-purple-500/10 text-purple-500 mb-2 font-bold text-xs">
                  02. Veilig Bewaard
                </div>
                <h4 className="font-bold text-xs sm:text-sm mb-1">Gekoppeld Account</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bij uitloggen zijn je mappen afgeschermd; bij opnieuw inloggen direct weer paraat.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-500 mb-2 font-bold text-xs">
                  03. Altijd Toegang
                </div>
                <h4 className="font-bold text-xs sm:text-sm mb-1">Dashboard Vrij</h4>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Alle standaardoefeningen op het Dashboard blijven vrij voor elke gast.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => triggerOpenLoginModal()}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Inloggen of Account Aanmaken</span>
              </button>

              {onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Naar Dashboard Oefeningen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Laadindicator voor mappen
  if (isLoadingFolders) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-mono">Je leermapjes worden geladen...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 border rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 bg-blue-600/15 text-blue-500 border border-blue-500/30 rounded-2xl shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Mijn Leerstof & Mappen
              </h1>

              {/* Statusindicator voor backend synchronisatie */}
              {syncState.status === 'syncing' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-semibold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synchroniseren met backend...</span>
                </div>
              )}

              {syncState.status === 'synced' && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                  title={syncState.lastSynced ? `Laatst gesynchroniseerd om ${new Date(syncState.lastSynced).toLocaleTimeString()}` : 'Gesynchroniseerd'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gesynchroniseerd met backend</span>
                  {syncState.lastSynced && (
                    <span className="text-[10px] opacity-75 font-mono">
                      ({new Date(syncState.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </div>
              )}

              {syncState.status === 'error' && (
                <button
                  onClick={() => user && syncUserDataToBackend(user.uid)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 cursor-pointer transition-colors"
                  title={syncState.error || 'Klik om opnieuw te synchroniseren'}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Lokaal bewaard (klik om te syncen)</span>
                </button>
              )}
            </div>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Stel je eigen studiemappen samen met gekozen gewesten, provincies, rivieren of landen en oefen gericht via de kaart of vlaggen.
            </p>
          </div>
        </div>

        {/* Action Controls: Sync & Create Folder */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => user && syncUserDataToBackend(user.uid)}
            disabled={syncState.status === 'syncing'}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Handmatig synchroniseren met backend"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.status === 'syncing' ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {!editingFolderId && (
            <button
              onClick={handleOpenCreateFolder}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <FolderPlus className="w-5 h-5" />
              <span>Nieuwe Map Aanmaken</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View: Either Folder Editor or Folder Directory */}
      {editingFolderId ? (
        /* Folder Item Selector / Editor */
        <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1.5">
                Naam van de map
              </label>
              <input
                type="text"
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                placeholder="Bijv. Belgische Gewesten of Examen Week 3..."
                className={`w-full px-4 py-2.5 rounded-xl border text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setEditingFolderId(null)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveCurrentFolder}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Map Opslaan ({selectedItemIds.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Selection Controls Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Live Search Input (e.g. typing "Bel") */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek geografisch element..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Global Select/Deselect Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={selectAllVisible}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Alles Selecteren
              </button>
              <button
                onClick={deselectAll}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-rose-400 hover:text-rose-300' : 'bg-slate-100 border-slate-200 text-rose-600 hover:bg-slate-200'
                }`}
              >
                Alles Deselecteren
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle Categorieën ({allAvailableItems.length})
            </button>
            {categoryLabels.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDark ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Selector List by Category */}
          <div className="space-y-6 pt-2">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Geen geografische elementen gevonden voor zoekopdracht "{searchTerm}".
              </div>
            ) : (
              (Object.entries(groupedItems) as [string, ItemEntry[]][]).map(([categoryName, items]) => {
                const isCollapsed = collapsedCategories[categoryName];
                const groupSelectedCount = items.filter(it => selectedItemIds.includes(it.id)).length;

                return (
                  <div 
                    key={categoryName}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    {/* Category Header */}
                    <div className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                      isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
                    }`}>
                      <div 
                        onClick={() => setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }))}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                          {categoryName}
                        </h3>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ({groupSelectedCount} / {items.length} gekozen)
                        </span>
                      </div>

                      {/* Group selection quick buttons */}
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => selectAllInGroup(items)}
                          className="text-blue-500 hover:text-blue-400 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors cursor-pointer"
                        >
                          Selecteer groep
                        </button>
                        <span className="text-slate-400">•</span>
                        <button
                          onClick={() => deselectAllInGroup(items)}
                          className="text-slate-400 hover:text-slate-300 font-medium px-2 py-1 rounded hover:bg-slate-500/10 transition-colors cursor-pointer"
                        >
                          Deselecteer groep
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    {!isCollapsed && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {items.map(item => {
                          const isSelected = selectedItemIds.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItemSelection(item.id)}
                              /* 
                                Style requirement:
                                "bij geselecteerde elementen moet de tekst nog steeds hetzelfde kleur blijven 
                                maar het volledige kotje mag wel een licht doorzichtbaar blauwe kleur krijgen 
                                dat past bij het thema, hiet kotje moet gewoon ingekleurd zijn zonder vinkje."
                              */
                              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-400/50 shadow-sm'
                                  : isDark
                                  ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-xs sm:text-sm truncate">
                                  {item.name}
                                </div>
                                <div className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {item.extraInfo || item.regionLabel}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Folder Directory / Overview */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {folders.map(folder => {
              const count = folder.itemIds.length;
              // Count how many have flags
              const flagEligibleCount = folder.itemIds.filter(id => {
                const it = itemMap.get(id);
                return it && (it.hasFlag || it.category === 'country');
              }).length;

              return (
                <div
                  key={folder.id}
                  className={`border rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all hover:shadow-2xl ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl">
                          <Folder className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            {folder.name}
                          </h2>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {count} geografische {count === 1 ? 'entiteit' : 'entiteiten'}
                          </span>
                        </div>
                      </div>

                      {/* Edit & Delete actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditFolder(folder)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Map bewerken"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Map verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview of items inside this folder */}
                    <div className="flex flex-wrap gap-1.5 pt-2 max-h-24 overflow-hidden">
                      {folder.itemIds.slice(0, 8).map(id => {
                        const item = itemMap.get(id);
                        return (
                          <span
                            key={id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {item ? item.name : id}
                          </span>
                        );
                      })}
                      {folder.itemIds.length > 8 && (
                        <span className="px-2 py-1 text-[11px] font-mono text-slate-400">
                          +{folder.itemIds.length - 8} meer...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two Separate Direct Exercise Buttons: Kaart & Vlaggen */}
                  <div className="grid grid-cols-2 gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleLaunchMapQuiz(folder)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <MapIcon className="w-4 h-4" />
                      <span>Kaart Oefenen</span>
                    </button>

                    <button
                      onClick={() => handleLaunchFlagQuiz(folder)}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        flagEligibleCount > 0
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-400'
                          : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={flagEligibleCount > 0 ? "Oefen de vlaggen van deze map" : "Voeg landen toe om vlaggen te oefenen"}
                    >
                      <Flag className="w-4 h-4" />
                      <span>Vlaggen Oefenen {flagEligibleCount > 0 ? `(${flagEligibleCount})` : ''}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
