import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'node:fs/promises';
import path from 'node:path';

// Interface untuk history per tahun
export interface RawHistoryItem {
  year: number;
  status: 'OPEN' | 'NOT_OPENED';
  quota: number | null;
  applicants: number | null;
}

// Interface untuk record program studi lengkap
export interface RawProgramRecord {
  snpmbCode: string;
  univCode: string;
  univName: string;
  province: string;
  pmbUrl: string | null;
  programName: string;
  degree: 'D3' | 'D4' | 'S1';
  quota: number | null;
  snbp: RawHistoryItem[];
  snbt: RawHistoryItem[];
}

// Interface PTN dari API
interface ApiPTN {
  id_ptn: number;
  kode_ptn: number;
  nama: string;
  web: string;
  provinsi?: Array<{
    nama_prov1?: string;
    nama_prov2?: string;
  }>;
}

// Interface HistoryItem dari API
interface ApiHistoryItem {
  tahun: number;
  daya_tampung: number | null;
  peminat: number | null;
  terima?: number | null;
}

// Interface Prodi dari API
interface ApiProdi {
  id_ptn: number;
  id_prodi: number;
  kode_prodi: number;
  nama: string;
  jenjang: string;
  daya_tampung_snbp?: string | number;
  daya_tampung_snbt?: string | number;
  history_daya_tampung?: ApiHistoryItem[];
}

// Fungsi bantuan: membersihkan kode PTN
function cleanCode(code: string | number): string {
  return String(code).replace(/^-/, '');
}

// Normalisasi jenjang
function normalizeDegree(raw: string): 'D3' | 'D4' | 'S1' {
  const upper = (raw || '').toUpperCase();
  if (upper.includes('D3') || upper.includes('DIPLOMA TIGA') || upper.includes('DIPLOMA III')) return 'D3';
  if (upper.includes('D4') || upper.includes('SARJANA TERAPAN') || upper.includes('DIPLOMA IV')) return 'D4';
  return 'S1';
}

// Parse number
function parseNumberOrNull(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

// Headers untuk HTTP fetch
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://snpmb.id/',
};

// Scrape satu pathway (SNBP atau SNBT)
async function fetchPathwayData(pathway: 'SNBP' | 'SNBT'): Promise<Map<string, RawProgramRecord>> {
  const isSnbp = pathway === 'SNBP';
  const ptnUrl = isSnbp
    ? 'https://snpmb.id/proxy-ptn-sn.php'
    : 'https://snpmb.id/proxy-ptn-sb.php';
  const prodiBaseUrl = isSnbp
    ? 'https://snpmb.id/proxy-prodi-sn.php?ptn='
    : 'https://snpmb.id/proxy-prodi-sb.php?ptn=';

  console.log(`=== Memulai Sinkronisasi Data ${pathway} via Official API ===`);
  console.log(`Fetching PTN list: ${ptnUrl}`);

  const ptnRes = await fetch(ptnUrl, { headers: HEADERS });
  if (!ptnRes.ok) {
    throw new Error(`Gagal fetch PTN ${pathway}: HTTP ${ptnRes.status}`);
  }

  const ptnList = (await ptnRes.json()) as ApiPTN[];
  console.log(`Ditemukan ${ptnList.length} PTN untuk ${pathway}\n`);

  const programMap = new Map<string, RawProgramRecord>();

  for (let i = 0; i < ptnList.length; i++) {
    const ptn = ptnList[i];
    const idPtn = ptn.id_ptn;
    const kodePtnClean = cleanCode(ptn.kode_ptn);
    const univName = ptn.nama || `PTN ${kodePtnClean}`;
    const provObj = ptn.provinsi?.[0];
    const province = provObj?.nama_prov1 || provObj?.nama_prov2 || 'Indonesia';
    const pmbUrl = ptn.web || null;

    try {
      const url = `${prodiBaseUrl}${idPtn}`;
      const res = await fetch(url, { headers: HEADERS });

      if (!res.ok) {
        console.warn(`  [${i + 1}/${ptnList.length}] Warning HTTP ${res.status} untuk ${univName} (${idPtn})`);
        continue;
      }

      const prodiList = (await res.json()) as ApiProdi[];

      if (Array.isArray(prodiList)) {
        for (const prodi of prodiList) {
          const snpmbCode = cleanCode(prodi.kode_prodi);
          const programName = (prodi.nama || '').replace(/[\n\s]+/g, ' ').trim();
          if (!snpmbCode || !programName) continue;

          const degree = normalizeDegree(prodi.jenjang);
          const quota2026 = parseNumberOrNull(isSnbp ? prodi.daya_tampung_snbp : prodi.daya_tampung_snbt);

          // Map history 5 tahun (2021 - 2025)
          const historyMap = new Map<number, RawHistoryItem>();
          if (prodi.history_daya_tampung && Array.isArray(prodi.history_daya_tampung)) {
            for (const h of prodi.history_daya_tampung) {
              historyMap.set(h.tahun, {
                year: h.tahun,
                status: 'OPEN',
                quota: parseNumberOrNull(h.daya_tampung),
                applicants: parseNumberOrNull(h.peminat),
              });
            }
          }

          const historyItems: RawHistoryItem[] = [2021, 2022, 2023, 2024, 2025].map((yr) => {
            if (historyMap.has(yr)) {
              return historyMap.get(yr)!;
            }
            return {
              year: yr,
              status: 'NOT_OPENED',
              quota: null,
              applicants: null,
            };
          });

          // Record program
          const record: RawProgramRecord = {
            snpmbCode,
            univCode: kodePtnClean,
            univName,
            province,
            pmbUrl,
            programName,
            degree,
            quota: quota2026,
            snbp: isSnbp ? historyItems : [],
            snbt: isSnbp ? [] : historyItems,
          };

          programMap.set(snpmbCode, record);
        }

        console.log(`  [${i + 1}/${ptnList.length}] ${univName} (${kodePtnClean}) -> ${prodiList.length} prodi ter-ekstrak`);
      }
    } catch (err) {
      console.error(`  [${i + 1}/${ptnList.length}] Error fetching ${univName}:`, err instanceof Error ? err.message : String(err));
    }

    // Jeda kecil 20ms
    await new Promise((r) => setTimeout(r, 20));
  }

  console.log(`\n=== Selesai ${pathway}: Total ${programMap.size} prodi unik ===\n`);
  return programMap;
}

