/* ============================================================
   script.js — Customer Website Logic
   Covers: navbar, theme, search, menu, cart, checkout,
           order tracking, reviews slider, contact form
============================================================ */

"use strict";

/* ──────────────────────────────────────────
   DOM REFS
────────────────────────────────────────── */
const navbar        = document.getElementById('navbar');
const hamburger     = document.getElementById('hamburger');
const navLinksEl    = document.getElementById('navLinks');
const themeToggle   = document.getElementById('themeToggle');
const themeIcon     = document.getElementById('themeIcon');
const searchToggle  = document.getElementById('searchToggle');
const searchBarWrap = document.getElementById('searchBarWrap');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');
const menuGrid      = document.getElementById('menuGrid');
const noResults     = document.getElementById('noResults');
const filterBtns    = document.querySelectorAll('.filter-btn');
const cartBtn       = document.getElementById('cartBtn');
const cartBadge     = document.getElementById('cartBadge');
const cartOverlay   = document.getElementById('cartOverlay');
const cartSidebar   = document.getElementById('cartSidebar');
const cartClose     = document.getElementById('cartClose');
const cartItemsEl   = document.getElementById('cartItems');
const cartEmpty     = document.getElementById('cartEmpty');
const cartFooter    = document.getElementById('cartFooter');
const cartTotalEl   = document.getElementById('cartTotal');
const clearCartBtn  = document.getElementById('clearCartBtn');
const checkoutBtn   = document.getElementById('checkoutBtn');
const paymentOverlay = document.getElementById('paymentOverlay');
const paymentClose  = document.getElementById('paymentClose');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const modalTotalEl  = document.getElementById('modalTotal');
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmCloseBtn = document.getElementById('confirmClose');
const trackInput    = document.getElementById('trackInput');
const trackBtn      = document.getElementById('trackBtn');
const trackResult   = document.getElementById('trackResult');
const trackMsg      = document.getElementById('trackMsg');
const reviewsTrack  = document.getElementById('reviewsTrack');
const sliderDots    = document.getElementById('sliderDots');
const prevReview    = document.getElementById('prevReview');
const nextReview    = document.getElementById('nextReview');
const contactForm   = document.getElementById('contactForm');
const orderNotif    = document.getElementById('orderNotif');
const notifClose    = document.getElementById('notifClose');

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('hk_cart') || '[]');
let currentFilter = 'all';
let currentSearch = '';

/* ──────────────────────────────────────────
   THEME
────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('hk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  if (themeIcon) themeIcon.className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hk_theme', next);
    themeIcon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
}

/* ──────────────────────────────────────────
   STICKY NAVBAR + ACTIVE LINKS
────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

/* ──────────────────────────────────────────
   HAMBURGER
────────────────────────────────────────── */
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

