const db = require("../database");

const getPretest = (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const sql = `
      SELECT 
        q.id       AS qId,
        q.content  AS qContent,
        a.id       AS aId,
        a.content  AS aContent
      FROM question_progress p
      JOIN questions q ON p.questionId = q.id LEFT JOIN question_answers a ON q.id = a.questionId
      WHERE p.enrollmentId = ? AND p.type = 'pre'
    `;

    db.query(sql, [enrollmentId], (error, rows) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Database query error" });
      } 

      if (!rows.length) {
        return res.status(404).json({ message: "Not have any pretest question in this course." });
      }

      const questionMap = {};
      rows.forEach(row => {
        if (!questionMap[row.qId]) {
          questionMap[row.qId] = {
            qId: row.qId,
            content: row.qContent,
            type: row.qType,
            choice: []
          };
        }
        if (row.aId) {
          questionMap[row.qId].choice.push({
            aId: row.aId,
            content: row.aContent
          });
        }
      });

      const questionsWithChoices = Object.values(questionMap);

      return res.status(200).json({ questions: questionsWithChoices });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

function updateEnrollmentAndGetNext(enrollmentId, answerRecords, res) {
  db.query(`UPDATE enrollment SET pretest_complete = 1 WHERE id = ?`, [enrollmentId], (enrollErr) => {
    if (enrollErr) {
      console.log(enrollErr);
      return res.status(500).json({ message: "Enroll update error" });
    }
    const insertValues = answerRecords.map(r => [r.user_answer, r.progressId]);

    db.query(`INSERT INTO question_logs (user_answer, progressId) VALUES ?`,
      [insertValues], (answerErr) => {
        if (answerErr) {
          console.log(answerErr);
          return res.status(500).json({ message: "Progress answer insert error" });
        }

        return res.status(200).json({ message: "Progress pretest update completed."});
      }
    );
  });
}

const submitPretest = (req, res) => {
  const { answer, enrollmentId } = req.body;
  const userAnswers = Object.values(answer);
  const userAnswerIds = userAnswers.map(answer => answer.answerId);
  const userQuestionIds = Object.keys(answer).map(Number);

  try {
    // 1. ตรวจสอบคำตอบที่เลือก พร้อมเช็คว่า correct หรือไม่
    db.query(`SELECT questionId, type FROM question_answers WHERE id IN (?) AND questionId IN (?)`, 
      [userAnswerIds, userQuestionIds], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Database answer query error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "No matching answers found" });
      }

      const questionIdsToUpdate = result.map((r) => r.questionId);
      const correctQuestionIds = result
        .filter((r) => r.type === 1)
        .map((r) => r.questionId);

      // 2. update progress: set is_completed = true, reset score = 0
      db.query(`UPDATE question_progress SET is_completed = 1, score = 0 WHERE questionId IN (?) AND enrollmentId = ? AND type = 'pre'`, 
        [questionIdsToUpdate, enrollmentId], (progressErr) => {
        if (progressErr) {
          console.log(progressErr);
          return res.status(500).json({ message: "Progress update error" });
        }

        // 3. update score = 1 สำหรับคำตอบที่ถูก
        if (correctQuestionIds.length > 0) {
          db.query(`UPDATE question_progress SET score = 1 WHERE questionId IN (?) AND enrollmentId = ? AND type = 'pre'`, [correctQuestionIds, enrollmentId], (scoreErr) => {
            if (scoreErr) {
              console.log(scoreErr);
              return res.status(500).json({ message: "Score update error" });
            }

            db.query(`SELECT id, questionId FROM question_progress WHERE enrollmentId = ? AND questionId IN (?) AND type = 'pre'`, 
              [enrollmentId, userQuestionIds], (error, progressResult) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ message: "Progress query error" });
                }
                if (progressResult.length === 0) {
                  return res.status(404).json({ message: "No progress found" });
                }
                const answerRecords = Object.entries(answer).map(([qId, ans]) => {
                  const progress = progressResult.find(p => p.questionId === Number(qId));
                  return {
                    user_answer: ans.content,
                    progressId: progress ? progress.id : null
                  };
                });
                updateEnrollmentAndGetNext(enrollmentId, answerRecords, res);
            });
          });
        } else {
          db.query(`SELECT id, questionId FROM question_progress WHERE enrollmentId = ? AND questionId IN (?) AND type = 'pre'`,
            [enrollmentId, userQuestionIds], (error, progressResult) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ message: "Progress query error" });
              }
              if (progressResult.length === 0) {
                return res.status(404).json({ message: "No progress found" });
              }
              const answerRecords = Object.entries(answer).map(([qId, ans]) => {
                const progress = progressResult.find(p => p.questionId === Number(qId));
                return {
                  user_answer: ans.content,
                  progressId: progress ? progress.id : null
                };
              });
              updateEnrollmentAndGetNext(enrollmentId, answerRecords, res);
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

module.exports = {
    getPretest,
    submitPretest
}