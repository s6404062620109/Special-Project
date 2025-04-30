const express = require("express");
const db = require("../database");
const pretestController = require("../controller/pretestController");
const authUserRole = require("../middleware/authUserRole");

const router = express.Router();

router.get("/getPretest/:enrollmentId/:courseId", authUserRole.verifiedStudentEnrollCourse, pretestController.getPretest);

router.put("/submitPretest", (req, res) => {
  const { answer, enrollmentId  } = req.body;
  const userAnswerIds = Object.values(answer);
  const userQuestionIds = Object.keys(answer);

  db.query("SELECT questionId,type FROM answer WHERE id IN (?) AND questionId IN (?)", [userAnswerIds, userQuestionIds], (error, result) => {
    if(error){
      console.log(error);
      return res.status(500).json({ message: "Database answer query error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No matching answers found" });
    }

    const questionIdsToUpdate = result.map((item) => item.questionId);
    const correctQuestionIds = result
      .filter((item) => item.type === 1)
      .map((item) => item.questionId);

    // 1. Update is_completed for all questions
    db.query("UPDATE progress SET is_completed = ? WHERE questionId IN (?) AND enrollmentId = ?",
      [true, questionIdsToUpdate, parseInt(enrollmentId)], (updateError) => {
        if (updateError) {
          console.log(updateError);
          return res.status(500).json({ message: "Progress pretest is_completed update error" });
        }

        // 2. Update score for correct answers
        if (correctQuestionIds.length > 0) {
          db.query("UPDATE progress SET score = 1 WHERE questionId IN (?) AND enrollmentId = ?",
            [correctQuestionIds, parseInt(enrollmentId)], (scoreError) => {
              if (scoreError) {
                console.log(scoreError);
                return res.status(500).json({ message: "Progress pretest score update error" });
              }

              db.query("UPDATE enrollment SET pretest_complete = true WHERE id = ?",[parseInt(enrollmentId)], (enrollError) => {
                if (enrollError) {
                  console.log(enrollError);
                  return res.status(500).json({ message: "Enroll pretest_complete update error" });
                }
                else{
                  db.query("SELECT questionId FROM progress WHERE is_completed = ? AND enrollmentId = ?", [false, parseInt(enrollmentId)], (error, progressResult) => {
                    if(error){
                      console.log(error);
                      return res.status(500).json({ message: "Database progress query error" });
                    }

                    const questionFirst_notComplete = parseInt(progressResult[0].questionId);
                    db.query("SELECT subjectId FROM question WHERE id = ?", [questionFirst_notComplete], (error, subjectResult) => {
                      if(error){
                        console.log(error);
                        return res.status(500).json({ message: "Database question query error" });
                      }
                      const firstSubject = subjectResult[0].subjectId;
                      return res.status(200).json({ message: "Progress pretest update completed.", firstSubject });
                    });
                    
                  });
                  
                }
              });
              
            }
          );
        } else {
          db.query("UPDATE enrollment SET pretest_complete = true WHERE id = ?",[parseInt(enrollmentId)], (enrollError) => {
            if (enrollError) {
              console.log(enrollError);
              return res.status(500).json({ message: "Enroll pretest_complete update error" });
            }
            else{
              db.query("SELECT questionId FROM progress WHERE is_completed = ? AND enrollmentId = ?", [false, parseInt(enrollmentId)], (error, progressResult) => {
                if(error){
                  console.log(error);
                  return res.status(500).json({ message: "Database progress query error" });
                }

                const questionFirst_notComplete = parseInt(progressResult[0].questionId);
                db.query("SELECT subjectId FROM question WHERE id = ?", [questionFirst_notComplete], (error, subjectResult) => {
                  if(error){
                    console.log(error);
                    return res.status(500).json({ message: "Database question query error" });
                  }
                  const firstSubject = subjectResult[0].subjectId;
                  return res.status(200).json({ message: "Progress pretest update completed.", firstSubject });
                });
                
              });
              
            }
          });
        }
      }
    );
    
  });
});

module.exports = router;
