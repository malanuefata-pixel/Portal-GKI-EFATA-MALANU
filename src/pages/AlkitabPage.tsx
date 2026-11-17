import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Download,
  FileText,
  HardDriveDownload,
  RefreshCw,
  Search,
} from 'lucide-react';
import { BibleBook } from '../types';
import { ReadingToolbar } from '../components/ReadingToolbar';
import {
  downloadAndCacheFullBible,
  exportBibleToFile,
  getBibleStats,
  loadCachedFullBible,
} from '../services/bibleStorage';

interface AlkitabPageProps {
  books: BibleBook[];
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

interface GlobalVerseHit {
  bookId: string;
  bookName: string;
  testament: 'PL' | 'PB';
  chapter: number;
  verse: number;
  text: string;
}

export const AlkitabPage: React.FC<AlkitabPageProps> = ({
  books: initialBooks,
  fontScale,
  onChangeFontScale,
}) => {
  const [fullBooks, setFullBooks] = useState<BibleBook[]>(initialBooks);
  const [offlineStatus, setOfflineStatus] = useState<'checking' | 'loading' | 'ready' | 'error'>(
    'checking'
  );
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string>('');
  const [exportNote, setExportNote] = useState<string>('');

  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'PL' | 'PB'>('ALL');
  const [bookQuery, setBookQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('mazmur');
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(121);
  const [verseSearch, setVerseSearch] = useState('');
  const [searchScope, setSearchScope] = useState<'chapter' | 'all'>('chapter');
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);

  const syncOfflineBible = useCallback(async (forceDownload = false) => {
    setDownloadError('');
    try {
      if (!forceDownload) {
        const cached = await loadCachedFullBible();
        if (cached.pl.length === 39 && cached.pb.length === 27) {
          setFullBooks([...cached.pl, ...cached.pb]);
          setCachedAt(cached.cachedAt);
          setOfflineStatus('ready');
          return;
        }
      }

      setOfflineStatus('loading');
      const downloaded = await downloadAndCacheFullBible('ALL');
      setFullBooks([...downloaded.pl, ...downloaded.pb]);
      setCachedAt(downloaded.cachedAt);
      setOfflineStatus('ready');
    } catch (err) {
      setOfflineStatus('error');
      setDownloadError(
        err instanceof Error ? err.message : 'Gagal memuat data Alkitab lengkap offline.'
      );
    }
  }, []);

  useEffect(() => {
    syncOfflineBible(false);
  }, [syncOfflineBible]);

  const stats = useMemo(() => getBibleStats(fullBooks), [fullBooks]);
  const isCompleteBible = stats.plCount === 39 && stats.pbCount === 27;

  const visibleBooks = useMemo(() => {
    const q = bookQuery.trim().toLowerCase();
    return fullBooks.filter((b) => {
      if (testamentFilter !== 'ALL' && b.testament !== testamentFilter) return false;
      if (q && !b.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [fullBooks, testamentFilter, bookQuery]);

  const activeBook = useMemo(() => {
    return (
      fullBooks.find((b) => b.id === selectedBookId) ||
      visibleBooks[0] ||
      fullBooks[0]
    );
  }, [fullBooks, visibleBooks, selectedBookId]);

  const activeChapter = useMemo(() => {
    if (!activeBook) return null;
    return (
      activeBook.chapters.find((c) => c.chapter === selectedChapterNum) ||
      activeBook.chapters[0] ||
      null
    );
  }, [activeBook, selectedChapterNum]);

  const activeChapterIndex = useMemo(() => {
    if (!activeBook || !activeChapter) return -1;
    return activeBook.chapters.findIndex((c) => c.chapter === activeChapter.chapter);
  }, [activeBook, activeChapter]);

  const displayedVerses = useMemo(() => {
    if (!activeChapter) return [];
    const q = verseSearch.trim().toLowerCase();
    if (!q || searchScope === 'all') return activeChapter.verses;
    return activeChapter.verses.filter(
      (v) => v.text.toLowerCase().includes(q) || String(v.verse) === q
    );
  }, [activeChapter, verseSearch, searchScope]);

  const globalSearchHits = useMemo<GlobalVerseHit[]>(() => {
    if (searchScope !== 'all') return [];
    const q = verseSearch.trim().toLowerCase();
    if (q.length < 3) return [];

    const hits: GlobalVerseHit[] = [];
    for (const book of fullBooks) {
      if (testamentFilter !== 'ALL' && book.testament !== testamentFilter) continue;
      for (const ch of book.chapters) {
        for (const v of ch.verses) {
          if (v.text.toLowerCase().includes(q)) {
            hits.push({
              bookId: book.id,
              bookName: book.name,
              testament: book.testament,
              chapter: ch.chapter,
              verse: v.verse,
              text: v.text,
            });
            if (hits.length >= 60) return hits;
          }
        }
      }
    }
    return hits;
  }, [fullBooks, verseSearch, searchScope, testamentFilter]);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBookId(book.id);
    setSelectedChapterNum(book.chapters[0]?.chapter || 1);
    if (searchScope === 'chapter') {
      setVerseSearch('');
    }
  };

  const handleStepChapter = (delta: number) => {
    if (!activeBook || activeChapterIndex < 0) return;
    const nextIdx = activeChapterIndex + delta;
    if (nextIdx >= 0 && nextIdx < activeBook.chapters.length) {
      setSelectedChapterNum(activeBook.chapters[nextIdx].chapter);
      return;
    }

    const currentBookIdx = fullBooks.findIndex((b) => b.id === activeBook.id);
    if (currentBookIdx < 0) return;
    const targetBook = fullBooks[currentBookIdx + (delta > 0 ? 1 : -1)];
    if (!targetBook || targetBook.chapters.length === 0) return;

    setSelectedBookId(targetBook.id);
    setSelectedChapterNum(
      delta > 0
        ? targetBook.chapters[0].chapter
        : targetBook.chapters[targetBook.chapters.length - 1].chapter
    );
  };

  const handleCopyVerse = async (verseNum: number, text: string) => {
    if (!activeBook || !activeChapter) return;
    const formatted = `${activeBook.name} ${activeChapter.chapter}:${verseNum} — "${text}" (TB)`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedVerse(verseNum);
      setTimeout(() => setCopiedVerse(null), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleExport = (scope: 'ALL' | 'PL' | 'PB', format: 'txt' | 'json') => {
    exportBibleToFile(fullBooks, scope, format);
    const label =
      scope === 'ALL'
        ? 'Alkitab Lengkap (PL + PB)'
        : scope === 'PL'
          ? 'Perjanjian Lama (39 Kitab)'
          : 'Perjanjian Baru (27 Kitab)';
    setExportNote(`Berhasil mengunduh ${label} (${format.toUpperCase()}) ke perangkat Anda.`);
    setTimeout(() => setExportNote(''), 3500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
          Alkitab Digital Lengkap (Terjemahan Baru)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          66 Kitab lengkap — Perjanjian Lama (39 Kitab) & Perjanjian Baru (27 Kitab) tersimpan offline dan dapat diunduh ke perangkat.
        </p>
      </div>

      {/* Offline Sync & Download Alkitab Lengkap Card */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2C59]/10 dark:bg-[#D4AF37]/15 text-[#0F2C59] dark:text-[#E5A93C] flex items-center justify-center shrink-0">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                  Paket Alkitab Lengkap (PL & PB)
                </h2>
                {offlineStatus === 'ready' && isCompleteBible ? (
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
                {stats.plCount} Kitab PL · {stats.pbCount} Kitab PB ·{' '}
                {stats.chapterCount.toLocaleString('id-ID')} Pasal ·{' '}
                {stats.verseCount.toLocaleString('id-ID')} Ayat
                {cachedAt ? ` · Tersimpan ${cachedAt}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={offlineStatus === 'loading'}
            onClick={() => syncOfflineBible(true)}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C] ${
                offlineStatus === 'loading' ? 'animate-spin' : ''
              }`}
            />
            <span>{offlineStatus === 'loading' ? 'Mengunduh...' : 'Sinkron Offline 66 Kitab'}</span>
          </button>
        </div>

        {downloadError && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            {downloadError}
          </div>
        )}

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
            disabled={!isCompleteBible}
            onClick={() => handleExport('ALL', 'txt')}
            className="min-h-[38px] px-3 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Alkitab Lengkap PL+PB (.TXT)</span>
          </button>

          <button
            type="button"
            disabled={stats.plCount < 39}
            onClick={() => handleExport('PL', 'txt')}
            className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Perjanjian Lama (.TXT)</span>
          </button>

          <button
            type="button"
            disabled={stats.pbCount < 27}
            onClick={() => handleExport('PB', 'txt')}
            className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Perjanjian Baru (.TXT)</span>
          </button>

          <button
            type="button"
            disabled={!isCompleteBible}
            onClick={() => handleExport('ALL', 'json')}
            className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Database Lengkap (.JSON)</span>
          </button>
        </div>
      </section>

      <ReadingToolbar
        fontScale={fontScale}
        onChangeScale={onChangeFontScale}
        title="Ukuran Teks Alkitab"
      />

      {/* Split-Screen on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Book & Chapter Picker */}
        <aside className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#0B1120] rounded-xl">
            {(
              [
                { id: 'ALL', label: `Semua (${stats.totalBooks})` },
                { id: 'PL', label: `PL (${stats.plCount})` },
                { id: 'PB', label: `PB (${stats.pbCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTestamentFilter(tab.id)}
                className={`min-h-[36px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  testamentFilter === tab.id
                    ? 'bg-white dark:bg-[#1E293B] text-[#0F2C59] dark:text-[#E5A93C] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                placeholder="Cari nama kitab (mis. Kejadian, Yohanes)..."
                className="w-full min-h-[38px] pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              Pilih Kitab ({visibleBooks.length})
            </p>
            <div className="max-h-[260px] lg:max-h-[320px] overflow-y-auto pr-1 grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {visibleBooks.map((book) => {
                const isSelected = activeBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-left flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] font-semibold'
                        : 'bg-slate-50 dark:bg-[#0B1120]/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate pr-2">{book.name}</span>
                    <span className="text-[11px] opacity-75 shrink-0 font-mono-num">
                      {book.testament} · {book.chapters.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeBook && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pilih Pasal — {activeBook.name} ({activeBook.chapters.length} Pasal)
              </p>
              <div className="max-h-[210px] overflow-y-auto pr-1 flex flex-wrap gap-1.5">
                {activeBook.chapters.map((ch) => (
                  <button
                    key={ch.chapter}
                    type="button"
                    onClick={() => setSelectedChapterNum(ch.chapter)}
                    className={`min-h-[38px] min-w-[42px] px-2.5 rounded-xl font-mono-num text-xs font-bold transition-colors cursor-pointer ${
                      activeChapter?.chapter === ch.chapter
                        ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ch.chapter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Panel: Chapter Verses Reader */}
        <section className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 sm:p-8 space-y-5">
          {activeBook && activeChapter ? (
            <>
              <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    <div>
                      <h2 className="reading-scaled-title font-display font-bold text-[#0F2C59] dark:text-white">
                        {activeBook.name} Pasal {activeChapter.chapter}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeBook.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'} ·{' '}
                        {activeChapter.verses.length} Ayat (TB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepChapter(-1)}
                      aria-label="Pasal sebelumnya"
                      className="min-h-[38px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepChapter(1)}
                      aria-label="Pasal berikutnya"
                      className="min-h-[38px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verse Search + Scope Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={verseSearch}
                      onChange={(e) => setVerseSearch(e.target.value)}
                      placeholder={
                        searchScope === 'all'
                          ? 'Cari kata kunci di seluruh 66 kitab (min. 3 huruf)...'
                          : 'Cari ayat atau kata dalam pasal ini...'
                      }
                      className="w-full min-h-[38px] pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#0B1120] rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => setSearchScope('chapter')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                        searchScope === 'chapter'
                          ? 'bg-white dark:bg-[#1E293B] text-[#0F2C59] dark:text-[#E5A93C] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Pasal Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchScope('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                        searchScope === 'all'
                          ? 'bg-white dark:bg-[#1E293B] text-[#0F2C59] dark:text-[#E5A93C] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Seluruh Alkitab
                    </button>
                  </div>
                </div>
              </div>

              {searchScope === 'all' && verseSearch.trim().length >= 3 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Hasil pencarian "{verseSearch.trim()}" ({globalSearchHits.length} ayat
                    {globalSearchHits.length === 60 ? '+' : ''})
                  </p>
                  {globalSearchHits.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">
                      Tidak ditemukan ayat yang cocok dengan kata kunci tersebut.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {globalSearchHits.map((hit) => (
                        <button
                          key={`${hit.bookId}-${hit.chapter}-${hit.verse}`}
                          type="button"
                          onClick={() => {
                            setSelectedBookId(hit.bookId);
                            setSelectedChapterNum(hit.chapter);
                            setSearchScope('chapter');
                            setVerseSearch('');
                          }}
                          className="w-full text-left rounded-xl bg-slate-50 dark:bg-[#0B1120]/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                              {hit.bookName} {hit.chapter}:{hit.verse}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {hit.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            {hit.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedVerses.map((v) => (
                      <div
                        key={v.verse}
                        className="group flex items-start justify-between gap-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 transition-colors"
                      >
                        <p className="reading-scaled-lg text-slate-800 dark:text-slate-100">
                          <sup className="font-mono-num font-bold text-[#0F2C59] dark:text-[#E5A93C] mr-1.5 text-xs">
                            {v.verse}
                          </sup>
                          {v.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyVerse(v.verse, v.text)}
                          title="Salin ayat"
                          aria-label={`Salin ayat ${v.verse}`}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] shrink-0 cursor-pointer"
                        >
                          {copiedVerse === v.verse ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Chapter Navigation */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleStepChapter(-1)}
                      className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Pasal Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepChapter(1)}
                      className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Pasal Berikutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Pilih kitab dan pasal untuk membaca.</p>
          )}
        </section>
      </div>
    </div>
  );
};
