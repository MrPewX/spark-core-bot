// Event: Bot ready
const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║         ⚡ SPARK-CORE BOT ACTIVE ⚡       ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log(`║  Bot    : ${client.user.tag.padEnd(30)}║`);
        console.log(`║  ID     : ${client.user.id.padEnd(30)}║`);
        console.log(`║  Guilds : ${String(client.guilds.cache.size).padEnd(30)}║`);
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('🚀 Interaction handler siap menerima perintah!');

        // Set bot status
        client.user.setPresence({
            activities: [{
                name: '⚡ /help | Spark Community',
                type: ActivityType.Watching,
            }],
            status: 'online',
        });
    },
};
