## ADDED Requirements

### Requirement: Broadcast new-module announcement via CLI

The system SHALL provide a CLI script at `scripts/notify.ts` that, when invoked with a module display name, posts a formatted announcement to the `@quraneasyguide` Telegram channel via the Telegram Bot API.

The posted message SHALL match this template exactly (literal newlines, literal emojis):

```
🕌 New module added on QuranEasy!
📖 Module: <module name>
👉 Start learning: https://quraneasy.com/learn
```

#### Scenario: Successful broadcast

- **WHEN** the maintainer runs `npx tsx scripts/notify.ts "Tajweed Basics"` with `TELEGRAM_BOT_TOKEN` set in `.env`
- **THEN** the script POSTs to `https://api.telegram.org/bot<token>/sendMessage` with `chat_id=@quraneasyguide` and the templated text
- **AND** on a 2xx response the script prints a success line and exits with code 0

#### Scenario: Missing module name argument

- **WHEN** the maintainer runs `npx tsx scripts/notify.ts` with no positional argument
- **THEN** the script prints a usage hint to stderr (`Usage: tsx scripts/notify.ts "<Module Name>"`)
- **AND** exits with a non-zero code without contacting Telegram

#### Scenario: Missing bot token

- **WHEN** `TELEGRAM_BOT_TOKEN` is unset or empty
- **THEN** the script prints an error naming the missing variable to stderr
- **AND** exits with a non-zero code without contacting Telegram

#### Scenario: Telegram API rejects the request

- **WHEN** Telegram responds with a non-2xx status (e.g. bot not in channel, invalid token)
- **THEN** the script prints the response status and body to stderr
- **AND** exits with a non-zero code

### Requirement: Credential handling

The bot token SHALL be read from the `TELEGRAM_BOT_TOKEN` environment variable, sourced from `.env` (which is gitignored). The token SHALL NOT be accepted as a CLI argument and SHALL NOT be logged or printed.

`.env.example` SHALL contain a `TELEGRAM_BOT_TOKEN=` line with an empty value so contributors know the variable exists.

#### Scenario: Token never appears in output

- **WHEN** the script runs successfully or fails for any reason
- **THEN** the value of `TELEGRAM_BOT_TOKEN` does not appear in stdout or stderr

#### Scenario: .env.example documents the variable

- **WHEN** a contributor reads `.env.example`
- **THEN** they see `TELEGRAM_BOT_TOKEN=` with an empty value

### Requirement: Maintainer documentation

`CLAUDE.md` SHALL describe how to use the broadcast script, including the npm/npx invocation, the required env variable, and a note that the bot must be a channel administrator.

#### Scenario: Usage discoverable from CLAUDE.md

- **WHEN** a contributor reads `CLAUDE.md`
- **THEN** they find a section explaining how to broadcast a new module and what `TELEGRAM_BOT_TOKEN` must be set to
