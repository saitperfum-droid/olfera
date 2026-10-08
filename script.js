const TELEGRAM_USERNAME = 'rtich_you';
let cart = JSON.parse(localStorage.getItem('olfera_cart')) || [];
let catalog = [];

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
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart();
  openCart();
}
function removeFromCart(id) { cart = cart.filter(item => item.id !== id); saveCart(); }
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
    total += item.price * item.qty;
    return `<div class="cart-item"><div><h4>${item.name}</h4><p>${item.brand || ''}</p><p class="cart-item-price">${item.price} ₴ / 1 мл ${item.qty > 1 ? '× ' + item.qty : ''}</p></div><button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button></div>`;
  }).join('');
  cartTotalPrice.textContent = total.toLocaleString('uk-UA') + ' ₴';
}

cartOrderBtn.addEventListener('click', () => {
  if (!cart.length) return alert('Кошик порожній');
  let message = 'Здравствуйте! Хочу заказать:\n\n';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    message += `• ${item.name} (${item.brand || ''}) — ${item.price} ₴ / 1 мл${item.qty > 1 ? ' × ' + item.qty : ''}\n`;
  });
  message += `\nРазом: ${total.toLocaleString('uk-UA')} ₴`;
  const encoded = encodeURIComponent(message);
  window.location.href = `tg://resolve?domain=${TELEGRAM_USERNAME}&text=${encoded}`;
  setTimeout(() => window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`, '_blank'), 800);
});

function ensureModal() {
  if (document.getElementById('product-modal')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.id = 'product-modal';
  modal.innerHTML = `<div class="modal-head"><h3>Аромат</h3><button class="modal-close" id="modal-close">&times;</button></div><div class="modal-body" id="modal-body"></div>`;
  document.body.append(overlay, modal);
  const close = () => { modal.classList.remove('active'); overlay.classList.remove('active'); };
  overlay.addEventListener('click', close);
  modal.querySelector('#modal-close').addEventListener('click', close);
}
function openProduct(product) {
  ensureModal();
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-photo"><img src="${product.image}" alt="${product.name}"></div>
    <div class="modal-copy">
      <p class="product-brand">${product.brand || ''}</p>
      <h3>${product.name}</h3>
      <p>${product.notes || ''}</p>
      <p>${product.description || ''}</p>
      <p class="product-price">${product.price} ₴ <span class="unit">/ 1 мл</span></p>
      <button class="btn btn-gold" id="modal-add" ${product.available ? '' : 'disabled'}>${product.available ? 'В кошик' : 'Немає'}</button>
    </div>`;
  modal.classList.add('active');
  overlay.classList.add('active');
  document.getElementById('modal-add').addEventListener('click', () => {
    addToCart({ id: product.id, name: product.name, brand: product.brand, price: Number(product.price), notes: product.notes });
    modal.classList.remove('active');
    overlay.classList.remove('active');
  });
}

async function loadProducts() {
  const products = await (await fetch('products.json')).json();
  catalog = products;
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card' + (product.available ? '' : ' sold-out');
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <span class="badge ${product.available ? 'available' : 'not-available'}">${product.available ? 'В наявності' : 'Немає'}</span>
      </div>
      <div class="product-info">
        <p class="product-brand">${product.brand || ''}</p>
        <h3>${product.name}</h3>
        <p class="product-notes">${product.notes}</p>
        <p class="product-price">${product.price} ₴ <span class="unit">/ 1 мл</span></p>
        <span class="tap-hint">Натисніть, щоб прочитати опис</span>
        <button class="btn btn-outline add-to-cart-btn" ${product.available ? '' : 'disabled'}>${product.available ? 'В кошик' : 'Немає'}</button>
      </div>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) return;
      openProduct(product);
    });
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!product.available) return;
      addToCart({ id: product.id, name: product.name, brand: product.brand, price: Number(product.price), notes: product.notes });
    });
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => { loadProducts(); updateCartUI(); });
