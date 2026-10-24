import { useState, useCallback, useEffect, useRef } from 'react';
import { Region, QuizMode, QuestionType, GeoItem, Question } from '../types/geography';
import belgiumData from '../data/belgium.json';
import europeData from '../data/europe.json';
import worldData from '../data/world.json';
import { validateAnswer, normalize } from '../utils/normalization';
import { getClueForGeoItem } from '../utils/questionDescriptions';
import { Language, translateName } from '../utils/language';
import { UserPreferences } from './useUserPreferences';
import { allGeoFeatures, GeoFeature } from '../data/geoData';

const geoFeaturesMap = new Map<string, GeoFeature>();
allGeoFeatures.forEach(f => {
  geoFeaturesMap.set(f.id, f);
});
export const calculateNextReview = (consecutiveCorrect: number): number => {
  const intervals = [0, 1, 3, 7, 14, 30]; // 0 correct -> 0d, 1 -> 1d, 2 -> 3d, 3 -> 7d...
  return intervals[Math.min(consecutiveCorrect, intervals.length - 1)];
};

export interface QuizProgress {
  consecutiveCorrect: number;
  attempts: number;
  correct: number;
  nextReviewDate: number;
  wrongCount: number;
}

export interface UserStats {
  accuracy: number; // overall percentage
  totalCorrect: number;
  totalAnswered: number;
  avgTime: number; // in seconds
  weaknesses: { itemId: string; name: string; region: Region; errorCount: number }[];
  achievements: string[]; // achievement keys
  lastActive: string; // ISO date string
}

