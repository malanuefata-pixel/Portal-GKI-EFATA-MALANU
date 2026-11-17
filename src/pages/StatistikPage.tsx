import React from 'react';
import { BarChart3, Users } from 'lucide-react';
import { StatisticsData } from '../types';

interface StatistikPageProps {
  statistics: StatisticsData;
}

export const StatistikPage: React.FC<StatistikPageProps> = ({ statistics }) => {
  const totalKK = statistics.rayonStats.reduce((sum, r) => sum + r.kkCount, 0);
  const totalMale = statistics.rayonStats.reduce((sum, r) => sum + r.maleCount, 0);
  const totalFemale = statistics.rayonStats.reduce((sum, r) => sum + r.femaleCount, 0);
  const totalJiwa = totalMale + totalFemale;

  const maxRayonJiwa = Math.max(
    1,
    ...statistics.rayonStats.map((r) => r.maleCount + r.femaleCount)
  );
  const maxUnsur = Math.max(1, ...statistics.unsurStats.map((u) => u.memberCount));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2C59] dark:text-white">
          Data & Statistik Demografi Jemaat
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Pembaruan terakhir: {statistics.lastUpdated} · Tersinkronisasi dengan database Google Sheets jemaat.
        </p>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0F2C59] text-white p-5">
          <p className="text-xs text-slate-300">Total Kepala Keluarga</p>
          <p className="font-mono-num text-3xl font-bold mt-1.5">{totalKK}</p>
          <p className="text-xs text-[#E5A93C] mt-1">4 Rayon · 8 Sektor</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Jiwa Jemaat</p>
          <p className="font-mono-num text-3xl font-bold text-slate-900 dark:text-white mt-1.5">
            {totalJiwa}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Laki-laki: {totalMale} · Perempuan: {totalFemale}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Anggota Baptis</p>
          <p className="font-mono-num text-3xl font-bold text-slate-900 dark:text-white mt-1.5">
            {statistics.totalBaptized}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tercatat di buku induk</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Anggota Sidi</p>
          <p className="font-mono-num text-3xl font-bold text-slate-900 dark:text-white mt-1.5">
            {statistics.totalSidi}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pemilih & peserta perjamuan</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Rayon */}
        <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-[#0F2C59] dark:text-[#E5A93C]" />
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              Sebaran Jemaat per Rayon
            </h2>
          </div>

          <div className="space-y-4">
            {statistics.rayonStats.map((r) => {
              const jiwa = r.maleCount + r.femaleCount;
              const pct = Math.round((jiwa / maxRayonJiwa) * 100);
              return (
                <div key={r.rayon} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{r.rayon}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {r.sektors}
                      </span>
                    </div>
                    <span className="font-mono-num text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                      {r.kkCount} KK · {jiwa} Jiwa
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0F2C59] dark:bg-[#D4AF37]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Per Unsur */}
        <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-display text-lg font-bold text-[#0F2C59] dark:text-white">
              Kategori Unsur Pelayanan
            </h2>
          </div>

          <div className="space-y-4">
            {statistics.unsurStats.map((u) => {
              const pct = Math.round((u.memberCount / maxUnsur) * 100);
              return (
                <div key={u.unsur} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{u.unsur}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {u.label}
                      </span>
                    </div>
                    <span className="font-mono-num text-xs font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                      {u.memberCount} Jiwa
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D4AF37]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Detail Table per Rayon */}
      <section className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Rayon</th>
                <th className="py-3.5 px-4">Cakupan Sektor & KSP</th>
                <th className="py-3.5 px-4 text-right">KK</th>
                <th className="py-3.5 px-4 text-right">Laki-laki</th>
                <th className="py-3.5 px-4 text-right">Perempuan</th>
                <th className="py-3.5 px-6 text-right">Total Jiwa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {statistics.rayonStats.map((r) => (
                <tr key={r.rayon}>
                  <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                    {r.rayon}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {r.sektors}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num">{r.kkCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono-num">{r.maleCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono-num">{r.femaleCount}</td>
                  <td className="py-3.5 px-6 text-right font-mono-num font-bold text-[#0F2C59] dark:text-[#E5A93C]">
                    {r.maleCount + r.femaleCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
