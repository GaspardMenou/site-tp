import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { EVENTS, GALLERY, TEAM } from './content-data.js'
import { renderEvents, renderGallery, renderTeam } from './render.js'

gsap.registerPlugin(ScrollTrigger)

/* Respecte le réglage système « réduire les animations ». */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches

/* ════════════════════════════════════════════════
   1. SMOOTH SCROLL (Lenis) couplé à GSAP/ScrollTrigger
   ════════════════════════════════════════════════ */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* vélocité du scroll exposée pour les marquees */
let scrollVel = 0
lenis.on('scroll', ({ velocity }) => { scrollVel = velocity })

/* ════════════════════════════════════════════════
   3. PRELOADER → reveal du hero
   ════════════════════════════════════════════════ */
function runPreloader() {
  const pl = document.querySelector('#preloader')
  const counter = document.querySelector('#counter')
  const bar = document.querySelector('#bar')
  const words = document.querySelectorAll('.preloader__word span')

  // Mouvement réduit : on masque le preloader immédiatement, sans compte à rebours.
  if (REDUCED) {
    if (pl) pl.style.display = 'none'
    gsap.set(words, { y: 0 })
    gsap.set('.hero__tag', { opacity: 1 })
    lenis.start()
    return
  }

  lenis.stop()
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.to(words, { y: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, 0.1)

  const count = { v: 0 }
  tl.to(count, {
    v: 100, duration: 2.2, ease: 'power2.inOut',
    onUpdate: () => {
      const val = Math.round(count.v)
      if (counter) counter.textContent = String(val).padStart(3, '0')
      if (bar) bar.style.width = val + '%'
    },
  }, 0.2)

  tl.to('.preloader__inner', { y: -30, opacity: 0, duration: 0.6, ease: 'power3.in' }, '+=0.1')
  tl.to(pl, {
    yPercent: -100, duration: 1, ease: 'expo.inOut',
    onComplete: () => { pl.style.display = 'none'; lenis.start() },
  }, '-=0.2')

  // reveal du hero en parallèle de la sortie du preloader
  tl.add(revealHero(), '-=0.9')
}

function revealHero() {
  const tl = gsap.timeline()
  document.querySelectorAll('.hero__title .line > *').forEach((el, i) => {
    tl.from(el, { yPercent: 110, duration: 1, ease: 'power4.out' }, i * 0.08)
  })
  tl.from('.hero__tag', { opacity: 0, y: 18, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0.3)
  return tl
}

/* prépare le hero title : on enveloppe chaque ligne pour l'overflow */
function prepHeroTitle() {
  document.querySelectorAll('.hero__title .line').forEach((line) => {
    const inner = document.createElement('span')
    inner.textContent = line.textContent
    line.textContent = ''
    line.appendChild(inner)
  })
}

/* ════════════════════════════════════════════════
   4. SPLIT TEXT reveals au scroll
   ════════════════════════════════════════════════ */
function initSplitReveals() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const split = new SplitType(el, { types: 'chars' })
    gsap.from(split.chars, {
      yPercent: 120, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.025,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    })
  })

  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    const split = new SplitType(el, { types: 'words' })
    split.words.forEach((w) => w.classList.add('word'))
    gsap.from(split.words, {
      opacity: 0.12, duration: 0.6, ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 60%', scrub: 1 },
    })
  })

  document.querySelectorAll('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      startAt: { y: 24 },
    })
  })

  // [data-mission] : barre acide (classe .in -> transition CSS) + contenu décalé via GSAP
  document.querySelectorAll('[data-mission]').forEach((item) => {
    gsap.from(item.querySelectorAll('.mission__num, .mission__title, .mission__desc'), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: {
        trigger: item, start: 'top 82%',
        onEnter: () => item.classList.add('in'),
      },
    })
  })

  // [data-reveal] hors hero (ex: CTA contact) : on enveloppe le texte et on révèle au scroll
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return
    const inner = document.createElement('span')
    inner.textContent = el.textContent
    el.textContent = ''
    el.appendChild(inner)
    gsap.from(inner, {
      yPercent: 110, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
}

/* ════════════════════════════════════════════════
   5. MARQUEES pilotés par la vélocité du scroll
   ════════════════════════════════════════════════ */
function initMarquees() {
  document.querySelectorAll('[data-marquee]').forEach((wrap) => {
    const track = wrap.querySelector('.marquee__track')
    const dir = parseFloat(wrap.dataset.dir || '1')
    let x = 0
    let visible = true
    let rafId = null
    const base = 0.6 * dir
    function loop() {
      const half = track.scrollWidth / 2
      x -= (base + scrollVel * 0.35 * dir)
      if (x <= -half) x += half
      if (x > 0) x -= half
      track.style.transform = `translateX(${x}px)`
      rafId = requestAnimationFrame(loop)
    }
    // ne tourne que quand le marquee est à l'écran (économie CPU/batterie)
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && rafId === null) loop()
      else if (!visible && rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    }).observe(wrap)
  })
}

/* ════════════════════════════════════════════════
   7. PARALLAXE galerie
   ════════════════════════════════════════════════ */
