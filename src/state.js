// App state + localStorage persistence + a tiny pub/sub so views re-render
// on change. Single versioned object under one key; resets on schema mismatch.

const KEY = "orbit.v1";
const SCHEMA = 1;

/** @typedef {import("./data/types.js").BudgetTier} BudgetTier */
/** @typedef {import("./data/types.js").Energy} Energy */
/** @typedef {import("./data/types.js").Plan} Plan */

/**
 * @typedef {Object} OrbitState
 * @property {number} schema
 * @property {boolean} onboarded
 * @property {string|null} areaId
 * @property {BudgetTier} tier
 * @property {Energy|null} energy
 * @property {Plan|null} plan
 * @property {string[]} doneTaskIds
 */

/** @returns {OrbitState} */
function defaults() {
  return {
    schema: SCHEMA,
    onboarded: false,
    areaId: null,
    tier: "cheap",
    energy: null,
    plan: null,
    doneTaskIds: [],
  };
}

/** @type {OrbitState} */
let state = load();
/** @type {Set<() => void>} */
const subscribers = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schema !== SCHEMA) return defaults();
    return { ...defaults(), ...parsed };
  } catch {
    return defaults();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode) — app still works in-memory */
  }
}

/** @returns {OrbitState} */
export function getState() {
  return state;
}

/**
 * Merge a partial update, persist, and notify subscribers.
 * @param {Partial<OrbitState>} patch
 */
export function setState(patch) {
  state = { ...state, ...patch };
  persist();
  subscribers.forEach((fn) => fn());
}

/** @param {() => void} fn @returns {() => void} unsubscribe */
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Mark a place/task done so it isn't suggested again. */
export function markDone(placeId) {
  if (state.doneTaskIds.includes(placeId)) return;
  setState({ doneTaskIds: [...state.doneTaskIds, placeId] });
}

export function undoDone(placeId) {
  setState({ doneTaskIds: state.doneTaskIds.filter((id) => id !== placeId) });
}

/** Wipe everything and restart onboarding. */
export function resetAll() {
  state = defaults();
  persist();
  subscribers.forEach((fn) => fn());
}
