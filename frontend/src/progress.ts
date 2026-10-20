// Local progress: XP, the Practice trail, and Fix notes for Coach.
// The backend has no XP or tutorial tables yet (see docs/frontend.md), so this lives in
// localStorage per player until the server owns it. Treat it as a display value, never a reward.
import { useCallback, useEffect, useState } from 'react';

export interface FixNote { id: string; text: string; cardId: string; from: string; at: number }
export interface Progress {
  xpWeek: number; weekStart: number; xpTotal: number;
  cleared: string[]; // trail stop ids
  fixes: FixNote[];
  answered: number; redos: number;
}

export const XP = { answer: 10, redo: 5, feedback: 8, chest: 20 } as const;

const weekStart = (now = new Date()) => {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d.getTime();
};
const empty = (): Progress => ({ xpWeek: 0, weekStart: weekStart(), xpTotal: 0, cleared: [], fixes: [], answered: 0, redos: 0 });
const key = (playerId: string) => `pitch.progress.v1.${playerId}`;

function read(playerId: string): Progress {
  try {
    const raw = localStorage.getItem(key(playerId));
    const value = raw ? { ...empty(), ...(JSON.parse(raw) as Partial<Progress>) } : empty();
    if (value.weekStart !== weekStart()) { value.weekStart = weekStart(); value.xpWeek = 0; }
    return value;
  } catch { return empty(); }
}
function write(playerId: string, value: Progress) {
  try { localStorage.setItem(key(playerId), JSON.stringify(value)); } catch { /* storage blocked: keep in memory */ }
  window.dispatchEvent(new CustomEvent('pitch-progress'));
}

export function useProgress(playerId: string) {
  const [progress, setProgress] = useState(() => read(playerId));
  useEffect(() => {
    const sync = () => setProgress(read(playerId));
    sync();
    window.addEventListener('pitch-progress', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('pitch-progress', sync); window.removeEventListener('storage', sync); };
  }, [playerId]);
  const update = useCallback((change: (p: Progress) => Progress) => {
    const next = change(read(playerId)); write(playerId, next); setProgress(next);
  }, [playerId]);
  const addXp = useCallback((amount: number) => update((p) => ({ ...p, xpWeek: p.xpWeek + amount, xpTotal: p.xpTotal + amount })), [update]);
  const clear = useCallback((stopId: string) => update((p) => (p.cleared.includes(stopId) ? p : { ...p, cleared: [...p.cleared, stopId] })), [update]);
  const addFix = useCallback((note: Omit<FixNote, 'id' | 'at'>) => {
    if (!note.text.trim()) return;
    update((p) => ({ ...p, fixes: [{ ...note, text: note.text.trim(), id: crypto.randomUUID(), at: Date.now() }, ...p.fixes].slice(0, 60) }));
  }, [update]);
  const countAnswer = useCallback((redid: boolean) => update((p) => ({ ...p, answered: p.answered + 1, redos: p.redos + (redid ? 1 : 0) })), [update]);
  return { progress, addXp, clear, addFix, countAnswer };
}

/** Groups similar Fix notes so Coach can show what keeps coming up. Simple word overlap, no AI. */
export function groupFixes(fixes: FixNote[]) {
  const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
  const groups: { text: string; cardId: string; notes: FixNote[] }[] = [];
  for (const note of fixes) {
    const w = words(note.text);
    const match = groups.find((g) => { const gw = words(g.text); let shared = 0; w.forEach((x) => { if (gw.has(x)) shared++; }); return shared >= 2 || g.text.toLowerCase() === note.text.toLowerCase(); });
    if (match) match.notes.push(note); else groups.push({ text: note.text, cardId: note.cardId, notes: [note] });
  }
  return groups.sort((a, b) => b.notes.length - a.notes.length);
}
