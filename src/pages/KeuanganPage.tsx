import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Wallet,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Send,
  Heart,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { FinanceData, BankAccount } from '../types';

interface KeuanganPageProps {
  finance: FinanceData;
  bankAccounts?: BankAccount[];
  whatsappSecretariat?: string;
}

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'b1',
    bankName: 'Bank Papua',
    accountNumber: '101-0204-88912-3',
    accountHolder: 'Jemaat GKI Efata Malanu',
    purpose: 'Persembahan Syukur, Kolekte & Persepuluhan',
  },
  {
    id: 'b2',
    bankName: 'Bank BRI',
    accountNumber: '0345-01-009812-53-4',
    accountHolder: 'Panitia Pembangunan GKI Efata Malanu',
    purpose: 'Dana Aksi Pembangunan Gedung & Pastori',
  },
  {
    id: 'b3',
    bankName: 'Bank BNI',
    accountNumber: '0892-114-558',
    accountHolder: 'GKI Efata Malanu Kas Pelayanan',
    purpose: 'Pelayanan Diakonia, Jemaat Sakit & Duka',
  },
];

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);

export const KeuanganPage: React.FC<KeuanganPageProps> = ({
  finance,
  bankAccounts = DEFAULT_BANK_ACCOUNTS,
  whatsappSecretariat = '6281248001956',
}) => {
  const [activeTab, setActiveTab] = useState<'persembahan' | 'laporan'>('persembahan');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Konfirmasi Persembahan Digital
  const [donorName, setDonorName] = useState('');
  const [rayonOrSector, setRayonOrSector] = useState('');
  const [offeringType, setOfferingType] = useState('Persembahan Syukur');
  const [amountInput, setAmountInput] = useState('');
  const [bankDestination, setBankDestination] = useState('Bank Papua');
  const [prayerNote, setPrayerNote] = useState('');

  const progressPct = Math.min(
    100,
    Math.round((finance.buildingFundCollected / Math.max(1, finance.buildingFundTarget)) * 100)
  );

  const handleCopyAccount = (id: string, num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !amountInput.trim()) return;

    const message = `✨ KONFIRMASI PERSEMBAHAN DIGITAL — GKI EFATA MALANU\n\nKepada: Yth. Bendahara Majelis Jemaat GKI Efata Malanu\n\nNama Jemaat: ${donorName.trim()}\nRayon/Sektor: ${rayonOrSector.trim() || '-'}\nJenis Persembahan: ${offeringType}\nRekening Tujuan: ${bankDestination}\nNominal: Rp ${amountInput.trim()}\nDoa / Pokok Syukur:\n"${prayerNote.trim() || 'Kiranya Tuhan Yesus memberkati pelayanan jemaat-Nya.'}"\n\n(Bukti transfer terlampir). Terima kasih. Tuhan Yesus memberkati!`;

    window.open(
      `https://api.whatsapp.com/send?phone=${whatsappSecretariat}&text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
            Keuangan & Persembahan Digital
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            GKI Efata Malanu (Klasis Sorong) · Melayani dengan sukacita dan transparansi akuntabel.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('persembahan')}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'persembahan'
                ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Persembahan Digital</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'laporan'
                ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Laporan Kas & Kas Jemaat</span>
          </button>
        </div>
      </div>

      {activeTab === 'persembahan' && (
        <div className="space-y-6">
          {/* Banner Ajakan Persembahan */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0F2C59] via-[#1B365D] to-[#0B1120] p-6 lg:p-7 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
              <QrCode className="w-48 h-48 text-[#D4AF37]" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-semibold text-[#F7E7CE]">
                <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Pelayanan Kasih & Persepuluhan</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Beri Persembahan dengan Sukacita & Kemudahan
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                “Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan, sebab Allah mengasihi orang yang memberi dengan sukacita.” (2 Korintus 9:7)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rekening Bank & QRIS */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base sm:text-lg font-bold text-[#0F2C59] dark:text-white flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#D4AF37]" />
                  <span>Daftar Rekening Resmi Gereja</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">1-Klik Salin No. Rek</span>
              </div>

              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-[#0F2C59]/40 dark:hover:border-[#D4AF37]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0F2C59]/10 dark:bg-[#D4AF37]/20 text-[#0F2C59] dark:text-[#E5A93C]">
                        {b.bankName}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tujuan: <strong>{b.purpose}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(b.id, b.accountNumber)}
                      className="min-h-[36px] px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === b.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin No. Rek</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wider">
                        {b.accountNumber}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        a.n. {b.accountHolder}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* QRIS Card */}
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#0F2C59] dark:text-[#D4AF37]" />
                    <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      QRIS Nasional Standar Bank Indonesia
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Bebas Biaya Admin
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  {/* Visual QR Code Display */}
                  <div className="w-32 h-32 bg-white rounded-xl p-2 border-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <div className="w-full h-full bg-slate-900 rounded-lg p-1.5 flex items-center justify-center text-white">
                      <QrCode className="w-full h-full text-white" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-[#0F2C59] dark:text-[#D4AF37]">
                      NMID: ID102003884912
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      GKI EFATA MALANU KLASIS SORONG
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Dapat dipindai dari semua aplikasi mobile banking (BCA, Mandiri, BRI, Bank Papua, Livin, BNI Mobile) dan dompet digital (GoPay, OVO, DANA, LinkAja).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Konfirmasi WhatsApp */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0F2C59] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Konfirmasi Bukti Transfer</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kirim konfirmasi persembahan agar dapat dicatat secara transparan oleh Bendahara Jemaat.
                  </p>
                </div>

                <form onSubmit={handleSendConfirmation} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Jemaat / Keluarga *
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Contoh: Kel. Korwa / NN"
                      className="w-full min-h-[40px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-[#0F2C59]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Rayon / Sektor
                      </label>
                      <input
                        type="text"
                        value={rayonOrSector}
                        onChange={(e) => setRayonOrSector(e.target.value)}
                        placeholder="Rayon 1 / Sion"
                        className="w-full min-h-[40px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-[#0F2C59]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Jenis Persembahan
                      </label>
                      <select
                        value={offeringType}
                        onChange={(e) => setOfferingType(e.target.value)}
                        className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-[#0F2C59]"
                      >
                        <option value="Persembahan Syukur">Syukur</option>
                        <option value="Persepuluhan">Persepuluhan</option>
                        <option value="Dana Pembangunan">Pembangunan</option>
                        <option value="Diakonia & Pelayanan Kasih">Diakonia</option>
                        <option value="Kolekte Ibadah">Kolekte</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Rekening Tujuan
                      </label>
                      <select
                        value={bankDestination}
                        onChange={(e) => setBankDestination(e.target.value)}
                        className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-[#0F2C59]"
                      >
                        <option value="Bank Papua">Bank Papua</option>
                        <option value="Bank BRI">Bank BRI</option>
                        <option value="Bank BNI">Bank BNI</option>
                        <option value="QRIS Nasional">QRIS Nasional</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nominal (IDR) *
                      </label>
                      <input
                        type="text"
                        required
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="Contoh: 250000"
                        className="w-full min-h-[40px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs font-mono-num focus:outline-hidden focus:border-[#0F2C59]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pokok Doa / Catatan Syukur (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={prayerNote}
                      onChange={(e) => setPrayerNote(e.target.value)}
                      placeholder="Ucapan syukur atas berkat Tuhan..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-[#0F2C59]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Konfirmasi ke Bendahara via WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#0F2C59] text-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Posisi Saldo Kas Jemaat</span>
                <Wallet className="w-4 h-4 text-[#E5A93C]" />
              </div>
              <p className="font-mono-num text-2xl sm:text-3xl font-bold mt-2">
                {formatIDR(finance.kasBalance)}
              </p>
              <p className="text-xs text-slate-300 mt-2">Saldo per akhir periode laporan</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Penerimaan Minggu Lalu</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatIDR(finance.weeklyIncome)}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-medium">
                Total kolekte, persepuluhan & syukur
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pengeluaran Pelayanan</span>
                <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatIDR(finance.weeklyExpense)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Operasional ibadah, diakonia & setoran klasis
              </p>
            </div>
          </div>

          {/* Dana Aksi Pembangunan */}
          <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                    Progres Dana Aksi Pembangunan
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {finance.buildingFundLabel}
                  </p>
                </div>
              </div>
              <span className="font-mono-num text-lg font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                {progressPct}% Tercapai
              </span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0F2C59] to-[#D4AF37] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>
                Terkumpul:{' '}
                <strong className="font-mono-num text-slate-900 dark:text-white">
                  {formatIDR(finance.buildingFundCollected)}
                </strong>
              </span>
              <span>
                Target Anggaran:{' '}
                <strong className="font-mono-num text-slate-900 dark:text-white">
                  {formatIDR(finance.buildingFundTarget)}
                </strong>
              </span>
            </div>
          </section>

          {/* Rincian Persembahan Minggu Lalu */}
          <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Rincian Persembahan Ibadah Minggu Lalu
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-6">Jenis Persembahan</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-6 text-right">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {finance.offerings.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100">
                        {row.label}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {row.category}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono-num font-semibold text-slate-900 dark:text-white">
                        {formatIDR(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0B1120]/50 text-xs text-slate-500 dark:text-slate-400">
              {finance.notes}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
