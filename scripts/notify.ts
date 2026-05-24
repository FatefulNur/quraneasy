const moduleName = process.argv[2];
const moduleId = process.argv[3];

if (!moduleName || !moduleId) {
  process.stderr.write('Usage: tsx scripts/notify.ts "<Module Name>" <module-id>\n');
  process.stderr.write('Example: tsx scripts/notify.ts "Tajweed Basics" module-1-tajweed-basics\n');
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

const moduleUrl = `${siteUrl}/learn/${moduleId}`;

const text =
  `🕌 New module added on QuranEasy!\n` +
  `📖 Module: ${moduleName}\n` +
  `👉 Start learning: ${moduleUrl}`;

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: channel, text }),
});

if (!res.ok) {
  const body = await res.text();
  process.stderr.write(`Telegram error ${res.status}: ${body}\n`);
  process.exit(1);
}

console.log(`Announced "${moduleName}" to ${channel}.`);
