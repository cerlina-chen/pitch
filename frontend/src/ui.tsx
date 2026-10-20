import { useEffect, useState, type ReactNode } from 'react';
import { initials, useMe } from './session';
import { useProgress } from './progress';
import { useStreak } from './hooks';

const PATHS = {
  play: 'M4 8h11v12H4zM9 4h11v12h-3',
  practice: 'M5 20c0-4 13-3 13-8S7 8 7 4M7 4h7l-2 2.5 2 2.5H7',
  coach: 'M4 5h16v11H10l-5 4v-4H4zM12 8v5M9.5 10.5h5',
  ranks: 'M3 20h18M5 20v-6h4v6M10 20V8h4v12M15 20v-9h4v9',
  close: 'M6 6l12 12M18 6L6 18',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  redo: 'M4 12a8 8 0 1 0 3-6.3M4 4v5h5',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  deck: 'M4 6h11v15H4zM8 3h10a2 2 0 0 1 2 2v13',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  lock: 'M8 11V8a4 4 0 0 1 8 0v3M6 11h12v9H6z',
  chest: 'M3 10h18v10H3zM3 10l2-5h14l2 5M12 10v4',
  duo: 'M2.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M4.5 8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0zM13.5 9.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM15.5 15c2.6 0 4.6 1.3 5.5 4',
  chevron: 'M9 5l7 7-7 7',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2',
  thumbUp: 'M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 6.5A2 2 0 0 1 17.3 20H7',
  thumbDown: 'M7 13V4H4v9zM7 13l4 8c1.5 0 2.5-1 2.5-2.5V15h5a2 2 0 0 0 2-2.3l-1.2-6.5A2 2 0 0 0 17.3 4H7',
  plus: 'M12 5v14M5 12h14',
  out: 'M10 5H5v14h5M14 8l4 4-4 4M18 12H9',
  target: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
} as const;
export type IconName = keyof typeof PATHS | 'playFill' | 'spark';

export function Icon({ name, size = 22, color = 'var(--ink)', label }: { name: IconName; size?: number; color?: string; label?: string }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  if (name === 'playFill') return <svg width={size} height={size} viewBox="0 0 24 24" {...a11y}><path d="M7 4l13 8-13 8z" fill={color} /></svg>;
  if (name === 'spark') return <svg width={size} height={size} viewBox="0 0 24 24" {...a11y}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={color} /></svg>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...a11y}>
      <path d={PATHS[name]} fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type Tab = 'home' | 'practice' | 'coach' | 'ranks' | 'account' | null;
const TABS: { id: Exclude<Tab, 'account' | null>; label: string; icon: IconName; href: string }[] = [
  { id: 'home', label: 'Play', icon: 'play', href: '#/' },
  { id: 'practice', label: 'Practice', icon: 'practice', href: '#/practice' },
  { id: 'coach', label: 'Coach', icon: 'coach', href: '#/coach' },
  { id: 'ranks', label: 'Ranks', icon: 'ranks', href: '#/ranks' },
];

function NavLinks({ active }: { active: Tab }) {
  return (
    <>
      {TABS.map((t) => (
        <a key={t.id} href={t.href} className="nav__link" aria-current={active === t.id ? 'page' : undefined}>
          <Icon name={t.icon} size={20} color={active === t.id ? 'var(--ink)' : '#fff'} />
          {t.label}
        </a>
      ))}
    </>
  );
}

/** Hub screens: nav on top (bottom tab bar on phones). */
export function HubShell({ active, children, actions, tableClass = '' }: { active: Tab; children: ReactNode; actions?: ReactNode; tableClass?: string }) {
  const me = useMe();
  const { progress } = useProgress(me.player.id);
  const streak = useStreak();
  return (
    <div className="frame">
      <header className="topbar">
        <a href="#/" className="topbar__logo disp" style={{ color: '#fff' }}>Pitch</a>
        <nav className="nav" aria-label="Main"><NavLinks active={active} /></nav>
        <div className="topbar__right">
          <span className="stat" aria-label={`${streak ?? 0} day streak`}><span className="stamp" />{streak ?? '–'}</span>
          <span className="stat" aria-label={`${progress.xpWeek} XP this week`}><span className="coin" />{progress.xpWeek}</span>
          <a href="#/account" className="avatar-link" aria-label="Your account" aria-current={active === 'account' ? 'page' : undefined}>{initials(me.player.name)}</a>
        </div>
      </header>
      <main id="main" className={`table ${tableClass}`}>{children}</main>
      <div className="actionbar">{actions}</div>
      <nav className="tabbar" aria-label="Main"><NavLinks active={active} /></nav>
    </div>
  );
}

