const TELEGRAM_USERNAME = 'Shneerzon';
const INSTAGRAM_USERNAME = 'olfer_aperfume';
const WHATSAPP_NUMBER = '380962566574';
const ML_OPTIONS = [1, 2, 3, 5, 10];
let cart = JSON.parse(localStorage.getItem('olfera_cart')) || [];

const style = document.createElement('style');
style.textContent = '.ml-row{display:flex;gap:6px;justify-content:center;margin:10px 0 4px;flex-wrap:wrap}.ml-btn{border:1px solid #c9a84c;background:#fff;color:#7a6124;border-radius:999px;padding:4px 10px;font-size:.75rem;cursor:pointer}.ml-btn.active{background:#9a7b2f;color:#fff}.ml-custom{width:88px;border:1px solid #c9a84c;border-radius:999px;padding:4px 8px;text-align:center;font-size:16px}.line-total{font-size:.85rem;color:#7a6124;margin-top:4px}';
document.head.appendChild(style);

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('active')));
}

const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartOrderBtn = document.getElementById('cart-order-btn');

function openCart() { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); }
function closeCart() { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); }
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

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
function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.setAttribute('data-count', totalQty);
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
    cartTotalPrice.textContent = '0 ₴';
    return;
  }
  let total = 0;
  cartItemsContainer.innerHTML = cart.map(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    total += line;
    return '<div class="cart-item"><div><h4>' + item.name + '</h4><p>' + (item.brand || '') + '</p><p class="cart-item-price">' + ml + ' мл × ' + item.price + ' ₴ = ' + line.toLocaleString('uk-UA') + ' ₴</p></div><button class="cart-item-remove" onclick="removeFromCart(' + item.id + ', ' + ml + ')">&times;</button></div>';
  }).join('');
  cartTotalPrice.textContent = total.toLocaleString('uk-UA') + ' ₴';
}
window.removeFromCart = removeFromCart;

const orderName = document.getElementById('order-name');
const orderPhone = document.getElementById('order-phone');
const orderDelivery = document.getElementById('order-delivery');
const orderNp = document.getElementById('order-np');
const savedOrder = JSON.parse(localStorage.getItem('olfera_order') || '{}');
if (orderName) orderName.value = savedOrder.name || '';
if (orderPhone) orderPhone.value = savedOrder.phone || '';
if (orderDelivery && savedOrder.delivery) orderDelivery.value = savedOrder.delivery;
if (orderNp) orderNp.value = savedOrder.np || '';
function syncNp() {
  if (!orderNp || !orderDelivery) return;
  const np = orderDelivery.value === 'Нова Пошта';
  orderNp.hidden = !np;
}
syncNp();
if (orderDelivery) orderDelivery.addEventListener('change', syncNp);
function saveOrder() {
  localStorage.setItem('olfera_order', JSON.stringify({
    name: orderName ? orderName.value.trim() : '',
    phone: orderPhone ? orderPhone.value.trim() : '',
    delivery: orderDelivery ? orderDelivery.value : '',
    np: orderNp ? orderNp.value.trim() : ''
  }));
}
[orderName, orderPhone, orderNp].forEach(el => el && el.addEventListener('input', saveOrder));
if (orderDelivery) orderDelivery.addEventListener('change', saveOrder);

cartOrderBtn.addEventListener('click', () => {
  if (!cart.length) return alert('Кошик порожній');
  const name = (orderName && orderName.value.trim()) || '';
  const phone = (orderPhone && orderPhone.value.trim()) || '';
  const delivery = (orderDelivery && orderDelivery.value) || 'Самовивіз, Європейська 6/5';
  const np = (orderNp && orderNp.value.trim()) || '';
  if (!name) return alert('Напишіть ім’я');
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return alert('Напишіть телефон');
  const pretty = digits.length === 9 ? '+380' + digits : (digits.startsWith('380') ? '+' + digits : (digits.startsWith('0') ? '+38' + digits : phone));
  if (delivery === 'Нова Пошта' && np.length < 3) return alert('Напишіть місто і відділення Нової Пошти');
  saveOrder();
  let message = 'Вітаю! Хочу замовити:\n\n';
  let total = 0;
  cart.forEach(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    total += line;
    message += '• ' + item.name + ' (' + (item.brand || '') + ') — ' + ml + ' мл × ' + item.price + ' ₴ = ' + line + ' ₴\n';
  });
  message += '\nРазом: ' + total.toLocaleString('uk-UA') + ' ₴';
  message += '\n\nІм’я: ' + name;
  message += '\nТелефон: ' + pretty;
  message += '\nОтримання: ' + delivery;
  if (delivery === 'Нова Пошта') message += '\nНова Пошта: ' + np;
  const encoded = encodeURIComponent(message);
  const webUrl = 'https://t.me/' + TELEGRAM_USERNAME + '?text=' + encoded;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(message).catch(() => {});
  const link = document.createElement('a');
  link.href = webUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  const hint = document.getElementById('order-hint');
  if (hint) hint.innerHTML = 'Якщо чат не відкрився, <a href="' + webUrl + '" target="_blank">натисни тут</a>.';
});


