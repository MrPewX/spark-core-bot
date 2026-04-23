// News Aggregator — Posts tech news from RSS feeds
const { EmbedBuilder } = require('discord.js');
const RssParser = require('rss-parser');
const cron = require('node-cron');
const config = require('../config');

const parser = new RssParser();

module.exports = {
    /**
     * Start the news cron job
     * Posts tech news every morning at 08:00 WIB (01:00 UTC)
     */
    start(client) {
        if (!config.channels.news) {
            console.log('⚠️  NEWS_CHANNEL_ID belum di-set. News aggregator dinonaktifkan.');
            return;
        }

        // Run every day at 08:00 WIB (UTC+7 → 01:00 UTC)
        cron.schedule('0 1 * * *', async () => {
            console.log('📰 Mengambil berita tech terbaru...');
            await postNews(client);
        });

        console.log('📰 News aggregator aktif! Posting setiap hari jam 08:00 WIB.');
    },
};

async function postNews(client) {
    const channel = client.channels.cache.get(config.channels.news);
    if (!channel) {
        console.error('❌ News channel tidak ditemukan!');
        return;
    }

    const allArticles = [];

    for (const feed of config.rssFeeds) {
        try {
            const data = await parser.parseURL(feed.url);
            const items = (data.items || []).slice(0, 2).map(item => ({
                source: feed.name,
                title: item.title || 'No Title',
                link: item.link || '#',
                date: item.pubDate ? new Date(item.pubDate) : new Date(),
                snippet: (item.contentSnippet || item.content || '').slice(0, 150),
            }));
            allArticles.push(...items);
        } catch (err) {
            console.error(`⚠️  Gagal fetch RSS dari ${feed.name}:`, err.message);
        }
    }

    if (allArticles.length === 0) {
        console.log('📰 Tidak ada artikel baru hari ini.');
        return;
    }

    // Sort by date, newest first
    allArticles.sort((a, b) => b.date - a.date);

    const embed = new EmbedBuilder()
        .setColor(config.branding.color)
        .setTitle('📰 Tech News — Daily Digest')
        .setDescription(`Berikut berita terbaru seputar **IoT & Machine Learning** hari ini:`)
        .setFooter({ text: `${config.branding.footerText} | Auto News Feed` })
        .setTimestamp();

    allArticles.slice(0, 8).forEach((article, i) => {
        embed.addFields({
            name: `${i + 1}. ${article.title}`,
            value: `> ${article.snippet}${article.snippet.length >= 150 ? '...' : ''}\n🏷️ *${article.source}* — [Baca selengkapnya](${article.link})`,
            inline: false,
        });
    });

    await channel.send({ embeds: [embed] });
    console.log(`📰 Berhasil posting ${allArticles.length} berita.`);
}
