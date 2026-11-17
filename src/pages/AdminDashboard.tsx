import React, { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Check,
  CloudCog,
  Copy,
  FileText,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Save,
  ScrollText,
  ShieldCheck,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  AdminUser,
  HymnBook,
  LiturgyStep,
  PortalState,
  ScheduleCategory,
  ScheduleItem,
  UnsurType,
} from '../types';
import { getKspsBySektor, getSektorsByRayon, WILAYAH_HIERARCHY } from '../data/wilayah';
import {
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  pullStateFromGoogleSheets,
} from '../services/storageSync';
import { GoogleSheetsSyncPanel } from '../components/GoogleSheetsSyncPanel';

export type AdminTab =
  | 'jadwal'
  | 'warta'
  | 'liturgi'
  | 'galeri'
  | 'keuangan'
  | 'statistik'
  | 'sync'
  | 'akun';

interface AdminDashboardProps {
  state: PortalState;
  currentUser: AdminUser | null;
  onLogin: (user: AdminUser) => void;
  onLogout: () => void;
  onUpdateState: (updater: (prev: PortalState) => PortalState, syncTab?: string) => void;
  onBackToPublic: () => void;
  initialTab?: AdminTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  currentUser,
  onLogin,
  onLogout,
  onUpdateState,
  onBackToPublic,
  initialTab = 'jadwal',
}) => {
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  React.useEffect(() => {
    const superOnlyTabs: AdminTab[] = ['keuangan', 'statistik', 'sync', 'akun'];
    if (currentUser && currentUser.role !== 'superuser' && superOnlyTabs.includes(initialTab)) {
      setActiveTab('jadwal');
    } else {
      setActiveTab(initialTab);
    }
  }, [initialTab, currentUser]);

  // Jadwal Form State
  const [schTitle, setSchTitle] = useState('');
  const [schCategory, setSchCategory] = useState<ScheduleCategory>('Rayon/Sektor/KSP');
  const [schUnsur, setSchUnsur] = useState<UnsurType>('PW');
  const [schRayon, setSchRayon] = useState('Rayon I');
  const [schSektor, setSchSektor] = useState('Sektor Hermon');
  const [schKsp, setSchKsp] = useState('KSP 1');
  const [schDate, setSchDate] = useState('Rabu, 2 Desember 2026');
  const [schTime, setSchTime] = useState('18.00 WIT');
  const [schHost, setSchHost] = useState('');
  const [schAddress, setSchAddress] = useState('');
  const [schPelayan, setSchPelayan] = useState('');

  // Warta Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annCat, setAnnCat] = useState<'Sidang & Sakramen' | 'Pelayanan' | 'Diakonia' | 'Umum'>('Umum');
  const [annDate, setAnnDate] = useState('');
  const [annSummary, setAnnSummary] = useState('');
  const [hutName, setHutName] = useState('');
  const [hutType, setHutType] = useState<'HUT Kelahiran' | 'HUT Pernikahan'>('HUT Kelahiran');
  const [hutDate, setHutDate] = useState('');
  const [hutWilayah, setHutWilayah] = useState('Rayon I · Sektor Hermon');
  const [prayName, setPrayName] = useState('');
  const [prayCat, setPrayCat] = useState<'Sakit' | 'Duka' | 'Pemulihan'>('Sakit');
  const [prayNote, setPrayNote] = useState('');
  const [prayWilayah, setPrayWilayah] = useState('Rayon II · Sektor Siloam');

  // Liturgi Step Form State
  const [litStepTitle, setLitStepTitle] = useState('');
  const [litStepInstr, setLitStepInstr] = useState('');
  const [litStepContent, setLitStepContent] = useState('');
  const [litStepHymnBook, setLitStepHymnBook] = useState<'' | HymnBook>('');
  const [litStepHymnNum, setLitStepHymnNum] = useState('');

  // Galeri Form State
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('Ibadah Raya');
  const [galDate, setGalDate] = useState('November 2026');
  const [galUrl, setGalUrl] = useState('');
  const [galCaption, setGalCaption] = useState('');

  // Sync & Password States
  const [gasUrlInput, setGasUrlInput] = useState(state.syncConfig.gasWebAppUrl);
  const [driveUrlInput, setDriveUrlInput] = useState(state.syncConfig.driveFolderUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);

  const [newPwdAdmin1, setNewPwdAdmin1] = useState('');
  const [newPwdAdmin2, setNewPwdAdmin2] = useState('');
  const [newPwdSuper, setNewPwdSuper] = useState('');

  const notify = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = state.users.find(
      (u) => u.username === username.trim() && u.password === password
    );
    if (!matched) {
      setLoginError('Username atau kata sandi tidak sesuai.');
      return;
    }
    setLoginError('');
    setPassword('');
    onLogin(matched);
  };

  // Unauthenticated View -> Login Card
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-6">
        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C]">
              <ShieldCheck className="w-4 h-4" />
              <span>Akses Majelis & Pengurus Gereja</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Login Dashboard Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk menggunakan akun <span className="font-mono-num font-semibold">admin1</span>,{' '}
              <span className="font-mono-num font-semibold">admin2</span>, atau{' '}
              <span className="font-mono-num font-semibold">superuser</span>.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin1 / admin2 / superuser"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-sm font-semibold transition-colors cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div>
              <button
                type="button"
                onClick={onBackToPublic}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                ← Kembali ke Halaman Jemaat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuperUser = currentUser.role === 'superuser';

  const navTabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    superOnly?: boolean;
  }[] = [
    { id: 'jadwal', label: 'Jadwal Ibadah', icon: CalendarDays },
    { id: 'warta', label: 'Warta Jemaat', icon: FileText },
    { id: 'liturgi', label: 'Tata Ibadah', icon: ScrollText },
    { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon },
    { id: 'keuangan', label: 'Laporan Keuangan', icon: Wallet, superOnly: true },
    { id: 'statistik', label: 'Data Statistik', icon: BarChart3, superOnly: true },
    { id: 'sync', label: 'Sync Google Sheets', icon: CloudCog, superOnly: true },
    { id: 'akun', label: 'Manajemen Akun', icon: KeyRound, superOnly: true },
  ];

  const allowedTabs = navTabs.filter((t) => !t.superOnly || isSuperUser);

  // Handlers for CRUD
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      title: schTitle,
      category: schCategory,
      unsur: schCategory === 'Ibadah Unsur' ? schUnsur : undefined,
      rayon: schCategory !== 'Ibadah Minggu' ? schRayon : undefined,
      sektor: schCategory !== 'Ibadah Minggu' ? schSektor : undefined,
      ksp: schCategory !== 'Ibadah Minggu' ? schKsp : undefined,
      dateLabel: schDate,
      timeWit: schTime,
      hostFamily: schHost,
      address: schAddress,
      pelayanFirman: schPelayan,
      mapsQuery: `${schAddress || schHost} Sorong`,
    };
    onUpdateState((prev) => ({ ...prev, schedules: [newItem, ...prev.schedules] }), 'Jadwal');
    setSchTitle('');
    setSchHost('');
    setSchAddress('');
    setSchPelayan('');
    notify('Jadwal ibadah berhasil ditambahkan & disimpan.');
  };

  const handleDeleteSchedule = (id: string) => {
    onUpdateState(
      (prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== id) }),
      'Jadwal'
    );
    notify('Jadwal ibadah dihapus.');
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState(
      (prev) => ({
        ...prev,
        warta: {
          ...prev.warta,
          announcements: [
            {
              id: `ann-${Date.now()}`,
              title: annTitle,
              category: annCat,
              dateLabel: annDate || 'Minggu Ini',
              summary: annSummary,
            },
            ...prev.warta.announcements,
          ],
        },
      }),
      'Warta'
    );
    setAnnTitle('');
    setAnnDate('');
    setAnnSummary('');
    notify('Pengumuman warta berhasil ditambahkan.');
  };

  const handleAddBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState(
      (prev) => ({
        ...prev,
        warta: {
          ...prev.warta,
          birthdays: [
            ...prev.warta.birthdays,
            {
              id: `hut-${Date.now()}`,
              name: hutName,
              type: hutType,
              dateLabel: hutDate,
              wilayah: hutWilayah,
            },
          ],
        },
      }),
      'Warta'
    );
    setHutName('');
    setHutDate('');
    notify('Daftar HUT jemaat diperbarui.');
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState(
      (prev) => ({
        ...prev,
        warta: {
          ...prev.warta,
          prayerSupports: [
            ...prev.warta.prayerSupports,
            {
              id: `pray-${Date.now()}`,
              name: prayName,
              category: prayCat,
              locationOrNote: prayNote,
              wilayah: prayWilayah,
            },
          ],
        },
      }),
      'Warta'
    );
    setPrayName('');
    setPrayNote('');
    notify('Dukungan doa jemaat ditambahkan.');
  };

  const handleAddLiturgyStep = (e: React.FormEvent) => {
    e.preventDefault();
    const nextOrder = state.liturgy.steps.length + 1;
    const newStep: LiturgyStep = {
      id: `l-${Date.now()}`,
      order: nextOrder,
      title: litStepTitle,
      type: litStepHymnBook ? 'nyanyian' : 'doa',
      instruction: litStepInstr,
      content: litStepContent,
      hymnBook: litStepHymnBook || undefined,
      hymnNumber: litStepHymnBook && litStepHymnNum ? Number(litStepHymnNum) : undefined,
      hymnVersesLabel:
        litStepHymnBook && litStepHymnNum
          ? `${litStepHymnBook} No. ${litStepHymnNum}`
          : undefined,
    };
    onUpdateState(
      (prev) => ({
        ...prev,
        liturgy: { ...prev.liturgy, steps: [...prev.liturgy.steps, newStep] },
      }),
      'Liturgi'
    );
    setLitStepTitle('');
    setLitStepInstr('');
    setLitStepContent('');
    setLitStepHymnBook('');
    setLitStepHymnNum('');
    notify('Bagian tata ibadah ditambahkan.');
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState(
      (prev) => ({
        ...prev,
        gallery: [
          {
            id: `gal-${Date.now()}`,
            title: galTitle,
            category: galCategory,
            dateLabel: galDate,
            imageUrl: galUrl,
            caption: galCaption,
          },
          ...prev.gallery,
        ],
      }),
      'Galeri'
    );
    setGalTitle('');
    setGalUrl('');
    setGalCaption('');
    notify('Foto galeri berhasil ditambahkan.');
  };

  const handlePullSync = async () => {
    setSyncBusy(true);
    const res = await pullStateFromGoogleSheets(gasUrlInput);
    if (res.ok && res.data) {
      onUpdateState(
        (prev) => ({
          ...prev,
          ...res.data,
          syncConfig: {
            ...prev.syncConfig,
            gasWebAppUrl: gasUrlInput,
            driveFolderUrl: driveUrlInput,
            lastSyncedAt: new Date().toLocaleString('id-ID'),
            lastSyncStatus: 'success',
            lastSyncMessage: res.message,
          },
        }),
        undefined
      );
    }
    setSyncBusy(false);
    notify(res.message);
  };

  const handleCopyGAS = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetPassword = (targetUsername: 'admin1' | 'admin2' | 'superuser', newPass: string) => {
    if (newPass.trim().length < 6) {
      notify('Kata sandi minimal 6 karakter.');
      return;
    }
    onUpdateState(
      (prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.username === targetUsername ? { ...u, password: newPass.trim() } : u
        ),
      }),
      'Users'
    );
    if (targetUsername === 'admin1') setNewPwdAdmin1('');
    if (targetUsername === 'admin2') setNewPwdAdmin2('');
    if (targetUsername === 'superuser') setNewPwdSuper('');
    notify(`Kata sandi untuk ${targetUsername} berhasil diperbarui.`);
  };

  const sektorsForForm = getSektorsByRayon(schRayon);
  const kspsForForm = getKspsBySektor(schRayon, schSektor);

  return (
    <div className="space-y-6">
      {/* Top Dashboard Header with Logout */}
      <div className="rounded-2xl bg-[#0F2C59] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#E5A93C]">
            Dashboard Pengurus GKI Efata Malanu · {currentUser.roleTitle}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold mt-0.5">
            Selamat Datang, {currentUser.displayName}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {state.syncConfig.lastSyncMessage || 'Penyimpanan LocalStorage & Sync aktif'}
            {state.syncConfig.lastSyncedAt ? ` · Terakhir: ${state.syncConfig.lastSyncedAt}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden min-h-[42px] px-3.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Menu Admin</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="min-h-[42px] px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5A93C] text-[#0B1120] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200">
          {feedbackMsg}
        </div>
      )}

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-2 gap-2">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                    : 'bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-3 space-y-1">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full min-h-[44px] px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <section className="lg:col-span-9 space-y-6">
          {/* TAB: JADWAL IBADAH */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddSchedule}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                  Tambah Jadwal Ibadah Baru
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Judul Ibadah *</label>
                    <input
                      type="text"
                      required
                      value={schTitle}
                      onChange={(e) => setSchTitle(e.target.value)}
                      placeholder="Contoh: Ibadah Rayon I – Sektor Hermon – KSP 1"
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Kategori</label>
                    <select
                      value={schCategory}
                      onChange={(e) => setSchCategory(e.target.value as ScheduleCategory)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    >
                      <option value="Rayon/Sektor/KSP">Rayon / Sektor / KSP</option>
                      <option value="Ibadah Unsur">Ibadah Unsur</option>
                      <option value="Ibadah Minggu">Ibadah Minggu</option>
                    </select>
                  </div>
                </div>

                {schCategory !== 'Ibadah Minggu' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {schCategory === 'Ibadah Unsur' && (
                      <div>
                        <label className="block text-xs font-semibold mb-1">Unsur</label>
                        <select
                          value={schUnsur}
                          onChange={(e) => setSchUnsur(e.target.value as UnsurType)}
                          className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                        >
                          {(['PKB', 'PW', 'PAM', 'PAR', 'Lansia'] as UnsurType[]).map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold mb-1">Rayon</label>
                      <select
                        value={schRayon}
                        onChange={(e) => {
                          const r = e.target.value;
                          setSchRayon(r);
                          const secs = getSektorsByRayon(r);
                          const firstSec = secs[0]?.name || '';
                          setSchSektor(firstSec);
                          setSchKsp(getKspsBySektor(r, firstSec)[0] || '');
                        }}
                        className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        {WILAYAH_HIERARCHY.map((r) => (
                          <option key={r.name} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Sektor</label>
                      <select
                        value={schSektor}
                        onChange={(e) => {
                          const s = e.target.value;
                          setSchSektor(s);
                          setSchKsp(getKspsBySektor(schRayon, s)[0] || '');
                        }}
                        className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        {sektorsForForm.map((s) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">KSP</label>
                      <select
                        value={schKsp}
                        onChange={(e) => setSchKsp(e.target.value)}
                        className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                      >
                        {kspsForForm.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Hari & Tanggal *</label>
                    <input
                      type="text"
                      required
                      value={schDate}
                      onChange={(e) => setSchDate(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Waktu (WIT) *</label>
                    <input
                      type="text"
                      required
                      value={schTime}
                      onChange={(e) => setSchTime(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Pelayan Firman *</label>
                    <input
                      type="text"
                      required
                      value={schPelayan}
                      onChange={(e) => setSchPelayan(e.target.value)}
                      placeholder="Pdt. / Pnt. / Sym."
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Keluarga Tuan Rumah / Lokasi *</label>
                    <input
                      type="text"
                      required
                      value={schHost}
                      onChange={(e) => setSchHost(e.target.value)}
                      placeholder="Kel. Bapak ..."
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Alamat Wilayah Malanu *</label>
                    <input
                      type="text"
                      required
                      value={schAddress}
                      onChange={(e) => setSchAddress(e.target.value)}
                      placeholder="Jl. Malanu ..."
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Jadwal ke Portal & Sheets</span>
                </button>
              </form>

              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {state.schedules.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.dateLabel} · {s.timeWit} · {s.hostFamily}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSchedule(s.id)}
                      aria-label={`Hapus ${s.title}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WARTA JEMAAT */}
          {activeTab === 'warta' && (
            <div className="space-y-6">
              {/* Pengaturan PDF Warta & Header */}
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                  Pengaturan Edisi & Unduhan PDF Warta
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Judul Edisi Warta</label>
                    <input
                      type="text"
                      value={state.warta.editionTitle}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            warta: { ...prev.warta, editionTitle: e.target.value },
                          }),
                          'Warta'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tanggal Terbit</label>
                    <input
                      type="text"
                      value={state.warta.publishDate}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            warta: { ...prev.warta, publishDate: e.target.value },
                          }),
                          'Warta'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    URL File PDF Warta (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={state.warta.pdfDriveUrl}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          warta: { ...prev.warta, pdfDriveUrl: e.target.value },
                        }),
                        'Warta'
                      )
                    }
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.warta.allowPdfDownload}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          warta: { ...prev.warta, allowPdfDownload: checked },
                        }),
                        'Warta'
                      );
                      notify(
                        checked
                          ? 'Tombol Unduh PDF Warta diaktifkan untuk Jemaat.'
                          : 'Tombol Unduh PDF Warta disembunyikan dari halaman Jemaat.'
                      );
                    }}
                    className="w-5 h-5 accent-[#0F2C59]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Izinkan Jemaat Download PDF
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jika dinonaktifkan, tombol unduh PDF pada halaman Warta Jemaat otomatis tersembunyi.
                    </p>
                  </div>
                </label>
              </div>

              {/* Tambah Pengumuman */}
              <form
                onSubmit={handleAddAnnouncement}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                  Tambah Pengumuman Mingguan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Judul Pengumuman *"
                    className="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <select
                    value={annCat}
                    onChange={(e) =>
                      setAnnCat(
                        e.target.value as 'Sidang & Sakramen' | 'Pelayanan' | 'Diakonia' | 'Umum'
                      )
                    }
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <option value="Sidang & Sakramen">Sidang & Sakramen</option>
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="Diakonia">Diakonia</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={annDate}
                  onChange={(e) => setAnnDate(e.target.value)}
                  placeholder="Waktu / Tanggal (cth: Sabtu, 28 Nov 2026 · 09.00 WIT)"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                />
                <textarea
                  rows={3}
                  required
                  value={annSummary}
                  onChange={(e) => setAnnSummary(e.target.value)}
                  placeholder="Isi pengumuman lengkap *"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120] text-xs font-semibold cursor-pointer"
                >
                  Tambah Pengumuman
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {state.warta.announcements.map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{a.title}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateState(
                            (prev) => ({
                              ...prev,
                              warta: {
                                ...prev.warta,
                                announcements: prev.warta.announcements.filter((x) => x.id !== a.id),
                              },
                            }),
                            'Warta'
                          )
                        }
                        className="text-rose-600 p-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </form>

              {/* HUT & Doa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form
                  onSubmit={handleAddBirthday}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                    Tambah Daftar HUT Jemaat
                  </h3>
                  <input
                    type="text"
                    required
                    value={hutName}
                    onChange={(e) => setHutName(e.target.value)}
                    placeholder="Nama Jemaat / Pasangan *"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={hutType}
                      onChange={(e) =>
                        setHutType(e.target.value as 'HUT Kelahiran' | 'HUT Pernikahan')
                      }
                      className="min-h-[40px] px-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="HUT Kelahiran">HUT Kelahiran</option>
                      <option value="HUT Pernikahan">HUT Pernikahan</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={hutDate}
                      onChange={(e) => setHutDate(e.target.value)}
                      placeholder="Tanggal (29 Nov)"
                      className="min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={hutWilayah}
                    onChange={(e) => setHutWilayah(e.target.value)}
                    placeholder="Rayon / Sektor / KSP"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
                  >
                    Tambah HUT
                  </button>
                </form>

                <form
                  onSubmit={handleAddPrayer}
                  className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                    Tambah Dukungan Doa Sakit / Duka
                  </h3>
                  <input
                    type="text"
                    required
                    value={prayName}
                    onChange={(e) => setPrayName(e.target.value)}
                    placeholder="Nama Jemaat *"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <select
                    value={prayCat}
                    onChange={(e) => setPrayCat(e.target.value as 'Sakit' | 'Duka' | 'Pemulihan')}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="Sakit">Sakit</option>
                    <option value="Pemulihan">Pemulihan</option>
                    <option value="Duka">Berita Duka</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={prayNote}
                    onChange={(e) => setPrayNote(e.target.value)}
                    placeholder="Lokasi RS / Keterangan *"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="text"
                    value={prayWilayah}
                    onChange={(e) => setPrayWilayah(e.target.value)}
                    placeholder="Rayon / Sektor"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
                  >
                    Tambah Dukungan Doa
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: TATA IBADAH MINGGU */}
          {activeTab === 'liturgi' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                  Informasi Utama Tata Ibadah Minggu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tanggal Ibadah</label>
                    <input
                      type="text"
                      value={state.liturgy.sundayDate}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            liturgy: { ...prev.liturgy, sundayDate: e.target.value },
                          }),
                          'Liturgi'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tema Khotbah</label>
                    <input
                      type="text"
                      value={state.liturgy.theme}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            liturgy: { ...prev.liturgy, theme: e.target.value },
                          }),
                          'Liturgi'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Pelayan Firman</label>
                    <input
                      type="text"
                      value={state.liturgy.pelayanFirman}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            liturgy: { ...prev.liturgy, pelayanFirman: e.target.value },
                          }),
                          'Liturgi'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Pembacaan Alkitab</label>
                    <input
                      type="text"
                      value={state.liturgy.pembacaanAlkitab}
                      onChange={(e) =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            liturgy: { ...prev.liturgy, pembacaanAlkitab: e.target.value },
                          }),
                          'Liturgi'
                        )
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleAddLiturgyStep}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                  Tambah Urutan Tata Ibadah
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={litStepTitle}
                    onChange={(e) => setLitStepTitle(e.target.value)}
                    placeholder="Judul Langkah (cth: Nyanyian Syukur) *"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <input
                    type="text"
                    value={litStepInstr}
                    onChange={(e) => setLitStepInstr(e.target.value)}
                    placeholder="Petunjuk (cth: Jemaat berdiri)"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={litStepHymnBook}
                    onChange={(e) => setLitStepHymnBook(e.target.value as '' | HymnBook)}
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <option value="">Tanpa Lagu (Teks Liturgi Saja)</option>
                    <option value="NR">NR (Nyanyian Rohani)</option>
                    <option value="KJ">KJ (Kidung Jemaat)</option>
                    <option value="PKJ">PKJ (Pelengkap Kidung Jemaat)</option>
                    <option value="NKB">NKB (Nyanyian Kidung Baru)</option>
                    <option value="DSL">DSL (Dua Sahabat Lama)</option>
                  </select>
                  <input
                    type="number"
                    disabled={!litStepHymnBook}
                    value={litStepHymnNum}
                    onChange={(e) => setLitStepHymnNum(e.target.value)}
                    placeholder="Nomor Lagu (cth: 1)"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
                <textarea
                  rows={3}
                  value={litStepContent}
                  onChange={(e) => setLitStepContent(e.target.value)}
                  placeholder="Teks doa / liturgi / nas pembacaan..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
                >
                  Tambah Langkah Liturgi
                </button>
              </form>

              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {state.liturgy.steps.map((st) => (
                  <div key={st.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {st.order}. {st.title}{' '}
                        {st.hymnVersesLabel ? `(${st.hymnVersesLabel})` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {st.instruction || st.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            liturgy: {
                              ...prev.liturgy,
                              steps: prev.liturgy.steps
                                .filter((x) => x.id !== st.id)
                                .map((x, idx) => ({ ...x, order: idx + 1 })),
                            },
                          }),
                          'Liturgi'
                        )
                      }
                      className="text-rose-600 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GALERI FOTO */}
          {activeTab === 'galeri' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddGallery}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                  Tambah Foto Kegiatan (Google Drive)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    placeholder="Judul Kegiatan *"
                    className="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <input
                    type="text"
                    value={galDate}
                    onChange={(e) => setGalDate(e.target.value)}
                    placeholder="Bulan / Tahun"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={galCategory}
                    onChange={(e) => setGalCategory(e.target.value)}
                    placeholder="Kategori (cth: Ibadah Raya / Diakonia)"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                  <input
                    type="url"
                    value={galUrl}
                    onChange={(e) => setGalUrl(e.target.value)}
                    placeholder="URL Gambar Google Drive (opsional)"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={galCaption}
                  onChange={(e) => setGalCaption(e.target.value)}
                  placeholder="Keterangan foto *"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan ke Galeri
                </button>
              </form>

              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {state.gallery.map((g) => (
                  <div key={g.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{g.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {g.category} · {g.dateLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((x) => x.id !== g.id),
                          }),
                          'Galeri'
                        )
                      }
                      className="text-rose-600 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUPERUSER ONLY: KEUANGAN */}
          {activeTab === 'keuangan' && isSuperUser && (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Pengelolaan Laporan Keuangan (Eksklusif Super User)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Periode Laporan</label>
                  <input
                    type="text"
                    value={state.finance.periodLabel}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: { ...prev.finance, periodLabel: e.target.value },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Saldo Kas Jemaat (IDR)</label>
                  <input
                    type="number"
                    value={state.finance.kasBalance}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: { ...prev.finance, kasBalance: Number(e.target.value) || 0 },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Penerimaan Minggu Lalu (IDR)</label>
                  <input
                    type="number"
                    value={state.finance.weeklyIncome}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: { ...prev.finance, weeklyIncome: Number(e.target.value) || 0 },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Pengeluaran Minggu Lalu (IDR)</label>
                  <input
                    type="number"
                    value={state.finance.weeklyExpense}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: { ...prev.finance, weeklyExpense: Number(e.target.value) || 0 },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Dana Pembangunan Terkumpul (IDR)</label>
                  <input
                    type="number"
                    value={state.finance.buildingFundCollected}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: {
                            ...prev.finance,
                            buildingFundCollected: Number(e.target.value) || 0,
                          },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Target Dana Pembangunan (IDR)</label>
                  <input
                    type="number"
                    value={state.finance.buildingFundTarget}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          finance: {
                            ...prev.finance,
                            buildingFundTarget: Number(e.target.value) || 1,
                          },
                        }),
                        'Keuangan'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perubahan angka langsung memperbarui halaman Keuangan Jemaat dan memicu sinkronisasi ke tab Keuangan Google Sheets.
              </p>
            </div>
          )}

          {/* SUPERUSER ONLY: STATISTIK */}
          {activeTab === 'statistik' && isSuperUser && (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Pengaturan & Sinkronisasi Data Statistik Jemaat
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Anggota Baptis</label>
                  <input
                    type="number"
                    value={state.statistics.totalBaptized}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          statistics: {
                            ...prev.statistics,
                            totalBaptized: Number(e.target.value) || 0,
                          },
                        }),
                        'Statistik'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Anggota Sidi</label>
                  <input
                    type="number"
                    value={state.statistics.totalSidi}
                    onChange={(e) =>
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          statistics: {
                            ...prev.statistics,
                            totalSidi: Number(e.target.value) || 0,
                          },
                        }),
                        'Statistik'
                      )
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Data Kepala Keluarga & Jiwa per Rayon
                </p>
                {state.statistics.rayonStats.map((r, idx) => (
                  <div
                    key={r.rayon}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120]"
                  >
                    <span className="text-sm font-semibold">{r.rayon}</span>
                    <div>
                      <label className="block text-[11px] text-slate-500">Jumlah KK</label>
                      <input
                        type="number"
                        value={r.kkCount}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          onUpdateState(
                            (prev) => ({
                              ...prev,
                              statistics: {
                                ...prev.statistics,
                                rayonStats: prev.statistics.rayonStats.map((item, i) =>
                                  i === idx ? { ...item, kkCount: val } : item
                                ),
                              },
                            }),
                            'Statistik'
                          );
                        }}
                        className="w-full min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Laki-laki</label>
                      <input
                        type="number"
                        value={r.maleCount}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          onUpdateState(
                            (prev) => ({
                              ...prev,
                              statistics: {
                                ...prev.statistics,
                                rayonStats: prev.statistics.rayonStats.map((item, i) =>
                                  i === idx ? { ...item, maleCount: val } : item
                                ),
                              },
                            }),
                            'Statistik'
                          );
                        }}
                        className="w-full min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Perempuan</label>
                      <input
                        type="number"
                        value={r.femaleCount}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          onUpdateState(
                            (prev) => ({
                              ...prev,
                              statistics: {
                                ...prev.statistics,
                                rayonStats: prev.statistics.rayonStats.map((item, i) =>
                                  i === idx ? { ...item, femaleCount: val } : item
                                ),
                              },
                            }),
                            'Statistik'
                          );
                        }}
                        className="w-full min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-sm font-mono-num"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUPERUSER ONLY: SYNC GOOGLE SHEETS & DRIVE */}
          {activeTab === 'sync' && isSuperUser && (
            <div className="space-y-6">
              <GoogleSheetsSyncPanel
                state={state}
                onUpdateState={onUpdateState}
                onNotify={notify}
              />

              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                  Opsi Lanjutan: Google Apps Script Web App & Folder Drive
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Setiap perubahan di Dashboard Admin otomatis tersimpan ke{' '}
                  <strong>LocalStorage</strong> perangkat (zero-latency). Anda juga dapat menautkan{' '}
                  <strong>Google Apps Script Web App</strong> (tab: Jadwal, Warta, Liturgi, Keuangan, Statistik, Galeri, Users) untuk sinkronisasi otomatis tanpa login Google.
                </p>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    URL Google Apps Script Web App (/exec)
                  </label>
                  <input
                    type="url"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    URL Folder Aset Google Drive (Logo, PDF Warta, Galeri)
                  </label>
                  <input
                    type="url"
                    value={driveUrlInput}
                    onChange={(e) => setDriveUrlInput(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          syncConfig: {
                            ...prev.syncConfig,
                            gasWebAppUrl: gasUrlInput,
                            driveFolderUrl: driveUrlInput,
                          },
                        }),
                        'ALL'
                      );
                      notify('Konfigurasi sync disimpan dan dikirim ke Google Sheets.');
                    }}
                    className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan & Push ke Sheets</span>
                  </button>

                  <button
                    type="button"
                    disabled={syncBusy}
                    onClick={handlePullSync}
                    className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncBusy ? 'animate-spin' : ''}`} />
                    <span>Tarik Data Terbaru (Pull)</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                    Kode Google Apps Script (Code.gs)
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyGAS}
                    className="min-h-[36px] px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Disalin' : 'Salin Code.gs'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono-num overflow-x-auto leading-relaxed">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {/* SUPERUSER ONLY: MANAJEMEN AKUN */}
          {activeTab === 'akun' && isSuperUser && (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Manajemen Akun & Reset Kata Sandi Admin
              </h2>

              <div className="space-y-4">
                {[
                  {
                    username: 'admin1' as const,
                    label: 'admin1 (Sekretaris / Warta Jemaat)',
                    val: newPwdAdmin1,
                    setter: setNewPwdAdmin1,
                  },
                  {
                    username: 'admin2' as const,
                    label: 'admin2 (Urusan Ibadah & Liturgi)',
                    val: newPwdAdmin2,
                    setter: setNewPwdAdmin2,
                  },
                  {
                    username: 'superuser' as const,
                    label: 'superuser (Ketua Majelis / IT)',
                    val: newPwdSuper,
                    setter: setNewPwdSuper,
                  },
                ].map((acc) => (
                  <div
                    key={acc.username}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {acc.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Username: <span className="font-mono-num">{acc.username}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={acc.val}
                        onChange={(e) => acc.setter(e.target.value)}
                        placeholder="Kata sandi baru (min. 6)"
                        className="min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(acc.username, acc.val)}
                        className="min-h-[40px] px-3.5 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                      >
                        Atur Ulang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
