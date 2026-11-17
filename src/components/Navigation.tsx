import React, { useEffect, useState } from 'react';
import {
  Info,
  LogOut,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Settings,
  Sun,
  WifiOff,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface TopHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export interface FooterActionProps {
  onOpenAbout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onExit: () => void;
  klasisName?: string;
}

const FONT_SCALES = [1, 1.15, 1.3, 1.5];

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const TopNavigation: React.FC<TopHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  fontScale,
  onChangeFontScale,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const idx = FONT_SCALES.indexOf(fontScale);
  const currentIdx = idx >= 0 ? idx : 0;

  const handleDecreaseFont = () => {
    if (currentIdx > 0) onChangeFontScale(FONT_SCALES[currentIdx - 1]);
  };

  const handleIncreaseFont = () => {
    if (currentIdx < FONT_SCALES.length - 1) onChangeFontScale(FONT_SCALES[currentIdx + 1]);
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1280px] mx-auto h-full px-4 lg:px-6 flex items-center justify-between gap-3">
        {/* Kiri: Hari, Tanggal, Bulan dan Tahun */}
        <time
          dateTime={now.toISOString().slice(0, 10)}
          className="text-xs sm:text-sm font-semibold text-[#0F2C59] dark:text-[#F1F5F9] truncate"
        >
          {formatIndonesianDate(now)}
        </time>

        {/* Kanan: Tombol Perbesar/Perkecil Huruf & Mode Terang/Gelap */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/70 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={handleDecreaseFont}
              disabled={currentIdx === 0}
              title="Perkecil ukuran huruf"
              aria-label="Perkecil ukuran huruf"
              className="min-h-[38px] px-2.5 flex items-center justify-center gap-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <Minus className="w-3 h-3" />
              <span>A</span>
            </button>

            <span className="px-1.5 font-mono-num text-[11px] font-semibold text-[#0F2C59] dark:text-[#E5A93C] border-x border-slate-200 dark:border-slate-700 select-none">
              {Math.round(fontScale * 100)}%
            </span>

            <button
              type="button"
              onClick={handleIncreaseFont}
              disabled={currentIdx === FONT_SCALES.length - 1}
              title="Perbesar ukuran huruf"
              aria-label="Perbesar ukuran huruf"
              className="min-h-[38px] px-2.5 flex items-center justify-center gap-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3 h-3" />
              <span>A</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            aria-label={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#E5A93C]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0F2C59]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomNavigation: React.FC<FooterActionProps> = ({
  onOpenAbout,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  onExit,
}) => {
  return (
    <nav
      aria-label="Pintasan Footer"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
    >
      <div className="grid grid-cols-4 h-16 items-center">
        <button
          type="button"
          onClick={onOpenAbout}
          className="min-h-[48px] px-1 flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] transition-colors cursor-pointer"
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
            Tentang aplikasi
          </span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="min-h-[48px] px-1 flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
            Refresh
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="min-h-[48px] px-1 flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
            Pengaturan
          </span>
        </button>

        <button
          type="button"
          onClick={onExit}
          className="min-h-[48px] px-1 flex flex-col items-center justify-center gap-1 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-none whitespace-nowrap">
            Exit
          </span>
        </button>
      </div>
    </nav>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/70 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>Mode Offline Gereja Aktif — Menampilkan data tersimpan di perangkat Anda.</span>
      </div>
    </div>
  );
};

export const FooterBar: React.FC<FooterActionProps> = ({
  onOpenAbout,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  onExit,
  klasisName,
}) => {
  return (
    <footer className="hidden lg:block mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] py-5 px-6">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gereja Kristen Injili di Tanah Papua · <strong className="text-slate-700 dark:text-slate-200">GKI Efata Malanu</strong> · {klasisName}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAbout}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Info className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Tentang aplikasi</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <span>Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
