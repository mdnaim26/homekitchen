/* ============================================================
   dashboard.js — Admin Dashboard Logic
============================================================ */

"use strict";

// ── Guard: must be admin ───────────────────────────────────────
(function guardAdmin() {
  const sess = getSession();
  if (!sess || sess.role !== 'admin') {
    window.location.href = 'login.html';
  }
  // Set admin name
  const nameEl = document.getElementById('dashAdminName');
  if (nameEl && sess) nameEl.textContent = sess.name;
})();

/* ──────────────────────────────────────────
   THEME
────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('hk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('dashThemeIcon');
  if (icon) icon.className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
})();

document.getElementById('dashTheme').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('hk_theme', next);
  document.getElementById('dashThemeIcon').className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

/* ──────────────────────────────────────────
   LOGOUT
────────────────────────────────────────── */
document.getElementById('dashLogout').addEventListener('click', logout);

/* ──────────────────────────────────────────
   SIDEBAR TOGGLE (mobile)
────────────────────────────────────────── */
const dashSidebar = document.getElementById('dashSidebar');
document.getElementById('dashMenuToggle').addEventListener('click', () => dashSidebar.classList.toggle('open'));
document.getElementById('sidebarClose').addEventListener('click', () => dashSidebar.classList.remove('open'));

/* ──────────────────────────────────────────
   PANEL NAVIGATION
────────────────────────────────────────── */
function switchPanel(panelName) {
  document.querySelectorAll('.dash-nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.remove('active'));
  const navItem = document.querySelector(`.dash-nav-item[data-panel="${panelName}"]`);
  const panel = document.getElementById(`panel-${panelName}`);
  if (navItem) navItem.classList.add('active');
  if (panel) panel.classList.add('active');
  document.getElementById('dashPageTitle').textContent = navItem ? navItem.textContent.trim() : panelName;
  loadPanel(panelName);
  dashSidebar.classList.remove('open');
}

document.querySelectorAll('.dash-nav-item[data-panel]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    switchPanel(item.dataset.panel);
  });
});

function loadPanel(name) {
  switch (name) {
    case 'overview': loadOverview(); break;
    case 'orders': loadOrders(); break;
    case 'menu': loadMenuPanel(); break;
    case 'messages': loadMessages(); break;
    case 'customers': loadCustomers(); break;
  }
}

/* ──────────────────────────────────────────
   STATUS BADGE HTML
────────────────────────────────────────── */
function statusBadge(status) {
  const map = {
    'Received': 'badge-blue',
    'Cooking': 'badge-orange',
    'Out for Delivery': 'badge-purple',
    'Delivered': 'badge-green'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

/* ──────────────────────────────────────────
   OVERVIEW PANEL
────────────────────────────────────────── */
function loadOverview() {
  const orders = getOrders();
  const users = getUsers().filter(u => u.role !== 'admin');
  const msgs = getMessages();

  document.getElementById('statTotalOrders').textContent = orders.length;
  document.getElementById('statRevenue').textContent = fmt(orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0));
  document.getElementById('statCustomers').textContent = users.length;

  // Popular item
  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const popular = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('statPopular').textContent = popular ? popular[0] : '–';

  // Recent orders table
  const tbody = document.getElementById('recentOrdersTbody');
  const recent = orders.slice(0, 6);
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
      <td><strong>${fmt(o.total)}</strong></td>
      <td>${o.payment}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');

  // Popular items list
  const popularEl = document.getElementById('popularItems');
  const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = sorted[0] ? sorted[0][1] : 1;
  popularEl.innerHTML = sorted.map(([name, count]) => `
    <div class="popular-item">
      <span class="pop-name">${name}</span>
      <div class="pop-bar-wrap"><div class="pop-bar" style="width:${(count/maxCount)*100}%"></div></div>
      <span class="pop-count">${count}</span>
    </div>
  `).join('');

  // Update badges
  const pending = orders.filter(o => o.status !== 'Delivered').length;
  document.getElementById('pendingBadge').textContent = pending;
  document.getElementById('msgBadge').textContent = msgs.filter(m => !m.read).length;
}

/* ──────────────────────────────────────────
   ORDERS PANEL
────────────────────────────────────────── */
function loadOrders() {
  renderOrdersTable();

  document.getElementById('orderSearch').addEventListener('input', renderOrdersTable);
  document.getElementById('orderStatusFilter').addEventListener('change', renderOrdersTable);
}

function renderOrdersTable() {
  const orders = getOrders();
  const searchVal = document.getElementById('orderSearch').value.toLowerCase();
  const statusVal = document.getElementById('orderStatusFilter').value;

  let filtered = orders;
  if (statusVal !== 'all') filtered = filtered.filter(o => o.status === statusVal);
  if (searchVal) filtered = filtered.filter(o =>
    o.id.toLowerCase().includes(searchVal) || o.customer.toLowerCase().includes(searchVal)
  );

  const tbody = document.getElementById('ordersTbody');
  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-light)">No orders found</td></tr>`
    : filtered.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td style="max-width:180px;font-size:.82rem">${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
      <td><strong>${fmt(o.total)}</strong></td>
      <td>${o.payment}</td>
      <td style="font-size:.82rem">${formatDate(o.date)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm update-status-btn" data-id="${o.id}" data-status="${o.status}">
          <i class="fa-solid fa-pen"></i> Update
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.update-status-btn').forEach(btn => {
    btn.addEventListener('click', () => openStatusModal(btn.dataset.id, btn.dataset.status));
  });
}

