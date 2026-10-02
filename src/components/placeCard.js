import { el } from "./dom.js";
import { discountBadge } from "./discountBadge.js";
import { getCategory } from "../data/categories.js";

const TIER_LABEL = { cheap: "£", mid: "££", premium: "£££" };

function directionsUrl(place) {
  const q = encodeURIComponent(`${place.name}, ${place.address}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}

/**
 * A card used by both the plan stops and the explore list.
 * @param {import("../data/types.js").Place} place
 * @param {Object} [opts]
 * @param {number} [opts.index]        show a numbered badge (plan order)
 * @param {string} [opts.categoryId]   category to show as the pill label
 * @param {boolean} [opts.active]
 * @param {() => void} [opts.onSelect]
 * @param {(Node|null)[]} [opts.actions] extra action buttons (skip/swap/done)
 */
export function placeCard(place, opts = {}) {
  const cat = getCategory(opts.categoryId || place.categoryIds[0]);
  const costLabel =
    place.costEstimate > 0 ? `~£${place.costEstimate}` : "Free";

  const card = el(
    "article",
    { class: `card${opts.active ? " card--active" : ""}`, dataset: { placeId: place.id } },
    [
      el("div", { class: "card__top" }, [
        opts.index != null
          ? el("span", { class: "card__index", text: String(opts.index) })
          : el("span", { class: "card__icon", text: cat ? cat.icon : "📍" }),
        el("div", { class: "card__titles" }, [
          el("h3", { class: "card__name", text: place.name }),
          el("p", { class: "card__meta", text: `${cat ? cat.name : ""} · ${costLabel} · ~${place.timeEstimateMin} min` }),
        ]),
        el("span", { class: "card__tier", text: TIER_LABEL[place.tiers[place.tiers.length - 1]] || "" }),
      ]),
      el("p", { class: "card__note", text: place.note }),
      el("p", { class: "card__addr", text: place.address }),
      place.discount ? discountBadge(place.discount) : null,
      el("div", { class: "card__actions" }, [
        el("a", {
          class: "btn btn--ghost",
          href: directionsUrl(place),
          target: "_blank",
          rel: "noopener noreferrer",
          text: "Directions ↗",
        }),
        ...(opts.actions || []),
      ]),
    ]
  );

  if (opts.onSelect) {
    card.classList.add("card--clickable");
    card.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return; // let links/buttons act
      opts.onSelect();
    });
  }
  return card;
}
