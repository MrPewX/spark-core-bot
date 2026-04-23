// Event: Welcome new members with onboarding buttons
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const channelId = config.channels.welcome;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(config.branding.color)
            .setTitle('⚡ Selamat Datang di Spark Community!')
            .setDescription(
                `Hai **${member.user.username}**! 👋\n\n` +
                `Selamat bergabung di **Spark** — komunitas IoT & Machine Learning! 🚀\n\n` +
                `Untuk memulai, pilih bidang yang paling menarik bagimu di bawah ini.\n` +
                `Ini akan membuka akses ke channel departemen terkait.`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🔌 IoT Specialist', value: 'Sensor, Microcontroller, Embedded Systems', inline: true },
                { name: '🧠 ML Engineer', value: 'Machine Learning, AI, Data Science', inline: true },
                { name: '⚙️ Full Stack', value: 'IoT + ML + Development', inline: true },
            )
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('onboard_iot')
                .setLabel('🔌 IoT Specialist')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('onboard_ml')
                .setLabel('🧠 ML Engineer')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('onboard_fullstack')
                .setLabel('⚙️ Full Stack')
                .setStyle(ButtonStyle.Secondary),
        );

        await channel.send({ content: `<@${member.id}>`, embeds: [embed], components: [row] });
    },
};
