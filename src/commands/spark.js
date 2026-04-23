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
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        // Jalankan logika sesuai subcommand yang dipilih
        if (commands[subcommand]) {
            try {
                await commands[subcommand].execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini.', ephemeral: true });
            }
        }
    },
};
