const fs = require("fs-extra");
const { exec } = require("child_process");
const path = require("path");
const db = require("../database");
const labSessions  = require("./labState");

const getLabQuestions = (req, res) => {
    const { courseId, subjectId } = req.params;

    if(!subjectId){
        return res.status(400).send({ message: "Required subject ID." });
    }

    try{
        db.query("SELECT id, name_type FROM question_type WHERE status = 1", (error, result) => {
          if(error){
            console.log(error);
            return res.status(500).send({ message: "Database question_type query error." });
          }
          
          let labsId = result
            .filter(item => item.name_type?.toLowerCase().includes("lab"))
            .map(item => item.id);
          if (labsId.length === 0){
            return res.status(404).send({ message: "No question found." });
          }

          db.query("SELECT * FROM question WHERE subjectId = ? AND typeId in (?)", [subjectId, labsId], (error, result) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database question query error." });
            }

            const questionIds = result.map(item => item.id);
            if (questionIds.length === 0) {
                return res.status(404).send({ message: "No question found." });
            }

            db.query("SELECT * FROM question_answer WHERE questionId IN (?)", [questionIds], (error, answerResult) => {
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
        }); 
    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}

function clearLabSessionByUser(userId, res = null) {
  const index = labSessions.findIndex((s) => s.userId === userId);
  if (index === -1) {
    if (res) res.status(404).json({ message: "Session not found" });
    return;
  }

  const session = labSessions[index];

  const containerCleanupCommand = `docker exec ${session.container} rm -rf /usr/src/app`;

  const userDataDir = path.join(__dirname, `../lab-session-data/user${session.port - 4000}`);

  exec(containerCleanupCommand, (err) => {
    fs.rm(userDataDir, { recursive: true, force: true }, (fsErr) => {
      clearTimeout(session.timeout);
      labSessions[index] = {
        ...session,
        inUse: false,
        userId: null,
        timeout: null,
      };

      if (res) {
        if (err) {
          console.error("❌ Container cleanup failed:", err.message);
          return res.status(500).json({ message: "Failed to clean up container lab." });
        }
        if (fsErr) {
          console.error("❌ Host folder cleanup failed:", fsErr.message);
          return res.status(500).json({ message: "Failed to clean up user lab folder." });
        }

        return res.status(200).send("Lab cleaned and session released.");
      }
    });
  });
}

const startLabSession = async (req, res) => {
  const { courseId } = req.params;
  const { subjectId, questionId, userId } = req.body;

  const availableSession = labSessions.find((s) => !s.inUse);
  if (!availableSession) {
    return res.status(423).json({ message: "All terminals are in use." });
  }

  const sessionIndex = labSessions.indexOf(availableSession);
  const container = availableSession.container;
  const port = availableSession.port;

  const hostSourcePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${questionId}`);
  const hostTargetPath = path.join(__dirname, `../lab-session-data/user${sessionIndex + 1}`); 

  try {
    // ล้างโฟลเดอร์เก่า (ถ้ามี)
    await fs.emptyDir(hostTargetPath);

    const copyCommand = `docker cp ${hostSourcePath}/. ${container}:/usr/src/app`;
    exec(copyCommand, async (copyErr) => {
      if (copyErr) {
        console.error("❌ Failed to copy files:", copyErr);
        return res.status(500).json({ message: "File copy failed" });
      }
      // รัน shell script run.sh ใน container
      const runScriptCommand = `docker exec ${container} bash /usr/src/app/run.sh`;

      exec(runScriptCommand, (err2) => {
        if (err2) {
          console.error("❌ Failed to execute run.sh:", err2.message);
          return res.status(500).json({ message: "Failed to initialize lab." });
        }

        // ✅ mark ว่าใช้งานอยู่
        labSessions[sessionIndex].inUse = true;
        labSessions[sessionIndex].userId = userId;
        labSessions[sessionIndex].timeout = setTimeout(() => {
          clearLabSessionByUser(userId);
        }, 1000 * 60 * 60); // 1 ชม.

        return res.status(200).json({
          message: "Lab started",
          terminalUrl: `http://localhost:${port}`,
        });
      });
    });
  } catch (err) {
    console.error("❌ Lab file setup failed:", err.message);
    return res.status(500).json({ message: "Failed to prepare lab files." });
  }
};

