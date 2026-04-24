const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: { name: 'ban' },

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('alasan');

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ Kamu tidak punya izin untuk melakukan ban!', ephemeral: true });
        }

        if (!target) {
            return interaction.reply({ content: '❌ Member tidak ditemukan!', ephemeral: true });
        }

        if (!target.bannable) {
            return interaction.reply({ content: '❌ Saya tidak bisa melakukan ban pada member ini.', ephemeral: true });
        }

        await target.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🔨 Member Banned')
            .addFields(
                { name: '👤 Target', value: `${target.user.tag}`, inline: true },
                { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: '📝 Alasan', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
