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
    name: 'Komputer, AI & Sains Data',
    weightClusterName: 'Teknologi Informasi',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.22, LBI: 0.1, LBE: 0.12, PM: 0.18 },
    prioritySubtests: ['PK', 'PU', 'PM'],
    priorityReason:
      'Ilmu komputer dan kecerdasan buatan menuntut logika algoritmik, pemodelan matematika diskrit, serta analisis data skala besar.',
    supportingSubjects: ['Matematika Tingkat Lanjut', 'Fisika'],
    studentFit: 'Kamu yang menyukai pemrograman, pengembangan kecerdasan buatan, sains data, dan rekayasa sistem digital.',
    careerProspects: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cyber Security Analyst', 'Cloud Architect'],
    sampleCourses: ['Algoritma & Struktur Data', 'Machine Learning', 'Deep Learning', 'Sains Data & Big Data', 'Sistem Operasi & Jaringan'],
    keywords: [
      'kecerdasan buatan',
      'artificial intelligence',
      'sains data',
      'data science',
      'teknik informatika',
      'ilmu komputer',
      'sistem informasi',
      'teknologi informasi',
      'rekayasa perangkat lunak',
      'keamanan siber',
      'cyber security',
      'sistem komputer',
      'teknologi rekayasa komputer',
      'jaringan komputer',
      'informatika',
      'komputer',
      'kriptografi',
      'software',
      'sains informasi'
    ],
  },
  {
    name: 'Teknik & Rekayasa',
    weightClusterName: 'Teknik & Rekayasa',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.2, LBI: 0.1, LBE: 0.12, PM: 0.2 },
    prioritySubtests: ['PK', 'PM', 'PU'],
    priorityReason:
      'Bidang keteknikan bertumpu kuat pada kalkulus, fisika terapan, serta penalaran spasial dan perancangan infrastruktur.',
    supportingSubjects: ['Fisika', 'Matematika Tingkat Lanjut'],
    studentFit: 'Kamu yang suka merancang struktur fisik, mesin, sistem industri, dan kuat dalam hitungan terapan.',
    careerProspects: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Industrial Engineer', 'Project Engineer'],
    sampleCourses: ['Kalkulus', 'Fisika Dasar', 'Mekanika Teknik', 'Termodinamika', 'Rangkaian Elektrik'],
    keywords: [
      'teknik elektro',
      'teknik mesin',
      'teknik sipil',
      'teknik industri',
      'teknik kimia',
      'teknik fisika',
      'teknik material',
      'teknik lingkungan',
      'teknik kelautan',
      'teknik pertambangan',
      'teknik perminyakan',
      'teknik geologi',
      'teknik geodesi',
      'teknik geomatika',
      'teknik perkapalan',
      'teknik dirgantara',
      'teknik penerbangan',
      'teknik biomedis',
      'teknik nuklir',
      'teknik robotika',
      'teknik mekatronika',
      'teknik telekomunikasi',
      'teknik rekayasa',
      'teknologi rekayasa',
      'keselamatan dan kesehatan kerja',
      'metalurgi',
      'pertambangan',
      'perminyakan',
      'geologi',
      'geodesi',
      'geomatika',
      'lingkungan',
      'kelautan',
      'perkapalan',
      'dirgantara',
      'penerbangan',
      'biomedis',
      'nuklir',
      'robotika',
      'mekatronika',
      'telekomunikasi',
      'arsitektur',
      'perencanaan wilayah',
      'planologi',
      'elektro',
      'mesin',
      'sipil',
      'industri',
      'kimia',
      'teknik',
      'metrologi',
      'instrumentasi',
      'rekayasa'
    ],
  },
  {
    name: 'Kedokteran, Farmasi & Kesehatan',
    weightClusterName: 'Ilmu Kesehatan',
    weights: { PU: 0.2, PPU: 0.14, PBM: 0.12, PK: 0.14, LBI: 0.12, LBE: 0.16, PM: 0.12 },
    prioritySubtests: ['PU', 'LBE', 'PPU'],
    priorityReason:
      'Studi kesehatan dan kedokteran membutuhkan penalaran diagnostik klinis yang tajam serta pemahaman literatur medis global.',
    supportingSubjects: ['Biologi', 'Kimia'],
    studentFit: 'Kamu yang tekun mempelajari sistem biologis manusia, teliti, dan berorientasi pada penyembuhan pasien.',
    careerProspects: ['Dokter', 'Apoteker', 'Perawat Klinis', 'Bidan', 'Ahli Gizi', 'Sanitarian'],
    sampleCourses: ['Anatomi & Fisiologi', 'Biokimia Kedokteran', 'Farmakologi', 'Patologi Klinik', 'Epidemiologi'],
    keywords: [
      'pendidikan dokter',
      'kedokteran gigi',
      'kedokteran hewan',
      'kedokteran',
      'farmasi',
      'keperawatan',
      'kebidanan',
      'kesehatan masyarakat',
      'ilmu gizi',
      'gizi',
      'fisioterapi',
      'teknologi laboratorium medik',
      'analis kesehatan',
      'rekam medis',
      'radiologi',
      'optometri',
      'kesehatan lingkungan',
      'kesehatan'
    ],
  },
  {
    name: 'Matematika & Sains MIPA',
    weightClusterName: 'Sains Dasar',
    weights: { PU: 0.18, PPU: 0.1, PBM: 0.1, PK: 0.22, LBI: 0.1, LBE: 0.12, PM: 0.18 },
    prioritySubtests: ['PK', 'PU', 'PM'],
    priorityReason:
      'Rumpun MIPA menekankan pembuktian matematis murni, pemodelan statistik tingkat lanjut, dan eksperimen laboratorium ilmiah.',
    supportingSubjects: ['Matematika Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi'],
    studentFit: 'Kamu yang menyukai riset sains fundamental, analisis data statistik, dan pemecahan teorem matematika.',
    careerProspects: ['Aktuaris', 'Data Analyst', 'Peneliti R&D', 'Quality Control Specialist', 'Statistisi'],
    sampleCourses: ['Analisis Real', 'Aljabar Linear', 'Statistika Matematis', 'Kimia Organik', 'Fisika Kuantum'],
    keywords: [
      'ilmu aktuaria',
      'aktuaria',
      'matematika',
      'statistika',
      'fisika',
      'kimia',
      'biologi',
      'geofisika',
      'astronomi',
      'bioteknologi',
      'mikrobiologi',
      'oseanografi',
      'meteorologi',
      'biosains',
      'geografi'
    ],
  },
  {
    name: 'Pertanian, Kehutanan, Peternakan & Perikanan',
    weightClusterName: 'Agrokompleks',
    weights: { PU: 0.18, PPU: 0.14, PBM: 0.12, PK: 0.16, LBI: 0.14, LBE: 0.12, PM: 0.14 },
    prioritySubtests: ['PU', 'PK', 'PPU'],
    priorityReason:
      'Agrokompleks memadukan pemahaman ekosistem hayati, teknologi pangan, dan pengelolaan sumber daya alam berkelanjutan.',
    supportingSubjects: ['Biologi', 'Kimia'],
    studentFit: 'Kamu yang peduli pada ketahanan pangan nasional, konservasi alam, dan pengembangan agribisnis.',
    careerProspects: ['Agronomist', 'Food Technologist', 'Konsultan Agribisnis', 'Ahli Kehutanan', 'Peneliti Kelautan & Perikanan'],
    sampleCourses: ['Ilmu Tanah', 'Agronomi', 'Teknologi Pangan', 'Nutrisi & Makanan Ternak', 'Manajemen Sumberdaya Perairan'],
    keywords: [
      'agroteknologi',
      'agroekoteknologi',
      'agribisnis',
      'ilmu tanah',
      'proteksi tanaman',
      'hama dan penyakit tumbuhan',
      'kehutanan',
      'peternakan',
      'akuakultur',
      'budidaya perairan',
      'sumber daya akuatik',
      'manajemen sumberdaya perairan',
      'teknologi hasil perikanan',
      'perikanan tangkap',
      'ilmu kelautan',
      'teknologi pangan',
      'teknologi industri pertanian',
      'teknologi hasil pertanian',
      'pertanian',
      'perikanan',
      'silvikultur',
      'agronomi'
    ],
  },
  {
    name: 'Ekonomi, Akuntansi & Bisnis',
    weightClusterName: 'Ekonomi & Bisnis',
    weights: { PU: 0.18, PPU: 0.12, PBM: 0.12, PK: 0.18, LBI: 0.12, LBE: 0.12, PM: 0.16 },
    prioritySubtests: ['PU', 'PK', 'PM'],
    priorityReason:
      'Pengelolaan keuangan, akuntansi, dan strategi bisnis membutuhkan analisis data pasar, audit angka, serta pemodelan ekonomi kuantitatif.',
    supportingSubjects: ['Ekonomi', 'Matematika'],
    studentFit: 'Kamu yang teliti dalam pencatatan keuangan, memiliki jiwa kewirausahaan, dan tertarik pada dinamika pasar modal.',
    careerProspects: ['Akuntan Publik', 'Financial Analyst', 'Auditor', 'Business Development Manager', 'Tax Consultant'],
    sampleCourses: ['Akuntansi Keuangan', 'Ekonomi Mikro & Makro', 'Manajemen Keuangan', 'Perpajakan', 'Ekonometrika'],
    keywords: [
      'ekonomi pembangunan',
      'ilmu ekonomi',
      'ekonomi syariah',
      'ekonomi islam',
      'bisnis digital',
      'kewirausahaan',
      'perbankan dan keuangan',
      'administrasi bisnis',
      'administrasi niaga',
      'administrasi perkantoran',
      'manajemen rantai pasok',
      'sekretari',
      'akuntansi',
      'manajemen',
      'ekonomi',
      'bisnis',
      'perbankan',
      'keuangan',
      'perpajakan',
      'pajak',
      'audit',
      'logistik',
      'pariwisata',
      'perhotelan'
    ],
  },
  {
    name: 'Hukum',
    weightClusterName: 'Hukum',
    weights: { PU: 0.2, PPU: 0.18, PBM: 0.18, PK: 0.08, LBI: 0.2, LBE: 0.08, PM: 0.08 },
    prioritySubtests: ['PU', 'LBI', 'PPU'],
    priorityReason:
      'Ilmu hukum menuntut penalaran logika deduktif, kemampuan membaca pasal dan undang-undang secara cermat, serta argumentasi yuridis.',
    supportingSubjects: ['Pendidikan Pancasila & Kewarganegaraan', 'Sosiologi', 'Sejarah'],
    studentFit: 'Kamu yang menjunjung tinggi keadilan, teliti dalam menelaah dokumen legal, dan kritis terhadap persoalan hukum.',
    careerProspects: ['Advokat / Pengacara', 'Legal Corporate Counsel', 'Hakim', 'Jaksa', 'Notaris & Legal Consultant'],
    sampleCourses: ['Pengantar Ilmu Hukum', 'Hukum Perdata', 'Hukum Pidana', 'Hukum Tata Negara', 'Hukum Internasional'],
    keywords: [
      'hukum bisnis',
      'hukum tata negara',
      'hukum internasional',
      'hukum pidana',
      'hukum perdata',
      'ilmu hukum',
      'hukum'
    ],
  },
  {
    name: 'Ilmu Sosial, Politik & Komunikasi',
    weightClusterName: 'Soshum',
    weights: { PU: 0.18, PPU: 0.18, PBM: 0.18, PK: 0.1, LBI: 0.16, LBE: 0.1, PM: 0.1 },
    prioritySubtests: ['PU', 'PPU', 'PBM'],
    priorityReason:
      'Kajian sosial dan politik memerlukan pemahaman mendalam terhadap fenomena masyarakat, diplomasi global, dan teknik komunikasi publik.',
    supportingSubjects: ['Sosiologi', 'Sejarah', 'Geografi'],
    studentFit: 'Kamu yang peka terhadap isu sosial politik, memiliki keterampilan komunikasi persuasif, dan menyukai riset kemasyarakatan.',
    careerProspects: ['Diplomat', 'Public Relations Specialist', 'Jurnalis / Reporter', 'Analis Kebijakan Publik', 'Social Development Worker'],
    sampleCourses: ['Teori Sosiologi', 'Ilmu Politik & Pemerintahan', 'Hubungan Internasional', 'Teori Komunikasi Massa', 'Metodologi Penelitian Sosial'],
    keywords: [
      'hubungan internasional',
      'administrasi publik',
      'administrasi negara',
      'ilmu komunikasi',
      'hubungan masyarakat',
      'manajemen komunikasi',
      'ilmu pemerintahan',
      'kesejahteraan sosial',
      'pembangunan sosial',
      'ilmu perpustakaan',
      'perpustakaan',
      'ilmu politik',
      'politik',
      'pemerintahan',
      'sosiologi',
      'antropologi',
      'jurnalistik',
      'penyiaran',
      'kriminologi',
      'kearsipan',
      'sejarah',
      'filsafat',
      'arkeologi'
    ],
  },
  {
    name: 'Psikologi',
    weightClusterName: 'Psikologi',
    weights: { PU: 0.18, PPU: 0.16, PBM: 0.18, PK: 0.12, LBI: 0.16, LBE: 0.12, PM: 0.08 },
    prioritySubtests: ['PU', 'PBM', 'LBI'],
    priorityReason:
      'Psikologi membutuhkan empati tinggi, pemahaman perilaku manusia, serta penguasaan metode asesmen dan psikometri.',
    supportingSubjects: ['Sosiologi', 'Biologi'],
    studentFit: 'Kamu yang tertarik memahami pola pikir manusia, kesehatan mental, dan dinamika interaksi personal maupun profesional.',
    careerProspects: ['HR Psychologist', 'Clinical Psychologist', 'Educational Counselor', 'Talent Acquisition Specialist', 'Consumer Researcher'],
    sampleCourses: ['Psikologi Umum', 'Psikologi Perkembangan', 'Psikologi Kepribadian', 'Psikodiagnostik', 'Psikologi Industri & Organisasi'],
    keywords: [
      'bimbingan dan konseling',
      'bimbingan konseling',
      'bimb & konseling',
      'psikologi'
    ],
  },
  {
    name: 'Pendidikan & Keguruan',
    weightClusterName: 'Ilmu Pendidikan',
    weights: { PU: 0.18, PPU: 0.16, PBM: 0.16, PK: 0.12, LBI: 0.16, LBE: 0.1, PM: 0.12 },
    prioritySubtests: ['PU', 'PPU', 'PBM'],
    priorityReason:
      'Ilmu pendidikan mengombinasikan penguasaan bidang studi khusus dengan strategi pedagogi dan psikologi belajar peserta didik.',
    supportingSubjects: ['Sosiologi', 'Bahasa Indonesia', 'Matematika'],
    studentFit: 'Kamu yang memiliki dedikasi tinggi dalam pengajaran, penyampaian ilmu, dan penciptaan metode pembelajaran inovatif.',
    careerProspects: ['Guru Profesional', 'Dosen / Akademisi', 'Pengembang Kurikulum', 'Educational Consultant', 'Trainer Korporat'],
    sampleCourses: ['Psikologi Pendidikan', 'Kurikulum & Pembelajaran', 'Strategi Belajar Mengajar', 'Evaluasi Pendidikan', 'Microteaching'],
    keywords: [
      'pendidikan guru',
      'pgsd',
      'pgpaud',
      'paud',
      'pendidikan matematika',
      'pendidikan fisika',
      'pendidikan kimia',
      'pendidikan biologi',
      'pendidikan bahasa',
      'pendidikan sejarah',
      'pendidikan geografi',
      'pendidikan ekonomi',
      'pendidikan sosiologi',
      'pendidikan jasmani',
      'pendidikan olahraga',
      'pendidikan kepelatihan',
      'pendidikan luar biasa',
      'pendidikan khusus',
      'teknologi pendidikan',
      'manajemen pendidikan',
      'pendidikan',
      'keguruan',
      'pend.',
      'pendd.',
      'pancasila & kewarganegaraan',
      'ppkn',
      'kesejahteraan keluarga',
      'kepelatihan olahraga',
      'ilmu keolahragaan',
      'sains keolahragaan',
      'penjaskes',
      'penjas',
      'tata boga',
      'tata busana'
    ],
  },
  {
    name: 'Sastra, Bahasa & Humaniora',
    weightClusterName: 'Bahasa & Budaya',
    weights: { PU: 0.14, PPU: 0.18, PBM: 0.22, PK: 0.08, LBI: 0.22, LBE: 0.12, PM: 0.04 },
    prioritySubtests: ['LBI', 'PBM', 'PPU'],
    priorityReason:
      'Kajian sastra dan bahasa mendalami struktur linguistik, apresiasi karya seni sastra, serta pemahaman mendalam atas lintasan peradaban dan budaya.',
    supportingSubjects: ['Bahasa Indonesia', 'Bahasa Inggris', 'Sejarah'],
    studentFit: 'Kamu yang gemar mendalami karya sastra, penerjemahan bahasa, pelestarian budaya, dan penelitian historis.',
    careerProspects: ['Translator / Interpreter', 'Editor Penerbitan', 'Cultural Heritage Specialist', 'Content Writer', 'Peneliti Bahasa & Budaya'],
    sampleCourses: ['Linguistik Historis', 'Teori Sastra', 'Semiotika', 'Sejarah Peradaban', 'Filsafat Bahasa'],
    keywords: [
      'sastra indonesia',
      'sastra inggris',
      'sastra jepang',
      'sastra korea',
      'sastra arab',
      'sastra mandarin',
      'sastra jerman',
      'sastra prancis',
      'sastra daerah',
      'bahasa dan kebudayaan',
      'linguistik',
      'ilmu sejarah',
      'sastra',
      'bahasa'
    ],
  },
  {
    name: 'Seni, Desain & Arsitektur',
    weightClusterName: 'Seni & Desain',
    weights: { PU: 0.16, PPU: 0.14, PBM: 0.16, PK: 0.12, LBI: 0.14, LBE: 0.12, PM: 0.16 },
    prioritySubtests: ['PM', 'PBM', 'PU'],
    priorityReason:
      'Seni rupa, desain kreatif, dan arsitektur menuntut estetika visual tinggi, kreativitas spasial, serta perancangan ruang fungsional.',
    supportingSubjects: ['Seni Budaya', 'Matematika', 'Fisika'],
    studentFit: 'Kamu yang memiliki kreativitas visual yang kuat, menyukai seni rupa, desain antarmuka/grafis, atau tata ruang bangunan.',
    careerProspects: ['UI/UX Designer', 'Graphic Designer', 'Architect', 'Interior Designer', 'Creative Director'],
    sampleCourses: ['Estetika', 'Teori Warna & Desain', 'Studio Perancangan Arsitektur', 'Sejarah Seni Rupa', 'Komputer Grafis'],
    keywords: [
      'perencanaan wilayah dan kota',
      'desain komunikasi visual',
      'dkv',
      'desain interior',
      'desain produk',
      'seni rupa',
      'seni murni',
      'seni tari',
      'seni musik',
      'seni teater',
      'film dan televisi',
      'karawitan',
      'pedalangan',
      'fotografi',
      'kriya',
      'animasi',
      'arsitektur',
      'planologi',
      'desain',
      'seni',
      'fotografi',
      'film',
      'etnomusikologi'
    ],
  },
  {
    name: 'Rumpun Ilmu Terapan & Multidisiplin',
    weightClusterName: 'Multidisiplin',
    weights: { PU: 0.18, PPU: 0.14, PBM: 0.14, PK: 0.16, LBI: 0.14, LBE: 0.12, PM: 0.14 },
    prioritySubtests: ['PU', 'PK', 'PPU'],
    priorityReason:
      'Program multidisiplin dan terapan menggabungkan berbagai disiplin keilmuan praktis untuk menjawab tantangan dunia kerja modern yang dinamis.',
    supportingSubjects: ['Matematika', 'Bahasa Inggris', 'Ekonomi'],
    studentFit: 'Kamu yang menyukai pendekatan lintas bidang ilmu, fleksibel, dan berorientasi pada pemecahan masalah dunia nyata.',
    careerProspects: ['Generalist Consultant', 'Project Coordinator', 'Operations Specialist', 'Business Analyst', 'Multidisciplinary Researcher'],
    sampleCourses: ['Metodologi Penelitian Terapan', 'Manajemen Inovasi', 'Kewirausahaan & Bisnis', 'Sistem Integrasi', 'Etika Profesi'],
    keywords: [], // Fallback netral
  },
];

export function classifyMajorGroup(programName: string): MajorGroupDefinition {
  const normalized = programName
    .toLowerCase()
    .replace(/\b(s1|s2|s3|d1|d2|d3|d4|sarjana terapan|profesional|spesialis|program studi|strata satu|diploma)\b/gi, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (let i = 0; i < MAJOR_GROUP_CATALOG.length - 1; i++) {
    const group = MAJOR_GROUP_CATALOG[i];
    for (const kw of group.keywords) {
      if (normalized.includes(kw)) {
        return group;
      }
    }
  }

  return MAJOR_GROUP_CATALOG[MAJOR_GROUP_CATALOG.length - 1];
}

export function normalizeMajorName(rawName: string): string {
  return rawName
    .replace(/\b(S1|D3|D4|S2|S3|SARJANA TERAPAN|PROGRAM|STUDI)\b/gi, '')
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