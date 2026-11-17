import { PortalState } from '../types';
import { INITIAL_PORTAL_STATE } from '../data/initialData';

const STORAGE_KEY = 'gki_efata_malanu_portal_v1';
const FONT_SCALE_KEY = 'gki_efata_malanu_font_scale';
const THEME_KEY = 'gki_efata_malanu_theme';

export function loadPortalState(): PortalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PORTAL_STATE));
      return INITIAL_PORTAL_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<PortalState>;
    return {
      ...INITIAL_PORTAL_STATE,
      ...parsed,
      profile: { ...INITIAL_PORTAL_STATE.profile, ...(parsed.profile || {}) },
      liturgy: { ...INITIAL_PORTAL_STATE.liturgy, ...(parsed.liturgy || {}) },
      warta: { ...INITIAL_PORTAL_STATE.warta, ...(parsed.warta || {}) },
      finance: { ...INITIAL_PORTAL_STATE.finance, ...(parsed.finance || {}) },
      statistics: { ...INITIAL_PORTAL_STATE.statistics, ...(parsed.statistics || {}) },
      syncConfig: { ...INITIAL_PORTAL_STATE.syncConfig, ...(parsed.syncConfig || {}) },
      schedules: parsed.schedules?.length ? parsed.schedules : INITIAL_PORTAL_STATE.schedules,
      hymns: parsed.hymns?.length ? parsed.hymns : INITIAL_PORTAL_STATE.hymns,
      bibleBooks: parsed.bibleBooks?.length ? parsed.bibleBooks : INITIAL_PORTAL_STATE.bibleBooks,
      gallery: parsed.gallery?.length ? parsed.gallery : INITIAL_PORTAL_STATE.gallery,
      users: parsed.users?.length ? parsed.users : INITIAL_PORTAL_STATE.users,
    };
  } catch {
    return INITIAL_PORTAL_STATE;
  }
}

export function savePortalState(state: PortalState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadFontScale(): number {
  try {
    const raw = localStorage.getItem(FONT_SCALE_KEY);
    const val = raw ? parseFloat(raw) : 1;
    return [1, 1.15, 1.3, 1.5].includes(val) ? val : 1;
  } catch {
    return 1;
  }
}

export function saveFontScale(scale: number): void {
  try {
    localStorage.setItem(FONT_SCALE_KEY, String(scale));
  } catch {
    // ignore
  }
}

export function loadThemePreference(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export async function pushStateToGoogleSheets(
  state: PortalState,
  tabName?: string
): Promise<{ ok: boolean; message: string; syncedAt: string }> {
  const syncedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!state.syncConfig.gasWebAppUrl.trim()) {
    return {
      ok: true,
      syncedAt,
      message: 'Tersimpan di LocalStorage perangkat. URL Google Apps Script belum diisi.',
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      ok: false,
      syncedAt,
      message: 'Sedang offline — data aman tersimpan di LocalStorage dan siap disinkronkan saat online.',
    };
  }

  try {
    const payload = {
      action: 'push',
      tab: tabName || 'ALL',
      updatedAt: new Date().toISOString(),
      data: {
        Jadwal: state.schedules,
        Warta: state.warta,
        Liturgi: state.liturgy,
        Keuangan: state.finance,
        Statistik: state.statistics,
        Galeri: state.gallery,
        Users: state.users.map((u) => ({
          username: u.username,
          displayName: u.displayName,
          roleTitle: u.roleTitle,
          role: u.role,
        })),
      },
    };

    const res = await fetch(state.syncConfig.gasWebAppUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return {
      ok: true,
      syncedAt,
      message: `Sinkronisasi Google Sheets (${tabName || 'Semua Tab'}) berhasil.`,
    };
  } catch (err) {
    return {
      ok: false,
      syncedAt,
      message: `Data tersimpan lokal. Gagal menghubungi Google Apps Script: ${
        err instanceof Error ? err.message : 'Koneksi terputus'
      }`,
    };
  }
}

export async function pullStateFromGoogleSheets(
  gasUrl: string
): Promise<{ ok: boolean; data?: Partial<PortalState>; message: string }> {
  if (!gasUrl.trim()) {
    return { ok: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, message: 'Perangkat offline. Menggunakan cache LocalStorage.' };
  }

  try {
    const res = await fetch(`${gasUrl.trim()}?action=pull`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { ok?: boolean; data?: Record<string, unknown> };
    if (!json?.data) {
      return { ok: false, message: 'Format respons Google Sheets tidak valid.' };
    }
    const mapped: Partial<PortalState> = {};
    if (Array.isArray(json.data.Jadwal)) mapped.schedules = json.data.Jadwal as PortalState['schedules'];
    if (json.data.Warta) mapped.warta = json.data.Warta as PortalState['warta'];
    if (json.data.Liturgi) mapped.liturgy = json.data.Liturgi as PortalState['liturgy'];
    if (json.data.Keuangan) mapped.finance = json.data.Keuangan as PortalState['finance'];
    if (json.data.Statistik) mapped.statistics = json.data.Statistik as PortalState['statistics'];
    if (Array.isArray(json.data.Galeri)) mapped.gallery = json.data.Galeri as PortalState['gallery'];

    return { ok: true, data: mapped, message: 'Data terbaru berhasil ditarik dari Google Sheets.' };
  } catch (err) {
    return {
      ok: false,
      message: `Gagal menarik data dari Google Sheets: ${
        err instanceof Error ? err.message : 'Koneksi error'
      }`,
    };
  }
}

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// Google Apps Script Web App untuk GKI EFATA MALANU
// Tab Spreadsheet yang dibutuhkan: Jadwal, Warta, Liturgi, Keuangan, Statistik, Galeri, Users

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = ['Jadwal', 'Warta', 'Liturgi', 'Keuangan', 'Statistik', 'Galeri'];
  var result = {};
  tabs.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() >= 2) {
      var raw = sheet.getRange(2, 2).getValue();
      try { result[name] = JSON.parse(raw); } catch (err) {}
    }
  });
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = payload.data || {};
  Object.keys(data).forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    sheet.clearContents();
    sheet.getRange(1, 1, 1, 2).setValues([['UpdatedAt', 'JSON_Payload']]);
    sheet.getRange(2, 1, 1, 2).setValues([[payload.updatedAt, JSON.stringify(data[tabName])]]);
  });
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, updatedAt: payload.updatedAt }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
