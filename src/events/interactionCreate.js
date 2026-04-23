// Event: Interaction handler (slash commands, buttons, select menus, modals)
const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // ─── Slash Commands ───
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ Error executing /${interaction.commandName}:`, error);
                const reply = { content: '❌ Terjadi error saat menjalankan perintah.', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
            return;
        }

        // ─── Select Menu: Profile Setup ───
        if (interaction.isStringSelectMenu() && interaction.customId === 'setup_profile_select') {
            await handleProfileSelect(interaction);
            return;
        }

        // ─── Button: Onboarding Welcome ───
        if (interaction.isButton() && interaction.customId.startsWith('onboard_')) {
            await handleOnboardButton(interaction);
            return;
        }

        // ─── Modal: Project Submit ───
        if (interaction.isModalSubmit() && interaction.customId === 'project_submit_modal') {
            await handleProjectModal(interaction);
            return;
        }
    },
};

async function handleProfileSelect(interaction) {
    const selected = interaction.values;
    const member = interaction.member;
    const rolesAdded = [];

    const roleMap = {
        role_iot: { id: config.roles.iot, name: '🔌 IoT Specialist' },
        role_ml: { id: config.roles.ml, name: '🧠 ML Engineer' },
        role_fullstack: { id: config.roles.fullstack, name: '⚙️ Full Stack' },
    };

    for (const val of selected) {
        const role = roleMap[val];
        if (role && role.id) {
            try {
                await member.roles.add(role.id);
                rolesAdded.push(role.name);
            } catch (err) {
                console.error(`❌ Gagal memberikan role ${role.name}:`, err.message);
            }
        }
    }

    const embed = new EmbedBuilder()
        .setColor(config.branding.successColor)
        .setTitle('✅ Profile Updated!')
        .setDescription(
            rolesAdded.length > 0
                ? `Kamu sekarang memiliki role:\n${rolesAdded.map(r => `> ${r}`).join('\n')}\n\nChannel departemen sudah terbuka! 🎉`
                : '⚠️ Role belum dikonfigurasi oleh admin. Hubungi admin untuk setup role ID di `.env`.'
        )
        .setFooter({ text: config.branding.footerText })
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
}

async function handleOnboardButton(interaction) {
    const roleType = interaction.customId.replace('onboard_', '');
    const member = interaction.member;

    const roleMap = {
        iot: { id: config.roles.iot, name: '🔌 IoT Specialist' },
        ml: { id: config.roles.ml, name: '🧠 ML Engineer' },
        fullstack: { id: config.roles.fullstack, name: '⚙️ Full Stack' },
    };

    const role = roleMap[roleType];
    if (!role || !role.id) {
        return interaction.reply({ content: '⚠️ Role belum dikonfigurasi. Hubungi admin.', ephemeral: true });
    }

    try {
        await member.roles.add(role.id);
        const embed = new EmbedBuilder()
            .setColor(config.branding.successColor)
            .setTitle('🎉 Selamat Bergabung!')
            .setDescription(`Kamu telah memilih **${role.name}**!\n\nChannel departemen sudah terbuka untukmu. Selamat berkarya! ⚡`)
            .setFooter({ text: config.branding.footerText })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
        console.error(`❌ Gagal memberikan role:`, err.message);
        await interaction.reply({ content: '❌ Gagal memberikan role. Pastikan bot memiliki permission Manage Roles.', ephemeral: true });
    }
}

async function handleProjectModal(interaction) {
    const name = interaction.fields.getTextInputValue('project_name');
    const desc = interaction.fields.getTextInputValue('project_desc');
    const tech = interaction.fields.getTextInputValue('project_tech');
    const repo = interaction.fields.getTextInputValue('project_repo') || 'Belum ada';
    const category = interaction.fields.getTextInputValue('project_category');

    const categoryEmoji = category.toLowerCase().includes('iot') ? '🔌'
        : category.toLowerCase().includes('ml') ? '🧠' : '⚙️';

    const embed = new EmbedBuilder()
        .setColor(config.branding.accentColor)
        .setTitle(`🚀 Project Showcase: ${name}`)
        .setDescription(desc)
        .addFields(
            { name: '👤 Dibuat oleh', value: `<@${interaction.user.id}>`, inline: true },
            { name: `${categoryEmoji} Kategori`, value: category, inline: true },
            { name: '🛠️ Tech Stack', value: `\`\`\`${tech}\`\`\``, inline: false },
            { name: '🔗 Repository', value: repo.startsWith('http') ? `[Buka Repository](${repo})` : repo, inline: false },
        )
        .setFooter({ text: `${config.branding.footerText} | Project Showcase` })
        .setTimestamp();

    // Reply to user
    await interaction.reply({ content: '✅ Project berhasil didaftarkan!', ephemeral: true });

    // Post to the channel
    await interaction.channel.send({ embeds: [embed] });
}
