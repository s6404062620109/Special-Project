const { exec } = require("child_process");
const path = require("path");
const db = require("../database");
const labSessions  = require("./labState");

const getLabQuestions = (req, res) => {
    const { subjectId } = req.params;

    if(!subjectId){
        return res.status(400).send({ message: "Required subject ID." });
    }

    try{
        let labsId = [ 3, 4, 5, 6 ]
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

function clearLabSessionByUser(userId, res = null) {
  const index = labSessions.findIndex((s) => s.userId === userId);
  if (index === -1) {
    if (res) res.status(404).json({ message: "Session not found" });
    return;
  }

  const session = labSessions[index];

  const cleanupCommand = `docker exec ${session.container} rm -rf /usr/src/app/lab`;

  exec(cleanupCommand, (err) => {
    clearTimeout(session.timeout);

    labSessions[index] = {
      ...session,
      inUse: false,
      userId: null,
      timeout: null
    };

    // console.log("✅ Updated labSessions[index]:", labSessions[index]);
    // console.log(labSessions);

    if (res) {
      if (err) {
        console.error("❌ Cleanup failed:", err.message);
        return res.status(500).json({ message: "Failed to clean up lab." });
      }
      res.send("Lab cleaned and session released.");
    }
  });
}

const startLabSession = (req, res) => {
  const { courseId } = req.params;
  const { subjectId, questionId, userId } = req.body;

  const availableSession = labSessions.find((s) => !s.inUse);
  if (!availableSession) {
    return res.status(423).json({ message: "All terminals are in use." });
  }

  const hostLabPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${questionId}`);
  const containerPath = "/usr/src/app/lab";
  const runScriptPath = `${containerPath}/run.sh`;

  const { container, port } = availableSession;

  const copyCommand = `docker cp "${hostLabPath}/." ${container}:${containerPath}`;
  const runCommand = `docker exec ${container} bash ${runScriptPath}`;

  // Copy lab files
  exec(copyCommand, (err) => {
    if (err) {
      console.error("❌ Failed to copy lab files:", err.message);
      return res.status(500).json({ message: "Failed to prepare lab." });
    }

    // Run shell setup
    exec(runCommand, (err2) => {
      if (err2) {
        console.error("❌ Failed to execute run.sh:", err2.message);
        return res.status(500).json({ message: "Failed to initialize lab." });
      }

      // Mark terminal as in-use
      availableSession.inUse = true;
      availableSession.userId = userId;
      availableSession.timeout = setTimeout(() => {
        clearLabSessionByUser(userId); // auto cleanup
      }, 1000 * 60 * 60); // 1 hour

      const url = `http://localhost:${port}`;
      res.json({ message: "Lab started", terminalUrl: url });
    });
  });
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