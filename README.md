# Portafolio · Luis Lezcano Tirado

Portafolio hecho con Astro. El mundo visual es **Despacho**: una caja de cartón en Three.js que se pliega, se abre y se sella mientras recorres el sitio; los casos son etiquetas térmicas y el formulario de contacto es una etiqueta de envío.

## Stack

Astro 7 (sitio estático) · Tailwind v4 · Three.js · GSAP (ScrollTrigger) · Lenis · Web3Forms para el formulario.

## Comandos

```sh
npm install
npm run dev        # http://localhost:4321  (o: astro dev --background)
npm run build      # genera el sitio estático en dist/ (súbelo donde quieras)
npm test           # Playwright (levanta el servidor si no está corriendo)
node tests/shoot.mjs   # capturas en .impeccable/review/
```

## Dónde editar

| Qué | Dónde |
| --- | --- |
| Datos personales, experiencia, trayectoria, habilidades, redes | `src/data/profile.ts` |
| Casos (proyectos) | `src/content/projects/*.md` |
| CV descargable | `public/cv-luis-lezcano-tirado.pdf` |
| Caja 3D (geometría, etiqueta, poses por sección) | `src/scripts/scene.ts` y los atributos `data-box` de cada sección |
| Movimiento (scroll, pila de casos, revelados) | `src/scripts/motion.ts` |
| Colores, tipografías y curvas | `src/styles/global.css`, `astro.config.mjs` (fuentes) |

## Formulario de contacto

El sitio es estático, así que el formulario envía a [Web3Forms](https://web3forms.com):

1. Entra a Web3Forms, escribe el correo donde quieres recibir los mensajes (luislezcano.04.05@gmail.com) y te llega una **access key**.
2. Copia `.env.example` a `.env` y pon la key en `PUBLIC_WEB3FORMS_KEY`. En tu hosting, define la misma variable antes de construir (`npm run build`).
3. Reinicia `npm run dev`.

Sin la key, el formulario muestra un aviso y deja el correo a la vista. El campo "Empresa" está oculto y funciona como trampa para bots (honeypot); además hay un límite de 3 envíos cada 10 minutos por navegador.

## Pendiente de confirmar

- Dominio final: descomenta `site` en `astro.config.mjs` con tu dominio para activar las etiquetas canonical y Open Graph url.
- LinkedIn: el CV enlaza `/in/luis-lezcano-tirado-66b4b5285/`; si tu URL pública es `/in/luis-lezcano-tirado/`, cámbiala en `src/data/profile.ts`.
- Imagen para compartir (Open Graph): aún no hay.
- Sellos de los casos (`src/components/ProjectMark.astro`) y portadas: son material dibujado provisional. Reemplázalos por capturas reales de cada proyecto cuando las tengas.