export const useQuizEngine = (
  region: Region,
  category: QuestionType,
  mode: QuizMode,
  optionsConfig?: { subType?: 'capital' | 'name' | 'flag', preferences?: UserPreferences },
  language: Language = 'nl'
) => {
  const [remainingPool, setRemainingPool] = useState<GeoItem[]>([]);
  const [totalPoolSize, setTotalPoolSize] = useState<number>(0);
  const remainingPoolRef = useRef<GeoItem[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const sessionScoreRef = useRef<number>(0);
  const sessionTotalRef = useRef<number>(0);

  useEffect(() => {
    sessionTotalRef.current = sessionTotal;
  }, [sessionTotal]);

  useEffect(() => {
    sessionScoreRef.current = sessionScore;
  }, [sessionScore]);
  const [sessionErrors, setSessionErrors] = useState<Question[]>([]);
  const [stats, setStats] = useState<UserStats>({
    accuracy: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    avgTime: 0,
    weaknesses: [],
    achievements: [],
    lastActive: new Date().toISOString().split('T')[0]
  });

  // Load stats from localstorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('geo_trainer_stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        const today = new Date().toISOString().split('T')[0];
        setStats({
          ...parsed,
          lastActive: today
        });
      } catch (e) {
        console.error('Error loading stats', e);
      }
    } else {
      // First time save
      const today = new Date().toISOString().split('T')[0];
      const initial = {
        accuracy: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        avgTime: 0,
        weaknesses: [],
        achievements: [],
        lastActive: today
      };
      localStorage.setItem('geo_trainer_stats', JSON.stringify(initial));
      setStats(initial);
    }
  }, []);

  // Helper to get items based on region & category
  const getItemsForQuiz = useCallback((r?: Region, c?: QuestionType, m?: QuizMode): GeoItem[] => {
    const prefs = optionsConfig?.preferences;
    let items: GeoItem[] = [];

    const extractItems = (source: any, targetCategory: string, targetRegion: string, targetMode: string) => {
      let extracted: GeoItem[] = [];
      if (!source) return [];
      
      if (targetMode === 'flag' || targetCategory === 'flag') {
        if (targetRegion === 'belgium') {
          extracted = [];
        } else {
          extracted = source.countries || source.landen || [];
        }
      } else {
        switch (targetCategory) {
          case 'region': extracted = source.regions || []; break;
          case 'province': extracted = source.provinces || []; break;
          case 'river': extracted = [...(source.rivers || []), ...(source.waterways || [])]; break;
          case 'canal': extracted = source.canals || []; break;
          case 'mountain': extracted = [...(source.mountains || []), ...(source.gebergten || []), ...(source.gebergten_plateaus || []), ...(source.islands_peninsulas || [])]; break;
          case 'sea': extracted = [...(source.seas || []), ...(source.zeeen_engtes || []), ...(source.zeeen || []), ...(source.oceans || [])]; break;
          case 'highway': extracted = source.highways || []; break;
          case 'port': extracted = source.ports || []; break;
          case 'country':
            extracted = (source.countries || source.landen || [])
              .filter((it: any) => (it.category ? it.category === 'country' : true) && it.type !== 'city' && it.category !== 'city');
            break;
          case 'capital':
            if (targetRegion === 'belgium') {
              extracted = source.provinces || [];
            } else {
              extracted = source.countries || source.landen || [];
            }
            extracted = extracted.filter((it: any) => Boolean(it.hoofdstad || it.capital));
            break;
          case 'city':
            extracted = (source.steden || source.cities || [])
              .filter((it: any) => (it.category ? it.category === 'city' : true) || it.type === 'city');
            break;
          case 'continent': extracted = source.continents || []; break;
          case 'ocean': extracted = source.oceans || []; break;
          case 'line': extracted = source.referenceLines || []; break;
          default: extracted = source[targetCategory] || [];
        }
      }
      return extracted;
    };

    if (prefs) {
      prefs.selectedRegions.forEach(reg => {
        const source = reg === 'belgium' ? belgiumData : reg === 'europe' ? europeData : worldData;
        prefs.selectedCategories.forEach(cat => {
          items = items.concat(extractItems(source, cat, reg, m || mode));
        });
      });
      // Deduplicate items by id
      const uniqueItems = new Map();
      items.forEach(it => uniqueItems.set(it.id, it));
      items = Array.from(uniqueItems.values());
    } else {
      const targetRegion = r || region;
      const targetCategory = c || category;
      const targetMode = m || mode;
      const source = targetRegion === 'belgium' ? belgiumData : targetRegion === 'europe' ? europeData : worldData;
      items = extractItems(source, targetCategory as string, targetRegion, targetMode);
    }

    // Normalize properties (id, name, capital etc) with language translations
    const baseItems = items.map((it: any) => {
      const rawName = it.naam || it.name;
      const rawCapital = it.hoofdstad || it.capital || null;
      const feature = geoFeaturesMap.get(it.id);
      return {
        id: it.id || `item-${(rawName || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        rawName,
        rawCapital,
        name: translateName(rawName, language),
        capital: rawCapital ? translateName(rawCapital, language) : null,
        type: it.type || it.category || (c || category),
        category: it.category || (c || category),
        coordinates: it.coordinates || feature?.coordinates || null,
        coordinatesList: it.coordinatesList || feature?.coordinatesList || null,
        polygon: it.polygon || feature?.polygon || null,
        polygons: it.polygons || null,
        difficulty: it.difficulty || feature?.difficulty || 'gemiddeld',
        extraInfo: it.extraInfo || feature?.extraInfo || undefined,
        alternatives: Array.from(new Set([
          rawName, // include original name in alternatives
          translateName(rawName, 'nl'),
          translateName(rawName, 'en'),
          ...(rawCapital ? [rawCapital, translateName(rawCapital, 'nl'), translateName(rawCapital, 'en')] : []),
          ...(it.alternatives || []),
          ...(feature?.alternatives || []),
          it.alternatief || ''
        ])).filter(Boolean)
      };
    });

    // Merge custom added items from admin panel if they match current filters
    let allMerged = baseItems;
    const customSaved = localStorage.getItem('geo_trainer_custom_items');
    if (customSaved) {
      try {
        const parsedCustom = JSON.parse(customSaved);
        const matchingCustom = parsedCustom
          .filter((it: any) => {
             if (prefs) {
                return prefs.selectedRegions.includes(it.region) && (prefs.selectedCategories.includes(it.category) || (m||mode) === 'flag');
             }
             return it.region === (r||region) && (it.category === (c||category) || (m||mode) === 'flag');
          })
          .map((it: any) => ({
            id: it.id,
            name: translateName(it.name, language),
            capital: it.capital ? translateName(it.capital, language) : null,
            type: it.category,
            category: it.category,
            coordinates: null,
            coordinatesList: null,
            polygon: null,
            polygons: null,
            difficulty: 'gemiddeld',
            alternatives: [it.name]
          }));
        allMerged = [...matchingCustom, ...baseItems];
      } catch (e) {
        console.error(e);
      }
    }

    // Filter by granular item IDs if selected by user in MyLearningContent
    if (prefs?.selectedItemIds && prefs.selectedItemIds.length > 0) {
      const selectedSet = new Set(prefs.selectedItemIds);
      const filtered = allMerged.filter(it => selectedSet.has(it.id));
      if (filtered.length > 0) {
        return filtered;
      }
    }

    return allMerged;
  }, [region, category, mode, language, optionsConfig?.preferences]);

  const subType = optionsConfig?.subType;
  const prevLangRef = useRef(language);

  useEffect(() => {
    const items = getItemsForQuiz(region, category, mode);
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    setRemainingPool(shuffled);
    remainingPoolRef.current = shuffled;
    setTotalPoolSize(items.length);
    setSessionScore(0);
    setSessionTotal(0);
    sessionScoreRef.current = 0;
    sessionTotalRef.current = 0;
    setSessionErrors([]);
    setHistory([]);
    setCurrentQuestion(null);
  }, [region, category, mode, subType, getItemsForQuiz]);

  // Dynamically re-translate active question & remaining pool ONLY when language changes
  useEffect(() => {
    if (prevLangRef.current === language) return;
    prevLangRef.current = language;

    setRemainingPool(prevPool => {
      const updated = prevPool.map(item => {
        const rawName = (item as any).rawName || item.name;
        const rawCapital = (item as any).rawCapital || item.capital;
        return {
          ...item,
          name: translateName(rawName, language),
          capital: rawCapital ? translateName(rawCapital, language) : null,
        };
      });
      remainingPoolRef.current = updated;
      return updated;
    });

    setCurrentQuestion(prevQ => {
      if (!prevQ || !prevQ.geoItem) return prevQ;
      const targetItem = prevQ.geoItem;
      const rawName = (targetItem as any).rawName || targetItem.name;
      const rawCapital = (targetItem as any).rawCapital || targetItem.capital;
      const newName = translateName(rawName, language);
      const newCapital = rawCapital ? translateName(rawCapital, language) : null;
      const newGeoItem = { ...targetItem, name: newName, capital: newCapital };

      const questionSubType = subType || 'name';
      let text = prevQ.text;
      let correctAnswer = prevQ.correctAnswer;

      if (category === 'country' && questionSubType === 'capital') {
        text = language === 'en'
          ? `What is the capital of ${newName}?`
          : `Wat is de hoofdstad van ${newName}?`;
        correctAnswer = newCapital || (language === 'en' ? 'None' : 'Geen');
      } else if (category === 'province' && questionSubType === 'capital') {
        text = language === 'en'
          ? `What is the capital of the province ${newName}?`
          : `Wat is de provinciehoofdstad van ${newName}?`;
        correctAnswer = newCapital || (language === 'en' ? 'None' : 'Geen');
      } else if (mode === 'flag') {
        text = language === 'en' ? 'Which country does this flag belong to?' : 'Van welk land is deze vlag?';
        correctAnswer = newName;
      } else {
        text = getClueForGeoItem(targetItem.id, newName, category, language);
        correctAnswer = questionSubType === 'capital' ? (newCapital || newName) : newName;
      }

      const options = prevQ.options ? prevQ.options.map(opt => translateName(opt, language)) : [];

      return {
        ...prevQ,
        text,
        correctAnswer,
        options,
        geoItem: newGeoItem,
      };
    });
  }, [language, category, mode, subType]);

  // Generate question
  const generateQuestion = useCallback((overrideRegion?: Region, overrideCategory?: QuestionType, overrideMode?: QuizMode) => {
    const isNewContext = Boolean(
      (overrideRegion && overrideRegion !== region) ||
      (overrideCategory && overrideCategory !== category) ||
      (overrideMode && overrideMode !== mode)
    );

    const currentRegion = overrideRegion || region;
    const currentCategory = overrideCategory || category;
    const currentMode = overrideMode || mode;

    if (currentMode === 'review-errors') {
      if (sessionErrors.length === 0) {
        setCurrentQuestion(null);
        return;
      }
      
      const eligibleErrors = sessionErrors.filter(q => !history.slice(-Math.min(sessionErrors.length - 1, 3)).includes(q.targetId));
      const pool = eligibleErrors.length > 0 ? eligibleErrors : sessionErrors;
      const selectedQuestion = pool[Math.floor(Math.random() * pool.length)];

      setCurrentQuestion({
        ...selectedQuestion,
        id: Math.random().toString(),
      });
      setHistory(prev => [...prev.slice(-30), selectedQuestion.targetId]);
      return;
    }

    const items = getItemsForQuiz(currentRegion, currentCategory, currentMode);
    if (items.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    let currentRemaining = remainingPoolRef.current;

    if (isNewContext) {
      setSessionScore(0);
      setSessionTotal(0);
      sessionScoreRef.current = 0;
      sessionTotalRef.current = 0;
      setSessionErrors([]);
      setHistory([]);
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      currentRemaining = shuffled;
      setRemainingPool(shuffled);
      remainingPoolRef.current = shuffled;
      setTotalPoolSize(items.length);
    } else if (currentRemaining.length === 0) {
      if (sessionTotalRef.current > 0) {
        // Full dataset round complete!
        setCurrentQuestion(null);
        return;
      } else {
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        currentRemaining = shuffled;
        setRemainingPool(shuffled);
        remainingPoolRef.current = shuffled;
        setTotalPoolSize(items.length);
      }
    }

    if (currentRemaining.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentRemaining.length);
    const targetItem = currentRemaining[randomIndex];
    const nextPool = currentRemaining.filter((_, idx) => idx !== randomIndex);

    setRemainingPool(nextPool);
    remainingPoolRef.current = nextPool;

    if (!targetItem) {
      setCurrentQuestion(null);
      return;
    }

    let text = '';
    let correctAnswer = '';
    let options: string[] = [];
    const questionSubType = optionsConfig?.subType || 'name';

    const isCountryOrFlag = currentCategory === 'country' || currentMode === 'flag' || (currentCategory as string) === 'flag';

    if (currentMode === 'multiple-choice') {
      if (currentCategory === 'capital' || (questionSubType as string) === 'capital' || (currentCategory === 'country' && (questionSubType as string) === 'capital') || (currentCategory === 'province' && (questionSubType as string) === 'capital')) {
        const entityName = translateName(targetItem.name || (targetItem as any).naam || '', language);
        text = language === 'en' 
          ? `What is the capital of ${entityName}?` 
          : `Wat is de hoofdstad van ${entityName}?`;
        const rawCap = targetItem.capital || (targetItem as any).hoofdstad || (language === 'en' ? 'None' : 'Geen');
        correctAnswer = translateName(rawCap, language);
        // Distractors exclusively from other capitals in the same dataset
        const otherCapitals = items
          .filter(it => it.id !== targetItem.id && (it.capital || (it as any).hoofdstad))
          .map(it => translateName(it.capital || (it as any).hoofdstad, language))
          .filter(cap => cap && cap !== correctAnswer);
        const distractors = Array.from(new Set<string>(otherCapitals))
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        options = Array.from(new Set<string>([correctAnswer, ...distractors])).sort(() => 0.5 - Math.random());
      } else if (currentCategory === 'country' && questionSubType === 'name') {
        text = getClueForGeoItem(targetItem.id, targetItem.name, currentCategory, language);
        correctAnswer = targetItem.name;
        const otherNames = items
          .filter(it => it.id !== targetItem.id)
          .map(it => it.name);
        const distractors = otherNames
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      } else {
        // General text MCS Quiz
        text = getClueForGeoItem(targetItem.id, targetItem.name, currentCategory, language);
        correctAnswer = targetItem.name;
        const otherItems = items
          .filter(it => it.id !== targetItem.id)
          .map(it => it.name);
        const distractors = otherItems.sort(() => 0.5 - Math.random()).slice(0, 2);
        options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      }
    } else if (currentMode === 'fill-in') {
      if (currentCategory === 'capital' || (questionSubType as string) === 'capital' || (currentCategory === 'country' && questionSubType === 'capital') || (currentCategory === 'province' && questionSubType === 'capital')) {
        text = language === 'en' 
          ? `What is the capital of ${targetItem.name}?` 
          : `Wat is de hoofdstad van ${targetItem.name}?`;
        correctAnswer = targetItem.capital || '';
      } else if (currentCategory === 'country' && questionSubType === 'name') {
        text = getClueForGeoItem(targetItem.id, targetItem.name, currentCategory, language);
        correctAnswer = targetItem.name;
      } else {
        text = getClueForGeoItem(targetItem.id, targetItem.name, currentCategory, language);
        correctAnswer = targetItem.name;
      }
    } else if (currentMode === 'flag') {
      text = language === 'en' ? 'Which country does this flag belong to?' : 'Van welk land is deze vlag?';
      correctAnswer = targetItem.name;
      const otherNames = items
        .filter(it => it.id !== targetItem.id)
        .map(it => it.name);
      const distractors = otherNames
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
    }

    // Clean duplicate options
    options = Array.from(new Set(options));
    // Fallback if not enough options
    const targetOptionCount = 3;
    if ((currentMode === 'multiple-choice' || currentMode === 'flag') && options.length < targetOptionCount) {
      let filler: string[] = [];
      if (currentCategory === 'capital' || questionSubType === 'capital') {
        filler = language === 'en'
          ? ["Paris", "Berlin", "Madrid", "Rome", "Brussels", "Amsterdam", "Vienna", "London", "Prague", "Warsaw", "Lisbon", "Athens"]
          : ["Parijs", "Berlijn", "Madrid", "Rome", "Brussel", "Amsterdam", "Wenen", "Londen", "Praag", "Warschau", "Lissabon", "Athene"];
      } else if (isCountryOrFlag) {
        filler = language === 'en' 
          ? ["France", "Germany", "Spain", "Italy", "Netherlands", "Belgium", "Poland", "Austria", "Sweden", "Norway"]
          : ["Frankrijk", "Duitsland", "Spanje", "Italië", "Nederland", "België", "Polen", "Oostenrijk", "Zweden", "Noorwegen"];
      } else if (currentCategory === 'province') {
        filler = language === 'en'
          ? ["Antwerp", "East Flanders", "West Flanders", "Flemish Brabant", "Limburg", "Liège", "Namur", "Hainaut", "Luxembourg", "Walloon Brabant"]
          : ["Antwerpen", "Oost-Vlaanderen", "West-Vlaanderen", "Vlaams-Brabant", "Limburg", "Luik", "Namen", "Henegouwen", "Luxemburg", "Waals-Brabant"];
      } else {
        filler = language === 'en'
          ? ["France", "Germany", "Spain", "Italy", "Netherlands", "Belgium", "Poland"]
          : ["Frankrijk", "Duitsland", "Spanje", "Italië", "Nederland", "België", "Polen"];
      }

      for (const fText of filler) {
        if (options.length < targetOptionCount && fText !== correctAnswer && !options.includes(fText)) {
          options.push(fText);
        }
      }
    }

    setCurrentQuestion({
      id: Math.random().toString(),
      type: currentMode,
      category: currentCategory,
      text,
      correctAnswer,
      options,
      targetId: targetItem.id,
      dataset: currentRegion,
      geoItem: targetItem
    });
    setHistory(prev => [...prev.slice(-30), targetItem.id]);
  }, [region, category, mode, subType, history, getItemsForQuiz, sessionErrors, language]);

  // Record results and compute stats and achievements
  const submitAnswer = useCallback((answer: string, elapsedSeconds: number) => {
    if (!currentQuestion) return false;

    let isCorrect = false;
    const targetItem = currentQuestion.geoItem;

    const actualType = currentQuestion.type;
    if (actualType === 'multiple-choice' || actualType === 'flag') {
      isCorrect = answer === currentQuestion.correctAnswer || normalize(answer) === normalize(currentQuestion.correctAnswer);
    } else {
      // fill-in
      isCorrect = validateAnswer(answer, currentQuestion.correctAnswer, targetItem.alternatives);
    }

    const nextTotal = sessionTotalRef.current + 1;
    sessionTotalRef.current = nextTotal;
    setSessionTotal(nextTotal);

    if (isCorrect) {
      const nextScore = sessionScoreRef.current + 1;
      sessionScoreRef.current = nextScore;
      setSessionScore(nextScore);
      setSessionErrors(prev => prev.filter(q => q.targetId !== targetItem.id));
    } else {
      setSessionErrors(prev => {
        if (prev.some(q => q.targetId === targetItem.id)) return prev;
        return [...prev, currentQuestion];
      });
    }

    // 1. Spaced Repetition persistence Update
    let srs: Record<string, QuizProgress> = {};
    try {
      const srsRaw = localStorage.getItem('geo_trainer_progress') || '{}';
      srs = JSON.parse(srsRaw);
    } catch (_err) {
      srs = {};
    }
    
    if (!srs[targetItem.id]) {
      srs[targetItem.id] = {
        consecutiveCorrect: 0,
        attempts: 0,
        correct: 0,
        nextReviewDate: 0,
        wrongCount: 0
      };
    }

    const itemProgress = srs[targetItem.id];
    itemProgress.attempts += 1;
    if (isCorrect) {
      itemProgress.correct += 1;
      itemProgress.consecutiveCorrect += 1;
    } else {
      itemProgress.consecutiveCorrect = 0;
      itemProgress.wrongCount += 1;
    }
    
    // Set next review interval
    const days = calculateNextReview(itemProgress.consecutiveCorrect);
    itemProgress.nextReviewDate = Date.now() + (days * 24 * 60 * 60 * 1000);
    srs[targetItem.id] = itemProgress;
    localStorage.setItem('geo_trainer_progress', JSON.stringify(srs));

    // 2. Weakness tracking
    const updatedWeaknesses = [...(stats.weaknesses || [])];
    const weaknessIndex = updatedWeaknesses.findIndex(w => w.itemId === targetItem.id);
    if (!isCorrect) {
      if (weaknessIndex >= 0) {
        updatedWeaknesses[weaknessIndex].errorCount += 1;
      } else {
        updatedWeaknesses.push({
          itemId: targetItem.id,
          name: targetItem.name,
          region,
          errorCount: 1
        });
      }
    } else {
      // If they got it right, reduce weakness error count slightly
      if (weaknessIndex >= 0) {
        updatedWeaknesses[weaknessIndex].errorCount = Math.max(0, updatedWeaknesses[weaknessIndex].errorCount - 1);
        if (updatedWeaknesses[weaknessIndex].errorCount === 0) {
          updatedWeaknesses.splice(weaknessIndex, 1);
        }
      }
    }
    // Sort weaknesses to keep worst first
    updatedWeaknesses.sort((a, b) => b.errorCount - a.errorCount);

    // 3. Overall Stats Calculation
    const totalCorrect = stats.totalCorrect + (isCorrect ? 1 : 0);
    const totalAnswered = stats.totalAnswered + 1;
    const accuracy = Math.round((totalCorrect / totalAnswered) * 100);
    
    // Avg time computation
    const totalOldTime = stats.avgTime * stats.totalAnswered;
    const newAvgTime = Number(((totalOldTime + elapsedSeconds) / totalAnswered).toFixed(1));

    // Achievements computation (Minimum 50 achievements listed!)
    const activeAchievements = [...(stats.achievements || [])];
    
    const awardUnique = (key: string) => {
      if (!activeAchievements.includes(key)) {
        activeAchievements.push(key);
      }
    };

    // Calculate dynamic milestone achievements
    if (totalAnswered >= 1) awardUnique('first_steps');
    if (totalAnswered >= 10) awardUnique('answered_10');
    if (totalAnswered >= 50) awardUnique('answered_50');
    if (totalAnswered >= 100) awardUnique('answered_100');
    if (totalAnswered >= 500) awardUnique('answered_500');
    if (totalAnswered >= 1000) awardUnique('answered_1000');

    if (totalCorrect >= 5) awardUnique('correct_5');
    if (totalCorrect >= 25) awardUnique('correct_25');
    if (totalCorrect >= 100) awardUnique('correct_100');
    if (totalCorrect >= 500) awardUnique('correct_500');

    // Specific regions
    if (region === 'belgium' && isCorrect) awardUnique('belgium_explorer');
    if (region === 'europe' && isCorrect) awardUnique('europe_explorer');
    if (region === 'world' && isCorrect) awardUnique('world_explorer');

    // specific categories
    if (category === 'province' && isCorrect) awardUnique('province_specialist');
    if (category === 'river' && isCorrect) awardUnique('river_navigator');
    if (category === 'city' && isCorrect) awardUnique('urban_planner');
    if (category === 'country' && isCorrect) awardUnique('border_guard');
    if (category === 'sea' && isCorrect) awardUnique('captain');
    if (category === 'line' && isCorrect) awardUnique('equator_walker');

    // Accuracy milestones
    if (accuracy >= 80 && totalAnswered >= 50) awardUnique('smart_cookie');
    if (accuracy >= 95 && totalAnswered >= 100) awardUnique('geography_guru');

    const nextStats: UserStats = {
      ...stats,
      totalCorrect,
      totalAnswered,
      accuracy,
      avgTime: newAvgTime,
      weaknesses: updatedWeaknesses.slice(0, 15), // keep worst 15 weaknesses
      achievements: activeAchievements,
      lastActive: new Date().toISOString().split('T')[0]
    };

    setStats(nextStats);
    localStorage.setItem('geo_trainer_stats', JSON.stringify(nextStats));

    return isCorrect;
  }, [currentQuestion, stats, region, category, mode]);

  // Reset session counters
  const resetSession = useCallback(() => {
    const items = getItemsForQuiz(region, category, mode);
    setSessionScore(0);
    setSessionTotal(0);
    sessionScoreRef.current = 0;
    sessionTotalRef.current = 0;
    setSessionErrors([]);
    setHistory([]);
    setCurrentQuestion(null);
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    setRemainingPool(shuffled);
    remainingPoolRef.current = shuffled;
    setTotalPoolSize(items.length);
  }, [getItemsForQuiz, region, category, mode]);

  return {
    currentQuestion,
    generateQuestion,
    submitAnswer,
    sessionScore,
    sessionTotal,
    totalPoolSize,
    userStats: stats,
    resetSession,
    setSessionScore,
    sessionErrors,
    remainingPool
  };
};
