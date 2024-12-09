const express = require("express");
const fs = require("fs");
const db = require("./database");
const { exec } = require("child_process");

const router = express.Router();

router.post("/createLinuxContainer", (req, res) => {
    const { Email, questionID } = req.body;
    const containerName = `linux_container_${Date.now()}`;
    const createContainerCmd = `docker run -d -P -e USER=root -e PASSWORD=password --name ${containerName} --storage-opt size=256m dorowu/ubuntu-desktop-lxde-vnc`;
  
    db.query(`SELECT * FROM virtual_machine`, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Database virtual matchine query error" });
      } 
      else if (result.length > 4) {
        return res.status(500).json({ message: "Max lab working this time!" });
      }
  
      // Create the container and get the container ID
      exec(createContainerCmd, (err, stdout, stderr) => {
        if (err) {
          console.error("Error creating container:", err);
          return res.status(500).json({ message: "Failed to create container" });
        }
  
        const containerId = stdout.trim();
  
        // Step 2: Query for the answer
        db.query(`SELECT result FROM answer WHERE QuestionID in (?) AND Type = ?`, [questionID, "a"], (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Database answer query error" });
          } else if (result.length === 0) {
            return res.status(404).json({ message: "No answer found" });
          }
  
          const answerResult = result[0].result;
          const sourceDirPath = path.join(__dirname, `../lab/q${questionID}`);
          const tempDirPath = `/tmp/lab_${questionID}_${Date.now()}`;
  
          fs.readdir(sourceDirPath, (err, files) => {
            if (err) {
              console.error("Error reading directory:", err);
              return res.status(500).json({ message: "Failed to read directory" });
            }
  
            let fileCopyPromises = files.map((file) => {
              const sourceFilePath = path.join(sourceDirPath, file);
              return new Promise((resolve, reject) => {
                exec(`docker cp ${sourceFilePath} ${containerId}:/root/${file}`, (err) => {
                  if (err) {
                    reject(`Failed to copy file ${file}`);
                  } else {
                    resolve();
                  }
                });
              });
            });
  
            Promise.all(fileCopyPromises)
              .then(() => {
                const indexFilePath = path.join(sourceDirPath, "result.html");
                fs.readFile(indexFilePath, "utf8", (err, data) => {
                  if (err) {
                    console.error("Error reading index.html:", err);
                    return res.status(500).json({ message: "Failed to read index.html" });
                  }
  
                  const modifiedHtml = data.replace("<!-- INSERT ANSWER HERE -->", encodeURIComponent(answerResult));
                  const tempHtmlFilePath = `/tmp/index_${questionID}_${Date.now()}.html`;
                  fs.writeFileSync(tempHtmlFilePath, modifiedHtml, { encoding: "utf8" });
  
                  exec(`docker cp ${tempHtmlFilePath} ${containerId}:/root/result.html`, (err) => {
                    if (err) {
                      console.error("Error copying HTML file into container:", err);
                      return res.status(500).json({ message: "Failed to copy HTML file into container" });
                    }
  
                    exec(`docker inspect -f '{{range .NetworkSettings.Ports}}{{.}}{{end}}' ${containerId}`, (err, portOutput) => {
                      if (err) {
                        console.error("Error getting container port:", err);
                        return res.status(500).json({ message: "Failed to retrieve container port" });
                      }
  
                      const portMatch = portOutput.match(/\d{4,5}/);
                      const port = portMatch ? portMatch[0] : null;
  
                      exec(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`, (err, ipOutput) => {
                        if (err) {
                          console.error("Error getting container IP:", err);
                          return res.status(500).json({ message: "Failed to retrieve container IP" });
                        }
  
                        db.query(`SELECT SubjectID FROM question WHERE QuestionID in (?)`, [questionID], (error, result) => {
                          if (error) {
                            console.log(error);
                            return res.status(500).json({ message: "Database question query error" });
                          } 
                          else {
                            db.query(`INSERT INTO virtual_machine (IP_Address, Email, SubjectID) VALUES(?, ?, ?)`,
                              [`${ipOutput.trim()}:${port}`, Email, result[0]["SubjectID"], ], (error) => {
                                if (error) {
                                  console.log(error);
                                  return res.status(500).json({ message: "Database virtual matchine post error" });
                                } else {
                                  return res.status(200).json({
                                    message: "Success prepare virtual matchine",
                                    ip: ipOutput.trim(),
                                    port: port,
                                    containerId: containerId
                                  });
                                }
                              }
                            );
                          }
                        });
                      });
                    });
                  });
                });
              })
              .catch((copyError) => {
                console.error(copyError);
                return res.status(500).json({ message: "Failed to copy files into container" });
              });
          });
        });
      });
    });
});
  
router.post('/stopContainer', (req, res) => {
    const { containerId, IpAddress } = req.body;
  
    // Stop the container first
    exec(`docker stop ${containerId}`, (err) => {
      if (err) {
        console.error(`Error stopping container ${containerId}:`, err);
        return res.status(500).json({ message: 'Failed to stop container' });
      }
  
      // Remove the container once it's stopped
      exec(`docker rm ${containerId}`, (removeErr) => {
        if (removeErr) {
          console.error(`Error removing container ${containerId}:`, removeErr);
          return res.status(500).json({ message: 'Failed to remove container' });
        }
        else{
          db.query(`DELETE FROM virtual_machine WHERE IP_Address = ? `, [IpAddress], (error, result) =>{
            if(error){
              console.log(error);
              return res.status(500).json({ message: 'Delete virtual matchine from database Error' });
            }
  
            return res.status(200).json({ message: 'Container stopped and removed successfully' });
          });
        }
      });
    });
});
  
router.get("/getLabquestion/:subjectId", (req, res) => {
    const subjectId = req.params.subjectId;
  
    db.query(`SELECT * FROM question WHERE Type = ? AND SubjectID = ? `,
      ["Lab", subjectId], (err, questionResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database question query error" });
        }
  
        if (questionResult.length === 0) {
          return res.status(404).json({ message: "No lab questions found for this subject" });
        } else {
          return res.status(200).json({ questionlist: questionResult });
        }
      }
    );
});
  
router.post("/submitLabanswer", (req, res) => {
    const { answer, email } = req.body;
    const QuestionIds = Object.keys(answer);
    const answerResults = Object.values(answer);
  
    db.query( "SELECT * FROM answer WHERE QuestionID in (?)", [QuestionIds], (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Database answer query error" });
        } else {
          let score = 0;
          result.map((item, index) => {
            if (item.result === answerResults[index]) {
              score = score+10;
            }
            else if(item.result !== answerResults[index] && score > 0){
              score = score-10;
            }
          });
  
          if (score === answerResults.length*10) {
  
            db.query(`SELECT SubjectID FROM question WHERE QuestionID = ?`, [QuestionIds[0]], (error, result) => {
              if(error){
                console.log(error);
                return res.status(500).json({ message: "Database question query error" });
              }
              else{
  
                db.query(`INSERT INTO history ( \`User-Email\`, \`Subject-ID\`, Score, Status, Type ) VALUES( ?, ?, ?, ?, ? ) `,
                  [email, result[0]["Subject-ID"], score, "Success", `lab-${QuestionIds[0]}`], (error, result) => {
                    if(error){
                      console.log(error);
                      return res.status(500).json({ message: "Failed save lab history" });
                    }
                    else{
                      return res.status(200).json({ message: "You Pass!" });
                    }
                  }
                );
              }
            });
            
          } 
          else {
            return res.status(200).json({ message: "You Failed!" });
          }
        }
      }
    );
});

module.exports = router;