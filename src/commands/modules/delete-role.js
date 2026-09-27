const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// Helper: cek apakah user adalah admin
function isAdmin(member) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
           member.roles.cache.some(role => role.name.toLowerCase().includes('admin'));
}

module.exports = {
    data: { name: 'delete-role' },
    async execute(interaction) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({ content: '❌ Kamu tidak memiliki akses.', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');

        if (!targetUser) {
            return interaction.reply({ content: '❌ User tidak ditemukan di server ini.', ephemeral: true });
        }

        if (!targetUser.roles.cache.has(targetRole.id)) {
            return interaction.reply({ content: `❌ ${targetUser} tidak memiliki role **${targetRole.name}**.`, ephemeral: true });
        }

        try {
            await targetUser.roles.remove(targetRole);

            const embed = new EmbedBuilder()
                .setColor('#ef4444')
                .setDescription(`✅ Berhasil menghapus role **${targetRole.name}** dari ${targetUser}.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error delete-role:', error);
            await interaction.reply({ content: '❌ Gagal menghapus role. Pastikan posisi role bot berada di atas role yang ingin dihapus.', ephemeral: true });
        }
    }
};
