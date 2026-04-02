/**
 * api.js
 * Fetch wrappers for json-server REST API.
 * Endpoints: /units  /conversions  /history
 *
 * Start the backend with:  npm start
 * json-server runs at http://localhost:3000 by default.
 */

const BASE_URL = 'http://localhost:3000';

/**
 * Generic fetch helper with error handling.
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

/* ---- Units ---- */

/**
 * Fetch all units, optionally filtered by type.
 * GET /units?type=Length
 * @param {string} [type] - e.g. 'Length', 'Weight', 'Temperature', 'Volume'
 * @returns {Promise<Array<{id:number, type:string, label:string, symbol:string}>>}
 */
export async function getUnits(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return request(`/units${query}`);
}

/* ---- Conversions ---- */

/**
 * Fetch conversion record for a from→to symbol pair.
 * GET /conversions?from=km&to=m
 * @param {string} fromSymbol
 * @param {string} toSymbol
 * @returns {Promise<Array<{id:number, from:string, to:string, factor:number, formula?:string}>>}
 */
export async function getConversion(fromSymbol, toSymbol) {
  const q = `?from=${encodeURIComponent(fromSymbol)}&to=${encodeURIComponent(toSymbol)}`;
  return request(`/conversions${q}`);
}

/* ---- History ---- */

/**
 * Fetch all history entries (most recent first).
 * GET /history?_sort=id&_order=desc
 * @returns {Promise<Array<{id:number, type:string, action:string, expression:string, result:string, timestamp:string}>>}
 */
export async function getHistory() {
  return request('/history?_sort=id&_order=desc');
}

/**
 * Persist a new history entry.
 * POST /history
 * @param {{ type:string, action:string, expression:string, result:string }} entry
 * @returns {Promise<{id:number, type:string, action:string, expression:string, result:string, timestamp:string}>}
 */
export async function postHistory(entry) {
  return request('/history', {
    method: 'POST',
    body: JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    }),
  });
}

/**
 * Delete a history entry by id.
 * DELETE /history/:id
 * @param {number} id
 * @returns {Promise<{}>}
 */
export async function deleteHistory(id) {
  return request(`/history/${id}`, { method: 'DELETE' });
}
