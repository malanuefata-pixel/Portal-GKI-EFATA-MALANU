import React, { useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';
import { ChurchProfileData, GalleryItem, PageId } from '../types';
import { ChurchEmblem, GalleryCardMedia } from '../components/ChurchVisuals';

interface ProfilPageProps {
  profile: ChurchProfileData;
  gallery: GalleryItem[];
  onNavigate: (page: PageId) => void;
}

export const ProfilPage: React.FC<ProfilPageProps> = ({
  profile,
  gallery,
  onNavigate,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyAccount = async (id: string, accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    profile.mapsEmbedQuery
  )}&output=embed`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Identity Header */}
      <section className="rounded-2xl bg-[#0F2C59] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ChurchEmblem logoUrl={profile.logoDriveUrl} size="lg" />
          <div>
            <p className="text-xs font-medium text-[#E5A93C]">
              {profile.synodName} · {profile.klasisName}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              Profil & Kontak {profile.churchName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#E5A93C] shrink-0" />
              <span>{profile.address}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span>Login Majelis / Admin</span>
        </button>
      </section>

      {/* Sejarah & Majelis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Sejarah Singkat Jemaat
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {profile.historyParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
              Struktur Majelis Jemaat
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {profile.majelis.map((m) => (
              <div key={m.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.position}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Rekening Persembahan */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="w-5 h-5 text-[#0F2C59] dark:text-[#E5A93C]" />
          <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
            Informasi Rekening Persembahan Jemaat
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
                  {acc.bankName}
                </p>
                <p className="font-mono-num text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {acc.accountNumber}
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                  a.n. {acc.accountHolder}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{acc.purpose}</p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyAccount(acc.id, acc.accountNumber)}
                className="min-h-[42px] px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#0F2C59] dark:hover:border-[#D4AF37] text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedId === acc.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      No. Rekening Disalin
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin No. Rekening</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Galeri Kegiatan Jemaat */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
            Galeri Kegiatan Jemaat
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Dokumentasi Arsip Google Drive Jemaat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((g) => (
            <article
              key={g.id}
              className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <GalleryCardMedia imageUrl={g.imageUrl} title={g.title} category={g.category} />
              <div className="p-4 space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {g.category} · {g.dateLabel}
                </p>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {g.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {g.caption}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Peta Lokasi & Kontak Sekretariat */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
              Lokasi Gedung Gereja & Sekretariat
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{profile.address}</p>

            <div className="pt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-mono-num">+{profile.whatsappSecretariat}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              profile.mapsEmbedQuery
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] text-white text-xs font-semibold flex items-center justify-center transition-colors"
          >
            Buka di Aplikasi Google Maps
          </a>
        </div>

        <div className="lg:col-span-7 min-h-[280px] bg-slate-100 dark:bg-slate-800">
          <iframe
            title="Peta Lokasi Gedung Gereja GKI Efata Malanu"
            src={embedUrl}
            className="w-full h-full min-h-[280px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};
