const TELEGRAM_USERNAME = 'Shneerzon';
const INSTAGRAM_USERNAME = 'olfer_aperfume';
const WHATSAPP_NUMBER = '380962566574';
const ML_OPTIONS = [1, 2, 3, 5, 10];
let cart = JSON.parse(localStorage.getItem('olfera_cart')) || [];

const style = document.createElement('style');
style.textContent = '.ml-row{display:flex;gap:6px;justify-content:center;margin:10px 0 4px;flex-wrap:wrap}.ml-btn{border:1px solid #c9a84c;background:#fff;color:#7a6124;border-radius:999px;padding:4px 10px;font-size:.75rem;cursor:pointer}.ml-btn.active{background:#9a7b2f;color:#fff}.ml-custom{width:88px;border:1px solid #c9a84c;border-radius:999px;padding:4px 8px;text-align:center;font-size:16px}.line-total{font-size:.85rem;color:#7a6124;margin-top:4px}';
document.head.appendChild(style);

function updateCartUI() {
  const count = document.querySelector('.cart-count');
  const total = cart.reduce((s, i) => s + i.price * (i.ml || 1) * i.qty, 0);
  if (count) { count.textContent = cart.reduce((s, i) => s + i.qty, 0); count.dataset.count = String(cart.reduce((s, i) => s + i.qty, 0)); }
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.innerHTML = 'Разом: <strong>' + total.toLocaleString('uk-UA') + ' ₴</strong>';
  const cartItemsContainer = document.getElementById('cart-items');
  if (!cartItemsContainer) return;
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
    return;
  }
  cartItemsContainer.innerHTML = cart.map(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    return '<div class="cart-item"><div><h4>' + item.name + '</h4><p>' + (item.brand || '') + '</p><p class="cart-item-price">' + ml + ' мл × ' + item.price + ' ₴ = ' + line.toLocaleString('uk-UA') + ' ₴</p></div><button class="cart-item-remove" onclick="removeFromCart(' + item.id + ', ' + ml + ')">&times;</button></div>';
  }).join('');
}
function saveCart() { localStorage.setItem('olfera_cart', JSON.stringify(cart)); updateCartUI(); }
function addToCart(product) {
  const ml = Number(product.ml) || 1;
  const existing = cart.find(item => item.id === product.id && item.ml === ml);
  if (existing) existing.qty += 1;
  else cart.push(Object.assign({}, product, { ml: ml, qty: 1 }));
  saveCart();
}
function removeFromCart(id, ml) {
  cart = cart.filter(item => !(item.id === id && item.ml === ml));
  saveCart();
}

const savedOrder = JSON.parse(localStorage.getItem('olfera_order') || '{}');
function saveOrderFields() {
  const name = (document.getElementById('order-name') || {}).value || '';
  const phone = (document.getElementById('order-phone') || {}).value || '';
  const city = (document.getElementById('order-city') || {}).value || '';
  const address = (document.getElementById('order-address') || {}).value || '';
  localStorage.setItem('olfera_order', JSON.stringify({ name, phone, city, address }));
}
function fillOrderFields() {
  const o = JSON.parse(localStorage.getItem('olfera_order') || '{}');
  ['name','phone','city','address'].forEach(k => {
    const el = document.getElementById('order-' + k);
    if (el && o[k]) el.value = o[k];
  });
}

function buildOrderMessage() {
  saveOrderFields();
  const name = (document.getElementById('order-name') || {}).value || '';
  const phone = (document.getElementById('order-phone') || {}).value || '';
  const city = (document.getElementById('order-city') || {}).value || '';
  const address = (document.getElementById('order-address') || {}).value || '';
  let message = 'Замовлення з olfera.store\n\n';
  if (name) message += 'Ім\'я: ' + name + '\n';
  if (phone) message += 'Телефон: ' + phone + '\n';
  if (city) message += 'Місто: ' + city + '\n';
  if (address) message += 'Адреса: ' + address + '\n';
  message += '\n';
  cart.forEach(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    message += '• ' + item.name + ' (' + (item.brand || '') + ') — ' + ml + ' мл × ' + item.price + ' ₴ = ' + line + ' ₴\n';
  });
  const total = cart.reduce((s, i) => s + i.price * (i.ml || 1) * i.qty, 0);
  message += '\nРазом: ' + total + ' ₴';
  return message;
}

