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
        const rr = reactionRoles.find(r => r.messageId === reaction.message.id && (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id));

        if (rr) {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = guild.roles.cache.get(rr.roleId);

            if (role && member) {
                try {
                    await member.roles.add(role);
                    console.log(`✅ Added role ${role.name} to ${user.tag}`);
                } catch (err) {
                    console.error(`❌ Failed to add role: ${err.message}`);
                }
            }
        }
    },
};
