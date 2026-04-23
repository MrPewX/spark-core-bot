// ============================================
// SPARK-CORE BOT — Main Entry Point
// ============================================

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const newsAggregator = require('./services/newsAggregator');

// Validate token
if (!config.token || config.token === 'YOUR_BOT_TOKEN_HERE') {
    console.error('');
    console.error('╔══════════════════════════════════════════════╗');
    console.error('║  ❌ ERROR: Bot token belum dikonfigurasi!     ║');
    console.error('║                                              ║');
    console.error('║  1. Buka file .env                           ║');
    console.error('║  2. Isi DISCORD_TOKEN dengan token bot kamu  ║');
    console.error('║  3. Jalankan ulang bot                       ║');
    console.error('╚══════════════════════════════════════════════╝');
    console.error('');
    process.exit(1);
}

// Create client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// ─── Load Commands ───
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

console.log('');
console.log('📦 Loading commands...');
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`  ✅ /${command.data.name}`);
    }
}

// ─── Load Events ───
console.log('');
console.log('📡 Loading events...');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`  ✅ ${event.name}`);
}

// ─── Start News Aggregator ───
client.once('clientReady', () => {
    newsAggregator.start(client);
});

// ─── Keep-Alive Server (For Render/Railway) ───
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Spark-Core is online! ⚡');
});
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`📡 Keep-alive server listening on port ${PORT}`);
});

// ─── Login ───
console.log('');
console.log('🔑 Logging in...');
client.login(config.token);
