import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorldMap, EuropeMap, BelgiumMap } from './maps';
import { worldRivers, worldMountains, europeRivers, europeMountains, belgiumRivers, belgiumHighways } from '../data/geoData';
import belgiumJSON from '../data/belgium.json';
import europeJSON from '../data/europe.json';
import worldJSON from '../data/world.json';
import { RotateCcw, ArrowLeft } from 'lucide-react';

import { Region, QuizMode, QuestionType } from '../types/geography';

import { Language, translateName } from '../utils/language';

interface GeoQuizProps {
  onStartFlagQuiz?: (region: Region, mode: QuizMode) => void;
  onStartMultipleChoiceQuiz?: (region: Region, category: QuestionType) => void;
  language?: Language;
}

const GeoQuiz = React.memo(function GeoQuiz({ onStartFlagQuiz, onStartMultipleChoiceQuiz, language = 'nl' }: GeoQuizProps) {
  const [region, setRegion] = useState<'world' | 'europe' | 'belgium'>('world');
  const [category, setCategory] = useState<QuestionType>('country');

  // Score states
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Quiz Flow
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    targetId: string;
    correctAnswer: string;
    category: string;
    geoItem: any;
  } | null>(null);

  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerSuccess, setAnswerSuccess] = useState<boolean | null>(null);
  const [isMapQuizActive, setIsMapQuizActive] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Wrong attempts tracking (allow 2 attempts per question before moving on)
  const [attempts, setAttempts] = useState(0);
  const [wrongClicks, setWrongClicks] = useState<string[]>([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const [remainingQuestions, setRemainingQuestions] = useState<any[] | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Synchronize state into refs to avoid stale closures in timeouts and async handlers
  const regionRef = useRef(region);
  const categoryRef = useRef(category);
  const languageRef = useRef(language);
  const remainingQuestionsRef = useRef<any[] | null>(remainingQuestions);
  const currentQuestionRef = useRef(currentQuestion);
  const hasAnsweredRef = useRef(hasAnswered);
  const attemptsRef = useRef(attempts);
  const wrongClicksRef = useRef(wrongClicks);
  const showCorrectAnswerRef = useRef(showCorrectAnswer);

  useEffect(() => {
    regionRef.current = region;
    categoryRef.current = category;
    languageRef.current = language;
    remainingQuestionsRef.current = remainingQuestions;
    currentQuestionRef.current = currentQuestion;
    hasAnsweredRef.current = hasAnswered;
    attemptsRef.current = attempts;
    wrongClicksRef.current = wrongClicks;
    showCorrectAnswerRef.current = showCorrectAnswer;
  });

  const getPoolForRegionCategory = (r: 'world' | 'europe' | 'belgium', c: string) => {
    if (r === 'world') {
      if (c === 'capital') {
        const countries = worldJSON.countries || [];
        return countries.filter((it: any) => Boolean(it.capital || it.hoofdstad));
      }
      if (c === 'river') return worldRivers;
      if (c === 'mountain') return worldMountains;
      if (c === 'city') return worldJSON.steden || [];
      return worldJSON.countries || [];
    }
    if (r === 'europe') {
      if (c === 'capital') {
        const countries = europeJSON.countries || [];
        return countries.filter((it: any) => Boolean(it.capital || it.hoofdstad));
      }
      if (c === 'river') return europeRivers;
      if (c === 'mountain') return europeMountains;
      return europeJSON.countries || [];
    }
    if (r === 'belgium') {
      if (c === 'capital') {
        const provinces = belgiumJSON.provinces || [];
        return provinces.filter((it: any) => Boolean(it.capital || it.hoofdstad));
      }
      if (c === 'river') return belgiumRivers;
      if (c === 'highway') return belgiumHighways;
      return belgiumJSON.provinces || [];
    }
    return [];
  };

  const generateNewQuestion = useCallback((forceReset = false, specificRemaining?: any[]) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    const activeRegion = regionRef.current;
    const activeCategory = categoryRef.current;
    const activeLang = languageRef.current;

    setHasAnswered(false);
    hasAnsweredRef.current = false;
    setAnswerSuccess(null);
    setAttempts(0);
    attemptsRef.current = 0;
    setWrongClicks([]);
    wrongClicksRef.current = [];
    setShowCorrectAnswer(false);
    showCorrectAnswerRef.current = false;

    if (activeCategory === 'flag') {
      setCurrentQuestion(null);
      return;
    }

    const pool = getPoolForRegionCategory(activeRegion, activeCategory);
    if (!pool || pool.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    let currentRemaining = specificRemaining || remainingQuestionsRef.current;

    // Validate that currentRemaining belongs to the active pool
    const isValidRemaining = currentRemaining && currentRemaining.length > 0 &&
      currentRemaining.every(item => pool.some(p => p.id === item.id));

    if (forceReset || !isValidRemaining || !currentRemaining) {
      currentRemaining = [...pool];
      setIsQuizFinished(false);
      setScore(0);
      setTotal(0);
    }

    if (currentRemaining.length === 0) {
      setIsQuizFinished(true);
      setCurrentQuestion(null);
      setRemainingQuestions([]);
      remainingQuestionsRef.current = [];
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentRemaining.length);
    const target = currentRemaining[randomIndex];

    const newRemaining = [...currentRemaining];
    newRemaining.splice(randomIndex, 1);

    setRemainingQuestions(newRemaining);
    remainingQuestionsRef.current = newRemaining;

    const qId = Math.random().toString();
    let targetId = target.id;
    let rawAnswer = target.name || target.naam || '';
    let questionText = '';

    if (activeCategory === 'capital' && (target.capital || target.hoofdstad)) {
      const countryName = translateName(target.name || target.naam || '', activeLang);
      rawAnswer = target.capital || target.hoofdstad;
      targetId = target.id;
      questionText = activeLang === 'en'
        ? `What is the capital of ${countryName}?`
        : `Wat is de hoofdstad van ${countryName}?`;
    } else {
      questionText = activeLang === 'en'
        ? `Find: ${translateName(rawAnswer, activeLang)}`
        : `Zoek: ${translateName(rawAnswer, activeLang)}`;
    }

    const correctAnswer = translateName(rawAnswer, activeLang);

    const newQ = {
      id: qId,
      targetId,
      correctAnswer,
      questionText,
      category: activeCategory,
      geoItem: target
    };
    setCurrentQuestion(newQ);
    currentQuestionRef.current = newQ;
  }, []);

  // Auto generate a question on mount or change of region/category/language
  useEffect(() => {
    generateNewQuestion(true);
  }, [region, category, language, generateNewQuestion]);

  // Handle region shifts
  const handleRegionChange = (newReg: 'world' | 'europe' | 'belgium') => {
    setRegion(newReg);
    regionRef.current = newReg;
    // Reset category to supported one on region switch
    if (newReg === 'belgium') {
      if (category === 'mountain' || category === 'country' || category === 'flag' || category === 'city') {
        setCategory('province');
        categoryRef.current = 'province';
      }
    } else if (newReg === 'europe') {
      if (category === 'city' || category === 'province' || category === 'highway') {
        setCategory('country');
        categoryRef.current = 'country';
      }
    } else {
      if (category === 'province' || category === 'highway') {
        setCategory('country');
        categoryRef.current = 'country';
      }
    }
  };

  const handleSkipQuestion = () => {
    const curQ = currentQuestionRef.current;
    const rem = remainingQuestionsRef.current || [];
    if (!curQ) return;
    const newRemaining = [...rem, curQ.geoItem];
    generateNewQuestion(false, newRemaining);
  };

  const handleMapResult = useCallback((isCorrect: boolean, _chosenLabel: string, clickedId: string) => {
    if (hasAnsweredRef.current || showCorrectAnswerRef.current) return;

    if (isCorrect) {
      hasAnsweredRef.current = true;
      setHasAnswered(true);
      setAnswerSuccess(true);

      setScore(s => s + 1);
      setTotal(t => t + 1);

      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = setTimeout(() => {
        setWrongClicks([]);
        setAttempts(0);
        setShowCorrectAnswer(false);
        generateNewQuestion(false);
      }, 900);
    } else {
      // Add wrong clicked item to map red highlights
      setWrongClicks(prev => prev.includes(clickedId) ? prev : [...prev, clickedId]);
      
      const newAttempts = attemptsRef.current + 1;
      setAttempts(newAttempts);
      attemptsRef.current = newAttempts;

      if (newAttempts < 2) {
        // First wrong guess: prompt to try a 2nd time for same question
        setAnswerSuccess(false);
      } else {
        // Second wrong guess: reveal correct answer in green, mark completed for this question
        hasAnsweredRef.current = true;
        setHasAnswered(true);
        setAnswerSuccess(false);
        setShowCorrectAnswer(true);
        showCorrectAnswerRef.current = true;

        setTotal(t => t + 1);

        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
          setWrongClicks([]);
          setAttempts(0);
          setShowCorrectAnswer(false);
          generateNewQuestion(false);
        }, 2500);
      }
    }
  }, [generateNewQuestion]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const resetScore = () => {
    setScore(0);
    setTotal(0);
    setRemainingQuestions(null);
    remainingQuestionsRef.current = null;
    setIsQuizFinished(false);
    generateNewQuestion(true);
  };

  return (
    <div className="space-y-3">
      {/* Combined Compact Control & Question HUD Bar */}
      <div className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Region & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-full overflow-hidden">
          {/* Region Pills */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => handleRegionChange('world')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                region === 'world' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌐 Wereld
            </button>
            <button
              onClick={() => handleRegionChange('europe')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                region === 'europe' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇪🇺 Europa
            </button>
            <button
              onClick={() => handleRegionChange('belgium')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                region === 'belgium' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇧🇪 België
            </button>
          </div>

          {/* Category Pills - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar whitespace-nowrap">
            {region === 'belgium' ? (
              <button
                onClick={() => setCategory('province')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'province' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📍 Provincies
              </button>
            ) : (
              <button
                onClick={() => setCategory('country')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'country' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌍 Landen
              </button>
            )}

            <button
              onClick={() => setCategory('capital')}
              className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                category === 'capital' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏛️ Hoofdsteden
            </button>

            <button
              onClick={() => setCategory('river')}
              className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                category === 'river' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌊 Rivieren
            </button>

            {region === 'belgium' && (
              <button
                onClick={() => setCategory('highway')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'highway' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🛣️ Autosnelwegen
              </button>
            )}

            {region !== 'belgium' && (
              <button
                onClick={() => setCategory('mountain')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'mountain' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⛰️ Gebergten
              </button>
            )}

            {region !== 'belgium' && (
              <button
                onClick={() => setCategory('flag')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'flag' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏳️ Vlaggen
              </button>
            )}

            {region === 'world' && (
              <button
                onClick={() => setCategory('city')}
                className={`px-2.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  category === 'city' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏙️ Belangrijke Steden
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Action & Score HUD */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {category !== 'flag' && (
            !isMapQuizActive ? (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => { setIsMapQuizActive(true); generateNewQuestion(true); }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20 text-xs flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  <span>▶ {category === 'capital' ? 'Start Kaart Quiz' : 'Start Oefening'}</span>
                </button>
                {category === 'capital' && onStartMultipleChoiceQuiz && (
                  <button
                    onClick={() => onStartMultipleChoiceQuiz(region, 'capital')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-purple-500/20 text-xs flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <span>❓ Start Meerkeuze Quiz</span>
                  </button>
                )}
                {total > 0 && (
                  <button 
                    onClick={resetScore}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
                    title="Reset Score"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                {currentQuestion && !isQuizFinished && (
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs flex-wrap">
                    <span className="text-sm">🎯</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {category === 'capital' ? (
                        <span>{currentQuestion.questionText || `Wat is de hoofdstad van ${translateName(currentQuestion.geoItem?.name || currentQuestion.geoItem?.naam || '', language)}?`}</span>
                      ) : (
                        <span>Zoek: <span className="text-blue-600 dark:text-blue-400 font-black underline decoration-2">{currentQuestion.correctAnswer}</span></span>
                      )}
                    </span>
                    {hasAnswered && answerSuccess && (
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-emerald-500 text-white animate-pulse">
                        ✓ Juist!
                      </span>
                    )}
                    {!hasAnswered && attempts === 1 && (
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-amber-500 text-white">
                        ⚠️ Fout! Probeer nog 1x (poging 2/2)
                      </span>
                    )}
                    {showCorrectAnswer && (
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-rose-500 text-white">
                        ❌ Fout! Het juiste antwoord staat in 't groen
                      </span>
                    )}
                    {!hasAnswered && attempts === 0 && (
                      <button
                        onClick={handleSkipQuestion}
                        className="px-2 py-0.5 text-[11px] font-bold bg-slate-600 hover:bg-slate-500 text-white rounded cursor-pointer ml-auto"
                      >
                        Overslaan
                      </button>
                    )}
                  </div>
                )}

                <div className="font-mono text-xs px-2.5 py-1.5 rounded-xl border font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <span>Vraag: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{Math.min(total + 1, getPoolForRegionCategory(region, category).length || 1)}</span> / {getPoolForRegionCategory(region, category).length || 1}</span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>Juist: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{score}</span></span>
                </div>

                <button
                  onClick={() => setIsMapQuizActive(false)}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Stop
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Seterra Map Area Container or Flag Quiz Launcher */}
      {category === 'flag' ? (
        <div className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-3xl p-8 text-center space-y-4 shadow-xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-3xl border border-blue-200 dark:border-blue-800">
            🏳️
          </div>
          <h3 className="text-2xl font-black">Vlaggen Quiz ({region === 'belgium' ? 'België' : region === 'europe' ? 'Europa' : 'Wereld'})</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
            Test je kennis van de vlaggen van {region === 'belgium' ? 'Europese en wereldwijde landen' : region === 'europe' ? 'alle Europese landen' : 'alle landen ter wereld'}. Onder elke vlag staan drie keuzemogelijkheden om het juiste antwoord te kiezen.
          </p>
          {onStartFlagQuiz && (
            <button 
              onClick={() => onStartFlagQuiz(region, 'flag')} 
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-base flex items-center gap-2"
            >
              <span>▶ Start Vlaggen Quiz</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">

          {/* Full-screen Score Window Modal when Quiz Finished */}
          {isMapQuizActive && isQuizFinished && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 max-w-md w-full shadow-2xl">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner border border-amber-200 dark:border-amber-700/50">
                  🏆
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Oefening Afgerond! 🎉</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Je hebt alle onderdelen van deze reeks doorlopen.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Eindscore</span>
                    <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{score} / {total}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Percentage</span>
                    <span className="text-3xl font-black text-blue-500 dark:text-blue-400">
                      {total > 0 ? Math.round((score / total) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { resetScore(); generateNewQuestion(true); }} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm cursor-pointer"
                  >
                    🔄 Opnieuw Proberen
                  </button>
                  <button 
                    onClick={() => { setIsMapQuizActive(false); resetScore(); }} 
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Terug naar Kaartoverzicht
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* The Interactive Seterra White Map Component */}
          <AnimatePresence mode="wait">
            <motion.div
              key={region}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {region === 'world' && (
                <WorldMap 
                  activeQuestion={currentQuestion} 
                  onResult={handleMapResult}
                  interactiveMode={isMapQuizActive}
                  showCorrectAnswer={showCorrectAnswer}
                  wrongItems={wrongClicks}
                  language={language}
                />
              )}
              {region === 'europe' && (
                <EuropeMap 
                  activeQuestion={currentQuestion} 
                  onResult={handleMapResult}
                  interactiveMode={isMapQuizActive}
                  showCorrectAnswer={showCorrectAnswer}
                  wrongItems={wrongClicks}
                  language={language}
                />
              )}
              {region === 'belgium' && (
                <BelgiumMap 
                  activeQuestion={currentQuestion} 
                  onResult={handleMapResult}
                  interactiveMode={isMapQuizActive}
                  showCorrectAnswer={showCorrectAnswer}
                  wrongItems={wrongClicks}
                  language={language}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

export default GeoQuiz;
