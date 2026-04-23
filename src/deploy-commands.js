// ============================================
// DEPLOY COMMANDS — Register slash commands to Discord
// Run: node src/deploy-commands.js
// ============================================

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`  ✅ Loaded: /${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('');
        console.log(`🔄 Mendaftarkan ${commands.length} slash commands...`);

        if (config.guildId) {
            // Guild commands (instant, good for development)
            const data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands },
            );
            console.log(`✅ Berhasil mendaftarkan ${data.length} guild commands!`);
        } else {
            // Global commands (takes ~1 hour to propagate)
            const data = await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands },
            );
            console.log(`✅ Berhasil mendaftarkan ${data.length} global commands!`);
            console.log('⚠️  Global commands perlu ~1 jam untuk aktif di semua server.');
        }

        console.log('');
        console.log('🎉 Sekarang jalankan bot dengan: node src/index.js');
        console.log('');
    } catch (error) {
        console.error('❌ Gagal mendaftarkan commands:', error);
    }
})();
