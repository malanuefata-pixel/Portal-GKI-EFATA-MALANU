import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Download, Lock, Moon, Sun, X } from 'lucide-react';
import { AdminUser, Hymn, PageId, PortalState } from './types';
import {
  loadFontScale,
  loadPortalState,
  loadThemePreference,
  pullStateFromGoogleSheets,
  saveFontScale,
  savePortalState,
  saveThemePreference,
  pushStateToGoogleSheets,
} from './services/storageSync';
import {
  BottomNavigation,
  FooterBar,
  OfflineIndicator,
  TopNavigation,
} from './components/Navigation';
import { ChurchEmblem } from './components/ChurchVisuals';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  downloadAndCacheFullHymns,
  loadCachedFullHymns,
  mergeHymns,
} from './services/hymnStorage';
import { HomePage } from './pages/HomePage';
import { LiturgiPage } from './pages/LiturgiPage';
import { JadwalPage } from './pages/JadwalPage';
import { WartaPage } from './pages/WartaPage';
import { KidungPage } from './pages/KidungPage';
import { AlkitabPage } from './pages/AlkitabPage';
import { LayananPage } from './pages/LayananPage';
import { KeuanganPage } from './pages/KeuanganPage';
import { StatistikPage } from './pages/StatistikPage';
import { ProfilPage } from './pages/ProfilPage';
import { GaleriPage } from './pages/GaleriPage';
import { KuisRenunganPage } from './pages/KuisRenunganPage';
import { SuaraEfataPage } from './pages/SuaraEfataPage';
import { AdminDashboard, AdminTab } from './pages/AdminDashboard';

const FONT_SCALES = [1, 1.15, 1.3, 1.5];

