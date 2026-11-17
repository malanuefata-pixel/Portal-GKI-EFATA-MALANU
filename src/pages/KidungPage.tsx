import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Download,
  FileText,
  HardDriveDownload,
  Music,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Hymn, HymnBook } from '../types';
import { ReadingToolbar } from '../components/ReadingToolbar';
import { exportHymnsToFile, getHymnBookStats } from '../services/hymnStorage';

interface KidungPageProps {
  hymns: Hymn[];
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
  offlineStatus?: 'checking' | 'loading' | 'ready' | 'error';
  cachedAt?: string | null;
  onSyncOffline?: () => void;
}

const BOOKS: ('Semua' | HymnBook)[] = ['Semua', 'NR', 'KJ', 'PKJ', 'NKB', 'DSL'];

const BOOK_FULL_NAMES: Record<HymnBook, string> = {
  NR: 'Mazmur & Nyanyian Rohani',
  KJ: 'Kidung Jemaat',
  PKJ: 'Pelengkap Kidung Jemaat',
  NKB: 'Nyanyian Kidung Baru',
  DSL: 'Dua Sahabat Lama',
};

export const KidungPage: React.FC<KidungPageProps> = ({
  hymns,
  fontScale,
  onChangeFontScale,
  offlineStatus = 'ready',
  cachedAt = null,
  onSyncOffline,
}) => {
  const [selectedBook, setSelectedBook] = useState<'Semua' | HymnBook>('Semua');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(hymns[0]?.id || '');
  const [exportNote, setExportNote] = useState('');
  const [copiedHymn, setCopiedHymn] = useState(false);

  const stats = useMemo(() => getHymnBookStats(hymns), [hymns]);
  const isFullLoaded = stats.total >= 1000;

  const filteredHymns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hymns.filter((h) => {
      if (selectedBook !== 'Semua' && h.book !== selectedBook) return false;
      if (!q) return true;
      const inHeader =
        `${h.book} ${h.number}`.toLowerCase().includes(q) ||
        `${h.book}${h.number}`.toLowerCase().includes(q) ||
        String(h.number) === q ||
        h.title.toLowerCase().includes(q);
      const inLyrics =
        h.verses.some((v) => v.lines.some((l) => l.toLowerCase().includes(q))) ||
        (h.refrain?.some((l) => l.toLowerCase().includes(q)) ?? false);
      return inHeader || inLyrics;
    });
  }, [hymns, selectedBook, query]);

  const activeHymn = useMemo(() => {
    return filteredHymns.find((h) => h.id === activeId) || filteredHymns[0] || null;
  }, [filteredHymns, activeId]);

  const activeIndex = useMemo(() => {
    if (!activeHymn) return -1;
    return filteredHymns.findIndex((h) => h.id === activeHymn.id);
  }, [filteredHymns, activeHymn]);

  const handleStepHymn = (delta: number) => {
    if (activeIndex < 0) return;
    const next = filteredHymns[activeIndex + delta];
    if (next) {
      setActiveId(next.id);
    }
  };

  const handleExport = (scope: 'ALL' | HymnBook, format: 'txt' | 'json') => {
    exportHymnsToFile(hymns, scope, format);
    const label =
      scope === 'ALL'
        ? 'Semua 5 Buku Kidung Pujian'
        : `${BOOK_FULL_NAMES[scope]} (${scope})`;
    setExportNote(`Berhasil mengunduh ${label} (${format.toUpperCase()}) ke perangkat Anda.`);
    setTimeout(() => setExportNote(''), 3500);
  };

  const handleCopyHymn = async () => {
    if (!activeHymn) return;
    const parts: string[] = [
      `${activeHymn.book} No. ${activeHymn.number} — ${activeHymn.title} (${BOOK_FULL_NAMES[activeHymn.book]})`,
      activeHymn.tempoOrTone ? activeHymn.tempoOrTone : '',
      '',
      ...activeHymn.verses.flatMap((v) => [`Bait ${v.number}`, ...v.lines, '']),
      ...(activeHymn.refrain ? ['Refrein:', ...activeHymn.refrain] : []),
    ];
    try {
      await navigator.clipboard.writeText(parts.filter((p) => p !== undefined).join('\n'));
      setCopiedHymn(true);
      setTimeout(() => setCopiedHymn(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
            Kidung Pujian Jemaat Lengkap
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Koleksi offline lengkap 5 buku nyanyian jemaat: Mazmur & Nyanyian Rohani (NR), Kidung Jemaat (KJ), Pelengkap Kidung Jemaat (PKJ), Nyanyikanlah Kidung Baru (NKB), dan Dua Sahabat Lama (DSL).
          </p>
        </div>
      </div>

      {/* Offline Sync & Download Kidung Pujian Card */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2C59]/10 dark:bg-[#D4AF37]/15 text-[#0F2C59] dark:text-[#E5A93C] flex items-center justify-center shrink-0">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                  Paket Kidung Pujian Lengkap (5 Buku Nyanyian)
                </h2>
                {offlineStatus === 'ready' && isFullLoaded ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Tersedia Offline
                  </span>
                ) : offlineStatus === 'loading' || offlineStatus === 'checking' ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Mengunduh ke Cache Offline...
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-mono-num">
                Total {stats.total.toLocaleString('id-ID')} Lagu — NR ({stats.counts.NR}) · KJ (
                {stats.counts.KJ}) · PKJ ({stats.counts.PKJ}) · NKB ({stats.counts.NKB}) · DSL (
                {stats.counts.DSL})
                {cachedAt ? ` · Tersimpan ${cachedAt}` : ''}
              </p>
            </div>
          </div>

          {onSyncOffline && (
            <button
              type="button"
              disabled={offlineStatus === 'loading'}
              onClick={onSyncOffline}
              className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C] ${
                  offlineStatus === 'loading' ? 'animate-spin' : ''
                }`}
              />
              <span>
                {offlineStatus === 'loading' ? 'Mengunduh...' : 'Sinkron Offline 5 Buku'}
              </span>
            </button>
          )}
        </div>

        {exportNote && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{exportNote}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Unduh Berkas ke Perangkat:
          </span>

          <button
            type="button"
            onClick={() => handleExport('ALL', 'txt')}
            className="min-h-[38px] px-3 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Semua 5 Buku (.TXT)</span>
          </button>

          {(['NR', 'KJ', 'PKJ', 'NKB', 'DSL'] as HymnBook[]).map((book) => (
            <button
              key={book}
              type="button"
              disabled={stats.counts[book] === 0}
              onClick={() => handleExport(book, 'txt')}
              className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
              <span>
                {book} ({stats.counts[book]}) .TXT
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleExport('ALL', 'json')}
            className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Database Lengkap (.JSON)</span>
          </button>
        </div>
      </section>

      <ReadingToolbar
        fontScale={fontScale}
        onChangeScale={onChangeFontScale}
        title="Ukuran Teks Lirik Kidung"
      />

      {/* Split-Screen on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Search & Hymn List */}
        <aside className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor (cth: KJ 242) atau lirik..."
              className="w-full min-h-[44px] pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Book Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {BOOKS.map((book) => {
              const count = book === 'Semua' ? stats.total : stats.counts[book];
              return (
                <button
                  key={book}
                  type="button"
                  onClick={() => setSelectedBook(book)}
                  className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedBook === book
                      ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {book} ({count})
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            Daftar Lagu ({filteredHymns.length})
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[440px] overflow-y-auto pr-1">
            {filteredHymns.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Lagu tidak ditemukan untuk pencarian “{query}”.
              </p>
            ) : (
              filteredHymns.slice(0, 500).map((h) => {
                const selected = activeHymn?.id === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveId(h.id)}
                    className={`w-full min-h-[52px] py-3 px-3 text-left flex items-center justify-between gap-3 rounded-xl transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#0F2C59]/8 dark:bg-[#D4AF37]/15 text-[#0F2C59] dark:text-[#E5A93C]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono-num font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                        {h.book} No. {h.number}
                      </p>
                      <p className="text-sm font-semibold truncate">{h.title}</p>
                    </div>
                    <Music className="w-4 h-4 shrink-0 opacity-60" />
                  </button>
                );
              })
            )}
            {filteredHymns.length > 500 && (
              <p className="py-3 px-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Menampilkan 500 lagu pertama. Gunakan pencarian atau filter buku untuk langsung ke nomor lagu tertentu.
              </p>
            )}
          </div>
        </aside>

        {/* Right Panel: Hymn Lyrics Reader */}
        <section className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          {activeHymn ? (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
                    {BOOK_FULL_NAMES[activeHymn.book]} ({activeHymn.book}) · Nomor{' '}
                    <span className="font-mono-num">{activeHymn.number}</span>
                  </p>
                  <h2 className="reading-scaled-title font-display font-bold text-slate-900 dark:text-white mt-1">
                    {activeHymn.number}. {activeHymn.title}
                  </h2>
                  {activeHymn.tempoOrTone && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeHymn.tempoOrTone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyHymn}
                    className="min-h-[38px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedHymn ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Lirik</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {activeHymn.verses.map((v) => (
                  <div key={v.number} className="reading-scaled space-y-1.5">
                    <p className="text-xs font-mono-num font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                      Bait {v.number}
                    </p>
                    {v.lines.map((line, idx) => (
                      <p key={idx} className="text-slate-800 dark:text-slate-100">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}

                {activeHymn.refrain && (
                  <div className="reading-scaled pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1.5">
                    <p className="text-xs font-mono-num font-bold text-[#D4AF37]">Refrein</p>
                    {activeHymn.refrain.map((line, idx) => (
                      <p key={idx} className="italic font-medium text-slate-800 dark:text-slate-100">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={activeIndex <= 0}
                  onClick={() => handleStepHymn(-1)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Lagu Sebelumnya</span>
                </button>
                <button
                  type="button"
                  disabled={activeIndex < 0 || activeIndex >= filteredHymns.length - 1}
                  onClick={() => handleStepHymn(1)}
                  className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>Lagu Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pilih kidung pujian dari daftar untuk membaca lirik lengkap.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
