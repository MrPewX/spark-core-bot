const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: { name: 'say' },

    async execute(interaction) {
        // Cek izin (Hanya admin/moderator)
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const text = interaction.options.getString('pesan');
        const useEmbed = interaction.options.getBoolean('embed') || false;

        // Pastikan channel adalah text channel
        if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
            return interaction.reply({ content: '❌ Target harus berupa channel teks atau pengumuman!', ephemeral: true });
        }

        try {
            if (useEmbed) {
                const embed = new EmbedBuilder()
                    .setColor(config.branding.color)
                    .setDescription(text.replace(/\\n/g, '\n'))
                    .setFooter({ text: config.branding.footerText })
                    .setTimestamp();
                
                await channel.send({ embeds: [embed] });
            } else {
                await channel.send(text.replace(/\\n/g, '\n'));
            }

            return interaction.reply({ content: `✅ Pesan berhasil dikirim ke <#${channel.id}>!`, ephemeral: true });
        } catch (error) {
            console.error('❌ Gagal mengirim pesan:', error);
            return interaction.reply({ content: '❌ Gagal mengirim pesan ke channel tersebut. Pastikan bot memiliki izin di channel tersebut.', ephemeral: true });
        }
    },
};
