const express = require("express");
const session = require("express-session");
const path = require("path");
const sqlite3 = require("sqlite3");
const database = require("./database/database");
const partsDB = require("./database/partsDatabase");
const buildDB = require("./database/buildDatabase");

const app = express();

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict"
}
}));


app.use(express.static(path.join(__dirname, "../style")));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../src/img")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/contact.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"));
});

app.post("/register", (req, res) => {
  const { email, password, password2 } = req.body;

  if (password !== password2) {
    return res.send("הסיסמאות לא תואמות");
  }

  database.run(
    `INSERT INTO users (email, password) VALUES (?, ?)`,
    [email, password],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("שגיאה בהרשמה או שהאימייל כבר קיים");
      }
      return res.redirect("/login");
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password, remember } = req.body;

  database.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("שגיאה בהתחברות");
      }

      if (!row) {
        return res.status(401).send("פרטי התחברות שגויים");
      }

      req.session.user = { id: row.id, email: row.email };

      if (remember) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; 
      } else {
        req.session.cookie.expires = false; 
      }

      return res.redirect("/dashboard");
    }
  );
});


app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "../public/main.html"));
});

app.get("/session-info", (req, res) => {
  if (req.session.user) {
    res.json({ email: req.session.user.email });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("שגיאה ביציאה");
    res.redirect("/login");
  });
});

app.get("/parts", (req, res) => {
  partsDB.all("SELECT * FROM parts", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/save-build", (req, res) => {
  const { email, build } = req.body;

  if (!email || !build) {
    return res.status(400).json({ error: "Missing email or build data" });
  }

  const buildJson = JSON.stringify(build);

  buildDB.run(
    `DELETE FROM build WHERE email = ?`,
    [email],
    function (deleteErr) {
      if (deleteErr) {
        console.error(deleteErr);
        return res.status(500).json({ error: "Error deleting previous builds" });
      }

      buildDB.run(
        `INSERT INTO build (email, build_data) VALUES (?, ?)`,
        [email, buildJson],
        function (insertErr) {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ error: "Error saving new build" });
          }

          res.status(200).json({ message: "Build saved successfully", buildId: this.lastID });
        }
      );
    }
  );
});

app.get("/last-build", (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Missing email" });

  buildDB.get(
    `SELECT build_data FROM build WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
    [email],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!row) return res.json([]);

      try {
        const parsed = JSON.parse(row.build_data);
        res.json(parsed);
      } catch (e) {
        console.error("Failed to parse build data", e);
        res.json([]);
      }
    }
  );
});
