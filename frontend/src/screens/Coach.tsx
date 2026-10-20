import { useState } from 'react';
import { findCard } from '../data';
import { groupFixes, useProgress } from '../progress';
import { useMe } from '../session';
import { HubShell, Icon, QuestionCard, TOKEN_COLORS } from '../ui';

// Coach turns the Fix notes your partners left into targeted drills.
// It does not generate feedback with AI: it only regroups what real partners wrote.
export function Coach() {
  const me = useMe();
  const { progress } = useProgress(me.player.id);
  const groups = groupFixes(progress.fixes).slice(0, 3);
  const [pick, setPick] = useState(0);
  const current = groups[Math.min(pick, groups.length - 1)];

  if (!current) {
    return (
      <HubShell active="coach" actions={<a className="btn btn--primary" href="#/play"><Icon name="duo" />Play with a partner</a>}>
        <div className="empty">
          <span className="sticky sticky--fix" style={{ width: 200, minHeight: 120, rotate: '-3deg' }}><span className="sticky__title">Fix</span>…</span>
          <span className="disp">Nothing to drill yet</span>
          <span>Play a round with a partner. The Fix notes they leave you show up here.</span>
        </div>
      </HubShell>
    );
  }

  const { deck, card } = findCard(current.cardId);
  return (
    <HubShell active="coach" actions={<a className="btn btn--primary" href={`#/drill/${card.id}?focus=${encodeURIComponent(current.text)}`}><Icon name="spark" size={20} />Drill this</a>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} role="radiogroup" aria-label="Fixes from your partners">
        {groups.map((g, i) => {
          const on = g === current;
          return (
            <button
              key={g.text} role="radio" aria-checked={on} onClick={() => setPick(i)}
              className="sticky sticky--fix"
              style={{ width: 280, alignItems: 'flex-start', textAlign: 'left', rotate: `${[-2, 1.5, -1][i]}deg`, borderWidth: on ? 3 : 2, boxShadow: on ? 'var(--shadow-lg)' : 'var(--shadow-sm)', translate: on ? '14px 0' : undefined, transition: 'translate .15s' }}
            >
              <span className="sticky__title" style={{ fontSize: 14 }}>Fix</span>
              <strong>{g.text}</strong>
              <span style={{ display: 'flex', gap: 6 }} aria-label={`From ${g.notes.length} round${g.notes.length > 1 ? 's' : ''}`} role="img">
                {g.notes.slice(0, 5).map((n, j) => <span key={n.id} className="mini-tile" style={{ width: 22, height: 22, borderRadius: 7, background: TOKEN_COLORS[(j + 3) % 5] }} />)}
              </span>
            </button>
          );
        })}
      </div>
      <QuestionCard q={card.q} color={deck.color} corner={<span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="target" size={14} />Drill</span>} deckName={deck.name} />
    </HubShell>
  );
}
