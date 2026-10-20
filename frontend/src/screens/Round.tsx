import { useEffect, useMemo, useRef, useState } from 'react';
import { DECKS, deckById, type Deck } from '../data';
import { go } from '../hooks';
import { useProgress, XP } from '../progress';
import { initials, useMe } from '../session';
import { Icon, MatchShell, PlayerPanel, QuestionCard, Timer, Tokens, Waiting, useSeconds } from '../ui';
import { XpCoin } from './Solo';

/*
  Head-to-head as a peer mock interview: two players, assigned seats, each answers one card,
  gets feedback, redoes it, then they switch.

  The backend has no mock-interview room yet (see docs/frontend.md). Until it does, the partner is a
  scripted demo player so the whole loop can be played and tested. Everything that would be sent to the
  server is marked with "SERVER:" below.
*/

const PARTNER = { name: 'Maya', ini: 'MR', color: 'var(--pink)' };
const NOTES: Record<string, { keep: string; fix: string }> = {
  intro: { keep: 'Clear start, I knew who you were fast.', fix: 'Say why this role fits you.' },
  behavioral: { keep: 'Great example, I could picture it.', fix: 'Finish the story. Say how it ended.' },
  why: { keep: 'You clearly looked into the team.', fix: 'Give one real example, not just a reason.' },
  curve: { keep: 'You stayed calm.', fix: 'End on what you are doing about it.' },
  ask: { keep: 'Specific question.', fix: 'Ask something you could not Google.' },
};

type Step = 'lobby' | 'matching' | 'seat' | 'answer' | 'waitFeedback' | 'feedbackIn' | 'redo' | 'rate' | 'waitAnswer' | 'give' | 'wrap';
const queryDeck = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('deck');

