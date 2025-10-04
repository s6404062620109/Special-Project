const db = require("../database");

const enrollCourse = (req, res) => {
  const { courseId, userId } = req.body;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required." });
  }

  if (isNaN(courseId) || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid Course ID or User ID." });
  }

  try {
    const sql = `
      SELECT 
        c.pretest_rate, c.posttest_rate,
        q.id AS questionId,
        l.id AS labId,
        l.typeId AS labType
      FROM course c
      LEFT JOIN questions q ON q.courseId = c.id
      LEFT JOIN subject s ON s.courseId = c.id
      LEFT JOIN labs l ON l.subjectId = s.id AND l.typeId IN (3, 5, 6)
      WHERE c.id = ?
    `;

    db.query(sql, [courseId], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database query error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Course not found or has no questions/labs." });
      }

      const pretestRate = results[0].pretest_rate;
      const posttestRate = results[0].posttest_rate;

      const questionIds = [...new Set(results.map(r => r.questionId).filter(Boolean))];
      const labIds = [...new Set(results.map(r => r.labId).filter(Boolean))];

      const getRandomItems = (array, count) => {
        if (count >= array.length) return [...array];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      const pretestQids = getRandomItems(questionIds, pretestRate);
      const posttestQids = getRandomItems(questionIds, posttestRate);

      db.query("INSERT INTO enrollment (courseId, completed_labs, total_labs, userId, startat) VALUES (?, ?, ?, ?, ?)",
        [courseId, 0, labIds.length, userId, new Date()], (err, enrollResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Failed to insert enrollment." });
          }

          const enrollmentId = enrollResult.insertId;

          const insertMultiple = (sql, values) =>
            Promise.all(values.map(v => new Promise((resolve, reject) => {
              db.query(sql, v, (err) => (err ? reject(err) : resolve()));
            })));

          (async () => {
            try {
              // 🔹 insert pretest questions
              const pretestValues = pretestQids.map(qid => [qid, 'pre', enrollmentId]);
              await insertMultiple("INSERT INTO question_progress (questionId, type, enrollmentId) VALUES (?, ?, ?)", pretestValues);

              // 🔹 insert posttest questions
              const posttestValues = posttestQids.map(qid => [qid, 'post', enrollmentId]);
              await insertMultiple("INSERT INTO question_progress (questionId, type, enrollmentId) VALUES (?, ?, ?)", posttestValues);

              // 🔹 insert lab progress
              const labValues = labIds.map(lid => [lid, enrollmentId]);
              await insertMultiple("INSERT INTO lab_progress (questionId, enrollmentId) VALUES (?, ?)", labValues);

              return res.status(200).json({ message: "Course enrolled successfully." });

            } catch (err) {
              console.error(err);
              return res.status(500).json({ message: "Failed to insert progress records.", error: err });
            }
          })();
        }
      );
    });
  } catch (error) {
    console.error(error);
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