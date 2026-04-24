const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: { name: 'kick' },

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('alasan');

        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: '❌ Kamu tidak punya izin untuk melakukan kick!', ephemeral: true });
        }

        if (!target) {
            return interaction.reply({ content: '❌ Member tidak ditemukan!', ephemeral: true });
        }

        if (!target.kickable) {
            return interaction.reply({ content: '❌ Saya tidak bisa melakukan kick pada member ini (Role mereka mungkin lebih tinggi).', ephemeral: true });
        }

        await target.kick(reason);

        const embed = new EmbedBuilder()
            .setColor(config.branding.errorColor)
            .setTitle('👢 Member Kicked')
            .addFields(
                { name: '👤 Target', value: `${target.user.tag}`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: '📝 Alasan', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
