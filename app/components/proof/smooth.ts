import type Lenis from 'lenis';

/*
 * The one Lenis instance, when smooth scrolling is on (fine pointer, motion allowed).
 * Navigation goes through scrollToId so it uses Lenis when present and native scroll otherwise.
 */
let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6 });
    return;
  }
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}
