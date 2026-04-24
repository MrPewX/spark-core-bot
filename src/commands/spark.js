const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Import semua logika perintah yang sudah ada
// Catatan: Kita akan memanggil fungsi 'execute' dari masing-masing file lama
const commands = {};
const commandsPath = path.join(__dirname, 'modules');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands[command.data.name] = command;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spark')
        .setDescription('Perintah utama untuk Spark-Core Bot')
        
        // ─── Subcommands Umum ───
        .addSubcommand(sub => 
            sub.setName('help').setDescription('Tampilkan menu bantuan bot')
        )
        .addSubcommand(sub => 
            sub.setName('setup-profile').setDescription('Mulai onboarding & setel role komunitas')
        )
        .addSubcommand(sub => 
            sub.setName('project-submit').setDescription('Showcase project IoT/ML kamu ke komunitas')
        )

        // ─── Subcommands IoT ───
        .addSubcommand(sub => 
            sub.setName('status-alat').setDescription('Monitoring status real-time alat IoT')
        )
        .addSubcommand(sub => 
            sub.setName('pin-out').setDescription('Lihat referensi pin-out MCU (ESP32/ESP8266)')
        )
        .addSubcommand(sub => 
            sub.setName('check-mqtt').setDescription('Cek status broker MQTT')
        )

        // ─── Subcommands ML ───
        .addSubcommand(sub => 
            sub.setName('predict').setDescription('Demo klasifikasi gambar menggunakan ML')
            .addStringOption(opt => opt.setName('url').setDescription('URL gambar untuk diklasifikasi').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('classify').setDescription('Demo klasifikasi teks (Sentimen Analisis)')
            .addStringOption(opt => opt.setName('teks').setDescription('Teks yang ingin dianalisis').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('dataset').setDescription('Cari referensi dataset di Kaggle/HuggingFace')
            .addStringOption(opt => opt.setName('query').setDescription('Topik dataset yang dicari').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('eval').setDescription('Glossary istilah evaluasi model ML')
        )

        // ─── Subcommands Moderasi ───
        .addSubcommand(sub => 
            sub.setName('clear').setDescription('🗑️ Hapus pesan dalam jumlah banyak')
            .addIntegerOption(opt => opt.setName('jumlah').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))
        )
        .addSubcommand(sub => 
            sub.setName('warn').setDescription('⚠️ Berikan peringatan kepada member')
            .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
            .addStringOption(opt => opt.setName('alasan').setDescription('Alasan').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('kick').setDescription('👢 Mengeluarkan member dari server')
            .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
            .addStringOption(opt => opt.setName('alasan').setDescription('Alasan').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('ban').setDescription('🔨 Memblokir member secara permanen')
            .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
            .addStringOption(opt => opt.setName('alasan').setDescription('Alasan').setRequired(true))
        )
        .addSubcommand(sub => 
            sub.setName('timeout').setDescription('🔇 Membisukan member untuk sementara')
            .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
            .addIntegerOption(opt => opt.setName('durasi').setDescription('Durasi dalam menit').setRequired(true))
            .addStringOption(opt => opt.setName('alasan').setDescription('Alasan').setRequired(true))
        )

        // ─── Subcommands Keuangan (Kas) ───
        .addSubcommand(sub => 
            sub.setName('kas').setDescription('💰 Manajemen Kas Komunitas')
            .addStringOption(opt => opt.setName('aksi').setDescription('Pilih: bayar / cek / laporan').setRequired(true)
                .addChoices(
                    { name: 'Bayar Kas', value: 'bayar' },
                    { name: 'Cek Status', value: 'cek' },
                    { name: 'Laporan Kas', value: 'laporan' },
                    { name: 'Hapus Kas', value: 'hapus' }
                ))
            .addUserOption(opt => opt.setName('user').setDescription('Untuk aksi bayar'))
            .addIntegerOption(opt => opt.setName('jumlah').setDescription('Untuk aksi bayar (Rp)'))
            .addIntegerOption(opt => opt.setName('bulan').setDescription('Untuk aksi bayar/laporan (1-12)'))
            .addIntegerOption(opt => opt.setName('tahun').setDescription('Untuk aksi bayar/laporan'))
            .addStringOption(opt => opt.setName('query').setDescription('Untuk aksi cek (Nama/ID)'))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        // Jalankan logika sesuai subcommand yang dipilih
        if (commands[subcommand]) {
            try {
                await commands[subcommand].execute(interaction);
            } catch (error) {
                console.error(`[ERROR] Gagal eksekusi subcommand ${subcommand}:`, error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Terjadi kesalahan saat menjalankan perintah ini.', ephemeral: true });
                }
            }
        } else {
            console.warn(`[WARN] Subcommand ${subcommand} tidak ditemukan.`);
            await interaction.reply({ content: '⚠️ Subcommand tidak ditemukan atau belum di-implementasi.', ephemeral: true });
        }
    },
};
