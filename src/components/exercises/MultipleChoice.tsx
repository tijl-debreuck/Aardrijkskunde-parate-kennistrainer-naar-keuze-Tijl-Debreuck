import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../../types/geography';
import { Check, X } from 'lucide-react';
import { getCategoryLabel } from '../../utils/questionDescriptions';
import { Language } from '../../utils/language';

interface MultipleChoiceProps {
  question: Question;
  onResult: (isCorrect: boolean, chosenOption: string) => void;
  language?: Language;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({ question, onResult, language }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const activeLang: Language = language || (localStorage.getItem('geo_language') as Language) || 'nl';

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === question.correctAnswer;
    const wrongDelaySec = parseFloat(localStorage.getItem('geo_wrong_answer_delay') || '3');
    const delayMs = isCorrect ? 600 : Math.round(wrongDelaySec * 1000);

    setTimeout(() => {
      onResult(isCorrect, option);
      setSelectedOption(null);
      setIsAnswered(false);
    }, delayMs);
  };

  const cleanOptions: string[] = Array.from(new Set(question.options || [])).filter((opt): opt is string => Boolean(opt));

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Question Card */}
      <div className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-200 dark:border-blue-500/20">
          {getCategoryLabel(question.category, activeLang)}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight mt-1 text-slate-900 dark:text-white leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Vertical Stack of Options */}
      <div className="flex flex-col gap-3">
        {cleanOptions.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrectAnswer = opt === question.correctAnswer;
          
          let buttonStyle = "bg-white border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-400 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800 dark:hover:border-slate-700 shadow-md";
          let icon = null;

          if (isAnswered) {
            if (isCorrectAnswer) {
              buttonStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40 font-extrabold";
              icon = <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />;
            } else if (isSelected) {
              buttonStyle = "bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/40 font-extrabold";
              icon = <X className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />;
            } else {
              buttonStyle = "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-600 pointer-events-none opacity-50";
            }
          }

          return (
            <motion.button
              key={opt}
              whileHover={!isAnswered ? { scale: 1.01, translateY: -1 } : {}}
              whileTap={!isAnswered ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 text-base sm:text-lg font-bold tracking-tight text-left transition-all duration-200 shadow-sm cursor-pointer ${buttonStyle}`}
            >
              <span className="grow text-left font-bold">{opt}</span>
              <AnimatePresence>
                {icon && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {icon}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
export default MultipleChoice;
