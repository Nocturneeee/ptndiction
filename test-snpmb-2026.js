import { chromium } from 'playwright';

async function test() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  let allPTNs = [];
  let programData = []; // Collect program data from detail pages
  
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    
    if (url.includes('proxy-ptn-sn') || url.includes('proxy-ptn-snbt')) {
      try {
        const json = await res.json();
        if (Array.isArray(json)) {
          console.log(`[${status}] ${url.split('/').pop()} - ${json.length} items`);
          allPTNs = [...allPTNs, ...json];
        }
      } catch (e) {}
    }
    
    // Capture program data from detail pages
    if (url.includes('detail') || url.includes('daya-tampung') && url.split('/').length > 4) {
      try {
        const json = await res.json();
        if (json && json.programs) {
          console.log(`[PROGRAMS] Detail page - ${json.programs.length} programs`);
          programData = [...programData, ...json.programs];
        }
      } catch (e) {}
    }
  });

  await page.goto('https://snpmb.id/snbp/daya-tampung-snbp', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Click first PTN to see detail page API calls
  const firstPTNLink = await page.$('a[href*="kode_ptn"]') || await page.$('a:first-child');
  if (firstPTNLink) {
    console.log('Clicking first PTN link...');
    await firstPTNLink.click({ timeout: 3000 });
    await page.waitForTimeout(3000);
  }
  
  // Also test SNBT pathway
  console.log('\\nNavigating to SNBT page...');
  await page.goto('https://snpmb.id/utbk-snbt/daya-tampung-snbt', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const snbtPTNLink = await page.$('a[href*="kode_ptn"]');
  if (snbtPTNLink) {
    console.log('Clicking first SNBT PTN link...');
    await snbtPTNLink.click({ timeout: 3000 });
    await page.waitForTimeout(3000);
  }
  
  await browser.close();
  
  console.log(`\\nTotal PTNs captured: ${allPTNs.length}`);
  console.log(`Program data captured: ${programData.length}`);
  if (allPTNs.length > 0) {
    console.log('\\nSample PTN structure:');
    console.log(JSON.stringify(allPTNs[0], null, 2).substring(0, 500));
  }
}

test().catch(console.error);