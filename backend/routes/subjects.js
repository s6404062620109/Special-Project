const express = require("express");
const path = require("path");
const fs = require('fs');
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
  const { courseId, subjectId } = req.params;
  const filePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
  
    db.query(`SELECT name, images FROM subject WHERE id = ? AND courseId = ? `, [subjectId, courseId], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database subject query error" });
        } 

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              console.error("Error reading content.json:", err);
              return res.status(500).json({ message: "Error loading subject content" });
          }
  
          try {
              const jsonData = JSON.parse(data);
              return res.status(200).json({ jsonData, result });
          } catch (parseError) {
              console.error("Error parsing content.json:", parseError);
              return res.status(500).json({ message: "Invalid JSON format" });
          }
        });

      }
    );
});

module.exports = router;