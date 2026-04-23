// ============================================
// /pin-out [microcontroller] - Menampilkan pinout diagram
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pin-out')
        .setDescription('📌 Menampilkan diagram pinout microcontroller')
        .addStringOption(option =>
            option
                .setName('microcontroller')
                .setDescription('Pilih microcontroller')
                .setRequired(true)
                .addChoices(
                    { name: '⚡ ESP32 DevKit V1', value: 'esp32' },
                    { name: '🔵 Arduino Uno R3', value: 'arduino-uno' },
                    { name: '🟢 Arduino Nano', value: 'arduino-nano' },
                    { name: '🔴 STM32 Blue Pill', value: 'stm32' },
                    { name: '📶 ESP8266 NodeMCU', value: 'esp8266' },
                )
        ),

    async execute(interaction) {
        const mcuKey = interaction.options.getString('microcontroller');
        const mcu = config.pinouts[mcuKey];

        if (!mcu) {
            return interaction.reply({
                content: '❌ Microcontroller tidak ditemukan!',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle(`📌 Pinout: ${mcu.name}`)
            .setDescription('Berikut adalah spesifikasi dan pinout untuk microcontroller ini.')
            .addFields(
                { name: '🔌 GPIO', value: `\`\`\`${mcu.gpio}\`\`\``, inline: false },
                { name: '📊 ADC', value: `\`\`\`${mcu.adc}\`\`\``, inline: true },
                { name: '📤 DAC', value: `\`\`\`${mcu.dac}\`\`\``, inline: true },
                { name: '〰️ PWM', value: `\`\`\`${mcu.pwm}\`\`\``, inline: true },
                { name: '🔗 Komunikasi', value: `\`\`\`${mcu.comm}\`\`\``, inline: true },
                { name: '📡 Wireless', value: `\`\`\`${mcu.wireless}\`\`\``, inline: true },
                { name: '💾 Memory', value: `\`\`\`${mcu.flash}\`\`\``, inline: true },
                { name: '⚡ Tegangan', value: `\`\`\`${mcu.voltage}\`\`\``, inline: true },
                { name: '📍 Pin Utama', value: mcu.pins.map(p => `\`${p}\``).join(', '), inline: false },
            )
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        // Jika ada image URL
        if (mcu.image) {
            embed.setThumbnail(mcu.image);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