export function Round({ startInLobby }: { startInLobby?: boolean }) {
  const me = useMe();
  const { addXp, addFix, countAnswer, clear } = useProgress(me.player.id);
  const [deckId, setDeckId] = useState(queryDeck() ?? 'behavioral');
  const deck = deckById(deckId);
  const [step, setStep] = useState<Step>(startInLobby ? 'lobby' : 'matching');
  const [meFirst, setMeFirst] = useState(() => Math.random() < 0.5);
  const [answered, setAnswered] = useState(false);
  const [gave, setGave] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>([]);
  const [keep, setKeep] = useState('');
  const [fix, setFix] = useState('');
  const [help, setHelp] = useState<'yes' | 'bit' | 'no' | null>(null);
  const [rated, setRated] = useState<'up' | 'down' | null>(null);
  const [mic, setMic] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const later = (ms: number, fn: () => void) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms); };
  useEffect(() => () => clearTimeout(timer.current), []);

  const [mine, theirs] = useMemo(() => pickTwo(deck), [deck]);
  const received = deck.checks.map((_, i) => i < 2 || i === deck.checks.length - 1);
  const notes = NOTES[deck.id] ?? NOTES.behavioral;
  const seconds = useSeconds(step === 'answer' || step === 'redo', step);

  // Matching: SERVER: queue for a verified partner in the same deck.
  useEffect(() => { if (step === 'matching') later(1800, () => setStep('seat')); }, [step]);

  const toGive = () => { setTicks(deck.checks.map(() => false)); setKeep(''); setFix(''); setStep('waitAnswer'); later(2400, () => setStep('give')); };
  const finish = () => {
    addXp(XP.answer + XP.redo + XP.feedback);
    countAnswer(true);
    addFix({ text: notes.fix, cardId: mine.id, from: `${PARTNER.name} (demo)` });
    clear('mock');
    setStep('wrap');
  };
  const again = () => {
    setMeFirst(!meFirst); setAnswered(false); setGave(false); setHelp(null); setRated(null); setStep('matching');
  };

  const leave = () => go('#/');
  const status: Partial<Record<Step, [string, string]>> = {
    answer: ['Asking', 'Speaking'], waitFeedback: ['Writing feedback', 'Done'], feedbackIn: ['Gave feedback', 'Got feedback'],
    redo: ['Listening', 'Redoing'], rate: ['Listening', 'Redone'], waitAnswer: ['Answering', 'Asking'], give: ['Answered', 'Giving feedback'],
  };
  const [themStatus, meStatus] = status[step] ?? ['', ''];
  const cardStep = step === 'wrap' ? 2 : (answered || gave) ? 2 : 1;
  const inPlay = !['lobby', 'matching', 'seat', 'wrap'].includes(step);

  /* ---------------- Lobby ---------------- */
  if (step === 'lobby') {
    return (
      <MatchShell onLeave={leave} actions={<button className="btn btn--primary" onClick={() => setStep('matching')}><Icon name="playFill" size={20} />Play {deck.name}</button>}>
        <div className="decks" role="radiogroup" aria-label="Decks">
          {DECKS.map((d) => (
            <button key={d.id} className="deck" role="radio" aria-checked={d.id === deckId} onClick={() => setDeckId(d.id)}>
              <span className="stack" style={{ width: 150, height: 206 }}>
                <span style={{ background: d.color, rotate: '-7deg' }} /><span style={{ background: d.color, rotate: '4deg' }} />
                <span className="deck__face">
                  <span className="disp" style={{ fontSize: 19, lineHeight: 1.15 }}>{d.name}</span>
                  <span className="suit" style={{ alignSelf: 'flex-end', width: 26, height: 26, background: d.color }} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </MatchShell>
    );
  }

  /* ---------------- Matching and seats ---------------- */
  if (step === 'matching' || step === 'seat') {
    const seat = (who: 'me' | 'them') => {
      const first = who === 'me' ? meFirst : !meFirst;
      return (
        <div className={`seat ${first ? 'seat--first' : ''}`}>
          <span className="tile" style={{ width: 96, height: 96, borderRadius: 20, fontSize: 28, background: who === 'me' ? 'var(--cyan)' : step === 'matching' ? 'transparent' : PARTNER.color, borderStyle: who === 'them' && step === 'matching' ? 'dashed' : 'solid' }}>
            {who === 'me' ? initials(me.player.name) : step === 'matching' ? '' : PARTNER.ini}
          </span>
          <strong>{who === 'me' ? 'You' : step === 'matching' ? 'Finding…' : PARTNER.name}</strong>
          {step === 'seat' && <span className="seat__role">{first ? 'Answers' : 'Asks'}</span>}
        </div>
      );
    };
    return (
      <MatchShell
        onLeave={leave}
        actions={step === 'seat'
          ? <button className="btn btn--primary" onClick={() => (meFirst ? setStep('answer') : toGive())}>Start</button>
          : <button className="btn" onClick={() => setStep('lobby')}>Cancel</button>}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          {seat('me')}
          <div style={{ width: 300, height: 190, borderRadius: 95, background: deck.color, border: '2px solid var(--ink)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {step === 'matching' ? <Waiting text="" /> : (
              <span className="stack" style={{ width: 92, height: 126 }}>
                <span style={{ background: '#fff', rotate: '-8deg' }} />
                <span style={{ background: '#fff', rotate: '5deg', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="disp" style={{ fontSize: 14 }}>{deck.name}</span></span>
              </span>
            )}
          </div>
          {seat('them')}
          {step === 'seat' && <span className="hint" style={{ top: -64, left: meFirst ? 0 : 'auto', right: meFirst ? 'auto' : 0 }}>{meFirst ? 'You answer first, then you switch' : `${PARTNER.name} answers first, then you switch`}</span>}
        </div>
      </MatchShell>
    );
  }

  /* ---------------- Wrap ---------------- */
  if (step === 'wrap') {
    const first = received.filter(Boolean).length;
    return (
      <MatchShell
        onLeave={leave} step={2} steps={2}
        actions={<><button className="btn btn--primary" onClick={again}>Play again</button><a href="#/" className="iconbtn" aria-label="Back home"><Icon name="home" /></a></>}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div className="sheet" style={{ width: 200, height: 120, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', rotate: '-1.5deg', boxShadow: 'var(--shadow-sm)' }}>
              <span className="suit" style={{ width: 22, height: 22, background: deck.color }} />
              <span className="disp" style={{ fontSize: 15, lineHeight: 1.15 }}>{mine.q}</span>
            </div>
            <span className="disp" style={{ fontSize: 30, color: 'var(--muted)' }}>{first}</span>
            <Icon name="chevron" size={26} />
            <span className="disp" style={{ fontSize: 40 }}>{help === 'no' ? first : Math.min(deck.checks.length, first + 1)}</span>
            <span style={{ fontWeight: 700 }}>/{deck.checks.length}</span>
          </div>
          <XpCoin amount={XP.answer + XP.redo + XP.feedback} />
        </div>
        <div className="panel" style={{ bottom: 22, right: 24, left: 'auto' }}>
          <span className="tile" style={{ background: PARTNER.color }}>{PARTNER.ini}</span>
          <strong style={{ fontSize: 15 }}>Good partner?</strong>
          {(['up', 'down'] as const).map((v) => (
            // SERVER: private partner rating, used for matching only.
            <button key={v} className="iconbtn iconbtn--sq" aria-pressed={rated === v} style={{ background: rated === v ? 'var(--yellow)' : '#fff' }} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => setRated(v)}>
              <Icon name={v === 'up' ? 'thumbUp' : 'thumbDown'} size={20} />
            </button>
          ))}
        </div>
      </MatchShell>
    );
  }

  /* ---------------- In play ---------------- */
  const myCard = step === 'waitAnswer' || step === 'give' ? theirs : mine;
  const speaking = step === 'answer' || step === 'redo';
  const actions = (() => {
    switch (step) {
      case 'answer':
      case 'redo':
        return (
          <>
            <button className="iconbtn" aria-pressed={mic} aria-label={mic ? 'Mute' : 'Unmute'} onClick={() => setMic(!mic)}><Icon name="mic" size={24} /></button>
            <button className="btn btn--primary" onClick={() => {
              if (step === 'answer') { setStep('waitFeedback'); later(1800, () => setStep('feedbackIn')); } // SERVER: answer done
              else setStep('rate');
            }}>Done</button>
          </>
        );
      case 'feedbackIn':
        return <button className="btn btn--primary" onClick={() => setStep('redo')}><Icon name="redo" />Redo</button>;
      case 'rate':
        return (
          <>
            <span className="actionbar__label" id="help-q">Did it help?</span>
            <div role="radiogroup" aria-labelledby="help-q" style={{ display: 'flex', gap: 10 }}>
              {([['yes', 'Yes'], ['bit', 'A bit'], ['no', 'No']] as const).map(([id, label]) => (
                // SERVER: "did this feedback change your second answer?" (private).
                <button key={id} className="choice" role="radio" aria-checked={help === id} onClick={() => setHelp(id)}>{label}</button>
              ))}
            </div>
            <button className="btn btn--primary" disabled={!help} onClick={() => { setAnswered(true); if (gave) finish(); else toGive(); }}>{gave ? 'Finish' : 'Swap seats'}</button>
          </>
        );
      case 'give':
        return <button className="btn btn--primary" disabled={!ticks.some(Boolean)} onClick={() => { setGave(true); if (answered) finish(); else setStep('answer'); }}>Send</button>; // SERVER: ticks + Keep + Fix
      default:
        return null;
    }
  })();

  return (
    <MatchShell onLeave={leave} step={cardStep} steps={2} actions={actions}>
      {inPlay && (
        <>
          <PlayerPanel position="top" name={PARTNER.name} ini={PARTNER.ini} color={PARTNER.color} status={themStatus} active={step === 'waitAnswer' || step === 'waitFeedback'} demo />
          <PlayerPanel position="bottom" name="You" ini={initials(me.player.name)} color="var(--cyan)" status={meStatus} active={speaking || step === 'give'} />
        </>
      )}

      {(step === 'waitFeedback' || step === 'waitAnswer') ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <QuestionCard small q={myCard.q} color={deck.color} />
          <Waiting text={step === 'waitFeedback' ? `${PARTNER.name} is writing feedback` : `${PARTNER.name} is answering`} />
        </div>
      ) : speaking ? (
        <QuestionCard q={myCard.q} color={deck.color} deckName={step === 'redo' ? `${deck.name} · redo` : deck.name} corner={<Timer seconds={seconds} />} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <QuestionCard small q={myCard.q} color={deck.color} />
            <div style={{ position: 'relative' }}>
              {step === 'give'
                ? <Tokens label="What you heard" labels={deck.checks} on={ticks} onToggle={(i) => setTicks(ticks.map((v, j) => (j === i ? !v : v)))} />
                : <Tokens label="What your partner heard" labels={deck.checks} on={received} missedStyle />}
              {step === 'give' && !ticks.some(Boolean) && <span className="hint hint--up">Tap what you heard</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {step === 'give' ? (
              <>
                <label className="sticky sticky--keep"><span className="sticky__title">Keep</span><textarea rows={3} value={keep} onChange={(e) => setKeep(e.target.value)} placeholder="What worked" maxLength={160} /></label>
                <label className="sticky sticky--fix"><span className="sticky__title">Fix</span><textarea rows={3} value={fix} onChange={(e) => setFix(e.target.value)} placeholder="One thing to change" maxLength={160} /></label>
              </>
            ) : (
              <>
                <div className="sticky sticky--keep"><span className="sticky__title">Keep</span>{notes.keep}</div>
                <div className="sticky sticky--fix" style={{ borderWidth: 3 }}><span className="sticky__title">Fix</span>{notes.fix}</div>
              </>
            )}
          </div>
        </>
      )}
    </MatchShell>
  );
}

function pickTwo(deck: Deck) {
  const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]] as const;
}
