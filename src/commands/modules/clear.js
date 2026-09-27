const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config');

function isAdmin(member) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator) ||
           member.roles.cache.some(role => role.name.toLowerCase().includes('admin'));
}

module.exports = {
    data: { name: 'clear' },

    async execute(interaction) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({ content: '❌ Kamu tidak memiliki akses.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('jumlah');
        
        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            
            const embed = new EmbedBuilder()
                .setColor(config.branding.successColor)
                .setDescription(`✅ Berhasil menghapus **${deleted.size}** pesan!`)
                .setFooter({ text: 'Pesan otomatis terhapus dalam 5 detik' });

            await interaction.reply({ embeds: [embed] });
            
            // Hapus pesan konfirmasi setelah 5 detik
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            
        } catch (err) {
            console.error(err);
            await interaction.reply({ 
                content: '❌ Gagal menghapus pesan. Pastikan pesan tidak lebih dari 14 hari.', 
                ephemeral: true 
            });
        }
    },
};
