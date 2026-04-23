// ============================================
// /check-mqtt - Cek status broker MQTT
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const net = require('net');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-mqtt')
        .setDescription('📡 Mengecek apakah broker MQTT komunitas sedang online'),

    async execute(interaction) {
        await interaction.deferReply();

        const brokerUrl = config.mqtt.brokerUrl;
        const brokerPort = config.mqtt.brokerPort;

        try {
            const isOnline = await checkBroker(brokerUrl, brokerPort);

            const embed = new EmbedBuilder()
                .setColor(isOnline ? config.branding.successColor : config.branding.errorColor)
                .setTitle('📡 Status Broker MQTT')
                .addFields(
                    { name: '🌐 Broker', value: `\`${brokerUrl}\``, inline: true },
                    { name: '🔌 Port', value: `\`${brokerPort}\``, inline: true },
                    { name: '📊 Status', value: isOnline ? '🟢 **ONLINE**' : '🔴 **OFFLINE**', inline: true },
                )
                .setDescription(
                    isOnline
                        ? '✅ Broker MQTT aktif dan siap menerima koneksi!'
                        : '❌ Broker tidak merespon. Periksa koneksi atau konfigurasi broker.'
                )
                .setFooter({ text: config.branding.footerText })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(config.branding.errorColor)
                .setTitle('📡 Status Broker MQTT')
                .setDescription('❌ Gagal memeriksa broker MQTT.')
                .addFields(
                    { name: '🌐 Broker', value: `\`${brokerUrl}:${brokerPort}\``, inline: true },
                    { name: '⚠️ Error', value: `\`\`\`${error.message}\`\`\``, inline: false },
                )
                .setFooter({ text: config.branding.footerText })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};

/**
 * Check if MQTT broker is reachable via TCP connection
 */
function checkBroker(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(5000);

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}
