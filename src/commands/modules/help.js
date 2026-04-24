const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: { name: 'help' },

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('⚡ Spark-Core Command Center')
            .setDescription('Gunakan prefix `/spark` diikuti oleh perintah di bawah ini:')
            .addFields(
                { 
                    name: '👤 Umum', 
                    value: '• `setup-profile` - Onboarding & role\n• `project-submit` - Showcase project\n• `help` - Menu bantuan',
                    inline: false 
                },
                { 
                    name: '🤖 IoT & ML', 
                    value: '• `status-alat` - Monitoring IoT\n• `pin-out` - Referensi Pin MCU\n• `predict` / `classify` - Fitur ML',
                    inline: false 
                },
                { 
                    name: '🛡️ Moderasi', 
                    value: '• `clear` - Hapus pesan masal\n• `warn` - Beri peringatan\n• `timeout` / `kick` / `ban` - Kontrol member',
                    inline: false 
                },
                { 
                    name: '💰 Keuangan (Kas)', 
                    value: '• `kas bayar` - Input uang masuk\n• `kas cek` - Cek status member\n• `kas laporan` - Rekap keuangan',
                    inline: false 
                }
            )
            .setFooter({ text: 'Spark Community Hub', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
