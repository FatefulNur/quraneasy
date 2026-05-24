## Context

QuranEasy is a static Astro site with no backend. New Tajweed modules ship as JSON files in `src/content/modules/`. The maintainer wants a low-friction way to announce a freshly added module to followers on the `@quraneasyguide` Telegram channel.

Telegram's Bot API (`https://api.telegram.org/bot<TOKEN>/sendMessage`) supports posting to a channel as long as the bot is added as an administrator. No SDK is required — a single `fetch` call suffices.

## Goals / Non-Goals

**Goals:**
- Single CLI invocation broadcasts a formatted announcement: `npx tsx scripts/notify.ts "<Module Name>"`.
- Token kept out of source control (`.env`, gitignored). `.env.example` documents the variable.
- Zero impact on app build, runtime, or Cloudflare deploy.
- Clear failure modes: missing token, missing arg, non-2xx Telegram response.

**Non-Goals:**
- No auto-detection of "new module" from git diff or content changes — caller passes the name.
- No scheduled posting, queue, or retries.
- No multi-channel / multi-language support (channel name + message format are hardcoded for MVP).
- No build-time or CI integration. Manual maintainer-run only.

## Decisions

**Decision: Use `tsx` to run the script directly, no build step.**
- Rationale: project already standardizes on TypeScript; `tsx` lets the script consume `.ts` source without a separate compile step. Keeps script colocated with rest of repo.
- Alternative considered: plain `.mjs` script — rejected to keep one language across repo. `ts-node` — rejected, `tsx` is lighter and the modern default.

**Decision: Read `.env` via Node 22's built-in `--env-file` flag, passed by an npm script.**
- Rationale: Astro already loads `.env` for `import.meta.env`, but Node scripts don't. Using `node --env-file=.env` (proxied through `tsx --env-file=.env`) avoids adding `dotenv` as a dependency.
- Alternative considered: `dotenv` package — rejected, unnecessary dep for one script. Manually parsing `.env` — rejected, error-prone.

**Decision: Hardcode channel `@quraneasyguide` and message template inside the script.**
- Rationale: single broadcast target; turning these into env vars or CLI flags is premature flexibility.
- Alternative considered: `TELEGRAM_CHANNEL` env var — rejected for MVP; trivial to add later.

**Decision: Use `fetch` (global in Node 18+) with `parse_mode: "HTML"` disabled — send plain text.**
- Rationale: message contains no markup, just emojis + a URL. Telegram auto-linkifies URLs in plain text. Skipping `parse_mode` avoids accidental HTML-escape bugs if a module name ever contains `<`, `&`, etc.
- Alternative considered: `MarkdownV2` — rejected, requires escaping `.`, `-`, `!`, etc. in the URL and would complicate the template.

**Decision: Exit non-zero on any failure; print the Telegram API error body on failure.**
- Rationale: maintainer runs this interactively; visible error + non-zero exit is the right UX. No retry logic.

## Risks / Trade-offs

- **Token leak via shell history / process list** → Mitigation: token comes from `.env`, never a CLI flag. Document this in CLAUDE.md.
- **Bot not admin in channel** → Telegram returns `403: bot is not a member of the channel`. The script surfaces the body so the maintainer sees the cause.
- **Module name with special characters in shell** → Caller quotes the arg (documented in usage). Inside the script the name is a plain string in a JSON body, so no further escaping needed.
- **Accidental re-runs spam the channel** → No dedupe. Acceptable for a manual one-shot script; maintainer controls invocations.

## Migration Plan

No migration. New file + new dev dependency. Reversible by deleting `scripts/notify.ts` and removing `tsx` + the env-var line.
