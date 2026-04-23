// ============================================
// /status-alat - Live monitoring data IoT
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-alat')
        .setDescription('📊 Menampilkan data sensor IoT secara real-time'),

    async execute(interaction) {
        await interaction.deferReply();

        // Jika belum ada endpoint API yang dikonfigurasi
        if (!config.iotApiEndpoint) {
            const embed = new EmbedBuilder()
                .setColor(config.branding.warningColor)
                .setTitle('📊 IoT Live Monitor')
                .setDescription(
                    '⚠️ **Belum ada endpoint API yang dikonfigurasi.**\n\n' +
                    'Untuk menggunakan fitur ini, kamu perlu:\n' +
                    '1. Setup ESP32/Arduino mengirim data ke Firebase/API\n' +
                    '2. Set `IOT_API_ENDPOINT` di file `.env`\n' +
                    '3. Restart bot\n\n' +
                    '**Contoh endpoint:**\n' +
                    '```\nhttps://your-project.firebaseio.com/sensors.json\n```'
                )
                .addFields(
                    { name: '📡 Demo Data', value: '```\nSuhu      : 28.5°C\nKelembapan: 65%\nTekanan   : 1013.25 hPa\nKoneksi   : 🟢 Online\nUptime    : 3h 42m\n```', inline: false },
                )
                .setFooter({ text: `${config.branding.footerText} | Demo Mode` })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        try {
            const response = await axios.get(config.iotApiEndpoint, { timeout: 10000 });
            const data = response.data;

            // Auto-detect dan format data sensor
            const fields = [];
            const sensorIcons = {
                suhu: '🌡️', temperature: '🌡️', temp: '🌡️',
                kelembapan: '💧', humidity: '💧', hum: '💧',
                tekanan: '🔵', pressure: '🔵',
                cahaya: '☀️', light: '☀️', lux: '☀️',
                jarak: '📏', distance: '📏',
                gas: '💨', mq: '💨',
                ph: '🧪',
                status: '📡', online: '📡',
            };

            if (typeof data === 'object' && data !== null) {
                for (const [key, value] of Object.entries(data)) {
                    const icon = Object.entries(sensorIcons).find(
                        ([k]) => key.toLowerCase().includes(k)
                    );
                    const emoji = icon ? icon[1] : '📊';

                    fields.push({
                        name: `${emoji} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
                        value: `\`\`\`${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\`\`\``,
                        inline: true,
                    });
                }
            }

            const embed = new EmbedBuilder()
                .setColor(config.branding.successColor)
                .setTitle('📊 IoT Live Monitor')
                .setDescription('✅ Data sensor berhasil diambil dari endpoint API.')
                .addFields(fields.length > 0 ? fields : [{ name: '📡 Raw Data', value: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`` }])
                .setFooter({ text: `${config.branding.footerText} | Live Data` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(config.branding.errorColor)
                .setTitle('📊 IoT Live Monitor')
                .setDescription('❌ Gagal mengambil data dari endpoint.')
                .addFields(
                    { name: '🌐 Endpoint', value: `\`${config.iotApiEndpoint}\``, inline: false },
                    { name: '⚠️ Error', value: `\`\`\`${error.message}\`\`\``, inline: false },
                )
                .setFooter({ text: config.branding.footerText })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
