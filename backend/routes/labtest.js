const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const db = require("./database");
const { error } = require("console");
require('dotenv').config();

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
  const createContainerCmd = `
    docker run -d \
    -p 8080:80 \
    -e USER=root \
    -e PASSWORD=password \
    --name ${containerName} \
    --network WSL_bridge \
    dorowu/ubuntu-desktop-lxde-vnc
  `.trim();

  //   const createContainerCmd = `
  // docker run -d -P \
  //   --network=aitae_bridge \
  //   --ip=192.168.1.254 \
  //   -p 8080:80 \
  //   -e USER=root \
  //   -e PASSWORD=password \
  //   --name ${containerName} \
  //   --storage-opt size=256m \
  //   dorowu/ubuntu-desktop-lxde-vnc
  // `

  // Create the container and get the container ID
  exec(createContainerCmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Error creating container:", err);
      return res.status(500).json({ message: "Failed to create container" });
    }

    const containerId = stdout.trim();

    // Step 2: Query for the answer
    db.query(
      `SELECT content FROM answer WHERE questionId in (?) AND type = ?`,
      [questionID, 1],
      (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ message: "Database answer query error" });
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

                const modifiedHtml = data
                  .replace(
                    "<!-- INSERT ANSWER HERE -->",
                    encodeURIComponent(answerResult)
                  )
                  .replace("<head>", '<head><meta charset="UTF-8">');
                const tempHtmlFilePath = `/tmp/index_${questionID}_${Date.now()}.html`;

                fs.writeFileSync(tempHtmlFilePath, modifiedHtml, {
                  encoding: "utf8",
                });

                exec(
                  `docker cp ${tempHtmlFilePath} ${containerId}:/root/result.html`,
                  (err) => {
                    if (err) {
                      console.error(
                        "Error copying HTML file into container:",
                        err
                      );
                      return res
                        .status(500)
                        .json({
                          message: "Failed to copy HTML file into container",
                        });
                    }

                    exec(
                      `docker inspect -f '{{range .NetworkSettings.Ports}}{{.}}{{end}}' ${containerId}`,
                      (err, portOutput) => {
                        if (err) {
                          console.error("Error getting container port:", err);
                          return res
                            .status(500)
                            .json({
                              message: "Failed to retrieve container port",
                            });
                        }

                        const portMatch = portOutput.match(/\d{4,5}/);
                        const port = portMatch ? portMatch[0] : null;

                        exec(
                          `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`,
                          (err, ipOutput) => {
                            if (err) {
                              console.error("Error getting container IP:", err);
                              return res
                                .status(500)
                                .json({
                                  message: "Failed to retrieve container IP",
                                });
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

// router.post("/createLinuxContainer", (req, res) => {
//   const containerName = `linux_vm_${Date.now()}`;
//   const exposedPort = Math.floor(5900 + Math.random() * 100);

//   const createContainerCmd = `
//     docker run -d --name ${containerName} \
//     -p ${exposedPort}:5900 \
//     --network backend_my_network \
//     dorowu/ubuntu-desktop-lxde-vnc
//   `.trim();

//   exec(createContainerCmd, (err, stdout, stderr) => {
//     if (err) {
//       console.error("Error creating VM:", err);
//       return res.status(500).json({ message: "Failed to create VM", error: stderr });
//     }

//     return res.status(200).json({
//       message: "VM Created",
//       containerId: stdout.trim(),
//       port: exposedPort,
//       url: `http://${process.env.FRONTEND_URL}:${exposedPort}`,
//     });
//   });
// });

router.post("/startContainer", (req, res) => {
  const { containerId, port } = req.body;

  // Execute the Docker command to start Firefox
  exec(
    `docker exec ${containerId} firefox http://localhost:${port}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("Error opening Firefox:", err);
        return res
          .status(500)
          .json({ message: "Error opening Firefox in container" });
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
        return res
          .status(200)
          .json({ message: "Container stopped and removed successfully" });
      }
    });
  });
});

router.get("/getLabquestion/:subjectId", (req, res) => {
  const subjectId = req.params.subjectId;

  db.query(`SELECT * FROM question WHERE type IN (?, ?, ?) AND subjectId = ? `,
    ["lab", "lab-w", "lab-e", subjectId], (err, questionResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database question query error" });
      }

      if (questionResult.length === 0) {
        return res.status(404).json({ message: "No lab questions found for this subject" });
      }

      return res.status(200).json({ questionResult });
    }
  );
});

router.post("/submitLabanswer/:enrollmentId", (req, res) => {
  const { enrollmentId } = req.params;
  const { answer, userId } = req.body;
  const QuestionIds = Object.keys(answer);
  const answerResults = Object.values(answer);

  db.query("SELECT * FROM answer WHERE questionId = ?", [QuestionIds[0]], (error, answerResult) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Database answer query error" });
    }
    if (answerResults.length === 0) {
      return res.status(404).json({ message: "No answer found" });
    }

    if (answerResults[0] === answerResult[0].content) {
      db.query("UPDATE progress SET is_completed = ?, score = 1 WHERE questionId = ? AND enrollmentId = ?",
        [true, QuestionIds[0], enrollmentId],
        (error) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Progress pretest score update error" });
          }

          db.query("UPDATE enrollment SET completed_labs = completed_labs + 1 WHERE id = ?",
            [enrollmentId],
            (error) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ message: "Enrollment lab complete update error" });
              }

              return res.status(200).json({ message: "Pass", enrollmentId: enrollmentId });
            }
          );
        }
      );
    } else {
      return res.status(200).json({ message: "Failed" });
    }
  });
});

module.exports = router;
