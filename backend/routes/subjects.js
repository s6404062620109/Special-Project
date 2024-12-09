const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getAllSubject/:courseId", (req, res) => {
    const courseId = req.params.courseId;
  
    db.query(`SELECT * FROM courses WHERE CourseID = ?`, [courseId], (err, courseResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database courses query error" });
        } else {
          db.query(`SELECT * FROM subject WHERE CourseID = ? `, [courseId], (err, subjectResults) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database subject query error" });
              } else {
                return res.status(200).json({ courseInfo: courseResult, subject: subjectResults });
              }
            }
          );
        }
      }
    );
});

router.get("/getSubject/:courseId/:subjectId", (req, res) => {
    const courseId = req.params.courseId;
    const subjectId = req.params.subjectId;
  
    db.query(`SELECT * FROM subject WHERE SubjectID = ? AND CourseID = ? `, [subjectId, courseId], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database subject query error" });
        } else {
          return res.status(200).json(result);
        }
      }
    );
});

module.exports = router;