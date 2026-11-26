import 'dotenv/config';
import fs from 'node:fs/promises';
import { classifyMajorGroup, MAJOR_GROUP_CATALOG } from './src/lib/major-mapper.js';

async function audit() {
  const content = await fs.readFile('data/snpmb-full.json', 'utf-8');
  const records = JSON.parse(content);

  const stats = new Map<string, number>();
  for (const g of MAJOR_GROUP_CATALOG) {
    stats.set(g.name, 0);
  }

  const fallbackProdis = [];

  for (const r of records) {
    const group = classifyMajorGroup(r.programName);
    stats.set(group.name, (stats.get(group.name) ?? 0) + 1);

    if (group.name === 'Rumpun Ilmu Terapan & Multidisiplin') {
      fallbackProdis.push(r.programName);
    }
  }

  console.log('=== AUDIT KLASIFIKASI RUMPUN ILMU ===');
  for (const [name, count] of stats.entries()) {
    console.log(`- ${name}: ${count} prodi`);
  }

  console.log(`\nJumlah prodi di Fallback Netral: ${fallbackProdis.length}`);
  if (fallbackProdis.length > 0) {
    console.log('Contoh prodi di fallback:', fallbackProdis.slice(0, 20));
  }
}

audit().catch(console.error);