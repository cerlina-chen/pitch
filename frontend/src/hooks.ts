import { useEffect, useState } from 'react';
import type { FullPlayerProfile } from '../../client/pitch-api';
import { useSession } from './session';

/** Hash routes keep the static build working on any host. */
export function useRoute() {
  const read = () => (window.location.hash.replace(/^#/, '') || '/').split('?')[0];
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => { setPath(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
export const go = (path: string) => { window.location.hash = path; };

let profileCache: { id: string; at: number; value: FullPlayerProfile } | null = null;

export function useProfile() {
  const { api, me } = useSession();
  const [profile, setProfile] = useState<FullPlayerProfile | null>(profileCache && profileCache.id === me?.player.id ? profileCache.value : null);
  useEffect(() => {
    if (!me) return;
    if (profileCache && profileCache.id === me.player.id && Date.now() - profileCache.at < 30_000) { setProfile(profileCache.value); return; }
    let live = true;
    api.playerProfile(me.player.id).then((value) => {
      profileCache = { id: me.player.id, at: Date.now(), value };
      if (live) setProfile(value);
    }).catch(() => { /* the header just shows a dash */ });
    return () => { live = false; };
  }, [api, me]);
  return profile;
}

export const useStreak = () => useProfile()?.streak ?? null;
