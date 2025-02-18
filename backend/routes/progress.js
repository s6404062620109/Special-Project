const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/checkCourseProgress/:historyId", (req, res) => {
  const historyId = req.params.historyId;

  db.query(`SELECT * FROM progress WHERE HistoryID = ?`, [historyId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database progress query error" });
    }
  
    else{
      return res.status(200).json({ results });
    }
  });
});
  
router.get("/getLatestProgress/:enrollmentId", (req, res) => {
  const { enrollmentId, } = req.params;

  db.query("SELECT questionId FROM progress WHERE is_completed = ? AND enrollmentId = ?", [false, enrollmentId], (error, result) => {
    if(error){
      console.log(error);
      return res.status(500).json({ message: "Database progress query error" });
    }

    const inProgressId = result[0].questionId;
    db.query("SELECT type, subjectId FROM question WHERE id = ?", [inProgressId], (error, questionResult) => {
      if(error){
        console.log(error);
        return res.status(500).json({ message: "Database question query error" });
      }

      if(questionResult[0].type === "pre"){
        return res.status(200).json({ inProgress: `pretest/${enrollmentId}` });
      }

      if(questionResult[0].type === "lab"){
        return res.status(200).json({ inProgress: `subject/${questionResult[0].subjectId}` });
      }

      if(questionResult[0].type === "post"){
        return res.status(200).json({ inProgress: `posttest/${enrollmentId}` });
      }
    });
  });
});

module.exports = router;