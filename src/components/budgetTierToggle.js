import { el } from "./dom.js";

const TIERS = [
  { id: "cheap", label: "Cheap", sub: "£" },
  { id: "mid", label: "Mid", sub: "££" },
  { id: "premium", label: "Premium", sub: "£££" },
];

/**
 * Pill toggle for the budget tier.
 * @param {import("../data/types.js").BudgetTier} current
 * @param {(tier: string) => void} onChange
 */
export function budgetTierToggle(current, onChange) {
  return el(
    "div",
    { class: "segmented", role: "group", "aria-label": "Budget tier" },
    TIERS.map((t) =>
      el("button", {
        type: "button",
        class: `segmented__item${t.id === current ? " is-active" : ""}`,
        "aria-pressed": String(t.id === current),
        on: { click: () => onChange(t.id) },
      }, [
        el("span", { class: "segmented__label", text: t.label }),
        el("span", { class: "segmented__sub", text: t.sub }),
      ])
    )
  );
}
