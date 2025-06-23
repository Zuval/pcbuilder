const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "users.db");
const database = new sqlite3.Database(dbPath);

database.serialize(() => {
  database.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err);
      } else {
        console.log("Users table ready.");
      }
    }
  );
});

module.exports = database;
