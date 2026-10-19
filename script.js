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
