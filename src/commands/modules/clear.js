const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: { name: 'clear' },

    async execute(interaction) {
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
