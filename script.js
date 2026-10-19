const TELEGRAM_USERNAME = 'Shneerzon';
const INSTAGRAM_USERNAME = 'olfer_aperfume';
const WHATSAPP_NUMBER = '380962566574';
const ML_OPTIONS = [1, 2, 3, 5, 10];
let cart = JSON.parse(localStorage.getItem('olfera_cart')) || [];

const style = document.createElement('style');
style.textContent = '.ml-row{display:flex;gap:6px;justify-content:center;margin:10px 0 4px;flex-wrap:wrap}.ml-btn{border:1px solid #c9a84c;background:#fff;color:#7a6124;border-radius:999px;padding:4px 10px;font-size:.75rem;cursor:pointer}.ml-btn.active{background:#9a7b2f;color:#fff}.ml-custom{width:88px;border:1px solid #c9a84c;border-radius:999px;padding:4px 8px;text-align:center;font-size:16px}.line-total{font-size:.85rem;color:#7a6124;margin-top:4px}';
document.head.appendChild(style);