export default function App() {
  const [state, setState] = useState<PortalState>(() => loadPortalState());
  const [activePage, setActivePage] = useState<PageId>('beranda');
  const [darkMode, setDarkMode] = useState<boolean>(() => loadThemePreference() === 'dark');
  const [fontScale, setFontScale] = useState<number>(() => loadFontScale());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('jadwal');

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [logoInput, setLogoInput] = useState(() => loadPortalState().profile.logoDriveUrl);
  const [offlineHymns, setOfflineHymns] = useState<Hymn[]>([]);
  const [hymnsOfflineStatus, setHymnsOfflineStatus] = useState<
    'checking' | 'loading' | 'ready' | 'error'
  >('checking');
  const [hymnsCachedAt, setHymnsCachedAt] = useState<string | null>(null);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sync reading font scale CSS variable on <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--reading-scale', String(fontScale));
    saveFontScale(fontScale);
  }, [fontScale]);

  // Pull from Google Sheets on startup if configured
  useEffect(() => {
    const gasUrl = state.syncConfig.gasWebAppUrl;
    if (!gasUrl) return;
    let cancelled = false;
    pullStateFromGoogleSheets(gasUrl).then((res) => {
      if (!cancelled && res.ok && res.data) {
        setState((prev) => {
          const next = {
            ...prev,
            ...res.data,
            syncConfig: {
              ...prev.syncConfig,
              lastSyncedAt: new Date().toLocaleString('id-ID'),
              lastSyncStatus: 'success' as const,
              lastSyncMessage: res.message,
            },
          };
          savePortalState(next);
          return next;
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncOfflineHymns = useCallback(async (forceDownload = false) => {
    try {
      if (!forceDownload) {
        const cached = await loadCachedFullHymns();
        if (cached.hymns.length >= 1000) {
          setOfflineHymns(cached.hymns);
          setHymnsCachedAt(cached.cachedAt);
          setHymnsOfflineStatus('ready');
          return;
        }
      }
      setHymnsOfflineStatus('loading');
      const downloaded = await downloadAndCacheFullHymns();
      setOfflineHymns(downloaded.hymns);
      setHymnsCachedAt(downloaded.cachedAt);
      setHymnsOfflineStatus('ready');
    } catch {
      setHymnsOfflineStatus('error');
    }
  }, []);

  useEffect(() => {
    syncOfflineHymns(false);
  }, [syncOfflineHymns]);

  const mergedHymns = useMemo(
    () => mergeHymns(offlineHymns, state.hymns),
    [offlineHymns, state.hymns]
  );

  const handleNavigate = useCallback((page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUpdateState = useCallback(
    (updater: (prev: PortalState) => PortalState, syncTab?: string) => {
      setState((prev) => {
        const next = updater(prev);
        savePortalState(next);

        if (syncTab) {
          pushStateToGoogleSheets(next, syncTab).then((syncRes) => {
            setState((latest) => {
              const withSync: PortalState = {
                ...latest,
                syncConfig: {
                  ...latest.syncConfig,
                  lastSyncedAt: syncRes.syncedAt,
                  lastSyncStatus: syncRes.ok ? 'success' : 'error',
                  lastSyncMessage: syncRes.message,
                },
              };
              savePortalState(withSync);
              return withSync;
            });
          });
        }

        return next;
      });
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const gasUrl = state.syncConfig.gasWebAppUrl;
    if (gasUrl) {
      const res = await pullStateFromGoogleSheets(gasUrl);
      if (res.ok && res.data) {
        setState((prev) => {
          const next = {
            ...prev,
            ...res.data,
            syncConfig: {
              ...prev.syncConfig,
              lastSyncedAt: new Date().toLocaleString('id-ID'),
              lastSyncStatus: 'success' as const,
              lastSyncMessage: res.message,
            },
          };
          savePortalState(next);
          return next;
        });
        showToast('Data terbaru berhasil disinkronkan.');
      } else {
        setState(loadPortalState());
        showToast('Data lokal dimuat ulang.');
      }
    } else {
      setState(loadPortalState());
      showToast('Data portal berhasil diperbarui.');
    }
    setTimeout(() => setIsRefreshing(false), 350);
  }, [state.syncConfig.gasWebAppUrl, showToast]);

  const handleExit = useCallback(() => {
    if (currentUser) {
      setCurrentUser(null);
      setActivePage('beranda');
      showToast('Sesi Admin telah keluar.');
      return;
    }
    setIsExited(true);
  }, [currentUser, showToast]);

  const handleSaveLogoUrl = () => {
    handleUpdateState(
      (prev) => ({
        ...prev,
        profile: { ...prev.profile, logoDriveUrl: logoInput.trim() },
      }),
      undefined
    );
    showToast('Tautan Logo GKI diperbarui.');
  };

  if (isExited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] p-6">
        <div className="max-w-sm w-full rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-sm">
          <div className="flex justify-center">
            <ChurchEmblem logoUrl={state.profile.logoDriveUrl} size="xl" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-xl font-bold text-[#0F2C59] dark:text-white">
              GKI EFATA MALANU
            </h1>
            <p className="text-xs font-semibold tracking-widest text-[#B89225] dark:text-[#E5A93C]">
              KLASIS SORONG
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">
              Terima kasih telah menggunakan Portal Jemaat. Damai sejahtera Tuhan Yesus Kristus menyertai kita sekalian.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsExited(false);
              setActivePage('beranda');
            }}
            className="w-full min-h-[44px] rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Buka Kembali Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-[#F1F5F9] transition-colors">
      <TopNavigation
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
      />

      <OfflineIndicator />

      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 rounded-xl bg-[#0F2C59] dark:bg-[#D4AF37] text-white dark:text-[#0B1120] px-4 py-2.5 text-xs font-semibold shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-6 pt-5 pb-24 lg:py-7">
        {activePage !== 'beranda' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => handleNavigate('beranda')}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0F2C59] dark:hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        )}

        {activePage === 'beranda' && (
          <HomePage state={state} onNavigate={handleNavigate} />
        )}

        {activePage === 'liturgi' && (
          <LiturgiPage
            liturgy={state.liturgy}
            hymns={mergedHymns}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'jadwal' && <JadwalPage schedules={state.schedules} />}

        {activePage === 'warta' && (
          <WartaPage
            warta={state.warta}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'kidung' && (
          <KidungPage
            hymns={mergedHymns}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
            offlineStatus={hymnsOfflineStatus}
            cachedAt={hymnsCachedAt}
            onSyncOffline={() => syncOfflineHymns(true)}
          />
        )}

        {activePage === 'alkitab' && (
          <AlkitabPage
            books={state.bibleBooks}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'layanan' && (
          <LayananPage whatsappSecretariat={state.profile.whatsappSecretariat} />
        )}

        {activePage === 'keuangan' && (
          <KeuanganPage
            finance={state.finance}
            bankAccounts={state.profile.bankAccounts}
            whatsappSecretariat={state.profile.whatsappSecretariat}
          />
        )}

        {activePage === 'statistik' && <StatistikPage statistics={state.statistics} />}

        {activePage === 'galeri' && (
          <GaleriPage
            gallery={state.gallery}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'kuis' && (
          <KuisRenunganPage
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'suara' && (
          <SuaraEfataPage
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
          />
        )}

        {activePage === 'profil' && (
          <ProfilPage
            profile={state.profile}
            gallery={state.gallery}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboard
            state={{ ...state, hymns: mergedHymns }}
            currentUser={currentUser}
            onLogin={(user) => setCurrentUser(user)}
            onLogout={() => setCurrentUser(null)}
            onUpdateState={handleUpdateState}
            onBackToPublic={() => handleNavigate('beranda')}
            initialTab={adminInitialTab}
          />
        )}
      </main>

      <FooterBar
        onOpenAbout={() => setShowAboutModal(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setShowSettingsModal(true)}
        onExit={handleExit}
        klasisName={state.profile.klasisName}
      />

      <BottomNavigation
        onOpenAbout={() => setShowAboutModal(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setShowSettingsModal(true)}
        onExit={handleExit}
      />

      {/* Modal: Tentang Aplikasi */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ChurchEmblem logoUrl={state.profile.logoDriveUrl} size="md" />
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                    Tentang Aplikasi
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    GKI Efata Malanu · Klasis Sorong
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              <p>
                <strong>Portal Informasi & Layanan Jemaat GKI Efata Malanu</strong> (Progressive Web App) dirancang untuk memudahkan warga jemaat mengakses Tata Ibadah, Jadwal Pelayanan Rayon/Sektor/KSP, Warta Jemaat, Kidung Pujian, Alkitab, serta Layanan Pastoral.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tema Pelayanan: “{state.profile.yearlyTheme}”
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              {!isInstalled && isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang PWA ke Layar Utama</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowAboutModal(false);
                  handleNavigate('admin');
                }}
                className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#0F2C59] dark:text-[#E5A93C] flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Majelis / Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pengaturan */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Pengaturan Portal
              </h2>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold">Mode Tampilan</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {darkMode ? 'Mode Gelap aktif (ramah ruang ibadah)' : 'Mode Terang aktif'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#0F2C59] dark:bg-[#D4AF37] text-white dark:text-[#0B1120] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Terang' : 'Gelap'}</span>
              </button>
            </div>

            {/* Ukuran Teks */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold">Ukuran Teks Bacaan (Ramah Lansia)</p>
              <div className="grid grid-cols-4 gap-2">
                {FONT_SCALES.map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setFontScale(sc)}
                    className={`min-h-[40px] rounded-xl font-mono-num text-xs font-bold transition-colors cursor-pointer ${
                      fontScale === sc
                        ? 'bg-[#0F2C59] text-white dark:bg-[#D4AF37] dark:text-[#0B1120]'
                        : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {Math.round(sc * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tautan Logo_GKI_Big.png Google Drive */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold">
                Tautan Berbagi Google Drive untuk Logo_GKI_Big.png
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="flex-1 min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveLogoUrl}
                  className="min-h-[40px] px-3 rounded-xl bg-[#0F2C59] text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pastikan izin file <code>Logo_GKI_Big.png</code> di Google Drive disetel ke “Siapa saja yang memiliki link”.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setAdminInitialTab('sync');
                  handleNavigate('admin');
                }}
                className="w-full min-h-[44px] rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:text-[#0B1120] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buat & Sinkronkan Google Sheet Baru</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setAdminInitialTab('jadwal');
                  handleNavigate('admin');
                }}
                className="w-full min-h-[44px] rounded-xl border border-[#0F2C59]/30 dark:border-[#D4AF37]/40 text-[#0F2C59] dark:text-[#E5A93C] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Buka Dashboard Majelis / Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
