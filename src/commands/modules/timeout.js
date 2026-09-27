const { PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config');

function isAdmin(member) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
           member.roles.cache.some(role => role.name.toLowerCase().includes('admin'));
}

module.exports = {
    data: { name: 'timeout' },

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('durasi');
        const reason = interaction.options.getString('alasan');

        if (!isAdmin(interaction.member)) {
            return interaction.reply({ content: '❌ Kamu tidak memiliki akses.', ephemeral: true });
        }

        if (!target) {
            return interaction.reply({ content: '❌ Member tidak ditemukan!', ephemeral: true });
        }

        try {
            await target.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setColor(config.branding.warningColor)
                .setTitle('🔇 Member Timed Out')
                .addFields(
                    { name: '👤 Target', value: `${target.user.tag}`, inline: true },
                    { name: '⏱️ Durasi', value: `${duration} menit`, inline: true },
                    { name: '📝 Alasan', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Gagal menerapkan timeout. Pastikan role saya lebih tinggi dari target.', ephemeral: true });
        }
    },
};
