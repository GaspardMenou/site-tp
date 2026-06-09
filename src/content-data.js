/* ═══════════════════════════════════════════════════════════════
   ░░ LE SEUL FICHIER À ÉDITER POUR METTRE LE SITE À JOUR ░░
   Chaque mandat : change les dates, le mandat, dépose les photos
   dans public/photos/ et mets à jour les chemins ci-dessous. Push. C'est tout.
   ═══════════════════════════════════════════════════════════════ */

/* ░░ LES DATES / PRESTAS ░░
   Le contenu vit dans  content/events.yaml  (plus simple à éditer).
   Ici on fait juste la correspondance asso → logo, et l'image de survol. */
import eventsYaml from '../content/events.yaml'

// Assos reconnues dans le champ "asso" du YAML → logo (dans public/logos/).
// invert: true si le logo est foncé (il sera blanchi sur le fond sombre).
const ASSOS = {
  BDE: { logo: '/logos/presta-bde.png' },
  MSB: { logo: '/logos/presta-msb.png', invert: true },
}

export const EVENTS = (eventsYaml || []).map((e) => {
  const asso = e.asso ? ASSOS[e.asso] : null
  return {
    date: e.date,
    name: e.name,
    venue: e.venue,
    status: e.status,
    statusLive: e.live === true,
    lineup: e.lineup || [],
    logo: asso?.logo,
    logoInvert: asso?.invert === true,
  }
})

/* ░░ LA GALERIE — AUTOMATIQUE ░░
   Dépose simplement tes photos dans  src/photos/  → elles apparaissent ici,
   sont triées par nom de fichier, optimisées et incluses au build. Rien à coder.

   Conventions de nom de fichier (optionnelles) :
     • préfixe d'ordre :  "01 - ", "02_", "03." …  → gère l'ordre, n'apparaît pas
     • format          :  un nom contenant "wide" → grand format ; "tall" → portrait
     • couleur         :  un nom contenant "color" → reste en couleur (sinon N&B)
   Ex :  "01 - warehouse.jpg" , "02 - crowd wide color.jpg" , "05 - 4am tall.jpg" */
const photoFiles = import.meta.glob('./photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true, query: '?url', import: 'default',
})

const sortFr = (a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' })
const cleanName = (path) =>
  path.split('/').pop().replace(/\.[^.]+$/, '')
    .replace(/^\s*\d{1,3}\s*[-._)]\s*/, '')        // retire le préfixe d'ordre
    .replace(/\b(wide|tall|color)\b/gi, '')         // retire les mots-clés
    .replace(/[-_]+/g, ' ').trim()

const autoGallery = Object.keys(photoFiles).sort(sortFr).map((path, i) => {
  const low = path.toLowerCase()
  return {
    src: photoFiles[path],
    caption: `${String(i + 1).padStart(3, '0')} · ${cleanName(path).toUpperCase()}`,
    size: low.includes('wide') ? 'wide' : low.includes('tall') ? 'tall' : 'normal',
    color: low.includes('color'),
    parallax: i % 2 ? -0.12 : 0.14,
  }
})

// Fallback : tant que src/photos/ est vide, on montre des placeholders.
const placeholderGallery = [
  { src: 'https://picsum.photos/seed/g1/800/1000',  caption: '001 · WAREHOUSE',    size: 'normal', parallax: 0.12 },
  { src: 'https://picsum.photos/seed/g2/1200/800',  caption: '002 · CROWD',        size: 'wide',   parallax: -0.08 },
  { src: 'https://picsum.photos/seed/g3/800/1000',  caption: '003 · BOOTH',        size: 'normal', parallax: 0.18 },
  { src: 'https://picsum.photos/seed/g4/800/1000',  caption: '004 · LASERS',       size: 'normal', parallax: -0.1 },
  { src: 'https://picsum.photos/seed/g5/800/1200',  caption: '005 · 04:00 AM',     size: 'tall',   parallax: 0.14 },
  { src: 'https://picsum.photos/seed/g6/800/1000',  caption: '006 · SOUND-SYSTEM', size: 'normal', parallax: -0.16 },
]