/* ──────────────────────────────────────────
   SEARCH BAR
────────────────────────────────────────── */
searchToggle.addEventListener('click', () => {
  searchBarWrap.classList.toggle('open');
  if (searchBarWrap.classList.contains('open')) searchInput.focus();
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  currentSearch = '';
  renderMenu();
  searchBarWrap.classList.remove('open');
});
searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value.toLowerCase();
  renderMenu();
  // Scroll to menu if searching
  if (currentSearch.length > 0) {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ──────────────────────────────────────────
   RENDER MENU GRID
────────────────────────────────────────── */
function renderMenu() {
  let items = getMenu().filter(i => i.available !== false);

  // Apply category filter
  if (currentFilter !== 'all') items = items.filter(i => i.category === currentFilter);

  // Apply search filter
  if (currentSearch) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(currentSearch) ||
      i.desc.toLowerCase().includes(currentSearch) ||
      i.category.toLowerCase().includes(currentSearch)
    );
  }

  if (items.length === 0) {
    menuGrid.innerHTML = '';
    noResults.style.display = 'flex';
    return;
  }
  noResults.style.display = 'none';

  menuGrid.innerHTML = items.map(item => `
    <div class="food-card" data-id="${item.id}">
      <div class="food-card-img">${item.emoji || '🍽️'}</div>
      <div class="food-card-body">
        <span class="food-card-tag">${item.tag || ''}</span>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="food-card-footer">
          <div class="food-price">${fmt(item.price)} <span>/ serving</span></div>
          <button class="add-cart-btn" data-id="${item.id}" aria-label="Add ${item.name} to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Add to cart listeners
  menuGrid.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      addToCart(id);
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      btn.classList.add('added');
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.classList.remove('added');
      }, 900);
    });
  });

  // Observe cards for fade-in
  menuGrid.querySelectorAll('.food-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity .4s ease, transform .4s ease';
    fadeObserver.observe(card);
  });
}

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderMenu();
  });
});

/* ──────────────────────────────────────────
   INTERSECTION OBSERVER – fade in
────────────────────────────────────────── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

// Observe step cards and review cards after DOM
setTimeout(() => {
  document.querySelectorAll('.step-card, .review-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity .5s ease, transform .5s ease';
    fadeObserver.observe(card);
  });
}, 200);

/* ──────────────────────────────────────────
   CART LOGIC
────────────────────────────────────────── */
function saveCart() { localStorage.setItem('hk_cart', JSON.stringify(cart)); }

function addToCart(id) {
  const menu = getMenu();
  const item = menu.find(i => i.id === id);
  if (!item) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: item.id, name: item.name, price: item.price, emoji: item.emoji || '🍽️', qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`<i class="fa-solid fa-circle-check"></i> ${item.name} added!`, 'green');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartUI(); renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(); updateCartUI(); renderCartItems();
}

function clearCart() {
  cart = []; saveCart(); updateCartUI(); renderCartItems();
}

function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  cartBadge.textContent = getCartCount();
  renderCartItems();
}

function renderCartItems() {
  const total = getCartTotal();
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartFooter.style.display = 'none';
    Array.from(cartItemsEl.children).forEach(c => { if (!c.id) c.remove(); });
    return;
  }
  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'flex';
  cartTotalEl.textContent = fmt(total);

  const fragment = document.createDocumentFragment();
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${fmt(item.price)} each</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn minus" data-id="${item.id}">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn plus" data-id="${item.id}">+</button>
        <button class="remove-btn" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="cart-item-price">${fmt(item.price * item.qty)}</div>
    `;
    fragment.appendChild(div);
  });

  Array.from(cartItemsEl.children).forEach(c => { if (c.id !== 'cartEmpty') c.remove(); });
  cartItemsEl.appendChild(fragment);

  cartItemsEl.querySelectorAll('.qty-btn.plus').forEach(b => b.addEventListener('click', () => changeQty(+b.dataset.id, 1)));
  cartItemsEl.querySelectorAll('.qty-btn.minus').forEach(b => b.addEventListener('click', () => changeQty(+b.dataset.id, -1)));
  cartItemsEl.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', () => removeFromCart(+b.dataset.id)));
}

/* ──────────────────────────────────────────
   CART SIDEBAR
────────────────────────────────────────── */
function openCart() { cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; }

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
document.getElementById('startOrdering').addEventListener('click', closeCart);
clearCartBtn.addEventListener('click', () => { clearCart(); showToast('<i class="fa-solid fa-trash"></i> Cart cleared', 'orange'); });

/* ──────────────────────────────────────────
   CHECKOUT → PAYMENT
────────────────────────────────────────── */
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!', 'orange'); return; }
  modalTotalEl.textContent = fmt(getCartTotal());
  closeCart();
  paymentOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});

paymentClose.addEventListener('click', () => { paymentOverlay.classList.remove('open'); document.body.style.overflow = ''; });
paymentOverlay.addEventListener('click', e => { if (e.target === paymentOverlay) { paymentOverlay.classList.remove('open'); document.body.style.overflow = ''; } });

placeOrderBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="payment"]:checked');
  if (!selected) { showToast('<i class="fa-solid fa-triangle-exclamation"></i> Please select a payment method', 'orange'); return; }

  const paymentLabels = { bkash: 'bKash', nagad: 'Nagad', visa: 'Visa Card', mastercard: 'Mastercard', cod: 'Cash on Delivery' };
  const orderId = generateOrderId();

  // Save order to data store
  const sess = getSession();
  const order = {
    id: orderId,
    customer: sess ? sess.name : 'Guest',
    customerEmail: sess ? sess.email : 'guest@test.com',
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: getCartTotal(),
    payment: paymentLabels[selected.value],
    status: 'Received',
    date: new Date().toISOString()
  };
  addOrderData(order);

  paymentOverlay.classList.remove('open');
  document.getElementById('confirmOrderId').textContent = orderId;
  document.getElementById('confirmPayment').textContent = paymentLabels[selected.value];
  confirmOverlay.classList.add('open');
  clearCart();
});

