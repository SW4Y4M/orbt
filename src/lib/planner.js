// Deterministic day-plan generation. No external AI — just priority ordering,
// budget-tier filtering, guaranteed food + reward stops, and nearest-neighbour
// routing from the student's area.

import { PLACES } from "../data/places.js";
import { CATEGORIES, getCategory } from "../data/categories.js";
import { getArea } from "../data/areas.js";
import { haversine, nearestNeighbourOrder } from "./geo.js";

/** @typedef {import("../data/types.js").Plan} Plan */
/** @typedef {import("../data/types.js").PlanStop} PlanStop */
/** @typedef {import("../data/types.js").Place} Place */
/** @typedef {import("../data/types.js").BudgetTier} BudgetTier */
/** @typedef {import("../data/types.js").Energy} Energy */

/** @param {Energy} energy */
export function targetSize(energy) {
  if (energy === "low") return 2;
  if (energy === "high") return 6;
  return 4; // medium
}

/** Parse a leading percentage from a discount offer, else 0. */
function parsePercent(offer) {
  const m = /(\d+)\s*%/.exec(offer || "");
  return m ? Number(m[1]) : 0;
}

/** Estimated £ saved at a place given its discount (info only). */
function savingsFor(place) {
  if (!place.discount) return 0;
  const pct = parsePercent(place.discount.offer);
  return pct ? Math.round((place.costEstimate * pct) / 100) : 0;
}

/** Short "what it's for" line from a place's note. */
function reasonFor(place) {
  return place.note;
}

/**
 * Candidate places for a tier, excluding any whose only purpose is an
 * already-done task.
 * @param {BudgetTier} tier
 * @param {string[]} doneTaskIds  place ids already completed
 */
function candidates(tier, doneTaskIds) {
  const done = new Set(doneTaskIds || []);
  return PLACES.filter((p) => p.tiers.includes(tier) && !done.has(p.id));
}

/** Pick the best place for a category: closest to start, discount breaks ties. */
function bestForCategory(categoryId, pool, start, usedIds) {
  const options = pool.filter(
    (p) => p.categoryIds.includes(categoryId) && !usedIds.has(p.id)
  );
  if (!options.length) return null;
  options.sort((a, b) => {
    const da = haversine(start, a);
    const db = haversine(start, b);
    if (Math.abs(da - db) > 0.3) return da - db; // ~300m tolerance
    const sa = a.discount ? 1 : 0;
    const sb = b.discount ? 1 : 0;
    return sb - sa;
  });
  return options[0];
}

/**
 * Build a plan.
 * @param {{areaId:string, tier:BudgetTier, energy:Energy, doneTaskIds?:string[]}} opts
 * @returns {Plan}
 */
export function generatePlan({ areaId, tier, energy, doneTaskIds = [] }) {
  const area = getArea(areaId);
  const start = area ? { lat: area.lat, lng: area.lng } : { lat: 51.5074, lng: -0.1278 };
  const size = targetSize(energy);
  const pool = candidates(tier, doneTaskIds);

  /** @type {Place[]} */
  const selected = [];
  const usedIds = new Set();

  // 1) Essentials by journey priority (exclude the reward category for now).
  const essentials = CATEGORIES.filter((c) => !c.isReward).sort(
    (a, b) => a.priority - b.priority
  );
  for (const cat of essentials) {
    if (selected.length >= size) break;
    const pick = bestForCategory(cat.id, pool, start, usedIds);
    if (pick) {
      selected.push(pick);
      usedIds.add(pick.id);
    }
  }

  // 2) Guarantee a food stop when the day is big enough (size >= 3).
  if (size >= 3 && !selected.some((p) => p.isFoodSpot)) {
    const food = pool
      .filter((p) => p.isFoodSpot && !usedIds.has(p.id))
      .sort((a, b) => haversine(start, a) - haversine(start, b))[0];
    if (food) {
      // Replace the lowest-priority essential if we're already at size.
      if (selected.length >= size) selected.pop();
      selected.push(food);
      usedIds.add(food.id);
    }
  }

  // 3) Guarantee a reward (Explore) stop when size >= 2.
  if (size >= 2 && !selected.some((p) => p.categoryIds.includes("explore"))) {
    const reward = bestForCategory("explore", pool, start, usedIds);
    if (reward) {
      if (selected.length >= size) selected.pop();
      selected.push(reward);
      usedIds.add(reward.id);
    }
  }

  // Trim to size (safety) and order the route.
  const trimmed = selected.slice(0, size);
  const ordered = nearestNeighbourOrder(start, trimmed);

  /** @type {PlanStop[]} */
  const stops = ordered.map((place, i) => ({
    place,
    categoryId: primaryCategory(place),
    reason: reasonFor(place),
    order: i + 1,
  }));

  const estSpend = stops.reduce((s, st) => s + st.place.costEstimate, 0);
  const estSavings = stops.reduce((s, st) => s + savingsFor(st.place), 0);

  return {
    areaId,
    tier,
    energy,
    stops,
    estSpend,
    estSavings,
    generatedAt: new Date().toISOString(),
  };
}

/** Choose the most "urgent" category a place belongs to for display. */
function primaryCategory(place) {
  let best = place.categoryIds[0];
  let bestPriority = Infinity;
  for (const id of place.categoryIds) {
    const c = getCategory(id);
    if (c && c.priority < bestPriority) {
      bestPriority = c.priority;
      best = id;
    }
  }
  return best;
}

/**
 * Remove a stop by place id and re-order/re-total the plan.
 * @param {Plan} plan
 * @param {string} placeId
 * @returns {Plan}
 */
export function skipStop(plan, placeId) {
  const start = startOf(plan);
  const kept = plan.stops.map((s) => s.place).filter((p) => p.id !== placeId);
  return rebuild(plan, start, kept);
}

/**
 * Swap a stop for the next-best unused candidate of the same primary category.
 * @param {Plan} plan
 * @param {string} placeId
 * @param {string[]} doneTaskIds
 * @returns {Plan}
 */
export function swapStop(plan, placeId, doneTaskIds = []) {
  const start = startOf(plan);
  const stop = plan.stops.find((s) => s.place.id === placeId);
  if (!stop) return plan;
  const usedIds = new Set(plan.stops.map((s) => s.place.id));
  const pool = candidates(plan.tier, doneTaskIds);
  const replacement = bestForCategory(stop.categoryId, pool, start, usedIds);
  const kept = plan.stops.map((s) => s.place);
  const idx = kept.findIndex((p) => p.id === placeId);
  if (replacement) {
    kept[idx] = replacement;
  } else {
    kept.splice(idx, 1); // nothing to swap to — just drop it
  }
  return rebuild(plan, start, kept);
}

function startOf(plan) {
  const area = getArea(plan.areaId);
  return area ? { lat: area.lat, lng: area.lng } : { lat: 51.5074, lng: -0.1278 };
}

/** @param {Plan} plan @param {{lat:number,lng:number}} start @param {Place[]} places */
function rebuild(plan, start, places) {
  const ordered = nearestNeighbourOrder(start, places);
  const stops = ordered.map((place, i) => ({
    place,
    categoryId: primaryCategory(place),
    reason: reasonFor(place),
    order: i + 1,
  }));
  return {
    ...plan,
    stops,
    estSpend: stops.reduce((s, st) => s + st.place.costEstimate, 0),
    estSavings: stops.reduce((s, st) => s + savingsFor(st.place), 0),
  };
}

export { savingsFor, parsePercent };
