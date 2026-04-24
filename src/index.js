const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const config = require('./config');

// ─── Browser Spoofing ───
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const originalRequest = https.request;
https.request = function(options, callback) {
    if (typeof options === 'object') {
        options.family = 4;
        options.headers = options.headers || {};
        options.headers['User-Agent'] = USER_AGENT;
    }
    return originalRequest.call(this, options, callback);
};

// Inisialisasi Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    rest: { 
        timeout: 60000,
        userAgentExtra: USER_AGENT
    }
});

client.commands = new Collection();

// ─── Web Dashboard ───
const startTime = Date.now();
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h1>Spark-Core: STATUS ACTIVE</h1><p>Uptime: ${Math.floor((Date.now() - startTime)/1000)}s</p>`);
}).listen(process.env.PORT || 7860);

// ─── Loading Modules ───
const loadModules = () => {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.execute) client.commands.set(command.data.name, command);
    }
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }
    require('./services/newsAggregator').start(client);
    require('./services/monitorService').start(client);
};

// ─── Startup Logic ───
const startBot = async () => {
    console.log('⏳ Menunggu stabilitas sistem (15 detik)...');
    await new Promise(r => setTimeout(r, 15000));

    try {
        console.log('🔑 Mencoba login dengan profil Browser...');
        await client.login(config.token);
        console.log('✅ LOGIN BERHASIL!');
        loadModules();
    } catch (error) {
        console.error('❌ Gagal:', error.message);
        setTimeout(startBot, 30000);
    }
};

startBot();
