// Curated London student areas. Coordinates are approximate neighbourhood
// centres used only to centre the map and seed the day-plan route.

/** @type {import("./types.js").Area[]} */
export const AREAS = [
  { id: "bloomsbury", name: "Bloomsbury (UCL)", lat: 51.5246, lng: -0.1340, zoom: 14 },
  { id: "mile-end", name: "Mile End (QMUL)", lat: 51.5240, lng: -0.0410, zoom: 14 },
  { id: "camden", name: "Camden", lat: 51.5390, lng: -0.1426, zoom: 14 },
  { id: "elephant", name: "Elephant & Castle", lat: 51.4946, lng: -0.1000, zoom: 14 },
  { id: "stratford", name: "Stratford", lat: 51.5416, lng: -0.0030, zoom: 14 },
  { id: "holloway", name: "Holloway (London Met)", lat: 51.5530, lng: -0.1130, zoom: 14 },
  { id: "new-cross", name: "New Cross (Goldsmiths)", lat: 51.4760, lng: -0.0330, zoom: 14 },
  { id: "south-ken", name: "South Kensington (Imperial)", lat: 51.4940, lng: -0.1740, zoom: 14 },
  { id: "whitechapel", name: "Whitechapel", lat: 51.5190, lng: -0.0600, zoom: 14 },
  { id: "kings-cross", name: "King's Cross", lat: 51.5308, lng: -0.1238, zoom: 14 },
];

/** @param {string} id */
export function getArea(id) {
  return AREAS.find((a) => a.id === id) || null;
}
