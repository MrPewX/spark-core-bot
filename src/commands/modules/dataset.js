// ============================================
// /dataset [keyword] - Mencari dataset di Kaggle
// ============================================

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dataset')
        .setDescription('📦 Mencari dataset yang relevan di Kaggle')
        .addStringOption(option =>
            option
                .setName('keyword')
                .setDescription('Kata kunci pencarian dataset')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const keyword = interaction.options.getString('keyword');

        // Jika Kaggle API tersedia, gunakan itu
        if (config.kaggle.username && config.kaggle.key) {
            try {
                const response = await axios.get(
                    `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(keyword)}&maxSize=&minSize=&sortBy=hottest&filetype=all`,
                    {
                        auth: {
                            username: config.kaggle.username,
                            password: config.kaggle.key,
                        },
                        timeout: 10000,
                    }
                );

                const datasets = response.data.slice(0, 5);

                if (datasets.length === 0) {
                    return interaction.editReply({
                        embeds: [createNoResultEmbed(keyword)],
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(config.branding.color)
                    .setTitle(`📦 Kaggle Datasets: "${keyword}"`)
                    .setDescription(`Ditemukan **${response.data.length}** dataset. Menampilkan 5 teratas:`)
                    .setFooter({ text: `${config.branding.footerText} | Kaggle API` })
                    .setTimestamp();

                datasets.forEach((ds, i) => {
                    embed.addFields({
                        name: `${i + 1}. ${ds.title || ds.ref}`,
                        value: [
                            `👤 **Creator:** ${ds.creatorName || 'Unknown'}`,
                            `📥 **Downloads:** ${(ds.downloadCount || 0).toLocaleString()}`,
                            `⭐ **Usability:** ${ds.usabilityRating ? (ds.usabilityRating * 10).toFixed(1) : 'N/A'}/10`,
                            `🔗 [Buka di Kaggle](https://www.kaggle.com/datasets/${ds.ref})`,
                        ].join('\n'),
                        inline: false,
                    });
                });

                return interaction.editReply({ embeds: [embed] });
            } catch (error) {
                // Fallback ke pencarian URL jika API gagal
            }
        }

        // Fallback: berikan link pencarian langsung
        const searchUrl = `https://www.kaggle.com/datasets?search=${encodeURIComponent(keyword)}`;
        const googleDatasetUrl = `https://datasetsearch.research.google.com/search?query=${encodeURIComponent(keyword)}`;
        const paperswithcodeUrl = `https://paperswithcode.com/datasets?q=${encodeURIComponent(keyword)}`;

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle(`📦 Dataset Search: "${keyword}"`)
            .setDescription(
                'Berikut adalah link pencarian dataset dari berbagai sumber:\n\n' +
                '> 💡 **Tip:** Untuk hasil langsung dari Kaggle API, tambahkan\n' +
                '> `KAGGLE_USERNAME` dan `KAGGLE_KEY` di file `.env`'
            )
            .addFields(
                {
                    name: '🔷 Kaggle Datasets',
                    value: `[🔍 Cari "${keyword}" di Kaggle](${searchUrl})`,
                    inline: false,
                },
                {
                    name: '🟢 Google Dataset Search',
                    value: `[🔍 Cari "${keyword}" di Google](${googleDatasetUrl})`,
                    inline: false,
                },
                {
                    name: '📄 Papers With Code',
                    value: `[🔍 Cari "${keyword}" di PWC](${paperswithcodeUrl})`,
                    inline: false,
                },
                {
                    name: '🏷️ Dataset Populer untuk IoT & ML',
                    value: [
                        '• [MNIST](https://www.kaggle.com/datasets/hojjatk/mnist-dataset) — Klasifikasi digit',
                        '• [CIFAR-10](https://www.kaggle.com/c/cifar-10) — Image classification',
                        '• [IoT Sensor Data](https://www.kaggle.com/datasets/garystafford/environmental-sensor-data-132k) — Sensor lingkungan',
                        '• [Air Quality](https://www.kaggle.com/datasets/fedesoriano/air-quality-data-set) — Kualitas udara',
                    ].join('\n'),
                    inline: false,
                },
            )
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Buka Kaggle')
                .setURL(searchUrl)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔷'),
            new ButtonBuilder()
                .setLabel('Google Dataset')
                .setURL(googleDatasetUrl)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🟢'),
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};

function createNoResultEmbed(keyword) {
    return new EmbedBuilder()
        .setColor(config.branding.warningColor)
        .setTitle(`📦 Dataset Search: "${keyword}"`)
        .setDescription(`Tidak ditemukan dataset untuk keyword **"${keyword}"**.`)
        .addFields({
            name: '💡 Tips',
            value: '• Coba gunakan kata kunci dalam bahasa Inggris\n• Gunakan kata kunci yang lebih umum\n• Cek ejaan kata kunci',
        })
        .setFooter({ text: config.branding.footerText })
        .setTimestamp();
}
