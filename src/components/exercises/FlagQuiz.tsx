import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../../types/geography';
import { Check, X, Image as ImageIcon } from 'lucide-react';
import { getFlagUrl, getFallbackFlagUrl, getIsoCode } from '../../utils/flags';
import { Language, uiTranslations } from '../../utils/language';

interface FlagQuizProps {
  question: Question;
  onResult: (isCorrect: boolean, chosenOption: string) => void;
  language?: Language;
}

export const FlagQuiz: React.FC<FlagQuizProps> = ({ question, onResult, language }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const activeLang: Language = language || (localStorage.getItem('geo_language') as Language) || 'nl';
  const t = uiTranslations[activeLang];

  const targetId = question.targetId || question.correctAnswer;
  const isoCode = getIsoCode(targetId) || getIsoCode(question.correctAnswer) || (question.geoItem?.name ? getIsoCode(question.geoItem.name) : null);

  const [currentFlagUrl, setCurrentFlagUrl] = useState<string | null>(() => 
    getFlagUrl(targetId) || getFlagUrl(question.correctAnswer) || (question.geoItem?.name ? getFlagUrl(question.geoItem.name) : null)
  );
  const [retryStep, setRetryStep] = useState<number>(0);

  React.useEffect(() => {
    const url = getFlagUrl(targetId) || getFlagUrl(question.correctAnswer) || (question.geoItem?.name ? getFlagUrl(question.geoItem.name) : null);
    setCurrentFlagUrl(url);
    setRetryStep(0);
  }, [question.id, targetId]);

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
      setRetryStep(0);
    }, delayMs);
  };

  const handleImageError = () => {
    if (retryStep === 0) {
      setRetryStep(1);
      const fallback = getFallbackFlagUrl(targetId) || (isoCode ? `https://raw.githubusercontent.com/hampusborgos/country-flags/main/svg/${isoCode.toLowerCase()}.svg` : null);
      if (fallback) {
        setCurrentFlagUrl(fallback);
        return;
      }
    } else if (retryStep === 1 && isoCode) {
      setRetryStep(2);
      setCurrentFlagUrl(`https://flagcdn.com/${isoCode.toLowerCase()}.svg`);
      return;
    }
    setCurrentFlagUrl(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Flag Display Card */}
      <div className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-3xl p-6 text-center shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-500/20">
            {t.flagQuizTitle}
          </span>
          {isoCode && (
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full uppercase border border-amber-200 dark:border-amber-500/20">
              ISO: {isoCode.toUpperCase()}
            </span>
          )}
        </div>

        {/* Flag Image Container */}
        <div className="relative w-64 h-40 max-w-full bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-2">
          {currentFlagUrl ? (
            <img
              key={currentFlagUrl}
              src={currentFlagUrl}
              alt="Te herkennen vlag"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-md rounded"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
              <ImageIcon className="w-10 h-10 stroke-1" />
              <span className="text-xs font-mono">{t.noFlagFound}</span>
            </div>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight mt-5 text-slate-900 dark:text-white">
          {question.text}
        </h2>
      </div>

      {/* Stack of 3 Distractor Options under the Flag */}
      <div className="flex flex-col gap-3 w-full">
        {question.options?.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrectAnswer = opt === question.correctAnswer;

          let buttonStyle = "bg-white border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-700 shadow-sm";
          let icon = null;

          if (isAnswered) {
            if (isCorrectAnswer) {
              buttonStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30";
              icon = <Check className="w-5 h-5 text-emerald-500 shrink-0" />;
            } else if (isSelected) {
              buttonStyle = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30";
              icon = <X className="w-5 h-5 text-rose-500 shrink-0" />;
            } else {
              buttonStyle = "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-600 pointer-events-none opacity-50";
            }
          }

          return (
            <motion.button
              key={opt}
              whileHover={!isAnswered ? { scale: 1.02, translateY: -2 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`flex items-center justify-between p-5 rounded-2xl border text-base font-semibold tracking-tight text-left transition-all duration-300 shadow-sm cursor-pointer ${buttonStyle}`}
            >
              <span>{opt}</span>
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

export default FlagQuiz;
