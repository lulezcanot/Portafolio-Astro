// Formulario de contacto: sitio 100% estático. El envío usa Web3Forms (https://web3forms.com):
// pones tu access key en PUBLIC_WEB3FORMS_KEY y los mensajes llegan al correo con el que la creaste.
const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = (import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined)?.trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KINDS: Record<string, string> = {
  oportunidad: 'Una oportunidad',
  proyecto: 'Un proyecto',
  saludo: 'Un saludo',
};

// Límite sencillo en el navegador: 3 envíos cada 10 minutos.
const WINDOW = 10 * 60 * 1000;
const MAX_HITS = 3;
const STORE = 'despacho:envios';

type Field = 'name' | 'email' | 'message';
const MESSAGES: Record<Field, string> = {
  name: 'Escribe tu nombre.',
  email: 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
  message: 'Cuéntame un poco más: el mensaje necesita al menos 10 caracteres.',
};

function limited() {
  try {
    const now = Date.now();
    const recent = (JSON.parse(localStorage.getItem(STORE) ?? '[]') as number[]).filter((t) => now - t < WINDOW);
    if (recent.length >= MAX_HITS) return true;
    recent.push(now);
    localStorage.setItem(STORE, JSON.stringify(recent));
  } catch {
    /* sin almacenamiento: no limitamos */
  }
  return false;
}

export function initContact() {
  initCopy();

  const form = document.querySelector<HTMLFormElement>('[data-contact]');
  if (!form) return;
  const log = form.querySelector<HTMLElement>('[data-log]')!;
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const idle = label.textContent ?? 'Despachar mensaje';
  let busy = false;
  let sent = false;

  const print = (text: string, tone: 'info' | 'ok' | 'error' = 'info') => {
    const p = document.createElement('p');
    p.dataset.tone = tone;
    p.textContent = `› ${text}`;
    log.append(p);
  };
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

  const setError = (name: Field, message: string | null) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
    const out = form.querySelector<HTMLElement>(`[data-err="${name}"]`);
    if (!input || !out) return;
    out.textContent = message ?? '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  const validate = (data: FormData) => {
    const bad: Field[] = [];
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!name) bad.push('name');
    if (!EMAIL_RE.test(email)) bad.push('email');
    if (message.length < 10) bad.push('message');
    (['name', 'email', 'message'] as Field[]).forEach((f) => setError(f, bad.includes(f) ? MESSAGES[f] : null));
    return bad;
  };

  const seal = () => {
    sent = true;
    label.textContent = 'Enviar otro';
    form.reset();
    window.dispatchEvent(new CustomEvent('despacho:seal'));
  };

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    const name = (t as HTMLInputElement).name as Field;
    if (name && t.getAttribute('aria-invalid') === 'true') setError(name, null);
    if (sent) {
      sent = false;
      label.textContent = idle;
      window.dispatchEvent(new CustomEvent('despacho:unseal'));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    log.replaceChildren();
    const data = new FormData(form);
    const bad = validate(data);
    if (bad.length) {
      print(`Faltan datos: revisa ${bad.length === 1 ? 'un campo' : `${bad.length} campos`}.`, 'error');
      (form.elements.namedItem(bad[0]) as HTMLElement | null)?.focus();
      return;
    }

    const ref = `LLT-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    busy = true;
    button.disabled = true;
    label.textContent = 'Embalando…';
    print('Validando datos');
    await wait(260);
    print('Embalando mensaje');

    const done = (ok: boolean, lines: string[]) => {
      busy = false;
      button.disabled = false;
      if (ok) {
        print(`Enviado. N.º ${ref}`, 'ok');
        lines.forEach((l) => print(l, 'ok'));
        seal();
      } else {
        label.textContent = idle;
        lines.forEach((l) => print(l, 'error'));
      }
    };

    // Trampa para bots: el campo oculto solo lo llenan programas. Fingimos éxito y no enviamos nada.
    if (String(data.get('company') ?? '').trim() !== '') {
      await wait(520);
      return done(true, ['Te respondo al correo que dejaste.']);
    }

    if (!ACCESS_KEY) {
      await wait(300);
      return done(false, ['El envío desde aquí todavía no está configurado.', 'Escríbeme directo al correo de arriba.']);
    }

    if (limited()) {
      await wait(300);
      return done(false, ['Ya enviaste varios mensajes. Inténtalo de nuevo en unos minutos.']);
    }

    const kind = KINDS[String(data.get('kind') ?? 'oportunidad')] ?? KINDS.oportunidad;
    const name = String(data.get('name')).trim();
    const body = {
      access_key: ACCESS_KEY,
      subject: `[Portafolio] ${kind} · ${name}`,
      from_name: 'Portafolio',
      name,
      email: String(data.get('email')).trim(),
      message: `${kind} (ref. ${ref})\n\n${String(data.get('message')).trim()}`,
      botcheck: '',
    };

    try {
      const [res] = await Promise.all([
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        }),
        wait(520),
      ]);
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (res.ok && json.success) return done(true, ['Te respondo al correo que dejaste.']);
      console.warn('[contacto] El servicio respondió:', json.message);
      return done(false, ['No se pudo enviar el mensaje en este momento.', 'Puedes escribirme directo al correo de arriba.']);
    } catch {
      return done(false, ['No hay conexión con el servicio de envío.', 'Puedes escribirme directo al correo de arriba.']);
    }
  });
}

function initCopy() {
  const btn = document.querySelector<HTMLButtonElement>('[data-copy]');
  const text = btn?.querySelector<HTMLElement>('[data-copy-label]');
  const hint = btn?.querySelector<HTMLElement>('.channel__hint');
  if (!btn || !text) return;
  const original = text.textContent ?? '';
  let timer: number | undefined;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? original);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(text);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
    text.textContent = 'Copiado al portapapeles';
    if (hint) hint.textContent = 'Listo';
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      text.textContent = original;
      if (hint) hint.textContent = 'Copiar';
    }, 1800);
  });
}
