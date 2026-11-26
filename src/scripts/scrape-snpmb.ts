import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

export interface RawHistoryItem {
  year: number;
  status: 'OPEN' | 'NOT_OPENED';
  quota: number | null;
  applicants: number | null;
}

export interface RawProgramRecord {
  snpmbCode: string;
  univCode: string;
  univName: string;
  province: string;
  pmbUrl: string | null;
  programName: string;
  degree: 'D3' | 'D4' | 'S1';
  snbp: RawHistoryItem[];
  snbt: RawHistoryItem[];
}

interface DiscoveredUniversity {
  cleanCode: string;
  name: string;
  province: string;
  detailHref: string;
}

const MIRROR_URLS = [
  process.env.SNPMB_BASE_URL,
  'https://sidata-ptn-snpmb.bppp.kemdikbud.go.id',
  'https://sidata-ptn-snpmb.bpp.kemdikbud.go.id',
  'https://sidata-ptn.snpmb.id',
].filter(Boolean) as string[];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseNumberOrNull(text: string): number | null {
  const cleaned = text.replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

function normalizeDegree(raw: string): 'D3' | 'D4' | 'S1' {
  const upper = raw.toUpperCase();
  if (upper.includes('D3') || upper.includes('DIPLOMA TIGA')) return 'D3';
  if (upper.includes('D4') || upper.includes('SARJANA TERAPAN')) return 'D4';
  return 'S1';
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} saat mengakses ${url}`);
  }
  return res.text();
}

async function resolveActiveMirror(): Promise<string> {
  for (const baseUrl of MIRROR_URLS) {
    try {
      console.log(`Mencoba koneksi ke ${baseUrl}...`);
      const html = await fetchHtml(`${baseUrl}/ptn_sb.php`);
      if (html.includes('<table')) {
        console.log(`Terhubung ke server aktif: ${baseUrl}`);
        return baseUrl;
      }
    } catch (err) {
      console.warn(
        `  -> Gagal (${baseUrl}):`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  throw new Error('Semua URL mirror SNPMB tidak dapat diakses.');
}

async function fetchUniversityList(
  baseUrl: string,
  endpoint: 'ptn_sb.php' | 'ptn_sn.php'
): Promise<DiscoveredUniversity[]> {
  const html = await fetchHtml(`${baseUrl}/${endpoint}`);
  const $ = cheerio.load(html);
  const univMap = new Map<string, DiscoveredUniversity>();

  $('table tr').each((_, tr) => {
    const anchors = $(tr).find('a[href*="ptn="]');
    if (anchors.length === 0) return;

    const href = anchors.first().attr('href')?.trim();
    if (!href) return;

    const codeMatch = href.match(/ptn=(-?\d+)/);
    if (!codeMatch) return;

    const cleanCode = codeMatch[1].replace(/^-/, '');

    // Ambil teks anchor yang bukan angka murni (nama universitas, bukan kode PTN)
    let name = '';
    anchors.each((__, a) => {
      const txt = $(a).text().trim();
      if (txt && !/^\d+$/.test(txt)) {
        name = txt;
      }
    });

    // Fallback jika nama PTN tidak berada di dalam tag <a>
    if (!name) {
      $(tr)
        .find('td')
        .each((__, td) => {
          const txt = $(td).text().trim();
          if (txt && !/^\d+$/.test(txt) && txt.length > 4 && !name) {
            name = txt;
          }
        });
    }

    if (!cleanCode || !name) return;

    // Ambil kolom provinsi dari <td> teks yang bukan angka dan bukan nama universitas
    let province = 'Indonesia';
    const cells = $(tr).find('td');
    cells.each((__, td) => {
      const txt = $(td).text().trim();
      if (
        txt &&
        txt !== name &&
        !/^\d+$/.test(txt) &&
        !txt.toLowerCase().includes('prodi') &&
        txt.length > 2
      ) {
        province = txt;
      }
    });

    if (!univMap.has(cleanCode)) {
      univMap.set(cleanCode, {
        cleanCode,
        name,
        province,
        detailHref: href,
      });
    }
  });

  return Array.from(univMap.values());
}

async function fetchProgramsForUniversity(
  baseUrl: string,
  endpoint: 'ptn_sb.php' | 'ptn_sn.php',
  detailHref: string,
  univName: string,
  targetQuotaYear: number
) {
  // Cek apakah halaman mengandung lebih dari 5 tautan ptn= (artinya masih halaman indeks)
  const targetUrl = new URL(detailHref, `${baseUrl}/${endpoint}`).toString();
  const html = await fetchHtml(targetUrl);
  const $ = cheerio.load(html);

  const ptnLinks = $('a[href*="ptn="]').length;
  let urlToFetch = targetUrl;

  // Jika halaman indeks, redirect ke detail dengan parameter ptn
  if (ptnLinks > 5) {
    // Ekstrak cleanCode dari href aslinya
    const firstPtnHref = $('a[href*="ptn="]').first().attr('href') ?? '';
    const codeMatch = firstPtnHref.match(/ptn=(-?\d+)/);
    if (codeMatch) {
      const cleanCode = codeMatch[1].replace(/^-/, '');
      urlToFetch = `${baseUrl}/${endpoint}?ptn=-${cleanCode}`;
      console.log(
        `Detected index page, redirecting to detail: ${urlToFetch}`
      );
    }
  }

  const html2 = await fetchHtml(urlToFetch);
  const $2 = cheerio.load(html2);

  let pmbUrl: string | null = null;
  $('a').each((_, a) => {
    const href = $(a).attr('href') ?? '';
    if (
      href.startsWith('http') &&
      !href.includes('kemdikbud.go.id') &&
      !href.includes('snpmb.id')
    ) {
      pmbUrl = href;
    }
  });

  const rows: {
    snpmbCode: string;
    programName: string;
    degree: 'D3' | 'D4' | 'S1';
    histories: RawHistoryItem[];
  }[] = [];

  // Gunakan $(table).find('th') langsung karena tabel SNPMB tidak selalu memakai <thead>
  $('table').each((_, table) => {
    const headers: string[] = [];
    $(table)
      .find('th')
      .each((__, th) => {
        headers.push($(th).text().trim().toLowerCase());
      });

    const isProdiTable = headers.some(
      (h) =>
        h.includes('daya tampung') ||
        h.includes('peminat') ||
        h.includes('jenjang')
    );
    if (!isProdiTable) return;

    const codeIdx = headers.findIndex((h) => h.includes('kode'));
    const nameIdx = headers.findIndex(
      (h) => h.includes('nama') || h.includes('prodi')
    );
    const degreeIdx = headers.findIndex((h) => h.includes('jenjang'));
    const quotaIdx = headers.findIndex(
      (h) => h.includes('daya tampung') || h.includes('kuota')
    );

    const applicantCols: { colIdx: number; year: number }[] = [];
    headers.forEach((h, idx) => {
      if (idx === quotaIdx) return;
      const yearMatch = h.match(/(20\d{2})/);
      if (yearMatch && (h.includes('peminat') || /^\d{4}$/.test(h))) {
        applicantCols.push({ colIdx: idx, year: Number(yearMatch[1]) });
      }
    });

    if (applicantCols.length === 0) {
      const peminatIdx = headers.findIndex((h) => h.includes('peminat'));
      if (peminatIdx !== -1) {
        applicantCols.push({ colIdx: peminatIdx, year: targetQuotaYear - 1 });
      }
    }

    $(table)
      .find('tr')
      .each((__, tr) => {
        // Lewati baris header yang berisi <th>
        if ($(tr).find('th').length > 0) return;

        const cells = $(tr).find('td');
        if (cells.length < 4) return;

        // FILTER KETAT: Baris tidak boleh mengandung tautan ptn=
        if ($(tr).find('a[href*="ptn="]').length > 0) return;

        // Ekstrak snpmbCode dengan validasi minimal 6 digit
        // Kode PTN: 3-4 digit, kode prodi SNPMB: 7-8 digit
        const snpmbCode = codeIdx >= 0 ? $(cells[codeIdx]).text().trim() : $(cells[1]).text().trim();
        if (!/^\d{6,}$/.test(snpmbCode)) return;

        // Ambil program name dari kolom nama, pastikan bukan nama universitas
        const nameCell = nameIdx >= 0 ? $(cells[nameIdx]) : $(cells[2]);
        const programName =
          nameCell.find('a').first().text().trim() || nameCell.text().trim();
        if (!programName || programName.toUpperCase() === univName.toUpperCase())
          return;

        // Normalisasi degree
        const degreeText = degreeIdx >= 0 ? $(cells[degreeIdx]).text().trim() : 'S1';
        const degree = normalizeDegree(degreeText);

        // Ekstrak kuota
        const currentQuota = quotaIdx >= 0 ? parseNumberOrNull($(cells[quotaIdx]).text().trim()) : null;

        // Ekstrak kolom peminat per tahun
        const histories: RawHistoryItem[] = [];

        for (const col of applicantCols) {
          const cellText = $(cells[col.colIdx]).text().trim();
          const applicants = parseNumberOrNull(cellText);
          const isNotOpened =
            cellText === '-' || cellText.toLowerCase().includes('tidak');

          histories.push({
            year: col.year,
            status: isNotOpened && applicants === null ? 'NOT_OPENED' : 'OPEN',
            quota: currentQuota,
            applicants,
          });
        }

        histories.push({
          year: targetQuotaYear,
          status: 'OPEN',
          quota: currentQuota,
          applicants: null,
        });

        rows.push({
          snpmbCode,
          programName,
          degree,
          histories,
        });
      });
  });

  return { pmbUrl, rows };
}

async function main() {
  const TARGET_QUOTA_YEAR = 2026;
  const activeBaseUrl = await resolveActiveMirror();

  const [snbpUnivs, snbtUnivs] = await Promise.all([
    fetchUniversityList(activeBaseUrl, 'ptn_sb.php'),
    fetchUniversityList(activeBaseUrl, 'ptn_sn.php'),
  ]);

  const mergedUnivs = new Map<
    string,
    {
      cleanCode: string;
      name: string;
      province: string;
      snbpHref?: string;
      snbtHref?: string;
    }
  >();

  for (const u of snbpUnivs) {
    mergedUnivs.set(u.cleanCode, {
      cleanCode: u.cleanCode,
      name: u.name,
      province: u.province,
      snbpHref: u.detailHref,
    });
  }

  for (const u of snbtUnivs) {
    const existing = mergedUnivs.get(u.cleanCode);
    if (existing) {
      existing.snbtHref = u.detailHref;
    } else {
      mergedUnivs.set(u.cleanCode, {
        cleanCode: u.cleanCode,
        name: u.name,
        province: u.province,
        snbtHref: u.detailHref,
      });
    }
  }

  console.log(`Ditemukan ${mergedUnivs.size} PTN. Memulai penarikan detail prodi...`);

  const programMap = new Map<string, RawProgramRecord>();
  let processed = 0;

  for (const univ of mergedUnivs.values()) {
    processed += 1;

    try {
      const [snbpData, snbtData] = await Promise.all([
        univ.snbpHref
          ? fetchProgramsForUniversity(
              activeBaseUrl,
              'ptn_sb.php',
              univ.snbpHref,
              univ.name,
              TARGET_QUOTA_YEAR
            )
          : Promise.resolve({ pmbUrl: null, rows: [] }),
        univ.snbtHref
          ? fetchProgramsForUniversity(
              activeBaseUrl,
              'ptn_sn.php',
              univ.snbtHref,
              univ.name,
              TARGET_QUOTA_YEAR
            )
          : Promise.resolve({ pmbUrl: null, rows: [] }),
      ]);

      const pmbUrl = snbpData.pmbUrl ?? snbtData.pmbUrl;

      for (const p of snbpData.rows) {
        programMap.set(p.snpmbCode, {
          snpmbCode: p.snpmbCode,
          univCode: univ.cleanCode,
          univName: univ.name,
          province: univ.province,
          pmbUrl,
          programName: p.programName,
          degree: p.degree,
          snbp: p.histories,
          snbt: [],
        });
      }

      for (const p of snbtData.rows) {
        const existing = programMap.get(p.snpmbCode);
        if (existing) {
          existing.snbt = p.histories;
        } else {
          programMap.set(p.snpmbCode, {
            snpmbCode: p.snpmbCode,
            univCode: univ.cleanCode,
            univName: univ.name,
            province: univ.province,
            pmbUrl,
            programName: p.programName,
            degree: p.degree,
            snbp: [],
            snbt: p.histories,
          });
        }
      }
    } catch (error) {
      console.error(`Gagal memproses PTN ${univ.name}:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Simpan hasil scraping ke file data/snpmb-full.json
  const outputPath = path.resolve(process.cwd(), 'data/snpmb-full.json');
  try {
    // Pastikan direktori tujuan ada
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(Array.from(programMap.values()), null, 2));
    console.log(`Berhasil menyimpan ${programMap.size} program ke ${outputPath}`);
  } catch (error) {
    console.error('Gagal menyimpan file output:', error instanceof Error ? error.message : String(error));
  }
}

main().catch((err) => {
  console.error('Error fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});