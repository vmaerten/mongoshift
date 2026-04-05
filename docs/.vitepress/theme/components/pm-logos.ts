import type { PmChoice } from "./pm-state.js";

/**
 * Minimal, brand-colored SVG marks for each package manager.
 * All 16x16, monochrome-per-brand. Rendered via v-html in PmCommand.
 */
export const PM_LOGOS: Record<PmChoice, string> = {
  pnpm: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="0" y="0" width="4.5" height="4.5" fill="#F9AD00"/>
    <rect x="5.75" y="0" width="4.5" height="4.5" fill="#F9AD00"/>
    <rect x="11.5" y="0" width="4.5" height="4.5" fill="#F9AD00"/>
    <rect x="5.75" y="5.75" width="4.5" height="4.5" fill="#F9AD00"/>
    <rect x="11.5" y="5.75" width="4.5" height="4.5" fill="#F9AD00"/>
    <rect x="11.5" y="11.5" width="4.5" height="4.5" fill="#F9AD00"/>
  </svg>`,

  npm: `<svg width="16" height="16" viewBox="0 0 27 27" fill="none" aria-hidden="true">
    <rect width="27" height="27" fill="#CB3837"/>
    <path d="M4.5 22.5h9V9h4.5v13.5h4.5V4.5h-18v18z" fill="#fff"/>
  </svg>`,

  yarn: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#2C8EBB"/>
    <path d="M4.2 3.6l1.6 2.1 1.2-.4 1.2.4 1.6-2.1.9.2-.5 2.4c.9.9 1.4 2.1 1.4 3.4 0 2.5-2 4.6-4.6 4.6S2.4 11.6 2.4 9c0-1.3.5-2.5 1.4-3.4l-.5-2.4.9-.2z" fill="#fff"/>
  </svg>`,

  bun: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <ellipse cx="8" cy="9" rx="7.5" ry="6" fill="#FBF0DF" stroke="#3B3738" stroke-width="0.6"/>
    <ellipse cx="5.5" cy="8.5" rx="0.8" ry="1.1" fill="#3B3738"/>
    <ellipse cx="10.5" cy="8.5" rx="0.8" ry="1.1" fill="#3B3738"/>
    <path d="M6.5 11.5 Q8 12.5 9.5 11.5" stroke="#CC8A5C" stroke-width="0.7" stroke-linecap="round" fill="none"/>
  </svg>`,
};
