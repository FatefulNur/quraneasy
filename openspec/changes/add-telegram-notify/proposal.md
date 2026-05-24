## Why

QuranEasy publishes new Tajweed modules over time, but there's no lightweight channel to push that news to learners. A one-shot Telegram broadcast script lets the maintainer announce new modules to the `@quraneasyguide` channel without spinning up a backend or CMS — keeping the project in line with its "static, no backend" stance.

## What Changes

- Add a Node CLI script at `scripts/notify.ts` that posts a formatted announcement to a Telegram channel via the Bot API.
- Script accepts the module display name as a positional CLI argument.
- Bot token is read from `TELEGRAM_BOT_TOKEN` in `.env` (gitignored).
- Channel `@quraneasyguide` is hardcoded (it's the project's only broadcast target).
- Add `TELEGRAM_BOT_TOKEN=` (empty) to `.env.example`.
- Document usage in `CLAUDE.md` so future contributors know how to broadcast a new module.

## Capabilities

### New Capabilities
- `telegram-notify`: Manual CLI broadcast of new-module announcements to the QuranEasy Telegram channel.

### Modified Capabilities
<!-- none -->

## Impact

- New file: `scripts/notify.ts`.
- New dev dependency: `tsx` (to run TypeScript script without a build step). No runtime app dependency.
- `.env.example` updated (committed); `.env` updated locally (gitignored).
- `CLAUDE.md` gains a short "Broadcasting new modules" section.
- No change to app runtime, build output, or Cloudflare deploy. Script is local-only / maintainer-run.
