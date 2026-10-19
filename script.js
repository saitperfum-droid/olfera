const TELEGRAM_USERNAME = 'Shneerzon';
const INSTAGRAM_USERNAME = 'olfer_aperfume';
const WHATSAPP_NUMBER = '380962566574';
const ML_OPTIONS = [1, 2, 3, 5, 10];
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('olfera_cart') || '[]') || [];
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(i => i && i.name).map(i => Object.assign({}, i, {
    price: Number(i.price) || 0,
    ml: Number(i.ml) || 1,
    qty: Number(i.qty) || 1
  }));
} catch (e) { cart = []; }

const style = document.createElement('style');
style.textContent = '.ml-row{display:flex;gap:6px;justify-content:center;margin:10px 0 4px;flex-wrap:wrap}.ml-btn{border:1px solid #c9a84c;background:#fff;color:#7a6124;border-radius:999px;padding:4px 10px;font-size:.75rem;cursor:pointer}.ml-btn.active{background:#9a7b2f;color:#fff}.ml-custom{width:88px;border:1px solid #c9a84c;border-radius:999px;padding:4px 8px;text-align:center;font-size:16px}.line-total{font-size:.85rem;color:#7a6124;margin-top:4px}';
document.head.appendChild(style);

const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
function openCart() {
  if (cartSidebar) cartSidebar.classList.add('active');
  if (cartOverlay) cartOverlay.classList.add('active');
}
function closeCart() {
  if (cartSidebar) cartSidebar.classList.remove('active');
  if (cartOverlay) cartOverlay.classList.remove('active');
}
if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

/* Mobile menu */
(function(){
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function(){ nav.classList.toggle('open'); });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); });
  });
})();

function cartLineTotal(item) {
  const price = Number(item.price) || 0;
  const ml = Number(item.ml) || 1;
  const qty = Number(item.qty) || 1;
  return price * ml * qty;
}
function updateCartUI() {
  const count = document.querySelector('.cart-count');
  const total = cart.reduce((s, i) => s + cartLineTotal(i), 0);
  const countNum = cart.reduce((s, i) => s + (Number(i.qty) || 1), 0);
  if (count) { count.textContent = countNum; count.dataset.count = String(countNum); }
  const totalEl = document.getElementById('cart-total-price');
  if (totalEl) totalEl.textContent = total.toLocaleString('uk-UA') + ' ₴';
  const cartItemsContainer = document.getElementById('cart-items');
  if (!cartItemsContainer) return;
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
    return;
  }
  cartItemsContainer.innerHTML = cart.map((item, idx) => {
    const ml = Number(item.ml) || 1;
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const line = price * ml * qty;
    const qtyLabel = qty > 1 ? ' × ' + qty : '';
    const name = String(item.name || 'Аромат').replace(/</g, '<');
    const brand = String(item.brand || '').replace(/</g, '<');
    return '<div class="cart-item" data-idx="' + idx + '">' +
      '<div class="cart-item-info">' +
        '<h4>' + name + '</h4>' +
        (brand ? '<p class="cart-item-brand">' + brand + '</p>' : '') +
        '<p class="cart-item-price">' + ml + ' мл × ' + price + ' ₴' + qtyLabel + ' = ' + line.toLocaleString('uk-UA') + ' ₴</p>' +
      '</div>' +
      '<button type="button" class="cart-item-remove" data-idx="' + idx + '" aria-label="Видалити">&times;</button>' +
    '</div>';
  }).join('');
  cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', function () {
      const idx = Number(this.getAttribute('data-idx'));
      if (!isNaN(idx) && idx >= 0 && idx < cart.length) {
        cart.splice(idx, 1);
        saveCart();
      }
    });
  });
}
function saveCart() { localStorage.setItem('olfera_cart', JSON.stringify(cart)); updateCartUI(); }
function addToCart(product) {
  const ml = Number(product.ml) || 1;
  const existing = cart.find(item => item.id === product.id && item.ml === ml);
  if (existing) existing.qty += 1;
  else cart.push(Object.assign({}, product, { ml: ml, qty: 1 }));
  saveCart();
  openCart();
}
function removeFromCart(id, ml) {
  cart = cart.filter(item => !(item.id === id && item.ml === ml));
  saveCart();
}

function saveOrderFields() {
  const name = (document.getElementById('order-name') || {}).value || '';
  const phone = (document.getElementById('order-phone') || {}).value || '';
  const delivery = (document.getElementById('order-delivery') || {}).value || '';
  const np = (document.getElementById('order-np') || {}).value || '';
  localStorage.setItem('olfera_order', JSON.stringify({ name, phone, delivery, np }));
}
function fillOrderFields() {
  try {
    const o = JSON.parse(localStorage.getItem('olfera_order') || '{}');
    if (o.name && document.getElementById('order-name')) document.getElementById('order-name').value = o.name;
    if (o.phone && document.getElementById('order-phone')) document.getElementById('order-phone').value = o.phone;
    if (o.delivery && document.getElementById('order-delivery')) document.getElementById('order-delivery').value = o.delivery;
    if (o.np && document.getElementById('order-np')) document.getElementById('order-np').value = o.np;
  } catch (e) {}
}

