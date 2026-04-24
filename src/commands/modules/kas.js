const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../services/database');
const config = require('../../config');

module.exports = {
    // Data dummy agar tidak error saat diload oleh spark.js
    data: { name: 'kas' },

    async execute(interaction) {
        const aksi = interaction.options.getString('aksi');

        if (aksi === 'bayar') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({ content: '❌ Hanya admin yang bisa input kas!', ephemeral: true });
            }

            const user = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('jumlah');
            const month = interaction.options.getInteger('bulan');
            const year = interaction.options.getInteger('tahun');

            if (!user || !amount || !month || !year) {
                return interaction.reply({ content: '❌ Mohon lengkapi semua opsi (user, jumlah, bulan, tahun) untuk input kas!', ephemeral: true });
            }

            db.addKas(user.id, user.username, amount, month, year);

            const embed = new EmbedBuilder()
                .setColor(config.branding.successColor)
                .setTitle('✅ Pembayaran Kas Tercatat')
                .setDescription(`Berhasil mencatat kas untuk **${user.tag}**`)
                .addFields(
                    { name: '💰 Jumlah', value: `Rp ${amount.toLocaleString('id-ID')}`, inline: true },
                    { name: '📅 Periode', value: `${month}/${year}`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (aksi === 'cek') {
            const query = interaction.options.getString('query');
            const month = interaction.options.getInteger('bulan');
            const year = interaction.options.getInteger('tahun');

            if (!query) return interaction.reply({ content: '❌ Masukkan nama atau ID user!', ephemeral: true });

            const results = db.searchKas(query, month, year);

            if (results.length === 0) {
                return interaction.reply({ content: `❌ Tidak ditemukan data kas untuk: **${query}** ${month ? `pada bulan ${month}` : ''} ${year ? `tahun ${year}` : ''}`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(config.branding.color)
                .setTitle(`📊 Riwayat Kas: ${results[0].name}`)
                .setDescription(results.map(r => `• **${r.month}/${r.year}**: Rp ${r.amount.toLocaleString('id-ID')}`).join('\n'))
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (aksi === 'hapus') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({ content: '❌ Hanya admin yang bisa menghapus kas!', ephemeral: true });
            }

            const name = interaction.options.getString('query');
            const month = interaction.options.getInteger('bulan');
            const year = interaction.options.getInteger('tahun');

            if (!name || !month || !year) {
                return interaction.reply({ content: '❌ Mohon masukkan nama (di kolom query), bulan, dan tahun untuk menghapus kas!', ephemeral: true });
            }

            const success = db.deleteKas(name, month, year);

            if (success) {
                return interaction.reply({ content: `✅ Berhasil menghapus data kas **${name}** periode **${month}/${year}**.` });
            } else {
                return interaction.reply({ content: `❌ Tidak ditemukan data kas **${name}** periode **${month}/${year}** untuk dihapus.`, ephemeral: true });
            }
        }

        if (aksi === 'laporan') {
            const month = interaction.options.getInteger('bulan');
            const year = interaction.options.getInteger('tahun');
            const results = db.getKasReport(month, year);

            const total = results.reduce((acc, curr) => acc + curr.amount, 0);

            const embed = new EmbedBuilder()
                .setColor(config.branding.accentColor)
                .setTitle(`📋 Laporan Kas ${month ? `Bulan ${month}` : ''} ${year ? `Tahun ${year}` : ''}`)
                .setDescription(results.length > 0 
                    ? results.slice(0, 15).map(r => `• ${r.name} (${r.month}/${r.year}): Rp ${r.amount.toLocaleString('id-ID')}`).join('\n')
                    : 'Tidak ada data pada periode ini.')
                .addFields({ name: '💵 Total Kas', value: `Rp ${total.toLocaleString('id-ID')}`, inline: false })
                .setFooter({ text: `Menampilkan ${results.length > 15 ? '15' : results.length} data terbaru` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }
    },
};