const cartIgBtn = document.getElementById('cart-ig-btn');
if (cartIgBtn) cartIgBtn.addEventListener('click', () => {
  if (!cart.length) return alert('Кошик порожній');
  const name = (orderName && orderName.value.trim()) || '';
  const phone = (orderPhone && orderPhone.value.trim()) || '';
  const delivery = (orderDelivery && orderDelivery.value) || 'Самовивіз, Європейська 6/5';
  const np = (orderNp && orderNp.value.trim()) || '';
  if (!name) return alert('Напишіть ім’я');
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return alert('Напишіть телефон');
  const pretty = digits.length === 9 ? '+380' + digits : (digits.startsWith('380') ? '+' + digits : (digits.startsWith('0') ? '+38' + digits : phone));
  if (delivery === 'Нова Пошта' && np.length < 3) return alert('Напишіть місто і відділення Нової Пошти');
  saveOrder();
  let message = 'Вітаю! Хочу замовити:\n\n';
  let total = 0;
  cart.forEach(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    total += line;
    message += '• ' + item.name + ' (' + (item.brand || '') + ') — ' + ml + ' мл × ' + item.price + ' ₴ = ' + line + ' ₴\n';
  });
  message += '\nРазом: ' + total.toLocaleString('uk-UA') + ' ₴';
  message += '\n\nІм’я: ' + name;
  message += '\nТелефон: ' + pretty;
  message += '\nОтримання: ' + delivery;
  if (delivery === 'Нова Пошта') message += '\nНова Пошта: ' + np;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(message).catch(() => {});
  const url = 'https://ig.me/m/' + INSTAGRAM_USERNAME + '?text=' + encodeURIComponent(message);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  const hint = document.getElementById('order-hint');
  if (hint) hint.innerHTML = 'Текст скопійовано. Якщо Instagram не відкрився, <a href="' + url + '" target="_blank">натисни тут</a>.';
});


