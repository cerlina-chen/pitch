import { useState } from 'react';
import { todaysCard } from '../data';
import { HubShell, Icon } from '../ui';
import { WeekList, useWeek } from './Ranks';

export function Home() {
  const { deck, card } = todaysCard();
  const [flipped, setFlipped] = useState(false);
  const week = useWeek();
  const mine = week.rows.find((r) => r.you);

  return (
    <HubShell
      active="home"
      actions={
        <>
          <a href={`#/play?deck=${deck.id}`} className="btn btn--primary"><Icon name="duo" />Play with a partner</a>
          <a href="#/lobby" className="iconbtn" aria-label="Pick a different deck"><Icon name="deck" size={24} /></a>
        </>
      }
    >
      <div className="today">
        <span className="stack" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          <span style={{ background: 'var(--red)', borderRadius: 18, rotate: '-7deg', translate: '-10px 10px' }} />
          <span style={{ background: 'var(--orange)', borderRadius: 18, rotate: '5deg', translate: '9px 6px' }} />
        </span>
        <button className="today__flip" onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Flip the card back' : "Flip today's card"} aria-pressed={flipped}>
          <span className="today__inner" style={{ transform: flipped ? 'rotateY(180deg) rotate(-2deg)' : 'rotate(1.5deg)' }}>
            <span className="today__face today__front"><span className="today__label disp">Today</span></span>
            <span className="today__face today__back">
              <span className="suit" style={{ background: deck.color }} />
              <span className="disp" style={{ marginTop: 28, fontSize: 29, lineHeight: 1.12 }}>{card.q}</span>
              <span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>{deck.name}</span>
            </span>
          </span>
        </button>
      </div>

      <div className="sheet" style={{ width: 300, rotate: '0.8deg' }}>
        <div style={{ padding: '4px 8px 4px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink)' }}>
          <span className="disp" style={{ fontSize: 18 }}>This week</span>
          <a href="#/ranks" aria-label="Open the leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 4, minHeight: 44, padding: '0 10px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {mine ? ordinal(mine.rank) : 'All'}<Icon name="chevron" size={16} />
          </a>
        </div>
        <WeekList rows={week.rows.slice(0, 5)} loading={week.loading} />
      </div>
    </HubShell>
  );
}

export const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
