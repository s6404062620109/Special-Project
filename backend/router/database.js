const mysql2 = require("mysql2");

const db = mysql2.createConnection({
    user: "root",
    host: "db",
    port: 3306,
    password: "root",
    database: "SAT",
  });
  
db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

module.exports = db;