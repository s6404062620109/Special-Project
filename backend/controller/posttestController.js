const db = require("../database");

const getPosttest = (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const sql = `
      SELECT 
        q.id AS qId,
        q.content,
        qa.id AS aId,
        qa.content AS answerContent
      FROM question_progress p
      JOIN questions q ON p.questionId = q.id
      LEFT JOIN question_answers qa ON q.id = qa.questionId
      WHERE p.enrollmentId = ? AND p.type = 'post'
    `;

    db.query(sql, [enrollmentId], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Database query error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "No posttest questions found in this course." });
      }

      const questionsMap = {};
      result.forEach(row => {
        if (!questionsMap[row.qId]) {
          questionsMap[row.qId] = {
            qId: row.qId,
            content: row.content,
            type: row.type,
            choice: []
          };
        }
        if (row.aId) {
          questionsMap[row.qId].choice.push({
            aId: row.aId,
            content: row.answerContent
          });
        }
      });

      const questionsWithChoices = Object.values(questionsMap);

      return res.status(200).json({ questions: questionsWithChoices });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

function finalizePosttest(enrollmentId, res) {
  const sqlCompare = `
    SELECT 
      SUM(CASE WHEN p.type = 'pre' THEN p.score ELSE 0 END) AS pre_score,
      SUM(CASE WHEN p.type = 'post' THEN p.score ELSE 0 END) AS post_score
    FROM question_progress p
    WHERE p.enrollmentId = ?
  `;

  db.query(sqlCompare, [enrollmentId], (err, scores) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Score comparison error" });
    }

    const preScore = Number(scores[0]?.pre_score || 0);
    const postScore = Number(scores[0]?.post_score || 0);

    db.query(`SELECT score FROM lab_progress WHERE enrollmentId = ? AND is_completed = 1`, [enrollmentId], (labErr, labResults) => {
      if (labErr) {
        console.log(labErr);
        return res.status(500).json({ message: "Lab progress query error" });
      }

      const labScores = labResults.map(r => r.score);
      const totalLabCount = labScores.length;
      const totalLabScore = labScores.reduce((sum, s) => sum + s, 0);
      const labPassPercent = totalLabCount ? (totalLabScore / totalLabCount) * 100 : 0;

      const postTestStatus = (postScore > preScore && labPassPercent >= 60) ? 1 : -1;

      db.query(`UPDATE enrollment SET posttest_complete = ?, endat = NOW() WHERE id = ?`,
        [postTestStatus, enrollmentId], (enrollErr) => {
          if (enrollErr) {
            console.log(enrollErr);
            return res.status(500).json({ message: "Enrollment posttest_complete update error" });
          }

          return res.status(200).json({
            message: "Posttest progress updated successfully",
            preScore,
            postScore,
            labPassPercent,
            status: postTestStatus
          });
        }
      );
    });
  });
}

const submitPosttest = (req, res) => {
  const { answer, enrollmentId } = req.body;
  const userAnswers = Object.values(answer);
  const userAnswerIds = userAnswers.map(ans => ans.answerId);
  const userQuestionIds = Object.keys(answer).map(Number);

  try {
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

        db.query(`UPDATE question_progress SET is_completed = 1, score = 0 WHERE questionId IN (?) AND enrollmentId = ? AND type = 'post'`, 
            [questionIdsToUpdate, enrollmentId], (progressErr) => {

            if (progressErr) {
                console.log(progressErr);
                return res.status(500).json({ message: "Progress update error" });
            }

            const updateScore = (callback) => {
                if (correctQuestionIds.length > 0) {
                    db.query(`UPDATE question_progress SET score = 1 WHERE questionId IN (?) AND enrollmentId = ? AND type = 'post'`,
                    [correctQuestionIds, enrollmentId],(scoreErr) => {

                        if (scoreErr) {
                            console.log(scoreErr);
                            return res.status(500).json({ message: "Score update error" });
                        }
                        callback();
                    }
                    );
                } else {
                    callback();
                }
            };

            updateScore(() => {
                db.query(`SELECT id, questionId FROM question_progress WHERE enrollmentId = ? AND questionId IN (?)`, 
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
                      return [ans.content, progress ? progress.id : null];
                    });

                    db.query(`INSERT INTO question_logs (user_answer, progressId) VALUES ?`,
                      [answerRecords], (insertErr) => {
                        if (insertErr) {
                          console.log(insertErr);
                          return res.status(500).json({ message: "Progress answer insert error" });
                        }
                        finalizePosttest(enrollmentId, res);
                    }); 
                });
            });
        });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
};

module.exports = {
    getPosttest,
    submitPosttest
}