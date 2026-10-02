// The 6 journey-ordered categories. `priority` drives plan ordering
// (lower = more urgent). `isFood` / `isReward` flag the categories the planner
// uses to guarantee a lunch stop and an "explore" reward stop.

/** @type {import("./types.js").CategoryDef[]} */
export const CATEGORIES = [
  {
    id: "phone",
    name: "Phone & connectivity",
    icon: "📱",
    blurb: "Get a UK SIM and data so you can navigate and stay in touch.",
    priority: 1,
  },
  {
    id: "transport",
    name: "Getting around",
    icon: "🚇",
    blurb: "Student Oyster, a railcard, or a bike — the big daily money-saver.",
    priority: 2,
  },
  {
    id: "room",
    name: "Room & bedding",
    icon: "🛏️",
    blurb: "Duvet, pillows, towels, lamp, hangers, storage — make the room livable.",
    priority: 3,
  },
  {
    id: "kitchen",
    name: "Kitchen & food",
    icon: "🍳",
    blurb: "Your first big shop plus pots, pans, plates and cleaning basics.",
    priority: 4,
    isFood: true,
  },
  {
    id: "money",
    name: "Money & banking",
    icon: "💳",
    blurb: "A UK account or Monzo/Revolut so you stop bleeding FX fees.",
    priority: 5,
  },
  {
    id: "explore",
    name: "Explore London",
    icon: "🎡",
    blurb: "Free museums, markets, parks and cheap eats — enjoy the city.",
    priority: 6,
    isReward: true,
  },
];

/** @param {string} id */
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
