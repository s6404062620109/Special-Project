const WebSocket = require("ws");
const fs = require("fs-extra");
const { exec } = require("child_process");
const path = require("path");
const db = require("../database");
const labSessions  = require("./labState");
require("dotenv").config();

const wss = new WebSocket.Server({ port: 8080 });

const getLabQuestions = (req, res) => {
    const { courseId, subjectId } = req.params;

    if(!subjectId){
        return res.status(400).send({ message: "Required subject ID." });
    }

    try{
      db.query("SELECT * FROM labs WHERE subjectId = ? AND typeId in (3, 5, 6)", [subjectId], (error, result) => {
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

function updateSessionActivity(userId) {
  const session = labSessions.find(s => s.userId === userId);
  if (session) {
    session.lastActive = Date.now();
    console.log(`✅ Activity updated for user ${userId} at ${new Date().toISOString()}`);
  }
}

function clearLabSessionByUser(userId, res = null) {
  const index = labSessions.findIndex((s) => s.userId === userId);
  if (index === -1) {
    if (res) res.status(404).json({ message: "Session not found" });
    return;
  }

  const session = labSessions[index];

  const cleanupCommand = `docker exec -u 0 ${session.container} sh -c "rm -rf /usr/src/app/* /usr/src/app/.[!.]* /usr/src/app/..?* /tmp/*"`;

  exec(cleanupCommand, (err) => {
    clearTimeout(session.timeout);

    labSessions[index] = {
      ...session,
      inUse: false,
      userId: null,
      timeout: null,
      lastActive: null,
    };

    if (res) {
      if (err) {
        console.error("❌ Volume cleanup failed:", err.message);
        return res.status(500).json({ message: "Failed to clean up lab volume." });
      }
      console.log(labSessions)
      return res.status(200).send("Lab cleaned and session released.");
    }
  });
}

setInterval(() => {
  const now = Date.now();
  const idleLimit = 15*60*1000;

  labSessions.forEach(session => {
    if (session.inUse && session.lastActive && now - session.lastActive > idleLimit) {
      console.log(`⏰ User ${session.userId} idle > 15 mins. Clearing session...`);
      clearLabSessionByUser(session.userId);
    }
  });
}, 60*1000);

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.replace('/', ''));
  const userId = params.get('userId');

  console.log(`🔌 User ${userId} connected via WebSocket`);

  ws.on('message', (msg) => {
    console.log(`⌨️  User ${userId} typed: ${msg}`);
    updateSessionActivity(userId);
  });

  ws.on('close', () => {
    console.log(`❌ User ${userId} disconnected`);
  });
});

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
    await fs.emptyDir(hostTargetPath);

    const copyCommand = `docker cp "${hostSourcePath}/." ${container}:/usr/src/app`;
    exec(copyCommand, (copyErr) => {
      if (copyErr) {
        console.error("❌ Failed to copy files:", copyErr);
        return res.status(500).json({ message: "File copy failed" });
      }

      const runCommand = `docker exec -u root ${container} bash /usr/src/app/run.sh`;
      exec(runCommand, (runErr, stdout, stderr) => {
        if (runErr) {
          console.error("❌ Failed to run run.sh:", runErr);
          return res.status(500).json({ message: "Failed to execute run.sh" });
        }
        if (stderr) console.warn("⚠️ run.sh stderr:", stderr);

        labSessions[sessionIndex] = {
          ...availableSession,
          inUse: true,
          userId,
          timeout: setTimeout(() => clearLabSessionByUser(userId), 60*60*1000),
          lastActive: Date.now(),
        };

        console.log(labSessions)
        return res.status(200).json({
          message: "Lab started",
          terminalUrl: `http://${process.env.DEV_URL}:${port}`,
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
            db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO progress_answer (user_answer, progressId) VALUES (?, ?)`, [userAnswer.content, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "คุณผ่านการทดสอบแล้ว" });
                });
              });
            });
          }
          else{
            return res.status(401).send({ message: "คุณไม่ผ่านการทดสอบ, กรุณาลองใหม่อีกครั้ง" });
          }
        }

        else if(answer.lab_type === 5){
          const correctAnswer = userAnswer === answerResult[0].content;
          if(correctAnswer){
            db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database progress update error" });
              }

              db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?", [enrollmentId], (error) => {
                if (error){
                  console.log(error);
                  return res.status(500).send({ message: "Database enrollment update error" });
                }

                db.query(`INSERT INTO progress_answer (user_answer, progressId) VALUES (?, ?)`, [userAnswer, progressId], (error) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database progress_answer insert error" });
                  }
                  return res.status(200).send({ message: "คุณผ่านการทดสอบแล้ว" });
                });
              });
            });
          }
          else{
            return res.status(401).send({ message: "คุณติดไวรัสแล้ว, กรุณาลองใหม่อีกครั้ง" });
          }
        }

        else if(answer.lab_type === 6){
          const correctIds = answerResult.map(a => a.id);
          const userIds = userAnswer.map(a => a.answerId);

          const sameLength = correctIds.length === userIds.length;
          const allMatch = correctIds.every(id => userIds.includes(id));
          const correctAnswer = sameLength && allMatch;

          if(correctAnswer){
            db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE id = ?", [progressId], (error) => {
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
                      db.query(
                        `INSERT INTO progress_answer (user_answer, progressId) VALUES (?, ?)`,
                        [ans.content, progressId],
                        (error) => {
                          if (error) return reject(error);
                          resolve();
                        }
                      );
                    });
                  }));

                  return res.status(200).send({ message: "คุณผ่านการทดสอบแล้ว" });

                } catch (insertErr) {
                  console.log(insertErr);
                  return res.status(500).send({ message: "Database progress_answer insert error" });
                }
              });
            });
          }
          else{
            return res.status(401).send({ message: "คุณไม่ผ่านการทดสอบ, กรุณาลองใหม่อีกครั้ง" });
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
    startLabSession,
    clearLabSession,
    submitLabQuestions
}