import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  FileText,
  HeartHandshake,
  Send,
  X,
} from 'lucide-react';
import { WILAYAH_HIERARCHY } from '../data/wilayah';

interface LayananPageProps {
  whatsappSecretariat: string;
}

type ServiceTab = 'doa' | 'sakit' | 'sakramen' | 'dokumen';

interface FormDownloadItem {
  id: string;
  title: string;
  category: string;
  filename: string;
  description: string;
  templateLines: string[];
}

const FORM_DOWNLOADS: FormDownloadItem[] = [
  {
    id: 'f1',
    title: 'Formulir Pendaftaran Baptisan Kudus',
    category: 'Sakramen',
    filename: 'Syarat_dan_Formulir_Baptis_GKI_Efata_Malanu.txt',
    description: 'Panduan persyaratan administratif, akta lahir anak, surat nikah orang tua, dan formulir pendaftaran baptisan anak/dewasa.',
    templateLines: [
      'FORMULIR PENDAFTARAN BAPTISAN KUDUS',
      'GREJA KRISTEN INJILI DI TANAH PAPUA',
      'JEMAAT GKI EFATA MALANU — KLASIS SORONG',
      '==================================================',
      '',
      'A. KETERANGAN ANAK / YANG DIBAPTIS:',
      '1. Nama Lengkap: .................................................',
      '2. Tempat / Tanggal Lahir: ........................................',
      '3. Jenis Kelamin: Laki-laki / Perempuan',
      '4. Anak ke-: ........ dari ........ bersaudara',
      '',
      'B. KETERANGAN ORANG TUA / WALI:',
      '1. Nama Ayah Kandung: ............................................',
      '2. Nama Ibu Kandung: .............................................',
      '3. Alamat / KSP / Sektor: ........................................',
      '4. Nomor Telp / WA Aktif: ........................................',
      '',
      'C. PERSYARATAN LAMPIRAN (Wajib dibawa ke Sekretariat):',
      '- Fotokopi Akta Kelahiran anak',
      '- Fotokopi Surat Nikah Gereja / Catatan Sipil Orang Tua',
      '- Surat Pengantar dari Ketua Sektor / KSP',
      '',
      'Sorong, .................................... 2026',
      'Pemohon,',
      '',
      '( .................................................. )',
    ],
  },
  {
    id: 'f2',
    title: 'Formulir Pendaftaran Katekisasi & Sidi',
    category: 'Sakramen',
    filename: 'Formulir_Pendaftaran_Sidi_GKI_Efata_Malanu.txt',
    description: 'Syarat dan formulir pendaftaran kelas katekisasi sidi bagi pemuda/pemudi jemaat.',
    templateLines: [
      'FORMULIR PENDAFTARAN KATEKISASI & SIDI',
      'GEREJA KRISTEN INJILI DI TANAH PAPUA',
      'JEMAAT GKI EFATA MALANU — KLASIS SORONG',
      '==================================================',
      '',
      '1. Nama Lengkap: .................................................',
      '2. Tempat / Tanggal Lahir: ........................................',
      '3. Baptisan Kudus (Gereja / Tanggal): ............................',
      '4. Alamat / KSP / Sektor: ........................................',
      '5. Asal Rayon: Rayon I / II / III / IV',
      '6. Nomor Telp / WA Peserta: ......................................',
      '7. Nama Orang Tua / Wali: ........................................',
      '',
      'PERSYARATAN:',
      '- Fotokopi Surat Baptis Kudus',
      '- Pasfoto 3x4 berwarna (2 lembar)',
      '',
      'Sorong, .................................... 2026',
      'Calon Katekis/Sidi,',
      '',
      '( .................................................. )',
    ],
  },
  {
    id: 'f3',
    title: 'Syarat & Pengantar Pemberkatan Nikah Kudus',
    category: 'Pernikahan',
    filename: 'Syarat_Pemberkatan_Nikah_GKI_Efata_Malanu.txt',
    description: 'Prosedur, konseling Pranikah Majelis Jemaat, dan surat pengantar administrasi pernikahan gerejawi.',
    templateLines: [
      'PROSEDUR PENDAFTARAN PEMBERKATAN NIKAH KUDUS',
      'GKI EFATA MALANU — KLASIS SORONG',
      '==================================================',
      '',
      'A. PERSYARATAN ADMINISTRASI:',
      '1. Surat Keterangan Baptis & Sidi kedua calon mempelai',
      '2. Surat Pengantar dari Ketua Sektor / KSP masing-masing',
      '3. Surat Keterangan Belum Menikah dari Kelurahan',
      '4. Fotokopi KTP & Kartu Keluarga (KK) calon mempelai dan orang tua',
      '5. Pasfoto berdampingan ukuran 4x6 (3 lembar)',
      '',
      'B. TAHAPAN PELAYANAN:',
      '- Pendaftaran paling lambat 2 bulan sebelum pelaksanaan',
      '- Mengikuti bimbingan / konseling pranikah bersama Majelis Jemaat',
      '- Warta nikah 3 kali berturut-turut dalam Ibadah Minggu',
      '',
      'Sorong, .................................... 2026',
      'Mengetahui Sekretariat Jemaat,',
      '',
      '( .................................................. )',
    ],
  },
  {
    id: 'f4',
    title: 'Surat Keterangan Pindah / Anggota Jemaat',
    category: 'Administrasi',
    filename: 'Surat_Keterangan_Anggota_Jemaat_Efata.txt',
    description: 'Permohonan surat pindah rayon, mutasi antar jemaat, atau surat keterangan domisili gerejawi.',
    templateLines: [
      'SURAT PERMOHONAN KETERANGAN ANGGOTA JEMAAT',
      'GKI EFATA MALANU — KLASIS SORONG',
      '==================================================',
      '',
      '1. Nama Lengkap Kepala Keluarga / Pemohon: .........................',
      '2. Jumlah Anggota Keluarga yang Pindah: ....... orang',
      '3. Alamat Asal (Sektor / KSP): ...................................',
      '4. Tujuan Pindah / Keterangan: ...................................',
      '   (Nama Jemaat / Klasis / Gereja tujuan jika mutasi keluar)',
      '',
      'Sorong, .................................... 2026',
      'Pemohon,',
      '',
      '( .................................................. )',
    ],
  },
];

