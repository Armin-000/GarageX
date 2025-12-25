const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'car_garage.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Greška pri spajanju na SQLite bazu:', err);
  } else {
    console.log('SQLite baza spremna:', dbPath);
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function init() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price REAL NOT NULL,
        mileage INTEGER,
        fuel_type TEXT,
        transmission TEXT,
        status TEXT DEFAULT 'available',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    const row = await get('SELECT COUNT(*) AS count FROM cars');
    if (!row || row.count === 0) {
      console.log('Ubacujem početne aute u bazu...');
      await run(
        `INSERT INTO cars (make, model, year, price, mileage, fuel_type, transmission, status) VALUES
          ('Opel', 'Astra J Sports Tourer', 2013, 7500.00, 214000, 'diesel', 'manual', 'available'),
          ('Volkswagen', 'Golf 7', 2016, 11500.00, 160000, 'diesel', 'manual', 'reserved'),
          ('BMW', '320d', 2015, 14500.00, 190000, 'diesel', 'automatic', 'sold'),
          ('Toyota', 'Corolla', 2019, 15500.00, 90000, 'petrol', 'automatic', 'available'),
          ('Hyundai', 'Ioniq 5', 2022, 43000.00, 25000, 'electric', 'automatic', 'available')
        ;`
      );
    }
  } catch (err) {
    console.error('Greška pri inicijalizaciji baze:', err);
  }
}

init();

module.exports = {
  db,
  run,
  get,
  all
};
