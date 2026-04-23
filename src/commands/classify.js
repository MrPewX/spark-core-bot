// /classify [text] - Text Classification Demo
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classify')
        .setDescription('📝 Klasifikasi teks menggunakan ML (demo edukasi)')
        .addStringOption(o => o.setName('text').setDescription('Teks yang ingin diklasifikasi').setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('text');
        const lower = text.toLowerCase();

        // Simple keyword-based classification demo
        const categories = {
            'IoT / Hardware': ['sensor', 'arduino', 'esp32', 'raspberry', 'gpio', 'mqtt', 'relay', 'motor', 'led', 'wifi', 'bluetooth', 'microcontroller', 'pcb', 'circuit'],
            'Machine Learning': ['model', 'training', 'neural', 'dataset', 'prediction', 'classification', 'regression', 'tensorflow', 'pytorch', 'accuracy', 'loss', 'epoch', 'cnn', 'rnn', 'nlp'],
            'Programming': ['code', 'function', 'variable', 'loop', 'api', 'database', 'server', 'deploy', 'git', 'debug', 'error', 'python', 'javascript', 'java'],
            'Data Science': ['data', 'analysis', 'visualization', 'pandas', 'numpy', 'statistics', 'chart', 'dashboard', 'insight'],
            'General': [],
        };

        const scores = {};
        for (const [cat, keywords] of Object.entries(categories)) {
            scores[cat] = keywords.filter(k => lower.includes(k)).length;
        }
        if (Object.values(scores).every(v => v === 0)) scores['General'] = 1;

        const total = Math.max(Object.values(scores).reduce((a, b) => a + b, 0), 1);
        const results = Object.entries(scores)
            .map(([cat, score]) => ({ cat, confidence: score / total }))
            .sort((a, b) => b.confidence - a.confidence)
            .filter(r => r.confidence > 0);

        const bar = (c) => { const f = Math.round(c * 20); return `\`${'█'.repeat(f)}${'░'.repeat(20 - f)}\``; };

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('📝 Text Classification')
            .setDescription(`> **Input:** "${text.length > 100 ? text.slice(0, 100) + '...' : text}"\n\n**Hasil Klasifikasi:**`)
            .addFields(results.map((r, i) => ({
                name: `${i === 0 ? '🏆' : '▫️'} ${r.cat}`,
                value: `${bar(r.confidence)} **${(r.confidence * 100).toFixed(1)}%**`,
                inline: false,
            })))
            .setFooter({ text: `${config.branding.footerText} | NLP Demo` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
