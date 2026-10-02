// Tiny hash-based view switcher. No dependencies.

/** @type {(route: string) => void} */
let onChange = () => {};

const VALID = new Set(["home", "plan", "explore"]);

export function currentRoute() {
  const r = (location.hash || "#home").slice(1);
  return VALID.has(r) ? r : "home";
}

export function navigate(route) {
  if (!VALID.has(route)) route = "home";
  if (currentRoute() === route) {
    onChange(route); // force re-render even if hash is unchanged
  } else {
    location.hash = route;
  }
}

export function initRouter(handler) {
  onChange = handler;
  window.addEventListener("hashchange", () => onChange(currentRoute()));
  onChange(currentRoute());
}
