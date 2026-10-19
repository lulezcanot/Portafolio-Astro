import { expect, test } from '@playwright/test';

// El servidor de desarrollo de Vite puede responder 504 una vez al optimizar dependencias.
const ignorable = (text: string) => /Outdated Optimize Dep/.test(text);

test.describe('portafolio', () => {
  test('carga sin errores y muestra el nombre, el rol y el estado', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && !ignorable(m.text()) && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Luis Lezcano Tirado' })).toBeVisible();
    await expect(page.getByText('Programador Full Stack Jr').first()).toBeVisible();
    await expect(page.getByText('Abierto a oportunidades')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('la escena 3D se inicia en el hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready', { timeout: 15_000 });
    const box = await page.locator('#scene-canvas').boundingBox();
    expect(box?.width).toBeGreaterThan(300);
  });

  test('la navegación lleva a cada sección', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: /menú/i }).click();
    const links = isMobile ? page.locator('[data-nav-sheet]') : page.getByRole('navigation', { name: 'Principal' });
    await links.getByRole('link', { name: 'Contacto' }).click();
    await expect(page.locator('#contacto')).toBeInViewport({ timeout: 8_000 });
  });

  test('sin scroll horizontal', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('cada caso tiene su página', async ({ page }) => {
    await page.goto('/proyectos/tiendas-vtex-io/');
    await expect(page.getByRole('heading', { level: 1, name: 'Tiendas VTEX IO' })).toBeVisible();
    await page.getByRole('link', { name: /Siguiente bulto/ }).click();
    await expect(page).toHaveURL(/\/proyectos\/quiz-ruta-aprendizaje\//);
  });

  test('una dirección inexistente muestra la 404', async ({ page }) => {
    const res = await page.goto('/no-existe');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Paquete no encontrado' })).toBeVisible();
  });

  test('con movimiento reducido todo el contenido queda visible y sin pin', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('[data-ticket]').first()).toBeVisible();
    await expect(page.locator('[data-ticket]').last()).toBeVisible();
    const pos = await page.locator('[data-ticket]').first().evaluate((el) => getComputedStyle(el).position);
    expect(pos).not.toBe('absolute');
    await ctx.close();
  });
});

test.describe('contacto', () => {
  test('valida los campos y avisa con líneas impresas', async ({ page }) => {
    await page.goto('/#contacto');
    await page.getByRole('button', { name: 'Despachar mensaje' }).click();
    await expect(page.locator('#e-name')).toContainText('nombre');
    await expect(page.locator('#e-email')).toContainText('correo');
    await expect(page.locator('#e-message')).toContainText('10 caracteres');
    await expect(page.locator('[data-log]')).toContainText('Faltan datos');
    await expect(page.locator('#c-name')).toBeFocused();
  });

  test('rechaza un correo inválido', async ({ page }) => {
    await page.goto('/#contacto');
    await page.getByLabel('Tu nombre').fill('Ana');
    await page.getByLabel('Tu correo').fill('ana@');
    await page.getByLabel('Contenido del mensaje').fill('Hola Luis, me gustaría hablar contigo.');
    await page.getByRole('button', { name: 'Despachar mensaje' }).click();
    await expect(page.locator('#e-email')).toBeVisible();
    await expect(page.locator('#e-name')).toBeHidden();
  });

  test('el honeypot responde éxito sin enviar nada y sella la caja', async ({ page }) => {
    let calls = 0;
    await page.route('https://api.web3forms.com/**', (route) => {
      calls++;
      return route.fulfill({ json: { success: true } });
    });
    await page.goto('/#contacto');
    await page.getByLabel('Tu nombre').fill('Bot');
    await page.getByLabel('Tu correo').fill('bot@example.com');
    await page.getByLabel('Contenido del mensaje').fill('Mensaje automático de prueba para el honeypot.');
    await page.locator('#c-company').evaluate((el: HTMLInputElement) => (el.value = 'spam'));
    await page.getByRole('button', { name: 'Despachar mensaje' }).click();
    await expect(page.locator('[data-log]')).toContainText('Enviado', { timeout: 10_000 });
    expect(calls).toBe(0);
  });

  test('envía el mensaje al servicio con los datos del formulario y sella la caja', async ({ page }) => {
    let payload: Record<string, string> | undefined;
    await page.route('https://api.web3forms.com/**', (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ json: { success: true, message: 'ok' } });
    });
    await page.goto('/#contacto');
    await page.getByLabel('Tu nombre').fill('Ana Reclutadora');
    await page.getByLabel('Tu correo').fill('ana@empresa.com');
    await page.getByLabel('Contenido del mensaje').fill('Hola Luis, nos gustaría conversar sobre una vacante.');
    await page.locator('.kind__opt', { hasText: 'Un proyecto' }).click();
    await page.getByRole('button', { name: 'Despachar mensaje' }).click();
    await expect(page.locator('[data-log]')).toContainText('Enviado', { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Enviar otro' })).toBeVisible();
    expect(payload?.access_key).toBe('clave-de-prueba');
    expect(payload?.email).toBe('ana@empresa.com');
    expect(payload?.subject).toContain('Un proyecto');
    expect(payload?.message).toContain('vacante');
  });

  test('si el servicio falla, avisa y deja el correo como alternativa', async ({ page }) => {
    await page.route('https://api.web3forms.com/**', (route) =>
      route.fulfill({ status: 500, json: { success: false, message: 'error' } }),
    );
    await page.goto('/#contacto');
    await page.getByLabel('Tu nombre').fill('Ana');
    await page.getByLabel('Tu correo').fill('ana@empresa.com');
    await page.getByLabel('Contenido del mensaje').fill('Hola Luis, esto es una prueba de error.');
    await page.getByRole('button', { name: 'Despachar mensaje' }).click();
    await expect(page.locator('[data-log]')).toContainText('No se pudo enviar', { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Despachar mensaje' })).toBeEnabled();
  });

  test('copiar el correo avisa que se copió', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/#contacto');
    await page.locator('[data-copy]').click();
    await expect(page.locator('[data-copy-label]')).toContainText('Copiado');
  });
});
