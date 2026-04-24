// ============================================
// SPARK-CORE BOT — Main Entry Point
// ============================================

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const newsAggregator = require('./services/newsAggregator');
const monitorService = require('./services/monitorService');

const { setGlobalDispatcher, Agent } = require('undici');

// Paksa gunakan IPv4 untuk menembus timeout jaringan di Hugging Face
// Paksa gunakan IPv4 dan perkuat keep-alive untuk Hugging Face
setGlobalDispatcher(new Agent({ 
    connect: { 
        timeout: 60000,
        family: 4 
    },
    headersTimeout: 60000,
    bodyTimeout: 60000,
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 60000
}));

// (Global dispatcher configured for IPv4 compatibility)

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

// Create client with standard configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// ─── Load Commands ───
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Hanya load file .js di folder commands (seperti spark.js)
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

console.log('');
console.log('📦 Loading main commands...');
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

// ─── Start Services ───
client.once('ready', () => {
    newsAggregator.start(client);
    monitorService.start(client);
});

// ─── Monitoring Dashboard Stats ───
const startTime = Date.now();

// ─── Keep-Alive & Dashboard Server ───
const http = require('http');
const server = http.createServer((req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Spark-Core | Status Hub</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); width: 400px; text-align: center; }
                .status-dot { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 15px #22c55e; animation: pulse 2s infinite; }
                h1 { font-weight: 600; letter-spacing: -1px; margin-bottom: 0.5rem; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
                .stat-box { background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
                .stat-value { font-size: 1.1rem; font-weight: 600; margin-top: 0.25rem; color: #e2e8f0; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            </style>
        </head>
        <body>
            <div class="glass">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                    <span class="status-dot"></span>
                    <span style="color: #22c55e; font-weight: 600; font-size: 0.9rem;">SYSTEM ACTIVE</span>
                </div>
                <h1>Spark-Core Bot</h1>
                <p style="color: #94a3b8; font-size: 0.9rem;">IoT & ML Community Hub</p>
                
                <div class="stat-grid">
                    <div class="stat-box">
                        <div class="stat-label">Uptime</div>
                        <div class="stat-value">${hours}h ${minutes}m ${seconds}s</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Servers</div>
                        <div class="stat-value">${client.guilds.cache.size}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Memory</div>
                        <div class="stat-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Latensi</div>
                        <div class="stat-value">${client.ws.ping}ms</div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; font-size: 0.7rem; color: #475569;">
                    &copy; 2026 Spark Community &bull; Running on Hugging Face
                </div>
            </div>
        </body>
        </html>
    `);
});
const PORT = process.env.PORT || 7860;
server.listen(PORT, () => {
    console.log(`📡 Dashboard listening on port ${PORT}`);
});

// ─── Login ───
const login = async () => {
    if (!config.token) {
        console.error('❌ ERROR: DISCORD_TOKEN tidak ditemukan di environment!');
        return;
    }
    console.log(`🔑 Attempting to login... (Token Length: ${config.token.length})`);
    try {
        await client.login(config.token);
    } catch (error) {
        console.error('❌ Gagal login ke Discord:', error.message);
        console.log('🔄 Mencoba ulang dalam 15 detik...');
        setTimeout(login, 15000);
    }
};

login();

// Handle unhandled rejections
process.on('unhandledRejection', error => {
    console.error('⚠️ Unhandled promise rejection:', error);
});
