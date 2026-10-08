// ===== Telegram username (можна змінити пізніше) =====
const TELEGRAM_USERNAME = 'rtich_you';

// ===== Cart =====
let cart = JSON.parse(localStorage.getItem('olfera_cart')) || [];

// Mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });
}

// Header background on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.85)';
    }
});

// ===== Cart UI elements =====
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartOrderBtn = document.getElementById('cart-order-btn');

// Open / Close cart
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== Cart functions =====
function saveCart() {
    localStorage.setItem('olfera_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function updateCartUI() {
    // Count
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;
    cartCount.setAttribute('data-count', totalQty);

    // Items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
        cartTotalPrice.textContent = '0 ₴';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.notes || ''}</p>
                    <p class="cart-item-price">${item.price} ₴ ${item.qty > 1 ? `× ${item.qty}` : ''}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `;
    }).join('');

    cartTotalPrice.textContent = total.toLocaleString('uk-UA') + ' ₴';
}

// Order via Telegram
cartOrderBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Кошик порожній');
        return;
    }

    let message = 'Здравствуйте! Хочу заказать:\n\n';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `• ${item.name} — ${item.price} ₴`;
        if (item.qty > 1) message += ` × ${item.qty}`;
        message += '\n';
    });

    message += `\nРазом: ${total.toLocaleString('uk-UA')} ₴`;

    const encoded = encodeURIComponent(message);
    const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`;
    window.open(url, '_blank');
});

// ===== Load products =====
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const container = document.getElementById('products-container');

        if (!container) return;

        container.innerHTML = '';

        products.forEach(product => {
            const availableBadge = product.available 
                ? '<span class="badge available">В наявності</span>' 
                : '<span class="badge not-available">Немає в наявності</span>';

            const card = document.createElement('article');
            card.className = 'product-card' + (product.available ? '' : ' sold-out');

            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${availableBadge}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-notes">${product.notes}</p>
                    <p class="product-price">${Number(product.price).toLocaleString('uk-UA')} ₴</p>
                    <button class="btn btn-outline add-to-cart-btn" 
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-notes="${product.notes}"
                        ${product.available ? '' : 'disabled'}>
                        ${product.available ? 'В кошик' : 'Немає'}
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = {
                    id: Number(btn.dataset.id),
                    name: btn.dataset.name,
                    price: Number(btn.dataset.price),
                    notes: btn.dataset.notes
                };
                addToCart(product);
            });
        });

    } catch (error) {
        console.error('Помилка завантаження товарів:', error);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
});
