import type { SubtestWeights } from './scoring-engine';

export interface MajorGroupDefinition {
  name: string;
  weightClusterName: string;
  weights: SubtestWeights;
  prioritySubtests: string[];
  priorityReason: string;
  supportingSubjects: string[];
  studentFit: string;
  careerProspects: string[];
  sampleCourses: string[];
  keywords: string[];
}

export const MAJOR_GROUP_CATALOG: MajorGroupDefinition[] = [
  {
    name: 'Komputer & Sains Data',
    weightClusterName: 'Teknologi Informasi',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.22, LBI: 0.1, LBE: 0.12, PM: 0.18 },
    prioritySubtests: ['PK', 'PU', 'PM'],
    priorityReason:
      'Ilmu komputer menuntut logika algoritmik, pemodelan matematika diskrit, dan pemecahan masalah sistematis.',
    supportingSubjects: ['Matematika Tingkat Lanjut', 'Fisika'],
    studentFit: 'Kamu yang menyukai logika pemrograman, rekayasa perangkat lunak, dan analisis sistem.',
    careerProspects: ['Software Engineer', 'Data Scientist', 'DevOps Engineer', 'AI/ML Engineer', 'Product Manager'],
    sampleCourses: ['Algoritma & Struktur Data', 'Basis Data', 'Sistem Operasi', 'Jaringan Komputer', 'Kecerdasan Buatan'],
    keywords: ['informatika', 'ilmu komputer', 'sistem informasi', 'teknologi informasi', 'sains data', 'data science', 'rekayasa perangkat lunak', 'komputer', 'kriptografi', 'siber'],
  },
  {
    name: 'Teknik & Rekayasa',
    weightClusterName: 'Teknik & Rekayasa',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.2, LBI: 0.1, LBE: 0.12, PM: 0.2 },
    prioritySubtests: ['PK', 'PM', 'PU'],
    priorityReason:
      'Bidang keteknikan bertumpu kuat pada kalkulus, fisika terapan, serta penalaran spasial dan kuantitatif.',
    supportingSubjects: ['Fisika', 'Matematika Tingkat Lanjut'],
    studentFit: 'Kamu yang suka merancang solusi fisik maupun sistem industri dan kuat dalam hitungan terapan.',
    careerProspects: ['Civil Engineer', 'Mechanical Engineer', 'Industrial Engineer', 'Project Engineer', 'System Analyst'],
    sampleCourses: ['Kalkulus', 'Fisika Dasar', 'Mekanika Teknik', 'Termodinamika', 'Manajemen Proyek'],
    keywords: ['teknik', 'rekayasa', 'arsitektur', 'perencanaan wilayah', 'planologi', 'geodesi', 'geologi', 'metalurgi', 'pertambangan', 'perminyakan', 'elektro', 'mesin', 'sipil', 'industri', 'kimia', 'lingkungan', 'kelautan', 'perkapalan'],
  },
  {
    name: 'Kesehatan & Kedokteran',
    weightClusterName: 'Ilmu Kesehatan',
    weights: { PU: 0.2, PPU: 0.14, PBM: 0.12, PK: 0.14, LBI: 0.12, LBE: 0.16, PM: 0.12 },
    prioritySubtests: ['PU', 'LBE', 'PPU'],
    priorityReason:
      'Studi kesehatan membutuhkan penalaran diagnostik yang tajam serta pemahaman jurnal medis berbahasa Inggris.',
    supportingSubjects: ['Biologi', 'Kimia'],
    studentFit: 'Kamu yang tekun mempelajari sistem biologis manusia, teliti, dan berorientasi pada pelayanan kesehatan.',
    careerProspects: ['Dokter', 'Apoteker', 'Perawat Klinis', 'Ahli Gizi', 'Peneliti Biomedis'],
    sampleCourses: ['Anatomi & Fisiologi', 'Biokimia', 'Farmakologi', 'Patologi', 'Ilmu Kesehatan Masyarakat'],
    keywords: ['kedokteran', 'kesehatan', 'farmasi', 'keperawatan', 'kebidanan', 'gizi', 'fisioterapi', 'radiologi', 'rekam medis', 'analis kesehatan', 'biomedis', 'psikologi'],
  },
  {
    name: 'Ilmu atau Sains Akuntansi',
    weightClusterName: 'Ekonomi & Bisnis',
    weights: { PU: 0.16, PPU: 0.12, PBM: 0.1, PK: 0.2, LBI: 0.12, LBE: 0.12, PM: 0.18 },
    prioritySubtests: ['PK', 'PM', 'PU'],
    priorityReason:
      'Akuntansi dan perpajakan dekat dengan audit angka, regulasi fiskal, dan pelaporan keuangan presisi.',
    supportingSubjects: ['Ekonomi', 'Matematika'],
    studentFit: 'Kamu yang teliti, rapi, dan nyaman bekerja dengan pembukuan maupun regulasi keuangan.',
    careerProspects: ['Akuntan Publik', 'Auditor', 'Konsultan Pajak', 'Analis Keuangan', 'Staf Keuangan Pemerintah'],
    sampleCourses: ['Akuntansi Keuangan', 'Akuntansi Biaya', 'Auditing', 'Perpajakan', 'Sistem Informasi Akuntansi'],
    keywords: ['akuntansi', 'perpajakan', 'pajak', 'audit', 'perbendaharaan'],
  },
  {
    name: 'Ekonomi & Manajemen Bisnis',
    weightClusterName: 'Ekonomi & Bisnis',
    weights: { PU: 0.18, PPU: 0.12, PBM: 0.12, PK: 0.18, LBI: 0.12, LBE: 0.12, PM: 0.16 },
    prioritySubtests: ['PU', 'PK', 'PM'],
    priorityReason:
      'Pengambilan keputusan bisnis membutuhkan analisis data pasar, statistik ekonomi, dan logika strategis.',
    supportingSubjects: ['Ekonomi', 'Matematika'],
    studentFit: 'Kamu yang tertarik pada dunia bisnis, investasi, pemasaran, dan analisis kebijakan ekonomi.',
    careerProspects: ['Business Analyst', 'Financial Analyst', 'Marketing Manager', 'Ekonom', 'Entrepreneur'],
    sampleCourses: ['Ekonomi Mikro & Makro', 'Manajemen Keuangan', 'Manajemen Pemasaran', 'Ekonometrika', 'Manajemen Strategis'],
    keywords: ['ekonomi', 'manajemen', 'bisnis', 'keuangan', 'perbankan', 'aktuaria', 'kewirausahaan', 'logistik', 'pariwisata', 'perhotelan', 'administrasi bisnis', 'niaga'],
  },
  {
    name: 'Matematika & Ilmu Pengetahuan Alam',
    weightClusterName: 'Sains Dasar',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.22, LBI: 0.1, LBE: 0.12, PM: 0.18 },
    prioritySubtests: ['PK', 'PU', 'PM'],
    priorityReason:
      'Rumpun MIPA menekankan pembuktian matematis, pemodelan statistik, dan metode eksperimen ilmiah.',
    supportingSubjects: ['Matematika Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi'],
    studentFit: 'Kamu yang menyukai riset laboratorium, pemodelan data statistik, dan eksplorasi sains murni.',
    careerProspects: ['Data Analyst', 'Aktuaris', 'Peneliti R&D', 'Quality Control Specialist', 'Ahli Statistika'],
    sampleCourses: ['Analisis Real', 'Statistika Matematis', 'Kimia Organik', 'Fisika Kuantum', 'Biologi Molekuler'],
    keywords: ['matematika', 'statistika', 'fisika', 'kimia', 'biologi', 'geofisika', 'astronomi', 'bioteknologi', 'oseanografi', 'meteorologi'],
  },
  {
    name: 'Pertanian, Peternakan & Kehutanan',
    weightClusterName: 'Agrokompleks',
    weights: { PU: 0.18, PPU: 0.14, PBM: 0.12, PK: 0.16, LBI: 0.14, LBE: 0.12, PM: 0.14 },
    prioritySubtests: ['PU', 'PK', 'PPU'],
    priorityReason:
      'Agrokompleks memadukan pemahaman ekosistem hayati, bioteknologi pangan, dan manajemen agribisnis.',
    supportingSubjects: ['Biologi', 'Kimia'],
    studentFit: 'Kamu yang peduli pada ketahanan pangan, lingkungan hidup, dan industri agribisnis berkelanjutan.',
    careerProspects: ['Agronomist', 'Quality Assurance Pangan', 'Konsultan Agribisnis', 'Konservasionis', 'Peneliti Hayati'],
    sampleCourses: ['Ilmu Tanah', 'Agronomi', 'Teknologi Pangan', 'Nutrisi Ternak', 'Manajemen Agribisnis'],
    keywords: ['pertanian', 'agroteknologi', 'agribisnis', 'peternakan', 'kehutanan', 'perikanan', 'kelautan', 'akuakultur', 'pangan', 'ilmu tanah', 'proteksi tanaman', 'kedokteran hewan'],
  },
  {
    name: 'Bahasa, Sastra & Komunikasi',
    weightClusterName: 'Bahasa & Media',
    weights: { PU: 0.14, PPU: 0.18, PBM: 0.2, PK: 0.08, LBI: 0.2, LBE: 0.12, PM: 0.08 },
    prioritySubtests: ['PBM', 'LBI', 'PPU'],
    priorityReason:
      'Kajian bahasa dan komunikasi berfokus pada analisis wacana, struktur teks, dan strategi penyampaian pesan.',
    supportingSubjects: ['Bahasa Indonesia', 'Bahasa Inggris', 'Sosiologi'],
    studentFit: 'Kamu yang gemar menulis, berbicara di depan publik, memproduksi konten media, atau mempelajari budaya asing.',
    careerProspects: ['Public Relations', 'Content Strategist', 'Jurnalis', 'Penerjemah', 'Brand Communication Specialist'],
    sampleCourses: ['Linguistik Umum', 'Teori Komunikasi', 'Jurnalistik', 'Kesusastraan', 'Komunikasi Massa'],
    keywords: ['sastra', 'bahasa', 'komunikasi', 'jurnalistik', 'hubungan masyarakat', 'humas', 'penyiaran', 'film', 'televisi', 'desain', 'seni', 'kriya', 'musik', 'tari', 'perpustakaan'],
  },
  {
    name: 'Pendidikan & Keguruan',
    weightClusterName: 'Ilmu Pendidikan',
    weights: { PU: 0.18, PPU: 0.16, PBM: 0.16, PK: 0.12, LBI: 0.16, LBE: 0.1, PM: 0.12 },
    prioritySubtests: ['PU', 'PPU', 'PBM'],
    priorityReason:
      'Ilmu pendidikan mengombinasikan penguasaan materi ajar dengan pedagogi dan psikologi perkembangan peserta didik.',
    supportingSubjects: ['Sosiologi', 'Bahasa Indonesia', 'Matematika'],
    studentFit: 'Kamu yang sabar menjelaskan konsep kepada orang lain dan tertarik pada pengembangan kurikulum pendidikan.',
    careerProspects: ['Guru Profesional', 'Pengembang Kurikulum', 'Instructional Designer', 'Konselor Pendidikan', 'Akademisi'],
    sampleCourses: ['Psikologi Pendidikan', 'Pengembangan Kurikulum', 'Evaluasi Pembelajaran', 'Strategi Belajar Mengajar', 'Microteaching'],
    keywords: ['pendidikan', 'pgsd', 'pgpaud', 'bimbingan dan konseling', 'keguruan', 'teknologi pendidikan', 'administrasi pendidikan'],
  },
  {
    name: 'Hukum, Politik & Sosial Humaniora',
    weightClusterName: 'Hukum & Soshum',
    weights: { PU: 0.18, PPU: 0.18, PBM: 0.18, PK: 0.1, LBI: 0.16, LBE: 0.1, PM: 0.1 },
    prioritySubtests: ['PU', 'PPU', 'PBM'],
    priorityReason:
      'Ilmu hukum dan sosial menuntut penalaran deduktif, pemahaman bacaan kritis, dan analisis regulasi publik.',
    supportingSubjects: ['Sosiologi', 'Pendidikan Pancasila', 'Sejarah'],
    studentFit: 'Kamu yang kritis terhadap isu sosial, hukum, kebijakan publik, dan hubungan antarnegara.',
    careerProspects: ['Advokat / Pengacara', 'Legal Corporate', 'Diplomat', 'Analis Kebijakan Publik', 'HR Specialist'],
    sampleCourses: ['Pengantar Ilmu Hukum', 'Hukum Tata Negara', 'Teori Sosiologi', 'Kebijakan Publik', 'Hubungan Internasional'],
    keywords: ['hukum', 'politik', 'pemerintahan', 'hubungan internasional', 'administrasi publik', 'administrasi negara', 'sosiologi', 'antropologi', 'kesejahteraan sosial', 'kriminologi', 'sejarah', 'filsafat', 'arkeologi'],
  },
];

