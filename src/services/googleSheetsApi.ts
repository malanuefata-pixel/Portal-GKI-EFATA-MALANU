import { Hymn, HymnBook, PortalState } from '../types';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

const TAB_TITLES = [
  'Jadwal',
  'Warta',
  'Liturgi',
  'Keuangan',
  'Statistik',
  'Galeri',
  'Users',
  '_SyncSnapshot',
];

function buildSheetValueRanges(state: PortalState) {
  const nowStr = new Date().toLocaleString('id-ID');

  const jadwalRows: (string | number)[][] = [
    [
      'ID',
      'Judul Ibadah',
      'Kategori',
      'Unsur',
      'Rayon',
      'Sektor',
      'KSP',
      'Tanggal',
      'Waktu (WIT)',
      'Tuan Rumah / Lokasi',
      'Alamat',
      'Pelayan Firman',
      'Google Maps Query',
    ],
    ...state.schedules.map((s) => [
      s.id,
      s.title,
      s.category,
      s.unsur || '-',
      s.rayon || '-',
      s.sektor || '-',
      s.ksp || '-',
      s.dateLabel,
      s.timeWit,
      s.hostFamily,
      s.address,
      s.pelayanFirman,
      s.mapsQuery,
    ]),
  ];

  const wartaRows: (string | number | boolean)[][] = [
    ['EDISI WARTA', state.warta.editionTitle, 'TANGGAL TERBIT', state.warta.publishDate],
    [
      'IZINKAN DOWNLOAD PDF',
      state.warta.allowPdfDownload ? 'YA' : 'TIDAK',
      'URL PDF GOOGLE DRIVE',
      state.warta.pdfDriveUrl,
    ],
    [],
    ['PENGUMUMAN JEMAAT', 'Kategori', 'Waktu / Tanggal', 'Ringkasan'],
    ...state.warta.announcements.map((a) => [a.title, a.category, a.dateLabel, a.summary]),
    [],
    ['HUT JEMAAT', 'Jenis HUT', 'Tanggal', 'Wilayah'],
    ...state.warta.birthdays.map((b) => [b.name, b.type, b.dateLabel, b.wilayah]),
    [],
    ['DUKUNGAN DOA', 'Kategori', 'Keterangan / Lokasi', 'Wilayah'],
    ...state.warta.prayerSupports.map((p) => [p.name, p.category, p.locationOrNote, p.wilayah]),
  ];

  const liturgiRows: (string | number)[][] = [
    ['Judul Tata Ibadah', state.liturgy.title, 'Tanggal', state.liturgy.sundayDate],
    ['Warna Liturgi', state.liturgy.liturgicalColor, 'Tema', state.liturgy.theme],
    ['Pelayan Firman', state.liturgy.pelayanFirman, 'Liturgos', state.liturgy.liturgos],
    ['Pemusik', state.liturgy.pemusik, 'Pembacaan Alkitab', state.liturgy.pembacaanAlkitab],
    [],
    ['Urutan', 'Bagian Liturgi', 'Tipe', 'Petunjuk', 'Konten', 'Buku Nyanyian', 'No. Lagu', 'Label Ayat'],
    ...state.liturgy.steps.map((st) => [
      st.order,
      st.title,
      st.type,
      st.instruction || '-',
      st.content,
      st.hymnBook || '-',
      st.hymnNumber || '-',
      st.hymnVersesLabel || '-',
    ]),
  ];

  const keuanganRows: (string | number)[][] = [
    ['Periode Laporan', state.finance.periodLabel],
    ['Saldo Kas Jemaat (IDR)', state.finance.kasBalance],
    ['Penerimaan Minggu Lalu (IDR)', state.finance.weeklyIncome],
    ['Pengeluaran Pelayanan (IDR)', state.finance.weeklyExpense],
    ['Dana Pembangunan Terkumpul (IDR)', state.finance.buildingFundCollected],
    ['Target Dana Pembangunan (IDR)', state.finance.buildingFundTarget],
    ['Keterangan Pembangunan', state.finance.buildingFundLabel],
    [],
    ['ID', 'Jenis Persembahan', 'Kategori', 'Jumlah (IDR)'],
    ...state.finance.offerings.map((o) => [o.id, o.label, o.category, o.amount]),
  ];

  const statistikRows: (string | number)[][] = [
    ['Pembaruan Terakhir', state.statistics.lastUpdated],
    ['Total Anggota Baptis', state.statistics.totalBaptized],
    ['Total Anggota Sidi', state.statistics.totalSidi],
    [],
    ['Rayon', 'Cakupan Sektor', 'Jumlah KK', 'Laki-laki', 'Perempuan', 'Total Jiwa'],
    ...state.statistics.rayonStats.map((r) => [
      r.rayon,
      r.sektors,
      r.kkCount,
      r.maleCount,
      r.femaleCount,
      r.maleCount + r.femaleCount,
    ]),
    [],
    ['Unsur', 'Nama Unsur Pelayanan', 'Jumlah Anggota'],
    ...state.statistics.unsurStats.map((u) => [u.unsur, u.label, u.memberCount]),
  ];

  const galeriRows: (string | number)[][] = [
    ['ID', 'Judul Kegiatan', 'Tanggal', 'Kategori', 'URL Gambar Drive', 'Keterangan'],
    ...state.gallery.map((g) => [
      g.id,
      g.title,
      g.dateLabel,
      g.category,
      g.imageUrl || '-',
      g.caption,
    ]),
  ];

  const usersRows: (string | number)[][] = [
    ['Username', 'Nama Tampilan', 'Jabatan / Peran', 'Role'],
    ...state.users.map((u) => [u.username, u.displayName, u.roleTitle, u.role]),
  ];

  const snapshotPayload = {
    schedules: state.schedules,
    warta: state.warta,
    liturgy: state.liturgy,
    finance: state.finance,
    statistics: state.statistics,
    gallery: state.gallery,
  };

  const snapshotJson = JSON.stringify(snapshotPayload);
  // Google Sheets single cell limit is 50,000 chars; split safely if ever large
  const chunkSize = 40000;
  const chunks: string[][] = [];
  for (let i = 0; i < snapshotJson.length; i += chunkSize) {
    chunks.push([snapshotJson.slice(i, i + chunkSize)]);
  }

  const snapshotRows: (string | number)[][] = [
    ['UpdatedAt', nowStr, 'ChunksCount', chunks.length],
    ...chunks,
  ];

  return [
    { range: 'Jadwal!A1', values: jadwalRows },
    { range: 'Warta!A1', values: wartaRows },
    { range: 'Liturgi!A1', values: liturgiRows },
    { range: 'Keuangan!A1', values: keuanganRows },
    { range: 'Statistik!A1', values: statistikRows },
    { range: 'Galeri!A1', values: galeriRows },
    { range: 'Users!A1', values: usersRows },
    { range: '_SyncSnapshot!A1', values: snapshotRows },
  ];
}

