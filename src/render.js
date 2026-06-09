/* Rendu du contenu (events / galerie / mandat) à partir de src/content-data.js.
   Tout est statique : généré une fois au chargement, inclus dans le build. */

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function renderEvents(container, events) {
  if (!container || !events?.length) return
  container.innerHTML = events.map((e) => {
    const live = e.statusLive ? ' ev__status--live' : ''
    const logo = e.logo
      ? `<img class="ev__logo${e.logoInvert ? ' ev__logo--dark' : ''}" src="${esc(e.logo)}" alt="" />`
      : ''
    const lineup = e.lineup?.length
      ? `<span class="ev__lineup">${e.lineup.map(esc).join('&nbsp;·&nbsp;')}</span>`
      : ''
    return `
      <li class="ev" data-img="${esc(e.img || '')}">
        <span class="ev__date">${esc(e.date)}</span>
        <span class="ev__main">
          <span class="ev__name">${logo}${esc(e.name)}</span>
          ${lineup}
        </span>
        <span class="ev__venue">${esc(e.venue || '')}</span>
        <span class="ev__status${live}">${esc(e.status || '')}</span>
      </li>`
  }).join('')
}

export function renderGallery(container, items) {
  if (!container || !items?.length) return
  container.innerHTML = items.map((g, i) => {
    const mod = g.size === 'wide' ? ' gal--wide' : g.size === 'tall' ? ' gal--tall' : ''
    const par = g.parallax ?? (i % 2 ? -0.1 : 0.14)
    return `
      <figure class="gal${mod}" data-parallax="${par}">
        <img src="${esc(g.src)}" alt="" loading="lazy" />
        <figcaption>${esc(g.caption || '')}</figcaption>
      </figure>`
  }).join('')
}

export function renderTeam(container, team) {
  if (!container || !team?.length) return
  container.innerHTML = team.map((m, i) => `
    <article class="dj" data-fade style="--i:${i}">
      <div class="dj__top">
        <span class="dj__genre">${esc(m.genre)}</span>
        <span class="dj__role">${esc(m.role)}</span>
      </div>
      <h3 class="dj__name">${esc(m.dj)}</h3>
      <span class="dj__real">${esc(m.name)}</span>
      <p class="dj__quote">«&nbsp;${esc(m.quote)}&nbsp;»</p>
    </article>
  `).join('')
}
