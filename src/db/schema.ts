import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  smallint,
  integer,
  numeric,
  text,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const ptnTypeEnum = pgEnum('ptn_type_enum', ['PTN Akademik', 'PTN Vokasi', 'PTKIN']);
export const degreeEnum = pgEnum('degree_enum', ['D3', 'D4', 'S1']);
export const pathwayEnum = pgEnum('pathway_enum', ['SNBP', 'SNBT']);
export const admissionStatusEnum = pgEnum('admission_status_enum', ['OPEN', 'NOT_OPENED']);

export type SubtestKey = 'PU' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM';
export type SubtestScores = Record<SubtestKey, number>;

export const universities = pgTable('universities', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  shortName: varchar('short_name', { length: 30 }).notNull(),
  type: ptnTypeEnum('type').notNull(),
  province: varchar('province', { length: 80 }).notNull(),
  clusterTier: smallint('cluster_tier').notNull().default(2),
  pmbUrl: varchar('pmb_url', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const majorGroups = pgTable('major_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  weightClusterName: varchar('weight_cluster_name', { length: 80 }).notNull(),
  weightPu: numeric('weight_pu', { precision: 5, scale: 4 }).notNull(),
  weightPpu: numeric('weight_ppu', { precision: 5, scale: 4 }).notNull(),
  weightPbm: numeric('weight_pbm', { precision: 5, scale: 4 }).notNull(),
  weightPk: numeric('weight_pk', { precision: 5, scale: 4 }).notNull(),
  weightLbi: numeric('weight_lbi', { precision: 5, scale: 4 }).notNull(),
  weightLbe: numeric('weight_lbe', { precision: 5, scale: 4 }).notNull(),
  weightPm: numeric('weight_pm', { precision: 5, scale: 4 }).notNull(),
  prioritySubtests: text('priority_subtests').array().notNull(),
  priorityReason: text('priority_reason').notNull(),
  supportingSubjects: text('supporting_subjects').array().notNull(),
  studentFit: text('student_fit').notNull(),
  careerProspects: text('career_prospects').array().notNull(),
  sampleCourses: text('sample_courses').array().notNull(),
});

export const studyPrograms = pgTable(
  'study_programs',
  {
    id: serial('id').primaryKey(),
    snpmbCode: varchar('snpmb_code', { length: 15 }).notNull().unique(),
    universityId: integer('university_id')
      .notNull()
      .references(() => universities.id, { onDelete: 'cascade' }),
    majorGroupId: integer('major_group_id')
      .notNull()
      .references(() => majorGroups.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 150 }).notNull(),
    normalizedMajorName: varchar('normalized_major_name', { length: 150 }).notNull(),
    degree: degreeEnum('degree').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_prodi_univ').on(table.universityId),
    index('idx_prodi_norm_name').on(table.normalizedMajorName, table.degree),
  ]
);

export const admissionHistories = pgTable(
  'admission_histories',
  {
    id: serial('id').primaryKey(),
    studyProgramId: integer('study_program_id')
      .notNull()
      .references(() => studyPrograms.id, { onDelete: 'cascade' }),
    year: smallint('year').notNull(),
    pathway: pathwayEnum('pathway').notNull(),
    status: admissionStatusEnum('status').notNull().default('OPEN'),
    quota: integer('quota'),
    applicants: integer('applicants'),
  },
  (table) => [
    uniqueIndex('uq_prodi_year_pathway').on(table.studyProgramId, table.year, table.pathway),
    index('idx_history_prodi_pathway').on(table.studyProgramId, table.pathway, table.year),
  ]
);

export const programBenchmarks = pgTable('program_benchmarks', {
  studyProgramId: integer('study_program_id')
    .primaryKey()
    .references(() => studyPrograms.id, { onDelete: 'cascade' }),
  targetYear: smallint('target_year').notNull(),

  // SNBP Metrics
  snbpLatestQuota: integer('snbp_latest_quota').notNull(),
  snbpLatestApplicants: integer('snbp_latest_applicants').notNull(),
  snbpBaseChance: numeric('snbp_base_chance', { precision: 5, scale: 2 }).notNull(),
  snbpTightnessLabel: varchar('snbp_tightness_label', { length: 20 }).notNull(),
  snbpSeatRatio: integer('snbp_seat_ratio').notNull(),
  snbp3yrTrendPct: numeric('snbp_3yr_trend_pct', { precision: 6, scale: 2 }).notNull(),
  snbp3yrAvgChance: numeric('snbp_3yr_avg_chance', { precision: 5, scale: 2 }).notNull(),
  snbpNationalRank: integer('snbp_national_rank').notNull(),
  snbpNationalTotal: integer('snbp_national_total').notNull(),
  snbpTargetReport: numeric('snbp_target_report', { precision: 5, scale: 2 }).notNull(),
  snbpTargetTka: smallint('snbp_target_tka').notNull(),

  // SNBT Metrics
  snbtLatestQuota: integer('snbt_latest_quota').notNull(),
  snbtLatestApplicants: integer('snbt_latest_applicants').notNull(),
  snbtBaseChance: numeric('snbt_base_chance', { precision: 5, scale: 2 }).notNull(),
  snbtTightnessLabel: varchar('snbt_tightness_label', { length: 20 }).notNull(),
  snbtSeatRatio: integer('snbt_seat_ratio').notNull(),
  snbt3yrTrendPct: numeric('snbt_3yr_trend_pct', { precision: 6, scale: 2 }).notNull(),
  snbt3yrAvgChance: numeric('snbt_3yr_avg_chance', { precision: 5, scale: 2 }).notNull(),
  snbtNationalRank: integer('snbt_national_rank').notNull(),
  snbtNationalTotal: integer('snbt_national_total').notNull(),
  snbtTargetWeighted: smallint('snbt_target_weighted').notNull(),
  snbtTargetSubtests: jsonb('snbt_target_subtests').$type<SubtestScores>().notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type University = typeof universities.$inferSelect;
export type MajorGroup = typeof majorGroups.$inferSelect;
export type StudyProgram = typeof studyPrograms.$inferSelect;
export type AdmissionHistory = typeof admissionHistories.$inferSelect;
export type ProgramBenchmark = typeof programBenchmarks.$inferSelect;