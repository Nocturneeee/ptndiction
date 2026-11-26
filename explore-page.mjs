import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('https://snpmb.id/snbp/daya-tampung-snbp', { waitUntil: 'networkidle', timeout: 60000 });

try {
  await page.waitForSelector('text=PTN tersedia', { timeout: 15000 });
  console.log('Found "PTN tersedia" text');
} catch (e) {
  console.log('Timeout looking for "PTN tersedia"');
}

const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
console.log('\nPage text snippet:');
console.log(bodyText);

const codeMatches = bodyText.match(/UNIVERSITAS[\s\S]{0,50}\d{4}/g);
if (codeMatches) {
  console.log('\nSample code matches:');
  codeMatches.slice(0, 5).forEach(m => console.log(' -', m));
}

const buttons = await page.$$('button');
console.log('\nFirst 5 buttons:');
for (let i = 0; i < Math.min(5, buttons.length); i++) {
  const txt = await buttons[i].innerText();
  console.log(' -', txt.substring(0, 50));
}

const divs = await page.$$('div');
console.log('\nFirst 5 divs with onclick:');
for (let i = 0; i < Math.min(5, divs.length); i++) {
  const onclick = await divs[i].getAttribute('onclick');
  if (onclick) {
    const txt = await divs[i].innerText();
    console.log(' -', txt.substring(0, 30), '| onclick:', onclick.substring(0, 50));
  }
}

await browser.close();