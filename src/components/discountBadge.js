import { el } from "./dom.js";

const PROVIDER_LABEL = {
  unidays: "UNiDAYS",
  studentbeans: "StudentBeans",
  direct: "Direct",
};

/**
 * Inline discount display with provider, offer, redeem note, link and the
 * honesty disclaimer + lastChecked date.
 * @param {import("../data/types.js").Discount} discount
 */
export function discountBadge(discount) {
  if (!discount) return null;
  return el("div", { class: "discount" }, [
    el("div", { class: "discount__head" }, [
      el("span", { class: `tag tag--${discount.provider}`, text: PROVIDER_LABEL[discount.provider] || "Offer" }),
      el("span", { class: "discount__offer", text: discount.offer }),
    ]),
    el("p", { class: "discount__note", text: discount.note }),
    el("div", { class: "discount__foot" }, [
      el("a", {
        class: "discount__link",
        href: discount.url,
        target: "_blank",
        rel: "noopener noreferrer",
        text: "Open offer ↗",
      }),
      el("span", {
        class: "discount__verify",
        text: `Verify on the retailer's site · checked ${discount.lastChecked}`,
      }),
    ]),
  ]);
}
