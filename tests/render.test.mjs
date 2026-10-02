// DOM render smoke tests using a tiny document shim — verifies the component
// layer produces the expected structure without a real browser.
import { test } from "node:test";
import assert from "node:assert/strict";

// ---- minimal DOM shim -------------------------------------------------------
class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.className = "";
    this.textContent = "";
    this.style = {};
    this.dataset = {};
    this._listeners = {};
  }
  appendChild(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  addEventListener(e, fn) { (this._listeners[e] ||= []).push(fn); }
  get classList() {
    const self = this;
    return {
      add: (...c) => (self.className = (self.className + " " + c.join(" ")).trim()),
      contains: (c) => self.className.split(/\s+/).includes(c),
    };
  }
  querySelectorAll() { return []; }
  // helpers for assertions
  get text() {
    return (this.textContent || "") + this.children.map((c) => (c.text ?? "")).join("");
  }
  find(pred, acc = []) {
    if (pred(this)) acc.push(this);
    this.children.forEach((c) => c.find && c.find(pred, acc));
    return acc;
  }
}
globalThis.document = {
  createElement: (t) => new El(t),
  createTextNode: (t) => ({ textContent: t, text: t, nodeType: 3 }),
};

const { placeCard } = await import("../src/components/placeCard.js");
const { discountBadge } = await import("../src/components/discountBadge.js");
const { categoryTabs } = await import("../src/components/categoryTabs.js");
const { PLACES } = await import("../src/data/places.js");

test("discountBadge renders provider, offer and verify note", () => {
  const place = PLACES.find((p) => p.discount);
  const node = discountBadge(place.discount);
  const t = node.text;
  assert.match(t, /%|off|discount/i);
  assert.match(t, /Verify on the retailer's site/);
  assert.match(t, /checked \d{4}-\d{2}-\d{2}/);
});

test("placeCard shows name, note and a discount when present", () => {
  const place = PLACES.find((p) => p.discount);
  const card = placeCard(place, { categoryId: place.categoryIds[0] });
  assert.match(card.text, new RegExp(place.name.slice(0, 6)));
  assert.ok(card.find((n) => n.className.includes("discount")).length > 0);
});

test("placeCard numbered variant renders an order badge", () => {
  const place = PLACES[0];
  const card = placeCard(place, { index: 3 });
  const badge = card.find((n) => n.className === "card__index")[0];
  assert.ok(badge);
  assert.equal(badge.text, "3");
});

test("categoryTabs renders all six categories with one active", () => {
  const tabs = categoryTabs("room", () => {});
  const btns = tabs.find((n) => n.tagName === "BUTTON" && n.className.includes("tab"));
  assert.equal(btns.length, 6);
  assert.equal(btns.filter((b) => b.className.includes("is-active")).length, 1);
});
