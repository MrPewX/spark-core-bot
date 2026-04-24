const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const http = require('http');
const config = require('./config');

// Paksa IPv4 untuk Hugging Face
dns.setDefaultResultOrder('ipv4first');

// Inisialisasi Client dengan timeout tinggi
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    rest: { timeout: 60000 }
});

client.commands = new Collection();

// ─── Web Dashboard (Wajib agar HF tetap hidup) ───
const startTime = Date.now();
http.createServer((req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h1>Spark-Core Status: ONLINE</h1><p>Uptime: ${uptime}s</p>`);
}).listen(process.env.PORT || 7860);

// ─── Loading Function (Dijalankan SETELAH Online) ───
const loadModules = () => {
    // Load Commands
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.execute) client.commands.set(command.data.name, command);
    }

    // Load Events
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }

    // Load Services
    const newsAggregator = require('./services/newsAggregator');
    const monitorService = require('./services/monitorService');
    newsAggregator.start(client);
    monitorService.start(client);
    
    console.log(`✅ Semua fitur (Moderasi, Kas, Monitor) telah AKTIF!`);
};

// ─── Login Logic dengan Retry ───
const startBot = async () => {
    console.log('⏳ Menunggu stabilitas jaringan (5 detik)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        console.log('🔑 Mencoba login ke Discord...');
        await client.login(config.token);
        console.log('✅ BERHASIL LOGIN!');
        
        // Panggil loading modul SETELAH login berhasil
        loadModules();
        
    } catch (error) {
        console.error('❌ Gagal login:', error.message);
        console.log('🔄 Mencoba ulang dalam 30 detik...');
        setTimeout(startBot, 30000);
    }
};

startBot();
