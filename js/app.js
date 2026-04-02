/**
 * app.js
 * Entry point — DOMContentLoaded handler.
 * Features: signup/login validation, Google login simulation,
 * password strength meter, history drawer, clear history.
 */

import { state, setState }           from './state.js';
import { getUnits, postHistory, getHistory } from './api.js';
import { performConversion, performComparison, performArithmetic } from './conversion.js';
import {
  populateBothDropdowns,
  showResult, hideResult,
  setToValue, setToInputEditable,
  toggleOperators,
  showError, clearError,
  renderHistory,
  setUserDisplay,
} from './ui.js';

/* ============================================================
   BOOT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initApp();
});

/* ============================================================
   AUTH
   ============================================================ */

const users = [];

function initAuth() {
  document.getElementById('loginTab')?.addEventListener('click',  () => switchTab('login'));
  document.getElementById('signupTab')?.addEventListener('click', () => switchTab('signup'));

  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  });

  // Password strength on signup
  document.getElementById('su-pw')?.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // Mobile: only allow digits
  document.getElementById('su-mobile')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });

  document.getElementById('signupBtn')?.addEventListener('click', handleSignup);
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('googleSignupBtn')?.addEventListener('click', handleGoogleAuth);
  document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleAuth);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginTab')?.classList.toggle('active', isLogin);
  document.getElementById('signupTab')?.classList.toggle('active', !isLogin);
  document.getElementById('loginForm')?.classList.toggle('form-hidden', !isLogin);
  document.getElementById('signupForm')?.classList.toggle('form-hidden', isLogin);
  clearError('su-err');
  clearError('li-err');
}

/* ---- Validation Helpers ---- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

function isValidPassword(pw) {
  return pw.length >= 8;
}

/* ---- Password Strength Meter ---- */

function updatePasswordStrength(pw) {
  const fill  = document.getElementById('su-pw-fill');
  const label = document.getElementById('su-pw-label');
  if (!fill || !label) return;

  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { pct: '0%',   color: 'transparent', text: '' },
    { pct: '25%',  color: '#EF476F',     text: 'Weak' },
    { pct: '50%',  color: '#FFB703',     text: 'Fair' },
    { pct: '75%',  color: '#06D6A0',     text: 'Good' },
    { pct: '100%', color: '#06D6A0',     text: 'Strong' },
  ];

  const lvl = levels[Math.min(score, 4)];
  fill.style.width     = pw.length === 0 ? '0%' : lvl.pct;
  fill.style.background = lvl.color;
  label.textContent    = lvl.text;
  label.style.color    = lvl.color;
}

/* ---- Signup ---- */

function handleSignup() {
  clearError('su-err');
  clearInputErrors(['su-name','su-email','su-pw','su-mobile']);

  const name   = document.getElementById('su-name')?.value.trim();
  const email  = document.getElementById('su-email')?.value.trim();
  const pw     = document.getElementById('su-pw')?.value;
  const mobile = document.getElementById('su-mobile')?.value.trim();

  if (!name) {
    markInputError('su-name');
    showError('su-err', 'Full name is required.'); return;
  }
  if (!email || !isValidEmail(email)) {
    markInputError('su-email');
    showError('su-err', 'Enter a valid email address (e.g. you@example.com).'); return;
  }
  if (!pw || !isValidPassword(pw)) {
    markInputError('su-pw');
    showError('su-err', 'Password must be at least 8 characters.'); return;
  }
  if (!mobile || !isValidMobile(mobile)) {
    markInputError('su-mobile');
    showError('su-err', 'Mobile number must be exactly 10 digits.'); return;
  }
  if (users.find((u) => u.email === email)) {
    markInputError('su-email');
    showError('su-err', 'This email is already registered. Please login.'); return;
  }

  users.push({ name, email, pw, mobile });
  launchApp({ name, email });
}

/* ---- Login ---- */

