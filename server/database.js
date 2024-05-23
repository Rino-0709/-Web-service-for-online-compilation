const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const logger = require('./logger');  // Импортируем логгер

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        logger.error(`Database connection error: ${err.message}`);
        console.error(err.message);
    } else {
        logger.info('Connected to the database.');
        console.log('Connected to the database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            logger.error(`Error creating users table: ${err.message}`);
        } else {
            logger.info('Users table created or already exists.');
        }
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS code_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        code TEXT,
        language TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            logger.error(`Error creating code_history table: ${err.message}`);
        } else {
            logger.info('Code history table created or already exists.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS private_token (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        token TEXT,
        company_name TEXT
    )`, (err) => {
        if (err) {
            logger.error(`Error creating code_history table: ${err.message}`);
        } else {
            logger.info('Code history table created or already exists.');
        }
    });
});

function registerUser(username, password, callback) {
    logger.info(`Registering user: ${username}`);
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            logger.error(`Error hashing password for user ${username}: ${err.message}`);
            return callback(err);
        }
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function(err) {
            if (err) {
                logger.error(`Error registering user ${username}: ${err.message}`);
            } else {
                logger.info(`User registered successfully: ${username}`);
            }
            callback(err);
        });
    });
}

function loginUser(username, password, callback) {
    logger.info(`Login attempt for username: ${username}`);
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            logger.error(`Error retrieving user ${username} for login: ${err.message}`);
            return callback(err);
        }
        if (!user) {
            logger.warn(`User not found: ${username}`);
            return callback(null, null);
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                logger.error(`Error comparing password for user ${username}: ${err.message}`);
                return callback(err);
            }
            if (!isMatch) {
                logger.warn(`Invalid password for user: ${username}`);
                return callback(null, null);
            }
            logger.info(`User logged in successfully: ${username}`);
            callback(null, user);
        });
    });
}

function saveCode(userId, code, language, callback) {
    logger.info(`Saving code for user ID: ${userId}`);
    const query = `INSERT INTO code_history (user_id, code, language) VALUES (?, ?, ?)`;
    db.run(query, [userId, code, language], function (err) {
        if (err) {
            logger.error(`Error saving code for user ID ${userId}: ${err.message}`);
            return callback(err);
        }
        logger.info(`Code saved successfully for user ID: ${userId}`);
        callback(null, { id: this.lastID });
    });
}

function checkToken(token, ip) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM private_token WHERE token = ?`;
        db.get(query, [token], (err, row) => {
            if (err) {
                logger.error(`Error checking token: ${token} from IP: ${ip}`);
                reject(err);
            } else if (row) {
                logger.info(`Successfully API check - token: ${token} from IP: ${ip}`);
                resolve(true);
            } else {
                logger.warn(`Token not found: ${token} from IP: ${ip}`);
                resolve(false);
            }
        });
    });
};

const getCodeHistory = (userId, callback) => {
    logger.info(`Fetching code history for user ID: ${userId}`);
    const query = `SELECT * FROM code_history WHERE user_id = ? ORDER BY timestamp DESC`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            logger.error(`Error retrieving code history for user ID ${userId}: ${err.message}`);
            return callback(err);
        }
        logger.info(`Code history retrieved successfully for user ID: ${userId}`);
        callback(null, rows);
    });
};

module.exports = {
    registerUser,
    loginUser,
    saveCode,
    getCodeHistory,
    checkToken
};
