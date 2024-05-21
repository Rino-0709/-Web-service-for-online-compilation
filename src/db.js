// const sqlite3 = require('sqlite3').verbose();
// const dbName = 'users.sqlite';
// const db = new sqlite3.Database(dbName);

// db.serialize(()=> {
//     const sql = 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, pass TEXT, history TEXT)';
//     db.run(sql);
// });

// class Users {
//     static find(id, cb) {
//         db.get('SELECT history FROM users id = ?', id, cb)
//     }
//     static create_user(login, pass, history = '', cb){
//         const sql = 'INSERT INTO users (login, pass, history) VALUES (?, ?, ?)'
        
//     }
// }


// db.close();