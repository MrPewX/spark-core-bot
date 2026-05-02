// Event: Bot ready
const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║         ⚡ SPARK-CORE BOT ACTIVE ⚡       ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log(`║  Bot    : ${client.user.tag.padEnd(30)}║`);
        console.log(`║  ID     : ${client.user.id.padEnd(30)}║`);
        console.log(`║  Guilds : ${String(client.guilds.cache.size).padEnd(30)}║`);
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('🚀 Interaction handler siap menerima perintah!');

        // Set bot status
        client.user.setPresence({
            activities: [{
                name: '⚡ /help | Spark Community',
                type: ActivityType.Watching,
            }],
            status: 'online',
        });
        // --- Auto-Sync Permanent Reaction Roles ---
        if (config.permanentReactionRoles && config.permanentReactionRoles.length > 0) {
            const db = require('../services/database');
            console.log('🔄 Memulai Auto-Sync Reaction Roles...');
            
            for (const rr of config.permanentReactionRoles) {
                try {
                    const channel = await client.channels.fetch(rr.channelId).catch(() => null);
                    if (!channel) {
                        console.log(`❌ Channel tidak ditemukan: ${rr.channelId}`);
                        continue;
                    }

                    const guild = channel.guild;
                    let targetRoleId = rr.roleId;

                    // Jika roleId tidak ada, cari berdasarkan roleName
                    if (!targetRoleId && rr.roleName) {
                        const role = guild.roles.cache.find(r => r.name.toLowerCase() === rr.roleName.toLowerCase());
                        if (role) {
                            targetRoleId = role.id;
                        } else {
                            console.log(`⚠️ Role dengan nama "${rr.roleName}" tidak ditemukan di server.`);
                            continue;
                        }
                    }

                    if (!targetRoleId) {
                        console.log(`⚠️ Skip RR: ID Role atau Nama Role untuk ${rr.messageId} tidak valid.`);
                        continue;
                    }

                    const msg = await channel.messages.fetch(rr.messageId).catch(() => null);
                    if (!msg) {
                        console.log(`❌ Pesan tidak ditemukan: ${rr.messageId} di channel #${channel.name}`);
                        continue;
                    }

                    // Tambahkan ke database jika hilang (karena redeploy)
                    const existing = db.getReactionRoles();
                    const isSaved = existing.find(x => x.messageId === rr.messageId && x.emoji === rr.emoji);
                    if (!isSaved) {
                        db.addReactionRole(rr.messageId, rr.channelId, rr.emoji, targetRoleId);
                    }

                    // Pastikan bot bereaksi
                    await msg.react(rr.emoji).catch(() => null);
                    console.log(`✅ Synced: ${rr.emoji} -> Role ${rr.roleName || targetRoleId}`);

                } catch (e) {
                    console.log(`❌ Error pada Auto-Sync: ${e.message}`);
                }
            }
            console.log('🏁 Auto-Sync Selesai!');
        }
    },
};
