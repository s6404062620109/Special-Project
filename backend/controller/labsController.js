const { exec } = require("child_process");
const path = require("path");
const db = require("../database");

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

let labSessionLock = null;
let labTimeout = null;

const startLabSession = (req, res) => {
  const { courseId } = req.params;
  const { userId, subjectId, questionId } = req.body;

  if (labSessionLock) {
    return res.status(423).json({ message: "Lab is currently in use" });
  }

  labSessionLock = {
    userId,
    startAt: Date.now(),
  };

  labTimeout = setTimeout(() => {
    console.log("Auto-cleanup lab after timeout");
    labSessionLock = null;
  }, 1000 * 60 * 60);

  const hostLabPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${questionId}`);
  const containerWorkDir = `/usr/src/app/lab-session`;
  const containerLabOutput = `/lab`;

  const fullCopyCommand = `docker cp "${hostLabPath}/." ubuntu-ui:"${containerWorkDir}"`;

  exec(fullCopyCommand, (copyErr) => {
    if (copyErr) {
      console.error("❌ Copy failed:", copyErr.message);
      labSessionLock = null;
      clearTimeout(labTimeout);
      return res.status(500).json({ message: "Failed to copy lab files." });
    }

    console.log("✅ Lab files copied to working dir");

    const runCommand = `docker exec ubuntu-ui bash "${containerWorkDir}/run.sh"`;

    exec(runCommand, (runErr) => {
      if (runErr) {
        console.error("❌ run.sh failed:", runErr.message);
        labSessionLock = null;
        clearTimeout(labTimeout);
        return res.status(500).json({ message: "Failed to execute run.sh" });
      }

      const prepareCopyLabCommand = `
        docker exec ubuntu-ui bash -c '
            mkdir -p /root/Desktop/lab &&
            find /usr/src/app/lab-session -type f ! -name "*.sh" -exec cp {} /root/Desktop/lab/ \\;
        '
      `;

      exec(prepareCopyLabCommand, (copy2Err) => {
        if (copy2Err) {
          console.error("❌ Failed to copy non-sh files to /lab:", copy2Err.message);
          labSessionLock = null;
          clearTimeout(labTimeout);
          return res.status(500).json({ message: "Failed to expose lab files." });
        }

        console.log("✅ Lab content (non-.sh files) copied to /lab");

        const ubuntuUiUrl = process.env.LINUX_UBUNTU_LAB1;
        return res.json({
          message: "Lab started successfully",
          ubuntuUiUrl,
        });
      });
    });
  });
};

const clearLabSession = (req, res) => {
    const { userId } = req.body;

    if (labSessionLock?.userId !== userId) {
        return res.status(403).json({ message: "You are not the session owner" });
    }

    labSessionLock = null;
    clearTimeout(labTimeout);

    const cleanupCommand = `
        docker exec ubuntu-ui rm -rf /usr/src/app/lab-session/* &&
        docker exec ubuntu-ui rm -rf /root/Desktop/lab /root/Desktop/lab
    `;

    exec(cleanupCommand, (err, stdout, stderr) => {
        if (err) {
        console.error("❌ Failed to clean lab files:", err.message);
        return res.status(500).json({ message: "Failed to clean lab files." });
        }
        
        return res.send("Lab cleaned up and unlocked");
    });
}

const submitLabQuestions = async (req, res) => {
  const { enrollmentId } = req.params;
  const { answers } = req.body;

  try {
    const tasks = answers.map((answer, index) => {
      const questionId = answer.questionId;

      return new Promise((resolve, reject) => {
        switch (answer.lab_type) {
          case 3: {
            db.query("SELECT type FROM question_answer WHERE id = ?", [answer.answer], (error, result) => {
                if (error) return reject({ code: 500, msg: "DB query error" });

                const type = result[0]?.type;
                if (type === 1) {
                  db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE questionId = ? AND enrollmentId = ?",
                    [questionId, enrollmentId], (error) => {
                      if (error) return reject({ code: 500, msg: "DB update error" });
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

          case 6: {
            const selectedAnswers = answer.answer;
            if (!Array.isArray(selectedAnswers) || selectedAnswers.length === 0) {
              return reject({ code: 400, msg: `No answers provided for question ${index + 1}` });
            }

            db.query("SELECT id FROM question_answer WHERE questionId = ? AND type = 1", [questionId], (error, result) => {
                if (error) return reject({ code: 500, msg: "DB query error" });

                const correctAnswerIds = result.map((r) => r.id).sort();
                const selectedSorted = [...selectedAnswers].sort();

                const isCorrect =
                  correctAnswerIds.length === selectedSorted.length &&
                  correctAnswerIds.every((id, idx) => id === selectedSorted[idx]);

                if (isCorrect) {
                  db.query("UPDATE progress SET is_completed = 1, score = 1 WHERE questionId = ? AND enrollmentId = ?",
                    [questionId, enrollmentId], (error) => {
                      if (error) return reject({ code: 500, msg: "DB update error" });
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