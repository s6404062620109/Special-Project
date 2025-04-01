const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("../database");

const router = express.Router();

router.use('/courses', express.static(path.join(__dirname, '../courses')));

router.get("/getAllSubject/:courseId", (req, res) => {
  const courseId = req.params.courseId;

  db.query(`SELECT * FROM course WHERE id = ?`,
    [courseId], (err, courseResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database course query error" });
      }
      db.query(`SELECT * FROM subject WHERE courseId = ? `,
        [courseId], (err, subjectResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database subject query error" });
          }

          return res.status(200).json({ courseInfo: courseResult, subject: subjectResults });
        }
      );
    }
  );
});

router.get("/getSubject/:courseId/:subjectId", (req, res) => {
  const { courseId, subjectId } = req.params;
  const jsonFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
  const pdfFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.pdf`);

  db.query(`SELECT name, images FROM subject WHERE id = ? AND courseId = ?`,
    [subjectId, courseId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database subject query error" });
      }

      // ตรวจสอบไฟล์ JSON และ PDF พร้อมกัน
      fs.access(jsonFilePath, fs.constants.F_OK, (jsonErr) => {
        fs.access(pdfFilePath, fs.constants.F_OK, (pdfErr) => {
          const pdfUrl = !pdfErr ? `/courses/c${courseId}/s${subjectId}/content.pdf` : null;

          if (!jsonErr) {
            // ถ้ามี content.json ให้อ่านและส่งกลับพร้อม pdfUrl ถ้ามี
            fs.readFile(jsonFilePath, "utf8", (err, data) => {
              if (err) {
                console.error("Error reading content.json:", err);
                return res.status(500).json({ message: "Error loading subject content" });
              }

              try {
                const jsonData = JSON.parse(data);
                return res.status(200).json({ jsonData, result, pdfUrl });
              } catch (parseError) {
                console.error("Error parsing content.json:", parseError);
                return res.status(500).json({ message: "Invalid JSON format" });
              }
            });
          } else if (!pdfErr) {
            // ถ้าไม่มี content.json แต่มี PDF
            return res.status(200).json({ pdfUrl, result });
          } else {
            return res.status(404).json({ message: "No subject content available" });
          }
        });
      });
    }
  );
});


module.exports = router;
