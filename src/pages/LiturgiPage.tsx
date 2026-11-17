import React from 'react';
import { BookOpen, Music, Printer, UserCheck } from 'lucide-react';
import { Hymn, LiturgyData } from '../types';
import { ReadingToolbar } from '../components/ReadingToolbar';

interface LiturgiPageProps {
  liturgy: LiturgyData;
  hymns: Hymn[];
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export const LiturgiPage: React.FC<LiturgiPageProps> = ({
  liturgy,
  hymns,
  fontScale,
  onChangeFontScale,
}) => {
  const findHymn = (book?: string, num?: number): Hymn | undefined => {
    if (!book || !num) return undefined;
    return hymns.find((h) => h.book === book && h.number === num);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Liturgi */}
      <div className="rounded-2xl bg-[#0F2C59] text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#E5A93C] font-medium">
          <span>{liturgy.sundayDate}</span>
          <span>{liturgy.liturgicalColor}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-balance">
          {liturgy.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-200">
          Tema Khotbah: <strong className="text-white">“{liturgy.theme}”</strong>
        </p>

        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Pelayan: {liturgy.pelayanFirman}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Bacaan: {liturgy.pembacaanAlkitab}</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <span>Liturgos: {liturgy.liturgos}</span>
          </div>
        </div>
      </div>

      {/* Reading Toolbar + Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <ReadingToolbar
            fontScale={fontScale}
            onChangeScale={onChangeFontScale}
            title="Ukuran Teks Tata Ibadah"
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 shrink-0 cursor-pointer print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Liturgi</span>
        </button>
      </div>

      {/* Single-page Scroll Liturgical Flow */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
        {liturgy.steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            const matchedHymn = findHymn(step.hymnBook, step.hymnNumber);
            const versesToRender = matchedHymn
              ? step.selectedVerseNumbers && step.selectedVerseNumbers.length > 0
                ? matchedHymn.verses.filter((v) => step.selectedVerseNumbers?.includes(v.number))
                : matchedHymn.verses
              : [];

            return (
              <article key={step.id} className="p-5 sm:p-7 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="reading-scaled-title font-display font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                    {String(step.order).padStart(2, '0')}. {step.title}
                  </h2>
                  {step.instruction && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                      {step.instruction}
                    </span>
                  )}
                </div>

                {step.content && (
                  <div className="reading-scaled text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {step.content}
                  </div>
                )}

                {/* Integrated Hymn Lyrics directly under the hymn title */}
                {step.hymnBook && step.hymnNumber && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/70 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#0F2C59] dark:text-[#E5A93C] font-semibold">
                        <Music className="w-4 h-4 shrink-0" />
                        <span className="reading-scaled">
                          {step.hymnVersesLabel || `${step.hymnBook} No. ${step.hymnNumber}`}
                          {matchedHymn ? ` — “${matchedHymn.title}”` : ''}
                        </span>
                      </div>
                      {matchedHymn?.tempoOrTone && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {matchedHymn.tempoOrTone}
                        </span>
                      )}
                    </div>

                    {matchedHymn ? (
                      <div className="space-y-4 pl-2 sm:pl-4">
                        {versesToRender.map((verse) => (
                          <div key={verse.number} className="reading-scaled space-y-1">
                            <p className="text-xs font-mono-num font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                              Bait {verse.number}
                            </p>
                            {verse.lines.map((line, i) => (
                              <p key={i} className="text-slate-800 dark:text-slate-100">
                                {line}
                              </p>
                            ))}
                          </div>
                        ))}
                        {matchedHymn.refrain && (
                          <div className="reading-scaled pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-mono-num font-bold text-[#D4AF37]">
                              Refrein
                            </p>
                            {matchedHymn.refrain.map((line, i) => (
                              <p
                                key={i}
                                className="italic font-medium text-slate-800 dark:text-slate-100"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        Lirik {step.hymnBook} No. {step.hymnNumber} mengikuti buku nyanyian jemaat.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </div>
  );
};
