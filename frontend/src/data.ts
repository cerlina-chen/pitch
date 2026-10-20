// Question decks for peer mock interviews.
// Checklist wording is a DRAFT: have a career center review it before launch.

export interface Card { id: string; q: string }
export interface Deck { id: string; name: string; color: string; checks: string[]; cards: Card[] }

export const DECKS: Deck[] = [
  {
    id: 'intro', name: 'About you', color: '#FFD23F',
    checks: ['Now', 'How you got here', 'What is next', 'Ties to the role', 'Under 2 min'],
    cards: [
      { id: 'intro-1', q: 'Tell me about yourself.' },
      { id: 'intro-2', q: 'Walk me through your resume.' },
      { id: 'intro-3', q: 'What are you most proud of?' },
      { id: 'intro-4', q: 'How would a friend describe you?' },
    ],
  },
  {
    id: 'behavioral', name: 'Behavioral', color: '#F2453D',
    checks: ['A situation', 'What you did', 'How it ended', 'What you learned', 'Under 2 min'],
    cards: [
      { id: 'beh-1', q: 'Tell me about a time you disagreed with a teammate.' },
      { id: 'beh-2', q: 'Tell me about a time you failed.' },
      { id: 'beh-3', q: 'Tell me about a time you led something.' },
      { id: 'beh-4', q: 'Tell me about a deadline you almost missed.' },
    ],
  },
  {
    id: 'why', name: 'Why this job', color: '#2EC4E6',
    checks: ['Knows the company', 'Names the role', 'A real reason', 'An example', 'Under 2 min'],
    cards: [
      { id: 'why-1', q: 'Why do you want this internship?' },
      { id: 'why-2', q: 'Why our company?' },
      { id: 'why-3', q: 'Where do you see yourself in a few years?' },
      { id: 'why-4', q: 'Why should we pick you?' },
    ],
  },
  {
    id: 'curve', name: 'Curveballs', color: '#FF9F1C',
    checks: ['Stayed calm', 'Answered it', 'An example', 'Ended strong', 'Under 2 min'],
    cards: [
      { id: 'curve-1', q: "What's your biggest weakness?" },
      { id: 'curve-2', q: 'Sell me this pen.' },
      { id: 'curve-3', q: 'What would you do on your first day?' },
      { id: 'curve-4', q: 'Tell me something that is not on your resume.' },
    ],
  },
  {
    id: 'ask', name: 'Ask them', color: '#FF8FC7',
    checks: ['Specific', 'Shows research', 'Open question', 'About the work', 'Not on Google'],
    cards: [
      { id: 'ask-1', q: 'Do you have any questions for me?' },
      { id: 'ask-2', q: 'What would you want to know about the team?' },
      { id: 'ask-3', q: 'What would you ask about a typical day?' },
      { id: 'ask-4', q: 'What would you ask about growing in the role?' },
    ],
  },
];

export const deckById = (id: string) => DECKS.find((d) => d.id === id) ?? DECKS[0];
export const findCard = (cardId: string) => {
  for (const deck of DECKS) {
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) return { deck, card };
  }
  return { deck: DECKS[0], card: DECKS[0].cards[0] };
};

/** One card per day, the same for everyone. */
export function todaysCard(now = new Date()) {
  const all = DECKS.flatMap((deck) => deck.cards.map((card) => ({ deck, card })));
  const day = Math.floor(now.getTime() / 86_400_000);
  return all[day % all.length];
}

// The Practice trail. The first stretch is the tutorial; it teaches by doing.
export type StopKind = 'intro' | 'answer' | 'give' | 'chest' | 'mock';
export interface Stop { id: string; kind: StopKind; title: string; section: string; color: string; cardId?: string; x: number; y: number }

// x and y are percentages of the table, so the trail scales with the screen.
export const TRAIL: Stop[] = [
  { id: 'hi', kind: 'intro', title: 'Say hi', section: 'Tutorial', color: '#FFFFFF', x: 10, y: 74 },
  { id: 'first', kind: 'answer', title: 'Answer your first card', section: 'Tutorial', color: '#FFFFFF', cardId: 'intro-1', x: 21, y: 55 },
  { id: 'give', kind: 'give', title: 'Give feedback', section: 'Tutorial', color: '#FFFFFF', cardId: 'beh-1', x: 33, y: 70 },
  { id: 'chest', kind: 'chest', title: 'Tutorial chest', section: 'Tutorial', color: '#FF9F1C', x: 44, y: 50 },
  { id: 'you', kind: 'answer', title: 'Walk me through your resume', section: 'About you', color: '#FFD23F', cardId: 'intro-2', x: 55, y: 32 },
  { id: 'proud', kind: 'answer', title: 'What are you most proud of?', section: 'About you', color: '#FFD23F', cardId: 'intro-3', x: 66, y: 48 },
  { id: 'disagree', kind: 'answer', title: 'A time you disagreed', section: 'Behavioral', color: '#F2453D', cardId: 'beh-1', x: 75, y: 70 },
  { id: 'failed', kind: 'answer', title: 'A time you failed', section: 'Behavioral', color: '#F2453D', cardId: 'beh-2', x: 85, y: 52 },
  { id: 'mock', kind: 'mock', title: 'Mock round with a partner', section: 'Head-to-head', color: '#2EC4E6', x: 92, y: 26 },
];

export const SECTIONS = [
  { name: 'Tutorial', color: '#FFFFFF', x: 5, y: 86 },
  { name: 'About you', color: '#FFD23F', x: 50, y: 17 },
  { name: 'Behavioral', color: '#F2453D', x: 73, y: 82 },
];

// A sample answer for the "Give feedback" tutorial stop. The correct ticks are known.
export const SAMPLE_ANSWER = {
  text: 'On a class project my teammate wanted to rebuild our app from scratch two weeks before the demo. I thought we should fix the bugs we had. I set up a quick call, we listed what each plan would cost, and we agreed to fix bugs first.',
  heard: [0, 1, 2, 4], // situation, what you did, how it ended, short. No lesson.
};
