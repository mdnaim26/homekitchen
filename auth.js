/* ============================================================
   auth.js — Authentication Module
   Uses localStorage for session simulation (demo only).
============================================================ */

"use strict";

/** Get current session */
function getSession() {
  const s = sessionStorage.getItem('hk_session') || localStorage.getItem('hk_session');
  return s ? JSON.parse(s) : null;
}

/** Login with email & password */
function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { success: false, message: 'Invalid email or password. Try admin@homekitchen.com / admin123' };

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  sessionStorage.setItem('hk_session', JSON.stringify(session));
  localStorage.setItem('hk_session', JSON.stringify(session));
  return { success: true, user: session };
}

/** Register new user */
function register({ name, email, phone, password }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 3,
    name, email, phone, password, role: 'user'
  };
  users.push(newUser);
  saveUsers(users);

  const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  sessionStorage.setItem('hk_session', JSON.stringify(session));
  localStorage.setItem('hk_session', JSON.stringify(session));
  return { success: true, user: session };
}

/** Logout */
function logout() {
  sessionStorage.removeItem('hk_session');
  localStorage.removeItem('hk_session');
  window.location.href = 'index.html';
}

/** Update navbar based on auth state */
function updateNavAuth() {
  const sess = getSession();
  const authBtns = document.getElementById('authBtns');
  const userMenu = document.getElementById('userMenu');
  if (!authBtns || !userMenu) return;

  if (sess) {
    authBtns.style.display = 'none';
    userMenu.style.display = 'flex';
    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('dropdownName');
    const emailEl = document.getElementById('dropdownEmail');
    if (avatarEl) avatarEl.textContent = sess.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = sess.name;
    if (emailEl) emailEl.textContent = sess.email;

    // Show dashboard link for admin
    const dashLink = document.getElementById('dashboardLink');
    if (dashLink && sess.role === 'admin') dashLink.style.display = 'flex';
  } else {
    authBtns.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();

  // User dropdown toggle
  const avatarBtn = document.getElementById('userAvatarBtn');
  const dropdown = document.getElementById('userDropdown');
  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