const cartWaBtn = document.getElementById('cart-wa-btn');
if (cartWaBtn) cartWaBtn.addEventListener('click', () => {
  if (!cart.length) return alert('Кошик порожній');
  const name = (orderName && orderName.value.trim()) || '';
  const phone = (orderPhone && orderPhone.value.trim()) || '';
  const delivery = (orderDelivery && orderDelivery.value) || 'Самовивіз, Європейська 6/5';
  const np = (orderNp && orderNp.value.trim()) || '';
  if (!name) return alert('Напишіть ім’я');
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return alert('Напишіть телефон');
  const pretty = digits.length === 9 ? '+380' + digits : (digits.startsWith('380') ? '+' + digits : (digits.startsWith('0') ? '+38' + digits : phone));
  if (delivery === 'Нова Пошта' && np.length < 3) return alert('Напишіть місто і відділення Нової Пошти');
  saveOrder();
  let message = 'Вітаю! Хочу замовити:\n\n';
  let total = 0;
  cart.forEach(item => {
    const ml = item.ml || 1;
    const line = item.price * ml * item.qty;
    total += line;
    message += '• ' + item.name + ' (' + (item.brand || '') + ') — ' + ml + ' мл × ' + item.price + ' ₴ = ' + line + ' ₴\n';
  });
  message += '\nРазом: ' + total.toLocaleString('uk-UA') + ' ₴';
  message += '\n\nІм’я: ' + name;
  message += '\nТелефон: ' + pretty;
  message += '\nОтримання: ' + delivery;
  if (delivery === 'Нова Пошта') message += '\nНова Пошта: ' + np;
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
});

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
  const render = () => {
    body.innerHTML = '<div class="modal-photo"><img src="' + product.image + '" alt="' + product.name + '"></div><div class="modal-copy"><p class="product-brand">' + (product.brand || '') + '</p><h3>' + product.name + '</h3><p>' + (product.notes || '') + '</p><p>' + (product.description || '') + '</p><p class="product-price">' + price + ' ₴ <span class="unit">/ 1 мл</span></p>' + mlPicker(state.ml, state.custom) + '<p class="line-total">За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴</p><button class="btn btn-gold" id="modal-add">В кошик</button></div>';
    bindMl(body, () => state, (next, rerender) => { state.ml = next.ml; state.custom = next.custom; if (rerender) render(); });
    body.querySelector('#modal-add').addEventListener('click', () => {
      addToCart({ id: product.id, name: product.name, brand: product.brand, price: price, notes: product.notes, ml: state.ml });
      modal.classList.remove('active'); overlay.classList.remove('active');
    });
  };
  render();
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
  const paint = () => {
    card.innerHTML = '<div class="product-image"><img src="' + product.image + '" alt="' + product.name + '"><span class="badge available">В наявності</span></div><div class="product-info"><p class="product-brand">' + (product.brand || '') + '</p><h3>' + product.name + '</h3><p class="product-notes">' + product.notes + '</p><p class="product-notes">' + (product.description || '') + '</p><p class="product-price">' + price + ' ₴ <span class="unit">/ 1 мл</span></p>' + mlPicker(state.ml, state.custom) + '<p class="line-total">За ' + state.ml + ' мл: ' + (price * state.ml).toLocaleString('uk-UA') + ' ₴</p><span class="tap-hint">Натисніть, щоб прочитати опис</span><button class="btn btn-outline add-to-cart-btn">В кошик</button></div>';
    bindMl(card, () => state, (next, rerender) => { state.ml = next.ml; state.custom = next.custom; if (rerender) paint(); });
    card.querySelector('.product-image').addEventListener('click', () => openProduct(product));
    card.querySelector('h3').addEventListener('click', () => openProduct(product));
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart({ id: product.id, name: product.name, brand: product.brand, price: price, notes: product.notes, ml: state.ml });
    });
  };
  paint();
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
      if (btn.disabled) return;
      if (btn.dataset.page === 'prev') catalogPage -= 1;
      else if (btn.dataset.page === 'next') catalogPage += 1;
      else catalogPage = Number(btn.dataset.page);
      renderProducts(false);
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
function setupFilters() {
  const familyRow = document.getElementById('family-filters');
  familyRow.innerHTML = FAMILIES.map(item => '<button type="button" class="filter-chip" data-family="' + item.id + '">' + item.label + '</button>').join('');
  familyRow.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFamily = activeFamily === btn.dataset.family ? '' : btn.dataset.family;
      familyRow.querySelectorAll('.filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.family === activeFamily));
      renderProducts(true);
    });
  });
  const brandSelect = document.getElementById('brand-filter');
  const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'uk'));
  brands.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    brandSelect.appendChild(option);
  });
  document.getElementById('search-input').addEventListener('input', renderProducts);
  brandSelect.addEventListener('change', renderProducts);
  document.getElementById('price-filter').addEventListener('change', renderProducts);
  document.getElementById('filter-reset').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    brandSelect.value = '';
    document.getElementById('price-filter').value = '';
    activeFamily = '';
    familyRow.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    renderProducts(true);
  });
}
async function loadProducts() {
  allProducts = await (await fetch('products.json?v=15')).json();
  fillReviewProducts();
  setupFilters();
  renderProducts(true);
}

updateCartUI();
loadProducts();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}


const REVIEWS_API = 'https://crudcrud.com/api/22b8f8822db0418a98f48e6cd75a7ec8/reviews';
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
function loadReviews() {
  fetch(REVIEWS_API).then(r => r.ok ? r.json() : []).then(data => {
    publishedReviews = (data || []).slice().reverse().map(r => ({
      name: escapeHtml(r.name || 'Гість'),
      product: escapeHtml(r.product || ''),
      text: escapeHtml(r.text || ''),
      stars: r.stars || 5
    }));
    renderReviews();
  }).catch(() => renderReviews());
}
loadReviews();

if (reviewForm) {
  reviewForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const product = document.getElementById('review-product').value.trim();
    const text = document.getElementById('review-text').value.trim();
    const stars = Number(reviewStars.dataset.value) || 5;
    if (name.length < 2 || text.length < 3) return;
    const status = document.getElementById('review-status');
    if (status) status.textContent = 'Зберігаю відгук...';
    const review = { name: name.slice(0, 40), product: product.slice(0, 60), text: text.slice(0, 500), stars, date: new Date().toISOString() };
    try {
      const res = await fetch(REVIEWS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!res.ok) throw new Error('save');
      reviewForm.reset();
      paintStars(5);
      if (status) status.textContent = 'Дякуємо! Відгук збережено і вже видно на сайті.';
      loadReviews();
      const message = 'Новий відгук OLFÉRA\n\nІм’я: ' + review.name + '\nОцінка: ' + stars + '/5' + (review.product ? '\nАромат: ' + review.product : '') + '\n\n' + review.text;
      const url = 'https://t.me/' + TELEGRAM_USERNAME + '?text=' + encodeURIComponent(message);
      const link = document.createElement('a');
      link.href = url; link.target = '_blank'; link.rel = 'noopener';
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) {
      if (status) status.textContent = 'Не вдалося зберегти. Спробуйте ще раз.';
    }
  });
}
