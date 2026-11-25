import type { AdmissionHistory, SubtestKey, SubtestScores } from '@/db/schema';

export type TightnessLabel = 'Longgar' | 'Sedang' | 'Ketat' | 'Sangat ketat';

export interface SubtestWeights {
  PU: number;
  PPU: number;
  PBM: number;
  PK: number;
  LBI: number;
  LBE: number;
  PM: number;
}

export interface HistoricalStats {
  latestQuota: number;
  latestApplicants: number;
  baseChance: number;
  tightnessLabel: TightnessLabel;
  seatRatio: number;
  threeYearTrendPct: number;
  threeYearAvgChance: number;
}

export interface SnbpPredictionInput {
  avgAllSubjects: number;
  avgSupportingSubject: number;
  achievementBonus?: number;
  tkaScore?: number;
}

export interface PersonalPredictionResult {
  userScore: number;
  targetScore: number;
  delta: number;
  personalChance: number;
  statusLabel: 'Sangat Kompetitif' | 'Kompetitif' | 'Cukup Berpeluang' | 'Perlu Peningkatan';
  summary: string;
}

const SUBTEST_KEYS: SubtestKey[] = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getTightnessLabel(chancePct: number): TightnessLabel {
  if (chancePct >= 25) return 'Longgar';
  if (chancePct >= 12) return 'Sedang';
  if (chancePct >= 5) return 'Ketat';
  return 'Sangat ketat';
}

export function calculateHistoricalStats(
  histories: Pick<AdmissionHistory, 'year' | 'status' | 'quota' | 'applicants'>[]
): HistoricalStats {
  const sorted = [...histories].sort((a, b) => a.year - b.year);

  const validQuotas = sorted.filter((h) => h.status === 'OPEN' && h.quota !== null && h.quota > 0);
  const validPairs = sorted.filter(
    (h) => h.status === 'OPEN' && h.quota !== null && h.quota > 0 && h.applicants !== null && h.applicants > 0
  );

  const latestQuota = validQuotas.at(-1)?.quota ?? 20;
  const latestApplicants = validPairs.at(-1)?.applicants ?? 100;

  const rawChance = (latestQuota / Math.max(1, latestApplicants)) * 100;
  const baseChance = Number(clamp(rawChance, 0.1, 100).toFixed(2));
  const tightnessLabel = getTightnessLabel(baseChance);
  const seatRatio = Math.max(1, Math.round(latestApplicants / Math.max(1, latestQuota)));

  // Pertumbuhan peminat 3 tahun rilis terakhir
  const recent3Pairs = validPairs.slice(-3);
  let threeYearTrendPct = 0;
  if (recent3Pairs.length >= 2) {
    const firstApplicants = recent3Pairs[0].applicants!;
    const lastApplicants = recent3Pairs.at(-1)!.applicants!;
    threeYearTrendPct = Number((((lastApplicants - firstApplicants) / firstApplicants) * 100).toFixed(2));
  }

  // Rata-rata peluang 3 tahun terakhir
  let threeYearAvgChance = baseChance;
  if (recent3Pairs.length > 0) {
    const sumChances = recent3Pairs.reduce((acc, item) => {
      return acc + (item.quota! / item.applicants!) * 100;
    }, 0);
    threeYearAvgChance = Number((sumChances / recent3Pairs.length).toFixed(2));
  }

  return {
    latestQuota,
    latestApplicants,
    baseChance,
    tightnessLabel,
    seatRatio,
    threeYearTrendPct,
    threeYearAvgChance,
  };
}

function getTierOffset(clusterTier: number): number {
  if (clusterTier === 1) return 1.2;
  if (clusterTier === 2) return 0.45;
  return 0.0;
}

export function calculateSnbpBenchmark(baseChance: number, clusterTier: number) {
  const difficultyIndex = clamp(1 - Math.log(baseChance + 1) / Math.log(51), 0, 1);
  const tierOffset = getTierOffset(clusterTier);

  const targetReport = Number((85.0 + 8.5 * Math.pow(difficultyIndex, 1.15) + tierOffset).toFixed(2));
  const targetTka = Math.round(515 + 175 * Math.pow(difficultyIndex, 1.1) + 15 * tierOffset);

  return {
    targetReport,
    targetTka,
  };
}

