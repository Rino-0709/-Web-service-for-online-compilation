const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS code_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        language TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});




function registerUser(username, password, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function(err) {
            callback(err);
        });
    });
}

function loginUser(username, password, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(null, null);
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(null, null);
            callback(null, user);
        });
    });
}

function saveCode(userId, code, language, callback) {
    const query = `INSERT INTO code_history (user_id, code, language) VALUES (?, ?, ?)`;
    db.run(query, [userId, code, language], function (err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID });
    });
}

const getCodeHistory = (userId, callback) => {
  const query = `SELECT * FROM code_history WHERE user_id = ? ORDER BY timestamp DESC`;
  db.all(query, [userId], (err, rows) => {
      if (err) {
          return callback(err);
      }
      callback(null, rows);
  });
};

module.exports = {
    registerUser,
    loginUser,
    saveCode,
    getCodeHistory
};