// Main Runner
async function main() {
  console.log('=====================================================');
  console.log('=== SISTEM SINKRONISASI DATA UTAMA SNPMB 2026 ===');
  console.log('=====================================================\n');

  // 1. Fetch SNBP
  const snbpMap = await fetchPathwayData('SNBP');

  // 2. Fetch SNBT
  const snbtMap = await fetchPathwayData('SNBT');

  // 3. Gabungkan data SNBP dan SNBT berdasarkan snpmbCode
  const mergedPrograms = new Map<string, RawProgramRecord>();

  // Masukkan semua prodi SNBP
  for (const [code, rec] of snbpMap.entries()) {
    mergedPrograms.set(code, rec);
  }

  // Gabungkan prodi SNBT
  for (const [code, snbtRec] of snbtMap.entries()) {
    if (mergedPrograms.has(code)) {
      const existing = mergedPrograms.get(code)!;
      existing.snbt = snbtRec.snbt;
      // Prefer kuota non-null jika ada
      if (snbtRec.quota !== null && existing.quota === null) {
        existing.quota = snbtRec.quota;
      }
    } else {
      mergedPrograms.set(code, snbtRec);
    }
  }

  const allPrograms = Array.from(mergedPrograms.values());

  // Hitung jumlah PTN unik
  const uniqueUnivs = new Set(allPrograms.map((p) => p.univCode));

  console.log('=====================================================');
  console.log('=== HASIL AKHIR PENGUMPULAN DATA ===');
  console.log(`Total Program Studi Unik : ${allPrograms.length}`);
  console.log(`Total PTN Unik           : ${uniqueUnivs.size}`);
  console.log('=====================================================\n');

  // Guard validation
  if (uniqueUnivs.size < 130 || allPrograms.length < 3500) {
    console.error(`[ERROR] Validasi GAGAL: Ditemukan ${uniqueUnivs.size} PTN dan ${allPrograms.length} prodi.`);
    console.error('Syarat minimum: 130 PTN dan 3,500 prodi.');
    process.exit(1);
  }

  console.log('=== Validasi Syarat Minimum LULUS ===\n');

  // Log 5 contoh prodi dari Universitas Brawijaya (1372)
  const ubPrograms = allPrograms.filter((p) => p.univCode === '1372');
  console.log('--- 5 CONTOH PRODI UNIVERSITAS BRAWIJAYA (KODE 1372) ---');
  ubPrograms.slice(0, 5).forEach((p, idx) => {
    console.log(
      `${idx + 1}. [${p.snpmbCode}] ${p.programName} (${p.degree}) | Kuota: ${p.quota} | SNBP Hist: ${p.snbp.length} yr | SNBT Hist: ${p.snbt.length} yr`
    );
  });
  console.log('-----------------------------------------------------\n');

  // Simpan ke data/snpmb-full.json
  const outputPath = path.join(process.cwd(), 'data', 'snpmb-full.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(allPrograms, null, 2), 'utf-8');

  console.log(`[BERHASIL] Tersimpan ${allPrograms.length} program studi ke ${outputPath}`);
  console.log('=== SINKRONISASI DATA SELESAI ===\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});