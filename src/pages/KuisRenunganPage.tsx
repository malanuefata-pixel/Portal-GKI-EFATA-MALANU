import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  RefreshCw,
  Award,
  Share2,
} from 'lucide-react';

interface QuizDevotionData {
  devotion: {
    title: string;
    scripture: string;
    content: string;
    reflection: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    bibleReference: string;
  };
}

interface KuisRenunganPageProps {
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
}

export function KuisRenunganPage({ fontScale, onChangeFontScale }: KuisRenunganPageProps) {
  const [data, setData] = useState<QuizDevotionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('gki_quiz_score') || '0', 10);
  });
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('gki_quiz_streak') || '0', 10);
  });

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setHasSubmitted(false);
    try {
      const res = await fetch('/api/gemini/quiz-devotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            'Berikan Kuis Alkitab interaktif harian (pilihan ganda 4 opsi) dan Renungan Rohani singkat yang mendalam untuk warga jemaat GKI di Tanah Papua dalam bahasa Indonesia yang ramah, hangat, dan teologis.',
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Gagal memuat konten.');
      }
    } catch (err: any) {
      setError(err.message || 'Kesalahan jaringan saat menghubungkan ke Google Gemini.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !data) return;
    setHasSubmitted(true);
    const isCorrect = selectedOption === data.quiz.correctAnswerIndex;
    if (isCorrect) {
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      localStorage.setItem('gki_quiz_score', String(newScore));
      localStorage.setItem('gki_quiz_streak', String(newStreak));
    } else {
      setStreak(0);
      localStorage.setItem('gki_quiz_streak', '0');
    }
  };

  const handleShareDevotion = async () => {
    if (!data) return;
    const text = `📖 RENUNGAN HARIAN — GKI EFATA MALANU\n\n*${data.devotion.title}*\nNats: ${data.devotion.scripture}\n\n${data.devotion.content}\n\n💡 *Refleksi:*\n${data.devotion.reflection}\n\nPortal Jemaat GKI Efata Malanu (Klasis Sorong). Tuhan Yesus memberkati!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Renungan: ${data.devotion.title}`,
          text: text,
        });
        return;
      } catch {}
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6" style={{ fontSize: `${fontScale}rem` }}>
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F2C59] via-[#1B365D] to-[#0B1120] p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
          <Sparkles className="w-40 h-40 text-[#D4AF37]" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-semibold text-[#F7E7CE]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Didukung oleh Google Gemini AI</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
            Kuis Alkitab & Renungan Interaktif Harian
          </h1>
          <p className="text-sm lg:text-base text-slate-200 max-w-2xl leading-relaxed">
            Perbarui iman setiap hari melalui renungan rohani yang membimbing dan kuis alkitab interaktif khusus warga jemaat GKI Efata Malanu.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>Skor Total: {score} Poin</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Streak Benar: {streak} Hari</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-4 border-[#0F2C59] border-t-transparent dark:border-[#D4AF37] dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Google Gemini sedang menyiapkan Renungan & Kuis hari ini...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={fetchContent}
            className="px-4 py-2 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold hover:bg-[#1B365D] transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Renungan Harian */}
          <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2C59] dark:text-[#D4AF37] uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Renungan Rohani Harian</span>
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {data.devotion.scripture}
                </span>
              </div>

              <h2 className="font-display text-lg lg:text-xl font-bold text-[#0F2C59] dark:text-white leading-snug">
                {data.devotion.title}
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {data.devotion.content}
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="text-xs font-bold text-[#0F2C59] dark:text-[#D4AF37]">
                  Refleksi Pribadi & Keluarga:
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.devotion.reflection}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleShareDevotion}
                className="min-h-[40px] px-4 rounded-xl bg-[#0F2C59]/10 hover:bg-[#0F2C59]/20 dark:bg-[#D4AF37]/20 dark:hover:bg-[#D4AF37]/30 text-[#0F2C59] dark:text-[#E5A93C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Renungan</span>
              </button>
              <button
                type="button"
                onClick={fetchContent}
                className="min-h-[40px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Renungan Lain</span>
              </button>
            </div>
          </div>

          {/* Kuis Alkitab Interaktif */}
          <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2C59] dark:text-[#D4AF37] uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Kuis Alkitab Interaktif</span>
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {data.quiz.bibleReference}
                </span>
              </div>

              <h2 className="font-display text-base lg:text-lg font-bold text-[#0F2C59] dark:text-white leading-snug">
                {data.quiz.question}
              </h2>

              <div className="space-y-2.5 pt-2">
                {data.quiz.options.map((opt, idx) => {
                  let btnStyle =
                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:border-[#0F2C59] dark:hover:border-[#D4AF37]';
                  if (selectedOption === idx) {
                    btnStyle = 'border-[#0F2C59] bg-blue-50 dark:bg-blue-950/50 text-[#0F2C59] dark:text-blue-200 font-semibold';
                  }
                  if (hasSubmitted) {
                    if (idx === data.quiz.correctAnswerIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold';
                    } else if (selectedOption === idx && idx !== data.quiz.correctAnswerIndex) {
                      btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-semibold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left min-h-[46px] px-4 py-3 rounded-xl border transition-all text-xs lg:text-sm flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>
                        <strong className="mr-2 font-mono">{String.fromCharCode(65 + idx)}.</strong>
                        {opt}
                      </span>
                      {hasSubmitted && idx === data.quiz.correctAnswerIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {hasSubmitted && selectedOption === idx && idx !== data.quiz.correctAnswerIndex && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasSubmitted && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    selectedOption === data.quiz.correctAnswerIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {selectedOption === data.quiz.correctAnswerIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Jawaban Anda Benar! (+10 Poin)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Jawaban Kurang Tepat.</span>
                      </>
                    )}
                  </p>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                    {data.quiz.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {!hasSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitQuiz}
                  className={`w-full min-h-[44px] rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${
                    selectedOption === null
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                      : 'bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120]'
                  }`}
                >
                  Kirim Jawaban
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchContent}
                  className="w-full min-h-[44px] rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Pertanyaan Kuis Berikutnya</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
