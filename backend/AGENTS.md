# Repository Guidelines

## Project Structure & Module Organization
- Entry point: `server.js` (Express + Mongoose).
- Source: domain folders at repo root: `controllers/`, `routes/`, `models/`, `middleware/`, `services/`, `utils/`.
- Config & env: `.env` (use `.env.example` as template).
- Tests: `__tests__/` (Jest, Supertest, in-memory MongoDB).
- Scripts: `scripts/` for ops utilities (e.g., `wipeUsers.js`).

## Build, Test, and Development Commands
- `npm start`: run the API in production mode.
- `npm run dev`: run with `nodemon` (auto-reload).
- `npm test`: run Jest test suite once.
- `npm run test:watch`: run tests in watch mode.
- `npm run test:e2e`: serialized tests (useful for E2E).
- `npm run wipe:users`: maintenance script to wipe users.
Requirements: Node.js >= 16 and a valid `MONGODB_URI`.

## Coding Style & Naming Conventions
- Language: Node.js (CommonJS). Indentation: 2 spaces.
- Files: controllers `*Controller.js`, routes `*Routes.js`, models `PascalCase.js`.
- Code: camelCase for vars/functions, PascalCase for Mongoose models, UPPER_SNAKE_CASE for env keys.
- Patterns: async/await, return JSON with `success`, `message`, `data` where applicable.

## Testing Guidelines
- Frameworks: Jest + Supertest + `mongodb-memory-server` for isolated DB.
- Location: place tests in `__tests__/` with `*.test.js`.
- Example: `__tests__/auth.otp.e2e.test.js` covers register → OTP → profile.
- Run locally: `NODE_ENV=development npm test`.

## Commit & Pull Request Guidelines
- Commits: prefer Conventional Commits (e.g., `feat(auth): add OTP verify`).
- PRs: include description, scope, testing notes, and screenshots for API responses when relevant.
- Link related issues; keep PRs focused and under ~300 lines when possible.

## Security & Configuration Tips
- Secrets: never commit `.env`. Required keys commonly used: `MONGODB_URI`, `JWT_SECRET`, and Twilio keys if SMS is enabled (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`).
- Security middleware: `helmet`, rate limiting, and `protect` JWT middleware guard protected routes.
- CORS: configured via `cors`; restrict origins in production.

