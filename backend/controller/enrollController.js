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
        c.pretest_rate, c.posttest_rate, c.duration_days,
        q.id AS questionId,
        l.id AS labId,
        l.typeId AS labType
      FROM course c
      LEFT JOIN questions q ON q.courseId = c.id
      LEFT JOIN subject s ON s.courseId = c.id
      LEFT JOIN labs l ON l.subjectId = s.id AND l.typeId IN (3, 4, 5, 6)
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

      const durationDays = results[0].duration_days;
      const pretestQids = getRandomItems(questionIds, pretestRate);
      const posttestQids = getRandomItems(questionIds, posttestRate);

      const startTime = new Date();
      let expiresAt = null;

      if (durationDays !== null && durationDays !== undefined) {
        expiresAt = new Date(startTime);
        expiresAt.setDate(expiresAt.getDate() + durationDays);
      }

      db.query("INSERT INTO enrollment (courseId, completed_labs, total_labs, userId, startat, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
        [courseId, 0, labIds.length, userId, startTime, expiresAt], (err, enrollResult) => {
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

              return res.status(200).json({ message: "Course enrolled successfully.", enrollmentId });

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
}

const enrollCancel = (req, res) => {
  const { courseId, enrollmentId } = req.params;
  const { reason } = req.body;

  if(!courseId || !enrollmentId) {
    return res.status(400).json({ message: "CourseId, enrollmentId are require." });
  }

  try{
    db.query("UPDATE enrollment SET pretest_complete = -2, posttest_complete = -2, endat = NOW() WHERE id = ? AND courseId = ?", [ enrollmentId, courseId ], (error) => {
      if(error){
        console.log(error);
        return res.status(500).json({ message: "Database enrollment query error." });
      }

      db.query("INSERT INTO cancellation_log (reason, enrollmentId) VALUES (?, ?)", [ reason, enrollmentId ], (insertError) => {
        if(insertError){
          console.log(error);
          return res.status(500).json({ message: "Database cancellation_log query error." });
        }

        return res.status(200).json({ message: "ยกเลิกการลงทะเบียนสำเร็จ" });
      });
    });
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
}

const checkCoursesEnroll = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Require userId." });
    }

    try{
      db.query(`SELECT * FROM enrollment WHERE userId = ? AND posttest_complete IN (0, 1, -1)`, [userId], (err, results) => {
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

const checkCourseEnroll = (req, res) => {
    const { userId, courseId, enrollmentId } = req.params;

    if(!userId || !courseId || !enrollmentId){
      return res.status(400).json({ message: "User ID, Course ID, and Enrollment ID are required." });
    }

    try{
      db.query(`SELECT * FROM enrollment WHERE id = ? AND userId = ? AND courseId = ? AND posttest_complete IN (0, 1, -1) AND pretest_complete IN (0, 1)`, 
        [enrollmentId, userId, courseId], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database enrollment query error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "No enrollment found." });
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

const getLatestEnrollment = (req, res) => {
  const { userId, courseId } = req.params;

  if (!userId || !courseId) {
    return res.status(400).json({ message: "User ID and Course ID are required." });
  }

  try {
    db.query(`SELECT id FROM enrollment WHERE userId = ? AND courseId = ? AND posttest_complete IN (0, -1) ORDER BY startat DESC LIMIT 1`, 
      [userId, courseId], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database query error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "No active or failed enrollment found." });
        }
      return res.status(200).json({ latestEnrollmentId: results[0].id });
    });
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

module.exports = {
    enrollCourse,
    enrollCancel,
    checkCoursesEnroll,
    checkCourseEnroll,
    getLatestEnrollment
}