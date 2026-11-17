import { BibleBook } from '../types';

export type CompactBibleTuple = [
  string, // id
  string, // name
  'PL' | 'PB', // testament
  [number, [number, string][]][], // chapters: [chapterNum, [verseNum, text][]]
];

const DB_NAME = 'gki_efata_alkitab_db';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

interface StoredDataset {
  key: 'PL' | 'PB';
  books: BibleBook[];
  cachedAt: string;
}

function expandCompactBooks(rows: CompactBibleTuple[]): BibleBook[] {
  return rows.map(([id, name, testament, chapters]) => ({
    id,
    name,
    testament,
    chapters: chapters.map(([chapter, verses]) => ({
      chapter,
      verses: verses.map(([verse, text]) => ({ verse, text })),
    })),
  }));
}

function openBibleDB(): Promise<IDBDatabase> {
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
    req.onerror = () => reject(req.error || new Error('Gagal membuka IndexedDB Alkitab.'));
  });
}

async function readDataset(key: 'PL' | 'PB'): Promise<StoredDataset | null> {
  try {
    const db = await openBibleDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as StoredDataset | undefined) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function writeDataset(dataset: StoredDataset): Promise<void> {
  try {
    const db = await openBibleDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataset);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback safely if IndexedDB is blocked in private mode
  }
}

export async function loadCachedFullBible(): Promise<{
  pl: BibleBook[];
  pb: BibleBook[];
  cachedAt: string | null;
}> {
  const [plData, pbData] = await Promise.all([readDataset('PL'), readDataset('PB')]);
  return {
    pl: plData?.books || [],
    pb: pbData?.books || [],
    cachedAt: pbData?.cachedAt || plData?.cachedAt || null,
  };
}

async function fetchAndExpandPart(part: 'PL' | 'PB'): Promise<BibleBook[]> {
  const url = part === 'PL' ? '/data/alkitab-pl.json' : '/data/alkitab-pb.json';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengunduh data Alkitab ${part} (${res.status})`);
  }
  const compact = (await res.json()) as CompactBibleTuple[];
  return expandCompactBooks(compact);
}

export async function downloadAndCacheFullBible(
  part: 'ALL' | 'PL' | 'PB' = 'ALL'
): Promise<{ pl: BibleBook[]; pb: BibleBook[]; cachedAt: string }> {
  const existing = await loadCachedFullBible();
  const cachedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let pl = existing.pl;
  let pb = existing.pb;

  if (part === 'ALL' || part === 'PL') {
    pl = await fetchAndExpandPart('PL');
    await writeDataset({ key: 'PL', books: pl, cachedAt });
  }

  if (part === 'ALL' || part === 'PB') {
    pb = await fetchAndExpandPart('PB');
    await writeDataset({ key: 'PB', books: pb, cachedAt });
  }

  return { pl, pb, cachedAt };
}

export function getBibleStats(books: BibleBook[]) {
  let plCount = 0;
  let pbCount = 0;
  let chapterCount = 0;
  let verseCount = 0;

  for (const b of books) {
    if (b.testament === 'PL') plCount++;
    else pbCount++;
    chapterCount += b.chapters.length;
    for (const c of b.chapters) {
      verseCount += c.verses.length;
    }
  }

  return {
    totalBooks: books.length,
    plCount,
    pbCount,
    chapterCount,
    verseCount,
  };
}

export function exportBibleToFile(
  books: BibleBook[],
  scope: 'ALL' | 'PL' | 'PB',
  format: 'txt' | 'json'
): void {
  const filtered =
    scope === 'ALL' ? books : books.filter((b) => b.testament === scope);

  if (filtered.length === 0) return;

  const scopeLabel =
    scope === 'ALL'
      ? 'Alkitab-Lengkap-TB-PL-PB'
      : scope === 'PL'
        ? 'Alkitab-Perjanjian-Lama-TB'
        : 'Alkitab-Perjanjian-Baru-TB';

  let content = '';
  let mimeType = 'text/plain;charset=utf-8';
  let filename = `${scopeLabel}.txt`;

  if (format === 'json') {
    content = JSON.stringify(
      {
        translation: 'Terjemahan Baru (TB)',
        source: 'Portal Jemaat GKI Efata Malanu — Klasis Sorong',
        scope,
        totalBooks: filtered.length,
        books: filtered,
      },
      null,
      2
    );
    mimeType = 'application/json;charset=utf-8';
    filename = `${scopeLabel}.json`;
  } else {
    const lines: string[] = [
      '==============================================================',
      'ALKITAB TERJEMAHAN BARU (TB)',
      scope === 'ALL'
        ? 'Perjanjian Lama (39 Kitab) & Perjanjian Baru (27 Kitab)'
        : scope === 'PL'
          ? 'Perjanjian Lama (39 Kitab)'
          : 'Perjanjian Baru (27 Kitab)',
      'Portal Jemaat GKI Efata Malanu — Klasis Sorong',
      '==============================================================',
      '',
    ];

    for (const book of filtered) {
      lines.push(`\n##############################################################`);
      lines.push(
        `KITAB: ${book.name.toUpperCase()} (${book.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'})`
      );
      lines.push(`##############################################################`);
      for (const ch of book.chapters) {
        lines.push(`\n--- ${book.name} Pasal ${ch.chapter} ---`);
        for (const v of ch.verses) {
          lines.push(`${v.verse}. ${v.text}`);
        }
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
