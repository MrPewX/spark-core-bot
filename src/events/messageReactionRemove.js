const { Events } = require('discord.js');
const db = require('../services/database');

module.exports = {
    name: Events.MessageReactionRemove,
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
                    await member.roles.remove(role);
                    console.log(`✅ Removed role ${role.name} from ${user.tag}`);
                } catch (err) {
                    console.error(`❌ Failed to remove role: ${err.message}`);
                }
            }
        }
    },
};