export function classifyMajorGroup(programName: string): MajorGroupDefinition {
  const lower = programName.toLowerCase();

  for (const group of MAJOR_GROUP_CATALOG) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      return group;
    }
  }

  // Default fallback ke Hukum, Politik & Sosial Humaniora
  return MAJOR_GROUP_CATALOG[MAJOR_GROUP_CATALOG.length - 1];
}

export function normalizeMajorName(rawName: string): string {
  return rawName
    .replace(/\b(S1|D3|D4|SARJANA TERAPAN|PROGRAM|STUDI)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function inferUniversityMeta(univCode: string, univName: string) {
  const upper = univName.toUpperCase();

  const type: 'PTN Akademik' | 'PTN Vokasi' | 'PTKIN' =
    upper.includes('ISLAM NEGERI') || upper.includes('UIN ') || upper.includes('IAIN ')
      ? 'PTKIN'
      : upper.includes('POLITEKNIK') || upper.includes('AKADEMI KOMUNITAS')
      ? 'PTN Vokasi'
      : 'PTN Akademik';

  const topTierCodes = new Set([
    '321', // UI
    '332', // ITB
    '361', // UGM
    '341', // IPB
    '381', // UNAIR
    '382', // ITS
    '355', // UNDIP
    '333', // UNPAD
    '372', // UB
    '356', // UNS
  ]);

  const clusterTier = topTierCodes.has(univCode) ? 1 : type === 'PTN Akademik' ? 2 : 3;

  const shortName = univName
    .replace(/UNIVERSITAS /i, 'UNIV. ')
    .replace(/INSTITUT TEKNOLOGI /i, 'IT ')
    .replace(/POLITEKNIK NEGERI /i, 'POLTEK ')
    .slice(0, 28);

  return {
    type,
    clusterTier,
    shortName,
  };
}