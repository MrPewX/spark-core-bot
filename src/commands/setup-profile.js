// /setup-profile - Form untuk memilih minat/role
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-profile')
        .setDescription('👤 Pilih minat dan dapatkan role sesuai bidangmu'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('👤 Setup Profile — Spark Community')
            .setDescription(
                '🎯 **Pilih bidang yang paling menarik bagimu!**\n\n' +
                'Role yang kamu pilih akan membuka akses ke channel departemen terkait.\n' +
                'Kamu bisa memilih lebih dari satu bidang.'
            )
            .addFields(
                { name: '🔌 IoT Specialist', value: 'Fokus pada hardware, sensor, dan embedded systems', inline: true },
                { name: '🧠 ML Engineer', value: 'Fokus pada machine learning dan data science', inline: true },
                { name: '⚙️ Full Stack', value: 'Menguasai IoT dan ML secara menyeluruh', inline: true },
            )
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('setup_profile_select')
                .setPlaceholder('🎯 Pilih bidang minatmu...')
                .setMinValues(1)
                .setMaxValues(3)
                .addOptions([
                    { label: 'IoT Specialist', description: 'Hardware, Sensor, Embedded Systems', value: 'role_iot', emoji: '🔌' },
                    { label: 'ML Engineer', description: 'Machine Learning, Data Science, AI', value: 'role_ml', emoji: '🧠' },
                    { label: 'Full Stack', description: 'IoT + ML + Development', value: 'role_fullstack', emoji: '⚙️' },
                ])
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
