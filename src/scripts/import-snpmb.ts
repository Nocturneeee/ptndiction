import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import {
  universities,
  majorGroups,
  studyPrograms,
  admissionHistories,
  programBenchmarks,
} from '../db/schema';
import {
  MAJOR_GROUP_CATALOG,
  classifyMajorGroup,
  normalizeMajorName,
  inferUniversityMeta,
} from '../lib/major-mapper';
import {
  calculateHistoricalStats,
  calculateSnbpBenchmark,
  calculateSnbtBenchmark,
  type SubtestWeights,
} from '../lib/scoring-engine';
import type { RawProgramRecord } from './scrape-snpmb';

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function importBulk() {
  const inputPath = path.join(process.cwd(), 'data', 'snpmb-full.json');
  const rawContent = await fs.readFile(inputPath, 'utf-8');
  const records: RawProgramRecord[] = JSON.parse(rawContent);

  if (records.length === 0) {
    throw new Error('File data/snpmb-full.json kosong.');
  }

  console.log(`Membaca ${records.length} program studi dari ${inputPath}...`);

  // 1. Upsert Major Groups (10 Rumpun Keilmuan)
  const groupRows = MAJOR_GROUP_CATALOG.map((g) => ({
    name: g.name,
    weightClusterName: g.weightClusterName,
    weightPu: g.weights.PU.toFixed(4),
    weightPpu: g.weights.PPU.toFixed(4),
    weightPbm: g.weights.PBM.toFixed(4),
    weightPk: g.weights.PK.toFixed(4),
    weightLbi: g.weights.LBI.toFixed(4),
    weightLbe: g.weights.LBE.toFixed(4),
    weightPm: g.weights.PM.toFixed(4),
    prioritySubtests: g.prioritySubtests,
    priorityReason: g.priorityReason,
    supportingSubjects: g.supportingSubjects,
    studentFit: g.studentFit,
    careerProspects: g.careerProspects,
    sampleCourses: g.sampleCourses,
  }));

  const upsertedGroups = await db
    .insert(majorGroups)
    .values(groupRows)
    .onConflictDoUpdate({
      target: majorGroups.name,
      set: {
        weightClusterName: sql`excluded.weight_cluster_name`,
        weightPu: sql`excluded.weight_pu`,
        weightPpu: sql`excluded.weight_ppu`,
        weightPbm: sql`excluded.weight_pbm`,
        weightPk: sql`excluded.weight_pk`,
        weightLbi: sql`excluded.weight_lbi`,
        weightLbe: sql`excluded.weight_lbe`,
        weightPm: sql`excluded.weight_pm`,
        prioritySubtests: sql`excluded.priority_subtests`,
        supportingSubjects: sql`excluded.supporting_subjects`,
      },
    })
    .returning();

  const groupIdByName = new Map(upsertedGroups.map((g) => [g.name, g.id]));
  console.log(`1/4 Major groups tersinkronisasi (${upsertedGroups.length} kelompok).`);

  // 2. Ekstrak & Upsert Universities Unik
  const uniqueUnivMap = new Map<
    string,
    {
      code: string;
      name: string;
      shortName: string;
      type: 'PTN Akademik' | 'PTN Vokasi' | 'PTKIN';
      province: string;
      clusterTier: number;
      pmbUrl: string | null;
    }
  >();

  for (const r of records) {
    if (!uniqueUnivMap.has(r.univCode)) {
      const meta = inferUniversityMeta(r.univCode, r.univName);
      uniqueUnivMap.set(r.univCode, {
        code: r.univCode,
        name: r.univName,
        shortName: meta.shortName,
        type: meta.type,
        province: r.province,
        clusterTier: meta.clusterTier,
        pmbUrl: r.pmbUrl,
      });
    }
  }

  const upsertedUnivs = await db
    .insert(universities)
    .values(Array.from(uniqueUnivMap.values()))
    .onConflictDoUpdate({
      target: universities.code,
      set: {
        name: sql`excluded.name`,
        province: sql`excluded.province`,
        pmbUrl: sql`COALESCE(excluded.pmb_url, ${universities.pmbUrl})`,
      },
    })
    .returning();

  const univByCode = new Map(upsertedUnivs.map((u) => [u.code, u]));
  console.log(`2/4 Perguruan Tinggi tersinkronisasi (${upsertedUnivs.length} PTN).`);

  // 3. Batch Upsert Study Programs
  const programValues = records.map((r) => {
    const univ = univByCode.get(r.univCode)!;
    const groupDef = classifyMajorGroup(r.programName);
    const groupId = groupIdByName.get(groupDef.name)!;

    return {
      snpmbCode: r.snpmbCode,
      universityId: univ.id,
      majorGroupId: groupId,
      name: r.programName,
      normalizedMajorName: normalizeMajorName(r.programName),
      degree: r.degree,
      isActive: true,
    };
  });

  const upsertedPrograms: (typeof studyPrograms.$inferSelect)[] = [];
  for (const batch of chunkArray(programValues, 250)) {
    const res = await db
      .insert(studyPrograms)
      .values(batch)
      .onConflictDoUpdate({
        target: studyPrograms.snpmbCode,
        set: {
          name: sql`excluded.name`,
          normalizedMajorName: sql`excluded.normalized_major_name`,
          majorGroupId: sql`excluded.major_group_id`,
          degree: sql`excluded.degree`,
          isActive: true,
        },
      })
      .returning();
    upsertedPrograms.push(...res);
  }

  const programBySnpmbCode = new Map(upsertedPrograms.map((p) => [p.snpmbCode, p]));
  console.log(`3/4 Program Studi tersinkronisasi (${upsertedPrograms.length} prodi).`);

  // 4. Batch Upsert Admission Histories & Kalkulasi Benchmark
  const allHistoryRows: (typeof admissionHistories.$inferInsert)[] = [];
  const computedBenchmarks: Array<{
    programId: number;
    normalizedMajorName: string;
    degree: 'D3' | 'D4' | 'S1';
    snbpStats: ReturnType<typeof calculateHistoricalStats>;
    snbtStats: ReturnType<typeof calculateHistoricalStats>;
    snbpTarget: ReturnType<typeof calculateSnbpBenchmark>;
    snbtTarget: ReturnType<typeof calculateSnbtBenchmark>;
  }> = [];

  for (const r of records) {
    const dbProgram = programBySnpmbCode.get(r.snpmbCode)!;
    const dbUniv = univByCode.get(r.univCode)!;
    const groupDef = classifyMajorGroup(r.programName);

    for (const h of r.snbp) {
      allHistoryRows.push({
        studyProgramId: dbProgram.id,
        year: h.year,
        pathway: 'SNBP',
        status: h.status,
        quota: h.quota,
        applicants: h.applicants,
      });
    }

    for (const h of r.snbt) {
      allHistoryRows.push({
        studyProgramId: dbProgram.id,
        year: h.year,
        pathway: 'SNBT',
        status: h.status,
        quota: h.quota,
        applicants: h.applicants,
      });
    }

    const weights: SubtestWeights = groupDef.weights;
    const snbpStats = calculateHistoricalStats(r.snbp);
    const snbtStats = calculateHistoricalStats(r.snbt);
    const snbpTarget = calculateSnbpBenchmark(snbpStats.baseChance, dbUniv.clusterTier);
    const snbtTarget = calculateSnbtBenchmark(snbtStats.baseChance, dbUniv.clusterTier, weights);

    computedBenchmarks.push({
      programId: dbProgram.id,
      normalizedMajorName: dbProgram.normalizedMajorName,
      degree: dbProgram.degree,
      snbpStats,
      snbtStats,
      snbpTarget,
      snbtTarget,
    });
  }

  for (const batch of chunkArray(allHistoryRows, 500)) {
    await db
      .insert(admissionHistories)
      .values(batch)
      .onConflictDoUpdate({
        target: [admissionHistories.studyProgramId, admissionHistories.year, admissionHistories.pathway],
        set: {
          status: sql`excluded.status`,
          quota: sql`excluded.quota`,
          applicants: sql`excluded.applicants`,
        },
      });
  }

  // Kelompokkan berdasarkan (normalizedMajorName + degree) untuk menghitung peringkat nasional se-Indonesia
  const peerBuckets = new Map<string, typeof computedBenchmarks>();
  for (const item of computedBenchmarks) {
    const bucketKey = `${item.normalizedMajorName}::${item.degree}`;
    const list = peerBuckets.get(bucketKey) ?? [];
    list.push(item);
    peerBuckets.set(bucketKey, list);
  }

  const snbpRankMap = new Map<number, { rank: number; total: number }>();
  const snbtRankMap = new Map<number, { rank: number; total: number }>();

  for (const peers of peerBuckets.values()) {
    const total = peers.length;
    const bySnbp = [...peers].sort((a, b) => a.snbpStats.baseChance - b.snbpStats.baseChance);
    const bySnbt = [...peers].sort((a, b) => a.snbtStats.baseChance - b.snbtStats.baseChance);

    bySnbp.forEach((p, idx) => snbpRankMap.set(p.programId, { rank: idx + 1, total }));
    bySnbt.forEach((p, idx) => snbtRankMap.set(p.programId, { rank: idx + 1, total }));
  }

  const benchmarkRows = computedBenchmarks.map((item) => {
    const snbpRank = snbpRankMap.get(item.programId) ?? { rank: 1, total: 1 };
    const snbtRank = snbtRankMap.get(item.programId) ?? { rank: 1, total: 1 };

    return {
      studyProgramId: item.programId,
      targetYear: 2027,
      snbpLatestQuota: item.snbpStats.latestQuota,
      snbpLatestApplicants: item.snbpStats.latestApplicants,
      snbpBaseChance: item.snbpStats.baseChance.toFixed(2),
      snbpTightnessLabel: item.snbpStats.tightnessLabel,
      snbpSeatRatio: item.snbpStats.seatRatio,
      snbp3yrTrendPct: item.snbpStats.threeYearTrendPct.toFixed(2),
      snbp3yrAvgChance: item.snbpStats.threeYearAvgChance.toFixed(2),
      snbpNationalRank: snbpRank.rank,
      snbpNationalTotal: snbpRank.total,
      snbpTargetReport: item.snbpTarget.targetReport.toFixed(2),
      snbpTargetTka: item.snbpTarget.targetTka,

      snbtLatestQuota: item.snbtStats.latestQuota,
      snbtLatestApplicants: item.snbtStats.latestApplicants,
      snbtBaseChance: item.snbtStats.baseChance.toFixed(2),
      snbtTightnessLabel: item.snbtStats.tightnessLabel,
      snbtSeatRatio: item.snbtStats.seatRatio,
      snbt3yrTrendPct: item.snbtStats.threeYearTrendPct.toFixed(2),
      snbt3yrAvgChance: item.snbtStats.threeYearAvgChance.toFixed(2),
      snbtNationalRank: snbtRank.rank,
      snbtNationalTotal: snbtRank.total,
      snbtTargetWeighted: item.snbtTarget.targetWeighted,
      snbtTargetSubtests: item.snbtTarget.targetSubtests,
    };
  });

  for (const batch of chunkArray(benchmarkRows, 250)) {
    await db
      .insert(programBenchmarks)
      .values(batch)
      .onConflictDoUpdate({
        target: programBenchmarks.studyProgramId,
        set: {
          snbpLatestQuota: sql`excluded.snbp_latest_quota`,
          snbpLatestApplicants: sql`excluded.snbp_latest_applicants`,
          snbpBaseChance: sql`excluded.snbp_base_chance`,
          snbpTightnessLabel: sql`excluded.snbp_tightness_label`,
          snbpSeatRatio: sql`excluded.snbp_seat_ratio`,
          snbp3yrTrendPct: sql`excluded.snbp_3yr_trend_pct`,
          snbp3yrAvgChance: sql`excluded.snbp_3yr_avg_chance`,
          snbpNationalRank: sql`excluded.snbp_national_rank`,
          snbpNationalTotal: sql`excluded.snbp_national_total`,
          snbpTargetReport: sql`excluded.snbp_target_report`,
          snbpTargetTka: sql`excluded.snbp_target_tka`,

          snbtLatestQuota: sql`excluded.snbt_latest_quota`,
          snbtLatestApplicants: sql`excluded.snbt_latest_applicants`,
          snbtBaseChance: sql`excluded.snbt_base_chance`,
          snbtTightnessLabel: sql`excluded.snbt_tightness_label`,
          snbtSeatRatio: sql`excluded.snbt_seat_ratio`,
          snbt3yrTrendPct: sql`excluded.snbt_3yr_trend_pct`,
          snbt3yrAvgChance: sql`excluded.snbt_3yr_avg_chance`,
          snbtNationalRank: sql`excluded.snbt_national_rank`,
          snbtNationalTotal: sql`excluded.snbt_national_total`,
          snbtTargetWeighted: sql`excluded.snbt_target_weighted`,
          snbtTargetSubtests: sql`excluded.snbt_target_subtests`,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`4/4 Benchmarks & Peringkat Nasional selesai dihitung (${benchmarkRows.length} prodi).`);
  process.exit(0);
}

importBulk().catch((err) => {
  console.error('Gagal melakukan bulk import:', err);
  process.exit(1);
});