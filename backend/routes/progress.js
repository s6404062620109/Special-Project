const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/checkCourseProgress/:enrollmentId", (req, res) => {
  const { enrollmentId } = req.params;

  db.query(`SELECT * FROM progress WHERE enrollmentId = ?`, [enrollmentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database progress query error" });
    }
    
    const filteredResults = results.map(item => item.questionId);
    db.query(`SELECT id, type, subjectId FROM question WHERE id IN (?)`, [filteredResults], (error, questionResults) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Database question query error" });
      }

      const combinedResults = results.map(progress => {
        const matchedQuestion = questionResults.find(q => q.id === progress.questionId);
        return {
          ...progress,
          subjectId: matchedQuestion ? matchedQuestion.subjectId : null,
          type: matchedQuestion ? matchedQuestion.type : null
        };
      });

      return res.status(200).json({ results: combinedResults });
    });

  });
});
  
router.get("/getLatestProgress/:enrollmentId", (req, res) => {
  const { enrollmentId } = req.params;

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

      if (questionResult[0].type.toLowerCase().includes("lab")) {
        return res.status(200).json({ inProgress: `subject/${questionResult[0].subjectId}/${enrollmentId}` });
      }

      if(questionResult[0].type === "post"){
        return res.status(200).json({ inProgress: `posttest/${enrollmentId}` });
      }
    });
  });
});

module.exports = router;