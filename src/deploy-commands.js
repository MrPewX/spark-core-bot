const { REST, Routes } = require('discord.js');
const config = require('./config');
const path = require('path');

// Langsung tunjuk ke file spark.js sebagai satu-satunya perintah utama
const sparkCommand = require('./commands/spark.js');
const commands = [sparkCommand.data.toJSON()];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`🔄 Mendaftarkan perintah utama: /${sparkCommand.data.name}`);

        if (config.guildId) {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands },
            );
            console.log('✅ BERHASIL! Perintah /spark sudah aktif secara INSTAN di server kamu.');
        } else {
            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands },
            );
            console.log('✅ BERHASIL! Perintah /spark didaftarkan secara GLOBAL.');
        }
        console.log('💡 Silakan Refresh Discord (Ctrl+R) jika menu belum muncul.');
    } catch (error) {
        console.error('❌ Gagal mendaftarkan commands:');
        console.error(error);
    }
})();
