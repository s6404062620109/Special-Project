const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getPretest/:courseId/:historyId/:email", (req, res) => {
    const { courseId, historyId, email } = req.params;
  
    if (historyId === '-') {
      // Step 1: Check if a HistoryID exists in the 'history' table for the given courseId and email
      db.query("SELECT HistoryID FROM history WHERE CourseID = ? AND Email = ?", [courseId, email], (error, checkResult) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Database history query error." });
        }
  
        if (checkResult.length > 0) {
          // Step 2: If HistoryID exists, check if there are any progress entries for that HistoryID
          db.query("SELECT * FROM progress WHERE HistoryID = ?", [checkResult[0].HistoryID], (error, progressResult) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: "Database progress query error" });
            }
  
            if (progressResult.length > 0) {
              // If progress exists, return the existing history ID
              return res.status(200).json({ history: checkResult[0].HistoryID });
            }
  
            // Step 3: If no progress entry exists, fetch questions and create progress entries
            db.query("SELECT SubjectID FROM subject WHERE CourseID = ?", [courseId], (err, subjects) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database subject query error" });
              }
              const subjectList = subjects.map((item) => item.SubjectID);
  
              // Fetch Pre-test questions related to the subjects
              db.query("SELECT * FROM question WHERE SubjectID IN (?) AND Type = ?", [subjectList, "Pre"], (err, questionResults) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: "Database question query error." });
                }
  
                // Step 4: Deduplicate questions based on SubjectID
                const uniqueQuestions = Array.from(
                  new Map(questionResults.map((q) => [q.SubjectID, q])).values()
                );
  
                const questionIdList = uniqueQuestions.map((q) => q.QuestionID);
  
                // Step 5: Fetch answers for the unique questions
                db.query("SELECT AnswerID, result, QuestionID FROM answer WHERE QuestionID IN (?)", [questionIdList], (error, answerResults) => {
                  if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Database answer query error." });
                  }
  
                  // Step 6: Create new progress entries for each question
                  const progressHistoryId =  checkResult[0].HistoryID;
                  const progressQuestionID = uniqueQuestions.map((q) => q.QuestionID);
                  const progressSubjectID = uniqueQuestions.map((q) => q.SubjectID);
  
                  for(let i=0; i<progressQuestionID.length; i++){
                    db.query("INSERT INTO progress (HistoryID, QuestionID, SubjectID) VALUES ( ?, ?, ? )", [progressHistoryId, progressQuestionID[i], progressSubjectID[i]], (err) => {
                      if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Database progress insert error" });
                      }
    
                      // Step 7: Return the questions and answers (Choices) after progress creation
                      if(i===progressQuestionID.length-1){
                        return res.status(200).json({
                          Questions: uniqueQuestions,
                          Choices: answerResults,
                          history: checkResult[0].HistoryID,
                        });
                      }
                    });
                  }
                });
              });
            });
          });
        } 
  
        else {
          return res.status(404).json({ message: "History not found for the given course and email" });
        }
      });
    } 
    else{
      const parsedHistoryId = parseInt(historyId, 10);
  
      db.query(`SELECT progress.QuestionID, question.Type FROM progress
        INNER JOIN question ON progress.QuestionID = question.QuestionID  
        WHERE HistoryID = ? AND question.Type = ?`, [parsedHistoryId, 'Pre'], (error, result) => {
          if(error) {
            console.log(error);
            return res.status(500).json({ message: 'Database progress query error.' });
          }
          else{
            const questionIdList = result.map(list => list.QuestionID);
            
            db.query('SELECT * FROM question WHERE QuestionID IN (?)', [questionIdList], (error, questionResult) => {
              if(error) {
                console.log(error);
                return res.status(500).json({ message: 'Database question query error.' });
              }
  
              else{
                db.query('SELECT * FROM answer WHERE QuestionID IN (?)', [questionIdList], (error, answerResult) => {
                  if(error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Database answer query error.' });
                  }
                  else{
                    return res.status(200).json({ Qustions: questionResult, Choices: answerResult });
                  }
                });
              }
            });
          }
        });
    }
});
  
