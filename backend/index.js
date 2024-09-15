const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: 'Content-Type,Authorization',
}));

const db = mysql2.createConnection({
    user: "root",
    host: "db",
    port: 3306,
    password: "root",
    database: "SAT"
})

db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to MySQL database');
});

app.get('/getCourses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) {
            res.status(500).send('Database query error');
            return;
        }
        res.json(results);
    });
});

app.post('/register', async (req, res) =>{
    const { email, password, name } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
    }
    
    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database query error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO user (email, password, name, role, OTP) VALUES(?, ?, ?, ?, ?)",
                [email, hashedPassword, name, 'Student', '-'],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "Register Failed!!!" });
                    } else {
                        return res.status(201).json({ message: "Register Success!!!" });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    });
})


const port = 3001
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})
