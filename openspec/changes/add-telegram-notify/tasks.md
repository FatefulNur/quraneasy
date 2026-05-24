## 1. Project setup

- [x] 1.1 Add `tsx` as a devDependency in `package.json`
- [x] 1.2 Add npm script `"notify": "tsx --env-file=.env scripts/notify.ts"` to `package.json`
- [x] 1.3 Add `TELEGRAM_BOT_TOKEN=` (empty value) to `.env.example`
- [x] 1.4 Add `TELEGRAM_BOT_TOKEN=` line to local `.env` (real token filled in by maintainer; file already gitignored)

## 2. Script implementation

- [x] 2.1 Create `scripts/` directory
- [x] 2.2 Create `scripts/notify.ts` that reads the first CLI arg as module name and `TELEGRAM_BOT_TOKEN` from `process.env`
- [x] 2.3 Validate inputs: missing arg → usage hint + non-zero exit; missing/empty token → named error + non-zero exit; neither path contacts Telegram
- [x] 2.4 Build the message body exactly per spec template (3 lines, emojis, plain text)
- [x] 2.5 POST to `https://api.telegram.org/bot<token>/sendMessage` with JSON `{ chat_id: "@quraneasyguide", text }` via `fetch`
- [x] 2.6 On 2xx: print success line, exit 0. On non-2xx: print status + response body to stderr, exit non-zero
- [x] 2.7 Ensure the token value is never written to stdout/stderr in any code path

## 3. Documentation

- [x] 3.1 Add a "Broadcasting new modules" section to `CLAUDE.md` with: invocation (`npm run notify -- "<Module Name>"` or `npx tsx --env-file=.env scripts/notify.ts "<Module Name>"`), required env var, and the note that the bot must be a channel administrator on `@quraneasyguide`

## 4. Verification

- [x] 4.1 Run `npm run notify -- "Test Module"` against a test channel (or with a throwaway token) and confirm message lands with correct format
- [x] 4.2 Run with no arg → confirm usage hint and non-zero exit
- [x] 4.3 Run with `TELEGRAM_BOT_TOKEN` unset → confirm named error and non-zero exit
- [x] 4.4 Run with an invalid token → confirm Telegram error body is printed and exit code is non-zero
- [x] 4.5 `npm run build` still succeeds (script must not affect the Astro build)