/* ──────────────────────────────────────────
   ORDER STATUS MODAL
────────────────────────────────────────── */
let currentEditOrderId = null;

function openStatusModal(orderId, currentStatus) {
  currentEditOrderId = orderId;
  document.getElementById('orderStatusSubtitle').textContent = `Order: ${orderId}`;
  const radios = document.querySelectorAll('input[name="orderStatus"]');
  radios.forEach(r => r.checked = r.value === currentStatus);
  document.getElementById('orderStatusOverlay').classList.add('open');
}

document.getElementById('orderStatusClose').addEventListener('click', () => {
  document.getElementById('orderStatusOverlay').classList.remove('open');
});
document.getElementById('orderStatusOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('orderStatusOverlay'))
    document.getElementById('orderStatusOverlay').classList.remove('open');
});

document.getElementById('saveStatusBtn').addEventListener('click', () => {
  const selected = document.querySelector('input[name="orderStatus"]:checked');
  if (!selected) { showToast('Select a status', 'orange'); return; }
  updateOrderStatus(currentEditOrderId, selected.value);
  document.getElementById('orderStatusOverlay').classList.remove('open');
  showToast(`<i class="fa-solid fa-check-circle"></i> Order status updated to: ${selected.value}`, 'green');
  renderOrdersTable();
  loadOverview();
});

/* ──────────────────────────────────────────
   MENU PANEL
────────────────────────────────────────── */
function loadMenuPanel() {
  renderMenuAdmin();
  document.getElementById('menuSearch').addEventListener('input', () => {
    renderMenuAdmin(document.getElementById('menuSearch').value.toLowerCase());
  });
}

