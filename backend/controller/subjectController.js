const path = require("path");
const fs = require("fs");
const db = require("../database");

const getAll = (req, res) => {
  const courseId = req.params.courseId;

  const sql = `
    SELECT
      c.id AS courseId,
      c.name AS courseName,
      c.icon AS courseIcon,
      c.teacherId,
      c.enable,
      c.createat,
      c.updateat,
      c.announce_state,
      c.pretest_rate,
      c.posttest_rate,
      c.duration_days,
      (SELECT COUNT(*) FROM enrollment WHERE courseId = c.id) AS countEnrollments,
      (SELECT COUNT(*) FROM enrollment WHERE courseId = c.id AND posttest_complete = 1) AS countPosttestComplete,
      u.sex AS teacherSex,
      u.name AS teacherName,
      u.surname AS teacherSurname,
      u.email AS teacherEmail,
      u.profile_img AS teacherImg,
      COUNT(DISTINCT q.id) AS countQuestions,
      COUNT(DISTINCT l.id) AS countLabs
    FROM course c
    LEFT JOIN user u ON c.teacherId = u.id
    LEFT JOIN subject s ON s.courseId = c.id
    LEFT JOIN questions q ON q.courseId = c.id
    LEFT JOIN labs l ON l.subjectId = s.id
    WHERE c.id = ? 
    GROUP BY c.id
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database query error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    db.query(`SELECT * FROM subject WHERE courseId = ?`, [courseId], (err, subjectResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database subject query error" });
      }

      const course = result[0];
      const response = {
        courseInfo: {
          id: course.courseId,
          name: course.courseName,
          icon: course.courseIcon,
          teacherId: course.teacherId,
          enable: course.enable,
          createat: course.createat,
          updateat: course.updateat,
          announce_state: course.announce_state,
          pretest_rate: course.pretest_rate,
          posttest_rate: course.posttest_rate,
          duration_days: course.duration_days,
        },
        subject: subjectResults,
        teacherInfo: {
          sex: course.teacherSex,
          name: course.teacherName,
          surname: course.teacherSurname,
          email: course.teacherEmail,
          profile_img: course.teacherImg,
        },
        countQuestions: course.countQuestions,
        countLabs: course.countLabs,
        countEnrollments: course.countEnrollments,
        countPosttestComplete: course.countPosttestComplete,
      };

      return res.status(200).json(response);
    });
  });
};

const getAllSubjectStudent = (req, res) => {
  const courseId = req.params.courseId;

  const sql = `
    SELECT
      c.id AS courseId,
      c.name AS courseName,
      c.icon AS courseIcon,
      c.teacherId,
      c.enable,
      c.createat,
      c.updateat,
      c.announce_state,
      c.pretest_rate,
      c.posttest_rate,
      (SELECT COUNT(*) FROM enrollment WHERE courseId = c.id) AS countEnrollments,
      (SELECT COUNT(*) FROM enrollment WHERE courseId = c.id AND posttest_complete = 1) AS countPosttestComplete,
      u.sex AS teacherSex,
      u.name AS teacherName,
      u.surname AS teacherSurname,
      u.email AS teacherEmail,
      u.profile_img AS teacherImg,
      COUNT(DISTINCT q.id) AS countQuestions,
      COUNT(DISTINCT l.id) AS countLabs
    FROM course c 
    LEFT JOIN user u ON c.teacherId = u.id
    LEFT JOIN subject s ON s.courseId = c.id
    LEFT JOIN questions q ON q.courseId = c.id
    LEFT JOIN labs l ON l.subjectId = s.id
    WHERE c.id = ? AND enable = 1
    GROUP BY c.id
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database query error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    db.query(`SELECT * FROM subject WHERE courseId = ?`, [courseId], (err, subjectResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database subject query error" });
      }

      const course = result[0];
      const response = {
        courseInfo: {
          id: course.courseId,
          name: course.courseName,
          icon: course.courseIcon,
          teacherId: course.teacherId,
          enable: course.enable,
          createat: course.createat,
          updateat: course.updateat,
          announce_state: course.announce_state,
          pretest_rate: course.pretest_rate,
          posttest_rate: course.posttest_rate,
        },
        subject: subjectResults,
        teacherInfo: {
          sex: course.teacherSex,
          name: course.teacherName,
          surname: course.teacherSurname,
          email: course.teacherEmail,
          profile_img: course.teacherImg,
        },
        countQuestions: course.countQuestions,
        countLabs: course.countLabs,
        countEnrollments: course.countEnrollments,
        countPosttestComplete: course.countPosttestComplete,
      };

      return res.status(200).json(response);
    });
  });
};

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
    getAllSubjectStudent,
    getSubject
}