const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getCourses", (req, res) => {
    db.query("SELECT * FROM course", (err, results) => {
      if (err) {
        return res.status(500).send("Database query error");
      }
      else{
        return res.status(200).send(results);
      }
    });
});

module.exports = router;