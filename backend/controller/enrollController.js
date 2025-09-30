const db = require("../database");

const enrollCourse = (req, res) => {
  const { courseId, userId } = req.body;

  try {
    const sql = `
      SELECT q.id AS questionId, q.typeId
      FROM question q
      JOIN subject s ON s.id = q.subjectId
      WHERE s.courseId = ?
    `;

    db.query(sql, [courseId], (error, questionResult) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Question database query error." });
      }

      if (!questionResult.length) {
        return res.status(404).json({ message: "No questions found for this course." });
      }

      const preQuestions = questionResult
        .filter(q => q.typeId === 1)
        .map(q => q.questionId);

      const postQuestions = questionResult
        .filter(q => q.typeId === 2)
        .map(q => q.questionId);

      const labQuestions = questionResult
        .filter(q => [3, 4, 5, 6].includes(q.typeId))
        .map(q => q.questionId);

      const total_labs = labQuestions.length;
      const sortedQuestions = [...preQuestions, ...labQuestions, ...postQuestions];

      db.query(
        "INSERT INTO enrollment (courseId, pretest_complete, posttest_complete, completed_labs, total_labs, userId) VALUES(?, ?, ?, ?, ?, ?)",
        [courseId, false, false, 0, total_labs, userId],
        (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Enrollment insertion error." });
          }

          const enrollmentId = result.insertId;

          if (!sortedQuestions.length) {
            return res.status(200).json({ message: "Enrollment successful, but no questions available." });
          }

          const values = sortedQuestions.map(qId => [qId, enrollmentId]);
          db.query("INSERT INTO progress (questionId, enrollmentId) VALUES ?", [values], (error) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ message: "Progress insertion error." });
            }

            return res.status(200).json({
              message: "Enrollment and progress recorded successfully.",
              enrollmentId,
            });
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const checkCoursesEnroll = (req, res) => {
    const userId = req.params.userId;

    try{
        db.query(`SELECT * FROM enrollment WHERE userId = ?`, [userId], (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database enrollment query error" });
            }
          
            else{
              return res.status(200).json({ results });
            }
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    enrollCourse,
    checkCoursesEnroll
}