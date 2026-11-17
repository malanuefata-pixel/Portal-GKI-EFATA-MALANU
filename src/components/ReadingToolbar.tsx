import React from 'react';
import { Minus, Plus, Type } from 'lucide-react';

interface ReadingToolbarProps {
  fontScale: number;
  onChangeScale: (scale: number) => void;
  title?: string;
}

const SCALES = [1, 1.15, 1.3, 1.5];

export const ReadingToolbar: React.FC<ReadingToolbarProps> = ({
  fontScale,
  onChangeScale,
  title = 'Ukuran Teks Bacaan',
}) => {
  const idx = SCALES.indexOf(fontScale);
  const currentIndex = idx >= 0 ? idx : 0;

  const decrease = () => {
    if (currentIndex > 0) onChangeScale(SCALES[currentIndex - 1]);
  };

  const increase = () => {
    if (currentIndex < SCALES.length - 1) onChangeScale(SCALES[currentIndex + 1]);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        <Type className="w-4 h-4 text-[#0F2C59] dark:text-[#E5A93C] shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={decrease}
          disabled={currentIndex === 0}
          aria-label="Perkecil ukuran teks"
          className="min-h-[40px] min-w-[40px] px-2.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          <Minus className="w-3.5 h-3.5 mr-0.5" />A
        </button>
        <span className="font-mono-num text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C] min-w-[44px] text-center">
          {Math.round(fontScale * 100)}%
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={currentIndex === SCALES.length - 1}
          aria-label="Perbesar ukuran teks"
          className="min-h-[40px] min-w-[40px] px-2.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-0.5" />A
        </button>
      </div>
    </div>
  );
};
