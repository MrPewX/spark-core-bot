// /help - Menampilkan semua command bot
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📖 Menampilkan daftar semua perintah Spark-Core'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('📖 Spark-Core — Command Guide')
            .setDescription('Berikut adalah daftar semua perintah yang tersedia:')
            .addFields(
                {
                    name: '🔌 IoT Commands',
                    value: [
                        '`/pin-out` — Menampilkan pinout microcontroller',
                        '`/check-mqtt` — Cek status broker MQTT',
                        '`/status-alat` — Live monitoring data sensor IoT',
                    ].join('\n'),
                    inline: false,
                },
                {
                    name: '🧠 ML Commands',
                    value: [
                        '`/predict` — Klasifikasi gambar (demo ML)',
                        '`/classify` — Klasifikasi teks (demo NLP)',
                        '`/dataset` — Cari dataset di Kaggle',
                        '`/eval` — Penjelasan metrik evaluasi ML',
                    ].join('\n'),
                    inline: false,
                },
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
