import { useEffect, useMemo, useState } from 'react';
import type { PitchLeaderboard } from '../../../client/pitch-api';
import { initials, useMe, useSession } from '../session';
import { HubShell, Icon, TOKEN_COLORS } from '../ui';

export interface WeekRow { id: string; rank: number; name: string; ini: string; count: number; color: string; you: boolean }

// Ranked by rounds played this week, not by rating. Skill stays private; showing up is what's public.
export function useWeek(scope: 'all' | 'friends' = 'all') {
  const { api } = useSession();
  const me = useMe();
  const [board, setBoard] = useState<PitchLeaderboard | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    api.leaderboard().then((b) => { if (live) setBoard(b); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [api]);
  useEffect(() => {
    if (scope !== 'friends' || friendIds) return;
    api.friends().then((f) => setFriendIds(new Set(f.friends.filter((x) => x.friendship === 'friends').map((x) => x.player.id)))).catch(() => setFriendIds(new Set()));
  }, [api, scope, friendIds]);

  const rows = useMemo<WeekRow[]>(() => {
    if (!board) return [];
    let players = board.players.filter((p) => p.weeklyGames > 0 || p.playerId === me.player.id);
    if (scope === 'friends') players = players.filter((p) => p.playerId === me.player.id || friendIds?.has(p.playerId));
    if (!players.some((p) => p.playerId === me.player.id)) players.push({ playerId: me.player.id, name: me.player.name, rating: 0, games: 0, weeklyGain: 0, weeklyGames: 0 });
    return [...players]
      .sort((a, b) => b.weeklyGames - a.weeklyGames || a.name.localeCompare(b.name))
      .map((p, i) => ({ id: p.playerId, rank: i + 1, name: p.playerId === me.player.id ? 'You' : p.name, ini: initials(p.name), count: p.weeklyGames, color: TOKEN_COLORS[i % 5], you: p.playerId === me.player.id }));
  }, [board, friendIds, me, scope]);

  const resetsIn = board ? Math.max(1, Math.ceil((board.weekStartsAt + 7 * 86_400_000 - Date.now()) / 86_400_000)) : null;
  return { rows, loading: !board && !error, error, resetsIn };
}

export function WeekList({ rows, loading }: { rows: WeekRow[]; loading: boolean }) {
  if (loading) return <p style={{ padding: '14px 18px', margin: 0, fontWeight: 700 }}>Loading…</p>;
  return (
    <ol className="rows">
      {rows.map((r) => (
        <li key={r.id} className={`row ${r.you ? 'row--you' : ''}`}>
          <span className="row__rank disp">{r.rank}</span>
          <span className="mini-tile" style={{ background: r.color }}>{r.ini}</span>
          <span className="row__name">{r.name}</span>
          <span aria-label={`${r.count} rounds`}>{r.count}</span>
        </li>
      ))}
    </ol>
  );
}

const HEIGHT: Record<number, number> = { 1: 200, 2: 150, 3: 110 };
const BLOCK: Record<number, string> = { 1: 'var(--yellow)', 2: '#fff', 3: 'var(--orange)' };

export function Ranks() {
  const [scope, setScope] = useState<'all' | 'friends'>('all');
  const week = useWeek(scope);
  const top = week.rows.slice(0, 3);
  const podium = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <HubShell active="ranks" actions={<a href="#/play" className="btn btn--primary"><Icon name="duo" />Play with a partner</a>}>
      {podium.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }} aria-label="Top three this week" role="group">
          {podium.map((p) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span className="tile" style={{ width: 64, height: 64, borderRadius: 18, fontSize: 18, background: p.color, boxShadow: p.you ? '0 0 0 4px #fff' : 'var(--shadow-sm)' }}>{p.ini}</span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <strong>{p.name}</strong><span style={{ fontSize: 14, fontWeight: 700 }}>{p.count} rounds</span>
              </span>
              <span style={{ width: 130, height: HEIGHT[p.rank], borderRadius: '14px 14px 0 0', border: '2px solid var(--ink)', borderBottomWidth: 4, background: BLOCK[p.rank], display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                <span className="disp" style={{ fontSize: 40 }}>{p.rank}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: 380, maxWidth: '100%' }}>
        <div className="foldtabs" role="tablist" aria-label="Leaderboard">
          <button role="tab" className="foldtab" aria-selected={scope === 'all'} onClick={() => setScope('all')}>Everyone</button>
          <button role="tab" className="foldtab" aria-selected={scope === 'friends'} onClick={() => setScope('friends')}>Friends</button>
        </div>
        <div className="sheet" role="tabpanel">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '2px solid var(--ink)', fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            <span>This week</span><span>Rounds</span>
          </div>
          {week.error ? <p style={{ padding: '14px 18px', margin: 0 }}>Couldn't load the board.</p> : <WeekList rows={week.rows.slice(0, 10)} loading={week.loading} />}
          {week.resetsIn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderTop: '2px solid var(--ink)', fontSize: 14, fontWeight: 700, background: 'var(--paper)' }}>
              <Icon name="clock" size={18} />Resets in {week.resetsIn} day{week.resetsIn > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </HubShell>
  );
}
