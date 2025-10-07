const fs = require("fs");
const path = require("path"); 
const db = require("../database");

/* teacher_course controller */ 
const getMyCourses = (req, res) => {
    const { userId } = req.params;

    if( typeof userId !== 'string' ){
        return res.status(400).send({ message: "Invalid user ID." });
    }

    try{
        db.query("SELECT * FROM course WHERE teacherId = ? AND enable IN (0, 1)", [userId], (error, result) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database user query error." });
            }
    
            return res.status(200).send({ result });
        });
    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

const testAnalysis = (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).send({ message: "Required course ID." });
  }

  // ดึงข้อมูล enrollment ทั้งหมดใน course นี้
  db.query("SELECT * FROM enrollment WHERE courseId = ?", [courseId], (error, enrollments) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ message: "Database enrollment query error." });
    }

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).send({ message: "No enrollment found." });
    }

    const userIds = enrollments.map(e => e.userId);
    const enrollmentIds = enrollments.map(e => e.id);

    // ดึงข้อมูล user ที่เกี่ยวข้อง
    db.query("SELECT id, name, surname, email FROM user WHERE id IN (?)", [userIds], (error, users) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ message: "Database user query error." });
      }

      if (!users || users.length === 0) {
        return res.status(404).send({ message: "No user found." });
      }

      // ดึงข้อมูล progress ทั้งหมดของ enrollment เหล่านี้
      const sqlProgress = `
        SELECT qp.enrollmentId, qp.questionId, qp.type, qp.score, qp.is_completed
        FROM question_progress qp
        WHERE qp.enrollmentId IN (?)
      `;
      db.query(sqlProgress, [enrollmentIds], (error, progressResults) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ message: "Database progress query error." });
        }

        if (!progressResults || progressResults.length === 0) {
          return res.status(404).send({ message: "No progress found." });
        }

        // สร้างชุดข้อมูล
        const summary = [];
        let pretestMax = 0;
        let posttestMax = 0;

        // หาจำนวนข้อสูงสุดของ pre/post จาก questionId ที่ไม่ซ้ำ
        const seenPre = new Set();
        const seenPost = new Set();
        for (const r of progressResults) {
          if (r.type === "pre" && !seenPre.has(r.questionId)) {
            pretestMax++;
            seenPre.add(r.questionId);
          }
          if (r.type === "post" && !seenPost.has(r.questionId)) {
            posttestMax++;
            seenPost.add(r.questionId);
          }
        }

        // สร้าง Map ของ user เพื่อให้ค้นหาได้เร็วขึ้น
        const userMap = new Map(users.map(u => [u.id, u]));

        // รวมคะแนนตามแต่ละ enrollment
        for (const enrollment of enrollments) {
          const user = userMap.get(enrollment.userId);
          if (!user) continue;

          const enrollmentProgress = progressResults.filter(p => p.enrollmentId === enrollment.id);

          const pretestScore = enrollmentProgress
            .filter(p => p.type === "pre" && p.is_completed === 1)
            .reduce((sum, p) => sum + (p.score || 0), 0);

          const posttestScore = enrollmentProgress
            .filter(p => p.type === "post" && p.is_completed === 1)
            .reduce((sum, p) => sum + (p.score || 0), 0);

          summary.push({
            userId: user.id,
            name: `${user.name} ${user.surname}`,
            email: user.email,
            pretestScore,
            posttestScore
          });
        }

        // ✅ ส่งข้อมูลกลับ
        return res.status(200).send({
          users: summary,
          pretestMax,
          posttestMax
        });
      });
    });
  });
};

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

