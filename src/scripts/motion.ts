import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : document.documentElement;
    if (!target) return;
    e.preventDefault();
    lenis?.scrollTo(id ? target : 0, { duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
    history.replaceState(null, '', id ? `#${id}` : location.pathname);
  });
}

function initReveals() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const go = () => requestAnimationFrame(() => hero.classList.add('is-in'));
  if (reduced) return hero.classList.add('is-in');
  document.fonts?.ready.then(go, go);
  setTimeout(go, 1200);
}

function initWords() {
  const heading = document.querySelector<HTMLElement>('[data-words]');
  if (!heading || reduced) return;
  const words = heading.querySelectorAll<HTMLElement>('.w');
  gsap.set(words, { opacity: 0.18 });
  gsap.to(words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.12,
    scrollTrigger: { trigger: heading, start: 'top 82%', end: 'bottom 48%', scrub: true },
  });
}

function initTrack() {
  const track = document.querySelector<HTMLElement>('[data-track]');
  if (!track) return;
  if (reduced) return track.style.setProperty('--fill', '1');
  track.style.setProperty('--fill', '0');
  ScrollTrigger.create({
    trigger: track,
    start: 'top 75%',
    end: 'bottom 62%',
    scrub: true,
    onUpdate: (self) => track.style.setProperty('--fill', String(self.progress)),
  });
}

function initCases() {
  const section = document.querySelector<HTMLElement>('[data-cases]');
  if (!section) return;
  const tickets = Array.from(section.querySelectorAll<HTMLElement>('[data-ticket]'));
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-goto]'));
  const slot = section.querySelector<HTMLElement>('[data-box="casos"]');
  const n = tickets.length;
  if (n < 2) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
    let active = -1;

    const print = (el: HTMLElement) => {
      el.classList.remove('is-printing');
      void el.offsetWidth;
      el.classList.add('is-printing');
    };

    const render = (progress: number) => {
      const pos = progress * (n - 1);
      const now = Math.round(pos);
      tickets.forEach((t, i) => {
        const d = i - pos;
        if (d > 0) {
          const y = Math.min(d, 1) * 108;
          t.style.transform = `translateY(${y}%)`;
          t.style.filter = '';
          t.style.visibility = d > 1.02 ? 'hidden' : 'visible';
        } else {
          const s = 1 + Math.max(d, -4) * 0.04;
          const dim = Math.max(0.5, 1 + d * 0.2);
          t.style.transform = `translateY(${d * -16}px) scale(${s})`;
          t.style.filter = `brightness(${dim})`;
          t.style.visibility = d < -3.5 ? 'hidden' : 'visible';
        }
        t.style.zIndex = String(i + 1);
      });
      if (now !== active) {
        active = now;
        buttons.forEach((b, i) => {
          b.dataset.state = i === now ? 'active' : i < now ? 'seen' : 'idle';
          if (i === now) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
        print(tickets[now]);
        if (slot) slot.dataset.ry = String(-48 + now * 19);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(st.progress);

    const onClick = (e: Event) => {
      const b = (e.currentTarget as HTMLElement).dataset.goto;
      if (b === undefined) return;
      const i = Number(b);
      const top = section.getBoundingClientRect().top + window.scrollY;
      const span = section.offsetHeight - window.innerHeight;
      const y = top + (i / (n - 1)) * span;
      if (lenis) lenis.scrollTo(y, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: y });
    };
    buttons.forEach((b) => b.addEventListener('click', onClick));

    return () => {
      st.kill();
      buttons.forEach((b) => b.removeEventListener('click', onClick));
      tickets.forEach((t) => {
        t.style.transform = '';
        t.style.filter = '';
        t.style.visibility = '';
        t.style.zIndex = '';
        t.classList.remove('is-printing');
      });
    };
  });

  // Modo lista: las etiquetas se revelan al entrar
  mm.add('(max-width: 900px), (max-height: 599px), (prefers-reduced-motion: reduce)', () => {
    tickets.forEach((t) => t.setAttribute('data-reveal', ''));
    initReveals();
  });
}

function initScene() {
  if (document.body.dataset.scene !== 'on') return;
  const load = () =>
    import('./scene')
      .then((m) => m.initScene())
      .catch((err) => {
        console.warn('[escena] No se pudo iniciar WebGL:', err);
        document.documentElement.classList.add('no-webgl');
      });
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(load, { timeout: 1500 });
  else setTimeout(load, 400);
}

export function initMotion() {
  initScroll();
  initHero();
  initReveals();
  initWords();
  initTrack();
  initCases();
  initScene();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