function orderTelegram() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  const url = 'https://t.me/' + TELEGRAM_USERNAME + '?text=' + encodeURIComponent(message);
  const webUrl = 'https://web.telegram.org/k/#@' + TELEGRAM_USERNAME;
  window.open(url, '_blank');
  const hint = document.getElementById('order-hint');
  if (hint) hint.innerHTML = 'Якщо чат не відкрився, <a href="' + webUrl + '" target="_blank">натисни тут</a>.';
}
function orderInstagram() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  navigator.clipboard.writeText(message).catch(() => {});
  const url = 'https://ig.me/m/' + INSTAGRAM_USERNAME;
  window.open(url, '_blank');
  const hint = document.getElementById('order-hint');
  if (hint) hint.innerHTML = 'Текст скопійовано. Якщо Instagram не відкрився, <a href="' + url + '" target="_blank">натисни тут</a>.';
}
function orderWhatsApp() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank');
}

function mlPicker(selected, custom) {
  const preset = ML_OPTIONS.indexOf(selected) !== -1 && !custom;
  const buttons = ML_OPTIONS.map(ml => '<button type="button" class="ml-btn' + (preset && ml === selected ? ' active' : '') + '" data-ml="' + ml + '">' + ml + ' мл</button>').join('');
  const other = '<button type="button" class="ml-btn' + (!preset ? ' active' : '') + '" data-ml="other">Інше</button>';
  const input = !preset ? '<input class="ml-custom" type="text" inputmode="numeric" autocomplete="off" value="' + selected + '">' : '';
  return '<div class="ml-row">' + buttons + other + input + '</div>';
}
function bindMl(root, getState, setState) {
  root.querySelectorAll('.ml-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.dataset.ml === 'other') setState({ ml: getState().ml || 8, custom: true }, true);
      else setState({ ml: Number(btn.dataset.ml), custom: false }, true);
    });
  });
  const input = root.querySelector('.ml-custom');
  if (!input) return;
  ['click','touchstart','touchend','mousedown','keydown'].forEach(ev => input.addEventListener(ev, (e) => e.stopPropagation()));
  input.addEventListener('input', (e) => {
    e.stopPropagation();
    const raw = String(input.value || '').replace(/\D/g, '').slice(0, 3);
    if (!raw) return;
    const value = Math.max(1, Math.min(100, Number(raw)));
    setState({ ml: value, custom: true }, false);
    const total = root.querySelector('.line-total');
    if (total) total.textContent = 'За ' + value + ' мл: ' + (getState().price * value).toLocaleString('uk-UA') + ' ₴';
  });
}

