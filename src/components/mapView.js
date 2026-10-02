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
    map = L.map(container, { zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
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
    const icon = opts.numbered
      ? L.divIcon({
          className: "pin pin--num",
          html: `<span>${order}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
      : L.divIcon({
          className: "pin",
          html: "<span>●</span>",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
    const m = L.marker([place.lat, place.lng], { icon }).addTo(markerLayer);
    const offer = place.discount ? `<br><em>${place.discount.offer}</em>` : "";
    m.bindPopup(`<strong>${place.name}</strong><br>${place.note}${offer}`);
    if (opts.onSelect) m.on("click", () => opts.onSelect(place.id));
    markersById[place.id] = m;
    latlngs.push([place.lat, place.lng]);
  });

  if (opts.numbered && latlngs.length > 1) {
    L.polyline(latlngs, {
      color: "#2b6cff",
      weight: 3,
      opacity: 0.6,
      dashArray: "2 8",
      lineCap: "round",
    }).addTo(routeLayer);
  }

  if (latlngs.length) {
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds.pad(0.25), { maxZoom: 15 });
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
