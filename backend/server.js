const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const path = require("path");

const database = new sqlite3.Database(path.join(__dirname, "users.db"))

app.use(express.static(path.join(__dirname, "../style")));
app.use(express.static(path.join(__dirname, "../src/img")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/main.html"));
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
    `INSERT INTO users.db (email, password) VALUES (?, ?)`,
    [email, password],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("שגיאה בהרשמה");
      }
      res.send("ההרשמה התקבלה בהצלחה");
      res.redirect('/login');
    }
  );
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});