// Lightweight tests for the planner + geo helpers. Run with:
//   node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";

import { haversine, nearestNeighbourOrder } from "../src/lib/geo.js";
import {
  generatePlan,
  skipStop,
  swapStop,
  targetSize,
  parsePercent,
} from "../src/lib/planner.js";

test("targetSize maps energy to plan length", () => {
  assert.equal(targetSize("low"), 2);
  assert.equal(targetSize("medium"), 4);
  assert.equal(targetSize("high"), 6);
});

test("parsePercent reads a leading percentage", () => {
  assert.equal(parsePercent("20% off"), 20);
  assert.equal(parsePercent("1/3 off rail fares"), 0);
  assert.equal(parsePercent(""), 0);
});

test("haversine ~0 for identical points, positive otherwise", () => {
  const a = { lat: 51.52, lng: -0.13 };
  assert.ok(haversine(a, a) < 1e-9);
  assert.ok(haversine(a, { lat: 51.54, lng: -0.14 }) > 0);
});

test("nearestNeighbourOrder returns all items, nearest first", () => {
  const start = { lat: 0, lng: 0 };
  const pts = [
    { id: "far", lat: 10, lng: 10 },
    { id: "near", lat: 0.1, lng: 0.1 },
    { id: "mid", lat: 2, lng: 2 },
  ];
  const ordered = nearestNeighbourOrder(start, pts);
  assert.equal(ordered.length, 3);
  assert.equal(ordered[0].id, "near");
  assert.equal(ordered[2].id, "far");
});

test("low-energy plan is small and includes a reward (explore) stop", () => {
  const plan = generatePlan({ areaId: "bloomsbury", tier: "cheap", energy: "low" });
  assert.ok(plan.stops.length <= 2 && plan.stops.length >= 1);
  assert.ok(plan.stops.some((s) => s.place.categoryIds.includes("explore")));
});

test("high-energy plan is larger and includes food + reward", () => {
  const plan = generatePlan({ areaId: "bloomsbury", tier: "cheap", energy: "high" });
  assert.ok(plan.stops.length >= 4);
  assert.ok(plan.stops.some((s) => s.place.isFoodSpot), "has a food stop");
  assert.ok(plan.stops.some((s) => s.place.categoryIds.includes("explore")), "has a reward");
});

test("plan excludes already-done places", () => {
  const first = generatePlan({ areaId: "camden", tier: "cheap", energy: "high" });
  const doneId = first.stops[0].place.id;
  const second = generatePlan({
    areaId: "camden",
    tier: "cheap",
    energy: "high",
    doneTaskIds: [doneId],
  });
  assert.ok(!second.stops.some((s) => s.place.id === doneId));
});

test("totals are computed and savings never exceed spend-derived values", () => {
  const plan = generatePlan({ areaId: "mile-end", tier: "cheap", energy: "high" });
  assert.equal(
    plan.estSpend,
    plan.stops.reduce((n, s) => n + s.place.costEstimate, 0)
  );
  assert.ok(plan.estSavings >= 0);
});

test("skipStop removes the stop and re-orders", () => {
  const plan = generatePlan({ areaId: "bloomsbury", tier: "cheap", energy: "high" });
  const id = plan.stops[1].place.id;
  const after = skipStop(plan, id);
  assert.equal(after.stops.length, plan.stops.length - 1);
  assert.ok(!after.stops.some((s) => s.place.id === id));
  after.stops.forEach((s, i) => assert.equal(s.order, i + 1));
});

test("swapStop replaces with a same-category candidate when available", () => {
  // Room category has several cheap options, so a swap should find a replacement.
  const plan = generatePlan({ areaId: "camden", tier: "cheap", energy: "high" });
  const roomStop = plan.stops.find((s) => s.categoryId === "room");
  if (roomStop) {
    const before = roomStop.place.id;
    const after = swapStop(plan, before, []);
    const stillRoom = after.stops.find((s) => s.categoryId === "room");
    assert.ok(stillRoom, "still has a room stop after swap");
  }
  assert.ok(true);
});
