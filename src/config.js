// ============================================
// SPARK-CORE BOT - Central Configuration
// ============================================

require('dotenv').config();

module.exports = {
    // Discord Core
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,

    // Channel IDs
    channels: {
        welcome: process.env.WELCOME_CHANNEL_ID,
        news: process.env.NEWS_CHANNEL_ID,
        monitor: process.env.MONITOR_CHANNEL_ID,
    },

    // Role IDs
    roles: {
        iot: process.env.ROLE_IOT_ID,
        ml: process.env.ROLE_ML_ID,
        fullstack: process.env.ROLE_FULLSTACK_ID,
    },

    // MQTT
    mqtt: {
        brokerUrl: process.env.MQTT_BROKER_URL || 'broker.hivemq.com',
        brokerPort: parseInt(process.env.MQTT_BROKER_PORT) || 1883,
    },

    // IoT API
    iotApiEndpoint: process.env.IOT_API_ENDPOINT || '',

    // Kaggle
    kaggle: {
        username: process.env.KAGGLE_USERNAME || '',
        key: process.env.KAGGLE_KEY || '',
    },

    // Bot Branding
    // --- Reaction Roles Permanen (Auto-Sync on Startup) ---
    permanentReactionRoles: [
        { 
            channelId: '1496800171340857345', 
            messageId: '1500012435921178795', 
            emoji: '🔥', 
            roleId: '1496799264402313287' // RISTEK
        },
        { 
            channelId: '1496800171340857345', 
            messageId: '1500013239109554318', 
            emoji: '🫂', 
            roleId: '1496799061150404688' // HUX
        },
        { 
            channelId: '1496800171340857345', 
            messageId: '1500013378213646467', 
            emoji: '📸', 
            roleId: '1496798933551415326' // MEDINFO
        }
    ],

    branding: {
        name: 'Spark-Core',
        color: 0x00D4FF,       // Cyan electric
        accentColor: 0xFF6B35, // Orange accent
        successColor: 0x00E676,
        errorColor: 0xFF1744,
        warningColor: 0xFFD600,
        footerText: '⚡ Spark Community — IoT & ML Hub',
        thumbnailUrl: '', // Optional: URL gambar thumbnail bot
    },

    // News RSS Feeds
    rssFeeds: [
        { name: 'Towards Data Science', url: 'https://towardsdatascience.com/feed' },
        { name: 'IoT For All', url: 'https://www.iotforall.com/feed' },
        { name: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/feed/' },
        { name: 'Hackster.io', url: 'https://www.hackster.io/news.rss' },
    ],

    // Pinout Database
    pinouts: {
        esp32: {
            name: 'ESP32 DevKit V1',
            image: 'https://i.imgur.com/JyXDTqS.png',
            gpio: '34 GPIO Pins (beberapa shared)',
            adc: 'ADC1 (8 ch), ADC2 (10 ch) - 12-bit',
            dac: '2x DAC (GPIO25, GPIO26)',
            pwm: '16 channel PWM',
            comm: 'SPI (4), I2C (2), UART (3)',
            wireless: 'WiFi 802.11 b/g/n + Bluetooth 4.2 + BLE',
            flash: '4MB Flash, 520KB SRAM',
            voltage: '3.3V (input: 5V via USB)',
            pins: [
                'GPIO0 (Boot)', 'GPIO1 (TX0)', 'GPIO2 (LED)', 'GPIO3 (RX0)',
                'GPIO4', 'GPIO5', 'GPIO12-15 (HSPI)', 'GPIO16-17 (PSRAM)',
                'GPIO18-19 (VSPI)', 'GPIO21 (SDA)', 'GPIO22 (SCL)',
                'GPIO23 (VSPI MOSI)', 'GPIO25-27 (DAC/ADC)', 'GPIO32-39 (ADC1)',
            ],
        },
        'arduino-uno': {
            name: 'Arduino Uno R3',
            image: 'https://i.imgur.com/vFf9cJb.png',
            gpio: '14 Digital I/O (6 PWM), 6 Analog Input',
            adc: '6 channel ADC - 10-bit',
            dac: 'Tidak ada (gunakan PWM)',
            pwm: '6 channel PWM (Pin 3, 5, 6, 9, 10, 11)',
            comm: 'SPI (1), I2C (1), UART (1)',
            wireless: 'Tidak ada (perlu shield)',
            flash: '32KB Flash, 2KB SRAM, 1KB EEPROM',
            voltage: '5V (input: 7-12V via barrel jack)',
            pins: [
                'D0 (RX)', 'D1 (TX)', 'D2-D7 (Digital)',
                'D8-D13 (Digital, D13=LED)', 'A0-A5 (Analog Input)',
                'SDA (A4)', 'SCL (A5)', 'AREF', 'GND', '5V', '3.3V', 'Vin',
            ],
        },
        'arduino-nano': {
            name: 'Arduino Nano',
            image: 'https://i.imgur.com/O8hMz4q.png',
            gpio: '14 Digital I/O (6 PWM), 8 Analog Input',
            adc: '8 channel ADC - 10-bit',
            dac: 'Tidak ada',
            pwm: '6 channel PWM (Pin 3, 5, 6, 9, 10, 11)',
            comm: 'SPI (1), I2C (1), UART (1)',
            wireless: 'Tidak ada',
            flash: '32KB Flash, 2KB SRAM, 1KB EEPROM',
            voltage: '5V (input: 7-12V)',
            pins: [
                'D0 (RX)', 'D1 (TX)', 'D2-D13 (Digital)',
                'A0-A7 (Analog Input)', 'SDA (A4)', 'SCL (A5)',
            ],
        },
        stm32: {
            name: 'STM32F103C8T6 (Blue Pill)',
            image: 'https://i.imgur.com/dGpLfpL.png',
            gpio: '37 GPIO Pins (5V tolerant)',
            adc: '2x ADC - 12-bit, 10 channels',
            dac: 'Tidak ada (STM32F1 series)',
            pwm: '15 channel PWM (4 Timer)',
            comm: 'SPI (2), I2C (2), UART (3), USB, CAN',
            wireless: 'Tidak ada',
            flash: '64KB Flash, 20KB SRAM',
            voltage: '3.3V (5V tolerant I/O)',
            pins: [
                'PA0-PA15', 'PB0-PB15', 'PC13 (LED)', 'PC14-PC15 (OSC32)',
                'BOOT0', 'BOOT1', 'NRST', 'VBAT', '3.3V', 'GND',
            ],
        },
        'esp8266': {
            name: 'ESP8266 NodeMCU',
            image: 'https://i.imgur.com/rM1sxrQ.png',
            gpio: '17 GPIO Pins (beberapa reserved)',
            adc: '1 channel ADC - 10-bit (A0)',
            dac: 'Tidak ada',
            pwm: 'Software PWM semua GPIO',
            comm: 'SPI (1), I2C (1), UART (2)',
            wireless: 'WiFi 802.11 b/g/n',
            flash: '4MB Flash, 80KB DRAM',
            voltage: '3.3V (input: 5V via USB)',
            pins: [
                'D0 (GPIO16)', 'D1 (GPIO5/SCL)', 'D2 (GPIO4/SDA)',
                'D3 (GPIO0/Flash)', 'D4 (GPIO2/LED)', 'D5-D8 (SPI)',
                'A0 (ADC)', 'TX (GPIO1)', 'RX (GPIO3)',
            ],
        },
    },

    // ML Glossary
    mlGlossary: {
        'accuracy': {
            title: '🎯 Accuracy',
            formula: '(TP + TN) / (TP + TN + FP + FN)',
            desc: 'Persentase prediksi yang benar dari total prediksi. Cocok untuk dataset yang seimbang (balanced).',
            example: 'Dari 100 email, model memprediksi 90 dengan benar → Accuracy = 90%',
            warning: '⚠️ Tidak cocok untuk dataset imbalanced! Gunakan F1-Score sebagai gantinya.',
        },
        'precision': {
            title: '🔬 Precision',
            formula: 'TP / (TP + FP)',
            desc: 'Dari semua yang diprediksi positif, berapa yang benar-benar positif. Penting saat False Positive mahal.',
            example: 'Model mendeteksi 20 spam, tapi 5 bukan spam → Precision = 15/20 = 75%',
            warning: '⚠️ Precision tinggi tapi Recall rendah = banyak positif yang terlewat.',
        },
        'recall': {
            title: '📡 Recall (Sensitivity)',
            formula: 'TP / (TP + FN)',
            desc: 'Dari semua data yang benar-benar positif, berapa yang berhasil ditangkap model. Penting saat False Negative mahal.',
            example: 'Ada 30 pasien sakit, model mendeteksi 25 → Recall = 25/30 = 83%',
            warning: '⚠️ Recall tinggi tapi Precision rendah = banyak false alarm.',
        },
        'f1-score': {
            title: '⚖️ F1-Score',
            formula: '2 × (Precision × Recall) / (Precision + Recall)',
            desc: 'Harmonic mean antara Precision dan Recall. Metrik terbaik untuk dataset imbalanced.',
            example: 'Precision=75%, Recall=83% → F1 = 2×(0.75×0.83)/(0.75+0.83) = 78.8%',
            warning: '✅ Gunakan F1-Score saat kamu butuh keseimbangan antara Precision dan Recall.',
        },
        'rmse': {
            title: '📏 RMSE (Root Mean Square Error)',
            formula: '√(Σ(ŷᵢ - yᵢ)² / n)',
            desc: 'Mengukur rata-rata error prediksi untuk model regresi. Semakin kecil, semakin baik.',
            example: 'Prediksi harga rumah error rata-rata 50 juta → RMSE = 50,000,000',
            warning: '⚠️ RMSE sensitif terhadap outlier. Pertimbangkan MAE jika ada outlier banyak.',
        },
        'mae': {
            title: '📐 MAE (Mean Absolute Error)',
            formula: 'Σ|ŷᵢ - yᵢ| / n',
            desc: 'Rata-rata selisih absolut antara prediksi dan nilai sebenarnya. Lebih robust terhadap outlier dibanding RMSE.',
            example: 'Prediksi suhu error rata-rata ±2°C → MAE = 2',
            warning: '✅ Lebih mudah diinterpretasi dibanding RMSE.',
        },
        'r2': {
            title: '📊 R² Score (Coefficient of Determination)',
            formula: '1 - (SS_res / SS_tot)',
            desc: 'Mengukur seberapa baik model menjelaskan variasi data. Nilai 1 = sempurna, 0 = sama buruk dengan rata-rata.',
            example: 'R²=0.85 berarti model menjelaskan 85% variasi data.',
            warning: '⚠️ R² bisa menipu untuk model non-linear. Gunakan bersama metrik lain.',
        },
        'auc-roc': {
            title: '📈 AUC-ROC',
            formula: 'Area Under the ROC Curve',
            desc: 'Mengukur kemampuan model membedakan kelas positif dan negatif. Nilai 0.5 = random, 1 = sempurna.',
            example: 'AUC=0.92 berarti model sangat baik membedakan spam vs non-spam.',
            warning: '✅ Metrik yang bagus untuk binary classification, terutama dataset imbalanced.',
        },
        'confusion-matrix': {
            title: '🧮 Confusion Matrix',
            formula: '[[TP, FP], [FN, TN]]',
            desc: 'Tabel 2x2 yang menunjukkan distribusi prediksi vs aktual. Dasar dari semua metrik klasifikasi.',
            example: 'TP=50, FP=10, FN=5, TN=35 dari 100 data',
            warning: '✅ Selalu lihat confusion matrix sebelum memilih metrik evaluasi!',
        },
        'overfitting': {
            title: '🔥 Overfitting',
            formula: 'Train Accuracy >> Test Accuracy',
            desc: 'Model terlalu menghafal data training dan gagal di data baru. Seperti menghafal soal ujian tanpa memahami materi.',
            example: 'Train: 99%, Test: 60% → Overfitting!',
            warning: '💡 Solusi: Tambah data, regularization (L1/L2), dropout, early stopping.',
        },
        'underfitting': {
            title: '❄️ Underfitting',
            formula: 'Train Accuracy ≈ Test Accuracy (keduanya rendah)',
            desc: 'Model terlalu sederhana untuk menangkap pola data. Seperti pakai garis lurus untuk data melingkar.',
            example: 'Train: 55%, Test: 52% → Underfitting!',
            warning: '💡 Solusi: Model lebih kompleks, tambah fitur, kurangi regularization.',
        },
    },
};
