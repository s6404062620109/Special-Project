const db = require("../database");

const getPosttest = (req, res) => {
    const { enrollmentId } = req.params;

    try{
        db.query("SELECT questionId FROM progress WHERE enrollmentId = ?",[enrollmentId], (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ message: "Database progress query error" });
            }
  
            const questionIdList = result.map(question => question.questionId);
  
            if (!questionIdList.length){
              return res.status(404).json({ message: "Not have any question in this course." });
            }
            
            db.query("SELECT * FROM question WHERE typeId = 2  AND id IN (?)", [questionIdList], (error, questionResult) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ message: "Database question query error" });
              }
  
              const pretestQuestionIdList = questionResult.map(question => question.id);
  
              if (!pretestQuestionIdList.length){
                return res.status(404).json({ message: "Not have any question pretest in this course." });
              }
              db.query("SELECT * FROM answer WHERE questionId IN (?)", [pretestQuestionIdList], (error, answerResult) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ message: "Database answer query error" });
                }
                
                const questionsWithChoices = questionResult.map(question => ({
                  qId: question.id,
                  content: question.content,
                  choice: answerResult
                    .filter(answer => answer.questionId === question.id)
                    .map(answer => ({
                      aId: answer.id,
                      content: answer.content,
                    }))
                }));
  
                return res.status(200).json({ questions: questionsWithChoices });
              });
            });
          }
        );
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const submitPosttest = (req, res) => {
    const { answer, enrollmentId } = req.body;
    const userAnswerIds = Object.values(answer);
    const userQuestionIds = Object.keys(answer);

    try{
        db.query("SELECT questionId, type FROM answer WHERE id IN (?) AND questionId IN (?)", 
            [userAnswerIds, userQuestionIds], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Database answer query error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "No matching answers found" });
            }

            const questionIdsToUpdate = result.map((item) => item.questionId);
            const correctQuestionIds = result.filter((item) => item.type === 1).map((item) => item.questionId);

            db.query("UPDATE progress SET is_completed = ? WHERE questionId IN (?) AND enrollmentId = ?",
                [true, questionIdsToUpdate, parseInt(enrollmentId)], (updateError) => {
                if (updateError) {
                    console.log(updateError);
                    return res.status(500).json({ message: "Progress posttest is_completed update error" });
                }

                if (correctQuestionIds.length > 0) {
                    db.query("UPDATE progress SET score = 1 WHERE questionId IN (?) AND enrollmentId = ?",
                    [correctQuestionIds, parseInt(enrollmentId)], (scoreError) => {
                        if (scoreError) {
                            console.log(scoreError);
                            return res.status(500).json({ message: "Progress posttest score update error" });
                        }

                        // ดึงคะแนนรวมของ pre และ post
                        db.query(`SELECT 
                                SUM(CASE WHEN q.typeId = 1 THEN p.score ELSE 0 END) AS pre_score,
                                SUM(CASE WHEN q.typeId = 2 THEN p.score ELSE 0 END) AS post_score
                                FROM progress p
                                JOIN question q ON p.questionId = q.id
                                WHERE p.enrollmentId = ?`,
                            [parseInt(enrollmentId)], (scoreCompareError, scores) => {
                            if (scoreCompareError) {
                                console.log(scoreCompareError);
                                return res.status(500).json({ message: "Score comparison error" });
                            }

                            const preScore = scores[0]?.pre_score || 0;
                            const postScore = scores[0]?.post_score || 0;
                            const postTestStatus = postScore >= preScore ? true : -1;

                            // อัปเดตสถานะ posttest_complete ใน enrollment
                            db.query("UPDATE enrollment SET posttest_complete = ? WHERE id = ?",
                            [postTestStatus, parseInt(enrollmentId)], (enrollError) => {
                                if (enrollError) {
                                    console.log(enrollError);
                                    return res.status(500).json({ message: "Enrollment posttest_complete update error" });
                                }

                                return res.status(200).json({ message: "Posttest progress updated successfully", preScore, postScore });
                            }
                            );
                        }
                        );
                    }
                    );
                } else {
                    // อัปเดตเป็น -1 หากไม่มีคำตอบที่ถูกต้อง
                    db.query("UPDATE enrollment SET posttest_complete = ? WHERE id = ?" [-1, parseInt(enrollmentId)], (enrollError) => {
                        if (enrollError) {
                            console.log(enrollError);
                            return res.status(500).json({ message: "Enrollment posttest_complete update error" });
                        }

                        return res.status(200).json({ message: "No correct answers, posttest progress updated." });
                    }
                    );
                }
                }
            );
            }
        );
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getPosttest,
    submitPosttest
}