'use client';

import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  Calculator,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info,
  BarChart3,
  Target,
  ShieldCheck,
} from 'lucide-react';
import type { University, SubtestKey, SubtestScores } from '@/db/schema';
import type { EnrichedProgram } from '@/db/queries';
import {
  predictPersonalSnbp,
  predictPersonalSnbt,
  type SubtestWeights,
} from '@/lib/scoring-engine';
import SubtestRadarChart from './SubtestRadarChart';
import SearchableSelect from './SearchableSelect';

interface PTNdictionClientProps {
  universities: University[];
  programs: EnrichedProgram[];
}

const SUBTEST_META: { key: SubtestKey; name: string; badgeClass: string }[] = [
  { key: 'PU', name: 'Penalaran Umum', badgeClass: 'bg-blue-600 text-white' },
  { key: 'PPU', name: 'Pengetahuan & Pemahaman Umum', badgeClass: 'bg-indigo-600 text-white' },
  { key: 'PBM', name: 'Pemahaman Bacaan & Menulis', badgeClass: 'bg-sky-600 text-white' },
  { key: 'PK', name: 'Pengetahuan Kuantitatif', badgeClass: 'bg-amber-500 text-white' },
  { key: 'LBI', name: 'Literasi Bahasa Indonesia', badgeClass: 'bg-emerald-600 text-white' },
  { key: 'LBE', name: 'Literasi Bahasa Inggris', badgeClass: 'bg-violet-600 text-white' },
  { key: 'PM', name: 'Penalaran Matematika', badgeClass: 'bg-rose-600 text-white' },
];

function getTightnessBadgeStyle(label: string) {
  switch (label) {
    case 'Longgar':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'Sedang':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'Ketat':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    default:
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
  }
}

function getStatusBannerStyle(status: string) {
  switch (status) {
    case 'Sangat Kompetitif':
      return 'bg-gradient-to-br from-emerald-950 via-emerald-900/90 to-zinc-900 border border-emerald-500/40 text-emerald-100';
    case 'Kompetitif':
      return 'bg-gradient-to-br from-emerald-950/80 via-teal-950/80 to-zinc-900 border border-emerald-600/35 text-emerald-100';
    case 'Cukup Berpeluang':
      return 'bg-gradient-to-br from-amber-950 via-orange-950/90 to-zinc-900 border border-amber-500/40 text-amber-100';
    default:
      return 'bg-gradient-to-br from-rose-950 via-red-950/90 to-zinc-900 border border-rose-500/40 text-rose-100';
  }
}

