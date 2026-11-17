export type UserRole = 'jemaat' | 'admin1' | 'admin2' | 'superuser';

export interface AdminUser {
  username: 'admin1' | 'admin2' | 'superuser';
  displayName: string;
  roleTitle: string;
  role: Exclude<UserRole, 'jemaat'>;
  password: string;
}

export type PageId =
  | 'beranda'
  | 'liturgi'
  | 'jadwal'
  | 'warta'
  | 'kidung'
  | 'alkitab'
  | 'layanan'
  | 'keuangan'
  | 'statistik'
  | 'profil'
  | 'galeri'
  | 'kuis'
  | 'suara'
  | 'admin';

export interface SermonAudioItem {
  id: string;
  title: string;
  category: 'Khotbah Minggu' | 'Renungan Suara' | 'Khotbah Unsur';
  preacher: string;
  dateLabel: string;
  durationLabel: string;
  durationSeconds: number;
  scripture: string;
  audioUrl?: string;
  description: string;
  keyPoints: string[];
}

export type HymnBook = 'NR' | 'KJ' | 'PKJ' | 'NKB' | 'DSL';

export interface HymnVerse {
  number: number;
  lines: string[];
}

export interface Hymn {
  id: string;
  book: HymnBook;
  number: number;
  title: string;
  tempoOrTone?: string;
  verses: HymnVerse[];
  refrain?: string[];
}

export interface BibleChapter {
  chapter: number;
  verses: { verse: number; text: string }[];
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'PL' | 'PB';
  chapters: BibleChapter[];
}

export type LiturgyStepType = 'doa' | 'nyanyian' | 'pembacaan' | 'pengakuan' | 'persembahan' | 'berkat';

export interface LiturgyStep {
  id: string;
  order: number;
  title: string;
  type: LiturgyStepType;
  instruction?: string;
  content: string;
  hymnBook?: HymnBook;
  hymnNumber?: number;
  hymnVersesLabel?: string;
  selectedVerseNumbers?: number[];
}

export interface LiturgyData {
  title: string;
  sundayDate: string;
  liturgicalColor: string;
  theme: string;
  pelayanFirman: string;
  liturgos: string;
  pemusik: string;
  pembacaanAlkitab: string;
  steps: LiturgyStep[];
}

export type ScheduleCategory = 'Ibadah Minggu' | 'Ibadah Unsur' | 'Rayon/Sektor/KSP';
export type UnsurType = 'PKB' | 'PW' | 'PAM' | 'PAR' | 'Lansia';

export interface ScheduleItem {
  id: string;
  title: string;
  category: ScheduleCategory;
  unsur?: UnsurType;
  rayon?: string;
  sektor?: string;
  ksp?: string;
  dateLabel: string;
  timeWit: string;
  hostFamily: string;
  address: string;
  pelayanFirman: string;
  mapsQuery: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Sidang & Sakramen' | 'Pelayanan' | 'Diakonia' | 'Umum';
  dateLabel: string;
  summary: string;
}

export interface BirthdayItem {
  id: string;
  name: string;
  type: 'HUT Kelahiran' | 'HUT Pernikahan';
  dateLabel: string;
  wilayah: string;
}

export interface PrayerSupportItem {
  id: string;
  name: string;
  category: 'Sakit' | 'Duka' | 'Pemulihan';
  locationOrNote: string;
  wilayah: string;
}

export interface WartaData {
  editionTitle: string;
  publishDate: string;
  allowPdfDownload: boolean;
  pdfDriveUrl: string;
  announcements: AnnouncementItem[];
  birthdays: BirthdayItem[];
  prayerSupports: PrayerSupportItem[];
}

export interface OfferingBreakdown {
  id: string;
  label: string;
  category: 'Kolekte' | 'Persepuluhan' | 'Syukur' | 'Pembangunan';
  amount: number;
}

export interface FinanceData {
  periodLabel: string;
  kasBalance: number;
  weeklyIncome: number;
  weeklyExpense: number;
  buildingFundCollected: number;
  buildingFundTarget: number;
  buildingFundLabel: string;
  offerings: OfferingBreakdown[];
  notes: string;
}

export interface RayonStat {
  rayon: string;
  sektors: string;
  kkCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface UnsurStat {
  unsur: UnsurType;
  label: string;
  memberCount: number;
}

export interface StatisticsData {
  lastUpdated: string;
  totalBaptized: number;
  totalSidi: number;
  rayonStats: RayonStat[];
  unsurStats: UnsurStat[];
}

export interface GalleryItem {
  id: string;
  title: string;
  dateLabel: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  purpose: string;
}

export interface MajelisMember {
  id: string;
  name: string;
  position: string;
}

export interface ChurchProfileData {
  churchName: string;
  synodName: string;
  klasisName: string;
  yearlyTheme: string;
  weeklyVerseRef: string;
  weeklyVerseText: string;
  address: string;
  whatsappSecretariat: string;
  email: string;
  logoDriveUrl: string;
  mapsEmbedQuery: string;
  historyParagraphs: string[];
  majelis: MajelisMember[];
  bankAccounts: BankAccount[];
}

export interface SyncConfig {
  gasWebAppUrl: string;
  driveFolderUrl: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  hymnsSpreadsheetId?: string;
  hymnsSpreadsheetUrl?: string;
  lastSyncedAt: string | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string;
}

export interface PortalState {
  profile: ChurchProfileData;
  liturgy: LiturgyData;
  schedules: ScheduleItem[];
  warta: WartaData;
  hymns: Hymn[];
  bibleBooks: BibleBook[];
  finance: FinanceData;
  statistics: StatisticsData;
  gallery: GalleryItem[];
  users: AdminUser[];
  syncConfig: SyncConfig;
}
