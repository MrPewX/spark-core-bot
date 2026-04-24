const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config');

let monitorInterval;
let publicIP = 'Detecting...';
const startTime = Date.now();

// Ambil IP publik sekali saja
async function updateIP() {
    try {
        const res = await axios.get('https://api.ipify.org?format=json');
        publicIP = res.data.ip;
    } catch (err) {
        publicIP = 'Unavailable';
    }
}

async function sendStatus(client) {
    const channelId = config.channels.monitor;
    if (!channelId || channelId === 'YOUR_MONITOR_CHANNEL_ID') return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    // Hitung Uptime
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
        .setColor(config.branding.color)
        .setTitle('🖥️ Spark-Core | Live Status Monitor')
        .setDescription(`Laporan status sistem real-time dari server **Back4App**.`)
        .addFields(
            { name: '🤖 Bot Name', value: `**${client.user.username}**`, inline: true },
            { name: '🏰 Discord', value: `**${channel.guild.name}**`, inline: true },
            { name: '🌐 IP Address', value: `\`${publicIP}\``, inline: true },
            { name: '🟢 Status', value: 'Online & Active', inline: true },
            { name: '⏱️ Uptime', value: `${hours}h ${minutes}m`, inline: true },
            { name: '📡 Latensi', value: `${client.ws.ping > 0 ? client.ws.ping : '...'}ms`, inline: true },
            { name: '💾 Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
            { name: '🏠 Servers', value: `${client.guilds.cache.size} Servers`, inline: true },
            { name: '🕒 Last Update', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: 'Spark Community Monitor | v2.0' })
        .setTimestamp();

    // Cari pesan lama untuk di-edit agar tidak spam
    const messages = await channel.messages.fetch({ limit: 20 }).catch(() => []);
    const lastStatus = messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('Status Monitor'));

    if (lastStatus) {
        await lastStatus.edit({ embeds: [embed] }).catch(() => {});
    } else {
        await channel.send({ embeds: [embed] }).catch(() => {});
    }
}

module.exports = {
    start(client) {
        // Ambil IP pertama kali
        updateIP();

        // Kirim laporan pertama saat bot nyala
        setTimeout(() => sendStatus(client), 5000);

        // Update setiap 10 menit agar tidak kena rate limit tapi tetap fresh
        if (monitorInterval) clearInterval(monitorInterval);
        monitorInterval = setInterval(() => sendStatus(client), 10 * 60 * 1000);
        
        console.log('✅ Monitor Service diaktifkan (Laporan akan dikirim ke Discord)');
    },
    
    // Fungsi manual jika ingin lapor saat ada kejadian khusus (seperti mau restart)
    async reportRestart(client) {
        const channelId = config.channels.monitor;
        if (!channelId) return;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('🔄 System Restarting')
                .setDescription('Bot sedang melakukan restart otomatis untuk pembaruan sistem.')
                .setTimestamp();
            await channel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};
