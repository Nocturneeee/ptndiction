import { eq, asc } from 'drizzle-orm';
import { db } from './index';
import {
  universities,
  majorGroups,
  studyPrograms,
  admissionHistories,
  programBenchmarks,
} from './schema';

export async function getPTNdictionCatalog() {
  const [allUniversities, allPrograms, allHistories] = await Promise.all([
    db.select().from(universities).orderBy(asc(universities.name)),
    db
      .select({
        program: studyPrograms,
        university: universities,
        majorGroup: majorGroups,
        benchmark: programBenchmarks,
      })
      .from(studyPrograms)
      .innerJoin(universities, eq(studyPrograms.universityId, universities.id))
      .innerJoin(majorGroups, eq(studyPrograms.majorGroupId, majorGroups.id))
      .innerJoin(programBenchmarks, eq(studyPrograms.id, programBenchmarks.studyProgramId))
      .where(eq(studyPrograms.isActive, true))
      .orderBy(asc(studyPrograms.name)),
    db.select().from(admissionHistories).orderBy(asc(admissionHistories.year)),
  ]);

  const historiesByProgram = new Map<number, typeof allHistories>();
  for (const h of allHistories) {
    const list = historiesByProgram.get(h.studyProgramId) ?? [];
    list.push(h);
    historiesByProgram.set(h.studyProgramId, list);
  }

  const enrichedPrograms = allPrograms.map((row) => ({
    ...row.program,
    university: row.university,
    majorGroup: row.majorGroup,
    benchmark: row.benchmark,
    histories: historiesByProgram.get(row.program.id) ?? [],
  }));

  return {
    universities: allUniversities,
    programs: enrichedPrograms,
  };
}

export type EnrichedProgram = Awaited<ReturnType<typeof getPTNdictionCatalog>>['programs'][number];