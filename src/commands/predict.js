// /predict [image_url] - ML Image Classification Demo
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('predict')
        .setDescription('🧠 Klasifikasi gambar menggunakan ML (demo edukasi)')
        .addStringOption(o => o.setName('image_url').setDescription('URL gambar').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const imageUrl = interaction.options.getString('image_url');

        try { new URL(imageUrl); } catch {
            return interaction.editReply({ content: '❌ URL tidak valid!' });
        }

        const labels = [
            { label: 'Electronic Component', confidence: 0.89 },
            { label: 'Circuit Board', confidence: 0.76 },
            { label: 'Microcontroller', confidence: 0.65 },
            { label: 'Sensor Module', confidence: 0.42 },
            { label: 'LED Display', confidence: 0.23 },
        ].map(p => ({
            ...p,
            confidence: Math.min(0.99, Math.max(0.05, p.confidence + (Math.random() - 0.5) * 0.2)),
        })).sort((a, b) => b.confidence - a.confidence);

        const bar = (c) => { const f = Math.round(c * 20); return `\`${'█'.repeat(f)}${'░'.repeat(20 - f)}\``; };
        const emoji = ['🥇', '🥈', '🥉', '▫️', '▫️'];

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('🧠 ML Image Classification')
            .setDescription('> **Mode:** Demo Edukasi — hubungkan ke Teachable Machine untuk model nyata')
            .setThumbnail(imageUrl)
            .addFields(labels.map((p, i) => ({
                name: `${emoji[i]} ${p.label}`,
                value: `${bar(p.confidence)} **${(p.confidence * 100).toFixed(1)}%**`,
                inline: false,
            })))
            .setFooter({ text: `${config.branding.footerText} | ML Playground` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Teachable Machine').setURL('https://teachablemachine.withgoogle.com/').setStyle(ButtonStyle.Link).setEmoji('🤖'),
            new ButtonBuilder().setLabel('TensorFlow.js').setURL('https://www.tensorflow.org/js').setStyle(ButtonStyle.Link).setEmoji('🧪'),
        );
        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};
