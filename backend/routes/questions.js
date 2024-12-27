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

module.exports = router;