import { useState, type ReactNode } from 'react';
import { useProfile } from '../hooks';
import { useProgress } from '../progress';
import { errorText, initials, useMe, useSession } from '../session';
import { HubShell, Icon } from '../ui';

function Stat({ value, label, mark, tilt }: { value: string | number; label: string; mark: ReactNode; tilt: number }) {
  return (
    <div className="sheet" style={{ height: 150, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', rotate: `${tilt}deg`, boxShadow: 'var(--shadow-sm)' }}>
      {mark}
      <span><span className="disp" style={{ display: 'block', fontSize: 34, lineHeight: 1 }}>{value}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span></span>
    </div>
  );
}

export function Account() {
  const me = useMe();
  const { logout } = useSession();
  const profile = useProfile();
  const { progress } = useProgress(me.player.id);
  const [error, setError] = useState<string | null>(null);
  const placement = me.rating.placementGamesRemaining;

  return (
    <HubShell active="account">
      <div className="sheet" style={{ width: 300, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, rotate: '-1.2deg', border: '3px solid var(--ink)', boxShadow: 'var(--shadow-lg)' }}>
        <span className="tile" style={{ width: 120, height: 120, borderRadius: 28, background: 'var(--cyan)', fontSize: 38, border: '3px solid var(--ink)', boxShadow: 'var(--shadow)' }}>{initials(me.player.name)}</span>
        <h1 className="disp" style={{ fontSize: 24, margin: '6px 0 0', textAlign: 'center' }}>{me.player.name}</h1>
        {me.ageBand && <span className="tag" style={{ fontSize: 14, padding: '4px 10px' }}>Ages {me.ageBand}</span>}
        {profile && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>}
        <span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 700 }}>{profile ? `${profile.following} following · ${profile.followers} followers` : ' '}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 160px', gap: 18 }}>
        <Stat value={profile?.streak ?? '–'} label="Day streak" tilt={1} mark={<span className="stamp" style={{ width: 30, height: 36 }} />} />
        <Stat value={progress.xpTotal} label="Total XP" tilt={-1} mark={<span className="coin" style={{ width: 32, height: 32 }} />} />
        <Stat value={progress.answered + (profile?.roundsPlayed ?? 0)} label="Cards answered" tilt={-0.5} mark={<span className="suit" style={{ background: 'var(--red)' }} />} />
        <Stat value={progress.redos} label="Redos" tilt={1.2} mark={<Icon name="redo" size={32} />} />
      </div>

      <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'var(--paper)', border: '2px dashed var(--ink)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}><Icon name="lock" size={16} />Only you see this</span>
          <strong>{placement > 0 ? `${placement} placement round${placement > 1 ? 's' : ''} left` : 'Placed'}</strong>
          <span style={{ fontSize: 15 }}>Feedback you've given: {me.judge.roundsCompleted}</span>
        </div>
        <div className="sheet" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <button
            className="row" style={{ width: '100%', border: 0, background: '#fff', minHeight: 52 }}
            onClick={() => { setError(null); logout().catch((e) => setError(errorText(e))); }}
          >
            <Icon name="out" size={20} /><span className="row__name" style={{ textAlign: 'left' }}>Sign out</span>
          </button>
        </div>
        {error && <p className="error-note" role="alert">{error}</p>}
      </div>
    </HubShell>
  );
}
