const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const database = require("./database/database")


const app = express()
const PORT = 4000
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(path.join(__dirname, "../style")));

app.use(express.static(path.join(__dirname, "../src/img")));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'index.html'))
});

app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'about.html'))
});

app.get('/contact', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'contact.html'))
});

app.get('/index', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'index.html'))
});

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'login.html'))
});

app.get('/main', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'main.html'))
});

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname,'../public', 'register.html'))
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
});

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname,'pages', 'login.html'))
})

app.post("/login", (req,res) => {
    console.log(req.body)
})

app.post("/register", (req,res) => {
    const{ username, password } = req.body;

    database.run(`INSERT INTO users (username, password) VALUES (?,?)`,
        [username, password]
    )
    res.send("ההרשמות התקבלה בהצלחה")
})