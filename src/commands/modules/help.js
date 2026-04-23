// /help - Menampilkan semua command bot
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📖 Menampilkan daftar semua perintah Spark-Core'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('⚡ Spark-Core Command Center')
            .setDescription('Selamat datang di pusat kendali Spark-Core. Gunakan prefix `/spark` diikuti oleh perintah di bawah ini:')
            .addFields(
                {
                    name: '👤 Umum',
                    value: [
                        '`/setup-profile` — Pilih role sesuai minatmu',
                        '`/project-submit` — Daftarkan project ke showcase',
                        '`/help` — Menampilkan daftar perintah ini',
                    ].join('\n'),
                    inline: false,
                },
            )
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
