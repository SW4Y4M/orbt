// Geo helpers: distance + a greedy nearest-neighbour route ordering. Good
// enough for a handful of stops and keeps the mapped route from zig-zagging.

const R = 6371; // km

/** @param {number} deg */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance in km between two {lat,lng} points.
 * @param {{lat:number,lng:number}} a
 * @param {{lat:number,lng:number}} b
 */
export function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Order points greedily from a start point by always hopping to the nearest
 * unvisited point. Returns a new array of the input items in visiting order.
 * @template {{lat:number,lng:number}} T
 * @param {{lat:number,lng:number}} start
 * @param {T[]} items
 * @returns {T[]}
 */
export function nearestNeighbourOrder(start, items) {
  const remaining = items.slice();
  const ordered = [];
  let current = start;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    current = next;
  }
  return ordered;
}
