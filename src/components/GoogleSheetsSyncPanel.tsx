import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  ExternalLink,
  FileSpreadsheet,
  LogOut,
  Music,
  Plus,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { PortalState } from '../types';
import {
  getCachedAccessToken,
  initGoogleAuth,
  signInWithGoogleSheets,
  signOutGoogle,
} from '../services/googleAuth';
import {
  createNewChurchSpreadsheet,
  createNewHymnsSpreadsheet,
  pullDataFromSpreadsheet,
  pullHymnsFromSpreadsheet,
  syncAllDataToSpreadsheet,
  syncHymnsToSpreadsheet,
} from '../services/googleSheetsApi';

interface GoogleSheetsSyncPanelProps {
  state: PortalState;
  onUpdateState: (updater: (prev: PortalState) => PortalState, syncTab?: string) => void;
  onNotify: (message: string) => void;
}

type PendingAction = 'create-main' | 'push-main' | 'create-hymns' | 'push-hymns' | null;

export const GoogleSheetsSyncPanel: React.FC<GoogleSheetsSyncPanelProps> = ({
  state,
  onUpdateState,
  onNotify,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedAccessToken());
  const [authBusy, setAuthBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingAction>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualSheetId, setManualSheetId] = useState(state.syncConfig.spreadsheetId || '');
  const [manualHymnsSheetId, setManualHymnsSheetId] = useState(
    state.syncConfig.hymnsSpreadsheetId || ''
  );

  useEffect(() => {
    const unsub = initGoogleAuth((user, token) => {
      setGoogleUser(user);
      setAccessToken(token);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setManualSheetId(state.syncConfig.spreadsheetId || '');
  }, [state.syncConfig.spreadsheetId]);

  useEffect(() => {
    setManualHymnsSheetId(state.syncConfig.hymnsSpreadsheetId || '');
  }, [state.syncConfig.hymnsSpreadsheetId]);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setAuthBusy(true);
    try {
      const res = await signInWithGoogleSheets();
      setGoogleUser(res.user);
      setAccessToken(res.accessToken);
      onNotify(`Terhubung ke Google sebagai ${res.user.email || res.user.displayName}.`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Gagal masuk dengan Google. Pastikan pop-up diizinkan.'
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    onNotify('Sesi Google Sheets telah keluar.');
  };

  const executeCreateMainSheet = async () => {
    if (!accessToken) {
      setErrorMsg('Silakan masuk dengan Google terlebih dahulu.');
      setPendingConfirm(null);
      return;
    }
    setPendingConfirm(null);
    setErrorMsg('');
    setSyncBusy(true);
    try {
      const created = await createNewChurchSpreadsheet(accessToken, state);
      const syncedAt = new Date().toLocaleString('id-ID');
      onUpdateState((prev) => ({
        ...prev,
        syncConfig: {
          ...prev.syncConfig,
          spreadsheetId: created.spreadsheetId,
          spreadsheetUrl: created.spreadsheetUrl,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: `Google Sheet "${created.title}" berhasil dibuat & disinkronkan.`,
        },
      }));
      setManualSheetId(created.spreadsheetId);
      onNotify('Google Sheet utama berhasil dibuat dan seluruh data portal telah disinkronkan!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membuat Google Sheet baru.');
    } finally {
      setSyncBusy(false);
    }
  };

  const executePushMainSheet = async () => {
    const targetId = manualSheetId.trim() || state.syncConfig.spreadsheetId || '';
    if (!accessToken || !targetId) {
      setErrorMsg('Pastikan Anda sudah masuk Google dan ID Google Sheet tersedia.');
      setPendingConfirm(null);
      return;
    }
    setPendingConfirm(null);
    setErrorMsg('');
    setSyncBusy(true);
    try {
      await syncAllDataToSpreadsheet(accessToken, targetId, state);
      const syncedAt = new Date().toLocaleString('id-ID');
      const sheetUrl =
        state.syncConfig.spreadsheetUrl ||
        `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
      onUpdateState((prev) => ({
        ...prev,
        syncConfig: {
          ...prev.syncConfig,
          spreadsheetId: targetId,
          spreadsheetUrl: sheetUrl,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: 'Seluruh data portal berhasil dikirim (Push) ke Google Sheets.',
        },
      }));
      onNotify('Seluruh data aplikasi berhasil disinkronkan ke Google Sheets.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengirim data ke Google Sheets.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handlePullMainSheet = async () => {
    const targetId = manualSheetId.trim() || state.syncConfig.spreadsheetId || '';
    if (!accessToken || !targetId) {
      setErrorMsg('Silakan hubungkan akun Google dan masukkan ID Google Sheet.');
      return;
    }
    setErrorMsg('');
    setSyncBusy(true);
    try {
      const pulled = await pullDataFromSpreadsheet(accessToken, targetId);
      const syncedAt = new Date().toLocaleString('id-ID');
      onUpdateState((prev) => ({
        ...prev,
        ...pulled,
        syncConfig: {
          ...prev.syncConfig,
          spreadsheetId: targetId,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: 'Data terbaru berhasil ditarik (Pull) dari Google Sheets.',
        },
      }));
      onNotify('Data aplikasi berhasil diperbarui dari Google Sheets.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menarik data dari Google Sheets.');
    } finally {
      setSyncBusy(false);
    }
  };

  // Dedicated Kidung Pujian Sheet handlers
  const executeCreateHymnsSheet = async () => {
    if (!accessToken) {
      setErrorMsg('Silakan masuk dengan Google terlebih dahulu.');
      setPendingConfirm(null);
      return;
    }
    setPendingConfirm(null);
    setErrorMsg('');
    setSyncBusy(true);
    try {
      const created = await createNewHymnsSpreadsheet(accessToken, state.hymns);
      const syncedAt = new Date().toLocaleString('id-ID');
      onUpdateState((prev) => ({
        ...prev,
        syncConfig: {
          ...prev.syncConfig,
          hymnsSpreadsheetId: created.spreadsheetId,
          hymnsSpreadsheetUrl: created.spreadsheetUrl,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: `Google Sheet Kidung Pujian "${created.title}" berhasil dibuat & disinkronkan.`,
        },
      }));
      setManualHymnsSheetId(created.spreadsheetId);
      onNotify(
        'Google Sheet Kidung Pujian (NR, KJ, PKJ, NKB, DSL) berhasil dibuat & disinkronkan!'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal membuat Google Sheet Kidung Pujian.'
      );
    } finally {
      setSyncBusy(false);
    }
  };

  const executePushHymnsSheet = async () => {
    const targetId = manualHymnsSheetId.trim() || state.syncConfig.hymnsSpreadsheetId || '';
    if (!accessToken || !targetId) {
      setErrorMsg('Pastikan Anda sudah masuk Google dan ID Google Sheet Kidung Pujian tersedia.');
      setPendingConfirm(null);
      return;
    }
    setPendingConfirm(null);
    setErrorMsg('');
    setSyncBusy(true);
    try {
      await syncHymnsToSpreadsheet(accessToken, targetId, state.hymns);
      const syncedAt = new Date().toLocaleString('id-ID');
      const sheetUrl =
        state.syncConfig.hymnsSpreadsheetUrl ||
        `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
      onUpdateState((prev) => ({
        ...prev,
        syncConfig: {
          ...prev.syncConfig,
          hymnsSpreadsheetId: targetId,
          hymnsSpreadsheetUrl: sheetUrl,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: 'Seluruh Kidung Pujian (NR, KJ, PKJ, NKB, DSL) berhasil di-push ke Sheet.',
        },
      }));
      onNotify('Seluruh Kidung Pujian berhasil disinkronkan ke Google Sheet.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengirim Kidung Pujian ke Sheet.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handlePullHymnsSheet = async () => {
    const targetId = manualHymnsSheetId.trim() || state.syncConfig.hymnsSpreadsheetId || '';
    if (!accessToken || !targetId) {
      setErrorMsg('Silakan hubungkan akun Google dan masukkan ID Google Sheet Kidung Pujian.');
      return;
    }
    setErrorMsg('');
    setSyncBusy(true);
    try {
      const pulledHymns = await pullHymnsFromSpreadsheet(accessToken, targetId);
      const syncedAt = new Date().toLocaleString('id-ID');
      onUpdateState((prev) => ({
        ...prev,
        hymns: pulledHymns,
        syncConfig: {
          ...prev.syncConfig,
          hymnsSpreadsheetId: targetId,
          lastSyncedAt: syncedAt,
          lastSyncStatus: 'success',
          lastSyncMessage: `${pulledHymns.length} Kidung Pujian berhasil ditarik dari Google Sheet.`,
        },
      }));
      onNotify(`${pulledHymns.length} Kidung Pujian berhasil disinkronkan dari Google Sheet.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menarik Kidung Pujian dari Sheet.');
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Akun Google Auth Header */}
      <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
                Integrasi Langsung Google Sheets
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Buat Google Sheet langsung di akun Google Anda dan sinkronkan seluruh data portal & buku nyanyian.
              </p>
            </div>
          </div>

          {accessToken && googleUser && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span className="max-w-[160px] truncate">
                  {googleUser.email || googleUser.displayName}
                </span>
              </span>
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {!accessToken ? (
          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Hubungkan Akun Google Anda
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Masuk dengan akun Google untuk membuat spreadsheet baru dan menyinkronkan data aplikasi.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authBusy}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs text-sm font-medium inline-flex items-center justify-center gap-3 transition-colors shrink-0 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{authBusy ? 'Menghubungkan...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Section A: Google Sheet Khusus Kidung Pujian (5 Buku Nyanyian) */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-[#D4AF37]/40 space-y-4">
              <div className="flex items-start gap-3">
                <Music className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                    Google Sheet Khusus Kidung Pujian (5 Buku Nyanyian)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Membuat 5 tab terstruktur: <strong>Mazmur & Nyanyian Rohani (NR)</strong>,{' '}
                    <strong>Kidung Jemaat (KJ)</strong>, <strong>Pelengkap Kidung Jemaat (PKJ)</strong>,{' '}
                    <strong>Nyanyian Kidung Baru (NKB)</strong>, dan <strong>Dua Sahabat Lama (DSL)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={syncBusy}
                  onClick={() => setPendingConfirm('create-hymns')}
                  className="min-h-[44px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] dark:bg-[#D4AF37] dark:hover:bg-[#E5A93C] text-white dark:text-[#0B1120] text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {syncBusy
                      ? 'Memproses...'
                      : 'Buat Google Sheet Kidung Pujian Baru & Sinkronkan'}
                  </span>
                </button>

                {state.syncConfig.hymnsSpreadsheetUrl && (
                  <a
                    href={state.syncConfig.hymnsSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Sheet Kidung Pujian</span>
                  </a>
                )}
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={manualHymnsSheetId}
                  onChange={(e) => setManualHymnsSheetId(e.target.value)}
                  placeholder="ID Google Sheet Kidung Pujian (terisi otomatis setelah dibuat)"
                  className="w-full min-h-[40px] px-3 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-mono-num"
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={syncBusy || !manualHymnsSheetId.trim()}
                    onClick={() => setPendingConfirm('push-hymns')}
                    className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4 text-[#0F2C59] dark:text-[#E5A93C]" />
                    <span>Push Kidung ke Sheet Ini</span>
                  </button>

                  <button
                    type="button"
                    disabled={syncBusy || !manualHymnsSheetId.trim()}
                    onClick={handlePullHymnsSheet}
                    className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-[#0F2C59] dark:text-[#E5A93C] ${
                        syncBusy ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Tarik Data Kidung dari Sheet (Pull)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section B: Google Sheet Database Utama Portal */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-[#0F2C59] dark:text-white">
                  Google Sheet Database Utama Portal (7 Tab Administrasi)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Jadwal, Warta, Liturgi, Keuangan, Statistik, Galeri, dan Users.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={syncBusy}
                  onClick={() => setPendingConfirm('create-main')}
                  className="min-h-[44px] px-4 rounded-xl bg-[#0F2C59] hover:bg-[#1B365D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Google Sheet Utama Baru & Sinkronkan</span>
                </button>

                {state.syncConfig.spreadsheetUrl && (
                  <a
                    href={state.syncConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Google Sheet Utama</span>
                  </a>
                )}
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={manualSheetId}
                  onChange={(e) => setManualSheetId(e.target.value)}
                  placeholder="ID Google Sheet Utama (terisi otomatis setelah dibuat)"
                  className="w-full min-h-[40px] px-3 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-mono-num"
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={syncBusy || !manualSheetId.trim()}
                    onClick={() => setPendingConfirm('push-main')}
                    className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4 text-[#0F2C59] dark:text-[#E5A93C]" />
                    <span>Push Data Utama ke Sheet Ini</span>
                  </button>

                  <button
                    type="button"
                    disabled={syncBusy || !manualSheetId.trim()}
                    onClick={handlePullMainSheet}
                    className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-[#0F2C59] dark:text-[#E5A93C] ${
                        syncBusy ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Tarik Data Utama dari Sheet (Pull)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              {pendingConfirm === 'create-hymns' && 'Konfirmasi Buat Sheet Kidung Pujian'}
              {pendingConfirm === 'push-hymns' && 'Konfirmasi Perbarui Sheet Kidung Pujian'}
              {pendingConfirm === 'create-main' && 'Konfirmasi Buat Sheet Utama Portal'}
              {pendingConfirm === 'push-main' && 'Konfirmasi Perbarui Sheet Utama Portal'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pendingConfirm === 'create-hymns' &&
                `Aplikasi akan membuat Google Sheet baru bernama "Kidung Pujian GKI Efata Malanu" dengan 5 tab (Mazmur & Nyanyian Rohani, Kidung Jemaat, Pelengkap Kidung Jemaat, Nyanyian Kidung Baru, dan Dua Sahabat Lama) serta mengisi ${state.hymns.length} lagu saat ini.`}
              {pendingConfirm === 'push-hymns' &&
                `Aplikasi akan menulis ulang seluruh ${state.hymns.length} lagu ke 5 tab Kidung Pujian pada Google Sheet ID "${manualHymnsSheetId.trim()}".`}
              {pendingConfirm === 'create-main' &&
                'Aplikasi akan membuat file Google Sheet baru di akun Google Anda dan mengisi 7 tab data: Jadwal, Warta, Liturgi, Keuangan, Statistik, Galeri, dan Users.'}
              {pendingConfirm === 'push-main' &&
                `Aplikasi akan memperbarui dan menimpa isi seluruh 7 tab pada Google Sheet ID "${manualSheetId.trim()}".`}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pendingConfirm === 'create-hymns') executeCreateHymnsSheet();
                  else if (pendingConfirm === 'push-hymns') executePushHymnsSheet();
                  else if (pendingConfirm === 'create-main') executeCreateMainSheet();
                  else executePushMainSheet();
                }}
                className="min-h-[42px] px-4 rounded-xl bg-[#0F2C59] dark:bg-[#D4AF37] text-white dark:text-[#0B1120] text-xs font-semibold cursor-pointer"
              >
                Konfirmasi & Sinkronkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
