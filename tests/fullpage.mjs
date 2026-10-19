import { chromium } from '@playwright/test';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
for (const [name, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += h * 0.6) { await p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y); await p.waitForTimeout(250); }
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
}
await b.close();