router.post("/submitPretest", (req, res) => {
    const { answer, courseId, email } = req.body;
    const userAnswerIds = Object.values(answer);
    const userQuestionIds = Object.keys(answer);
  
    db.query(`SELECT HistoryID FROM history WHERE CourseID = ? AND Email = ?`,
      [courseId, email], (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Database history query error" });
        }
  
        const historyId = result[0]?.HistoryID;
        if (!historyId) {
          return res.status(404).json({ message: "History not found" });
        }
  
        db.query(`SELECT SubjectID FROM question WHERE QuestionID IN (?)`, [userQuestionIds], (error, SubjectIds) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database question query error" });
          }
          else{
            const SubjectIdList = SubjectIds.map(item => item.SubjectID);
  
            db.query(`SELECT AnswerID, Type, QuestionID FROM answer WHERE AnswerID IN (?) AND QuestionID IN (?)`,
              [userAnswerIds, userQuestionIds], (error, answers) => {
                if (error) {
                  console.error(error);
                  return res.status(500).json({ message: "Database answer query error" });
                }
  
                const validAnswers = answers.filter((answer) => answer.Type === "a");
  
                if (validAnswers.length === 0) {
                  return res.status(200).json({ message: "No valid answers to update", SubjectIDs: [] });
                }
  
                let updateCount = 0;
                const totalToUpdate = validAnswers.length;
                
                validAnswers.forEach((answer) => {
                  db.query( `UPDATE progress SET Score = 1 WHERE QuestionID = ? AND HistoryID = ?`,
                    [answer.QuestionID, historyId], (error) => {
                      if (error) {
                        console.error(error);
                        return res.status(500).json({ message: "Update progress error" });
                      }
                      
                      updateCount++;
                      if (updateCount === totalToUpdate) {
                        let updateStatusProgress = 0;
                        db.query(`UPDATE progress SET Status = 'Done' WHERE HistoryID = ?`,
                          [historyId], (error) => {
                            if (error) {
                              console.error(error);
                              return res.status(500).json({ message: "Update progress status error" });
                            }
  
                            updateStatusProgress++;
                            const subjectIdlabs = [];
                            let subjectCounter = 0;
  
                            db.query(`UPDATE history SET Successful = Successful+${userQuestionIds.length} WHERE HistoryID = ?`, 
                              [historyId], (error) => {
                                if (error) {
                                  console.error(error);
                                  return res.status(500).json({ message: "Update history Successful error" });
                                }
                                
                                SubjectIdList.forEach((subjectId) => {
                                  db.query(`SELECT QuestionID, SubjectID FROM question WHERE SubjectID = ? AND Type = ?`,
                                    [subjectId, "Lab"], (error, questionLabs) => {
                                      if (error) {
                                        console.error(error);
                                        return res.status(500).json({ message: "Database question error" });
                                      }
      
                                      subjectIdlabs.push(...questionLabs.map((q) => ({ QuestionID: q.QuestionID, SubjectID: subjectId, })));
                                      subjectCounter++;
      
                                      if (subjectCounter === SubjectIdList.length) {
                                        if (subjectIdlabs.length === 0) {
                                          return res.status(200).json({ message: "Progress updated successfully (no labs inserted)", SubjectIDs: SubjectIdList });
                                        }
      
                                        const labProgressRows = subjectIdlabs.map((lab) => [ historyId, lab.QuestionID, lab.SubjectID, ]);
      
                                        db.query(`INSERT INTO progress (HistoryID, QuestionID, SubjectID) VALUES ?`,
                                          [labProgressRows], (error) => {
                                            if (error) {
                                              console.error(error);
                                              return res.status(500).json({ message: "Insert progress lab error" });
                                            }
      
                                            return res.status(200).json({ message: "Progress updated successfully", SubjectID: SubjectIdList[0] });
                                          }
                                        );
                                      }
                                    }
                                  );
                                });
                            });
                            
                          }
                        );
                      }
                    }
                  );
                });
  
              }
            );
          }
        });
  
      }
    );
});

module.exports = router;