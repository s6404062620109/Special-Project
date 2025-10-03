const path = require("path");
const fs = require("fs");
const db = require("../database");

const getAll = (req, res) => {
    const courseId = req.params.courseId;

    try{
        db.query(`SELECT * FROM course WHERE id = ?`, [courseId], (err, courseResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database course query error" });
            }
            if (courseResult.length === 0) {
                return res.status(404).json({ message: "Course not found" });
            }

            db.query(`SELECT * FROM subject WHERE courseId = ? `, [courseId], (err, subjectResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database subject query error" });
                }
                db.query(`SELECT name, email, profile_img FROM user WHERE id = ?`, [courseResult[0].teacherId], (err, teacherResult) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).json({ message: "Database user query error" });
                    }
                    return res.status(200).json({ courseInfo: courseResult[0], subject: subjectResults, teacherInfo: teacherResult[0] });
                });
            });
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const getSubject = (req, res) => {
    const { courseId, subjectId } = req.params;
    const jsonFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
    const pdfFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.pdf`);

    try{
        db.query(`SELECT name FROM subject WHERE id = ? AND courseId = ?`,
            [subjectId, courseId], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Database subject query error" });
              }

              // ตรวจสอบไฟล์ JSON และ PDF พร้อมกัน
              fs.access(jsonFilePath, fs.constants.F_OK, (jsonErr) => {
                fs.access(pdfFilePath, fs.constants.F_OK, (pdfErr) => {
                  const subjectname = result[0].name;
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
                        
                        return res.status(200).json({ jsonData, subjectname });
                      } catch (parseError) {
                        console.error("Error parsing content.json:", parseError);
                        return res.status(500).json({ message: "Invalid JSON format" });
                      }
                    });
                  } else if (!pdfErr) {
                    // ถ้าไม่มี content.json แต่มี PDF
                    return res.status(200).json({ pdfUrl, subjectname });
                  } else {
                    return res.status(404).json({ message: "No subject content available" });
                  }
                });
              });
            }
        );
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getAll,
    getSubject
}