export function calculateSnbtBenchmark(
  baseChance: number,
  clusterTier: number,
  weights: SubtestWeights
) {
  const difficultyIndex = clamp(1 - Math.log(baseChance + 1) / Math.log(51), 0, 1);
  const tierOffset = getTierOffset(clusterTier);
  const baseScore = Math.round(510 + 205 * Math.pow(difficultyIndex, 0.95) + 15 * tierOffset);

  const targetSubtests = {} as SubtestScores;
  let weightedSum = 0;

  for (const key of SUBTEST_KEYS) {
    const subtestTarget = Math.round(baseScore + 150 * weights[key]);
    targetSubtests[key] = subtestTarget;
    weightedSum += weights[key] * subtestTarget;
  }

  return {
    targetWeighted: Math.round(weightedSum),
    targetSubtests,
  };
}

export function predictPersonalSnbp(
  input: SnbpPredictionInput,
  baseChance: number,
  targetReport: number
): PersonalPredictionResult {
  const bonus = clamp(input.achievementBonus ?? 0, 0, 3);
  const userScore = Number(
    (0.65 * input.avgAllSubjects + 0.35 * input.avgSupportingSubject + bonus).toFixed(2)
  );
  const delta = Number((userScore - targetReport).toFixed(2));

  const multiplier = 2 / (1 + Math.exp(-0.45 * delta));
  const personalChance = Number(clamp(baseChance * multiplier, 1, 95).toFixed(1));

  let statusLabel: PersonalPredictionResult['statusLabel'] = 'Perlu Peningkatan';
  let summary = 'Nilai rapor gabungan masih di bawah estimasi aman prodi ini. Pertimbangkan meningkatkan nilai semester berjalan atau cek prodi alternatif.';

  if (delta >= 1.5) {
    statusLabel = 'Sangat Kompetitif';
    summary = 'Nilai rapor gabunganmu melampaui target aman PTNdiction. Posisimu sangat kuat jika indeks sekolah mendukung.';
  } else if (delta >= -0.3) {
    statusLabel = 'Kompetitif';
    summary = 'Nilai rapormu berada tepat di zona kompetitif prodi ini. Konsistensi nilai mapel pendukung akan sangat membantu.';
  } else if (delta >= -2.0) {
    statusLabel = 'Cukup Berpeluang';
    summary = 'Selisih nilai rapormu tipis di bawah target estimasi. Sertifikat prestasi akademik/non-akademik relevan dapat mendongkrak peluang.';
  }

  return {
    userScore,
    targetScore: targetReport,
    delta,
    personalChance,
    statusLabel,
    summary,
  };
}

export function predictPersonalSnbt(
  userSubtests: SubtestScores,
  weights: SubtestWeights,
  baseChance: number,
  targetWeighted: number
): PersonalPredictionResult {
  let weightedSum = 0;
  for (const key of SUBTEST_KEYS) {
    weightedSum += weights[key] * (userSubtests[key] || 0);
  }

  const userScore = Math.round(weightedSum);
  const delta = userScore - targetWeighted;

  const multiplier = 2 / (1 + Math.exp(-0.045 * delta));
  const personalChance = Number(clamp(baseChance * multiplier, 0.5, 95).toFixed(1));

  let statusLabel: PersonalPredictionResult['statusLabel'] = 'Perlu Peningkatan';
  let summary = 'Skor UTBK berbobot masih di bawah target prodi. Fokuskan latihan pada 3 subtes prioritas utama untuk lonjakan skor tercepat.';

  if (delta >= 20) {
    statusLabel = 'Sangat Kompetitif';
    summary = 'Skor UTBK berbobotmu sudah melampaui batas aman prodi ini. Pertahankan performa pada subtes dengan bobot tertinggi.';
  } else if (delta >= -5) {
    statusLabel = 'Kompetitif';
    summary = 'Skormu berada di ambang kompetitif. Tambahan 10–15 poin pada subtes prioritas akan mengamankan posisimu.';
  } else if (delta >= -30) {
    statusLabel = 'Cukup Berpeluang';
    summary = 'Peluang tetap terbuka, namun persaingan ketat menuntut peningkatan skor pada subtes inti rumpun keilmuan ini.';
  }

  return {
    userScore,
    targetScore: targetWeighted,
    delta,
    personalChance,
    statusLabel,
    summary,
  };
}