function ensureModal() {
  if (document.getElementById('product-modal')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.id = 'product-modal';
  modal.innerHTML = '<div class="modal-head"><h3>Аромат</h3><button class="modal-close" id="modal-close">&times;</button></div><div class="modal-body" id="modal-body"></div>';
  document.body.append(overlay, modal);
  const close = () => { modal.classList.remove('active'); overlay.classList.remove('active'); };
  overlay.addEventListener('click', close);
  modal.querySelector('#modal-close').addEventListener('click', close);
}
function openProduct(product) {
  ensureModal();
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('modal-overlay');
  const price = Number(product.price);
  const state = { ml: 2, custom: false, price: price };
  const body = document.getElementById('modal-body');
  body.innerHTML = '<div class="modal-photo"><img src="' + product.image + '" alt="' + product.name + '"></div><div class="modal-copy"><p class="product-brand">' + (product.brand || '') + '</p><h3>' + product.name + '</h3><p>' + (product.notes || '') + '</p><p>' + (product.description || '') + '</p><p class="product-price">' + price + ' ₴ <span class="unit">/ 1 мл</span></p><div class="ml-slot"></div><p class="line-total"></p><button class="btn btn-gold" id="modal-add">В кошик</button></div>';
  const mlSlot = body.querySelector('.ml-slot');
  const totalEl = body.querySelector('.line-total');
  function updateMlUI() {
    mlSlot.innerHTML = mlPicker(state.ml, state.custom);
    totalEl.textContent = 'За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴';
    bindMl(body, () => state, (next, full) => {
      state.ml = next.ml;
      state.custom = next.custom;
      if (full) updateMlUI();
      else totalEl.textContent = 'За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴';
    });
  }
  updateMlUI();
  body.querySelector('#modal-add').addEventListener('click', () => {
    addToCart({ id: product.id, name: product.name, brand: product.brand, price: price, notes: product.notes, ml: state.ml });
    modal.classList.remove('active'); overlay.classList.remove('active');
  });
  modal.classList.add('active');
  overlay.classList.add('active');
}

const FAMILIES = [
  { id: 'fresh', label: 'Свіжі' },
  { id: 'sweet', label: 'Солодкі' },
  { id: 'oud', label: 'Уд' },
  { id: 'floral', label: 'Квіткові' },
  { id: 'woody', label: 'Деревні' },
  { id: 'unisex', label: 'Унісекс' }
];
function familiesOf(product) {
  const text = ((product.notes || '') + ' ' + (product.description || '') + ' ' + (product.name || '')).toLowerCase();
  const tags = [];
  if (/бергамот|цитрус|лимон|грейпфрут|помело|неролі|свіж|мандарин|петит|апельсин/.test(text)) tags.push('fresh');
  if (/ваніл|цукор|мед|солод|каштан|шампан|кокос|фінік|абрикос|вершк/.test(text)) tags.push('sweet');
  if (/уд|oud|смол|афган|ладан|бензоїн/.test(text)) tags.push('oud');
  if (/жасмин|троянд|квіт|фіалк|османтус|магнол|півон|гарден/.test(text)) tags.push('floral');
  if (/сандал|кедр|дерев|ірис|мускус|замш/.test(text)) tags.push('woody');
  if (/унісекс/.test(text)) tags.push('unisex');
  return tags;
}
let allProducts = [];
let activeFamily = '';
let catalogPage = 1;
const PAGE_SIZE = 10;

function paintCard(product) {
  const price = Number(product.price);
  const state = { ml: 2, custom: false, price: price };
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = '<div class="product-image"><img src="' + product.image + '" alt="' + product.name + '" loading="lazy"><span class="badge available">В наявності</span></div><div class="product-info"><p class="product-brand">' + (product.brand || '') + '</p><h3>' + product.name + '</h3><p class="product-notes">' + (product.notes || '') + '</p><p class="product-price">' + price + ' ₴ <span class="unit">/ 1 мл</span></p><div class="ml-slot"></div><p class="line-total"></p><span class="tap-hint">Натисніть, щоб прочитати опис</span><button class="btn btn-outline add-to-cart-btn">В кошик</button></div>';
  const mlSlot = card.querySelector('.ml-slot');
  const totalEl = card.querySelector('.line-total');
  function updateMlUI() {
    mlSlot.innerHTML = mlPicker(state.ml, state.custom);
    totalEl.textContent = 'За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴';
    bindMl(card, () => state, (next, full) => {
      state.ml = next.ml;
      state.custom = next.custom;
      if (full) updateMlUI();
      else totalEl.textContent = 'За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴';
    });
  }
  updateMlUI();
  card.querySelector('.product-image').addEventListener('click', () => openProduct(product));
  card.querySelector('h3').addEventListener('click', () => openProduct(product));
  card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, brand: product.brand, price: price, notes: product.notes, ml: state.ml });
  });
  return card;
}
function renderProducts(resetPage) {
  if (resetPage) catalogPage = 1;
  const container = document.getElementById('products-container');
  const pager = document.getElementById('catalog-pager');
  const query = (document.getElementById('search-input').value || '').trim().toLowerCase();
  const brand = document.getElementById('brand-filter').value;
  const price = document.getElementById('price-filter').value;
  const filtered = allProducts.filter(product => {
    const hay = (product.name + ' ' + (product.brand || '') + ' ' + (product.notes || '')).toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (brand && product.brand !== brand) return false;
    if (activeFamily && familiesOf(product).indexOf(activeFamily) === -1) return false;
    if (price) {
      const parts = price.split('-').map(Number);
      const value = Number(product.price);
      if (value < parts[0] || value > parts[1]) return false;
    }
    return true;
  });
  container.innerHTML = '';
  const count = document.getElementById('filter-count');
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (catalogPage > pages) catalogPage = pages;
  count.textContent = filtered.length ? ('Знайдено: ' + filtered.length) : '';
  if (!filtered.length) {
    container.innerHTML = '<p class="catalog-empty">Нічого не знайдено. Спробуйте іншу назву або скиньте фільтр.</p>';
    if (pager) pager.innerHTML = '';
    return;
  }
  filtered.slice((catalogPage - 1) * PAGE_SIZE, catalogPage * PAGE_SIZE).forEach(product => container.appendChild(paintCard(product)));
  if (!pager) return;
  if (pages < 2) { pager.innerHTML = ''; return; }
  let html = '<button type="button" class="page-btn" data-page="prev"' + (catalogPage === 1 ? ' disabled' : '') + '>Назад</button>';
  for (let i = 1; i <= pages; i++) html += '<button type="button" class="page-btn' + (i === catalogPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
  html += '<button type="button" class="page-btn" data-page="next"' + (catalogPage === pages ? ' disabled' : '') + '>Далі</button>';
  pager.innerHTML = html;
  pager.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      if (p === 'prev') catalogPage = Math.max(1, catalogPage - 1);
      else if (p === 'next') catalogPage = Math.min(pages, catalogPage + 1);
      else catalogPage = Number(p);
      renderProducts(false);
      window.scrollTo({ top: document.getElementById('catalog').offsetTop - 80, behavior: 'smooth' });
    });
  });
}
function setupFilters() {
  const familyRow = document.getElementById('family-filters');
  if (familyRow) {
    familyRow.innerHTML = FAMILIES.map(item => '<button type="button" class="filter-chip" data-family="' + item.id + '">' + item.label + '</button>').join('');
    familyRow.addEventListener('click', e => {
      const btn = e.target.closest('[data-family]');
      if (!btn) return;
      activeFamily = activeFamily === btn.dataset.family ? '' : btn.dataset.family;
      familyRow.querySelectorAll('.filter-chip').forEach(b => b.classList.toggle('active', b.dataset.family === activeFamily));
      renderProducts(true);
    });
  }
  const brandSelect = document.getElementById('brand-filter');
  if (brandSelect) {
    const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'uk'));
    brandSelect.innerHTML = '<option value="">Усі бренди</option>' + brands.map(b => '<option value="' + b + '">' + b + '</option>').join('');
  }
  document.getElementById('search-input').addEventListener('input', () => renderProducts(true));
  brandSelect.addEventListener('change', () => renderProducts(true));
  document.getElementById('price-filter').addEventListener('change', () => renderProducts(true));
}

