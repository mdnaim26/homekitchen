/* ============================================================
   data.js — Shared Data Store
   All data is stored in localStorage for persistence across pages.
   This simulates a backend database for demo purposes.
============================================================ */

"use strict";

// ── Seed default menu items if none exist ──────────────────────
function seedMenuItems() {
  const existing = localStorage.getItem('hk_menu');
  if (existing) return;
  const defaultMenu = [
    { id: 1, name: "Chicken Biryani",   desc: "Aromatic basmati rice with tender slow-cooked chicken, saffron & whole spices.",          price: 220, emoji: "🍛", category: "rice",    tag: "Bestseller",  available: true },
    { id: 2, name: "Homemade Khichuri", desc: "Comfort-food khichuri with lentils, ghee & crispy fried onion — rainy day perfect.",       price: 130, emoji: "🥘", category: "rice",    tag: "Comfort",     available: true },
    { id: 3, name: "Beef Curry",        desc: "Rich, slow-cooked beef in a bold homemade masala with caramelised onion base.",             price: 280, emoji: "🍖", category: "curry",   tag: "Hearty",      available: true },
    { id: 4, name: "Vegetable Curry",   desc: "Seasonal vegetables simmered in a fragrant coconut-turmeric gravy. 100% veg.",             price: 120, emoji: "🥬", category: "curry",   tag: "Healthy",     available: true },
    { id: 5, name: "Homemade Roti",     desc: "Soft whole-wheat rotis rolled by hand & cooked on the tawa with a touch of ghee.",         price: 30,  emoji: "🫓", category: "bread",   tag: "Fresh Daily", available: true },
    { id: 6, name: "Chicken Roast",     desc: "Golden, tender chicken pieces marinated overnight & oven-roasted to perfection.",          price: 260, emoji: "🍗", category: "curry",   tag: "Favourite",   available: true },
    { id: 7, name: "Fried Rice",        desc: "Wok-tossed egg fried rice with fresh vegetables, soy sauce & sesame aroma.",               price: 160, emoji: "🍚", category: "rice",    tag: "Quick Bite",  available: true },
    { id: 8, name: "Special Dessert",   desc: "Chef's special — creamy mishti doi with homemade roshogolla & pistachio sprinkle.",        price: 90,  emoji: "🍮", category: "dessert", tag: "Sweet",       available: true }
  ];
  localStorage.setItem('hk_menu', JSON.stringify(defaultMenu));
}

// ── Seed default users ──────────────────────────────────────────
function seedUsers() {
  const existing = localStorage.getItem('hk_users');
  if (existing) return;
  const defaultUsers = [
    { id: 1, name: "Admin", email: "admin@homekitchen.com", phone: "+8801700000000", password: "admin123", role: "admin" },
    { id: 2, name: "Test User", email: "user@test.com", phone: "+8801711111111", password: "user123", role: "user" }
  ];
  localStorage.setItem('hk_users', JSON.stringify(defaultUsers));
}

// ── Seed sample orders ──────────────────────────────────────────
function seedOrders() {
  const existing = localStorage.getItem('hk_orders');
  if (existing) return;
  const sampleOrders = [
    { id: "HK-2026-1001", customer: "Rafiqul Alam", customerEmail: "rafiq@test.com", items: [{name:"Chicken Biryani",qty:2,price:220},{name:"Homemade Roti",qty:4,price:30}], total: 560, payment: "bKash", status: "Delivered", date: "2026-03-10T10:30:00" },
    { id: "HK-2026-1002", customer: "Sumaiya Noor", customerEmail: "sumaiya@test.com", items: [{name:"Beef Curry",qty:1,price:280},{name:"Homemade Roti",qty:2,price:30}], total: 340, payment: "Cash on Delivery", status: "Delivered", date: "2026-03-12T13:00:00" },
    { id: "HK-2026-1003", customer: "Mehedi Hasan", customerEmail: "mehedi@test.com", items: [{name:"Homemade Khichuri",qty:2,price:130}], total: 260, payment: "Nagad", status: "Out for Delivery", date: new Date().toISOString() },
    { id: "HK-2026-1004", customer: "Farida Islam", customerEmail: "farida@test.com", items: [{name:"Fried Rice",qty:1,price:160},{name:"Special Dessert",qty:2,price:90}], total: 340, payment: "Visa Card", status: "Cooking", date: new Date().toISOString() }
  ];
  localStorage.setItem('hk_orders', JSON.stringify(sampleOrders));
}

// ── Seed sample messages ────────────────────────────────────────
function seedMessages() {
  const existing = localStorage.getItem('hk_messages');
  if (existing) return;
  const msgs = [
    { id: 1, name: "Karim Ahmed", phone: "+8801722222222", message: "Do you deliver to Mohammadpur? I'd like to order regularly.", date: "2026-03-11T09:00:00", read: false },
    { id: 2, name: "Nusrat Jahan", phone: "+8801733333333", message: "The biryani was amazing! Can I get a weekly subscription?", date: "2026-03-13T14:30:00", read: false }
  ];
  localStorage.setItem('hk_messages', JSON.stringify(msgs));
}

// Initialize all data
seedMenuItems();
seedUsers();
seedOrders();
seedMessages();

// ── CRUD Helpers ────────────────────────────────────────────────

function getMenu() { return JSON.parse(localStorage.getItem('hk_menu') || '[]'); }
function saveMenu(m) { localStorage.setItem('hk_menu', JSON.stringify(m)); }

function getUsers() { return JSON.parse(localStorage.getItem('hk_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('hk_users', JSON.stringify(u)); }

function getOrders() { return JSON.parse(localStorage.getItem('hk_orders') || '[]'); }
function saveOrders(o) { localStorage.setItem('hk_orders', JSON.stringify(o)); }

function getMessages() { return JSON.parse(localStorage.getItem('hk_messages') || '[]'); }
function saveMessages(m) { localStorage.setItem('hk_messages', JSON.stringify(m)); }

function getNextMenuId() {
  const menu = getMenu();
  return menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1;
}

function addMenuItemData(item) {
  const menu = getMenu();
  item.id = getNextMenuId();
  menu.push(item);
  saveMenu(menu);
  return item;
}

function updateMenuItemData(id, updates) {
  const menu = getMenu();
  const idx = menu.findIndex(i => i.id === id);
  if (idx === -1) return false;
  menu[idx] = { ...menu[idx], ...updates };
  saveMenu(menu);
  return true;
}

function deleteMenuItemData(id) {
  const menu = getMenu().filter(i => i.id !== id);
  saveMenu(menu);
}

function addOrderData(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return false;
  orders[idx].status = newStatus;
  saveOrders(orders);
  return true;
}

function addMessageData(msg) {
  const msgs = getMessages();
  msg.id = msgs.length > 0 ? Math.max(...msgs.map(m => m.id)) + 1 : 1;
  msg.date = new Date().toISOString();
  msg.read = false;
  msgs.unshift(msg);
  saveMessages(msgs);
}

function markMessageRead(id) {
  const msgs = getMessages();
  const idx = msgs.findIndex(m => m.id === id);
  if (idx !== -1) { msgs[idx].read = true; saveMessages(msgs); }
}

// ── Toast utility (shared) ──────────────────────────────────────
function showToast(msg, type = "", duration = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = "toast" + (type ? " " + type : "");
  el.innerHTML = msg;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), duration);
}

function fmt(price) { return "৳" + price; }
function generateOrderId() { return "HK-2026-" + (Math.floor(Math.random() * 9000) + 1000); }
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
