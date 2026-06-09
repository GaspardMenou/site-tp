# TECHNO PÔLE — site

Site vitrine du Techno Pôle, l'association des DJs de Centrale Méditerranée.
Site statique : Vite + GSAP + Lenis + Three.js. Aucune base de données.

## Développement

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de prod dans dist/
npm run preview      # prévisualise le build
```

## Déploiement

**CI/CD** : à chaque push sur `main`, la CI build l'image Docker, la pousse sur le
registry et déclenche le déploiement.
- `.gitlab-ci.yml` — GitLab : push sur le Container Registry + trigger **Dokploy**
  (mêmes infra et modèle que site-eclairage). Variables à définir dans
  *Settings → CI/CD* : `DOKPLOY_API_TOKEN`, `DOKPLOY_COMPOSE_ID`.
- `.github/workflows/build.yml` — GitHub : push sur **ghcr.io** (équivalent).
- `docker-compose.yml` — compose de **prod** (image du registry + Traefik), utilisé
  par Dokploy. ⚠️ Ajuste l'image, le `Host(...)` et les noms de routers.

**Tester en local** :
```bash
npm run dev                                   # le plus simple → http://localhost:5173
# ou via Docker :
docker build -t techno-pole .
docker run -p 8080:80 techno-pole             # → http://localhost:8080
```

## ✏️ Mettre le site à jour (le seul truc à connaître)

Deux fichiers, simples à éditer :

- **`content/events.yaml`** — les prochaines dates / prestas. Fichier YAML très
  lisible : date, nom, `asso` (→ logo auto), lieu, statut, et le **line-up** (liste
  de DJs). L'ordre du fichier = l'ordre d'affichage.
- **`src/content-data.js`** → la liste **`TEAM`** : le mandat, un objet par DJ
  (blaze, vrai nom, rôle, genre, punchline).

Puis tu `git push`. C'est tout.

Exemple d'une date dans `content/events.yaml` :

```yaml
- date: "13.09"
  name: WEI 2026
  asso: BDE                 # ajoute le logo du BDE (assos connues : BDE, MSB)
  venue: Week-end d'intégration
  status: LINE-UP À VENIR
  live: true               # badge mis en avant (vert acide)
  lineup: [Sparco, DJ Hyp, Bbmix]
```

### Les photos de la galerie — automatique 📸

Dépose tes photos dans **`src/photos/`** : elles apparaissent toutes seules dans
la galerie, triées par nom, optimisées et incluses au build. Conventions de nom
(optionnelles) : un préfixe `01 - `, `02_`… gère l'ordre ; un nom contenant
`wide` → grand format, `tall` → portrait. (Voir `src/photos/README.md`.)

### Les logos d'assos (prestas)

Sur une date, le champ `asso` du YAML affiche automatiquement le logo de l'asso.
Assos déjà connues : **BDE**, **MSB**.

Pour **ajouter une nouvelle asso** :
1. Dépose son logo (blanc de préférence) dans `public/logos/`.
2. Déclare-la dans la table `ASSOS` de `src/content-data.js` :
   ```js
   const ASSOS = {
     BDE: { logo: '/logos/presta-bde.png' },
     MSB: { logo: '/logos/presta-msb.png', invert: true }, // invert si logo foncé
     BDS: { logo: '/logos/presta-bds.png' },                // ← ta nouvelle asso
   }
   ```
3. Utilise `asso: BDS` dans `content/events.yaml`.

## Structure

```
index.html          structure de la page
content/
  events.yaml       ◀ les dates / prestas (date, asso, line-up…)
src/
  content-data.js   ◀ le mandat (TEAM) + import du YAML + scan de src/photos/
  render.js         génère le HTML des events / galerie / mandat
  main.js           orchestration : Lenis, GSAP, preloader, animations
  hero.js           objet 3D du hero (Three.js)
  style.css         design system
  photos/           ◀ dépose les photos de galerie ici
public/logos/       logos (TP, EC'Lairage, prestas BDE/MSB)
Dockerfile          build Vite → nginx
```

Crédits : son & lumière par [EC'Lairage](https://eclairage.asso.centrale-med.fr/).
Direction artistique inspirée de teletech.events.