export async function createNewChurchSpreadsheet(
  accessToken: string,
  state: PortalState
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = `Database GKI Efata Malanu — ${new Date().toLocaleDateString('id-ID')}`;

  const createRes = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        timeZone: 'Asia/Jayapura',
      },
      sheets: TAB_TITLES.map((tabName) => ({
        properties: {
          title: tabName,
          hidden: tabName === '_SyncSnapshot',
        },
      })),
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat Google Sheet baru (${createRes.status}): ${errText}`);
  }

  const created = (await createRes.json()) as {
    spreadsheetId: string;
    spreadsheetUrl: string;
  };

  await syncAllDataToSpreadsheet(accessToken, created.spreadsheetId, state);

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title,
  };
}

export async function syncAllDataToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  state: PortalState
): Promise<void> {
  // Ensure required tabs exist first by checking spreadsheet metadata
  const metaRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Tidak dapat mengakses spreadsheet (${metaRes.status}): ${errText}`);
  }

  const metaJson = (await metaRes.json()) as {
    sheets?: { properties?: { title?: string } }[];
  };
  const existingTitles = new Set(
    (metaJson.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  const missingTabs = TAB_TITLES.filter((t) => !existingTitles.has(t));
  if (missingTabs.length > 0) {
    await fetch(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: missingTabs.map((t) => ({
          addSheet: {
            properties: {
              title: t,
              hidden: t === '_SyncSnapshot',
            },
          },
        })),
      }),
    });
  }

  // Clear existing ranges before writing fresh tables
  await fetch(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: TAB_TITLES.map((t) => `${t}!A1:Z500`),
    }),
  });

  // Batch write all 7 structured tabs + snapshot
  const valueRanges = buildSheetValueRanges(state);
  const updateRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueRanges,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal menulis data ke Google Sheet (${updateRes.status}): ${errText}`);
  }
}

export async function pullDataFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Partial<PortalState>> {
  const res = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
      '_SyncSnapshot!A1:D50'
    )}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membaca data dari Google Sheet (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as { values?: string[][] };
  const rows = json.values || [];
  if (rows.length < 2) {
    throw new Error('Snapshot data belum tersedia di spreadsheet ini.');
  }

  const combinedJson = rows
    .slice(1)
    .map((r) => r[0] || '')
    .join('');
  const parsed = JSON.parse(combinedJson) as Partial<PortalState>;
  return parsed;
}

const HYMNBOOK_TABS: { book: HymnBook; tabTitle: string }[] = [
  { book: 'NR', tabTitle: 'Mazmur & Nyanyian Rohani' },
  { book: 'KJ', tabTitle: 'Kidung Jemaat' },
  { book: 'PKJ', tabTitle: 'Pelengkap Kidung Jemaat' },
  { book: 'NKB', tabTitle: 'Nyanyian Kidung Baru' },
  { book: 'DSL', tabTitle: 'Dua Sahabat Lama' },
];

function buildHymnValueRanges(hymns: Hymn[]) {
  const header = [
    'Nomor',
    'Judul Lagu',
    'Nada / Tempo',
    'Refrein',
    'Bait 1',
    'Bait 2',
    'Bait 3',
    'Bait 4',
    'Bait 5',
    'Bait 6',
  ];

  return HYMNBOOK_TABS.map(({ book, tabTitle }) => {
    const bookHymns = hymns
      .filter((h) => h.book === book)
      .slice()
      .sort((a, b) => a.number - b.number);

    const rows: (string | number)[][] = [
      header,
      ...bookHymns.map((h) => {
        const verseCells: string[] = [];
        for (let vNum = 1; vNum <= 6; vNum++) {
          const found = h.verses.find((v) => v.number === vNum);
          verseCells.push(found ? found.lines.join('\n') : '');
        }
        return [
          h.number,
          h.title,
          h.tempoOrTone || '',
          h.refrain ? h.refrain.join('\n') : '',
          ...verseCells,
        ];
      }),
    ];

    return {
      range: `'${tabTitle}'!A1`,
      values: rows,
    };
  });
}

export async function createNewHymnsSpreadsheet(
  accessToken: string,
  hymns: Hymn[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = `Kidung Pujian GKI Efata Malanu — ${new Date().toLocaleDateString('id-ID')}`;

  const createRes = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        timeZone: 'Asia/Jayapura',
      },
      sheets: HYMNBOOK_TABS.map(({ tabTitle }) => ({
        properties: { title: tabTitle },
      })),
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat Google Sheet Kidung Pujian (${createRes.status}): ${errText}`);
  }

  const created = (await createRes.json()) as {
    spreadsheetId: string;
    spreadsheetUrl: string;
  };

  await syncHymnsToSpreadsheet(accessToken, created.spreadsheetId, hymns);

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title,
  };
}

