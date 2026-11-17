import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Search,
  BookOpen,
  User,
  Calendar,
  Clock,
  Radio,
  FileText,
} from 'lucide-react';
import { SermonAudioItem } from '../types';
import { SERMONS_LIST } from '../data/sermonsData';

interface SuaraEfataPageProps {
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export function SuaraEfataPage({ fontScale }: SuaraEfataPageProps) {
  const [sermons] = useState<SermonAudioItem[]>(SERMONS_LIST);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSermon, setActiveSermon] = useState<SermonAudioItem>(SERMONS_LIST[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SERMONS_LIST[0].durationSeconds);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Web Audio Synth for meditative ambient organ/chime sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const chordTimerRef = useRef<number | null>(null);

  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        (selectedCategory === 'Khotbah Minggu' && s.category === 'Khotbah Minggu') ||
        (selectedCategory === 'Khotbah Unsur' && s.category === 'Khotbah Unsur') ||
        (selectedCategory === 'Renungan Suara' && s.category === 'Renungan Suara');

      const q = searchQuery.toLowerCase();
      const matchQuery =
        s.title.toLowerCase().includes(q) ||
        s.preacher.toLowerCase().includes(q) ||
        s.scripture.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [sermons, selectedCategory, searchQuery]);

  // Play peaceful church hymn chime chord (C - G - Am - F)
  const playAmbientChord = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const chords = [
      [261.63, 329.63, 392.0], // C major
      [196.0, 246.94, 293.66], // G major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 349.23], // F major
    ];

    const chord = chords[Math.floor(Math.random() * chords.length)];
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.6);
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
    } else {
      setIsPlaying(true);
      playAmbientChord();
      chordTimerRef.current = window.setInterval(playAmbientChord, 4000);

      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (chordTimerRef.current) clearInterval(chordTimerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
  };

  const handleSelectSermon = (sermon: SermonAudioItem) => {
    setActiveSermon(sermon);
    setCurrentTime(0);
    setDuration(sermon.durationSeconds);
    setIsPlaying(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (chordTimerRef.current) clearInterval(chordTimerRef.current);

    playAmbientChord();
    chordTimerRef.current = window.setInterval(playAmbientChord, 4000);

    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= sermon.durationSeconds) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (chordTimerRef.current) clearInterval(chordTimerRef.current);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / playbackRate);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentTime(val);
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);

    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / nextSpeed);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShareSermon = async (sermon: SermonAudioItem) => {
    const text = `🎙️ WARTA SUARA EFATA — GKI EFATA MALANU (KLASIS SORONG)\n\n*${sermon.title}*\nPelayan Firman: ${sermon.preacher}\nNats Alkitab: ${sermon.scripture}\nTanggal: ${sermon.dateLabel}\nDurasi: ${sermon.durationLabel}\n\nRingkasan:\n${sermon.description}\n\nPoin-poin Khotbah:\n${sermon.keyPoints.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\nDengarkan melalui Portal Jemaat GKI Efata Malanu. Tuhan Yesus memberkati!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: text,
        });
        return;
      } catch {}
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyPoints = (sermon: SermonAudioItem) => {
    const text = `*${sermon.title}*\nPelayan: ${sermon.preacher} (${sermon.scripture})\n\n${sermon.keyPoints.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sermon.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (chordTimerRef.current) clearInterval(chordTimerRef.current);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6" style={{ fontSize: `${fontScale}rem` }}>
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F2C59] via-[#1B365D] to-[#0B1120] p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
          <Radio className="w-48 h-48 text-[#D4AF37]" />
        </div>
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-semibold text-[#F7E7CE]">
            <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Warta Suara Efata · Rekaman Khotbah Mingguan</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
            Pemutar Audio Khotbah & Renungan Suara
          </h1>
          <p className="text-sm lg:text-base text-slate-200 max-w-2xl leading-relaxed">
            Dengarkan kembali firman Tuhan dari mimbar GKI Efata Malanu kapan saja. Ramah lansia, hemat kuota internet, dan dapat didengarkan di rumah maupun perjalanan.
          </p>
        </div>
      </div>

      {/* Main Active Audio Player Card */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-[#D4AF37]/40 dark:border-[#D4AF37]/30 p-5 sm:p-7 shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F2C59]/10 dark:bg-[#D4AF37]/20 text-[#0F2C59] dark:text-[#E5A93C]">
                {activeSermon.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeSermon.dateLabel}</span>
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#0F2C59] dark:text-white leading-snug">
              {activeSermon.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-[#8F6D14] dark:text-[#E5A93C]">
                <User className="w-3.5 h-3.5" />
                <span>{activeSermon.preacher}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{activeSermon.scripture}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => handleShareSermon(activeSermon)}
              className="min-h-[38px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
              <span>Bagikan Khotbah</span>
            </button>
          </div>
        </div>

        {/* Progress Bar (Scrub Bar) */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0F2C59] dark:accent-[#D4AF37]"
          />
          <div className="flex justify-between text-xs font-mono-num text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleSkip(-15)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Mundur 15 Detik"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="min-h-[48px] px-6 rounded-2xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Jeda Audio' : 'Putar Khotbah'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSkip(15)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Maju 15 Detik"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSpeedToggle}
              className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title="Kecepatan Putar"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Senyapkan'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Ringkasan & Poin Khotbah */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120]/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C] flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Ringkasan & Pokok Khotbah</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopyPoints(activeSermon)}
              className="text-xs text-slate-500 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] flex items-center gap-1 cursor-pointer"
            >
              {copiedId === activeSermon.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Pokok Khotbah</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeSermon.description}
          </p>
          <ul className="space-y-1.5 pt-1">
            {activeSermon.keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 leading-relaxed"
              >
                <span className="w-4 h-4 rounded-full bg-[#0F2C59]/10 dark:bg-[#D4AF37]/20 text-[#0F2C59] dark:text-[#E5A93C] flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['Semua', 'Khotbah Minggu', 'Khotbah Unsur', 'Renungan Suara'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                  : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0F2C59]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tema, pengkhotbah, nats..."
            className="w-full min-h-[40px] pl-9 pr-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:border-[#0F2C59]"
          />
        </div>
      </div>

      {/* Sermon List */}
      <div className="space-y-3">
        {filteredSermons.map((item) => {
          const isSelected = activeSermon.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectSermon(item)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-[#0F2C59] dark:border-[#D4AF37]'
                  : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSelected && isPlaying
                      ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isSelected && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      {item.dateLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-[#8F6D14] dark:text-[#E5A93C]">
                      {item.preacher}
                    </span>
                    <span>·</span>
                    <span>{item.scripture}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="text-xs font-mono-num font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.durationLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareSermon(item);
                  }}
                  className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Bagikan Khotbah"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
