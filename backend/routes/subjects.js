const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getAllSubject/:courseId", (req, res) => {
    const courseId = req.params.courseId;
  
    db.query(`SELECT * FROM course WHERE id = ?`, [courseId], (err, courseResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database course query error" });
        } else {
          db.query(`SELECT * FROM subject WHERE courseId = ? `, [courseId], (err, subjectResults) => {
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