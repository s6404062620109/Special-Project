const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const db = require("./database");
const { error } = require("console");

const router = express.Router();

router.get("/getLabAnswer/:questionId", (req, res) => {
  const questionId = req.params.questionId;

  db.query(
    "SELECT result FROM answer WHERE QuestionID = ? AND Type = ?",
    [questionId, "a"],
    (error, result) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .send({ message: "Database answer query error." });
      } else {
        return res.status(201).send({ result });
      }
    }
  );
});

router.post("/createLinuxContainer", (req, res) => {
  const { Email, questionID } = req.body;
  const containerName = `linux_container_${Date.now()}`;
  const createContainerCmd = `docker run -d -P -e USER=root -e PASSWORD=password --name ${containerName} --storage-opt size=256m dorowu/ubuntu-desktop-lxde-vnc`;

  // Create the container and get the container ID
  exec(createContainerCmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Error creating container:", err);
      return res.status(500).json({ message: "Failed to create container" });
    }

    const containerId = stdout.trim();

    // Step 2: Query for the answer
    db.query(`SELECT content FROM answer WHERE questionId in (?) AND type = ?`,
      [questionID, 1],(error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Database answer query error" });
        } else if (result.length === 0) {
          return res.status(404).json({ message: "No answer found" });
        }

        const answerResult = result[0].content;
        const sourceDirPath = path.join(__dirname, `../lab/q${questionID}`);
        const tempDirPath = `/tmp/lab_${questionID}_${Date.now()}`;

        fs.readdir(sourceDirPath, (err, files) => {
          if (err) {
            console.error("Error reading directory:", err);
            return res
              .status(500)
              .json({ message: "Failed to read directory" });
          }

          let fileCopyPromises = files.map((file) => {
            const sourceFilePath = path.join(sourceDirPath, file);
            return new Promise((resolve, reject) => {
              exec(
                `docker cp ${sourceFilePath} ${containerId}:/root/${file}`,
                (err) => {
                  if (err) {
                    reject(`Failed to copy file ${file}`);
                  } else {
                    resolve();
                  }
                }
              );
            });
          });

          Promise.all(fileCopyPromises)
            .then(() => {
              const indexFilePath = path.join(sourceDirPath, "result.html");
              fs.readFile(indexFilePath, "utf8", (err, data) => {
                if (err) {
                  console.error("Error reading index.html:", err);
                  return res
                    .status(500)
                    .json({ message: "Failed to read index.html" });
                }

                const modifiedHtml = data.replace("<!-- INSERT ANSWER HERE -->", encodeURIComponent(answerResult))
                  .replace("<head>", '<head><meta charset="UTF-8">');
                const tempHtmlFilePath = `/tmp/index_${questionID}_${Date.now()}.html`;

                fs.writeFileSync(tempHtmlFilePath, modifiedHtml, {
                  encoding: "utf8",
                });

                exec(`docker cp ${tempHtmlFilePath} ${containerId}:/root/result.html`,
                  (err) => {
                    if (err) {
                      console.error(
                        "Error copying HTML file into container:",
                        err
                      );
                      return res.status(500).json({ message: "Failed to copy HTML file into container" });
                    }

                    exec(`docker inspect -f '{{range .NetworkSettings.Ports}}{{.}}{{end}}' ${containerId}`,
                      (err, portOutput) => {
                        if (err) {
                          console.error("Error getting container port:", err);
                          return res.status(500).json({ message: "Failed to retrieve container port" });
                        }

                        const portMatch = portOutput.match(/\d{4,5}/);
                        const port = portMatch ? portMatch[0] : null;

                        exec(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`,
                          (err, ipOutput) => {
                            if (err) {
                              console.error("Error getting container IP:", err);
                              return res.status(500).json({ message: "Failed to retrieve container IP" });
                            }

                            return res.status(200).json({
                              message: "Success prepare virtual matchine",
                              ip: ipOutput.trim(),
                              port: port,
                              containerId: containerId,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              });
            })
            .catch((copyError) => {
              console.error(copyError);
              return res
                .status(500)
                .json({ message: "Failed to copy files into container" });
            });
        });
      }
    );
  });
});

router.post("/startContainer", (req, res) => {
  const { containerId, port } = req.body;

  // Execute the Docker command to start Firefox
  exec(`docker exec ${containerId} firefox http://localhost:${port}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("Error opening Firefox:", err);
        return res.status(500).json({ message: "Error opening Firefox in container" });
      }

      console.log("Firefox started:", stdout);
      res.status(200).json({ message: "Firefox started successfully" });
    }
  );
});

router.post("/stopContainer", (req, res) => {
  const { containerId, IpAddress } = req.body;

  // Stop the container first
  exec(`docker stop ${containerId}`, (err) => {
    if (err) {
      console.error(`Error stopping container ${containerId}:`, err);
      return res.status(500).json({ message: "Failed to stop container" });
    }

    // Remove the container once it's stopped
    exec(`docker rm ${containerId}`, (removeErr) => {
      if (removeErr) {
        console.error(`Error removing container ${containerId}:`, removeErr);
        return res.status(500).json({ message: "Failed to remove container" });
      } else {
        return res.status(200).json({ message: "Container stopped and removed successfully" });
      }
    });
  });
});

router.get("/getLabquestion/:subjectId", (req, res) => {
  const subjectId = req.params.subjectId;

  db.query(
    `SELECT * FROM question WHERE type = ? AND subjectId = ? `,
    ["lab", subjectId],
    (err, questionResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Database question query error" });
      }

      if (questionResult.length === 0) {
        return res
          .status(404)
          .json({ message: "No lab questions found for this subject" });
      } else {
        return res.status(200).json({ questionResult });
      }
    }
  );
});

router.post("/submitLabanswer", (req, res) => {
  const { answer, email } = req.body;
  const QuestionIds = Object.keys(answer);
  const answerResults = Object.values(answer);

  db.query(
    `
    SELECT question.SubjectID, subject.CourseID 
    FROM question 
    INNER JOIN subject ON question.SubjectID=subject.SubjectID
    WHERE QuestionID = ?
  `,
    [QuestionIds],
    (error, result) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .send({ message: "Database question query error" });
      } else {
        const subjectId = result[0].SubjectID;
        const courseId = result[0].CourseID;

        db.query(
          `SELECT HistoryID FROM history WHERE CourseID = ? AND Email = ?`,
          [courseId, email],
          (error, historyResult) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .send({ message: "Database history query error" });
            } else {
              const historyId = historyResult[0].HistoryID;

              db.query(
                `SELECT * FROM answer WHERE QuestionID = ? AND Type = ?`,
                [QuestionIds, "a"],
                (error, resultCheck) => {
                  if (error) {
                    console.log(error);
                    return res
                      .status(500)
                      .send({ message: "Database history query error" });
                  } else {
                    const Ref_answer = resultCheck[0].result;
                    const User_answer = answerResults[0];
                    let score = 0;

                    if (Ref_answer === User_answer) {
                      score++;
                    }

                    if (score === 0) {
                      return res.status(200).send({ message: "You Failed!!!" });
                    }

                    if (score > 0) {
                      db.query(
                        `UPDATE progress SET Score = ${score}, Status = 'Done' WHERE QuestionID = ? AND SubjectID = ? AND HistoryID = ?`,
                        [QuestionIds, subjectId, historyId],
                        (error) => {
                          if (error) {
                            console.log(error);
                            return res
                              .status(500)
                              .send({ message: "Update progress lab error" });
                          } else {
                            return res
                              .status(200)
                              .send({ message: "You Pass!!!" });
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

module.exports = router;