function initParallax() {
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax)
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
}

/* ════════════════════════════════════════════════
   8. BOUTONS MAGNÉTIQUES
   ════════════════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect()
      const mx = e.clientX - (r.left + r.width / 2)
      const my = e.clientY - (r.top + r.height / 2)
      gsap.to(el, { x: mx * 0.35, y: my * 0.4, duration: 0.5, ease: 'power3.out' })
    })
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    })
  })
}

/* ════════════════════════════════════════════════
   9. TRANSITIONS d'ancre (overlay qui balaye)
   ════════════════════════════════════════════════ */
function initTransitions() {
  const overlay = document.querySelector('#transition')
  const mark = document.querySelector('.transition__mark')
  document.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href')
      if (!href || !href.startsWith('#')) return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      const tl = gsap.timeline()
      tl.set(overlay, { transformOrigin: 'bottom' })
        .to(overlay, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' })
        .to(mark, { opacity: 1, duration: 0.25 }, '-=0.25')
        .add(() => lenis.scrollTo(target, { immediate: true, offset: 0 }))
        .set(overlay, { transformOrigin: 'top' })
        .to(mark, { opacity: 0, duration: 0.2 })
        .to(overlay, { scaleY: 0, duration: 0.5, ease: 'power3.inOut' }, '-=0.1')
    })
  })
}

/* ════════════════════════════════════════════════
   10. HUD ctOS — horloge live + BPM flicker
   ════════════════════════════════════════════════ */
function initHud() {
  const clock = document.querySelector('#hud-clock')
  const bpm = document.querySelector('#hud-bpm')
  const pad = (n) => String(n).padStart(2, '0')
  function tick() {
    const d = new Date()
    if (clock) clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  tick(); setInterval(tick, 1000)
  setInterval(() => {
    if (bpm) bpm.innerHTML = `BPM&nbsp;${134 + Math.floor(Math.random() * 10)}`
  }, 1400)
}

/* ════════════════════════════════════════════════
   11. DECODE / SCRAMBLE des titres
   ════════════════════════════════════════════════ */
function initScramble() {
  const glyphs = '▓▒░#%@&*<>/\\=+ABCDEF0123456789Ø¥§'
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const final = el.textContent
    let played = false
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => {
        if (played) return; played = true
        let frame = 0
        const total = final.length
        const dur = total * 2 + 18
        const tick = () => {
          let out = ''
          for (let i = 0; i < total; i++) {
            const c = final[i]
            if (c === ' ') { out += ' '; continue }
            out += frame >= i * 2 + 4 ? c : glyphs[Math.floor(Math.random() * glyphs.length)]
          }
          el.textContent = out
          if (frame++ < dur) requestAnimationFrame(tick)
          else el.textContent = final
        }
        tick()
      },
    })
  })
}

/* ════════════════════════════════════════════════
   12. GLITCH périodique sur le wordmark hero
   ════════════════════════════════════════════════ */
function initGlitch() {
  const els = document.querySelectorAll('.hero__title .glitch')
  function fire() {
    els.forEach((el) => {
      el.classList.add('is-glitch')
      setTimeout(() => el.classList.remove('is-glitch'), 420)
    })
    setTimeout(fire, 2600 + Math.random() * 3000)
  }
  setTimeout(fire, 4500)
}

/* ════════════════════════════════════════════════
   13. MENU MOBILE (overlay)
   ════════════════════════════════════════════════ */
function initMobileMenu() {
  const burger = document.querySelector('#nav-burger')
  const menu = document.querySelector('#mobile-menu')
  if (!burger || !menu) return

  const setOpen = (open) => {
    menu.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu')
    menu.setAttribute('aria-hidden', String(!open))
    document.body.style.overflow = open ? 'hidden' : ''
    open ? lenis.stop() : lenis.start()
  }

  burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')))
  menu.querySelectorAll('[data-mobile-link]').forEach((a) =>
    a.addEventListener('click', () => setOpen(false)))
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false)
  })
}

/* ════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════ */
/* Génère le contenu depuis src/content-data.js — AVANT les init()
   pour que les animations captent le DOM final. */
function renderContent() {
  renderEvents(document.querySelector('#ev-list'), EVENTS)
  renderGallery(document.querySelector('.gal-grid'), GALLERY)
  renderTeam(document.querySelector('#roster'), TEAM)
}

function boot() {
  renderContent()
  prepHeroTitle()
  initMobileMenu()
  initMagnetic()
  initTransitions()
  initHud()

  if (REDUCED) {
    // Pas d'animations d'entrée : on force tout le contenu à être visible.
    gsap.set('[data-fade]', { opacity: 1, y: 0 })
  } else {
    initSplitReveals()
    initMarquees()
    initParallax()
    initScramble()
    initGlitch()
    // Three.js chargé à la demande (chunk séparé) : n'alourdit pas le 1er rendu.
    import('./hero.js').then(({ initHero }) => initHero(document.querySelector('#hero-canvas')))
  }

  runPreloader()
  ScrollTrigger.refresh()
}

if (document.readyState === 'complete') boot()
else addEventListener('load', boot)
