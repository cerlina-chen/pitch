import { useEffect, useState } from 'react';
import { SECTIONS, TRAIL } from '../data';
import { useProgress } from '../progress';
import { useMe } from '../session';
import { HubShell, Icon } from '../ui';

function useNarrow() {
  const query = '(max-width: 900px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
}

export function usePracticeState() {
  const me = useMe();
  const { progress } = useProgress(me.player.id);
  const current = TRAIL.findIndex((s) => !progress.cleared.includes(s.id));
  return { current: current === -1 ? TRAIL.length : current, progress };
}

export function Practice() {
  const { current } = usePracticeState();
  const narrow = useNarrow();
  const [sel, setSel] = useState<string | null>(null);

  const pts = TRAIL.map((s, i) => (narrow ? { x: i % 2 ? 70 : 30, y: 6 + (i * 88) / (TRAIL.length - 1) } : { x: s.x, y: s.y }));
  const seg = (i: number) => {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    return ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  };
  let all = `M${pts[0].x} ${pts[0].y}`, done = all;
  for (let i = 0; i < pts.length - 1; i++) { const s = seg(i); all += s; if (i < current) done += s; }

  const next = TRAIL[current];
  const selected = TRAIL.findIndex((s) => s.id === sel);

  return (
    <HubShell
      active="practice"
      tableClass="table--trail"
      actions={next
        ? <a className="btn btn--primary" href={`#/stop/${next.id}`}><Icon name="playFill" size={20} />{current < 3 ? 'Continue tutorial' : 'Continue'}</a>
        : <a className="btn btn--primary" href="#/play"><Icon name="duo" />Play with a partner</a>}
    >
      <div className="trail">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <path d={all} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 15" vectorEffect="non-scaling-stroke" />
          <path d={done} fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {!narrow && SECTIONS.map((s) => (
          <span key={s.name} className="trail__sticker disp" style={{ left: `${s.x}%`, top: `${s.y}%`, background: s.color, rotate: s.x > 60 ? '-3deg' : '3deg' }}>{s.name}</span>
        ))}

        {TRAIL.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'locked';
          const size = state === 'now' ? 88 : s.kind === 'mock' ? 78 : state === 'locked' ? 58 : 66;
          const round = s.kind !== 'chest' && s.kind !== 'mock';
          const bg = state === 'now' ? 'var(--yellow)' : state === 'done' ? '#fff' : round ? 'rgba(255,255,255,0.6)' : s.color;
          const icon = state === 'done' ? 'check' : state === 'now' ? 'playFill' : s.kind === 'chest' ? 'chest' : s.kind === 'mock' ? 'duo' : 'lock';
          return (
            <button
              key={s.id}
              className="trail__node"
              aria-label={`${s.title}, ${state === 'done' ? 'done' : state === 'now' ? 'up next' : 'locked'}`}
              aria-expanded={sel === s.id}
              onClick={() => setSel(sel === s.id ? null : s.id)}
              style={{
                left: `${pts[i].x}%`, top: `${pts[i].y}%`, width: size, height: size, background: bg,
                borderRadius: round ? '50%' : 18, borderStyle: state === 'locked' ? 'dashed' : 'solid', borderWidth: state === 'locked' ? 2 : 3,
                boxShadow: state === 'locked' && sel !== s.id ? 'none' : state === 'now' || sel === s.id ? '5px 5px 0 var(--ink)' : undefined,
                rotate: round ? undefined : `${i % 2 ? 4 : -4}deg`,
              }}
            >
              {state === 'now' && <span className="pulse" style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '3px solid var(--yellow)', pointerEvents: 'none' }} />}
              <Icon name={icon} size={state === 'now' ? 34 : 24} />
              {state === 'locked' && round && <span style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--ink)', background: s.color }} />}
            </button>
          );
        })}

        {selected >= 0 && (() => {
          const s = TRAIL[selected], p = pts[selected];
          const locked = selected > current;
          return (
            <div className="pop" style={{ left: `clamp(16px, calc(${p.x}% - 135px), calc(100% - 286px))`, top: p.y > 45 ? `calc(${p.y}% - 220px)` : `calc(${p.y}% + 62px)` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
                <span style={{ width: 16, height: 16, borderRadius: 5, border: '2px solid var(--ink)', background: s.color }} />{s.section}
              </span>
              <span className="disp" style={{ fontSize: 20, lineHeight: 1.15 }}>{s.title}</span>
              {locked
                ? <span className="btn btn--sm" style={{ borderStyle: 'dashed' }}><Icon name="lock" size={18} />Locked</span>
                : <a className="btn btn--primary btn--sm" href={s.kind === 'mock' ? '#/play' : `#/stop/${s.id}`}>{selected < current ? 'Replay' : 'Start'}</a>}
            </div>
          );
        })()}
      </div>
    </HubShell>
  );
}
