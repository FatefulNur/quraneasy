const SUBCOMMANDS = ["module", "feature"] as const;
type Subcommand = (typeof SUBCOMMANDS)[number];

function isSubcommand(v: string): v is Subcommand {
  return (SUBCOMMANDS as readonly string[]).includes(v);
}

// Resolve subcommand — fall back to "module" for the legacy positional form:
//   notify.ts "<Name>" <module-id>
const rawCmd = process.argv[2] ?? "";
const cmd: Subcommand = isSubcommand(rawCmd) ? rawCmd : "module";
const args = isSubcommand(rawCmd) ? process.argv.slice(3) : process.argv.slice(2);

function usageAndExit(): never {
  process.stderr.write(
    "Usage:\n" +
      '  tsx scripts/notify.ts module "<Module Name>" <module-id>\n' +
      '  tsx scripts/notify.ts feature "<Title>" "<Description>" [/path]\n' +
      "\nLegacy form (module only):\n" +
      '  tsx scripts/notify.ts "<Module Name>" <module-id>\n',
  );
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  process.stderr.write("Error: TELEGRAM_BOT_TOKEN is not set in environment.\n");
  process.exit(1);
}

const siteUrl = (process.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
if (!siteUrl) {
  process.stderr.write("Error: PUBLIC_SITE_URL is not set in environment.\n");
  process.exit(1);
}

const channel = process.env.TELEGRAM_CHANNEL;
if (!channel) {
  process.stderr.write("Error: TELEGRAM_CHANNEL is not set in environment.\n");
  process.exit(1);
}

let text: string;
let previewUrl: string | undefined;

if (cmd === "module") {
  const [moduleName, moduleId] = args;
  if (!moduleName || !moduleId) usageAndExit();

  const moduleUrl = `${siteUrl}/learn/${moduleId}`;
  previewUrl = moduleUrl;
  text =
    `🕌 <b>New module on QuranEasy</b>\n\n` +
    `📖 <b>${moduleName}</b>\n\n` +
    `Begin learning at your own pace — open any topic in any order.\n\n` +
    `<a href="${moduleUrl}">👉 Start learning</a>`;
} else {
  // feature
  const [title, description, path] = args;
  if (!title || !description) usageAndExit();

  const featureUrl = path ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}` : siteUrl;
  previewUrl = featureUrl;
  text =
    `✨ <b>New on QuranEasy</b>\n\n` +
    `🎉 <b>${title}</b>\n\n` +
    `${description}\n\n` +
    `<a href="${featureUrl}">👉 Check it out</a>`;
}

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: channel,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: false, url: previewUrl },
  }),
});

if (!res.ok) {
  const body = await res.text();
  process.stderr.write(`Telegram error ${res.status}: ${body}\n`);
  process.exit(1);
}

const label = cmd === "module" ? `module "${args[0]}"` : `feature "${args[0]}"`;
console.log(`Announced ${label} to ${channel}.`);
