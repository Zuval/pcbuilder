const sqlite3 = require("sqlite3");
const path = require("path");

const buildDB = new sqlite3.Database(path.join(__dirname, "build.db"));

buildDB.serialize(() => {
  buildDB.run(`
    CREATE TABLE IF NOT EXISTS build (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      build_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = buildDB;