import { el, mount } from "../components/dom.js";
import { header, disclaimer } from "./home.js";
import { placeCard } from "../components/placeCard.js";
import { ensureMap, setMarkers, focusPlace } from "../components/mapView.js";
import { generatePlan, skipStop, swapStop } from "../lib/planner.js";
import { getArea } from "../data/areas.js";
import { getState, setState, markDone } from "../state.js";

const ENERGY = [
  { id: "low", emoji: "😮‍💨", label: "Take it easy", sub: "~2 stops" },
  { id: "medium", emoji: "🙂", label: "A normal day", sub: "~3–4 stops" },
  { id: "high", emoji: "⚡", label: "Let's get a lot done", sub: "~5–6 stops" },
];

export function renderPlan(root) {
  const s = getState();
  const area = getArea(s.areaId);

  if (!s.plan) return renderEnergyPrompt(root, area);
  return renderPlanResult(root, area);
}

/** Step 1 — the single question. */
function renderEnergyPrompt(root, area) {
  const s = getState();
  mount(
    root,
    el("div", { class: "screen" }, [
      header(area, s.tier),
      el("main", { class: "prompt" }, [
        el("div", { class: "prompt__card" }, [
          el("h1", { class: "prompt__title", text: "How much do you have in you today?" }),
          el("p", { class: "prompt__sub", text: "No pressure — Orbit sizes your day to match." }),
          el("div", { class: "prompt__opts" },
            ENERGY.map((o) =>
              el("button", {
                class: "energy",
                on: {
                  click: () => {
                    const plan = generatePlan({
                      areaId: s.areaId,
                      tier: s.tier,
                      energy: o.id,
                      doneTaskIds: s.doneTaskIds,
                    });
                    setState({ energy: o.id, plan });
                    renderPlan(root);
                  },
                },
              }, [
                el("span", { class: "energy__emoji", text: o.emoji }),
                el("span", { class: "energy__label", text: o.label }),
                el("span", { class: "energy__sub", text: o.sub }),
              ])
            )
          ),
        ]),
      ]),
    ])
  );
}

/** Step 2 — the generated itinerary + mapped route. */
function renderPlanResult(root, area) {
  const s = getState();
  const listWrap = el("div", { class: "list" });
  const mapEl = el("div", { class: "map", id: "map" });

  function rerender() {
    renderList();
    renderMap();
    renderSummary();
  }

  function updatePlan(plan) {
    setState({ plan });
  }

  const summaryWrap = el("div", { class: "summary" });
  function renderSummary() {
    const plan = getState().plan;
    mount(summaryWrap, [
      el("div", { class: "summary__item" }, [
        el("span", { class: "summary__num", text: `£${plan.estSpend}` }),
        el("span", { class: "summary__lab", text: "est. spend" }),
      ]),
      el("div", { class: "summary__item summary__item--save" }, [
        el("span", { class: "summary__num", text: `£${plan.estSavings}` }),
        el("span", { class: "summary__lab", text: "est. saved" }),
      ]),
      el("div", { class: "summary__item" }, [
        el("span", { class: "summary__num", text: String(plan.stops.length) }),
        el("span", { class: "summary__lab", text: "stops" }),
      ]),
    ]);
  }

  function renderList() {
    const plan = getState().plan;
    const start = el("div", { class: "startstop" }, [
      el("span", { class: "startstop__dot", text: "🏠" }),
      el("div", {}, [
        el("strong", { text: "Start — your area" }),
        el("p", { class: "startstop__sub", text: area ? area.name : "London" }),
      ]),
    ]);

    if (!plan.stops.length) {
      mount(listWrap, start, el("div", { class: "empty" }, [
        el("p", { class: "empty__title", text: "Nothing left to plan" }),
        el("p", { class: "empty__sub", text: "You've skipped everything — regenerate for a fresh day." }),
      ]));
      return;
    }

    mount(
      listWrap,
      start,
      ...plan.stops.map((stop) =>
        placeCard(stop.place, {
          index: stop.order,
          categoryId: stop.categoryId,
          onSelect: () => focusPlace(stop.place.id),
          actions: [
            el("button", {
              class: "btn btn--ghost",
              text: "Done",
              on: {
                click: () => {
                  markDone(stop.place.id);
                  updatePlan(skipStop(getState().plan, stop.place.id));
                  rerender();
                },
              },
            }),
            el("button", {
              class: "btn btn--ghost",
              text: "Swap",
              on: {
                click: () => {
                  updatePlan(swapStop(getState().plan, stop.place.id, getState().doneTaskIds));
                  rerender();
                },
              },
            }),
            el("button", {
              class: "btn btn--ghost btn--danger",
              text: "Skip",
              on: {
                click: () => {
                  updatePlan(skipStop(getState().plan, stop.place.id));
                  rerender();
                },
              },
            }),
          ],
        })
      )
    );
  }

  function renderMap() {
    const plan = getState().plan;
    const center = area ? area : { lat: 51.5074, lng: -0.1278, zoom: 12 };
    ensureMap(mapEl, center, center.zoom || 12);
    setMarkers(
      plan.stops.map((stop) => ({ place: stop.place, order: stop.order })),
      { numbered: true, onSelect: (id) => focusPlace(id) }
    );
  }

  const planBar = el("div", { class: "overlay__controls" }, [
    el("div", { class: "planbar" }, [
      el("div", {}, [
        el("strong", { class: "planbar__title", text: "Your day plan" }),
        el("span", { class: "planbar__sub", text: energyLine(s.energy) }),
      ]),
      el("button", {
        class: "btn btn--primary btn--sm",
        text: "Regenerate",
        on: {
          click: () => {
            setState({ plan: null });
            renderPlan(root);
          },
        },
      }),
    ]),
    summaryWrap,
  ]);

  const panel = el("div", { class: "panel" }, [
    el("button", {
      class: "panel__grip",
      "aria-label": "Toggle plan list",
      on: { click: () => panel.classList.toggle("panel--collapsed") },
    }),
    el("div", { class: "panel__scroll" }, [listWrap, disclaimer()]),
  ]);

  mount(
    root,
    el("div", { class: "mapscreen" }, [
      mapEl,
      el("div", { class: "overlay" }, [
        el("div", { class: "overlay__top" }, [header(area, s.tier), planBar]),
        panel,
      ]),
    ])
  );

  rerender();
}

function energyLine(energy) {
  return {
    low: "An easy one today.",
    medium: "A balanced day.",
    high: "A productive one — let's go.",
  }[energy] || "";
}
