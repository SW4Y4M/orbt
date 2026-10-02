// Orbit brand logo as inline SVG (crisp at any size, no external asset).
// Recreates the brand mark: a deep-purple space badge with a glossy "orbt"
// wordmark, an orbit ring, a location pin, and sparkles.

/**
 * Full logo badge (rounded-square, for onboarding / splash).
 * @param {number} size  px
 */
export function logoBadge(size = 96) {
  const wrap = document.createElement("span");
  wrap.className = "logo logo--badge";
  wrap.style.width = wrap.style.height = `${size}px`;
  wrap.setAttribute("aria-label", "Orbit");
  wrap.setAttribute("role", "img");
  wrap.innerHTML = BADGE_SVG;
  return wrap;
}

/**
 * Compact wordmark lockup for the header: badge mark + "orbt" text.
 * @param {number} size  px height of the mark
 */
export function logoLockup(size = 30) {
  const wrap = document.createElement("span");
  wrap.className = "logo logo--lockup";
  wrap.setAttribute("aria-label", "Orbit");
  wrap.setAttribute("role", "img");
  const mark = document.createElement("span");
  mark.className = "logo__mark";
  mark.style.width = mark.style.height = `${size}px`;
  mark.innerHTML = MARK_SVG;
  const word = document.createElement("span");
  word.className = "logo__word";
  word.textContent = "orbt";
  wrap.appendChild(mark);
  wrap.appendChild(word);
  return wrap;
}

// --- SVGs ------------------------------------------------------------------

// Shared defs: gradients + glow for both marks.
const DEFS = `
  <defs>
    <linearGradient id="orb-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4a2f8f"/>
      <stop offset="1" stop-color="#1b1140"/>
    </linearGradient>
    <linearGradient id="orb-word" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#d9ccff"/>
    </linearGradient>
    <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b79bff"/>
      <stop offset="0.5" stop-color="#8f6bff"/>
      <stop offset="1" stop-color="#ffe17a"/>
    </linearGradient>
    <filter id="orb-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

// Full badge (viewBox 100x100).
const BADGE_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}
  <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#orb-bg)"/>
  <!-- sparkles -->
  <g fill="#ffffff" opacity="0.9">
    <path d="M30 24 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z"/>
    <path d="M74 70 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" opacity="0.8"/>
    <circle cx="22" cy="60" r="1"/><circle cx="80" cy="40" r="1"/>
    <circle cx="60" cy="22" r="0.9"/><circle cx="42" cy="78" r="0.9"/>
  </g>
  <!-- orbit ring -->
  <ellipse cx="50" cy="54" rx="38" ry="17" fill="none" stroke="url(#orb-ring)"
    stroke-width="3" transform="rotate(-18 50 54)" filter="url(#orb-glow)"/>
  <!-- location pin on the ring -->
  <g transform="translate(78 30)" filter="url(#orb-glow)">
    <path d="M0 -9 a7 7 0 1 1 -0.01 0 Z M0 -9 C7 -9 7 1 0 9 C-7 1 -7 -9 0 -9Z"
      fill="#c9b6ff"/>
    <circle cx="0" cy="-2" r="2.6" fill="#2a1b5e"/>
  </g>
  <!-- wordmark -->
  <text x="50" y="62" text-anchor="middle" font-family="Nunito, system-ui, sans-serif"
    font-weight="800" font-size="30" fill="url(#orb-word)"
    style="letter-spacing:-1px" filter="url(#orb-glow)">orbt</text>
</svg>`;

// Compact mark for the header (viewBox 100x100, no wordmark text — the lockup
// adds "orbt" alongside it as HTML).
const MARK_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}
  <rect x="6" y="6" width="88" height="88" rx="26" fill="url(#orb-bg)"/>
  <ellipse cx="50" cy="52" rx="34" ry="16" fill="none" stroke="url(#orb-ring)"
    stroke-width="4" transform="rotate(-18 50 52)"/>
  <g transform="translate(74 30)">
    <path d="M0 -10 C8 -10 8 1 0 10 C-8 1 -8 -10 0 -10Z" fill="#c9b6ff"/>
    <circle cx="0" cy="-2" r="3" fill="#2a1b5e"/>
  </g>
  <circle cx="26" cy="66" r="2.4" fill="#ffe17a"/>
  <text x="50" y="60" text-anchor="middle" font-family="Nunito, system-ui, sans-serif"
    font-weight="800" font-size="30" fill="url(#orb-word)" style="letter-spacing:-1px">o</text>
</svg>`;
