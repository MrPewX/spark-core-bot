const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: { name: 'give-role' },
    async execute(interaction) {
        // Cek apakah user yang memanggil memiliki permission Administrator atau role bernama "Admin"
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                        interaction.member.roles.cache.some(role => role.name.toLowerCase().includes('admin'));

        if (!isAdmin) {
            return interaction.reply({ content: '❌ Kamu tidak memiliki akses.', ephemeral: true });
        }

        const targetUser = interaction.options.getMember('user');
        const targetRole = interaction.options.getRole('role');

        if (!targetUser) {
            return interaction.reply({ content: '❌ User tidak ditemukan di server ini.', ephemeral: true });
        }

        try {
            // Berikan role ke user
            await targetUser.roles.add(targetRole);
            
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setDescription(`✅ Berhasil memberikan role **${targetRole.name}** kepada ${targetUser}.`);
                
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error give-role:', error);
            await interaction.reply({ content: '❌ Gagal memberikan role. Pastikan posisi role bot berada di atas role yang ingin diberikan.', ephemeral: true });
        }
    }
};
