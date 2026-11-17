import React from 'react';
import { Cake, Download, FileText, HeartPulse, Megaphone } from 'lucide-react';
import { WartaData } from '../types';
import { ReadingToolbar } from '../components/ReadingToolbar';

interface WartaPageProps {
  warta: WartaData;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export const WartaPage: React.FC<WartaPageProps> = ({
  warta,
  fontScale,
  onChangeFontScale,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Warta */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
            Warta Jemaat Mingguan · {warta.publishDate}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 text-balance">
            {warta.editionTitle}
          </h1>
        </div>

        {/* Conditional PDF Download button controlled by Admin */}
        {warta.allowPdfDownload && warta.pdfDriveUrl && (
          <a
            href={warta.pdfDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF Warta</span>
          </a>
        )}
      </div>

      <ReadingToolbar
        fontScale={fontScale}
        onChangeScale={onChangeFontScale}
        title="Ukuran Teks Warta Jemaat"
      />

      {/* Pengumuman Mingguan */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Megaphone className="w-5 h-5 text-[#0F2C59] dark:text-[#E5A93C]" />
          <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
            Pengumuman & Agenda Gereja
          </h2>
        </div>

        {warta.announcements.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Belum ada pengumuman untuk edisi minggu ini.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {warta.announcements.map((item) => (
              <article key={item.id} className="py-4 first:pt-1 last:pb-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
                    {item.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.dateLabel}</span>
                </div>
                <h3 className="reading-scaled-title font-display font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="reading-scaled text-slate-700 dark:text-slate-200">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Two-Column Grid: HUT & Doa Sakit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HUT Kelahiran & Pernikahan */}
        <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Cake className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              Ucapan Syukur HUT Jemaat
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {warta.birthdays.map((b) => (
              <div key={b.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="reading-scaled font-semibold text-slate-900 dark:text-white">
                    {b.name}
                  </p>
                  <span className="text-xs font-mono-num font-semibold text-[#0F2C59] dark:text-[#E5A93C] shrink-0">
                    {b.dateLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {b.type} · {b.wilayah}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dukungan Doa Sakit & Duka */}
        <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              Dukungan Doa Jemaat Sakit & Pemulihan
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {warta.prayerSupports.map((p) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="reading-scaled font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </p>
                  <span className="text-xs font-medium text-rose-700 dark:text-rose-300 shrink-0">
                    {p.category}
                  </span>
                </div>
                <p className="reading-scaled text-sm text-slate-600 dark:text-slate-300">
                  {p.locationOrNote}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{p.wilayah}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {!warta.allowPdfDownload && (
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/70 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4 shrink-0" />
          <span>Unduhan PDF Warta Jemaat minggu ini sedang dinonaktifkan oleh Sekretaris/Admin.</span>
        </div>
      )}
    </div>
  );
};
