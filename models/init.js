import db from "./database.js";

function createTables() {
  const createUserTable = `
        CREATE TABLE IF NOT EXISTS users(
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('viewer','analyst','admin')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
  db.prepare(createUserTable).run();
  console.log("users table created if not existed");

  const createRecordTable = `
        CREATE TABLE IF NOT EXISTS records(
          recordId INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income','expense')),
          category TEXT NOT NULL,
          description TEXT,
          userId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.prepare(createRecordTable).run();
    console.log("records table created if not existed");

}

export default createTables