export default function PTNdictionClient({
  universities,
  programs,
}: PTNdictionClientProps) {
  const defaultProgram = programs[0];

  const [selectedUnivId, setSelectedUnivId] = useState<number>(
    defaultProgram?.universityId ?? universities[0]?.id ?? 0
  );
  const [selectedProgramId, setSelectedProgramId] = useState<number>(
    defaultProgram?.id ?? 0
  );
  const [activePathway, setActivePathway] = useState<'SNBP' | 'SNBT'>('SNBP');
  const [historyTab, setHistoryTab] = useState<'SNBP' | 'SNBT'>('SNBP');

  // State Input SNBP
  const [avgAllSubjects, setAvgAllSubjects] = useState<string>('86.50');
  const [avgSupportingSubject, setAvgSupportingSubject] = useState<string>('88.00');
  const [achievementBonus, setAchievementBonus] = useState<number>(0);
  const [tkaScore, setTkaScore] = useState<string>('550');

  // State Input SNBT (7 Subtes)
  const [subtestInputs, setSubtestInputs] = useState<SubtestScores>({
    PU: 665,
    PPU: 650,
    PBM: 645,
    PK: 675,
    LBI: 655,
    LBE: 660,
    PM: 670,
  });

  // Daftar prodi sesuai PTN terpilih
  const availablePrograms = useMemo(
    () => programs.filter((p) => p.universityId === selectedUnivId),
    [programs, selectedUnivId]
  );

  // Objek prodi aktif
  const currentProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) ?? availablePrograms[0] ?? programs[0],
    [programs, selectedProgramId, availablePrograms]
  );

  const handleUniversityChange = (univId: number) => {
    setSelectedUnivId(univId);
    const firstProdi = programs.find((p) => p.universityId === univId);
    if (firstProdi) {
      setSelectedProgramId(firstProdi.id);
    }
  };

  const handleSelectAlternative = (altProgram: EnrichedProgram) => {
    setSelectedUnivId(altProgram.universityId);
    setSelectedProgramId(altProgram.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePathwaySwitch = (pathway: 'SNBP' | 'SNBT') => {
    setActivePathway(pathway);
    setHistoryTab(pathway);
  };

  // Ekstrak bobot 7 subtes
  const weights: SubtestWeights = useMemo(() => {
    if (!currentProgram) {
      return { PU: 0.16, PPU: 0.12, PBM: 0.1, PK: 0.2, LBI: 0.12, LBE: 0.12, PM: 0.18 };
    }
    const mg = currentProgram.majorGroup;
    return {
      PU: Number(mg.weightPu),
      PPU: Number(mg.weightPpu),
      PBM: Number(mg.weightPbm),
      PK: Number(mg.weightPk),
      LBI: Number(mg.weightLbi),
      LBE: Number(mg.weightLbe),
      PM: Number(mg.weightPm),
    };
  }, [currentProgram]);

  // Sanitasi & pembatasan rentang angka (clamping)
  const clampNumber = (val: number, min: number, max: number) => {
    if (isNaN(val)) return min;
    return Math.min(Math.max(val, min), max);
  };

  // Validasi URL eksternal hanya protokol http/https
  const isValidHttpUrl = (url?: string | null): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Kalkulasi Prediksi Personal Real-time
  const personalPrediction = useMemo(() => {
    if (!currentProgram) return null;
    const bm = currentProgram.benchmark;

    if (activePathway === 'SNBP') {
      const rawAll = parseFloat(avgAllSubjects) || 0;
      const rawSupp = parseFloat(avgSupportingSubject) || 0;
      const rawTka = parseFloat(tkaScore) || 0;

      return predictPersonalSnbp(
        {
          avgAllSubjects: clampNumber(rawAll, 0, 100),
          avgSupportingSubject: clampNumber(rawSupp, 0, 100),
          achievementBonus: clampNumber(achievementBonus, 0, 3),
          tkaScore: clampNumber(rawTka, 200, 800),
        },
        Number(bm.snbpBaseChance),
        Number(bm.snbpTargetReport)
      );
    }

    const sanitizedSubtests: SubtestScores = {
      PU: clampNumber(subtestInputs.PU ?? 0, 200, 1000),
      PPU: clampNumber(subtestInputs.PPU ?? 0, 200, 1000),
      PBM: clampNumber(subtestInputs.PBM ?? 0, 200, 1000),
      PK: clampNumber(subtestInputs.PK ?? 0, 200, 1000),
      LBI: clampNumber(subtestInputs.LBI ?? 0, 200, 1000),
      LBE: clampNumber(subtestInputs.LBE ?? 0, 200, 1000),
      PM: clampNumber(subtestInputs.PM ?? 0, 200, 1000),
    };

    return predictPersonalSnbt(
      sanitizedSubtests,
      weights,
      Number(bm.snbtBaseChance),
      bm.snbtTargetWeighted
    );
  }, [
    currentProgram,
    activePathway,
    avgAllSubjects,
    avgSupportingSubject,
    achievementBonus,
    tkaScore,
    subtestInputs,
    weights,
  ]);

  // Filter riwayat kuota vs peminat sesuai tab aktif
  const filteredHistories = useMemo(() => {
    if (!currentProgram) return [];
    return currentProgram.histories
      .filter((h) => h.pathway === historyTab)
      .sort((a, b) => a.year - b.year);
  }, [currentProgram, historyTab]);

  const maxHistoryValue = useMemo(() => {
    let max = 1;
    for (const h of filteredHistories) {
      if (h.quota && h.quota > max) max = h.quota;
      if (h.applicants && h.applicants > max) max = h.applicants;
    }
    return max;
  }, [filteredHistories]);

  // Cari prodi alternatif sejenis dengan peluang lebih besar
  const alternativePrograms = useMemo(() => {
    if (!currentProgram) return [];
    const currentChance =
      activePathway === 'SNBP'
        ? Number(currentProgram.benchmark.snbpBaseChance)
        : Number(currentProgram.benchmark.snbtBaseChance);

    const sameMajor = programs.filter(
      (p) =>
        p.id !== currentProgram.id &&
        p.normalizedMajorName === currentProgram.normalizedMajorName &&
        p.degree === currentProgram.degree
    );

    const pool =
      sameMajor.length > 0
        ? sameMajor
        : programs.filter(
            (p) => p.id !== currentProgram.id && p.majorGroupId === currentProgram.majorGroupId
          );

    return pool
      .filter((p) => {
        const altChance =
          activePathway === 'SNBP'
            ? Number(p.benchmark.snbpBaseChance)
            : Number(p.benchmark.snbtBaseChance);
        return altChance > currentChance;
      })
      .sort((a, b) => {
        const aVal =
          activePathway === 'SNBP'
            ? Number(a.benchmark.snbpBaseChance)
            : Number(a.benchmark.snbtBaseChance);
        const bVal =
          activePathway === 'SNBP'
            ? Number(b.benchmark.snbpBaseChance)
            : Number(b.benchmark.snbtBaseChance);
        return bVal - aVal;
      })
      .slice(0, 4);
  }, [currentProgram, programs, activePathway]);

  if (!currentProgram || !personalPrediction) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-slate-600">Data program studi belum tersedia.</p>
      </div>
    );
  }

  const { university, majorGroup, benchmark } = currentProgram;
  const numericTka = parseFloat(tkaScore) || 0;
  const isTkaAdequate = numericTka >= benchmark.snbpTargetTka;

  const activeTrendPct =
    activePathway === 'SNBP'
      ? Number(benchmark.snbp3yrTrendPct)
      : Number(benchmark.snbt3yrTrendPct);
  const active3yrAvg =
    activePathway === 'SNBP'
      ? Number(benchmark.snbp3yrAvgChance)
      : Number(benchmark.snbt3yrAvgChance);
  const activeRank =
    activePathway === 'SNBP' ? benchmark.snbpNationalRank : benchmark.snbtNationalRank;
  const activeTotal =
    activePathway === 'SNBP' ? benchmark.snbpNationalTotal : benchmark.snbtNationalTotal;
  const activeSeatRatio =
    activePathway === 'SNBP' ? benchmark.snbpSeatRatio : benchmark.snbtSeatRatio;
  const activeLatestQuota =
    activePathway === 'SNBP' ? benchmark.snbpLatestQuota : benchmark.snbtLatestQuota;
  const activeLatestApplicants =
    activePathway === 'SNBP' ? benchmark.snbpLatestApplicants : benchmark.snbtLatestApplicants;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 w-full bg-neutral-950 pt-4 pb-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-lg shadow-black/40 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  PTN<span className="text-blue-600">diction</span>
                </span>
                <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                  Rasionalisasi & Analitik SNPMB Indonesia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% Gratis • Data 2021–2026
              </span>
            </div>
          </header>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* KOLOM KIRI: KALKULATOR INPUT RASIONALISASI */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:max-h-[calc(100vh-7rem)]">
              {/* Header Kartu Fixed */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Input Data Rasionalisasi
                  </h2>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                  {currentProgram.snpmbCode}
                </span>
              </div>

              {/* Form Content Area - semua komponen dalam satu container padding */}
              <div className="flex-1 space-y-4 px-5 py-5 pb-6 lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                {/* Pilih Perguruan Tinggi */}
                <div className="space-y-3">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    1. Pilih Perguruan Tinggi Negeri
                  </label>
                  <SearchableSelect
                    value={selectedUnivId}
                    options={universities.map((u) => ({
                      value: u.id,
                      label: u.name,
                      sublabel: u.province,
                    }))}
                    onSelect={(id) => handleUniversityChange(Number(id))}
                  />
                </div>

                {/* Pilih Program Studi */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    2. Pilih Program Studi
                  </label>
                  <SearchableSelect
                    value={selectedProgramId}
                    options={availablePrograms.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.degree})`,
                      sublabel: `Kode: ${p.snpmbCode}`,
                    }))}
                    onSelect={(id) => setSelectedProgramId(Number(id))}
                  />
                </div>

                {/* Switcher Jalur Seleksi */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    3. Jalur Seleksi
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                    {(['SNBP', 'SNBT'] as const).map((pathway) => (
                      <button
                        key={pathway}
                        type="button"
                        onClick={() => handlePathwaySwitch(pathway)}
                        className={`rounded-lg py-2 text-sm font-bold transition ${
                          activePathway === pathway
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {pathway === 'SNBP' ? 'SNBP (Rapor)' : 'SNBT (UTBK)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Dinamis SNBP vs SNBT */}
                {activePathway === 'SNBP' ? (
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Input Nilai Rapor (Sem 1–5)
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAvgAllSubjects(
                            (Number(benchmark.snbpTargetReport) - 0.5).toFixed(2)
                          );
                          setAvgSupportingSubject(
                            (Number(benchmark.snbpTargetReport) + 1.0).toFixed(2)
                          );
                        }}
                        className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Isi Nilai Aman
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Rata-rata Semua Mata Pelajaran (Bobot 65%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      max="100"
                      value={avgAllSubjects}
                      onChange={(e) => setAvgAllSubjects(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Rata-rata Mapel Pendukung:{' '}
                      <span className="font-bold text-blue-700">
                        {majorGroup.supportingSubjects.join(', ')}
                      </span>{' '}
                      (Bobot 35%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      max="100"
                      value={avgSupportingSubject}
                      onChange={(e) => setAvgSupportingSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Bonus Prestasi
                      </label>
                      <select
                        value={achievementBonus}
                        onChange={(e) => setAchievementBonus(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                      >
                        <option value={0}>Tanpa Prestasi (+0)</option>
                        <option value={0.5}>Kabupaten/Kota (+0.5)</option>
                        <option value={1.0}>Provinsi (+1.0)</option>
                        <option value={2.0}>Nasional/Internasional (+2.0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Nilai TKA (200–800)
                      </label>
                      <input
                        type="number"
                        min="200"
                        max="800"
                        value={tkaScore}
                        onChange={(e) => setTkaScore(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Input Skor 7 Subtes UTBK / Tryout
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubtestInputs({ ...benchmark.snbtTargetSubtests })}
                      className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Isi Skor Target
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {SUBTEST_META.map((sub) => {
                      const isPriority = majorGroup.prioritySubtests.includes(sub.key);
                      return (
                        <div
                          key={sub.key}
                          className={`rounded-xl border p-2.5 ${
                            isPriority
                              ? 'border-blue-200 bg-blue-50/40'
                              : 'border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800">
                              {sub.key}
                            </span>
                            {isPriority && (
                              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                Prioritas
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            min="200"
                            max="1000"
                            value={subtestInputs[sub.key]}
                            onChange={(e) =>
                              setSubtestInputs((prev) => ({
                                ...prev,
                                [sub.key]: Number(e.target.value) || 0,
                              }))
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
            </div>
          </aside>

          {/* KOLOM KANAN: HASIL PREDIKSI & 10 KOMPONEN ANALITIK PRODI */}
          <section className="space-y-5 lg:col-span-7">
            {/* HERO CARD: HASIL RASIONALISASI PERSONAL */}
            <div
              className={`rounded-2xl bg-gradient-to-br ${getStatusBannerStyle(
                personalPrediction.statusLabel
              )} p-6 text-white shadow-md`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hasil Rasionalisasi {activePathway} {benchmark.targetYear}
                  </span>
                  <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight">
                    {currentProgram.name} ({currentProgram.degree})
                  </h1>
                  <p className="text-sm font-medium text-white/90">
                    {university.name} • {university.province}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 px-4 py-3 text-right backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                    Peluang Lolos Kamu
                  </p>
                  <p className="font-mono text-3xl font-black">
                    {personalPrediction.personalChance.toString().replace('.', ',')}%
                  </p>
                  <span className="mt-0.5 inline-block rounded-md bg-white px-2 py-0.5 text-[11px] font-extrabold text-slate-900">
                    {personalPrediction.statusLabel}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-black/15 p-3.5">
                <div>
                  <p className="text-[11px] text-white/75">
                    {activePathway === 'SNBP' ? 'Rapor Gabungan Kamu' : 'Skor Terbobot Kamu'}
                  </p>
                  <p className="font-mono text-lg font-extrabold">
                    {activePathway === 'SNBP'
                      ? personalPrediction.userScore.toFixed(2).replace('.', ',')
                      : personalPrediction.userScore}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-white/75">Target PTNdiction</p>
                  <p className="font-mono text-lg font-extrabold">
                    {activePathway === 'SNBP'
                      ? Number(personalPrediction.targetScore).toFixed(2).replace('.', ',')
                      : personalPrediction.targetScore}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-white/75">Selisih Skor</p>
                  <p className="font-mono text-lg font-extrabold">
                    {personalPrediction.delta >= 0 ? '+' : ''}
                    {activePathway === 'SNBP'
                      ? personalPrediction.delta.toFixed(2).replace('.', ',')
                      : personalPrediction.delta}
                  </p>
                </div>
              </div>

              <p className="mt-3.5 text-xs leading-relaxed text-white/95">
                {personalPrediction.summary}
              </p>
            </div>

            {/* KOMPONEN 1: ESTIMASI PELUANG 2027 (SNBP vs SNBT) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                Estimasi peluang {benchmark.targetYear}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Kuota 2026 (terbaru) ÷ peminat 2025 (terbaru). Kuota {benchmark.targetYear} belum
                diumumkan.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Kartu SNBP */}
                <div
                  onClick={() => handlePathwaySwitch('SNBP')}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    activePathway === 'SNBP'
                      ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    SNBP
                  </span>
                  <p className="mt-1 font-mono text-3xl font-extrabold text-slate-900">
                    {Math.round(Number(benchmark.snbpBaseChance))}%
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    kuota 2026: <strong>{benchmark.snbpLatestQuota}</strong> · peminat 2025:{' '}
                    <strong>{benchmark.snbpLatestApplicants}</strong>
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ${getTightnessBadgeStyle(
                      benchmark.snbpTightnessLabel
                    )}`}
                  >
                    {benchmark.snbpTightnessLabel}
                  </span>
                </div>

                {/* Kartu SNBT */}
                <div
                  onClick={() => handlePathwaySwitch('SNBT')}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    activePathway === 'SNBT'
                      ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    SNBT
                  </span>
                  <p className="mt-1 font-mono text-3xl font-extrabold text-slate-900">
                    {Number(benchmark.snbtBaseChance).toFixed(1).replace('.', ',')}%
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    kuota 2026: <strong>{benchmark.snbtLatestQuota}</strong> · peminat 2025:{' '}
                    <strong>{benchmark.snbtLatestApplicants}</strong>
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ${getTightnessBadgeStyle(
                      benchmark.snbtTightnessLabel
                    )}`}
                  >
                    {benchmark.snbtTightnessLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* KOMPONEN 2: RIWAYAT KUOTA VS PEMINAT (2021–2026) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Riwayat kuota vs peminat
                  </h3>
                </div>

                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                  {(['SNBP', 'SNBT'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setHistoryTab(tab)}
                      className={`rounded-md px-3 py-1 transition ${
                        historyTab === tab
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredHistories.map((item) => {
                  const isNotOpened = item.status === 'NOT_OPENED';
                  const quotaPct = item.quota
                    ? Math.max(4, Math.round((item.quota / maxHistoryValue) * 100))
                    : 0;
                  const applicantsPct = item.applicants
                    ? Math.max(6, Math.round((item.applicants / maxHistoryValue) * 100))
                    : 0;

                  return (
                    <div key={item.year} className="grid grid-cols-12 items-center gap-3">
                      <span className="col-span-2 font-mono text-xs font-bold text-slate-600">
                        {item.year}
                      </span>

                      <div className="col-span-6">
                        {isNotOpened ? (
                          <div className="h-3 w-full rounded-full bg-slate-100" />
                        ) : (
                          <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                            {item.applicants !== null && (
                              <div
                                style={{ width: `${applicantsPct}%` }}
                                className="absolute inset-y-0 left-0 rounded-full bg-blue-200 transition-all duration-300"
                              />
                            )}
                            {item.quota !== null && (
                              <div
                                style={{ width: `${quotaPct}%` }}
                                className="absolute inset-y-0 left-0 rounded-full bg-blue-700 transition-all duration-300"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-4 text-right font-mono text-xs">
                        {isNotOpened ? (
                          <span className="italic text-slate-400">tidak dibuka</span>
                        ) : (
                          <span>
                            <strong className="text-slate-900">{item.quota}</strong>
                            <span className="text-slate-400">
                              {' '}
                              / {item.applicants !== null ? item.applicants : 'belum dirilis'}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-blue-700" /> Kuota
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-blue-200" /> Peminat
                </span>
                <span>• 2026: peminat belum dirilis</span>
              </div>
            </div>

            {/* KOMPONEN 3 & 4: TARGET NILAI RAPOR, TKA & SKOR SUBTES UTBK */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Target Nilai & Skor Rekomendasi
                </h3>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {/* Target Nilai Rapor SNBP */}
                <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      TARGET NILAI RAPOR · SNBP
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      rata-rata rapor gabungan (65% semua mapel + 35% mapel pendukung) bila tanpa
                      bonus prestasi
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-2xl font-extrabold text-blue-700">
                    {Number(benchmark.snbpTargetReport).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Target Nilai TKA SNBP */}
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      TARGET NILAI TKA · SNBP
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      rata-rata 5 mata uji TKA (skala 200–800)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-2xl font-extrabold text-slate-900">
                      {benchmark.snbpTargetTka}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        isTkaAdequate
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isTkaAdequate ? 'Memadai' : 'Tingkatkan'}
                    </span>
                  </div>
                </div>

                {/* Target Skor UTBK SNBT */}
                <div className="pt-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        TARGET SKOR UTBK · SNBT
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        skor berbobot 7 subtes, bobot kelompok{' '}
                        <strong>{majorGroup.weightClusterName}</strong>
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-2xl font-extrabold text-blue-700">
                      {benchmark.snbtTargetWeighted}
                    </span>
                  </div>

                  {/* Target per Subtes UTBK */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-3.5">
                    <p className="mb-2.5 text-xs font-bold text-slate-700">
                      Target per subtes UTBK:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUBTEST_META.map((sub) => {
                        const targetVal = benchmark.snbtTargetSubtests[sub.key];
                        const userVal = subtestInputs[sub.key];
                        const passed = userVal >= targetVal;
                        return (
                          <div
                            key={sub.key}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold ${
                              passed
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-white text-slate-800'
                            }`}
                          >
                            <span>{sub.key}</span>
                            <span className="text-slate-900">{targetVal}</span>
                            {passed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                    Estimasi model PTNdiction, bukan nilai minimal resmi. SNPMB dan PTN tidak
                    mempublikasikan nilai minimal.
                  </p>
                </div>
              </div>
            </div>

            {/* KOMPONEN 5: MAPEL PENDUKUNG SNBP */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                MAPEL PENDUKUNG (SNBP)
              </p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">
                {majorGroup.supportingSubjects.join(' & ')}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Kelompok prodi: <strong>{majorGroup.name}</strong>
              </p>
            </div>

            {/* KOMPONEN 6: INFO MENARIK OTOMATIS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                Info menarik ({activePathway})
              </h3>

              <div className="mt-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Peminat {activeTrendPct >= 0 ? 'naik' : 'turun'}{' '}
                      {Math.abs(Math.round(activeTrendPct))}%
                    </p>
                    <p className="text-xs text-slate-500">
                      Tren persaingan dalam 3 tahun rilis terakhir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-mono text-sm font-bold">
                    ≈
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Rata-rata peluang 3 tahun: {Math.round(active3yrAvg)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      Gambaran keketatan jangka panjang, tidak hanya tahun terakhir.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-mono text-sm font-bold">
                    #
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Peringkat {activeRank} paling ketat dari {activeTotal}
                    </p>
                    <p className="text-xs text-slate-500">
                      prodi {currentProgram.normalizedMajorName} ({currentProgram.degree})
                      se-Indonesia di jalur {activePathway}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-mono text-xs font-extrabold">
                    1:{activeSeatRatio}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Satu kursi diperebutkan sekitar {activeSeatRatio} orang
                    </p>
                    <p className="text-xs text-slate-500">
                      berdasarkan kuota 2026 ({activeLatestQuota}) dan peminat 2025 (
                      {activeLatestApplicants}).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* KOMPONEN 7 & 8: PRIORITAS SUBTES UTBK & RADAR CHART BOBOT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PRIORITAS SUBTES UTBK
              </p>

              <div className="mt-3 space-y-2">
                {majorGroup.prioritySubtests.map((subKey, index) => {
                  const meta = SUBTEST_META.find((m) => m.key === subKey);
                  return (
                    <div
                      key={subKey}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                    >
                      <span className="font-mono text-xs font-extrabold text-slate-500">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-xs font-extrabold ${
                          meta?.badgeClass ?? 'bg-blue-600 text-white'
                        }`}
                      >
                        {subKey}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {meta?.name ?? subKey}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {majorGroup.priorityReason}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="text-base font-extrabold text-slate-900">
                  Perkiraan bobot subtes UTBK
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  Kelompok bobot: <strong>{majorGroup.weightClusterName}</strong>. Titik biru = 3
                  subtes yang paling menentukan.
                </p>

                <div className="my-4">
                  <SubtestRadarChart
                    weights={weights}
                    prioritySubtests={majorGroup.prioritySubtests}
                  />
                </div>

                <p className="text-[11px] leading-relaxed text-slate-400">
                  Perkiraan PTNdiction. SNPMB menyebut bobot subtes berbeda per prodi, tapi angkanya
                  tidak dipublikasikan. Garis putus-putus = bobot rata 14,3%; cincin grid = 10, 20,
                  30%.
                </p>
              </div>
            </div>

            {/* KOMPONEN 9: PROFIL KECOCOKAN, PROSPEK KARIER & MATA KULIAH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700">
                <strong>Cocok untuk:</strong> {majorGroup.studentFit}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                  <span>Prospek karier</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {majorGroup.careerProspects.map((career) => (
                    <span
                      key={career}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                  <span>Contoh mata kuliah</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {majorGroup.sampleCourses.map((course) => (
                    <span
                      key={course}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                Gambaran umum kelompok {majorGroup.name}. Kurikulum tiap PTN bisa berbeda.
              </p>
            </div>

            {/* KOMPONEN 10: ALTERNATIF PELUANG LEBIH BESAR & INFO RESMI PRODI */}
            {alternativePrograms.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900">
                  Alternatif: {currentProgram.normalizedMajorName} dengan peluang lebih besar
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Klik salah satu kampus di bawah untuk langsung menyimulasikan nilaimu di prodi
                  tersebut.
                </p>

                <div className="mt-3.5 divide-y divide-slate-100">
                  {alternativePrograms.map((alt) => {
                    const altChance =
                      activePathway === 'SNBP'
                        ? Number(alt.benchmark.snbpBaseChance)
                        : Number(alt.benchmark.snbtBaseChance);
                    const altLabel =
                      activePathway === 'SNBP'
                        ? alt.benchmark.snbpTightnessLabel
                        : alt.benchmark.snbtTightnessLabel;

                    return (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => handleSelectAlternative(alt)}
                        className="flex w-full items-center justify-between py-3 text-left transition hover:bg-slate-50/80"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {alt.university.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {alt.university.province} · {alt.name} ({alt.degree})
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${getTightnessBadgeStyle(
                                altLabel
                              )}`}
                            >
                              {altLabel}
                            </span>
                            <p className="mt-0.5 font-mono text-xs font-bold text-slate-700">
                              ±{Math.round(altChance)}%
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Resmi Prodi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Info prodi</h3>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Kode prodi</p>
                  <p className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                    {currentProgram.snpmbCode}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Jenjang</p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                    {currentProgram.degree}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Jenis PTN</p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                    {university.type}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">Provinsi</p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                    {university.province}
                  </p>
                </div>
              </div>

              {university.pmbUrl && isValidHttpUrl(university.pmbUrl) && (
                <div className="mt-4 border-t border-slate-100 pt-3.5">
                  <p className="text-xs text-slate-500">Laman PMB {university.name}</p>
                  <a
                    href={university.pmbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline"
                  >
                    <span>{university.pmbUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}