export const LayananPage: React.FC<LayananPageProps> = ({ whatsappSecretariat }) => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('doa');
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [wilayah, setWilayah] = useState('Rayon I · Sektor Hermon');
  const [jenisSakramen, setJenisSakramen] = useState('Baptis Kudus');
  const [detail, setDetail] = useState('');
  const [lokasiSakit, setLokasiSakit] = useState('');
  const [copied, setCopied] = useState(false);

  const [activeModalForm, setActiveModalForm] = useState<FormDownloadItem | null>(null);
  const [modalCopied, setModalCopied] = useState(false);

  const buildMessage = () => {
    const header =
      activeTab === 'doa'
        ? '*PENGAJUAN POKOK DOA — GKI EFATA MALANU*'
        : activeTab === 'sakit'
        ? '*LAPORAN JEMAAT SAKIT / KUNJUNGAN DIAKONIA*'
        : `*PENDAFTARAN ${jenisSakramen.toUpperCase()} — GKI EFATA MALANU*`;

    const lines = [
      header,
      '',
      `Nama Pemohon: ${nama || '-'}`,
      `No. HP/WA: ${kontak || '-'}`,
      `Wilayah: ${wilayah}`,
    ];

    if (activeTab === 'sakit') {
      lines.push(`Lokasi Perawatan / RS: ${lokasiSakit || '-'}`);
    }
    if (activeTab === 'sakramen') {
      lines.push(`Jenis Layanan: ${jenisSakramen}`);
    }

    lines.push(`Keterangan / Isi Permohonan:\n${detail || '-'}`);
    lines.push('', '_Dikirim melalui Portal Jemaat GKI Efata Malanu_');
    return lines.join('\n');
  };

  const handleSubmitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const message = buildMessage();
    const waPhone = whatsappSecretariat.replace(/[^0-9]/g, '') || '6281248001956';
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.location.assign(url);
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadTxt = (item: FormDownloadItem) => {
    const content = item.templateLines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleCopyModalText = async (item: FormDownloadItem) => {
    try {
      await navigator.clipboard.writeText(item.templateLines.join('\n'));
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
          Layanan Administrasi & Pastoral Jemaat
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Sampaikan pokok doa, laporan jemaat sakit, pendaftaran pelayanan, serta unduh formulir administratif gerejawi GKI Efata Malanu.
        </p>
      </div>

      {/* Service Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'doa', label: 'Pengajuan Pokok Doa' },
            { id: 'sakit', label: 'Lapor Jemaat Sakit' },
            { id: 'sakramen', label: 'Baptis / Sidi / Nikah' },
            { id: 'dokumen', label: 'Unduh Formulir & Syarat' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dokumen' ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              Pusat Unduhan Formulir & Syarat Pelayanan Jemaat
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Silakan unduh blangko formulir pendaftaran atau lihat rincian persyaratan administrasi gerejawi untuk dibawa ke Sekretariat GKI Efata Malanu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORM_DOWNLOADS.map((form) => (
              <div
                key={form.id}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0F2C59]/10 dark:bg-[#D4AF37]/15 text-[#0F2C59] dark:text-[#E5A93C]">
                      {form.category}
                    </span>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    {form.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {form.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalForm(form)}
                    className="flex-1 min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#0B1120] hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-[#0F2C59] dark:text-[#E5A93C]" />
                    <span>Pratinjau Syarat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTxt(form)}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .TXT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Form Card */
        <form
          onSubmit={handleSubmitWhatsApp}
          className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HeartHandshake className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              {activeTab === 'doa' && 'Formulir Pokok Doa Jemaat'}
              {activeTab === 'sakit' && 'Formulir Laporan Jemaat Sakit'}
              {activeTab === 'sakramen' && 'Formulir Pendaftaran Sakramen & Pelayanan'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="layanan-nama" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap Pemohon *
              </label>
              <input
                id="layanan-nama"
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Bapak Yosep Kambuaya"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="layanan-kontak" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp Aktif *
              </label>
              <input
                id="layanan-kontak"
                type="tel"
                required
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="Contoh: 0812xxxxxxxx"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="layanan-wilayah" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rayon & Sektor
              </label>
              <select
                id="layanan-wilayah"
                value={wilayah}
                onChange={(e) => setWilayah(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              >
                {WILAYAH_HIERARCHY.flatMap((r) =>
                  r.sektors.map((s) => {
                    const val = `${r.name} · ${s.name}`;
                    return (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    );
                  })
                )}
                <option value="Simpatisan / Luar Wilayah">Simpatisan / Luar Wilayah</option>
              </select>
            </div>

            {activeTab === 'sakramen' && (
              <div>
                <label htmlFor="layanan-sakramen" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Pendaftaran
                </label>
                <select
                  id="layanan-sakramen"
                  value={jenisSakramen}
                  onChange={(e) => setJenisSakramen(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="Baptis Kudus">Baptis Kudus</option>
                  <option value="Katekisasi Sidi">Katekisasi Sidi</option>
                  <option value="Pemberkatan Nikah">Pemberkatan Nikah</option>
                </select>
              </div>
            )}

            {activeTab === 'sakit' && (
              <div>
                <label htmlFor="layanan-lokasi" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rumah Sakit / Alamat Rumah *
                </label>
                <input
                  id="layanan-lokasi"
                  type="text"
                  required
                  value={lokasiSakit}
                  onChange={(e) => setLokasiSakit(e.target.value)}
                  placeholder="Contoh: RSUD Sele Be Solu Ruang Anggrek"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="layanan-detail" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {activeTab === 'doa'
                ? 'Isi Pokok Doa *'
                : activeTab === 'sakit'
                ? 'Nama Jemaat Sakit & Keterangan Kondisi *'
                : 'Nama Calon / Catatan Pendaftaran *'}
            </label>
            <textarea
              id="layanan-detail"
              rows={4}
              required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                activeTab === 'doa'
                  ? 'Tuliskan permohonan doa keluarga, kesembuhan, atau ucapan syukur...'
                  : activeTab === 'sakit'
                  ? 'Tuliskan nama lengkap jemaat yang sakit dan KSP...'
                  : 'Tuliskan nama lengkap calon baptis/sidi/pasangan nikah dan rencana waktu...'
              }
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 min-h-[46px] px-5 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim ke WhatsApp Sekretariat</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPreview}
              className="min-h-[46px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pesan Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Format Pesan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal Pratinjau Formulir / Syarat */}
      {activeModalForm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setActiveModalForm(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F2C59] dark:text-[#E5A93C]">
                  {activeModalForm.category}
                </span>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {activeModalForm.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalForm(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-slate-50 dark:bg-[#0B1120] p-4 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {activeModalForm.templateLines.join('\n')}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyModalText(activeModalForm)}
                className="min-h-[40px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {modalCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTxt(activeModalForm)}
                className="min-h-[40px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .TXT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