confirmCloseBtn.addEventListener('click', () => {
  confirmOverlay.classList.remove('open');
  document.body.style.overflow = '';
  showToast('<i class="fa-solid fa-motorcycle"></i> Your food is on its way! 🎉', 'green', 3500);
});
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) { confirmOverlay.classList.remove('open'); document.body.style.overflow = ''; } });

/* ──────────────────────────────────────────
   ORDER TRACKING
────────────────────────────────────────── */
function trackOrder(orderId) {
  const cleaned = orderId.trim().toUpperCase();
  if (!cleaned.startsWith('HK-')) { showToast('<i class="fa-solid fa-triangle-exclamation"></i> Invalid Order ID', 'orange'); return; }

  const orders = getOrders();
  const order = orders.find(o => o.id === cleaned);

  let step;
  const statusMap = { 'Received': 1, 'Cooking': 2, 'Out for Delivery': 3, 'Delivered': 4 };

  if (order) {
    step = statusMap[order.status] || 1;
  } else {
    // Simulate based on last char
    const n = parseInt(cleaned.slice(-1));
    step = isNaN(n) ? 1 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4;
  }

  trackResult.style.display = 'block';
  const steps = ['ts1','ts2','ts3','ts4'].map(id => document.getElementById(id));
  const lines = ['tl1','tl2','tl3'].map(id => document.getElementById(id));
  const messages = [
    '✅ We received your order and will start cooking shortly!',
    '🔥 Your meal is being freshly prepared in our kitchen!',
    '🛵 Your food is on the way — rider has been assigned!',
    '🎉 Delivered! Enjoy your homemade meal. Thank you!'
  ];

  steps.forEach(s => s.classList.remove('active'));
  lines.forEach(l => l.classList.remove('active'));
  for (let i = 0; i < step; i++) {
    steps[i].classList.add('active');
    if (i < 3 && i < step - 1) lines[i].classList.add('active');
  }
  trackMsg.textContent = messages[step - 1];
}

trackBtn.addEventListener('click', () => trackOrder(trackInput.value));
trackInput.addEventListener('keydown', e => { if (e.key === 'Enter') trackOrder(trackInput.value); });

/* ──────────────────────────────────────────
   REVIEWS SLIDER
────────────────────────────────────────── */
(function initSlider() {
  const cards = document.querySelectorAll('.review-card');
  const total = cards.length;
  let current = 0;

  function getPerView() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }
  function maxSlide() { return Math.max(0, total - getPerView()); }

  function buildDots() {
    sliderDots.innerHTML = '';
    const count = maxSlide() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      sliderDots.appendChild(dot);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxSlide()));
    const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0;
    reviewsTrack.style.transform = `translateX(-${current * cardWidth}px)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevReview.addEventListener('click', () => goTo(current - 1));
  nextReview.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => { buildDots(); goTo(Math.min(current, maxSlide())); });

  buildDots();

  // Auto-slide every 5s
  setInterval(() => goTo(current >= maxSlide() ? 0 : current + 1), 5000);
})();

/* ──────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────── */
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const message = document.getElementById('cMsg').value.trim();
  addMessageData({ name, phone, message });
  showToast(`<i class="fa-solid fa-paper-plane"></i> Thanks ${name}! We'll get back to you soon.`, 'green', 3500);
  contactForm.reset();
});

/* ──────────────────────────────────────────
   ORDER NOTIFICATION POPUP
────────────────────────────────────────── */
if (orderNotif) {
  setTimeout(() => {
    orderNotif.classList.add('show');
    setTimeout(() => orderNotif.classList.remove('show'), 6000);
  }, 4000);
  notifClose.addEventListener('click', () => orderNotif.classList.remove('show'));
}

/* ──────────────────────────────────────────
   SMOOTH SCROLL
────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
renderMenu();
updateCartUI();
