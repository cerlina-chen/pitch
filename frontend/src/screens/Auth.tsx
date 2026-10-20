import { useState, type FormEvent } from 'react';
import { errorText, useSession } from '../session';

export function Auth() {
  const { login, signup } = useSession();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    setBusy(true); setError(null);
    try {
      if (mode === 'in') await login(get('email'), String(f.get('password') ?? ''));
      else await signup({ name: get('name'), email: get('email'), password: String(f.get('password') ?? ''), birthDate: get('birthDate'), acceptedConduct: true });
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="frame">
      <header className="topbar"><span className="topbar__logo disp" style={{ color: '#fff' }}>Pitch</span></header>
      <main id="main" className="table">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="foldtabs" role="tablist" aria-label="Account">
            <button role="tab" className="foldtab" aria-selected={mode === 'in'} onClick={() => { setMode('in'); setError(null); }}>Sign in</button>
            <button role="tab" className="foldtab" aria-selected={mode === 'up'} onClick={() => { setMode('up'); setError(null); }}>New here</button>
          </div>
          <form className="auth" onSubmit={submit} style={{ rotate: '-0.6deg' }}>
            <h1 className="disp" style={{ margin: 0, fontSize: 28 }}>{mode === 'in' ? 'Welcome back' : 'Take a seat'}</h1>
            {mode === 'up' && <label className="field">Name<input name="name" autoComplete="name" required maxLength={40} /></label>}
            <label className="field">Email<input name="email" type="email" autoComplete="email" required /></label>
            <label className="field">Password<input name="password" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={mode === 'up' ? 8 : 1} /></label>
            {mode === 'up' && (
              <>
                <label className="field">Birth date<input name="birthDate" type="date" required /></label>
                <label className="check"><input type="checkbox" required />I'll keep feedback kind and specific, and I won't share anything from someone else's round.</label>
              </>
            )}
            {error && <p className="error-note" role="alert" style={{ margin: 0 }}>{error}</p>}
            <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'One sec…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
          </form>
        </div>
      </main>
      <div className="actionbar" />
    </div>
  );
}

export function Offline({ message }: { message: string }) {
  return (
    <div className="frame">
      <header className="topbar"><span className="topbar__logo disp" style={{ color: '#fff' }}>Pitch</span></header>
      <main id="main" className="table">
        <div className="empty">
          <span className="disp">Can't reach the table</span>
          <span>{message}</span>
          <span style={{ fontSize: 15 }}>Running locally? Start the API with <code>pnpm dev:api</code>.</span>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
      <div className="actionbar" />
    </div>
  );
}
