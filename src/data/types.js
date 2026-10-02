// Orbit data typedefs (JSDoc stands in for TS interfaces in this
// dependency-free build).

/** @typedef {"cheap"|"mid"|"premium"} BudgetTier */
/** @typedef {"low"|"medium"|"high"} Energy */
/** @typedef {"unidays"|"studentbeans"|"direct"} DiscountProvider */
/** @typedef {"phone"|"transport"|"room"|"kitchen"|"money"|"explore"} CategoryId */

/**
 * @typedef {Object} Area
 * @property {string} id
 * @property {string} name   e.g. "Mile End (QMUL)"
 * @property {number} lat
 * @property {number} lng
 * @property {number} zoom
 */

/**
 * @typedef {Object} CategoryDef
 * @property {CategoryId} id
 * @property {string} name
 * @property {string} icon      emoji
 * @property {string} blurb
 * @property {number} priority  journey order; lower = more urgent
 * @property {boolean} [isReward]
 * @property {boolean} [isFood]
 */

/**
 * @typedef {Object} Discount
 * @property {DiscountProvider} provider
 * @property {string} offer        e.g. "20% off"
 * @property {string} note         how to redeem
 * @property {string} url
 * @property {string} lastChecked  ISO date
 */

/**
 * @typedef {Object} Place
 * @property {string} id
 * @property {string} name
 * @property {CategoryId[]} categoryIds
 * @property {BudgetTier[]} tiers
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 * @property {string} note
 * @property {number} costEstimate     rough £ for a typical visit
 * @property {number} timeEstimateMin  rough minutes to spend
 * @property {boolean} [isFoodSpot]
 * @property {Discount} [discount]
 */

/**
 * @typedef {Object} PlanStop
 * @property {Place} place
 * @property {CategoryId} categoryId
 * @property {string} reason
 * @property {number} order
 */

/**
 * @typedef {Object} Plan
 * @property {string} areaId
 * @property {BudgetTier} tier
 * @property {Energy} energy
 * @property {PlanStop[]} stops
 * @property {number} estSpend
 * @property {number} estSavings
 * @property {string} generatedAt
 */

export {};
