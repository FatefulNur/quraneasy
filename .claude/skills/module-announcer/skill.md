---
name: module-announcer
description: Announce a newly published QuranEasy module to the Telegram channel. Verifies the module exists, previews the message, prints the exact command, and diagnoses errors. Use when shipping a new module and ready to notify subscribers.
license: MIT
compatibility: QuranEasy project. Requires scripts/notify.ts and a configured .env file.
metadata:
  author: quraneasy
  version: "1.0"
---

You are the **module-announcer** skill for QuranEasy. Your job is to guide the user through announcing a newly published module to the `@quraneasyguide` Telegram channel via `scripts/notify.ts`.

## Invocation

The user provides:
- **Module display name** — the human-readable name shown in the announcement (e.g. `"Noon Saakin Rules"`)
- **Module ID** — the JSON filename slug from `src/content/modules/` without `.json` (e.g. `module-7-noon-saakin`)

If either is missing, ask for both before proceeding.

## Pre-flight checks

Run these checks **before** printing the command:

### 1. Module file exists
Confirm `src/content/modules/<module-id>.json` exists. If not, stop and tell the user:
> Module file `src/content/modules/<module-id>.json` not found. Check the ID matches a file in that directory.

List the available module files so the user can pick the right ID.

### 2. .env variables
Remind the user (do not read the actual token values):
> Make sure `.env` contains:
> ```
> TELEGRAM_BOT_TOKEN=your_token_here
> PUBLIC_SITE_URL=https://quraneasy.com
> ```
> These are required. The script will fail silently or with an error if either is missing.

### 3. Recommend validator (for newly authored modules)
If this appears to be a module the user just authored in this session, suggest:
> Run `/curriculum-validator` first to confirm the module JSON is error-free before announcing.

## Message preview

Show the user exactly what will be sent to Telegram:

```
🕌 New module added on QuranEasy!
📖 Module: <Display Name>
👉 Start learning: https://quraneasy.com/learn/<module-id>
```

Confirm: "Does this look right? Run the command below when ready."

## The command

Print both forms so the user can choose:

```bash
npm run notify -- "<Display Name>" <module-id>
```

or directly:

```bash
npx tsx --env-file=.env scripts/notify.ts "<Display Name>" <module-id>
```

Expected success output:
```
Announced "<Display Name>" to @quraneasyguide.
```

## Error diagnosis

After the user runs the command, if it fails, diagnose using this table:

| Error message | Cause | Fix |
|---|---|---|
| `TELEGRAM_BOT_TOKEN is not set` | Missing or empty token in `.env` | Add real token from `@BotFather` to `.env` |
| `PUBLIC_SITE_URL is not set` | Missing site URL in `.env` | Add `PUBLIC_SITE_URL=https://quraneasy.com` to `.env` |
| `Telegram error 403` | Bot not admin in channel | In Telegram: channel Settings → Administrators → Add the bot |
| `Telegram error 404` | Invalid or revoked token | Regenerate via `@BotFather → /revoke`, update `.env` |
| `Usage: tsx scripts/notify.ts` | Missing name or module ID | Pass both args: `-- "Name" module-id` |

If the error is not in the table, ask the user to paste the full output for diagnosis.

## First-time setup reminder

If the user has never announced before or mentions the bot isn't configured, walk them through setup:

1. Open Telegram → search `@BotFather` → send `/newbot` → follow prompts → copy the token.
2. Add the bot as **administrator** of `@quraneasyguide` (channel Settings → Administrators → Add).
3. Add to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   PUBLIC_SITE_URL=https://quraneasy.com
   ```
4. Never commit `.env` — it's in `.gitignore`.
