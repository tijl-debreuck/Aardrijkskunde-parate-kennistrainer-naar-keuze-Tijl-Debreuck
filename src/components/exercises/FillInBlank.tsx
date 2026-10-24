import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../../types/geography';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateAnswer } from '../../utils/normalization';
import { getCategoryLabel } from '../../utils/questionDescriptions';
import { Language, uiTranslations } from '../../utils/language';

interface FillInBlankProps {
  question: Question;
  onResult: (isCorrect: boolean, inputVal: string) => void;
  language?: Language;
}

export const FillInBlank: React.FC<FillInBlankProps> = ({ question, onResult, language }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeLang: Language = language || (localStorage.getItem('geo_language') as Language) || 'nl';
  const t = uiTranslations[activeLang];

  // Focus input on mount and when question changes
  useEffect(() => {
    setInputValue('');
    setIsSubmitted(false);
    setFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitted) return;

    setIsSubmitted(true);
    const correct = validateAnswer(
      inputValue,
      question.correctAnswer,
      question.geoItem.alternatives
    );

    setFeedback(correct ? 'correct' : 'wrong');

    const wrongDelaySec = parseFloat(localStorage.getItem('geo_wrong_answer_delay') || '3');
    const delayMs = correct ? 600 : Math.round(wrongDelaySec * 1000);

    setTimeout(() => {
      onResult(correct, inputValue);
      setInputValue('');
      setFeedback(null);
      setIsSubmitted(false);
    }, delayMs);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Target Question Context */}
      <div className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-200 dark:border-blue-500/20">
          {getCategoryLabel(question.category, activeLang)}
        </span>
        <h2 className="text-xl text-slate-600 dark:text-slate-300 font-bold">
          {activeLang === 'en' ? 'Type the correct answer:' : 'Vul het juiste antwoord in:'}
        </h2>
        <p className="text-2xl mt-3 font-black font-sans text-slate-900 dark:text-white tracking-tight">
          {question.text}
        </p>

        {question.geoItem.capital && question.category !== 'country' && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-2">
            {activeLang === 'en' ? `Tip: Capital is ${question.geoItem.capital}` : `Tip: Hoofdstad is ${question.geoItem.capital}`}
          </p>
        )}
      </div>

      {/* Input Action Card */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitted}
            placeholder={t.typeAnswerPlaceholder}
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md placeholder-slate-400 dark:placeholder-slate-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSubmitted}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center border border-blue-400/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Floating Interactive HUD feedback message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className={`flex items-start gap-4 p-5 rounded-2xl border-2 ${
              feedback === 'correct'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-lg'
                : 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200 shadow-lg'
            }`}
          >
            {feedback === 'correct' ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-lg text-emerald-950 dark:text-emerald-100">{t.excellent}</h4>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">{t.correctFeedback}</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-lg text-rose-950 dark:text-rose-100">{t.wrongFeedback}</h4>
                  <p className="text-sm text-rose-800 dark:text-rose-300 font-semibold">
                    {t.correctAnswerWas}{' '}
                    <span className="font-extrabold text-slate-900 dark:text-white underline underline-offset-2">{question.correctAnswer}</span>
                  </p>
                  {question.geoItem.alternatives && question.geoItem.alternatives.length > 0 && (
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 font-mono">
                      {t.alternativesLabel} {question.geoItem.alternatives.join(', ')}
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default FillInBlank;
