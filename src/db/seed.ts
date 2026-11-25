import 'dotenv/config';
import { db } from './index';
import {
  universities,
  majorGroups,
  studyPrograms,
  admissionHistories,
  programBenchmarks,
} from './schema';
import {
  calculateHistoricalStats,
  calculateSnbpBenchmark,
  calculateSnbtBenchmark,
  type SubtestWeights,
} from '../lib/scoring-engine';

async function seed() {
  console.log('Memulai seeding database PTNdiction...');

  // Bersihkan data lama secara berurutan (idempotent)
  await db.delete(programBenchmarks);
  await db.delete(admissionHistories);
  await db.delete(studyPrograms);
  await db.delete(majorGroups);
  await db.delete(universities);

  // 1. Insert Universities
  const insertedUnivs = await db
    .insert(universities)
    .values([
      {
        code: '371',
        name: 'Universitas Jember',
        shortName: 'UNEJ',
        type: 'PTN Akademik',
        province: 'Jawa Timur',
        clusterTier: 2,
        pmbUrl: 'https://pmb.unej.ac.id',
      },
      {
        code: '372',
        name: 'Universitas Brawijaya',
        shortName: 'UB',
        type: 'PTN Akademik',
        province: 'Jawa Timur',
        clusterTier: 1,
        pmbUrl: 'https://selma.ub.ac.id',
      },
      {
        code: '321',
        name: 'Universitas Indonesia',
        shortName: 'UI',
        type: 'PTN Akademik',
        province: 'Jawa Barat',
        clusterTier: 1,
        pmbUrl: 'https://penerimaan.ui.ac.id',
      },
      {
        code: '361',
        name: 'Universitas Gadjah Mada',
        shortName: 'UGM',
        type: 'PTN Akademik',
        province: 'DI Yogyakarta',
        clusterTier: 1,
        pmbUrl: 'https://um.ugm.ac.id',
      },
      {
        code: '611',
        name: 'Universitas Udayana',
        shortName: 'UNUD',
        type: 'PTN Akademik',
        province: 'Bali',
        clusterTier: 2,
        pmbUrl: 'https://e-registrasi.unud.ac.id',
      },
      {
        code: '141',
        name: 'Universitas Jambi',
        shortName: 'UNJA',
        type: 'PTN Akademik',
        province: 'Jambi',
        clusterTier: 3,
        pmbUrl: 'https://pmb.unja.ac.id',
      },
      {
        code: '531',
        name: 'Universitas Lambung Mangkurat',
        shortName: 'ULM',
        type: 'PTN Akademik',
        province: 'Kalimantan Selatan',
        clusterTier: 3,
        pmbUrl: 'https://pmb.ulm.ac.id',
      },
    ])
    .returning();

  const univMap = new Map(insertedUnivs.map((u) => [u.shortName, u]));

  // 2. Insert Major Groups
  const insertedGroups = await db
    .insert(majorGroups)
    .values([
      {
        name: 'Ilmu atau Sains Akuntansi',
        weightClusterName: 'Ekonomi & Bisnis',
        weightPu: '0.1600',
        weightPpu: '0.1200',
        weightPbm: '0.1000',
        weightPk: '0.2000',
        weightLbi: '0.1200',
        weightLbe: '0.1200',
        weightPm: '0.1800',
        prioritySubtests: ['PK', 'PM', 'PU'],
        priorityReason:
          'Ekonomi dan bisnis dekat dengan angka, grafik, dan pengambilan keputusan berbasis data.',
        supportingSubjects: ['Ekonomi', 'Matematika'],
        studentFit: 'Kamu yang teliti, rapi, dan nyaman bekerja dengan angka.',
        careerProspects: [
          'Akuntan',
          'Auditor',
          'Konsultan pajak',
          'Analis keuangan',
          'Staf keuangan perusahaan atau pemerintah',
        ],
        sampleCourses: [
          'Akuntansi keuangan',
          'Akuntansi biaya',
          'Auditing',
          'Perpajakan',
          'Sistem informasi akuntansi',
        ],
      },
      {
        name: 'Komputer & Sains Data',
        weightClusterName: 'Teknologi Informasi',
        weightPu: '0.1800',
        weightPpu: '0.1000',
        weightPbm: '0.1000',
        weightPk: '0.2200',
        weightLbi: '0.1000',
        weightLbe: '0.1200',
        weightPm: '0.1800',
        prioritySubtests: ['PK', 'PU', 'PM'],
        priorityReason:
          'Ilmu komputer menuntut logika algoritmik, pemodelan matematika diskrit, dan pemecahan masalah sistematis.',
        supportingSubjects: ['Matematika Tingkat Lanjut', 'Fisika'],
        studentFit: 'Kamu yang menyukai logika pemrograman, pemecahan masalah kompleks, dan rekayasa sistem.',
        careerProspects: [
          'Software Engineer',
          'Data Scientist',
          'DevOps Engineer',
          'AI/ML Engineer',
          'System Architect',
        ],
        sampleCourses: [
          'Algoritma & Struktur Data',
          'Basis Data',
          'Sistem Operasi',
          'Jaringan Komputer',
          'Kecerdasan Buatan',
        ],
      },
      {
        name: 'Kesehatan & Kedokteran',
        weightClusterName: 'Ilmu Kesehatan',
        weightPu: '0.2000',
        weightPpu: '0.1400',
        weightPbm: '0.1200',
        weightPk: '0.1400',
        weightLbi: '0.1200',
        weightLbe: '0.1600',
        weightPm: '0.1200',
        prioritySubtests: ['PU', 'LBE', 'PPU'],
        priorityReason:
          'Studi kedokteran membutuhkan penalaran klinis yang tajam serta pemahaman literatur medis berbahasa Inggris.',
        supportingSubjects: ['Biologi', 'Kimia'],
        studentFit: 'Kamu yang tekun menghafal konsep kompleks, empatik, dan kuat dalam literasi ilmiah.',
        careerProspects: [
          'Dokter Umum',
          'Dokter Spesialis',
          'Peneliti Biomedis',
          'Konsultan Kesehatan Publik',
        ],
        sampleCourses: [
          'Anatomi & Fisiologi',
          'Biokimia Medis',
          'Patologi Klinik',
          'Farmakologi',
          'Ilmu Kesehatan Masyarakat',
        ],
      },
    ])
    .returning();

  const groupMap = new Map(insertedGroups.map((g) => [g.name, g]));

  // 3. Insert Study Programs
  const programsSeed = [
    {
      key: 'UNEJ_PAJAK',
      snpmbCode: '13713069',
      univShort: 'UNEJ',
      groupName: 'Ilmu atau Sains Akuntansi',
      name: 'Perpajakan',
      normalizedMajorName: 'Perpajakan',
      degree: 'D3' as const,
      snbp: [
        { year: 2021, status: 'NOT_OPENED' as const, quota: null, applicants: null },
        { year: 2022, status: 'NOT_OPENED' as const, quota: null, applicants: null },
        { year: 2023, status: 'OPEN' as const, quota: 30, applicants: 84 },
        { year: 2024, status: 'OPEN' as const, quota: 25, applicants: 127 },
        { year: 2025, status: 'OPEN' as const, quota: 27, applicants: 106 },
        { year: 2026, status: 'OPEN' as const, quota: 30, applicants: null },
      ],
      snbt: [
        { year: 2021, status: 'NOT_OPENED' as const, quota: null, applicants: null },
        { year: 2022, status: 'NOT_OPENED' as const, quota: null, applicants: null },
        { year: 2023, status: 'OPEN' as const, quota: 45, applicants: 780 },
        { year: 2024, status: 'OPEN' as const, quota: 40, applicants: 890 },
        { year: 2025, status: 'OPEN' as const, quota: 38, applicants: 951 },
        { year: 2026, status: 'OPEN' as const, quota: 38, applicants: null },
      ],
    },
    {
      key: 'UNUD_PAJAK',
      snpmbCode: '16113021',
      univShort: 'UNUD',
      groupName: 'Ilmu atau Sains Akuntansi',
      name: 'Perpajakan',
      normalizedMajorName: 'Perpajakan',
      degree: 'D3' as const,
      snbp: [
        { year: 2023, status: 'OPEN' as const, quota: 30, applicants: 82 },
        { year: 2024, status: 'OPEN' as const, quota: 32, applicants: 91 },
        { year: 2025, status: 'OPEN' as const, quota: 32, applicants: 94 },
        { year: 2026, status: 'OPEN' as const, quota: 32, applicants: null },
      ],
      snbt: [
        { year: 2023, status: 'OPEN' as const, quota: 45, applicants: 510 },
        { year: 2024, status: 'OPEN' as const, quota: 48, applicants: 560 },
        { year: 2025, status: 'OPEN' as const, quota: 48, applicants: 600 },
        { year: 2026, status: 'OPEN' as const, quota: 48, applicants: null },
      ],
    },
    {
      key: 'UNJA_PAJAK',
      snpmbCode: '11413018',
      univShort: 'UNJA',
      groupName: 'Ilmu atau Sains Akuntansi',
      name: 'Perpajakan',
      normalizedMajorName: 'Perpajakan',
      degree: 'D3' as const,
      snbp: [
        { year: 2023, status: 'OPEN' as const, quota: 25, applicants: 58 },
        { year: 2024, status: 'OPEN' as const, quota: 28, applicants: 64 },
        { year: 2025, status: 'OPEN' as const, quota: 30, applicants: 70 },
        { year: 2026, status: 'OPEN' as const, quota: 30, applicants: null },
      ],
      snbt: [
        { year: 2023, status: 'OPEN' as const, quota: 40, applicants: 320 },
        { year: 2024, status: 'OPEN' as const, quota: 42, applicants: 355 },
        { year: 2025, status: 'OPEN' as const, quota: 45, applicants: 390 },
        { year: 2026, status: 'OPEN' as const, quota: 45, applicants: null },
      ],
    },
    {
      key: 'ULM_PAJAK',
      snpmbCode: '15313014',
      univShort: 'ULM',
      groupName: 'Ilmu atau Sains Akuntansi',
      name: 'Perpajakan',
      normalizedMajorName: 'Perpajakan',
      degree: 'D3' as const,
      snbp: [
        { year: 2023, status: 'OPEN' as const, quota: 25, applicants: 40 },
        { year: 2024, status: 'OPEN' as const, quota: 28, applicants: 43 },
        { year: 2025, status: 'OPEN' as const, quota: 30, applicants: 45 },
        { year: 2026, status: 'OPEN' as const, quota: 30, applicants: null },
      ],
      snbt: [
        { year: 2023, status: 'OPEN' as const, quota: 40, applicants: 240 },
        { year: 2024, status: 'OPEN' as const, quota: 42, applicants: 265 },
        { year: 2025, status: 'OPEN' as const, quota: 45, applicants: 280 },
        { year: 2026, status: 'OPEN' as const, quota: 45, applicants: null },
      ],
    },
    {
      key: 'UB_TI',
      snpmbCode: '13721045',
      univShort: 'UB',
      groupName: 'Komputer & Sains Data',
      name: 'Teknik Informatika',
      normalizedMajorName: 'Teknik Informatika',
      degree: 'S1' as const,
      snbp: [
        { year: 2021, status: 'OPEN' as const, quota: 60, applicants: 1480 },
        { year: 2022, status: 'OPEN' as const, quota: 65, applicants: 1620 },
        { year: 2023, status: 'OPEN' as const, quota: 70, applicants: 1850 },
        { year: 2024, status: 'OPEN' as const, quota: 75, applicants: 2110 },
        { year: 2025, status: 'OPEN' as const, quota: 75, applicants: 2340 },
        { year: 2026, status: 'OPEN' as const, quota: 78, applicants: null },
      ],
      snbt: [
        { year: 2021, status: 'OPEN' as const, quota: 90, applicants: 2450 },
        { year: 2022, status: 'OPEN' as const, quota: 95, applicants: 2790 },
        { year: 2023, status: 'OPEN' as const, quota: 105, applicants: 3120 },
        { year: 2024, status: 'OPEN' as const, quota: 110, applicants: 3490 },
        { year: 2025, status: 'OPEN' as const, quota: 112, applicants: 3820 },
        { year: 2026, status: 'OPEN' as const, quota: 115, applicants: null },
      ],
    },
    {
      key: 'UI_ILKOM',
      snpmbCode: '13211033',
      univShort: 'UI',
      groupName: 'Komputer & Sains Data',
      name: 'Ilmu Komputer',
      normalizedMajorName: 'Teknik Informatika',
      degree: 'S1' as const,
      snbp: [
        { year: 2021, status: 'OPEN' as const, quota: 40, applicants: 1320 },
        { year: 2022, status: 'OPEN' as const, quota: 42, applicants: 1490 },
        { year: 2023, status: 'OPEN' as const, quota: 45, applicants: 1680 },
        { year: 2024, status: 'OPEN' as const, quota: 45, applicants: 1890 },
        { year: 2025, status: 'OPEN' as const, quota: 48, applicants: 2150 },
        { year: 2026, status: 'OPEN' as const, quota: 50, applicants: null },
      ],
      snbt: [
        { year: 2021, status: 'OPEN' as const, quota: 60, applicants: 2210 },
        { year: 2022, status: 'OPEN' as const, quota: 65, applicants: 2540 },
        { year: 2023, status: 'OPEN' as const, quota: 68, applicants: 2890 },
        { year: 2024, status: 'OPEN' as const, quota: 70, applicants: 3250 },
        { year: 2025, status: 'OPEN' as const, quota: 72, applicants: 3610 },
        { year: 2026, status: 'OPEN' as const, quota: 75, applicants: null },
      ],
    },
    {
      key: 'UGM_KEDOKTERAN',
      snpmbCode: '13611011',
      univShort: 'UGM',
      groupName: 'Kesehatan & Kedokteran',
      name: 'Kedokteran',
      normalizedMajorName: 'Kedokteran',
      degree: 'S1' as const,
      snbp: [
        { year: 2021, status: 'OPEN' as const, quota: 50, applicants: 2190 },
        { year: 2022, status: 'OPEN' as const, quota: 52, applicants: 2410 },
        { year: 2023, status: 'OPEN' as const, quota: 55, applicants: 2680 },
        { year: 2024, status: 'OPEN' as const, quota: 55, applicants: 2940 },
        { year: 2025, status: 'OPEN' as const, quota: 58, applicants: 3210 },
        { year: 2026, status: 'OPEN' as const, quota: 60, applicants: null },
      ],
      snbt: [
        { year: 2021, status: 'OPEN' as const, quota: 75, applicants: 3420 },
        { year: 2022, status: 'OPEN' as const, quota: 78, applicants: 3690 },
        { year: 2023, status: 'OPEN' as const, quota: 80, applicants: 3980 },
        { year: 2024, status: 'OPEN' as const, quota: 82, applicants: 4250 },
        { year: 2025, status: 'OPEN' as const, quota: 85, applicants: 4590 },
        { year: 2026, status: 'OPEN' as const, quota: 88, applicants: null },
      ],
    },
  ];

  // Simpan hasil kalkulasi sementara untuk menghitung peringkat nasional
  const computedList: Array<{
    programId: number;
    normalizedMajorName: string;
    degree: 'D3' | 'D4' | 'S1';
    snbpStats: ReturnType<typeof calculateHistoricalStats>;
    snbtStats: ReturnType<typeof calculateHistoricalStats>;
    snbpTarget: ReturnType<typeof calculateSnbpBenchmark>;
    snbtTarget: ReturnType<typeof calculateSnbtBenchmark>;
  }> = [];

  for (const item of programsSeed) {
    const univ = univMap.get(item.univShort)!;
    const group = groupMap.get(item.groupName)!;

    const [insertedProgram] = await db
      .insert(studyPrograms)
      .values({
        snpmbCode: item.snpmbCode,
        universityId: univ.id,
        majorGroupId: group.id,
        name: item.name,
        normalizedMajorName: item.normalizedMajorName,
        degree: item.degree,
      })
      .returning();

    const historyRows = [
      ...item.snbp.map((h) => ({
        studyProgramId: insertedProgram.id,
        year: h.year,
        pathway: 'SNBP' as const,
        status: h.status,
        quota: h.quota,
        applicants: h.applicants,
      })),
      ...item.snbt.map((h) => ({
        studyProgramId: insertedProgram.id,
        year: h.year,
        pathway: 'SNBT' as const,
        status: h.status,
        quota: h.quota,
        applicants: h.applicants,
      })),
    ];

    await db.insert(admissionHistories).values(historyRows);

    const weights: SubtestWeights = {
      PU: Number(group.weightPu),
      PPU: Number(group.weightPpu),
      PBM: Number(group.weightPbm),
      PK: Number(group.weightPk),
      LBI: Number(group.weightLbi),
      LBE: Number(group.weightLbe),
      PM: Number(group.weightPm),
    };

    const snbpStats = calculateHistoricalStats(item.snbp);
    const snbtStats = calculateHistoricalStats(item.snbt);
    const snbpTarget = calculateSnbpBenchmark(snbpStats.baseChance, univ.clusterTier);
    const snbtTarget = calculateSnbtBenchmark(snbtStats.baseChance, univ.clusterTier, weights);

    computedList.push({
      programId: insertedProgram.id,
      normalizedMajorName: item.normalizedMajorName,
      degree: item.degree,
      snbpStats,
      snbtStats,
      snbpTarget,
      snbtTarget,
    });
  }

  // 4. Hitung Peringkat Keketatan Nasional & Insert Benchmarks
  for (const current of computedList) {
    const peers = computedList.filter(
      (p) => p.normalizedMajorName === current.normalizedMajorName && p.degree === current.degree
    );

    const snbpSorted = [...peers].sort((a, b) => a.snbpStats.baseChance - b.snbpStats.baseChance);
    const snbtSorted = [...peers].sort((a, b) => a.snbtStats.baseChance - b.snbtStats.baseChance);

    const snbpRank = snbpSorted.findIndex((p) => p.programId === current.programId) + 1;
    const snbtRank = snbtSorted.findIndex((p) => p.programId === current.programId) + 1;

    await db.insert(programBenchmarks).values({
      studyProgramId: current.programId,
      targetYear: 2027,
      snbpLatestQuota: current.snbpStats.latestQuota,
      snbpLatestApplicants: current.snbpStats.latestApplicants,
      snbpBaseChance: current.snbpStats.baseChance.toFixed(2),
      snbpTightnessLabel: current.snbpStats.tightnessLabel,
      snbpSeatRatio: current.snbpStats.seatRatio,
      snbp3yrTrendPct: current.snbpStats.threeYearTrendPct.toFixed(2),
      snbp3yrAvgChance: current.snbpStats.threeYearAvgChance.toFixed(2),
      snbpNationalRank: snbpRank,
      snbpNationalTotal: peers.length,
      snbpTargetReport: current.snbpTarget.targetReport.toFixed(2),
      snbpTargetTka: current.snbpTarget.targetTka,

      snbtLatestQuota: current.snbtStats.latestQuota,
      snbtLatestApplicants: current.snbtStats.latestApplicants,
      snbtBaseChance: current.snbtStats.baseChance.toFixed(2),
      snbtTightnessLabel: current.snbtStats.tightnessLabel,
      snbtSeatRatio: current.snbtStats.seatRatio,
      snbt3yrTrendPct: current.snbtStats.threeYearTrendPct.toFixed(2),
      snbt3yrAvgChance: current.snbtStats.threeYearAvgChance.toFixed(2),
      snbtNationalRank: snbtRank,
      snbtNationalTotal: peers.length,
      snbtTargetWeighted: current.snbtTarget.targetWeighted,
      snbtTargetSubtests: current.snbtTarget.targetSubtests,
    });
  }

  console.log('Seeding PTNdiction selesai!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Gagal melakukan seeding:', err);
  process.exit(1);
});