export async function syncHymnsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  hymns: Hymn[]
): Promise<void> {
  const metaRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Tidak dapat mengakses spreadsheet Kidung (${metaRes.status}): ${errText}`);
  }

  const metaJson = (await metaRes.json()) as {
    sheets?: { properties?: { title?: string } }[];
  };
  const existingTitles = new Set(
    (metaJson.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  const missingTabs = HYMNBOOK_TABS.map((t) => t.tabTitle).filter((t) => !existingTitles.has(t));
  if (missingTabs.length > 0) {
    await fetch(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: missingTabs.map((t) => ({
          addSheet: { properties: { title: t } },
        })),
      }),
    });
  }

  await fetch(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: HYMNBOOK_TABS.map((t) => `'${t.tabTitle}'!A1:J2000`),
    }),
  });

  const valueRanges = buildHymnValueRanges(hymns);
  const updateRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueRanges,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal menulis Kidung Pujian ke Google Sheet (${updateRes.status}): ${errText}`);
  }
}

export async function pullHymnsFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<Hymn[]> {
  const metaRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Gagal membaca metadata sheet Kidung (${metaRes.status}): ${errText}`);
  }

  const metaJson = (await metaRes.json()) as {
    sheets?: { properties?: { title?: string } }[];
  };
  const existingTitles = new Set(
    (metaJson.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  const matchingTabs = HYMNBOOK_TABS.filter((t) => existingTitles.has(t.tabTitle));
  if (matchingTabs.length === 0) {
    throw new Error('Tab Kidung Pujian (NR, KJ, PKJ, NKB, DSL) tidak ditemukan pada spreadsheet ini.');
  }

  const rangesQuery = matchingTabs
    .map((t) => `ranges=${encodeURIComponent(`'${t.tabTitle}'!A2:J2000`)}`)
    .join('&');

  const batchRes = await fetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchGet?${rangesQuery}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Gagal membaca data Kidung Pujian (${batchRes.status}): ${errText}`);
  }

  const batchJson = (await batchRes.json()) as {
    valueRanges?: { values?: string[][] }[];
  };

  const parsedHymns: Hymn[] = [];
  (batchJson.valueRanges || []).forEach((vr, idx) => {
    const book = matchingTabs[idx]?.book;
    if (!book) return;
    const rows = vr.values || [];
    rows.forEach((row) => {
      const num = parseInt((row[0] || '').trim(), 10);
      const title = (row[1] || '').trim();
      if (!num || !title) return;

      const tempoOrTone = (row[2] || '').trim() || undefined;
      const refrainRaw = (row[3] || '').trim();
      const refrain = refrainRaw
        ? refrainRaw
            .split(/\r?\n|\|\|/)
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;

      const verses: { number: number; lines: string[] }[] = [];
      for (let i = 0; i < 6; i++) {
        const cell = (row[4 + i] || '').trim();
        if (cell) {
          const lines = cell
            .split(/\r?\n|\|\|/)
            .map((l) => l.trim())
            .filter(Boolean);
          if (lines.length > 0) {
            verses.push({ number: i + 1, lines });
          }
        }
      }

      if (verses.length === 0) {
        verses.push({ number: 1, lines: [title] });
      }

      parsedHymns.push({
        id: `${book.toLowerCase()}-${num}`,
        book,
        number: num,
        title,
        tempoOrTone,
        verses,
        refrain,
      });
    });
  });

  if (parsedHymns.length === 0) {
    throw new Error('Tidak ada baris lagu yang valid ditemukan di Google Sheet.');
  }

  return parsedHymns;
}
