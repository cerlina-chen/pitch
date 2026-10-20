import { useRoute } from './hooks';
import { useSession } from './session';
import { Account } from './screens/Account';
import { Auth, Offline } from './screens/Auth';
import { Coach } from './screens/Coach';
import { Home } from './screens/Home';
import { Practice, usePracticeState } from './screens/Practice';
import { Ranks } from './screens/Ranks';
import { Round } from './screens/Round';
import { SoloAnswer, StopRouter } from './screens/Solo';
import { Waiting } from './ui';

export function App() {
  const { me, booting, offline } = useSession();
  if (booting) return <div className="frame"><main className="table" style={{ marginTop: 76 }}><Waiting text="Setting the table" /></main></div>;
  if (offline) return <Offline message={offline} />;
  if (!me) return <Auth />;
  return <SignedIn />;
}

function SignedIn() {
  const path = useRoute();
  const { current } = usePracticeState();
  const [, section, id] = path.split('/');

  // New players start on the tutorial stretch of the trail until they finish it.
  if ((section === '' || section === undefined) && current < 3) return <Practice />;

  switch (section) {
    case 'practice': return <Practice />;
    case 'coach': return <Coach />;
    case 'ranks': return <Ranks />;
    case 'account': return <Account />;
    case 'play': return <Round key={path} />;
    case 'lobby': return <Round key={path} startInLobby />;
    case 'stop': return <StopRouter key={id} stopId={id ?? ''} />;
    case 'drill': {
      const focus = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('focus') ?? undefined;
      return <SoloAnswer key={id} cardId={id ?? ''} focus={focus} backTo="#/coach" />;
    }
    default: return <Home />;
  }
}