function handleLogin() {
  clearError('li-err');
  clearInputErrors(['li-email','li-pw']);

  const email = document.getElementById('li-email')?.value.trim();
  const pw    = document.getElementById('li-pw')?.value;

  if (!email || !isValidEmail(email)) {
    markInputError('li-email');
    showError('li-err', 'Enter a valid email address.'); return;
  }
  if (!pw) {
    markInputError('li-pw');
    showError('li-err', 'Password is required.'); return;
  }

  const user = users.find((u) => u.email === email && u.pw === pw);
  if (!user) {
    markInputError('li-email');
    markInputError('li-pw');
    showError('li-err', 'Incorrect email or password.'); return;
  }

  launchApp(user);
}

/* ---- Google Auth (simulated) ---- */

function handleGoogleAuth() {
  // Simulates a Google OAuth flow — replace with real Google Sign-In SDK in production
  const mockGoogleUser = {
    name: 'Google User',
    email: `google.user.${Date.now()}@gmail.com`,
  };

  const existing = users.find(u => u.email === mockGoogleUser.email);
  if (!existing) users.push({ ...mockGoogleUser, pw: null, mobile: null });

  launchApp(mockGoogleUser);
}

/* ---- Logout ---- */

function handleLogout() {
  setState({ currentUser: null, history: [] });
  document.getElementById('authPage').style.display = '';
  document.getElementById('appPage').classList.remove('visible');
  closeHistoryDrawer();
}

/* ---- Launch App ---- */

function launchApp(user) {
  setState({ currentUser: user });
  setUserDisplay(user);
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('appPage').classList.add('visible');
  loadUnits();
  loadHistory();
}

/* ---- Input Error Helpers ---- */

function markInputError(id) {
  document.getElementById(id)?.classList.add('input-error');
}

function clearInputErrors(ids) {
  ids.forEach(id => document.getElementById(id)?.classList.remove('input-error'));
}

/* ============================================================
   HISTORY DRAWER
   ============================================================ */

function initHistoryDrawer() {
  document.getElementById('historyToggleBtn')?.addEventListener('click', openHistoryDrawer);
  document.getElementById('historyCloseBtn')?.addEventListener('click', closeHistoryDrawer);
  document.getElementById('drawerOverlay')?.addEventListener('click', closeHistoryDrawer);
  document.getElementById('clearHistoryBtn')?.addEventListener('click', handleClearHistory);
}

function openHistoryDrawer() {
  document.getElementById('historyDrawer')?.classList.add('open');
  document.getElementById('drawerOverlay')?.classList.add('open');
}

function closeHistoryDrawer() {
  document.getElementById('historyDrawer')?.classList.remove('open');
  document.getElementById('drawerOverlay')?.classList.remove('open');
}

function updateHistoryBadge(count) {
  const badge = document.getElementById('historyBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

async function handleClearHistory() {
  if (!state.history.length) return;
  if (!confirm('Clear all calculation history?')) return;

  // Try to delete from API
  try {
    await Promise.all(state.history.map(h => {
      if (h.id) {
        return fetch(`http://localhost:3000/history/${h.id}`, { method: 'DELETE' }).catch(() => {});
      }
    }));
  } catch (_) { /* offline — just clear locally */ }

  setState({ history: [] });
  renderHistory([]);
  updateHistoryBadge(0);
}

/* ============================================================
   APP — TYPE SELECTOR & ACTIONS
   ============================================================ */

function initApp() {
  initHistoryDrawer();

  document.getElementById('typeGrid')?.addEventListener('click', (e) => {
    const card = e.target.closest('.type-card');
    if (!card) return;
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    setState({ selectedType: card.dataset.type });
    hideResult(); clearError('calcErr');
    loadUnits();
  });

  document.getElementById('typeGrid')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.closest('.type-card')?.click(); }
  });

  document.getElementById('actionTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.action-tab');
    if (!tab) return;
    document.querySelectorAll('.action-tab').forEach(t => {
      t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    setState({ selectedAction: tab.dataset.action });
    onActionChange(tab.dataset.action);
  });

  document.getElementById('operatorRow')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.op-btn');
    if (!btn) return;
    document.querySelectorAll('.op-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    setState({ selectedOperator: btn.dataset.op });
    hideResult();
  });

  ['fromValue','toValue','fromUnit','toUnit'].forEach(id => {
    document.getElementById(id)?.addEventListener('input',  () => { hideResult(); clearError('calcErr'); });
    document.getElementById(id)?.addEventListener('change', () => { hideResult(); clearError('calcErr'); });
  });

  document.getElementById('calcBtn')?.addEventListener('click', handleCalculate);
}

