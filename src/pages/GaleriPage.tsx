import React, { useMemo, useState } from 'react';
import { Camera, Image as ImageIcon, Search } from 'lucide-react';
import { GalleryItem } from '../types';
import { GalleryCardMedia } from '../components/ChurchVisuals';
import { ReadingToolbar } from '../components/ReadingToolbar';

interface GaleriPageProps {
  gallery: GalleryItem[];
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export const GaleriPage: React.FC<GaleriPageProps> = ({
  gallery,
  fontScale,
  onChangeFontScale,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [query, setQuery] = useState('');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set(gallery.map((g) => g.category));
    return ['Semua', ...Array.from(set)];
  }, [gallery]);

  const filteredGallery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gallery.filter((g) => {
      if (selectedCategory !== 'Semua' && g.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.caption.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.dateLabel.toLowerCase().includes(q)
      );
    });
  }, [gallery, selectedCategory, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
            Galeri & Dokumentasi Kegiatan Jemaat
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Arsip foto dan dokumentasi kegiatan pelayanan, ibadah kategorial, serta perayaan hari besar gerejawi GKI Efata Malanu.
          </p>
        </div>
      </div>

      <ReadingToolbar
        fontScale={fontScale}
        onChangeScale={onChangeFontScale}
        title="Ukuran Teks Keterangan"
      />

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari dokumentasi kegiatan..."
            className="w-full min-h-[42px] pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

      {/* Gallery Grid */}
      {filteredGallery.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Tidak ada foto galeri ditemukan untuk pencarian “{query}”.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((g) => (
            <article
              key={g.id}
              onClick={() => setActiveImage(g)}
              className="group rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="overflow-hidden">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <GalleryCardMedia imageUrl={g.imageUrl} title={g.title} category={g.category} />
                </div>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#0F2C59] dark:text-[#E5A93C] uppercase tracking-wider">
                      {g.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-num">{g.dateLabel}</span>
                  </div>
                  <h3 className="reading-scaled-title font-display font-bold text-slate-900 dark:text-white">
                    {g.title}
                  </h3>
                </div>
                <p className="reading-scaled text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {g.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C] uppercase tracking-wider">
                {activeImage.category} · {activeImage.dateLabel}
              </span>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-900 max-h-[60vh] flex items-center justify-center">
              <GalleryCardMedia
                imageUrl={activeImage.imageUrl}
                title={activeImage.title}
                category={activeImage.category}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {activeImage.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
