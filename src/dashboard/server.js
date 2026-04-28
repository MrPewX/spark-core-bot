const express = require('express');
const path = require('path');
const db = require('../services/database');
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

        // Routes
        app.get('/', (req, res) => {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const commands = Array.from(client.commands.values()).map(cmd => cmd.data.name);
            res.render('index', { 
                botName: client.user ? client.user.tag : 'Spark-Core',
                status: 'ACTIVE',
                uptime,
                commands
            });
        });

        // KAS Menu
        app.get('/kas', (req, res) => {
            const allKas = db.getAllKas();
            // Calculate total
            const totalKas = allKas.reduce((acc, curr) => acc + curr.amount, 0);
            res.render('kas', { kasData: allKas, totalKas });
        });

        // SAY Menu
        app.get('/say', (req, res) => {
            // Get text channels from the first guild
            const guild = client.guilds.cache.first();
            let channels = [];
            if (guild) {
                channels = Array.from(guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement).values());
            }
            res.render('say', { channels });
        });

        app.post('/api/say', async (req, res) => {
            const { channelId, message, useEmbed } = req.body;
            try {
                const channel = client.channels.cache.get(channelId);
                if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });
                
                // Keep the exact formatting including tabs and newlines
                const formattedMessage = message; 

                if (useEmbed === 'true' || useEmbed === true) {
                    const { EmbedBuilder } = require('discord.js');
                    const config = require('../config');
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

        // Start Server
        app.listen(port, () => {
            console.log(`🌐 Dashboard web berjalan di http://localhost:${port}`);
        });
    }
};
