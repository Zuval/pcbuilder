const sqlite3 = require("sqlite3");
const path = require("path");

const partPath = path.join(__dirname, "parts.db");
const partsDB = new sqlite3.Database(partPath, (err) => {
  if (err) {
    console.error("Failed to connect to parts database", err);
  } else {
    console.log("Connected to parts database");

    partsDB.run(`
      CREATE TABLE IF NOT EXISTS parts (
        id INTEGER PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        watt INTEGER NOT NULL
      );
    `, () => {
      partsDB.get(`SELECT COUNT(*) AS count FROM parts`, (err, row) => {
        if (err) return console.error("Failed to check parts count", err);
        if (row.count > 0) return ;

        partsDB.run(`
          INSERT INTO parts (type, name, price, watt) VALUES
          -- CPUs
          ('cpu', 'Intel Core i5-12400', 850, 65),
          ('cpu', 'Intel Core i7-13700K', 1800, 125),
          ('cpu', 'AMD Ryzen 5 5600X', 780, 65),
          ('cpu', 'AMD Ryzen 7 5800X', 1250, 105),
          ('cpu', 'Intel Core i3-12100F', 450, 60),

          -- GPUs
          ('gpu', 'NVIDIA RTX 3060', 1800, 170),
          ('gpu', 'NVIDIA RTX 4060 Ti', 2200, 160),
          ('gpu', 'AMD RX 6600', 1400, 132),
          ('gpu', 'AMD RX 6700 XT', 2000, 230),
          ('gpu', 'NVIDIA GTX 1660 Super', 1000, 125),

          -- Motherboards
          ('motherboard', 'ASUS B550', 500, 50),
          ('motherboard', 'MSI B450 Tomahawk', 430, 45),
          ('motherboard', 'Gigabyte B660M DS3H', 480, 55),
          ('motherboard', 'ASUS TUF Gaming Z690', 880, 60),
          ('motherboard', 'ASRock B550M Steel Legend', 540, 50),

          -- Coolers
          ('cooling', 'Cooler Master Hyper 212', 150, 10),
          ('cooling', 'Noctua NH-D15', 420, 12),
          ('cooling', 'be quiet! Pure Rock 2', 210, 9),
          ('cooling', 'Corsair H100i RGB', 620, 15),
          ('cooling', 'Arctic Freezer 34', 180, 10),

          -- PSUs
          ('psu', 'Corsair 650W Bronze', 320, 0),
          ('psu', 'Seasonic 750W Gold', 520, 0),
          ('psu', 'EVGA 600W White', 280, 0),
          ('psu', 'Cooler Master 850W Gold', 580, 0),
          ('psu', 'Corsair RM1000x', 690, 0),

          -- Storage
          ('storage', 'Samsung 970 EVO 1TB', 420, 5),
          ('storage', 'WD Blue 1TB HDD', 180, 4),
          ('storage', 'Kingston NV2 500GB', 230, 3),
          ('storage', 'Seagate Barracuda 2TB', 260, 5),
          ('storage', 'Crucial MX500 1TB', 360, 4),

          -- Cases
          ('case', 'NZXT H510', 300, 0),
          ('case', 'Corsair 4000D Airflow', 390, 0),
          ('case', 'Fractal Design Meshify C', 420, 0),
          ('case', 'Cooler Master NR600', 350, 0),
          ('case', 'Lian Li Lancool 215', 370, 0);
        `, (err) => {
          if (err) console.error("Error inserting parts:", err);
          else console.log("Sample parts inserted into database.");
        });
      });
    });
  }
});

module.exports = partsDB;