function buildOrderMessage() {
  saveOrderFields();
  const name = (document.getElementById('order-name') || {}).value || '';
  const phone = (document.getElementById('order-phone') || {}).value || '';
  const delivery = (document.getElementById('order-delivery') || {}).value || '';
  const np = (document.getElementById('order-np') || {}).value || '';
  let message = 'Замовлення з olfera.store\n\n';
  if (name) message += "Ім'я: " + name + '\n';
  if (phone) message += 'Телефон: ' + phone + '\n';
  if (delivery) message += 'Доставка: ' + delivery + '\n';
  if (np) message += 'НП: ' + np + '\n';
  message += '\n';
  cart.forEach(item => {
    const ml = Number(item.ml) || 1;
    const price = Number(item.price) || 0;
    const line = cartLineTotal(item);
    message += '• ' + item.name + ' (' + (item.brand || '') + ') — ' + ml + ' мл × ' + price + ' ₴ = ' + line + ' ₴\n';
  });
  const total = cart.reduce((s, i) => s + cartLineTotal(i), 0);
  message += '\nРазом: ' + total + ' ₴';
  return message;
}

function orderTelegram() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  const url = 'https://t.me/' + TELEGRAM_USERNAME + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank');
}
function orderInstagram() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  navigator.clipboard.writeText(message).catch(function(){});
  window.open('https://ig.me/m/' + INSTAGRAM_USERNAME, '_blank');
}
function orderWhatsApp() {
  if (!cart.length) { alert('Кошик порожній'); return; }
  const message = buildOrderMessage();
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank');
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
  const query = (document.getElementById('search-input') || {}).value || '';
  const q = query.trim().toLowerCase();
  const brand = (document.getElementById('brand-filter') || {}).value || '';
  const price = (document.getElementById('price-filter') || {}).value || '';
  const filtered = allProducts.filter(product => {
    const hay = (product.name + ' ' + (product.brand || '') + ' ' + (product.notes || '')).toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (brand && product.brand !== brand) return false;
    if (activeFamily && familiesOf(product).indexOf(activeFamily) === -1) return false;
    if (price) {
      const parts = price.split('-').map(Number);
      const value = Number(product.price);
      if (value < parts[0] || value > parts[1]) return false;
    }
    return true;
  });
  if (!container) return;
  container.innerHTML = '';
  const count = document.getElementById('filter-count');
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (catalogPage > pages) catalogPage = pages;
  if (count) count.textContent = filtered.length ? ('Знайдено: ' + filtered.length) : '';
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
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', () => renderProducts(true));
  if (brandSelect) brandSelect.addEventListener('change', () => renderProducts(true));
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) priceFilter.addEventListener('change', () => renderProducts(true));
}

async function loadProducts() {
  try {
    const localCatalog = localStorage.getItem('olfera_catalog_v1');
    if (localCatalog) {
      const parsed = JSON.parse(localCatalog);
      if (parsed && parsed.products && parsed.products.length) allProducts = parsed.products;
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

const orderTg = document.getElementById('cart-order-btn');
const orderIg = document.getElementById('cart-ig-btn');
const orderWa = document.getElementById('cart-wa-btn');
if (orderTg) orderTg.addEventListener('click', orderTelegram);
if (orderIg) orderIg.addEventListener('click', orderInstagram);
if (orderWa) orderWa.addEventListener('click', orderWhatsApp);

updateCartUI();
loadProducts();
fillOrderFields();

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
  reviewStars.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => paintStars(Number(btn.dataset.star)));
  });
  paintStars(5);
}
function fillReviewProducts() {
  if (!reviewProducts) return;
  reviewProducts.innerHTML = allProducts.map(p => '<option value="' + escapeHtml(p.name) + '">').join('');
}
async function loadReviews() {
  publishedReviews = loadLocalReviews();
  try {
    const remote = await (await fetch(REVIEWS_API + '?ts=' + Date.now())).json();
    if (Array.isArray(remote) && remote.length) {
      publishedReviews = remote.map(r => ({
        id: r._id || r.id,
        name: r.name,
        product: r.product,
        text: r.text,
        stars: r.stars,
        date: r.date
      }));
      saveLocalReviews(publishedReviews);
    }
  } catch (e) {}
  renderReviews();
}
function renderReviews() {
  if (!reviewsList) return;
  if (!publishedReviews.length) {
    reviewsList.innerHTML = '<p class="review-empty">Поки що немає відгуків. Напишіть перший.</p>';
    return;
  }
  reviewsList.innerHTML = publishedReviews.map(r => '<article class="review-card"><div class="review-top"><strong class="review-name">' + escapeHtml(r.name) + '</strong><span class="review-stars">' + starsText(r.stars) + '</span></div>' + (r.product ? '<p class="review-product">' + escapeHtml(r.product) + '</p>' : '') + '<p class="review-text">' + escapeHtml(r.text) + '</p></article>').join('');
}
if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('review-name') || {}).value.trim();
    const product = (document.getElementById('review-product') || {}).value.trim();
    const text = (document.getElementById('review-text') || {}).value.trim();
    const stars = Number((reviewStars || {}).dataset.value || 5);
    const status = document.getElementById('review-status');
    if (!name || !text) return;
    const review = { id: 'r' + Date.now(), name, product, text, stars, date: new Date().toISOString() };
    publishedReviews.unshift(review);
    saveLocalReviews(publishedReviews);
    renderReviews();
    if (status) status.textContent = 'Дякуємо! Відгук додано.';
    reviewForm.reset();
    paintStars(5);
    try {
      await fetch(REVIEWS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch (err) {}
  });
}
loadReviews();