const createCourse = (req, res) => {
    const { name, icon, enable, teacherId } = req.body;
    
    if (!name || !teacherId || !icon) {
        return res.status(400).json({ message: "Name, icon, and teacherId are required." });
    }

    try {
        db.query("INSERT INTO course (name, icon, teacherId, enable, createat) VALUES (?, ?, ?, ?, NOW())", [name, icon, teacherId, enable], (err, result) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ message: "Database query error" });
          }
          
          const courseId = result.insertId;
          const uploadPath = path.join(__dirname, `../courses/c${courseId}`);
          createFolder(uploadPath);

          return res.status(200).json({ message: "Course added successfully" });
        });

    } catch (error) {
        console.error("Error adding course:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const { name, icon, enable, pretest_rate, posttest_rate, announce_state } = req.body;

    if( typeof courseId !== 'string' || 
      typeof name !== 'string' || 
      typeof icon !== 'string' || 
      typeof enable !== 'number' || 
      typeof pretest_rate !== 'number' || 
      typeof posttest_rate !== 'number' || 
      typeof announce_state !== 'number' ){
        return res.status(400).send({ message: "Invalid Course ID, Name, Icon, Enable, Pretest_rate, Posttest_rate, Announce_state." });
    }
    

    
    if (!name?.trim() || !icon?.trim() || enable === undefined || pretest_rate === undefined || posttest_rate === undefined || announce_state === undefined) {
        return res.status(400).json({ message: "Name ,icon, enable, pretest_rate, posttest_rate and announce_state are required." });
    }

    try{
        db.query("UPDATE course SET name = ?, icon = ?, pretest_rate = ?, posttest_rate = ?, enable = ?, updateat = NOW() , announce_state = ? WHERE id = ?", 
          [name, icon, pretest_rate, posttest_rate, enable, announce_state, courseId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database course query error." });
            }

            return res.status(200).send({ message: "อัพเดทคอร์สเรัยนเสร็จสิ้น."});
        });

    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

const deleteCourse = (req, res) => {
    const { courseId } = req.params;

    if( typeof courseId !== 'string' ){
        return res.status(400).send({ message: "Invalid Course ID." });
    }

    try{
        db.query("UPDATE course SET enable = -1, updateat = NOW() WHERE id = ?", [courseId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database course query error." });
            }
            
            return res.status(200).send({ message: "ลบคอร์สเรัยนเสร็จสิ้น."});
        });

    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

const enrollSummary = (req, res) => {
  const { courseId } = req.params;
  if(typeof courseId !== 'string' || !courseId){
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  try{
    db.query("SELECT * FROM enrollment WHERE courseId = ?", [courseId], (err, enrollments) => {
      if(err) {
        console.error(err);
        return res.status(500).send({ message: "Database enrollment query error." });
      }
      if(!enrollments || enrollments.length === 0) {
        return res.status(404).send({ message: "No enrollment found." });
      
      }
      const enrollmentIds = enrollments.map(e => e.id);
      const userIds = enrollments.map(e => e.userId);
      db.query("SELECT id, name, surname FROM user WHERE id IN (?)", [userIds], (err, users) => {
        if(err) {
          console.error(err);
          return res.status(500).send({ message: "Database user query error." });
        }

        if(!users || users.length === 0) {
          return res.status(404).send({ message: "No user found." });
        }

        db.query("SELECT * FROM labs WHERE subjectId IN (SELECT id FROM subject WHERE courseId = ?)", [courseId], (err, labs) => {
          if(err) {
            console.error(err);
            return res.status(500).send({ message: "Database labs query error." });
          }
          const labIds = labs.map(l => l.id);

          db.query("SELECT * FROM lab_answers WHERE questionId IN (?) AND type = 1", [labIds.length ? labIds : [0]], (err, labAnswers) => {
            if(err) {
              console.error(err);
              return res.status(500).send({ message: "Database lab_answers query error." });
            }
            db.query("SELECT * FROM lab_progress WHERE enrollmentId IN (?)", [enrollmentIds.length ? enrollmentIds : [0]], (err, labProgress) => {
              if(err) {
                console.error(err);
                return res.status(500).send({ message: "Database lab_progress query error." });
              }

              const labProgressIds = labProgress.map(lp => lp.id);
              db.query("SELECT * FROM lab_logs WHERE progressId IN (?)", [labProgressIds.length ? labProgressIds : [0]], (err, labLogs) => {
                if(err) {
                  console.error(err);
                  return res.status(500).send({ message: "Database lab_logs query error." });
                }
                db.query("SELECT * FROM questions WHERE courseId = ?", [courseId], (err, questions) => {
                  if(err) {
                    console.error(err);
                    return res.status(500).send({ message: "Database questions query error." });
                  }

                  const questionIds = questions.map(q => q.id);
                  db.query("SELECT * FROM question_answers WHERE questionId IN (?) AND type = 1", [questionIds.length ? questionIds : [0]], (err, questionAnswers) => {
                    if(err) {
                      console.error(err);
                      return res.status(500).send({ message: "Database question_answers query error." });
                    }

                    db.query("SELECT * FROM question_progress WHERE enrollmentId IN (?)", [enrollmentIds.length ? enrollmentIds : [0]], (err, questionProgress) => {
                      if(err) {
                        console.error(err);
                        return res.status(500).send({ message: "Database question_progress query error." });
                      }

                      const questionProgressIds = questionProgress.map(qp => qp.id);
                      db.query("SELECT * FROM question_logs WHERE progressId IN (?)", [questionProgressIds.length ? questionProgressIds : [0]], (err, questionLogs) => {
                        if(err) {
                          console.error(err);
                          return res.status(500).send({ message: "Database question_logs query error." });
                        }

                        // --- Build lookup maps ---
                        const usersMap = Object.fromEntries(users.map(u => [u.id, u]));
                        // --- LABS ---
                        const labsMap = Object.fromEntries(labs.map(l => [l.id, l]));
                        const labAnswersMap = labAnswers.reduce((acc, ans) => {
                          if (!acc[ans.questionId]) acc[ans.questionId] = [];
                          acc[ans.questionId].push(ans);
                          return acc;
                        }, {});
                        const labLogsMap = labLogs.reduce((acc, log) => {
                          if (!acc[log.progressId]) acc[log.progressId] = [];
                          acc[log.progressId].push(log);
                          return acc;
                        }, {});
                        // --- QUESTIONS ---
                        const questionsMap = Object.fromEntries(questions.map(q => [q.id, q]));
                        const questionAnswersMap = questionAnswers.reduce((acc, ans) => {
                          if (!acc[ans.questionId]) acc[ans.questionId] = [];
                          acc[ans.questionId].push(ans);
                          return acc;
                        }, {});
                        const questionLogsMap = questionLogs.reduce((acc, log) => {
                          if (!acc[log.progressId]) acc[log.progressId] = [];
                          acc[log.progressId].push(log);
                          return acc;
                        }, {});

                        // --- Group labs by typeId (3,5,6) ---
                        const labsByType = { 3: [], 5: [], 6: [] };
                        labs.forEach(lab => {
                          if ([3, 5, 6].includes(lab.typeId)) {
                            labsByType[lab.typeId].push(lab);
                          }
                        });

                        // --- Group question_progress by type (pre/post) ---
                        const questionProgressByType = { pre: [], post: [] };
                        questionProgress.forEach(qp => {
                          if (qp.type === 'pre') questionProgressByType.pre.push(qp);
                          else if (qp.type === 'post') questionProgressByType.post.push(qp);
                        });

                        // --- Build final format for EnrollSum.jsx ---
                        const finalFormat = enrollments.map(enroll => {
                          const user = usersMap[enroll.userId] || {};
                          // --- Collect all progress for this enrollment ---
                          const progress = [];
                          // Add lab progress (for labs type 3,5,6)
                          labProgress.filter(lp => lp.enrollmentId === enroll.id).forEach(lp => {
                            const lab = labsMap[lp.questionId];
                            if (!lab || ![3,5,6].includes(lab.typeId)) return;
                            progress.push({
                              id: lp.id,
                              type: 'lab',
                              questionId: lp.questionId,
                              content: lab.content,
                              typeId: lab.typeId,
                              correctAnswers: (labAnswersMap[lp.questionId]||[]).map(a=>a.content),
                              userAnswers: labLogsMap[lp.id] ? labLogsMap[lp.id].map(l => l.user_answer) : [],
                              score: lp.score,
                              is_completed: lp.is_completed
                            });
                          });
                          // Add question progress (pre/post)
                          questionProgress.filter(qp => qp.enrollmentId === enroll.id).forEach(qp => {
                            const question = questionsMap[qp.questionId];
                            progress.push({
                              id: qp.id,
                              type: 'question',
                              questionId: qp.questionId,
                              content: question ? question.content : null,
                              typeId: qp.type === 'pre' ? 1 : (qp.type === 'post' ? 2 : 0),
                              correctAnswers: (questionAnswersMap[qp.questionId]||[]).map(a=>a.content),
                              userAnswers: questionLogsMap[qp.id] ? questionLogsMap[qp.id].map(l => l.user_answer) : [],
                              score: qp.score,
                              is_completed: qp.is_completed,
                              qtype: qp.type // pre/post
                            });
                          });
                          // --- Calculate scores ---
                          let pretestScore = 0, posttestScore = 0, labtestScore = 0;
                          let pretestCount = 0, posttestCount = 0, labCount = 0;
                          progress.forEach(q => {
                            if (q.typeId === 1) { pretestScore += q.score || 0; pretestCount++; }
                            else if (q.typeId === 2) { posttestScore += q.score || 0; posttestCount++; }
                            else { labtestScore += q.score || 0; labCount++; }
                          });
                          const total = progress.length;
                          const completed = progress.filter(q => q.is_completed === 1).length;
                          const progressPercent = total > 0 ? (completed / total) * 100 : 0;
                          const grouped = [{ questions: progress }];
                          return {
                            id: enroll.id,
                            userId: enroll.userId,
                            user: { name: user.name + (user.surname ? ' ' + user.surname : '') },
                            progressPercent,
                            pretestScore,
                            posttestScore,
                            labtestScore,
                            progress: grouped
                          };
                        });
                        return res.status(200).send({ finalFormat });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
};

/* teacher_course controller */

/* teacher_questions controller */

const getQuestions = (req, res) => {
  const { courseId } = req.params;

  if(!courseId || typeof courseId !== 'string'){
    return res.status(400).send({ message: "Invalid Course ID." });
  }

  try{
    db.query("SELECT * FROM questions WHERE courseId = ?", [courseId], (error, result) => {
      if(error){
        console.log(error);
        return res.status(500).send({ message: "Database questions query error." });
      }

      const questionIds = result.map(r => r.id);
      
      if(questionIds.length === 0){
        return res.status(404).send({ message: "No questions found." });
      }

      db.query("SELECT * FROM question_answers WHERE questionId IN (?)", [questionIds], (error, choicesResult) => {
        if(error){
          console.log(error);
          return res.status(500).send({ message: "Database question_choices query error." });
        }

        const choicesMap = {};
        choicesResult.forEach(r => {
          if(!choicesMap[r.questionId]){
            choicesMap[r.questionId] = [];
          }
          choicesMap[r.questionId].push(r);
        });

        const questions = result.map(r => {
          return {
            id: r.id,
            content: r.content,
            img:  r.img,
            choices: choicesMap[r.id] || []
          }
        });

        return res.status(200).send({ questions });
      });
    })
  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const addQuestion = (req, res) => {
  const { courseId } = req.params;
  const { questions } = req.body;

  if (!courseId || typeof courseId !== "string") {
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).send({ message: "Questions are required." });
  }

  try {
    const insertQuestions = new Promise((resolve, reject) => {
      db.query(`INSERT INTO questions (content, img, courseId) VALUES ?`,
        [questions.map(q => [q.content, q.img, courseId])], (error, result) => {
          if (error) return reject(error);

          // result.insertId = id แรกที่ insert
          // result.affectedRows = จำนวนแถวที่ insert
          const insertedIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);

          resolve(insertedIds);
        }
      );
    });

    insertQuestions.then(insertedIds => {
      // match แต่ละ question กับ questionId ที่เพิ่ง insert
      const allChoices = [];
      questions.forEach((q, index) => {
        const questionId = insertedIds[index];
        q.choices.forEach(c => {
          allChoices.push([c.content, c.type, questionId]);
        });
      });

      db.query(`INSERT INTO question_answers (content, type, questionId) VALUES ?`,
        [allChoices], (error2) => {
          if (error2) {
            console.log(error2);
            return res.status(500).send({ message: "Error inserting choices." });
          }

          return res.status(200).send({ message: "เพิ่มคำถามใหม่สำเร็จ" });
        }
      );
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: "Error inserting questions.", err });
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
};

const editQuestion = async (req, res) => {
  const { courseId } = req.params;
  const{ questions, delteteQuestionIds, deleteChoiceIds } = req.body;

  if(!courseId || typeof courseId !== 'string'){
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  if(!questions || !Array.isArray(questions)){
    return res.status(400).send({ message: "Questions are required." });
  }

  try {
    // 1. ลบ question_answers ของ questions ที่ต้องลบ
    if (delteteQuestionIds.length > 0) {
      db.query(`DELETE FROM questions WHERE id IN (?)`,
        [delteteQuestionIds], (err) => {
          if (err) {
            console.log(err)
          };
        }
      );
    }

    if (deleteChoiceIds.length > 0) {
      db.query(`DELETE FROM question_answers WHERE id IN (?)`,
        [deleteChoiceIds], (err) => {
          if (err) {
            console.log(err)
          };
        }
      );
    }

    questions.forEach((q) => {
      if (q.id) {
        db.query(`UPDATE questions SET content = ?, img = ? WHERE id = ?`,
          [q.content, q.img, q.id], (err) => {
            if (err) {
              console.log(err)
            };
          }
        );
      }
      q.choices.forEach((c) => {
        if (c.id) {
          db.query(`UPDATE question_answers SET content = ?, type = ? WHERE id = ?`,
            [c.content, c.type, c.id], (err) => {
              if (err) {
                console.log(err)
              };
            }
          );
        } else {
          db.query(`INSERT INTO question_answers (questionId, content, type) VALUES (?, ?, ?)`,
            [q.id, c.content, c.type],
            (err) => {
              if (err) {
                console.log(err)
              };
            }
          );
        }
      });
    });

    return res.status(200).send({ message: "แก้ไขคำถามสำเร็จ" });
  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const deleeteQuestion = (req, res) => {
  const { courseId } = req.params;
  const { delteteQuestionIds } = req.body;

  if(!courseId || typeof courseId !== 'string'){
    return res.status(400).send({ message: "Invalid Course ID." });
  }

  if(!delteteQuestionIds || !Array.isArray(delteteQuestionIds)){
    return res.status(400).send({ message: "Questions are required." });
  }

  try{
    db.query("DELETE FROM questions WHERE id IN (?)", [delteteQuestionIds], (error) => {
      if(error){
        console.log(error)
      }

      return res.status(200).send({ message: "ลบคำถามสำเร็จ" });
    })
  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

/* teacher_questions controller */

/* teacher_subject controller */

const getSubject = (req, res) => {
  const { courseId, subjectId } = req.params;
  const jsonFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
  const pdfFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.pdf`);

  try {
    const sql = `
      SELECT 
        s.name AS subjectname,
        l.id AS questionId, l.content AS questionContent, l.img AS questionImg, l.typeId,
        la.id AS answerId, la.content AS answerContent, la.type AS answerType
      FROM subject s
      LEFT JOIN labs l ON s.id = l.subjectId
      LEFT JOIN lab_answers la ON l.id = la.questionId
      WHERE s.id = ? AND s.courseId = ?
    `;

    db.query(sql, [subjectId, courseId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "Subject not found." });
      }

      const subjectname = rows[0].subjectname;
      const questionsMap = {};

      rows.forEach(r => {
        if (!r.questionId) return;

        if (!questionsMap[r.questionId]) {
          questionsMap[r.questionId] = {
            id: r.questionId,
            content: r.questionContent,
            img: r.questionImg,
            type: r.typeId,
            choice: []
          };
        }

        if (r.typeId === 1 || r.typeId === 2 || r.typeId === 3 || r.typeId === 6) {
          if (r.answerId) {
            questionsMap[r.questionId].choice.push({
              id: r.answerId,
              content: r.answerContent,
              isCorrect: r.answerType
            });
          }
        } else if (r.typeId === 4) {
          const labFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${r.questionId}`);
          let Cmdfile = null;

          if (fs.existsSync(labFolderPath)) {
            const allFiles = fs.readdirSync(labFolderPath);
            if (allFiles.includes("run.sh")) {
              const relPath = `/courses/c${courseId}/s${subjectId}/lab${r.questionId}/run.sh`;
              const absPath = path.join(__dirname, `..${relPath}`);
              let content = null;
              try {
                content = fs.readFileSync(absPath, "utf8");
              } catch (readErr) {
                console.error(`Error reading run.sh for lab${r.questionId}:`, readErr);
              }
              Cmdfile = { name: "run.sh", path: relPath, content };
            }
          }

          questionsMap[r.questionId].answerId = r.answerId;
          questionsMap[r.questionId].answer = r.answerType === 1 ? r.answerContent : null;
          questionsMap[r.questionId].Cmdfile = Cmdfile;
        } else if (r.typeId === 5) {
          const labFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${r.questionId}`);
          let htmlFile = null;

          if (fs.existsSync(labFolderPath)) {
            const allFiles = fs.readdirSync(labFolderPath);
            if (allFiles.includes("index.html")) {
              const relPath = `/courses/c${courseId}/s${subjectId}/lab${r.questionId}/index.html`;
              const absPath = path.join(__dirname, `..${relPath}`);
              let content = null;
              try {
                content = fs.readFileSync(absPath, "utf8");
              } catch (readErr) {
                console.error(`Error reading index.html for lab${r.questionId}:`, readErr);
              }
              htmlFile = { name: "index.html", path: relPath, content };
            }
          }

          questionsMap[r.questionId].answerId = r.answerId ?? null;
          questionsMap[r.questionId].answer = r.answerType === 1 ? r.answerContent : null;
          questionsMap[r.questionId].htmlFile = htmlFile;
        }
      });

      const question = Object.values(questionsMap);

      fs.access(jsonFilePath, fs.constants.F_OK, (jsonErr) => {
        fs.access(pdfFilePath, fs.constants.F_OK, (pdfErr) => {
          if (!jsonErr) {
            fs.readFile(jsonFilePath, "utf8", (err, data) => {
              if (err) {
                console.error("Error reading content.json:", err);
                return res.status(500).json({ message: "Error loading subject content" });
              }
              try {
                const jsonData = JSON.parse(data);
                return res.status(200).json({ jsonData, subjectname, question });
              } catch (parseError) {
                console.error("Error parsing content.json:", parseError);
                return res.status(500).json({ message: "Invalid JSON format" });
              }
            });
          } else if (!pdfErr) {
            return res.status(200).json({ pdfUrl: `/courses/c${courseId}/s${subjectId}/content.pdf`, subjectname, question });
          } else {
            return res.status(404).json({ message: "No subject content available" });
          }
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getQuestionType = (req, res) => {
  try{
    db.query("SELECT * FROM question_type WHERE status = 1", (error, result) => {
      if(error){
        console.log(error);
        return res.status(500).send({ message: "Database type query error." });
      }
      return res.status(200).send({ result });
    });
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

const addManualSubject = (req, res) => {
    const { courseId } = req.params;
    const { name, content, question } = req.body;
    const files = req.files;

    if (typeof courseId !== 'string') {
      return res.status(400).send({ message: "Invalid Course ID." });
    }
    if (!name || !content || !question) {
      return res.status(400).json({ message: "Name, content, and question are required." });
    }

    let parsedContent;
    let parsedQuestion;

    try {
      parsedContent = JSON.parse(content);
      parsedQuestion = JSON.parse(question); 
    } catch (err) {
      return res.status(400).json({ message: "Content and question must be valid JSON strings." });
    }
  
    if (!Array.isArray(parsedQuestion) || parsedQuestion.length === 0) {
      return res.status(400).json({ message: "Questions must be an array." });
    }
  
    try {
      db.query("INSERT INTO subject (name, courseId, createat) VALUES (?, ?, NOW())", [name, courseId], async (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ message: "Database subject query error." });
        }
  
        const subjectId = result.insertId;
        const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
        createFolder(subjectFolderPath);

        const jsonFilePath = path.join(subjectFolderPath, "content.json");
        fs.writeFileSync(jsonFilePath, JSON.stringify(parsedContent, null, 2));
  
        try {
          for (const q of parsedQuestion) {

            let img = null;
            let questionId;
            if(q.img){
              img = q.img;
            }

            await new Promise((resolve, reject) => {
              db.query("INSERT INTO labs (content, img, typeId, subjectId) VALUES (?, ?, ?, ?)",
                [q.content, img, q.type, subjectId], (err, questionResult) => {
                  if (err) return reject(err);

                  questionId = questionResult.insertId;
                  resolve();
                }
              );
            });

            if (q.type === 4) {
              const labFolderPath = path.join(subjectFolderPath, `lab${questionId}`);
              createFolder(labFolderPath);

              if (typeof q.Cmdfile === "string") {
                const cmdFile = files.find(f => f.fieldname === q.Cmdfile);
                if (cmdFile) {
                  const cmdPath = path.join(labFolderPath, "run.sh");
                  fs.writeFileSync(cmdPath, cmdFile.buffer);
                }
              }
            }

            if (q.type === 5){
              const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
              createFolder(labFolder);

              if (typeof q.Htmlfile === "string") {
                const htmlUploaded = files.find(f => f.fieldname === q.Htmlfile);
                if (htmlUploaded) {
                  const htmlPath  = path.join(labFolder, "index.html");
                  fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                  console.log("✅ HTML file written to:", htmlPath);
                }
              }
            }

            if (Array.isArray(q.choice)) {
              for (const c of q.choice) {
                db.query("INSERT INTO lab_answers (content, type, questionId) VALUES (?, ?, ?)",
                  [c.content, c.isCorrect, questionId], (err) => {
                    if (err) console.log("Choice Insert Error:", err);
                  }
                );
              }
            }
            if(q.answer){
              db.query("INSERT INTO lab_answers (content, type, questionId) VALUES (?, ?, ?)",
                [q.answer, 1, questionId], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                }
              );
            }

          }

          return res.status(200).json({ message: "สร้างบทเรียนสำเร็จ" });
        } catch (err) {
          console.error(err);
          return res.status(500).send({ message: "Error inserting questions or choices." });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server error.", error });
    }
}

const addPdfSubject = (req, res) => {
  const { courseId } = req.params;
  const { name, question } = req.body;
  const files = req.files;

  if (typeof courseId !== 'string') {
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  if (!name || !question || !files) {
    return res.status(400).json({ message: "Name, files, and question are required." });
  }

  let parsedQuestion;

  try {
    parsedQuestion = JSON.parse(question);
  } catch (err) {
    return res.status(400).json({ message: "Question must be a valid JSON string." });
  }

  if (!Array.isArray(parsedQuestion) || parsedQuestion.length === 0) {
    return res.status(400).json({ message: "Questions must be an array." });
  }

  try {
    db.query("INSERT INTO subject (name, courseId, createat) VALUES (?, ?, NOW())", [name, courseId], async (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database subject query error." });
      }

      const subjectId = result.insertId;
      const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
      createFolder(subjectFolderPath);

      const pdfFile = files.find(f => f.fieldname === "file");
      if (!pdfFile) return res.status(400).send({ message: "Missing PDF file." });

      const pdfFilePath = path.join(subjectFolderPath, "content.pdf");
      fs.writeFileSync(pdfFilePath, pdfFile.buffer);

      try {
        for (const q of parsedQuestion) {
  
          let img = null;
          let questionId;
          if(q.img){
            img = q.img;
          }

          await new Promise((resolve, reject) => {
            db.query("INSERT INTO labs (content, img, typeId, subjectId) VALUES (?, ?, ?, ?)",
              [q.content, img, q.type, subjectId], (err, questionResult) => {
                if (err) return reject(err);

                questionId = questionResult.insertId;
                resolve();
              }
            );
          });

          if (q.type === 4) {
            const labFolderPath = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolderPath);

            if (typeof q.Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === q.Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolderPath, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }
          }

          if (q.type === 5){
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof q.Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === q.Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
              }
            }
          }

          if (Array.isArray(q.choice)) {
            for (const c of q.choice) {
              db.query("INSERT INTO lab_answers (content, type, questionId) VALUES (?, ?, ?)",
                [c.content, c.isCorrect, questionId], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                }
              );
            }
          }
          if(q.answer){
            db.query("INSERT INTO lab_answers (content, type, questionId) VALUES (?, ?, ?)",
              [q.answer, 1, questionId], (err) => {
                if (err) console.log("Choice Insert Error:", err);
              }
            );
          }

        }

        return res.status(200).json({ message: "สร้างบทเรียนสำเร็จ" });
      } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error inserting questions or choices." });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const editManualSubject = (req, res) => {
  const { courseId, subjectId } = req.params;
  const { name, content, question, questionDelete, choiceDelete, filePathDelete } = req.body;
  const files = req.files;

  if (typeof courseId !== 'string' || typeof subjectId !== 'string') {
    return res.status(400).send({ message: "Invalid courseId or subjectId." });
  }
  if (!courseId || !subjectId ||!name || !content || !question) {
    return res.status(400).json({ message: "CourseId, subjectId, name, content, and question are required." });
  }
  
  let parsedContent, parsedQuestion, parsedQuestionDelete, parsedChoiceDelete, parsedFilePathDelete;

  try {
    parsedContent = JSON.parse(content);
    parsedQuestion = JSON.parse(question);
    if (questionDelete) parsedQuestionDelete = JSON.parse(questionDelete);
    if (choiceDelete) parsedChoiceDelete = JSON.parse(choiceDelete);
    if (filePathDelete) parsedFilePathDelete = JSON.parse(filePathDelete);
  } catch (err) {
    return res.status(400).json({ message: "Content, question, questionDelete and choiceDelete must be valid JSON strings." });
  }

  if (!Array.isArray(parsedQuestion) || parsedQuestion.length === 0) {
    return res.status(400).json({ message: "Questions must be an array." });
  }

  try {
    db.query("UPDATE subject SET name = ? WHERE id = ? AND courseId = ?", [name, subjectId, courseId], async (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database subject query error." });
      }

      const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
      const jsonFilePath = path.join(subjectFolderPath, "content.json");
      fs.writeFileSync(jsonFilePath, JSON.stringify(parsedContent, null, 2));
  
      try {
        for (const q of parsedQuestion) {
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Cmdfile, Htmlfile } = q;

          let questionId = qid;
          if (qid) {
            await new Promise((resolve, reject) => {
              db.query("UPDATE labs SET content = ?, img = ?, typeId = ? WHERE id = ?", [qContent, qImg, qType, qid], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          } else {
            questionId = await new Promise((resolve, reject) => {
              db.query("INSERT INTO labs (subjectId, content, img, typeId) VALUES (?, ?, ?, ?)", [subjectId, qContent, qImg, qType], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
              });
            });
          }

          if(choice){
            for (const c of choice) {
              const { id: cid, content: cContent, isCorrect } = c;
              if (cid) {
                db.query("UPDATE lab_answers SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO lab_answers (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE lab_answers SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }
          if(answer && !answerId){
            db.query("INSERT INTO lab_answers (questionId, content, type) VALUES (?, ?, ?)", [questionId, answer, 1], (err) => {
              if (err) console.log("Choice Insert Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }
          }

          if (qType === 5){
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
              }
            }
          }
        }

        if (Array.isArray(parsedFilePathDelete)) {
          for (const filePath of parsedFilePathDelete) {
            const fullPath = path.join(__dirname, `../${filePath}`);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          }
        }

        if (parsedQuestionDelete) {
          db.query("SELECT id, typeId FROM labs WHERE id IN (?)", [parsedQuestionDelete], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({ message: "Database question query error" });
            }

            const labQuestionIds = result.filter(q => q.typeId === 4).map(q => q.id);

            if (labQuestionIds.length > 0) {
              for (const labId of labQuestionIds) {
                const labFolder = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${labId}`);
                if (fs.existsSync(labFolder)) {
                  fs.rmSync(labFolder, { recursive: true, force: true });
                  console.log(`Deleted lab folder: lab${labId}`);
                }
              }
            }

            db.query("DELETE FROM labs WHERE id IN (?)", [parsedQuestionDelete], (err) => {
              if (err) {
                console.log("Question Delete Error:", err);
                return res.status(500).send({ message: "Error deleting questions." });
              }
            });
          });
        }

        if (parsedChoiceDelete) {
          db.query("DELETE FROM lab_answers WHERE id IN (?)", [parsedChoiceDelete], (err) => {
            if (err) {
              console.log("Choice Delete Error:", err);
              return res.status(500).send({ message: "Error deleting choices." });
            }
          });
        }

        return res.status(200).json({ message: "Subject updated successfully." });
        } catch (err) {
          console.error(err);
          return res.status(500).send({ message: "Error updating questions or choices." });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server error.", error });
    }
}

const editPdfSubject = (req, res) => {
  const { courseId, subjectId } = req.params;
  const { name, question, questionDelete, choiceDelete, filePathDelete } = req.body;
  const files = req.files;

  if (typeof courseId !== 'string' || typeof subjectId !== 'string') {
    return res.status(400).send({ message: "Invalid courseId or subjectId." });
  }
  if (!courseId || !subjectId || !name || !question ) {
    return res.status(400).json({ message: "CourseId, subjectId, name and question are required." });
  }

  let parsedQuestion, parsedQuestionDelete, parsedChoiceDelete, parsedFilePathDelete;

  try {
    parsedQuestion = JSON.parse(question);
    if (questionDelete) parsedQuestionDelete = JSON.parse(questionDelete);
    if (choiceDelete) parsedChoiceDelete = JSON.parse(choiceDelete);
    if (filePathDelete) parsedFilePathDelete = JSON.parse(filePathDelete);
  } catch (err) {
    return res.status(400).json({ message: "Question, questionDelete and choiceDelete must be valid JSON strings." });
  }

  if (!Array.isArray(parsedQuestion) || parsedQuestion.length === 0) {
    return res.status(400).json({ message: "Questions must be an array." });
  }

  const courseFolder = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);

  try{
    db.query("UPDATE subject SET name = ?, updateat = NOW() WHERE id = ? AND courseId = ?", [name, subjectId, courseId], async (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database subject query error." });
      }

      const pdfFile = files.find(f => f.fieldname === 'file');
      if (pdfFile) {
        const pdfFilePath = path.join(courseFolder, "content.pdf");
        fs.writeFileSync(pdfFilePath, pdfFile.buffer);
      }
  
      try {
        for (const q of parsedQuestion) {
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Cmdfile, Htmlfile } = q;

          let questionId = qid;
          if (qid) {
            await new Promise((resolve, reject) => {
              db.query("UPDATE labs SET content = ?, img = ?, typeId = ? WHERE id = ?", [qContent, qImg, qType, qid], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          } else {
            questionId = await new Promise((resolve, reject) => {
              db.query("INSERT INTO labs (subjectId, content, img, typeId) VALUES (?, ?, ?, ?)", [subjectId, qContent, qImg, qType], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
              });
            });
          }

          if(choice){
            for (const c of choice) {
              const { id: cid, content: cContent, isCorrect } = c;
              if (cid) {
                db.query("UPDATE lab_answers SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO lab_answers (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE lab_answers SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }
          if(answer && !answerId){
            db.query("INSERT INTO lab_answers (questionId, content, type) VALUES (?, ?, ?)", [questionId, answer, 1], (err) => {
              if (err) console.log("Choice Insert Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }
          }

          if (qType === 5){
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
              }
            }
          }
        }

        if (Array.isArray(parsedFilePathDelete)) {
          for (const filePath of parsedFilePathDelete) {
            const fullPath = path.join(__dirname, `../${filePath}`);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          }
        }

        if (parsedQuestionDelete) {
          db.query("SELECT id, typeId FROM labs WHERE id IN (?)", [parsedQuestionDelete], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({ message: "Database question query error" });
            }

            const labQuestionIds = result.filter(q => q.typeId === 4).map(q => q.id);

            if (labQuestionIds.length > 0) {
              for (const labId of labQuestionIds) {
                const labFolder = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${labId}`);
                if (fs.existsSync(labFolder)) {
                  fs.rmSync(labFolder, { recursive: true, force: true });
                  console.log(`Deleted lab folder: lab${labId}`);
                }
              }
            }

            db.query("DELETE FROM labs WHERE id IN (?)", [parsedQuestionDelete], (err) => {
              if (err) {
                console.log("Question Delete Error:", err);
                return res.status(500).send({ message: "Error deleting questions." });
              }
            });
          });
        }

        if (parsedChoiceDelete) {
          db.query("DELETE FROM lab_answers WHERE id IN (?)", [parsedChoiceDelete], (err) => {
            if (err) {
              console.log("Choice Delete Error:", err);
              return res.status(500).send({ message: "Error deleting choices." });
            }
          });
        }

        return res.status(200).json({ message: "Subject updated successfully." });
        } catch (err) {
          console.error(err);
          return res.status(500).send({ message: "Error updating questions or choices." });
        }
      });
  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const deleteFolderRecursive = (folderPath) =>{
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
};

const deleteSubject = (req, res) => {
  const { courseId, subjectId, userId } = req.params;

  if(!courseId || !subjectId || !userId){
    return res.status(400).send({ message: "Course ID, Subject ID and User ID are required." });
  }

  try{
    db.query("SELECT id FROM course WHERE id = ? AND teacherId = ?", [courseId, userId], (error, result) => {
      if(error){
        console.log(error);
        return res.status(500).json({ message: "Database course query error." });
      }
      
      if(result.length === 0){
        return res.status(404).json({ message: "Course not found or you do not have permission." });
      }

      if(result.length > 0){
        db.query("SELECT id FROM subject WHERE id = ? AND courseId = ?", 
          [subjectId, courseId, userId], (error, result) => {
            if(error){
              console.log(error);
              return res.status(500).json({ message: "Database subject query error." });
            }
      
            if(result.length === 0){
              return res.status(404).json({ message: "Subject not found or you do not have permission to delete this subject." });
            }
      
            if(result.length > 0){
    
              db.query("DELETE FROM subject WHERE id = ? AND courseId = ?",
                [subjectId, courseId], (error) => {
                  if(error){
                    console.log(error);
                    return res.status(500).json({ message: "Delete subject from database error." });
                  }
      
                  const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
                  deleteFolderRecursive(subjectFolderPath);

                  return res.status(200).json({ message: "Subject deleted successfully." });
                }
              );
            }
          }
        );
      }
    });
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }

}

/* teacher_subject controller */

module.exports = {
  getMyCourses,
  testAnalysis,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollSummary,
  getQuestions,
  addQuestion,
  editQuestion,
  deleeteQuestion,
  getSubject,
  getQuestionType,
  addManualSubject,
  addPdfSubject,
  editManualSubject,
  editPdfSubject,
  deleteSubject
}