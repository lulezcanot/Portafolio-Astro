// Capturas de revisión visual (no es un test). Uso: node tests/shoot.mjs [url]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4321/';
const out = '.impeccable/review';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const errors = [];

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(`[${s.name}] ${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${s.name}] pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);
  await page.screenshot({ path: `${out}/${s.name}-hero.png` });

  const stops = [
    ['about', '#sobre-mi'],
    ['casos', '#casos'],
    ['trayectoria', '#trayectoria'],
    ['stack', '#stack'],
    ['contacto', '#contacto'],
  ];
  for (const [name, sel] of stops) {
    await page.evaluate((q) => {
      const el = document.querySelector(q);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    }, sel);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/${s.name}-${name}.png` });
  }
  if (s.name === 'desktop') {
    // Recorrido por la pila de casos
    const top = await page.evaluate(() => document.querySelector('#casos').getBoundingClientRect().top + window.scrollY);
    const span = await page.evaluate(() => document.querySelector('#casos').offsetHeight - innerHeight);
    for (const i of [2, 4]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top + (i / 5) * span);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${out}/desktop-casos-${i}.png` });
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(s.name, 'overflow-x:', overflow);
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'sin errores de consola');

// Estados extra: página de caso, menú móvil y caja sellada
{
  const b2 = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const d = await b2.newPage({ viewport: { width: 1440, height: 900 } });
  await d.goto(new URL('/proyectos/route66-big-data/', url).href, { waitUntil: 'networkidle' });
  await d.waitForTimeout(800);
  await d.screenshot({ path: `${out}/desktop-detalle.png`, fullPage: true });

  await d.goto(url, { waitUntil: 'networkidle' });
  await d.waitForTimeout(2500);
  await d.evaluate(() => document.querySelector('#contacto').scrollIntoView({ behavior: 'instant' }));
  await d.waitForTimeout(1500);
  await d.fill('#c-name', 'Ana Reclutadora');
  await d.fill('#c-email', 'ana@empresa.com');
  await d.fill('#c-message', 'Hola Luis, nos gustaría conversar sobre una vacante de Front End.');
  await d.locator('#c-company').evaluate((el) => (el.value = 'x'));
  await d.click('[data-submit]');
  await d.waitForTimeout(3200);
  await d.screenshot({ path: `${out}/desktop-sellado.png` });

  const m = await b2.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(url, { waitUntil: 'networkidle' });
  await m.waitForTimeout(1500);
  await m.click('[data-nav-toggle]');
  await m.waitForTimeout(600);
  await m.screenshot({ path: `${out}/mobile-menu.png` });
  await b2.close();
}
