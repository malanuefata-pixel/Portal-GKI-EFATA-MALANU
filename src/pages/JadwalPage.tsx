import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, ExternalLink, Filter, MapPin, User } from 'lucide-react';
import { ScheduleCategory, ScheduleItem, UnsurType } from '../types';
import { getKspsBySektor, getSektorsByRayon, WILAYAH_HIERARCHY } from '../data/wilayah';

interface JadwalPageProps {
  schedules: ScheduleItem[];
}

const CATEGORIES: ('Semua' | ScheduleCategory)[] = [
  'Semua',
  'Ibadah Minggu',
  'Ibadah Unsur',
  'Rayon/Sektor/KSP',
];

const UNSUR_LIST: ('Semua' | UnsurType)[] = ['Semua', 'PKB', 'PW', 'PAM', 'PAR', 'Lansia'];

export const JadwalPage: React.FC<JadwalPageProps> = ({ schedules }) => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ScheduleCategory>('Semua');
  const [selectedUnsur, setSelectedUnsur] = useState<'Semua' | UnsurType>('Semua');
  const [selectedRayon, setSelectedRayon] = useState<string>('Semua');
  const [selectedSektor, setSelectedSektor] = useState<string>('Semua');
  const [selectedKsp, setSelectedKsp] = useState<string>('Semua');

  const availableSektors = useMemo(() => {
    if (selectedRayon === 'Semua') return [];
    return getSektorsByRayon(selectedRayon);
  }, [selectedRayon]);

  const availableKsps = useMemo(() => {
    if (selectedRayon === 'Semua' || selectedSektor === 'Semua') return [];
    return getKspsBySektor(selectedRayon, selectedSektor);
  }, [selectedRayon, selectedSektor]);

  const handleRayonChange = (rayon: string) => {
    setSelectedRayon(rayon);
    setSelectedSektor('Semua');
    setSelectedKsp('Semua');
  };

  const handleSektorChange = (sektor: string) => {
    setSelectedSektor(sektor);
    setSelectedKsp('Semua');
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedUnsur('Semua');
    setSelectedRayon('Semua');
    setSelectedSektor('Semua');
    setSelectedKsp('Semua');
  };

  const filtered = useMemo(() => {
    return schedules.filter((item) => {
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) return false;
      if (selectedCategory === 'Ibadah Unsur' && selectedUnsur !== 'Semua' && item.unsur !== selectedUnsur) {
        return false;
      }
      if (selectedRayon !== 'Semua' && item.rayon !== selectedRayon) return false;
      if (selectedSektor !== 'Semua' && item.sektor !== selectedSektor) return false;
      if (selectedKsp !== 'Semua' && item.ksp !== selectedKsp) return false;
      return true;
    });
  }, [schedules, selectedCategory, selectedUnsur, selectedRayon, selectedSektor, selectedKsp]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
            Jadwal Ibadah & Pelayanan Wilayah
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Ibadah Minggu, Ibadah Unsur, serta Ibadah Rayon I–IV, Sektor, dan KSP Jemaat Efata Malanu.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Menampilkan <strong className="font-mono-num text-[#0F2C59] dark:text-[#E5A93C]">{filtered.length}</strong> jadwal
        </span>
      </div>

      {/* Split-Screen on Desktop: Left Filter Panel (4 cols) | Right Schedule List (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Panel */}
        <aside className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 space-y-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F2C59] dark:text-white">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>Filter Jadwal & Wilayah</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C] hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Kategori Ibadah
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Unsur Filter */}
          {selectedCategory === 'Ibadah Unsur' && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Kategori Unsur Jemaat
              </label>
              <div className="flex flex-wrap gap-1.5">
                {UNSUR_LIST.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSelectedUnsur(u)}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedUnsur === u
                        ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cascading Filter: Rayon -> Sektor -> KSP */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Filter Struktur Wilayah (Rayon → Sektor → KSP)
            </p>

            <div>
              <label htmlFor="filter-rayon" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                1. Pilih Rayon
              </label>
              <select
                id="filter-rayon"
                value={selectedRayon}
                onChange={(e) => handleRayonChange(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="Semua">Semua Rayon (I–IV)</option>
                {WILAYAH_HIERARCHY.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-sektor" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                2. Pilih Sektor
              </label>
              <select
                id="filter-sektor"
                value={selectedSektor}
                disabled={selectedRayon === 'Semua'}
                onChange={(e) => handleSektorChange(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="Semua">
                  {selectedRayon === 'Semua' ? 'Pilih Rayon terlebih dahulu' : 'Semua Sektor'}
                </option>
                {availableSektors.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-ksp" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                3. Pilih KSP
              </label>
              <select
                id="filter-ksp"
                value={selectedKsp}
                disabled={selectedSektor === 'Semua'}
                onChange={(e) => setSelectedKsp(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="Semua">
                  {selectedSektor === 'Semua' ? 'Pilih Sektor terlebih dahulu' : 'Semua KSP'}
                </option>
                {availableKsps.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Right Panel: Schedule Cards */}
        <div className="lg:col-span-8 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Belum ada jadwal ibadah untuk filter wilayah yang dipilih.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 min-h-[40px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
              >
                Tampilkan Semua Jadwal
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const wilayahText = [item.rayon, item.sektor, item.ksp].filter(Boolean).join(' · ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                item.mapsQuery || `${item.address} Sorong`
              )}`;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
                        {item.category}
                        {item.unsur ? ` (${item.unsur})` : ''}
                      </span>
                      {wilayahText && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{wilayahText}</span>
                        </>
                      )}
                    </div>

                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>{item.dateLabel}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className="font-medium">{item.timeWit}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Pelayan: {item.pelayanFirman}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.hostFamily}
                          </strong>
                          {' — '}
                          {item.address}
                        </span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F2C59]/8 hover:bg-[#0F2C59] text-[#0F2C59] hover:text-white dark:bg-[#D4AF37]/15 dark:hover:bg-[#D4AF37] dark:text-[#E5A93C] dark:hover:text-[#0B1120] text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Petunjuk Arah (Google Maps)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
