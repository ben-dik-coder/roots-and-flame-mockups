/**
 * Renders full restaurant menu from menu.json
 */
let rfMenuData = null;

async function rfLoadMenu() {
  if (rfMenuData) return rfMenuData;
  // Innebygd data — fungerer uten lokal server (file://)
  if (typeof RF_MENU_DATA !== 'undefined') {
    rfMenuData = RF_MENU_DATA;
    return rfMenuData;
  }
  const base = document.querySelector('script[data-menu-base]')?.dataset.menuBase || '../../shared/data/';
  const res = await fetch(`${base}menu.json`);
  if (!res.ok) throw new Error('Kunne ikke laste meny');
  rfMenuData = await res.json();
  return rfMenuData;
}

function rfEscapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function rfRenderPrices(item) {
  if (item.variants?.length) {
    return item.variants.map((v) =>
      `<div class="variant-line">${rfEscapeHtml(v.name)} <strong>${rfEscapeHtml(v.price)}</strong></div>`
    ).join('');
  }
  if (item.price) {
    return `<div class="single-price">${rfEscapeHtml(item.price)}</div>`;
  }
  return '';
}

function rfRenderLabels(labels) {
  if (!labels?.length) return '';
  return `<div class="item-labels">${labels.map((l) => {
    const spicy = /sterk|spicy|extra/i.test(l);
    return `<span class="label-tag${spicy ? '' : ' mild'}">${rfEscapeHtml(l)}</span>`;
  }).join('')}</div>`;
}

function rfRenderMenuItem(item) {
  return `
    <article class="menu-item-row" data-search="${rfEscapeHtml((item.name + ' ' + item.desc).toLowerCase())}">
      <div>
        <h4 class="item-name">${rfEscapeHtml(item.name)}</h4>
        ${item.desc ? `<p class="item-desc">${rfEscapeHtml(item.desc)}</p>` : ''}
        ${rfRenderLabels(item.labels)}
      </div>
      <div class="menu-item-prices">${rfRenderPrices(item)}</div>
    </article>
  `;
}

function rfSplitPizzaBySection(category) {
  const calzoneStart = category.items.findIndex((i) =>
    /calzone|paradiso|innbakt/i.test(i.name) || /innbakt/i.test(category.sections?.join(''))
  );
  // Use section markers from items - calzone items numbered 24, 25
  const main = [];
  const stuffed = [];
  category.items.forEach((item) => {
    if (/^2[45]\./.test(item.name) || /calzone|paradiso/i.test(item.name)) {
      stuffed.push(item);
    } else {
      main.push(item);
    }
  });
  return { main, stuffed };
}

function rfBuildCategoryPanel(cat, data, lang) {
  const panelId = `cat-${cat.id.replace(/[^a-z0-9]/gi, '-')}`;
  let inner = `<h3 class="menu-cat-heading neon-text soft">${rfEscapeHtml(cat.title.replace(/:$/, ''))}</h3>`;

  if (cat.id === 'pizza' && data.pizzaNote) {
    inner += `<p class="cat-note">${rfEscapeHtml(data.pizzaNote[lang] || data.pizzaNote.no)}</p>`;
    const { main, stuffed } = rfSplitPizzaBySection(cat);
    inner += `<div class="menu-item-list">${main.map(rfRenderMenuItem).join('')}</div>`;
    if (stuffed.length) {
      inner += `<p class="menu-section-heading">${lang === 'en' ? 'STUFFED PIZZA' : 'INNBAKT PIZZA'}</p>`;
      inner += `<div class="menu-item-list">${stuffed.map(rfRenderMenuItem).join('')}</div>`;
    }
    if (data.extras?.dressings) {
      inner += `<div class="menu-extras-block"><h4>${lang === 'en' ? 'DRESSINGS' : 'DRESSING TIL PIZZA'}</h4><div class="menu-item-list">`;
      data.extras.dressings.forEach((d) => {
        inner += rfRenderMenuItem({ name: d.name, desc: '', price: d.price, variants: [], labels: [] });
      });
      inner += `</div></div>`;
    }
    if (data.extras?.glutenFree) {
      inner += `<p class="cat-note" style="margin-top:1.5rem;border:none;">${rfEscapeHtml(data.extras.glutenFree[lang] || data.extras.glutenFree.no)}</p>`;
    }
  } else {
    if (cat.sections?.length && cat.id !== 'pizza') {
      inner += `<p class="cat-note">${rfEscapeHtml(cat.sections.join(' · '))}</p>`;
    }
    inner += `<div class="menu-item-list">${cat.items.map(rfRenderMenuItem).join('')}</div>`;
  }

  return `<div class="menu-category-panel" id="${panelId}" data-category="${rfEscapeHtml(cat.id)}" role="tabpanel">${inner}</div>`;
}

async function rfInitMenu() {
  const sidebar = document.getElementById('menu-sidebar');
  const panels = document.getElementById('menu-panels');
  const search = document.getElementById('menu-search');
  if (!sidebar || !panels) return;

  try {
    const data = await rfLoadMenu();
    const lang = typeof rfGetLang === 'function' ? rfGetLang() : 'no';

    data.categories.forEach((cat, idx) => {
      const slug = cat.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `menu-cat-btn${idx === 0 ? ' active' : ''}`;
      btn.dataset.category = slug;
      btn.innerHTML = `${rfEscapeHtml(cat.title.replace(/:$/, ''))} <span class="count">${cat.items.length}</span>`;
      btn.addEventListener('click', () => rfActivateCategory(slug));
      sidebar.appendChild(btn);

      panels.insertAdjacentHTML('beforeend', rfBuildCategoryPanel(cat, data, lang));
    });

    rfActivateCategory(data.categories[0].id);

    if (search) {
      let activeCat = data.categories[0].id;
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        if (!q) {
          rfActivateCategory(activeCat);
          return;
        }
        document.querySelectorAll('.menu-item-row').forEach((row) => {
          row.style.display = row.dataset.search.includes(q) ? '' : 'none';
        });
        document.querySelectorAll('.menu-category-panel').forEach((p) => {
          p.classList.add('active');
          p.style.display = 'block';
        });
      });
      document.querySelectorAll('.menu-cat-btn').forEach((btn) => {
        btn.addEventListener('click', () => { activeCat = btn.dataset.category; });
      });
    }

    // Hash deep link #menu or #menu-pizza
    const hash = location.hash.replace(/^#(full-)?menu-?/, '');
    if (hash) {
      const found = data.categories.find((c) => c.id === hash || c.slug === hash);
      if (found) rfActivateCategory(found.id);
    }
  } catch (e) {
    panels.innerHTML = `<p style="color:var(--muted);">Menyen kunne ikke lastes. Start en lokal server (se README) eller sjekk nettet.</p>`;
    console.error(e);
  }
}

function rfActivateCategory(id) {
  document.querySelectorAll('.menu-cat-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.category === id);
  });
  document.querySelectorAll('.menu-category-panel').forEach((p) => {
    const on = p.dataset.category === id;
    p.classList.toggle('active', on);
    if (!document.getElementById('menu-search')?.value) {
      p.style.display = on ? 'block' : 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', rfInitMenu);
