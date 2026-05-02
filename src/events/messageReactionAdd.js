const { Events } = require('discord.js');
const db = require('../services/database');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return;

        // Handle partials
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        const reactionRoles = db.getReactionRoles();
        const config = require('../config');
        const rr = reactionRoles.find(r => r.messageId === reaction.message.id && (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id));

        if (rr) {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = guild.roles.cache.get(rr.roleId);

            if (role && member) {
                try {
                    // --- Logika Unique Role (1x aja) ---
                    // Cek apakah ini bagian dari role permanen/divisi
                    const isPermanent = config.permanentReactionRoles.some(p => p.roleId === rr.roleId);
                    
                    if (isPermanent) {
                        // Cari role permanen lain yang mungkin dimiliki user
                        const otherPermRoles = config.permanentReactionRoles
                            .filter(p => p.roleId !== rr.roleId)
                            .map(p => p.roleId);
                        
                        // Hapus role permanen lain jika ada
                        for (const oldRoleId of otherPermRoles) {
                            if (member.roles.cache.has(oldRoleId)) {
                                await member.roles.remove(oldRoleId);
                                
                                // Opsional: Cari pesan lamanya dan hapus reaksinya di sana
                                const otherRR = config.permanentReactionRoles.find(p => p.roleId === oldRoleId);
                                if (otherRR) {
                                    const chan = await guild.channels.fetch(otherRR.channelId).catch(() => null);
                                    if (chan) {
                                        const oldMsg = await chan.messages.fetch(otherRR.messageId).catch(() => null);
                                        if (oldMsg) {
                                            const oldReact = oldMsg.reactions.cache.find(re => re.emoji.name === otherRR.emoji || re.emoji.id === otherRR.emoji);
                                            if (oldReact) await oldReact.users.remove(user.id).catch(() => null);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Tambahkan role baru
                    await member.roles.add(role);
                    console.log(`✅ [Unique] Added role ${role.name} to ${user.tag}`);

                    // --- Logika "Jumlah Reaction Tetap 1" ---
                    // Hapus reaksi user agar yang tersisa hanya reaksi bot
                    await reaction.users.remove(user.id).catch(() => null);

                } catch (err) {
                    console.error(`❌ Failed to process reaction role: ${err.message}`);
                }
            }
        }
    },
};
