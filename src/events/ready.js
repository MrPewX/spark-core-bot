// Event: Bot ready
const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
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
                    // Coba cari channel berdasarkan ID
                    let channel = await client.channels.fetch(rr.channelId).catch(() => null);
                    
                    // Jika gagal, coba cari berdasarkan nama (fallback)
                    if (!channel) {
                        channel = client.channels.cache.find(c => c.name === 'take-role' || c.name === 'project-showcase' || c.id === rr.channelId);
                    }

                    if (!channel) {
                        console.log(`❌ Channel tidak ditemukan (ID: ${rr.channelId})`);
                        continue;
                    }

                    const guild = channel.guild;
                    let targetRoleId = rr.roleId;

                    // Cari Role berdasarkan Nama jika ID Role tidak ada
                    if (!targetRoleId && rr.roleName) {
                        const role = guild.roles.cache.find(r => r.name.toLowerCase() === rr.roleName.toLowerCase());
                        if (role) {
                            targetRoleId = role.id;
                        } else {
                            console.log(`⚠️ Role "${rr.roleName}" tidak ada di server.`);
                            continue;
                        }
                    }

                    // Ambil pesan
                    const msg = await channel.messages.fetch(rr.messageId).catch(() => null);
                    if (!msg) {
                        console.log(`❌ Pesan ${rr.messageId} tidak ada di #${channel.name}`);
                        continue;
                    }

                    // Simpan ke database sementara (in-memory)
                    const existing = db.getReactionRoles();
                    const isSaved = existing.find(x => x.messageId === rr.messageId && x.emoji === rr.emoji);
                    if (!isSaved) {
                        db.addReactionRole(rr.messageId, channel.id, rr.emoji, targetRoleId);
                    }

                    // Pasang reaksi
                    await msg.react(rr.emoji).catch(() => null);
                    console.log(`✅ Synced: ${rr.emoji} di #${channel.name}`);

                } catch (e) {
                    console.log(`❌ Error RR: ${e.message}`);
                }
            }
            console.log('🏁 Auto-Sync Selesai!');
        }
    },
};
