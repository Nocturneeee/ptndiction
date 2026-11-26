import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('request', req => {
  const url = req.url();
  if (url.includes('prodi') || url.includes('daya') || url.includes('detail') || url.includes('json') || url.includes('php')) {
    console.log('REQ:', url);
  }
});

await page.goto('https://snpmb.id/snbp/daya-tampung-snbp', { waitUntil: 'networkidle' });
// Click first PTN
const link = await page.$('a[href*="kode_ptn"], a[onclick*="get_ptn"], a');
if (link) {
  await link.click();
  await page.waitForTimeout(3000);
}

await browser.close();