const express = require('express');
const path = require('path');
const db = require('../services/database');
const config = require('../config');
const { ChannelType } = require('discord.js');
const cors = require('cors');

module.exports = {
    start: (client, startTime) => {
        const app = express();
        const port = process.env.PORT || 8080;

        // Middlewares
        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.use(express.static(path.join(__dirname, 'public')));

        // ─── HOME DASHBOARD ───
        app.get('/', (req, res) => {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const commands = Array.from(client.commands.values()).map(cmd => cmd.data.name);
            const allKas = db.getAllKas();
            const totalKas = allKas.reduce((acc, curr) => acc + curr.amount, 0);
            res.render('index', { 
                botName: client.user ? client.user.tag : 'Spark-Core',
                status: 'ACTIVE',
                uptime,
                commands,
                totalKas
            });
        });

        // ─── KAS PAGE ───
        app.get('/kas', (req, res) => {
            const allKas = db.getAllKas();
            const totalKas = allKas.reduce((acc, curr) => acc + curr.amount, 0);
            res.render('kas', { kasData: allKas, totalKas });
        });

        // ─── KAS API: Add ───
        app.post('/api/kas', (req, res) => {
            try {
                const { name, userId, amount, month, year } = req.body;
                if (!name || !userId || !amount || !month || !year) {
                    return res.status(400).json({ success: false, error: 'Semua field wajib diisi' });
                }
                db.addKas(userId, name, parseInt(amount), parseInt(month), parseInt(year));
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── KAS API: Delete ───
        app.delete('/api/kas', (req, res) => {
            try {
                const { name, month, year } = req.body;
                if (!name || !month || !year) {
                    return res.status(400).json({ success: false, error: 'Nama, bulan, dan tahun wajib diisi' });
                }
                const success = db.deleteKas(name, parseInt(month), parseInt(year));
                if (success) {
                    res.json({ success: true });
                } else {
                    res.status(404).json({ success: false, error: 'Data kas tidak ditemukan' });
                }
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── SAY PAGE ───
        app.get('/say', (req, res) => {
            const guild = client.guilds.cache.first();
            let channels = [];
            if (guild) {
                channels = Array.from(guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement).values());
            }
            res.render('say', { channels });
        });

        // ─── SAY API ───
        app.post('/api/say', async (req, res) => {
            const { channelId, message, useEmbed } = req.body;
            try {
                const channel = client.channels.cache.get(channelId);
                if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });
                
                const formattedMessage = message; 

                if (useEmbed === 'true' || useEmbed === true) {
                    const { EmbedBuilder } = require('discord.js');
                    const embed = new EmbedBuilder()
                        .setColor(config.branding.color || '#2b2d31')
                        .setDescription(formattedMessage)
                        .setFooter({ text: config.branding.footerText || 'Spark-Core' })
                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                } else {
                    await channel.send(formattedMessage);
                }
                res.json({ success: true });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── MODERATION PAGE ───
        app.get('/moderation', (req, res) => {
            const warnings = db.getAllWarnings ? db.getAllWarnings() : {};
            const warningList = Object.keys(warnings).map(userId => ({
                userId,
                count: warnings[userId].length,
                lastReason: warnings[userId].length > 0 ? warnings[userId][warnings[userId].length - 1].reason : '-'
            }));
            const totalWarnings = warningList.reduce((acc, w) => acc + w.count, 0);
            res.render('moderation', {
                warningList,
                totalWarnings,
                warnedUsers: warningList.length
            });
        });

        // ─── IOT PAGE ───
        app.get('/iot', (req, res) => {
            res.render('iot', { pinouts: config.pinouts });
        });

        // ─── ML PAGE ───
        app.get('/ml', (req, res) => {
            res.render('ml', { mlGlossary: config.mlGlossary });
        });

        app.get('/commands', (req, res) => {
            const sparkCommand = client.commands.get('spark');
            let commandList = [];
            if (sparkCommand && sparkCommand.data.options) {
                commandList = sparkCommand.data.options.map(opt => ({
                    name: opt.name,
                    description: opt.description
                }));
            }
            res.render('commands', { commandList });
        });

        // ─── REACTION ROLES PAGE ───
        app.get('/reaction-roles', async (req, res) => {
            const guild = client.guilds.cache.first();
            if (!guild) return res.send('Guild not found');

            const roles = Array.from(guild.roles.cache.values()).sort((a, b) => b.position - a.position).map(r => ({
                id: r.id,
                name: r.name
            }));

            const channels = Array.from(guild.channels.cache.filter(c => c.type === ChannelType.GuildText).values()).map(c => ({
                id: c.id,
                name: c.name
            }));

            const reactionRoles = db.getReactionRoles();

            res.render('reaction-roles', { roles, channels, reactionRoles });
        });

        // ─── REACTION ROLES API ───
        app.post('/api/reaction-roles', async (req, res) => {
            const { messageId, channelId, emoji, roleId, messageContent, useEmbed } = req.body;
            try {
                const channel = client.channels.cache.get(channelId);
                if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });
                
                let targetMessageId = messageId;

                // Jika user ingin kirim pesan baru lewat bot
                if (messageContent && !messageId) {
                    let sentMessage;
                    if (useEmbed === 'true' || useEmbed === true) {
                        const { EmbedBuilder } = require('discord.js');
                        const embed = new EmbedBuilder()
                            .setColor(config.branding.color || '#dc2626')
                            .setDescription(messageContent)
                            .setFooter({ text: config.branding.footerText || 'Spark-Core' })
                            .setTimestamp();
                        sentMessage = await channel.send({ embeds: [embed] });
                    } else {
                        sentMessage = await channel.send(messageContent);
                    }
                    targetMessageId = sentMessage.id;
                }

                if (!targetMessageId) {
                    return res.status(400).json({ success: false, error: 'Message ID atau Message Content wajib diisi' });
                }

                const message = await channel.messages.fetch(targetMessageId);
                if (!message) return res.status(404).json({ success: false, error: 'Message not found' });

                await message.react(emoji);
                db.addReactionRole(targetMessageId, channelId, emoji, roleId);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.delete('/api/reaction-roles', (req, res) => {
            const { messageId, emoji } = req.body;
            try {
                db.deleteReactionRole(messageId, emoji);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── MEMBER ROLES PAGE ───
        app.get('/member-roles', async (req, res) => {
            const guild = client.guilds.cache.first();
            if (!guild) return res.send('Guild not found');

            // Fetch members to ensure cache is updated (limit for performance)
            await guild.members.fetch();

            const members = Array.from(guild.members.cache.values()).map(m => ({
                id: m.id,
                tag: m.user.tag,
                roles: Array.from(m.roles.cache.keys())
            }));

            const roles = Array.from(guild.roles.cache.values()).sort((a, b) => b.position - a.position).map(r => ({
                id: r.id,
                name: r.name,
                hexColor: r.hexColor
            }));

            res.render('member-roles', { members, roles });
        });

        // ─── MEMBER ROLES API ───
        app.patch('/api/member-roles', async (req, res) => {
            const { userId, roleId, action } = req.body; // action: 'add' or 'remove'
            try {
                const guild = client.guilds.cache.first();
                const member = await guild.members.fetch(userId);
                const role = await guild.roles.fetch(roleId);

                if (action === 'add') {
                    await member.roles.add(role);
                } else {
                    await member.roles.remove(role);
                }
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── SERVER MANAGER PAGE ───
        app.get('/server-manager', async (req, res) => {
            const guild = client.guilds.cache.first();
            if (!guild) return res.send('Guild not found');

            const channels = Array.from(guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).values()).map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                typeName: ChannelType[c.type],
                category: c.parent ? c.parent.name : null
            }));

            const categories = Array.from(guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()).map(c => ({
                id: c.id,
                name: c.name,
                childCount: c.children.cache.size
            }));

            const roles = Array.from(guild.roles.cache.values()).sort((a, b) => b.position - a.position).map(r => ({
                id: r.id,
                name: r.name,
                hexColor: r.hexColor,
                memberCount: r.members.size,
                managed: r.managed,
                permissions: r.permissions.toArray()
            }));

            res.render('server-manager', {
                guildName: guild.name,
                channels,
                categories,
                roles,
                rolesWithPerms: roles // For the script tag
            });
        });

        // ─── SERVER MANAGER API: CHANNELS ───
        app.post('/api/server/channel', async (req, res) => {
            const { name, type, categoryId } = req.body;
            try {
                const guild = client.guilds.cache.first();
                let discordType = ChannelType.GuildText;
                if (type === 'voice') discordType = ChannelType.GuildVoice;
                if (type === 'announcement') discordType = ChannelType.GuildAnnouncement;

                await guild.channels.create({
                    name,
                    type: discordType,
                    parent: categoryId || null
                });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.patch('/api/server/channel', async (req, res) => {
            const { id, name } = req.body;
            try {
                const channel = client.channels.cache.get(id);
                await channel.setName(name);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.delete('/api/server/channel', async (req, res) => {
            const { id } = req.body;
            try {
                const channel = client.channels.cache.get(id);
                await channel.delete();
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── SERVER MANAGER API: CATEGORIES ───
        app.post('/api/server/category', async (req, res) => {
            const { name } = req.body;
            try {
                const guild = client.guilds.cache.first();
                await guild.channels.create({
                    name,
                    type: ChannelType.GuildCategory
                });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.delete('/api/server/category', async (req, res) => {
            const { id } = req.body;
            try {
                const channel = client.channels.cache.get(id);
                await channel.delete();
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // ─── SERVER MANAGER API: ROLES ───
        app.post('/api/server/role', async (req, res) => {
            const { name, color, hoist } = req.body;
            try {
                const guild = client.guilds.cache.first();
                await guild.roles.create({
                    name,
                    color,
                    hoist
                });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.delete('/api/server/role', async (req, res) => {
            const { id } = req.body;
            try {
                const guild = client.guilds.cache.first();
                const role = await guild.roles.fetch(id);
                await role.delete();
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.patch('/api/server/role/permissions', async (req, res) => {
            const { roleId, permissions } = req.body;
            try {
                const guild = client.guilds.cache.first();
                const role = await guild.roles.fetch(roleId);
                await role.setPermissions(permissions);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Start Server
        app.listen(port, () => {
            console.log(`🌐 Dashboard web berjalan di http://localhost:${port}`);
        });
    }
};
