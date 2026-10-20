# Pitch

Live practice for the conversations that matter: interviews, pitches, negotiations and hard talks. Two players face the same scenario, peer judges score them, and both leave with specific feedback in about four minutes.

## Status

The backend is complete and tested. The new tabletop frontend is in `frontend/`; see [docs/frontend.md](docs/frontend.md) for what is wired and what is still a demo.

| Part | State |
|---|---|
| API, matchmaking, rounds, judging, Elo | Working, 47 automated tests |
| Database (D1 or Turso via Drizzle) | Working, 11 migrations |
| Web frontend | Tabletop UI in progress, see [frontend notes](docs/frontend.md) |

## Run the backend locally

Requires Node 24 and pnpm 11.19.0.

```sh
pnpm install
pnpm check        # typecheck and tests
pnpm dev:api      # local API on a SQLite file, no cloud credentials
```

## Layout

- `backend/` request handling, game logic, matchmaking, ratings
- `shared/` types and presets shared by server and client
- `client/pitch-api.ts` typed browser client for the API
- `db/`, `drizzle/` schema and migrations
- `server/`, `api/` Node and Vercel entry points
- `tests/` API, ratings and deployment tests
- `docs/` [API contract](docs/backend.md), [Elo rules](docs/ratings.md), [Vercel](docs/vercel.md), [Cloudflare](docs/deployment.md), [roadmap](docs/roadmap.md)

## Origin

Pitch started as a 24-hour project at Badger BuildFest 2026, built by Cerlina Chen, Cassie, Kai, Anggun and Josh. The original repo, including the hackathon frontend, is at [asoracca/PITCH](https://github.com/asoracca/PITCH). This repo continues from that backend.

## License

MIT