async function loadProducts() {
  try {
    const localCatalog = localStorage.getItem('olfera_catalog_v1');
    if (localCatalog) {
      const parsed = JSON.parse(localCatalog);
      if (parsed && parsed.products && parsed.products.length) {
        allProducts = parsed.products;
      }
    }
  } catch (e) {}
  if (!allProducts.length) {
    try {
      const live = await (await fetch('https://crudcrud.com/api/22b8f8822db0418a98f48e6cd75a7ec8/catalogstate/6acaaa83cbfaea03e8fda0a5')).json();
      if (live && live.products && live.products.length) allProducts = live.products;
    } catch (e) {}
  }
  if (!allProducts.length) {
    allProducts = await (await fetch('products.json?v=16')).json();
  }
  fillReviewProducts();
  setupFilters();
  renderProducts(true);
}

updateCartUI();
loadProducts();
fillOrderFields();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

const REVIEWS_API = 'https://crudcrud.com/api/22b8f8822db0418a98f48e6cd75a7ec8/reviews';
const REVIEWS_LS_KEY = 'olfera_reviews_v1';
function loadLocalReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_LS_KEY) || '[]'); } catch (e) { return []; }
}
function saveLocalReviews(list) {
  localStorage.setItem(REVIEWS_LS_KEY, JSON.stringify(list.slice(0, 100)));
}
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewStars = document.getElementById('review-stars');
const reviewProducts = document.getElementById('review-products');
let publishedReviews = [];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[ch]));
}
function starsText(n) {
  const v = Math.max(1, Math.min(5, Number(n) || 5));
  return '★★★★★'.slice(0, v) + '☆☆☆☆☆'.slice(0, 5 - v);
}
function paintStars(value) {
  if (!reviewStars) return;
  reviewStars.dataset.value = String(value);
  reviewStars.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('on', Number(btn.dataset.star) <= value);
  });
}
if (reviewStars) {
  paintStars(5);
  reviewStars.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    paintStars(Number(btn.dataset.star));
  });
}
function renderReviews() {
  if (!reviewsList) return;
  if (!publishedReviews.length) {
    reviewsList.innerHTML = '<p class="review-empty">Поки що немає відгуків. Напишіть перший.</p>';
    return;
  }
  reviewsList.innerHTML = publishedReviews.map(r => '<article class="review-card"><div class="review-top"><strong class="review-name">' + r.name + '</strong><span class="review-stars">' + starsText(r.stars) + '</span></div>' + (r.product ? '<p class="review-product">' + r.product + '</p>' : '') + '<p class="review-text">' + r.text + '</p></article>').join('');
}
function fillReviewProducts() {
  if (!reviewProducts || !Array.isArray(allProducts)) return;
  reviewProducts.innerHTML = allProducts.map(p => '<option value="' + escapeHtml(p.name) + '">').join('');
}
function mapReview(r) {
  return {
    name: escapeHtml(r.name || 'Гість'),
    product: escapeHtml(r.product || ''),
    text: escapeHtml(r.text || ''),
    stars: r.stars || 5,
    _id: r._id || r.id || ''
  };
}
function loadReviews() {
  const local = loadLocalReviews();
  publishedReviews = local.slice().reverse().map(mapReview);
  renderReviews();
  fetch(REVIEWS_API + '?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(data => {
    if (!Array.isArray(data) || !data.length) return;
    publishedReviews = data.slice().reverse().map(mapReview);
    renderReviews();
  }).catch(() => {});
}
loadReviews();

if (reviewForm) {
  reviewForm.addEventListener('submit', async e => {
    e.preventDefault();
    const status = document.getElementById('review-status');
    const name = document.getElementById('review-name').value.trim();
    const product = document.getElementById('review-product').value.trim();
    const text = document.getElementById('review-text').value.trim();
    const stars = Number(reviewStars.dataset.value) || 5;
    if (!name || !text) {
      if (status) status.textContent = 'Напишіть ім\'я і текст відгуку.';
      return;
    }
    if (status) status.textContent = 'Зберігаю відгук...';
    const review = { id: 'r' + Date.now(), name: name.slice(0, 40), product: product.slice(0, 60), text: text.slice(0, 500), stars, date: new Date().toISOString() };
    const local = loadLocalReviews();
    local.push(review);
    saveLocalReviews(local);
    publishedReviews.unshift(mapReview(review));
    renderReviews();
    reviewForm.reset();
    paintStars(5);
    if (status) status.textContent = 'Дякуємо! Відгук уже на сайті.';
    try {
      await fetch(REVIEWS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch (err) {}
  });
}
