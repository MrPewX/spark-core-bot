const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/database');
const config = require('../../config');

module.exports = {
    data: { name: 'warn' },

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('alasan');
        const moderator = interaction.user;

        const warnCount = db.addWarning(target.id, moderator.id, reason);

        const embed = new EmbedBuilder()
            .setColor(config.branding.warningColor)
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: '👤 Target', value: `${target.tag} (${target.id})`, inline: true },
                { name: '👮 Moderator', value: moderator.tag, inline: true },
                { name: '📝 Alasan', value: reason, inline: false },
                { name: '📊 Total Warn', value: `${warnCount}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // DM Target
        try {
            await target.send(`⚠️ Kamu menerima peringatan di **${interaction.guild.name}**\n**Alasan:** ${reason}\n**Total Pelanggaran:** ${warnCount}`);
        } catch (err) {
            console.log(`Gagal kirim DM ke ${target.tag}`);
        }
    },
};
