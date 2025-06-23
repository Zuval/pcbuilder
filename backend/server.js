const express = require("express");
const session = require("express-session");
const path = require("path");
const database = require("./database/database");

const app = express();

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
}));

app.use(express.static(path.join(__dirname, "../style")));
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
  const { email, password } = req.body;

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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});