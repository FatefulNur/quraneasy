const moduleName = process.argv[2];

if (!moduleName) {
  process.stderr.write('Usage: tsx scripts/notify.ts "<Module Name>"\n');
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  process.stderr.write("Error: TELEGRAM_BOT_TOKEN is not set in environment.\n");
  process.exit(1);
}

const text =
  `🕌 New module added on QuranEasy!\n` +
  `📖 Module: ${moduleName}\n` +
  `👉 Start learning: https://quraneasy.com/learn`;

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: "@quraneasyguide", text }),
});

if (!res.ok) {
  const body = await res.text();
  process.stderr.write(`Telegram error ${res.status}: ${body}\n`);
  process.exit(1);
}

console.log(`Announced "${moduleName}" to @quraneasyguide.`);
