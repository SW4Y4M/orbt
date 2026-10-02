import { el, mount } from "../components/dom.js";
import { budgetTierToggle } from "../components/budgetTierToggle.js";
import { logoBadge, logoLockup } from "../components/logo.js";
import { AREAS, getArea } from "../data/areas.js";
import { getState, setState, resetAll } from "../state.js";
import { navigate } from "../router.js";

/** Full-screen onboarding when the student hasn't set area + tier yet. */
function onboarding(root) {
  const s = getState();
  let areaId = s.areaId || AREAS[0].id;
  let tier = s.tier || "cheap";

  const areaSelect = el(
    "select",
    { class: "field__input", id: "area", "aria-label": "Your London area" },
    AREAS.map((a) =>
      el("option", { value: a.id, selected: a.id === areaId, text: a.name })
    )
  );
  areaSelect.addEventListener("change", (e) => (areaId = e.target.value));

  const tierWrap = el("div", {});
  const renderTier = () =>
    mount(tierWrap, budgetTierToggle(tier, (t) => {
      tier = t;
      renderTier();
    }));
  renderTier();

  mount(
    root,
    el("section", { class: "onboard" }, [
      el("div", { class: "onboard__card" }, [
        el("div", { class: "onboard__logo" }, [logoBadge(84)]),
        el("h1", { class: "onboard__title", text: "Settle into London, sorted." }),
        el("p", { class: "onboard__sub", text: "A couple of basics and you're set. No sign-up — everything stays on your device." }),
        el("div", { class: "field" }, [
          el("label", { class: "field__label", for: "area", text: "Where are you based?" }),
          areaSelect,
        ]),
        el("div", { class: "field" }, [
          el("span", { class: "field__label", text: "What's your budget vibe?" }),
          tierWrap,
        ]),
        el("button", {
          class: "btn btn--primary btn--block",
          text: "Start exploring",
          on: {
            click: () => {
              setState({ areaId, tier, onboarded: true });
              navigate("home");
            },
          },
        }),
      ]),
    ])
  );
}

/** Home with the two entry points. */
export function renderHome(root) {
  const s = getState();
  if (!s.onboarded || !s.areaId) return onboarding(root);

  const area = getArea(s.areaId);

  mount(
    root,
    el("div", { class: "screen" }, [
      header(area, s.tier),
      el("main", { class: "home" }, [
        el("div", { class: "home__hero" }, [
          el("h1", { class: "home__title", text: "What's the plan today?" }),
          el("p", { class: "home__sub", text: "Let Orbit map your day — or just explore the city at your own pace." }),
        ]),
        el("div", { class: "home__cards" }, [
          entryCard("🗺️", "Plan my day", "Answer one question, get a ready-made route with discounts built in.", () => navigate("plan")),
          entryCard("🧭", "Explore", "Browse curated spots by category on the map, filtered to your budget.", () => navigate("explore")),
        ]),
        disclaimer(),
      ]),
    ])
  );
}

function entryCard(icon, title, body, onClick) {
  return el("button", { class: "entry", on: { click: onClick } }, [
    el("span", { class: "entry__icon", text: icon }),
    el("span", { class: "entry__title", text: title }),
    el("span", { class: "entry__body", text: body }),
    el("span", { class: "entry__go", text: "→" }),
  ]);
}

/** Shared header showing area + tier with edit/reset. */
export function header(area, tier) {
  return el("header", { class: "topbar" }, [
    el("button", {
      class: "brand",
      "aria-label": "Orbit — home",
      on: { click: () => navigate("home") },
    }, [logoLockup(26)]),
    el("div", { class: "topbar__meta" }, [
      el("span", { class: "chip", text: area ? area.name : "Set area" }),
      el("span", { class: "chip chip--muted", text: tierLabel(tier) }),
      el("button", {
        class: "linkbtn",
        text: "Edit",
        on: {
          click: () => {
            setState({ onboarded: false });
            navigate("home");
          },
        },
      }),
      el("button", {
        class: "linkbtn linkbtn--muted",
        text: "Reset",
        on: {
          click: () => {
            if (confirm("Reset Orbit and clear your saved choices?")) {
              resetAll();
              navigate("home");
            }
          },
        },
      }),
    ]),
  ]);
}

function tierLabel(tier) {
  return { cheap: "Cheap £", mid: "Mid ££", premium: "Premium £££" }[tier] || tier;
}

export function disclaimer() {
  return el("p", {
    class: "disclaimer",
    text: "Student discounts are curated and change often — always confirm the current offer on the retailer's site before relying on it.",
  });
}
