const fs = require('fs');
const path = require('path');

// Simpan data di folder data
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.json');

// Initial data
let db = {
    warnings: {}, // { userId: [{ reason: string, timestamp: number, moderatorId: string }] }
    kas: [],      // [{ userId: string, name: string, amount: number, month: number, year: number, timestamp: number }]
    reactionRoles: [] // [{ messageId: string, channelId: string, emoji: string, roleId: string }]
};

// Load data
if (fs.existsSync(dbPath)) {
    try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
        console.error('❌ Gagal memuat database JSON:', err.message);
    }
}

function save() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    } catch (err) {
        console.error('❌ Gagal menyimpan database JSON:', err.message);
    }
}

module.exports = {
    // --- Warnings ---
    addWarning(userId, moderatorId, reason) {
        if (!db.warnings[userId]) db.warnings[userId] = [];
        db.warnings[userId].push({ reason, timestamp: Date.now(), moderatorId });
        save();
        return db.warnings[userId].length;
    },
    getWarnings(userId) {
        return db.warnings[userId] || [];
    },
    clearWarnings(userId) {
        delete db.warnings[userId];
        save();
    },
    getAllWarnings() {
        return db.warnings || {};
    },

    // --- Kas ---
    addKas(userId, name, amount, month, year) {
        db.kas.push({ userId, name, amount, month, year, timestamp: Date.now() });
        save();
    },
    getKasReport(filterMonth, filterYear) {
        return db.kas.filter(k => 
            (!filterMonth || k.month === filterMonth) && 
            (!filterYear || k.year === filterYear)
        );
    },
    deleteKas(name, month, year) {
        const initialLength = db.kas.length;
        db.kas = db.kas.filter(k => 
            !(k.name.toLowerCase() === name.toLowerCase() && k.month === month && k.year === year)
        );
        const success = db.kas.length < initialLength;
        if (success) save();
        return success;
    },
    searchKas(query, month, year) {
        const q = query.toLowerCase();
        return db.kas.filter(k => 
            (k.name.toLowerCase().includes(q) || k.userId === query) &&
            (!month || k.month === month) &&
            (!year || k.year === year)
        );
    },
    getAllKas() {
        return db.kas;
    },

    // --- Reaction Roles ---
    addReactionRole(messageId, channelId, emoji, roleId) {
        db.reactionRoles.push({ messageId, channelId, emoji, roleId });
        save();
    },
    getReactionRoles() {
        return db.reactionRoles || [];
    },
    deleteReactionRole(messageId, emoji) {
        db.reactionRoles = db.reactionRoles.filter(r => !(r.messageId === messageId && r.emoji === emoji));
        save();
    }
};
