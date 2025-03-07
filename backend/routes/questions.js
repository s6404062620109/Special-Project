const express = require("express");
const db = require("./database");

const router = express.Router();

router.post("/checkQuestionType", (req, res) => {
    const questionIds = req.body.QuestionIds;
    
    if(!Array.isArray(questionIds)){
        return res.status(500).send({ message: "questionIds want array form." })
    }

    db.query(`SELECT * FROM question WHERE QuestionID in (?)`, [questionIds], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database progress query error" });
      }
      
      else{
        return res.status(200).json({ results });
      }
    });
});

router.get("/getAlltype", (req, res) => {
  db.query("SELECT type FROM question", (err, questionResults) => {
    if (err) {
      return res.status(500).json({ error: "Database question query failed", details: err });
    }
    const questionTypes = [...new Set(questionResults.map((row) => row.type))];

    db.query("SELECT type FROM answer", (err, answerResults) => {
      if (err) {
        return res.status(500).json({ error: "Database answer query failed", details: err });
      }
      const answerTypes = [...new Set(answerResults.map((row) => row.type))];

      res.json({ questionType: questionTypes, answerType: answerTypes });
    });
  });
});


module.exports = router;