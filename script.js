// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });
}

// Smooth header background on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.85)';
    }
});

// ===== Завантаження товарів з products.json =====
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
                    <p class="product-price">${product.price} ₴</p>
                    <button class="btn btn-outline" ${product.available ? '' : 'disabled'}>
                        ${product.available ? 'Замовити' : 'Немає'}
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Помилка завантаження товарів:', error);
    }
}

// Запускаємо завантаження коли сторінка готова
document.addEventListener('DOMContentLoaded', loadProducts);
