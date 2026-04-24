const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const newsAggregator = require('./services/newsAggregator');
const monitorService = require('./services/monitorService');
const { setGlobalDispatcher, Agent } = require('undici');

// ─── High Performance Agent for Hugging Face ───
setGlobalDispatcher(new Agent({ 
    connect: { 
        timeout: 60000,
        family: 4 // Paksa IPv4
    },
    headersTimeout: 60000,
    bodyTimeout: 60000,
    connectRetries: 10
}));

// Validate token
if (!config.token || config.token === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ ERROR: Bot token belum dikonfigurasi!');
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
    rest: { timeout: 60000 }
});

// Load Commands & Events (Logic remains same)
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

client.once('ready', () => {
    newsAggregator.start(client);
    monitorService.start(client);
    console.log(`✅ Spark-Core Online! Melayani ${client.guilds.cache.size} Server.`);
});

// ─── Dashboard & Keep-Alive ───
const http = require('http');
const startTime = Date.now();
const server = http.createServer((req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h1>Spark-Core Status: ONLINE</h1><p>Uptime: ${uptime}s</p>`);
});
server.listen(process.env.PORT || 7860);

// ─── Login with Retry ───
const login = async () => {
    try {
        console.log('🔑 Attempting to login to Discord...');
        await client.login(config.token);
    } catch (error) {
        console.error('❌ Gagal login:', error.message);
        console.log('🔄 Mencoba ulang dalam 30 detik...');
        setTimeout(login, 30000); // Jeda lebih lama agar tidak dianggap spam
    }
};

login();
