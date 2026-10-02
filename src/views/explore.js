import { el, mount } from "../components/dom.js";
import { header, disclaimer } from "./home.js";
import { categoryTabs } from "../components/categoryTabs.js";
import { budgetTierToggle } from "../components/budgetTierToggle.js";
import { placeCard } from "../components/placeCard.js";
import { ensureMap, setMarkers, focusPlace } from "../components/mapView.js";
import { PLACES } from "../data/places.js";
import { getCategory } from "../data/categories.js";
import { getArea } from "../data/areas.js";
import { getState, setState } from "../state.js";

/** Explore: category tabs + budget toggle + map + synced list. */
export function renderExplore(root) {
  const s = getState();
  const area = getArea(s.areaId);
  let activeCat = "room";
  let activeTier = s.tier;
  let selectedId = null;

  const tabsWrap = el("div", {});
  const tierWrap = el("div", { class: "explore__tier" });
  const listWrap = el("div", { class: "list" });
  const mapEl = el("div", { class: "map", id: "map" });

  function matching() {
    return PLACES.filter(
      (p) => p.categoryIds.includes(activeCat) && p.tiers.includes(activeTier)
    );
  }

  function renderTabs() {
    mount(tabsWrap, categoryTabs(activeCat, (id) => {
      activeCat = id;
      selectedId = null;
      refresh();
    }));
  }

  function renderTier() {
    mount(tierWrap, budgetTierToggle(activeTier, (t) => {
      activeTier = t;
      setState({ tier: t });
      selectedId = null;
      refresh();
    }));
  }

  function renderList() {
    const places = matching();
    const cat = getCategory(activeCat);
    if (!places.length) {
      mount(listWrap, el("div", { class: "empty" }, [
        el("p", { class: "empty__title", text: "No spots for this budget yet" }),
        el("p", { class: "empty__sub", text: `Try a different budget tier for ${cat ? cat.name : "this category"}.` }),
      ]));
      return;
    }
    mount(
      listWrap,
      el("p", { class: "list__count", text: `${places.length} ${cat ? cat.name.toLowerCase() : ""} spot${places.length > 1 ? "s" : ""}` }),
      ...places.map((p) =>
        placeCard(p, {
          categoryId: activeCat,
          active: p.id === selectedId,
          onSelect: () => {
            selectedId = p.id;
            focusPlace(p.id);
            renderList();
          },
        })
      )
    );
  }

  function renderMap() {
    const center = area ? area : { lat: 51.5074, lng: -0.1278, zoom: 12 };
    ensureMap(mapEl, center, center.zoom || 12);
    setMarkers(
      matching().map((place) => ({ place })),
      {
        onSelect: (id) => {
          selectedId = id;
          renderList();
        },
      }
    );
  }

  function refresh() {
    renderTabs();
    renderTier();
    renderList();
    renderMap();
  }

  mount(
    root,
    el("div", { class: "screen" }, [
      header(area, s.tier),
      el("div", { class: "explore" }, [
        el("div", { class: "explore__controls" }, [tabsWrap, tierWrap]),
        el("div", { class: "split" }, [
          el("div", { class: "split__map" }, [mapEl]),
          el("div", { class: "split__list" }, [listWrap, disclaimer()]),
        ]),
      ]),
    ])
  );

  refresh();
}
