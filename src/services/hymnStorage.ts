import { Hymn, HymnBook } from '../types';

const DB_NAME = 'gki_efata_kidung_db';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';
const DATASET_KEY = 'ALL_HYMNS';

const BOOK_FULL_NAMES: Record<HymnBook, string> = {
  NR: 'Mazmur & Nyanyian Rohani',
  KJ: 'Kidung Jemaat',
  PKJ: 'Pelengkap Kidung Jemaat',
  NKB: 'Nyanyian Kidung Baru',
  DSL: 'Dua Sahabat Lama',
};

interface StoredHymnDataset {
  key: string;
  hymns: Hymn[];
  cachedAt: string;
}

function openHymnDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak tersedia di browser ini.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Gagal membuka IndexedDB Kidung Pujian.'));
  });
}

export async function loadCachedFullHymns(): Promise<{
  hymns: Hymn[];
  cachedAt: string | null;
}> {
  try {
    const db = await openHymnDB();
    const res = await new Promise<StoredHymnDataset | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(DATASET_KEY);
      req.onsuccess = () => resolve((req.result as StoredHymnDataset | undefined) || null);
      req.onerror = () => reject(req.error);
    });
    return {
      hymns: res?.hymns || [],
      cachedAt: res?.cachedAt || null,
    };
  } catch {
    return { hymns: [], cachedAt: null };
  }
}

async function saveFullHymnsToDB(dataset: StoredHymnDataset): Promise<void> {
  try {
    const db = await openHymnDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataset);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore storage block in restricted modes
  }
}

export async function downloadAndCacheFullHymns(): Promise<{
  hymns: Hymn[];
  cachedAt: string;
}> {
  const res = await fetch('/data/kidung-pujian.json');
  if (!res.ok) {
    throw new Error(`Gagal mengunduh database Kidung Pujian (${res.status})`);
  }
  const hymns = (await res.json()) as Hymn[];
  const cachedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  await saveFullHymnsToDB({ key: DATASET_KEY, hymns, cachedAt });
  return { hymns, cachedAt };
}

export function mergeHymns(baseHymns: Hymn[], overrideHymns: Hymn[]): Hymn[] {
  if (baseHymns.length === 0) return overrideHymns;
  const map = new Map<string, Hymn>();
  for (const h of baseHymns) {
    map.set(h.id, h);
  }
  for (const h of overrideHymns) {
    map.set(h.id, h);
  }
  const bookOrder: Record<HymnBook, number> = {
    NR: 0,
    KJ: 1,
    PKJ: 2,
    NKB: 3,
    DSL: 4,
  };
  return Array.from(map.values()).sort((a, b) => {
    const bo = bookOrder[a.book] - bookOrder[b.book];
    return bo !== 0 ? bo : a.number - b.number;
  });
}

export function getHymnBookStats(hymns: Hymn[]) {
  const counts: Record<HymnBook, number> = {
    NR: 0,
    KJ: 0,
    PKJ: 0,
    NKB: 0,
    DSL: 0,
  };
  for (const h of hymns) {
    counts[h.book] = (counts[h.book] || 0) + 1;
  }
  return {
    total: hymns.length,
    counts,
  };
}

export function exportHymnsToFile(
  hymns: Hymn[],
  scope: 'ALL' | HymnBook,
  format: 'txt' | 'json'
): void {
  const filtered = scope === 'ALL' ? hymns : hymns.filter((h) => h.book === scope);
  if (filtered.length === 0) return;

  const scopeSlug =
    scope === 'ALL'
      ? 'Kidung-Pujian-Lengkap-NR-KJ-PKJ-NKB-DSL'
      : `Kidung-${scope}-${BOOK_FULL_NAMES[scope].replace(/[^a-zA-Z0-9]+/g, '-')}`;

  let content = '';
  let mimeType = 'text/plain;charset=utf-8';
  let filename = `${scopeSlug}.txt`;

  if (format === 'json') {
    content = JSON.stringify(
      {
        source: 'Portal Jemaat GKI Efata Malanu — Klasis Sorong',
        scope: scope === 'ALL' ? 'Semua 5 Buku Kidung Pujian' : BOOK_FULL_NAMES[scope],
        totalHymns: filtered.length,
        hymns: filtered,
      },
      null,
      2
    );
    mimeType = 'application/json;charset=utf-8';
    filename = `${scopeSlug}.json`;
  } else {
    const lines: string[] = [
      '==============================================================',
      'KIDUNG PUJIAN JEMAAT GKI EFATA MALANU — KLASIS SORONG',
      scope === 'ALL'
        ? 'Mazmur & Nyanyian Rohani (NR), Kidung Jemaat (KJ), Pelengkap Kidung Jemaat (PKJ), Nyanyian Kidung Baru (NKB), Dua Sahabat Lama (DSL)'
        : `${BOOK_FULL_NAMES[scope]} (${scope})`,
      `Total Lagu: ${filtered.length}`,
      '==============================================================',
      '',
    ];

    for (const h of filtered) {
      lines.push('--------------------------------------------------------------');
      lines.push(`${h.book} No. ${h.number} — ${h.title} (${BOOK_FULL_NAMES[h.book]})`);
      if (h.tempoOrTone) {
        lines.push(`Nada/Tempo: ${h.tempoOrTone}`);
      }
      lines.push('');
      for (const v of h.verses) {
        lines.push(`Bait ${v.number}:`);
        for (const ln of v.lines) {
          lines.push(`  ${ln}`);
        }
        lines.push('');
      }
      if (h.refrain && h.refrain.length > 0) {
        lines.push('Refrein:');
        for (const ln of h.refrain) {
          lines.push(`  ${ln}`);
        }
        lines.push('');
      }
    }

    content = lines.join('\n');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
