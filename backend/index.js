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
app.use(cors());

const db = mysql2.createConnection({
    user: "root",
    host: "127.0.0.1",
    port: 3306,
    password: "Password1234",
    database: "sat-project"
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


const port = 3001
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})