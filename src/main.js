import { initRouter, currentRoute } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderPlan } from "./views/plan.js";
import { renderExplore } from "./views/explore.js";
import { subscribe } from "./state.js";

const root = document.getElementById("app");

function render(route) {
  switch (route) {
    case "plan":
      return renderPlan(root);
    case "explore":
      return renderExplore(root);
    default:
      return renderHome(root);
  }
}

// Re-render the current view when state changes (e.g. reset/edit).
subscribe(() => render(currentRoute()));

initRouter(render);
