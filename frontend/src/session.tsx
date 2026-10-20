import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PitchApi, PitchApiError, type PitchMe, type Signup } from '../../client/pitch-api';

const TOKEN_KEY = 'pitch.token';

interface SessionValue {
  api: PitchApi;
  me: PitchMe | null;
  booting: boolean;
  offline: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (details: Signup) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const api = useMemo(() => new PitchApi(import.meta.env.VITE_API_ORIGIN ?? ''), []);
  const [me, setMe] = useState<PitchMe | null>(null);
  const [booting, setBooting] = useState(true);
  const [offline, setOffline] = useState<string | null>(null);

  const saveToken = (token: string | null) => {
    try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  };

  const refresh = useCallback(async () => {
    if (!api.token) { setMe(null); return; }
    try { setMe(await api.me()); }
    catch (error) {
      if (error instanceof PitchApiError && error.status === 401) { saveToken(null); setMe(null); }
      else throw error;
    }
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        await api.config();
        try { api.token = localStorage.getItem(TOKEN_KEY); } catch { api.token = null; }
        await refresh();
      } catch (error) {
        setOffline(error instanceof Error ? error.message : 'The server is not reachable.');
      } finally { setBooting(false); }
    })();
  }, [api, refresh]);

  const value: SessionValue = {
    api, me, booting, offline, refresh,
    login: async (email, password) => { const s = await api.login(email, password); saveToken(s.token); await refresh(); },
    signup: async (details) => { const s = await api.signup(details); saveToken(s.token); await refresh(); },
    logout: async () => { try { await api.logout(); } finally { saveToken(null); setMe(null); } },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}

/** Signed-in screens only. */
export function useMe() {
  const { me } = useSession();
  if (!me) throw new Error('Not signed in');
  return me;
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
export const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong. Try again.');
