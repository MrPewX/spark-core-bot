// /project-submit - Form untuk mendaftarkan project showcase
const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project-submit')
        .setDescription('🚀 Daftarkan projectmu ke showcase komunitas'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('project_submit_modal')
            .setTitle('🚀 Submit Project Showcase');

        const nameInput = new TextInputBuilder()
            .setCustomId('project_name')
            .setLabel('Nama Project')
            .setPlaceholder('Contoh: Smart Home IoT Dashboard')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const descInput = new TextInputBuilder()
            .setCustomId('project_desc')
            .setLabel('Deskripsi Singkat')
            .setPlaceholder('Jelaskan project kamu dalam 2-3 kalimat...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);

        const techInput = new TextInputBuilder()
            .setCustomId('project_tech')
            .setLabel('Teknologi yang Digunakan')
            .setPlaceholder('Contoh: ESP32, MQTT, TensorFlow, React')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(200);

        const repoInput = new TextInputBuilder()
            .setCustomId('project_repo')
            .setLabel('Link Repository (GitHub/GitLab)')
            .setPlaceholder('https://github.com/username/project')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(200);

        const categoryInput = new TextInputBuilder()
            .setCustomId('project_category')
            .setLabel('Kategori (IoT / ML / Full Stack)')
            .setPlaceholder('IoT')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(techInput),
            new ActionRowBuilder().addComponents(repoInput),
            new ActionRowBuilder().addComponents(categoryInput),
        );

        await interaction.showModal(modal);
    },
};
