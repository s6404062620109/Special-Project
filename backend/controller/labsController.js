const fs = require("fs-extra");
const path = require("path");
const db = require("../database");
require("dotenv").config();

const getLabQuestions = (req, res) => {
    const { courseId, subjectId } = req.params;

    if(!courseId || !subjectId ){
        return res.status(400).send({ message: "Required course ID and subject ID." });
    }

    try{
      db.query("SELECT * FROM labs WHERE subjectId = ? AND typeId in (3, 4, 5, 6)", [subjectId], (error, result) => {
        if(error){
          console.log(error);
          return res.status(500).send({ message: "Database question query error." });
        }

        const questionIds = result.map(item => item.id);
        if (questionIds.length === 0) {
          return res.status(404).send({ message: "No question found." });
        }

        db.query("SELECT * FROM lab_answers WHERE questionId IN (?)", [questionIds], (error, answerResult) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ message: "Database answer query error" });
          }

          let questionFormat = [];
              
          for (const item of result) {
            const answers = answerResult.filter(answer => answer.questionId === item.id);
            if(item.typeId === 3 || item.typeId === 6){
              questionFormat.push({
                id: item.id,
                content: item.content,
                img: item.img,
                type: item.typeId,
                choice: answers.map(answer => ({
                  id: answer.id,
                  content: answer.content,
                }))
              });
            }

            else if(item.typeId === 4){
              questionFormat.push({
                id: item.id,
                content: item.content,
                img: item.img,
                type: item.typeId,
              });
            }

            else if(item.typeId === 5){
              const htmlFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${item.id}`);
                let htmlFile = null;

                if (fs.existsSync(htmlFolderPath)) {
                  const allFiles = fs.readdirSync(htmlFolderPath);
                  if (allFiles.includes("index.html")) {
                    const relPath = `/courses/c${courseId}/s${subjectId}/lab${item.id}/index.html`;
                    const absPath = path.join(__dirname, `..${relPath}`);
                    let content = null;

                    try {
                      content = fs.readFileSync(absPath, "utf8");
                    } catch (readErr) {
                      console.error(`Error reading index.html for lab${item.id}:`, readErr);
                    }

                    htmlFile = {
                      name: "index.html",
                      path: relPath,
                      content,
                    };
                  }
                }

                questionFormat.push({
                  id: item.id,
                  content: item.content,
                  img: item.img,
                  type: item.typeId,
                  htmlFile
                })
            }
          }

          if(questionFormat.length === 0){
            return res.status(404).send({ message: "No question found." });
          }

          return res.status(200).send({ questionFormat });
        });
      });
    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

const getAllLabQuestion = (req, res) => {
    const { courseId } = req.params;

    if(!courseId){
        return res.status(400).send({ message: "Required course ID." });
    }

    try{
      db.query("SELECT * FROM subject WHERE courseId = ?", [courseId], (error, result) => {
        if(error){
          console.log(error);
          return res.status(500).send({ message: "Database subject query error." });
        }

        if(result.length === 0){
          return res.status(404).send({ message: "No subject found." });
        }

        const subjectIds = result.map(item => item.id);
        db.query("SELECT * FROM labs WHERE subjectId IN (?) AND typeId IN (3, 4, 5, 6)", [subjectIds], (error, labResult) => {
          if(error){
            console.log(error);
            return res.status(500).send({ message: "Database question query error." });
          }

          const questionIds = labResult.map(item => item.id);
          if (questionIds.length === 0) {
            return res.status(404).send({ message: "No question found." });
          }

          db.query("SELECT * FROM lab_answers WHERE questionId IN (?)", [questionIds], (error, answerResult) => {
            if (error) {
              console.log(error);
              return res.status(500).send({ message: "Database answer query error" });
            }

            let questionFormat = [];
                
            for (const item of labResult) {
              const answers = answerResult.filter(answer => answer.questionId === item.id);
      
              if(item.typeId === 3 || item.typeId === 6){
                questionFormat.push({
                  id: item.id,
                  content: item.content,
                  img: item.img,
                  type: item.typeId,
                  choice: answers.map(answer => ({
                    id: answer.id,
                    content: answer.content,
                  }))
                });
              }

              if(item.typeId === 4){
                questionFormat.push({
                  id: item.id,
                  content: item.content,
                  img: item.img,
                  type: item.typeId,
                });
              }


              else if(item.typeId === 5){
                const htmlFolderPath = path.join(__dirname, `../courses/c${courseId}/s${item.subjectId}/lab${item.id}`);
                  let htmlFile = null;

                  if (fs.existsSync(htmlFolderPath)) {
                    const allFiles = fs.readdirSync(htmlFolderPath);
                    if (allFiles.includes("index.html")) {
                      const relPath = `/courses/c${courseId}/s${item.subjectId}/lab${item.id}/index.html`;
                      const absPath = path.join(__dirname, `..${relPath}`);
                      let content = null;

                      try {
                        content = fs.readFileSync(absPath, "utf8");
                      } catch (readErr) {
                        console.error(`Error reading index.html for lab${item.id}:`, readErr);
                      }

                      htmlFile = {
                        name: "index.html",
                        path: relPath,
                        content,
                      };
                    }
                  }

                  questionFormat.push({
                    id: item.id,
                    content: item.content,
                    img: item.img,
                    type: item.typeId,
                    htmlFile
                  })
              }
            }

            if(questionFormat.length === 0){
              return res.status(404).send({ message: "No question found." });
            }

            return res.status(200).send({ questionFormat });
          });
        });
      });
      
    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

const submitLabQuestions = async (req, res) => {
  const { enrollmentId } = req.params;
  const { answer } = req.body;

  try {
    if(!answer){
      return res.status(400).send({ message: "Required answer." });
    }
    if(!enrollmentId){
      return res.status(400).send({ message: "Required enrollment ID." });
    }

    db.query(`SELECT id FROM lab_progress WHERE enrollmentId = ? AND questionId = ? AND is_completed = 0`, [enrollmentId, answer.questionId], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database progress query error" });
      }
      if (result.length === 0) {
        return res.status(404).send({ message: "No progress found." });
      }

      const progressId = result[0].id;
      db.query(`SELECT id, content FROM lab_answers WHERE questionId = ? AND type = 1`, [answer.questionId], (error, answerResult) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ message: "Database question_answer query error" });
        }
        if (answerResult.length === 0) {
          return res.status(404).send({ message: "No question_answer found." });
        }
        
        const userAnswer = answer.answer;

        if(answer.lab_type === 3){
          const correctAnswer = userAnswer.answerId === answerResult[0].id;
          if(correctAnswer){
            db.query("UPDATE lab_progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer.content, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
          else{
            db.query("UPDATE lab_progress SET is_completed = 1, score = 0 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer.content, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
        }

        if(answer.lab_type === 4){
          const correctAnswer = userAnswer === answerResult[0].content;
          if(correctAnswer){
            db.query("UPDATE lab_progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
          else{
            db.query("UPDATE lab_progress SET is_completed = 1, score = 0 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
        }

        else if(answer.lab_type === 5){
          const correctAnswer = userAnswer.content === answerResult[0].content;
          if(correctAnswer){
            db.query("UPDATE lab_progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer.content, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
          else{
            db.query("UPDATE lab_progress SET is_completed = 1, score = 0 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`, [userAnswer.content, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });
                });
              });
            });
          }
        }

        else if(answer.lab_type === 6){
          const correctIds = answerResult.map(a => a.id);
          const userIds = userAnswer.map(a => a.answerId);

          const sameLength = correctIds.length === userIds.length;
          const allMatch = correctIds.every(id => userIds.includes(id));
          const correctAnswer = sameLength && allMatch;

          if(correctAnswer){
            db.query("UPDATE lab_progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], async (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                try {
                  await Promise.all(userAnswer.map(ans => {
                    return new Promise((resolve, reject) => {
                      db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`,
                        [ans.content, progressId], (error) => {
                          if (error) return reject(error);
                          resolve();
                        }
                      );
                    });
                  }));

                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });

                } catch (insertErr) {
                  console.log(insertErr);
                  return res.status(500).send({ message: "Database progress_answer insert error" });
                }
              });
            });
          }
          else{
            db.query("UPDATE lab_progress SET is_completed = 1, score = 0 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], async (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                try {
                  await Promise.all(userAnswer.map(ans => {
                    return new Promise((resolve, reject) => {
                      db.query(`INSERT INTO lab_logs (user_answer, progressId) VALUES (?, ?)`,
                        [ans.content, progressId], (error) => {
                          if (error) return reject(error);
                          resolve();
                        }
                      );
                    });
                  }));

                  return res.status(200).send({ message: "บันทึกคำตอบเรียบร้อยแล้ว" });

                } catch (insertErr) {
                  console.log(insertErr);
                  return res.status(500).send({ message: "Database progress_answer insert error" });
                }
              });
            });
          }         
        }
      });

    });
  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).json({ message: err.msg || "Server error" });
  }
};

module.exports = {
    getLabQuestions,
    getAllLabQuestion,
    submitLabQuestions
}