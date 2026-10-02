import { el } from "./dom.js";
import { CATEGORIES } from "../data/categories.js";

/**
 * Horizontal pill tabs for the Explore categories.
 * @param {string} currentId
 * @param {(id: string) => void} onChange
 */
export function categoryTabs(currentId, onChange) {
  return el(
    "div",
    { class: "tabs", role: "tablist", "aria-label": "Categories" },
    CATEGORIES.map((c) =>
      el("button", {
        type: "button",
        role: "tab",
        class: `tab${c.id === currentId ? " is-active" : ""}`,
        "aria-selected": String(c.id === currentId),
        on: { click: () => onChange(c.id) },
      }, [
        el("span", { class: "tab__icon", text: c.icon }),
        el("span", { class: "tab__label", text: c.name }),
      ])
    )
  );
}