function onActionChange(action) {
  hideResult(); clearError('calcErr');
  const isArith = action === 'Arithmetic';
  toggleOperators(isArith);
  setToInputEditable(isArith);
}

/* ============================================================
   DATA LOADING
   ============================================================ */

async function loadUnits() {
  try {
    const units = await getUnits(state.selectedType);
    populateBothDropdowns(units);
  } catch (_) {
    populateBothDropdowns(FALLBACK_UNITS[state.selectedType] || []);
  }
}

async function loadHistory() {
  try {
    const items = await getHistory();
    setState({ history: items });
    renderHistory(items);
    updateHistoryBadge(items.length);
  } catch (_) {
    renderHistory(state.history);
    updateHistoryBadge(state.history.length);
  }
}

/* ============================================================
   CALCULATE
   ============================================================ */

async function handleCalculate() {
  clearError('calcErr');

  const fromValue = parseFloat(document.getElementById('fromValue')?.value);
  const fromSym   = document.getElementById('fromUnit')?.value;
  const toSym     = document.getElementById('toUnit')?.value;
  const type      = state.selectedType;
  const action    = state.selectedAction;

  if (isNaN(fromValue)) { showError('calcErr', 'Enter a valid number in the FROM field.'); return; }

  let resultText = '';

  try {
    if (action === 'Conversion') {
      const { converted, resultText: rt } = performConversion(fromValue, fromSym, toSym, type);
      setToValue(converted); resultText = rt;

    } else if (action === 'Comparison') {
      const { converted, resultText: rt } = performComparison(fromValue, fromSym, toSym, type);
      setToValue(converted); resultText = rt;

    } else if (action === 'Arithmetic') {
      const toValue = parseFloat(document.getElementById('toValue')?.value);
      if (isNaN(toValue)) { showError('calcErr', 'Enter a value in the TO field for arithmetic.'); return; }
      const { resultText: rt } = performArithmetic(fromValue, fromSym, toValue, toSym, state.selectedOperator, type);
      resultText = rt;
    }
  } catch (err) {
    showError('calcErr', err.message); return;
  }

  showResult(resultText);

  const entry = { type, action, expression: `${fromValue} ${fromSym}`, result: resultText };

  try {
    const saved = await postHistory(entry);
    state.history.unshift(saved);
  } catch (_) {
    state.history.unshift({ id: Date.now(), ...entry, timestamp: new Date().toISOString() });
  }

  renderHistory(state.history);
  updateHistoryBadge(state.history.length);
}

/* ============================================================
   FALLBACK DATA
   ============================================================ */

const FALLBACK_UNITS = {
  Length: [
    {label:'Kilometer',symbol:'km'},{label:'Meter',symbol:'m'},{label:'Centimeter',symbol:'cm'},
    {label:'Millimeter',symbol:'mm'},{label:'Mile',symbol:'mi'},{label:'Yard',symbol:'yd'},
    {label:'Foot',symbol:'ft'},{label:'Inch',symbol:'in'},
  ],
  Weight: [
    {label:'Kilogram',symbol:'kg'},{label:'Gram',symbol:'g'},{label:'Milligram',symbol:'mg'},
    {label:'Pound',symbol:'lb'},{label:'Ounce',symbol:'oz'},{label:'Ton',symbol:'t'},
  ],
  Temperature: [
    {label:'Celsius',symbol:'°C'},{label:'Fahrenheit',symbol:'°F'},{label:'Kelvin',symbol:'K'},
  ],
  Volume: [
    {label:'Liter',symbol:'L'},{label:'Milliliter',symbol:'mL'},{label:'Cubic Meter',symbol:'m³'},
    {label:'Gallon',symbol:'gal'},{label:'Quart',symbol:'qt'},{label:'Cup',symbol:'cup'},
    {label:'Fluid Ounce',symbol:'fl oz'},
  ],
};
