# Frontend

Vite + React 19 + TypeScript in `frontend/`. No UI library: the look is plain CSS tokens in `src/styles.css`.

## Run it

```sh
pnpm install
pnpm build        # builds the backend once (the dev API needs build/node)
pnpm dev:api      # terminal 1: local API on 127.0.0.1:8787
pnpm dev:web      # terminal 2: http://127.0.0.1:5173
```

## Look

Tabletop: a walnut page, a caramel table in the middle, white cards with ink outlines and hard offset shadows, one action bar at the bottom.

- Colors: walnut `#4A3227`, table `#C9A27E`, ink `#2A1D1A`. Arcade accents only on suits, tokens and the XP coin: `#FFD23F`, `#F2453D`, `#2EC4E6`, `#FF9F1C`, `#FF8FC7`.
- Type: Archivo (wide, 800) for headings and cards, Atkinson Hyperlegible for everything else.
- Rules: minimal text, hints only until the player acts, no pill filter chips, choices are physical objects (decks, seats, tokens, sticky notes).

## Screens

| Route | Screen | Data |
|---|---|---|
| `#/` | Home: today's card, this week, Play with a partner | leaderboard API |
| `#/practice` | Trail. The first stretch is the tutorial (Say hi, first answer, give feedback, chest) | local progress |
| `#/stop/:id` | One trail stop | local progress |
| `#/coach` | Fix notes grouped into drills | local progress |
| `#/drill/:cardId` | Solo answer with a focus note | local progress |
| `#/ranks` | Weekly board, Everyone and Friends | leaderboard and friends APIs |
| `#/account` | Profile, stats, private placement info, sign out | me and player profile APIs |
| `#/play`, `#/lobby` | Head-to-head peer mock interview | demo partner, see below |

New players land on Practice until the tutorial stretch is done.

## What is real and what is not yet

Real: sign up, sign in, sign out, session restore, profile, streak, weekly board, friends filter.

Not real yet, because the backend has no support for it:

- **Peer mock-interview rooms.** The round in `src/screens/Round.tsx` plays against a scripted partner labelled Demo. Every point that needs the server is marked `SERVER:` in that file: matching in the same deck, assigned seats that swap, answer done, ticks plus Keep and Fix, the redo, "Did it help?", and the private partner rating. Report and block need a room code, so they come with the real room.
- **XP, trail progress and Fix notes** live in localStorage per player (`src/progress.ts`). They are display values only until the server owns them; never use them for rewards.
- **Coach** regroups Fix notes by word overlap. It does not generate feedback, in line with the no fake AI rule in `roadmap.md`.
- **Weekly board** ranks by rounds played this week, not rating, so skill stays private.
- **Checklists** in `src/data.ts` are a draft for career-center review.
- **Mic** is a visual toggle. Voice uses the existing WebRTC signalling once rooms exist.

## Backend asks, in order

1. Mock-interview room type: two players, assigned roles that swap, current card, per-card state (asking, answering, feedback, redo, rated).
2. Store per card: ticks, Keep, Fix, redo, "Did it help?". Private helpfulness score from those, used only for matching.
3. Append-only XP events (answer, ask, redo) and tutorial progress per player.
4. Matching by verified school email and deck, similar level from 5 placement rounds.