/** In-match screens: no nav, just progress and a way out. */
export function MatchShell({ children, actions, step, steps, onLeave, onReport }: {
  children: ReactNode; actions?: ReactNode; step?: number; steps?: number; onLeave: () => void; onReport?: () => void;
}) {
  return (
    <div className="frame">
      <header className="topbar">
        <span className="topbar__logo disp">Pitch</span>
        {steps ? (
          <div className="pips" role="img" aria-label={`Card ${step} of ${steps}`}>
            {Array.from({ length: steps }, (_, i) => <span key={i} className={`pip ${i < (step ?? 0) ? 'pip--on' : ''}`} />)}
          </div>
        ) : <span />}
        <div className="topbar__right">
          {onReport && <button className="iconbtn iconbtn--sq" onClick={onReport} aria-label="Report"><Icon name="flag" size={18} /></button>}
          <button className="iconbtn iconbtn--sq" onClick={onLeave} aria-label="Leave"><Icon name="close" size={18} /></button>
        </div>
      </header>
      <main id="main" className="table">{children}</main>
      <div className="actionbar">{actions}</div>
    </div>
  );
}

export function QuestionCard({ q, color, deckName, small, corner }: { q: string; color: string; deckName?: string; small?: boolean; corner?: ReactNode }) {
  return (
    <div className={`qcard ${small ? 'qcard--sm' : ''}`}>
      <div className="qcard__top"><span className="suit" style={{ background: color }} />{corner}</div>
      <p className="qcard__q disp">{q}</p>
      {deckName && <span className="qcard__deck">{deckName}</span>}
    </div>
  );
}

export function Timer({ seconds, guide = 120 }: { seconds: number; guide?: number }) {
  const c = 2 * Math.PI * 21, frac = Math.min(1, seconds / guide);
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} of about ${guide / 60} minutes`;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={label}>
      <circle cx="26" cy="26" r="21" fill="none" stroke="#D3C9BF" strokeWidth="6" />
      <circle cx="26" cy="26" r="21" fill="none" stroke={seconds > guide ? 'var(--red)' : 'var(--yellow)'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(frac * c).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 26 26)" />
    </svg>
  );
}

export function useSeconds(running: boolean, resetKey: unknown) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { setSeconds(0); }, [resetKey]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, resetKey]);
  return seconds;
}

export const TOKEN_COLORS = ['#FFD23F', '#F2453D', '#2EC4E6', '#FF9F1C', '#FF8FC7'];

export function Tokens({ labels, on, onToggle, missedStyle, label }: {
  labels: string[]; on: boolean[]; onToggle?: (i: number) => void; missedStyle?: boolean; label: string;
}) {
  return (
    <div className="tokens" role="group" aria-label={label}>
      {labels.map((text, i) => {
        const ticked = on[i];
        const readonly = !onToggle;
        const cls = `token ${readonly ? 'token--readonly' : ''} ${readonly && missedStyle && !ticked ? 'token--missed' : ''}`;
        const dot = <span className="token__dot" style={{ background: ticked ? TOKEN_COLORS[i % 5] : 'transparent' }}>{ticked && <Icon name="check" size={18} />}</span>;
        return readonly
          ? <span key={text} className={cls} role="img" aria-label={`${text}: ${ticked ? 'heard' : 'missed'}`}>{dot}{text}</span>
          : <button key={text} className={cls} aria-pressed={ticked} onClick={() => onToggle(i)}>{dot}{text}</button>;
      })}
    </div>
  );
}

export function PlayerPanel({ name, ini, color, status, position, active, demo }: {
  name: string; ini: string; color: string; status: string; position: 'top' | 'bottom'; active?: boolean; demo?: boolean;
}) {
  return (
    <div className={`panel panel--${position} ${active ? 'panel--active' : ''}`}>
      <span className="tile" style={{ background: color }}>{ini}</span>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="panel__name">{name}{demo && <span className="tag">Demo</span>}</span>
        <span className="panel__status" aria-live="polite">{status}</span>
      </span>
    </div>
  );
}

export function Waiting({ text }: { text: string }) {
  return <div className="waiting" role="status"><div className="dots" aria-hidden="true"><span /><span /><span /></div>{text}</div>;
}
