import { useState } from 'react';
import { findCard, SAMPLE_ANSWER, TRAIL, deckById } from '../data';
import { go } from '../hooks';
import { useProgress, XP } from '../progress';
import { useMe } from '../session';
import { Icon, MatchShell, QuestionCard, Timer, Tokens, useSeconds } from '../ui';

/** Answer one card alone, tick what you covered, then redo it. Used by Practice stops and Coach drills. */
export function SoloAnswer({ cardId, stopId, focus, backTo }: { cardId: string; stopId?: string; focus?: string; backTo: string }) {
  const me = useMe();
  const { addXp, clear, countAnswer } = useProgress(me.player.id);
  const { deck, card } = findCard(cardId);
  const [step, setStep] = useState<'answer' | 'check' | 'done'>('answer');
  const [tries, setTries] = useState<boolean[][]>([]);
  const [ticks, setTicks] = useState<boolean[]>(deck.checks.map(() => false));
  const [touched, setTouched] = useState(false);
  const [mic, setMic] = useState(true);
  const seconds = useSeconds(step === 'answer', `${step}-${tries.length}`);

  const score = (t: boolean[]) => t.filter(Boolean).length;
  const finishCheck = (redo: boolean) => {
    const all = [...tries, ticks];
    setTries(all);
    if (redo) { setTicks(deck.checks.map(() => false)); setTouched(false); setStep('answer'); return; }
    const redid = all.length > 1;
    addXp(XP.answer + (redid ? XP.redo : 0));
    countAnswer(redid);
    if (stopId) clear(stopId);
    setStep('done');
  };

  return (
    <MatchShell
      onLeave={() => go(backTo)}
      actions={
        step === 'answer' ? (
          <>
            <button className="iconbtn" aria-pressed={mic} aria-label={mic ? 'Mute' : 'Unmute'} onClick={() => setMic(!mic)}><Icon name="mic" size={24} /></button>
            <button className="btn btn--primary" onClick={() => setStep('check')}>Done</button>
          </>
        ) : step === 'check' ? (
          <>
            {tries.length === 0 && <button className="btn btn--primary" onClick={() => finishCheck(true)}><Icon name="redo" />Redo</button>}
            <button className={`btn ${tries.length ? 'btn--primary' : ''}`} onClick={() => finishCheck(false)}>{tries.length ? 'Finish' : 'Skip redo'}</button>
          </>
        ) : (
          <a className="btn btn--primary" href={backTo}>Back</a>
        )
      }
    >
      {step === 'answer' && (
        <>
          {focus && <div className="sticky sticky--fix" style={{ position: 'absolute', top: 22, right: 24, width: 220, minHeight: 0 }}><span className="sticky__title">Watch for</span>{focus}</div>}
          <QuestionCard q={card.q} color={deck.color} deckName={tries.length ? `${deck.name} · redo` : deck.name} corner={<Timer seconds={seconds} />} />
        </>
      )}
      {step === 'check' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <QuestionCard small q={card.q} color={deck.color} />
          <div style={{ position: 'relative' }}>
            <Tokens label="What you covered" labels={deck.checks} on={ticks} onToggle={(i) => { setTouched(true); setTicks(ticks.map((v, j) => (j === i ? !v : v))); }} />
            {!touched && <span className="hint hint--up">Tap what you covered</span>}
          </div>
        </div>
      )}
      {step === 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <QuestionCard small q={card.q} color={deck.color} />
            <span className="disp" style={{ fontSize: 30, color: 'var(--muted)' }}>{score(tries[0] ?? [])}</span>
            {tries.length > 1 && <><Icon name="chevron" size={26} /><span className="disp" style={{ fontSize: 40 }}>{score(tries[1])}</span></>}
            <span style={{ fontWeight: 700 }}>/{deck.checks.length}</span>
          </div>
          <XpCoin amount={XP.answer + (tries.length > 1 ? XP.redo : 0)} />
        </div>
      )}
    </MatchShell>
  );
}

export function XpCoin({ amount }: { amount: number }) {
  return (
    <div role="img" aria-label={`Plus ${amount} XP`} style={{ width: 150, height: 150, borderRadius: '50%', background: 'var(--yellow)', border: '3px solid var(--ink)', boxShadow: '5px 5px 0 var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', rotate: '-6deg' }}>
      <span className="disp" style={{ fontSize: 42, lineHeight: 1 }}>+{amount}</span>
      <span style={{ fontWeight: 700 }}>XP</span>
    </div>
  );
}

