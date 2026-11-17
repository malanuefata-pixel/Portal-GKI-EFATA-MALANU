import React, { useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  Church,
  HeartHandshake,
  Music,
  Newspaper,
  Quote,
  ScrollText,
  Wallet,
  Sparkles,
  Share2,
  Radio,
  CreditCard,
} from 'lucide-react';
import { PageId, PortalState } from '../types';
import { ChurchEmblem } from '../components/ChurchVisuals';

interface HomePageProps {
  state: PortalState;
  onNavigate: (page: PageId) => void;
}

const SHORTCUT_ITEMS: {
  id: PageId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'liturgi', title: 'Tata Ibadah', icon: ScrollText },
  { id: 'jadwal', title: 'Jadwal Ibadah', icon: CalendarDays },
  { id: 'warta', title: 'Warta Jemaat', icon: Newspaper },
  { id: 'kidung', title: 'Kidung Pujian', icon: Music },
  { id: 'alkitab', title: 'Alkitab', icon: BookOpen },
  { id: 'suara', title: 'Warta Suara', icon: Radio },
  { id: 'kuis', title: 'Kuis & Renungan', icon: Sparkles },
  { id: 'keuangan', title: 'Persembahan', icon: CreditCard },
  { id: 'layanan', title: 'Layanan Jemaat', icon: HeartHandshake },
  { id: 'galeri', title: 'Galeri Foto', icon: Camera },
  { id: 'statistik', title: 'Statistik', icon: BarChart3 },
  { id: 'profil', title: 'Profil & Kontak', icon: Church },
];

const DAILY_VERSES = [
  {
    ref: 'Mazmur 121:1–2',
    text: 'Aku melayangkan mataku ke gunung-gunung; dari manakah akan datang pertolonganku? Pertolonganku ialah dari TUHAN, yang menjadikan langit dan bumi.',
  },
  {
    ref: 'Yohanes 3:16',
    text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
  },
  {
    ref: 'Amsal 3:5–6',
    text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.',
  },
  {
    ref: 'Yosua 1:9',
    text: 'Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau ke mana pun engkau pergi.',
  },
  {
    ref: 'Yesaya 40:31',
    text: 'Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.',
  },
  {
    ref: 'Roma 8:28',
    text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
  },
  {
    ref: 'Filipi 4:6–7',
    text: 'Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur. Damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu dalam Kristus Yesus.',
  },
  {
    ref: 'Matius 11:28',
    text: 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.',
  },
  {
    ref: 'Mazmur 23:1–2',
    text: 'TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.',
  },
  {
    ref: '1 Korintus 16:14',
    text: 'Lakukanlah segala pekerjaanmu dalam kasih!',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ state, onNavigate }) => {
  const { profile } = state;

  const todayVerse = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % DAILY_VERSES.length;
    return DAILY_VERSES[index] || DAILY_VERSES[0];
  }, []);

  const handleShare = async () => {
    const text = `✨ AYAT HARI INI — GKI EFATA MALANU\n\n“${todayVerse.text}”\n— ${todayVerse.ref}\n\nMari gunakan Portal Jemaat GKI Efata Malanu (Klasis Sorong). Tuhan Yesus memberkati!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ayat Hari Ini - GKI Efata Malanu',
          text: text,
        });
        return;
      } catch {}
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col justify-center gap-8 py-4 sm:py-8">
      {/* 1. Header Clean 3 Baris: Logo_GKI_Big.png -> GKI EFATA MALANU -> KLASIS SORONG */}
      <header className="flex flex-col items-center justify-center text-center pt-2">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <ChurchEmblem logoUrl={profile.logoDriveUrl || '/Logo_GKI_Big.png'} size="xl" />
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F2C59] dark:text-white text-balance">
          GKI EFATA MALANU
        </h1>

        <p className="mt-2 text-xs sm:text-sm font-semibold tracking-[0.26em] text-[#8F6D14] dark:text-[#E5A93C]">
          KLASIS SORONG
        </p>
      </header>

      {/* Ayat Hari Ini (Daily Verse Card) */}
      <section aria-label="Ayat Hari Ini" className="w-full">
        <div className="relative rounded-2xl bg-white dark:bg-[#1E293B] border border-[#D4AF37]/40 dark:border-[#D4AF37]/30 p-5 sm:p-6 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#0F2C59]/10 dark:bg-[#D4AF37]/20 text-[#0F2C59] dark:text-[#E5A93C] flex items-center justify-center shrink-0 mt-0.5">
              <Quote className="w-5 h-5" />
            </div>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89225] dark:text-[#E5A93C]">
                  Ayat Hari Ini
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono-num">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <blockquote className="font-display italic text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
                “{todayVerse.text}”
              </blockquote>
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                  — {todayVerse.ref} (Terjemahan Baru)
                </p>
                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[36px] px-3.5 rounded-xl bg-[#0F2C59]/10 hover:bg-[#0F2C59]/20 dark:bg-[#D4AF37]/20 dark:hover:bg-[#D4AF37]/30 text-[#0F2C59] dark:text-[#E5A93C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan Ayat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bagian Tengah: 12 Logo Pintasan Cepat */}
      <section aria-label="Pintasan Cepat Portal Jemaat" className="w-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
          {SHORTCUT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="group min-h-[108px] sm:min-h-[120px] p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 hover:border-[#0F2C59]/40 dark:hover:border-[#D4AF37]/60 shadow-xs hover:shadow-sm transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0F2C59]/8 dark:bg-[#D4AF37]/15 text-[#0F2C59] dark:text-[#E5A93C] flex items-center justify-center group-hover:bg-[#0F2C59] group-hover:text-white dark:group-hover:bg-[#D4AF37] dark:group-hover:text-[#0B1120] transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
