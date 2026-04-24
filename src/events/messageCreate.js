const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');

// List kata-kata kasar (Contoh sederhana, bisa diperbanyak)
const badWords = ['anjing', 'bangsat', 'tolol', 'goblok', 'kontol', 'memek'];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // --- Auto Mod: Filter Kata Kasar ---
        const content = message.content.toLowerCase();
        const hasBadWord = badWords.some(word => content.includes(word));

        if (hasBadWord && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            await message.delete().catch(console.error);
            
            const warnEmbed = new EmbedBuilder()
                .setColor(config.branding.errorColor)
                .setAuthor({ name: 'Spark Security' })
                .setDescription(`🚫 <@${message.author.id}>, pesan kamu dihapus karena mengandung kata-kata yang tidak diperbolehkan.`)
                .setTimestamp();

            const warning = await message.channel.send({ embeds: [warnEmbed] });
            setTimeout(() => warning.delete().catch(() => {}), 5000);
            return;
        }

        // --- Auto Mod: Blokir Link Spam (Kecuali Admin) ---
        const linkPattern = /(https?:\/\/[^\s]+)/g;
        if (linkPattern.test(message.content) && !message.member.permissions.has(PermissionFlagsBits.EmbedLinks)) {
            // Cek apakah channel diperbolehkan share link (Opsional)
            // if (message.channel.id !== config.channels.allowedLinks) { ... }
            
            await message.delete().catch(console.error);
            
            const linkEmbed = new EmbedBuilder()
                .setColor(config.branding.warningColor)
                .setDescription(`⚠️ <@${message.author.id}>, kamu tidak diizinkan mengirim link di sini.`)
                .setTimestamp();

            const warning = await message.channel.send({ embeds: [linkEmbed] });
            setTimeout(() => warning.delete().catch(() => {}), 5000);
        }
    },
};
