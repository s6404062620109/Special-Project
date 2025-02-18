const express = require("express");
const db = require("./database");

const router = express.Router();

router.post('/enrollCourse', (req, res) => {
  const { courseId, userId } = req.body;

  db.query('SELECT id FROM subject WHERE courseId = ?', [courseId], (error, result) => {
      if (error) {
          console.log(error);
          return res.status(500).json({ message: "Subject database query error." });
      }

      if (result.length === 0) {
          return res.status(404).json({ message: "No subjects found for this course." });
      }

      const subjectList = result.map((subject) => subject.id);

      db.query('SELECT id, type, subjectId FROM question WHERE subjectId IN (?)', [subjectList], (error, questionResult) => {
          if (error) {
              console.log(error);
              return res.status(500).json({ message: "Question database query error." });
          }

          let preQuestions = [];
          let postQuestions = [];
          let labQuestions = [];

          subjectList.forEach(subjectId => {
              const subjectQuestions = questionResult.filter(q => q.subjectId === subjectId);

              // Select one random 'pre' question
              const preList = subjectQuestions.filter(q => q.type === "pre");
              if (preList.length > 0) {
                  const randomPre = preList[Math.floor(Math.random() * preList.length)];
                  preQuestions.push(randomPre.id);
              }

              // Select one random 'post' question
              const postList = subjectQuestions.filter(q => q.type === "post");
              if (postList.length > 0) {
                  const randomPost = postList[Math.floor(Math.random() * postList.length)];
                  postQuestions.push(randomPost.id);
              }
          });

          // Collect all 'lab' type questions
          labQuestions = questionResult.filter(q => q.type === "lab").map(q => q.id);
          let total_labs = labQuestions.length;

          let sortedQuestions = [...preQuestions, ...labQuestions, ...postQuestions];

          db.query("INSERT INTO enrollment (courseId, pretest_complete, posttest_complete, completed_labs, total_labs, userId) VALUES(?, ?, ?, ?, ?, ?)",
              [courseId, false, false, 0, total_labs, userId], (error, result) => {
                  if (error) {
                      console.log(error);
                      return res.status(500).json({ message: "Enrollment insertion error." });
                  }

                  const enrollmentId = result.insertId;

                  if (sortedQuestions.length === 0) {
                      return res.status(200).json({ message: "Enrollment successful, but no questions available." });
                  }

                  let values = sortedQuestions.map(qId => [qId, enrollmentId]);
                  db.query("INSERT INTO progress (questionId, enrollmentId) VALUES ?", [values], (error, progressResult) => {
                      if (error) {
                          console.log(error);
                          return res.status(500).json({ message: "Progress insertion error." });
                      }

                      return res.status(200).json({
                          message: "Enrollment and progress recorded successfully.",
                          enrollmentId: enrollmentId,
                      });
                  });
              }
          );
      });
  });
});

router.get("/checkCoursesEnroll/:userId", (req, res) => {
  const userId = req.params.userId;
  
  db.query(`SELECT * FROM enrollment WHERE userId = ?`, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database enrollment query error" });
    }
  
    else{
      return res.status(200).json({ results });
    }
  });
});

module.exports = router;