const clearLabSession = (req, res) => {
  const { userId } = req.body;
  const session = labSessions.find((s) => s.userId === userId);
  if (!session) {
    return res.status(403).json({ message: "No active lab session for this user." });
  }

  clearLabSessionByUser(userId, res);
};

const submitLabQuestions = async (req, res) => {
  const { enrollmentId } = req.params;
  const { answers } = req.body;

  try {
    let completedCount = 0;

    const tasks = answers.map((answer, index) => {
      const questionId = answer.questionId;

      return new Promise((resolve, reject) => {
        switch (answer.lab_type) {
          case 3: {
            db.query("SELECT type FROM question_answer WHERE id = ?", [answer.answer], (error, result) => {
                if (error) return reject({ code: 500, msg: "Database question_answer query error" });

                const type = result[0]?.type;
                if (type === 1) {
                  db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE questionId = ? AND enrollmentId = ?",
                    [questionId, enrollmentId], (error) => {
                      if (error) return reject({ code: 500, msg: "Database progress update error" });
                      completedCount++;
                      return resolve();
                    }
                  );
                } else {
                  return reject({ code: 401, msg: `Lab question ${index + 1} is not correct!` });
                }
              }
            );
            break;
          }

          case 4: {
            db.query("SELECT content FROM question_answer WHERE questionId = ? AND type = 1", [questionId], (error, result) => {
              if(error) return reject({ code: 500, msg: "Database question_answer query error" });

              const content = result[0]?.content;
              if (content === answer.answer) {
                db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE questionId = ? AND enrollmentId = ?",
                  [questionId, enrollmentId], (error) => {
                    if (error) return reject({ code: 500, msg: "Database progress update error" });
                    completedCount++;
                    return resolve();
                  }
                );
              } else{
                return reject({ code: 401, msg: `Lab question ${index + 1} is not correct!` });
              }
            });
            break;
          }

          case 6: {
            const selectedAnswers = answer.answer;
            if (!Array.isArray(selectedAnswers) || selectedAnswers.length === 0) {
              return reject({ code: 400, msg: `No answers provided for question ${index + 1}` });
            }

            db.query("SELECT id FROM question_answer WHERE questionId = ? AND type = 1", [questionId], (error, result) => {
                if (error) return reject({ code: 500, msg: "Database question_answer query error" });

                const correctAnswerIds = result.map((r) => r.id).sort();
                const selectedSorted = [...selectedAnswers].sort();

                const isCorrect =
                  correctAnswerIds.length === selectedSorted.length &&
                  correctAnswerIds.every((id, idx) => id === selectedSorted[idx]);

                if (isCorrect) {
                  db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE questionId = ? AND enrollmentId = ?",
                    [questionId, enrollmentId], (error) => {
                      if (error) return reject({ code: 500, msg: "Database progress update error" });
                      completedCount++;
                      return resolve();
                    }
                  );
                } else {
                  return reject({ code: 401, msg: `Lab question ${index + 1} is not correct!` });
                }
              }
            );
            break;
          }

          default: {
            return resolve();
          }
        }
      });
    });

    await Promise.all(tasks);

    await new Promise((resolve, reject) => {
      db.query("UPDATE enrollment SET completed_labs = completed_labs + ? WHERE id = ?", [completedCount, enrollmentId], (error) => {
        if (error) return reject({ code: 500, msg: "Database enrollment update error" });
        resolve();
      });
    });

    return res.status(200).json({ message: "Lab questions evaluated." });
  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).json({ message: err.msg || "Server error" });
  }
};

module.exports = {
    getLabQuestions,
    startLabSession,
    clearLabSession,
    submitLabQuestions
}