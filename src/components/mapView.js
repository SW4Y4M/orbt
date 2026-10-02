// Leaflet map wrapper. Leaflet (`L`) and its CSS are loaded from the CDN in
// index.html, so the user's browser fetches them at runtime. We keep a single
// map instance and update markers/route in place.

/** @typedef {{lat:number,lng:number}} LatLng */

let map = null;
let markerLayer = null;
let routeLayer = null;
/** @type {Record<string, any>} map place id -> leaflet marker */
let markersById = {};

/** Create or reuse the map inside `container`, centred on `center`. */
export function ensureMap(container, center, zoom) {
  const L = window.L;
  if (!L) {
    container.innerHTML =
      '<div class="map__fallback">Map couldn\'t load. Check your connection — tiles come from OpenStreetMap.</div>';
    return null;
  }
  if (!map) {
    map = L.map(container, {
      zoomControl: false, // we add a repositioned control below
      attributionControl: true,
    });
    // Base tiles: standard OpenStreetMap — free, no API key, always available.
    // We mute/lighten them with a CSS filter (see `.map .leaflet-tile-pane` in
    // app.css) so the map stays clean and pins/route stand out, without
    // depending on a keyed provider like CARTO.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.attributionControl.setPrefix("");
    markerLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
  } else if (map.getContainer() !== container) {
    // Container was recreated (view switch) — move the map into the new node.
    container.appendChild(map.getContainer());
    map.invalidateSize();
  }
  map.setView([center.lat, center.lng], zoom);
  // Leaflet needs a size recalculation after being (re)attached to the DOM.
  setTimeout(() => map && map.invalidateSize(), 0);
  return map;
}

/**
 * Render markers. `numbered` draws order badges and a connecting route line.
 * @param {Array<{place:any, order?:number}>} items
 * @param {{numbered?:boolean, onSelect?:(id:string)=>void}} [opts]
 */
export function setMarkers(items, opts = {}) {
  const L = window.L;
  if (!L || !map) return;
  markerLayer.clearLayers();
  routeLayer.clearLayers();
  markersById = {};

  const latlngs = [];
  items.forEach(({ place, order }) => {
    const hasOffer = !!place.discount;
    const icon = opts.numbered
      ? L.divIcon({
          className: "pin pin--num",
          html: `<span>${order}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
      : L.divIcon({
          className: `pin pin--dot${hasOffer ? " pin--offer" : ""}`,
          html: "<span></span>",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
    const m = L.marker([place.lat, place.lng], { icon }).addTo(markerLayer);
    const offer = place.discount
      ? `<span class="popup__offer">${place.discount.offer}</span>`
      : "";
    m.bindPopup(
      `<div class="popup"><strong class="popup__name">${place.name}</strong>` +
        `<span class="popup__note">${place.note}</span>${offer}</div>`,
      { closeButton: false, offset: [0, -4] }
    );
    if (opts.onSelect) m.on("click", () => opts.onSelect(place.id));
    markersById[place.id] = m;
    latlngs.push([place.lat, place.lng]);
  });

  if (opts.numbered && latlngs.length > 1) {
    L.polyline(latlngs, {
      color: "#6b4eff",
      weight: 3.5,
      opacity: 0.65,
      dashArray: "1 9",
      lineCap: "round",
    }).addTo(routeLayer);
  }

  if (latlngs.length) {
    const bounds = L.latLngBounds(latlngs);
    // Pad the right/bottom a touch more so pins aren't hidden under the
    // overlaid card panel.
    map.fitBounds(bounds.pad(0.3), {
      maxZoom: 15,
      paddingTopLeft: [40, 90],
      paddingBottomRight: [40, 160],
    });
  }
}

/** Open the popup for a place and pan to it. */
export function focusPlace(id) {
  const m = markersById[id];
  if (m && map) {
    map.panTo(m.getLatLng());
    m.openPopup();
  }
}