/** Tutorial stop 1: learn the table by tapping it. One hint at a time, each until you act. */
export function IntroStop() {
  const me = useMe();
  const { clear } = useProgress(me.player.id);
  const [step, setStep] = useState(0);
  const hints = ['This is you. Tap your seat.', 'Your partner sits here. Tap them.', 'Questions come from decks. Tap one.'];
  const done = step >= hints.length;
  const seatStyle = (on: boolean) => ({ background: '#fff', border: on ? '3px solid var(--ink)' : '2px dashed #6b4a3a', boxShadow: on ? '5px 5px 0 var(--ink)' : 'none' });

  return (
    <MatchShell onLeave={() => go('#/practice')} actions={done ? <button className="btn btn--primary" onClick={() => { clear('hi'); go('#/practice'); }}>Got it</button> : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          {step === 0 && <span className="hint hint--up">{hints[0]}</span>}
          <button className="seat" style={seatStyle(step > 0)} onClick={() => step === 0 && setStep(1)}>
            <span className="tile" style={{ width: 96, height: 96, borderRadius: 20, background: 'var(--cyan)', fontSize: 28 }}>You</span>
            <span className="seat__role" style={{ background: step > 0 ? 'var(--yellow)' : undefined }}>Answers</span>
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          {step === 2 && <span className="hint hint--up">{hints[2]}</span>}
          <button className="stack" style={{ width: 120, height: 164, background: 'none', border: 0, padding: 0, translate: step > 2 ? '0 -14px' : undefined }} onClick={() => step === 2 && setStep(3)} aria-label="Behavioral deck">
            <span style={{ background: 'var(--red)', rotate: '-8deg' }} /><span style={{ background: 'var(--red)', rotate: '4deg' }} />
            <span style={{ background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="disp" style={{ fontSize: 15 }}>Behavioral</span></span>
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          {step === 1 && <span className="hint hint--up">{hints[1]}</span>}
          <button className="seat" style={seatStyle(step > 1)} onClick={() => step === 1 && setStep(2)}>
            <span className="tile" style={{ width: 96, height: 96, borderRadius: 20, background: 'var(--pink)', fontSize: 22 }}>Partner</span>
            <span className="seat__role">Asks</span>
          </button>
        </div>
      </div>
      {done && <p className="disp" style={{ position: 'absolute', bottom: 28, margin: 0, fontSize: 22 }}>Answer, get feedback, redo. Then switch.</p>}
    </MatchShell>
  );
}

/** Tutorial stop 3: practice giving feedback on a sample answer, then see what a careful listener would tick. */
export function GiveStop() {
  const me = useMe();
  const { addXp, clear } = useProgress(me.player.id);
  const deck = deckById('behavioral');
  const [ticks, setTicks] = useState(deck.checks.map(() => false));
  const [checked, setChecked] = useState(false);
  const right = deck.checks.map((_, i) => SAMPLE_ANSWER.heard.includes(i));
  const matches = ticks.filter((t, i) => t === right[i]).length;

  return (
    <MatchShell
      onLeave={() => go('#/practice')}
      actions={checked
        ? <button className="btn btn--primary" onClick={() => { addXp(XP.feedback); clear('give'); go('#/practice'); }}>Done</button>
        : <button className="btn btn--primary" onClick={() => setChecked(true)} disabled={!ticks.some(Boolean)}>Check</button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64, maxWidth: 560 }}>
        <div className="sheet" style={{ padding: 20, rotate: '-1deg', fontSize: 17, lineHeight: 1.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 8 }}><span className="mini-tile" style={{ background: 'var(--pink)' }}>MR</span>Sample answer: {deck.cards[0].q}</span>
          {SAMPLE_ANSWER.text}
        </div>
        <div style={{ position: 'relative' }}>
          <Tokens label="What you heard" labels={deck.checks} on={checked ? right : ticks} missedStyle={checked} onToggle={checked ? undefined : (i) => setTicks(ticks.map((v, j) => (j === i ? !v : v)))} />
          {!ticks.some(Boolean) && <span className="hint hint--up">Tap what you heard</span>}
        </div>
        {checked && (
          <p className="disp" style={{ margin: 0, fontSize: 22, textAlign: 'center' }} role="status">
            {matches === deck.checks.length ? 'Spot on.' : `${matches} of ${deck.checks.length} match.`} No lesson at the end, so that's the Fix.
          </p>
        )}
      </div>
    </MatchShell>
  );
}

export function ChestStop() {
  const me = useMe();
  const { addXp, clear, progress } = useProgress(me.player.id);
  const already = progress.cleared.includes('chest');
  const [open, setOpen] = useState(already);
  return (
    <MatchShell onLeave={() => go('#/practice')} actions={open ? <a className="btn btn--primary" href="#/practice">Keep going</a> : undefined}>
      {open ? <XpCoin amount={XP.chest} /> : (
        <div style={{ position: 'relative' }}>
          <span className="hint hint--up">Tap to open</span>
          <button onClick={() => { if (!already) { addXp(XP.chest); clear('chest'); } setOpen(true); }} aria-label="Open the chest" style={{ width: 180, height: 140, borderRadius: 22, background: 'var(--orange)', border: '3px solid var(--ink)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', rotate: '-4deg' }}>
            <Icon name="chest" size={72} />
          </button>
        </div>
      )}
    </MatchShell>
  );
}

export function StopRouter({ stopId }: { stopId: string }) {
  const stop = TRAIL.find((s) => s.id === stopId);
  if (!stop) { go('#/practice'); return null; }
  if (stop.kind === 'intro') return <IntroStop />;
  if (stop.kind === 'give') return <GiveStop />;
  if (stop.kind === 'chest') return <ChestStop />;
  if (stop.kind === 'mock') { go('#/play'); return null; }
  return <SoloAnswer cardId={stop.cardId!} stopId={stop.id} backTo="#/practice" />;
}