export const GALLERY = autoGallery.length ? autoGallery : placeholderGallery

/* ░░ LE MANDAT (les DJs) ░░ */
export const TEAM = [
  // Bureau restreint
  { dj: 'Sparco',       name: 'Quentin Courtillat', role: 'Président',       genre: 'COM / TRANCE',     quote: "A plus de musiques sur son ordi que son année de naissance" },
  { dj: 'DJ Hyp',       name: 'Hippolyte Barth',    role: 'Vice-président',  genre: 'TECH / HARD',      quote: "Mixe au hasard" },
  { dj: 'David Ghetto', name: 'Augustin Hot',       role: 'Trésorier',       genre: 'COM / EDM',        quote: "Presque oublié pour les formas ET l'entretien" },
  // Pôle formation
  { dj: 'DJ Graph',     name: 'Raphael Grave',      role: 'Co-respo Forma',  genre: 'RAP / COM',        quote: "Ne croit pas en la roue des quintes" },
  { dj: 'Juke',         name: 'Juliette Verdet',    role: 'Co-respo Forma',  genre: 'COM / EDM',        quote: "Dort au BdB" },
  // Pôle event
  { dj: 'Loyis',        name: 'Louis Chhuon',       role: 'Co-respo Event',  genre: 'HYPERTECH',        quote: "Il préfère mixer et qu'un poisson passe près de lui" },
  { dj: 'DJ Scobar',    name: 'Pablo Pointet',      role: 'Co-respo Event',  genre: 'COM / EDM',        quote: "C'est très dur de mixer bourré" },
  { dj: 'Nawele',       name: 'Nawele Rahbi',       role: 'Respo Sensi-DD',  genre: 'SHATTA / COM',     quote: "Essaye tout le temps de monter sur scène même quand c'est pas son set" },
  // Pôle relation
  { dj: 'Eleønor',      name: 'Eléonore Pinart',    role: 'Respo Presta',    genre: 'COM / EDM',        quote: "A déjà fini en zone chill à sa propre soirée de liste à 20 min de son set" },
  { dj: 'Marcø',        name: 'Marceau Buttin',     role: 'Respo Part',      genre: 'EDM / TRANCE',     quote: "Est toujours trop bourré quand il doit mixer" },
  // Pôle matos
  { dj: 'Bbmix',        name: 'Bérénice Messagier', role: 'Co-respo Matos',  genre: 'HARDTECH / INDUS', quote: "Était en zone chill juste avant son 1er set à la soirée Casa" },
  { dj: 'DJ Topette',   name: 'Matéo Baumard',      role: 'Co-respo Matos',  genre: 'HOUSE / LATINO',   quote: "Change de style à chaque soirée" },
  // Pôle com
  { dj: 'Bensko',       name: 'Benjamin Foultier',  role: 'Respo Vidéo',     genre: 'RAP / COM',        quote: "Palmarès : a mixé à toutes les crémaillères" },
  { dj: 'Adele',        name: 'Adèle Bard',         role: 'Respo Com',       genre: 'RAP / COM',        quote: "A forcément Matuidi Charo dans son set" },
  { dj: 'Beethoven',    name: 'Ludwig Marchand',    role: 'Graphiste',       genre: 'COM / RAP',        quote: "Cherche toutes ses transitions sur TikTok" },
  // T2P
  { dj: 'Le H',         name: 'Henri Leblanc',      role: 'Co-respo T2P',    genre: 'RAP / REGGAETON',  quote: "100% de B2B à son actif" },
  { dj: 'Leojuice',     name: 'Léonard Vanhoove',   role: 'Co-respo T2P',    genre: 'AFRO / RAP',       quote: "Vient mixer sans sa clé en soirée car oublie toujours tout" },
]
