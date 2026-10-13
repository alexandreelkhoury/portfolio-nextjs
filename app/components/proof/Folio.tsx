'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from './content';
import s from './site.module.css';

/*
 * The margin folio is the navigation: chapter number and title, updating as the
 * chapters pass, each one a link. Desktop: a column of numerals in the left margin.
 * Narrow screens: a running foot at the bottom left that opens the contents.
 * Hidden on the title page, which carries its own folio.
 */
export default function Folio() {
  const [active, setActive] = useState(-1);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const line = vh * 0.5;
      let a = -1;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= line) a = i;
      });
      setActive(a);
      const narrow = window.matchMedia('(max-width: 1099px)').matches;
      const probe = narrow ? vh - 28 : line;
      let d = false;
      document.querySelectorAll<HTMLElement>('[data-ground="dark"]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top + vh * 0.12 < probe && r.bottom > probe) d = true;
      });
      setDark(d);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDoc = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [open]);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y = el.getBoundingClientRect().top + window.scrollY - (id === 'ch-1' ? 0 : window.innerHeight * 0.02);
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
    setOpen(false);
  };

  const cur = active >= 0 ? CHAPTERS[active] : null;

  return (
    <nav
      ref={rootRef}
      className={s.folio}
      aria-label="Chapters"
      data-visible={active >= 0 ? 'true' : 'false'}
      data-dark={dark ? 'true' : 'false'}
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        className={s.folioFoot}
        aria-expanded={open}
        aria-controls="folio-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={s.folioNum}>{cur?.num ?? 'I'}</span>
        <span className={s.folioFootTitle}>{cur?.title ?? CHAPTERS[0].title}</span>
        <span className={s.folioFootHint} aria-hidden="true">
          {open ? 'Close' : 'Contents'}
        </span>
      </button>
      <ol id="folio-list" className={s.folioList}>
        {CHAPTERS.map((c, i) => (
          <li key={c.id} data-active={i === active ? 'true' : 'false'}>
            <a href={`#${c.id}`} onClick={jump(c.id)} aria-current={i === active ? 'true' : undefined}>
              <span className={s.folioNum}>{c.num}</span>
              <span className={s.folioTitle}>{c.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
