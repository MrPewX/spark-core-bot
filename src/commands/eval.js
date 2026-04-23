// ============================================
// /eval [metric] - Menjelaskan istilah ML
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('📚 Menjelaskan istilah evaluasi Machine Learning')
        .addStringOption(option =>
            option
                .setName('metric')
                .setDescription('Pilih metrik yang ingin dipelajari')
                .setRequired(true)
                .addChoices(
                    { name: '🎯 Accuracy', value: 'accuracy' },
                    { name: '🔬 Precision', value: 'precision' },
                    { name: '📡 Recall (Sensitivity)', value: 'recall' },
                    { name: '⚖️ F1-Score', value: 'f1-score' },
                    { name: '📏 RMSE', value: 'rmse' },
                    { name: '📐 MAE', value: 'mae' },
                    { name: '📊 R² Score', value: 'r2' },
                    { name: '📈 AUC-ROC', value: 'auc-roc' },
                    { name: '🧮 Confusion Matrix', value: 'confusion-matrix' },
                    { name: '🔥 Overfitting', value: 'overfitting' },
                    { name: '❄️ Underfitting', value: 'underfitting' },
                )
        ),

    async execute(interaction) {
        const metricKey = interaction.options.getString('metric');
        const metric = config.mlGlossary[metricKey];

        if (!metric) {
            return interaction.reply({
                content: '❌ Metrik tidak ditemukan!',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle(metric.title)
            .setDescription(metric.desc)
            .addFields(
                { name: '🧮 Formula', value: `\`\`\`\n${metric.formula}\n\`\`\``, inline: false },
                { name: '📝 Contoh', value: metric.example, inline: false },
                { name: '💡 Catatan', value: metric.warning, inline: false },
            )
            .setFooter({ text: `${config.branding.footerText} | ML Education` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