function renderMenuAdmin(search = '') {
  let items = getMenu();
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search) || i.category.includes(search));

  const grid = document.getElementById('menuAdminGrid');
  grid.innerHTML = items.map(item => `
    <div class="menu-admin-card">
      <div class="mac-emoji">${item.emoji || '🍽️'}</div>
      <div class="mac-info">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <div class="mac-meta">
          <span class="food-card-tag">${item.tag || ''}</span>
          <strong class="food-price">${fmt(item.price)}</strong>
          <span class="badge ${item.available !== false ? 'badge-green' : 'badge-gray'}">
            ${item.available !== false ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      <div class="mac-actions">
        <button class="btn btn-ghost btn-sm edit-menu-btn" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn btn-danger btn-sm delete-menu-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.edit-menu-btn').forEach(btn => openMenuItemModal(parseInt(btn.dataset.id)));
  grid.querySelectorAll('.delete-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this menu item?')) {
        deleteMenuItemData(parseInt(btn.dataset.id));
        renderMenuAdmin();
        showToast('<i class="fa-solid fa-trash"></i> Item deleted', 'orange');
      }
    });
  });
}

function openMenuItemModal(editId = null) {
  return function() {
    const overlay = document.getElementById('menuItemOverlay');
    const form = document.getElementById('menuItemForm');
    document.getElementById('menuItemModalTitle').textContent = editId ? 'Edit Food Item' : 'Add New Food Item';

    if (editId) {
      const item = getMenu().find(i => i.id === editId);
      if (item) {
        document.getElementById('editItemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDesc').value = item.desc;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemEmoji').value = item.emoji || '';
        document.getElementById('itemTag').value = item.tag || '';
        document.getElementById('itemAvailable').checked = item.available !== false;
      }
    } else {
      form.reset();
      document.getElementById('editItemId').value = '';
      document.getElementById('itemAvailable').checked = true;
    }
    overlay.classList.add('open');
  };
}

// Wire up edit buttons (delegated)
document.getElementById('menuAdminGrid').addEventListener('click', e => {
  const editBtn = e.target.closest('.edit-menu-btn');
  if (editBtn) openMenuItemModal(parseInt(editBtn.dataset.id))();
});

document.getElementById('addMenuItemBtn').addEventListener('click', openMenuItemModal(null));

document.getElementById('menuItemClose').addEventListener('click', () => {
  document.getElementById('menuItemOverlay').classList.remove('open');
});
document.getElementById('menuItemOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('menuItemOverlay'))
    document.getElementById('menuItemOverlay').classList.remove('open');
});

document.getElementById('menuItemForm').addEventListener('submit', e => {
  e.preventDefault();
  const editId = document.getElementById('editItemId').value;
  const itemData = {
    name: document.getElementById('itemName').value.trim(),
    desc: document.getElementById('itemDesc').value.trim(),
    price: parseInt(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value,
    emoji: document.getElementById('itemEmoji').value.trim() || '🍽️',
    tag: document.getElementById('itemTag').value.trim(),
    available: document.getElementById('itemAvailable').checked
  };

  if (editId) {
    updateMenuItemData(parseInt(editId), itemData);
    showToast('<i class="fa-solid fa-floppy-disk"></i> Item updated!', 'green');
  } else {
    addMenuItemData(itemData);
    showToast('<i class="fa-solid fa-circle-check"></i> New item added!', 'green');
  }
  document.getElementById('menuItemOverlay').classList.remove('open');
  renderMenuAdmin();
});

/* ──────────────────────────────────────────
   MESSAGES PANEL
────────────────────────────────────────── */
function loadMessages() {
  const msgs = getMessages();
  const container = document.getElementById('messagesList');

  if (msgs.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)"><i class="fa-solid fa-envelope-open" style="font-size:3rem;opacity:.3"></i><p>No messages yet</p></div>';
    return;
  }

  container.innerHTML = msgs.map(msg => `
    <div class="message-item ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
      <div class="msg-avatar">${msg.name.charAt(0).toUpperCase()}</div>
      <div class="msg-body">
        <div class="msg-header">
          <strong>${msg.name}</strong>
          <span class="msg-phone">${msg.phone}</span>
          <span class="msg-date">${formatDate(msg.date)}</span>
          ${!msg.read ? '<span class="badge badge-orange">New</span>' : ''}
        </div>
        <p>${msg.message}</p>
      </div>
      <a href="https://wa.me/${msg.phone.replace(/\D/g,'')}" class="btn btn-ghost btn-sm" target="_blank">
        <i class="fa-brands fa-whatsapp"></i> Reply
      </a>
    </div>
  `).join('');

  container.querySelectorAll('.message-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      markMessageRead(id);
      item.classList.remove('unread');
      item.querySelector('.badge-orange')?.remove();
      const count = getMessages().filter(m => !m.read).length;
      document.getElementById('msgBadge').textContent = count;
    });
  });
}

/* ──────────────────────────────────────────
   CUSTOMERS PANEL
────────────────────────────────────────── */
function loadCustomers() {
  const users = getUsers();
  const orders = getOrders();

  const tbody = document.getElementById('customersTbody');
  tbody.innerHTML = users.map(u => {
    const userOrders = orders.filter(o => o.customerEmail === u.email).length;
    return `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '–'}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-orange' : 'badge-blue'}">${u.role}</span></td>
        <td>${userOrders} orders</td>
      </tr>
    `;
  }).join('');
}

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
loadOverview();
