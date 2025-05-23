const sqlite3 = require("sqlite3")
const path = require("path")
const database = new sqlite3.Database(path.join(__dirname, "users.db"))

database.serialize(() => {
    database.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
        )`)
})

module.exports = database;

