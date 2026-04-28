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

        // ─── COMMANDS PAGE ───
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

        // Start Server
        app.listen(port, () => {
            console.log(`🌐 Dashboard web berjalan di http://localhost:${port}`);
        });
    }
};
