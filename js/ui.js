/**
 * ui.js
 * DOM helpers: populateDropdown, showResult, toggleOperators,
 * renderHistory, showError, clearError, setUserDisplay.
 */

export function populateDropdown(selectId, units, selectedSymbol) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = units.map(u =>
    `<option value="${u.symbol}"${u.symbol === selectedSymbol ? ' selected' : ''}>${u.label}</option>`
  ).join('');
}

export function populateBothDropdowns(units) {
  populateDropdown('fromUnit', units, units[0]?.symbol);
  populateDropdown('toUnit',   units, units[1]?.symbol ?? units[0]?.symbol);
}

export function showResult(text) {
  const area = document.getElementById('resultArea');
  const val  = document.getElementById('resultValue');
  if (!area || !val) return;
  val.textContent = text;
  area.classList.remove('result-area--hidden');
}

export function hideResult() {
  document.getElementById('resultArea')?.classList.add('result-area--hidden');
}

export function setToValue(value) {
  const inp = document.getElementById('toValue');
  if (inp) inp.value = value;
}

export function toggleOperators(visible) {
  const row = document.getElementById('operatorRow');
  if (!row) return;
  row.classList.toggle('visible', visible);
  row.setAttribute('aria-hidden', String(!visible));
}

export function setToInputEditable(editable) {
  const inp = document.getElementById('toValue');
  if (!inp) return;
  inp.readOnly  = !editable;
  inp.placeholder = editable ? 'Second value' : '?';
  if (!editable) inp.value = '';
}

export function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

export function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = '';
}

const TYPE_COLORS = {
  Length:      '#FFB703',
  Weight:      '#EF476F',
  Temperature: '#FF6B6B',
  Volume:      '#4CC9F0',
};

export function renderHistory(historyItems) {
  const list = document.getElementById('historyList');
  if (!list) return;

  if (!historyItems.length) {
    list.innerHTML = '<div class="history-empty">No calculations yet.<br>Start measuring!</div>';
    return;
  }

  list.innerHTML = historyItems.slice(0, 40).map(h => {
    const color = TYPE_COLORS[h.type] || '#888';
    const time  = h.timestamp
      ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return `
      <div class="history-item" data-id="${h.id}">
        <div class="hi-type" style="color:${color}">${h.type} · ${h.action}</div>
        <div class="hi-expr">${escHtml(h.expression)}</div>
        <div class="hi-result">${escHtml(h.result)}</div>
        <div class="hi-time">${time}</div>
      </div>
    `;
  }).join('');
}

export function setUserDisplay(user) {
  const nameEl   = document.getElementById('userName');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl)   nameEl.textContent   = user.name.split(' ')[0];
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
