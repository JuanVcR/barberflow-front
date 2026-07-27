/// <reference types="node" />

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

const routes = [
  '/',
  '/dashboard',
  '/clientes',
  '/agendamentos',
  '/servicos',
  '/barbeiros',
  '/financeiro',
  '/configuracoes',
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1920,
      height: 1080,
    },
  });

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  for (const route of routes) {
    console.log(`Capturando ${route}`);

    await page.goto(`${BASE_URL}${route}`, {
      waitUntil: 'networkidle',
    });

    const fileName =
      route === '/'
        ? 'home'
        : route.replace(/\//g, '_');

    await page.screenshot({
      path: `screenshots/${fileName}.png`,
      fullPage: true,
    });
  }

  await browser.close();

  console.log('Capturas finalizadas!');
}

main().catch(console.error);
