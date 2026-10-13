import type { ReactNode } from 'react';
import s from './site.module.css';

/** A formula set in the text. Hover or focus it and a margin note appears beside it. */
export default function Formula({ children, note, side = 'right' }: { children: ReactNode; note: string; side?: 'right' | 'left' | 'below' }) {
  return (
    <span className={s.formula} data-side={side}>
      <button type="button" className={s.formulaBtn} aria-describedby={undefined}>
        {children}
      </button>
      <span className={s.formulaNote} role="note">
        <svg className={s.formulaArrow} viewBox="0 0 60 30" fill="none" aria-hidden="true">
          <path d="M56 6 C 40 4, 22 10, 8 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6 12 L 7 23 L 17 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {note}
      </span>
    </span>
  );
}
