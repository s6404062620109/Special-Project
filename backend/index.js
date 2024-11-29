const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const { error } = require("console");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(bodyParser.json());

const db = mysql2.createConnection({
  user: "root",
  host: "db",
  port: 3306,
  password: "root",
  database: "SAT",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

/* Authenticator */

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Email, password, and name are required." });
  }

  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database user query error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered." });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO user (email, password, name, role, OTP) VALUES(?, ?, ?, ?, ?)", 
          [email, hashedPassword, name, "Student", "-"], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Register Failed!!!" });
            } else {
              return res.status(201).json({ message: "Register Success!!!" });
            }
          }
        );
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error." });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database user query error." });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      if (result.length > 0) {
        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
          return res.status(401).send({ message: "Invalid password." });
        } else {
          const token = jwt.sign({ email: user.Email, name: user.Name }, "authToken", { expiresIn: "1h" });
          return res.status(201).send({ message: "Login Success.", token: token });
        }
      }
    }
  );
});

app.post("/requestotp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required." });
  }

  db.query("SELECT * FROM user WHERE Email = ?", [email], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ message: "Database user query error." });
    }

    if (results.length === 0) {
      return res.status(400).send({ message: "Email not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpexp = new Date(Date.now() + 15 * 60 * 1000);

    db.query("UPDATE user SET OTP = ?, OTP_EXP = ? WHERE Email = ?", [otp, otpexp, email], (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ message: "Error updating OTP in database." });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "s6404062620109@email.kmutnb.ac.th",
            pass: "umhv hkky xduh btac",
          },
        });

        const mailOptions = {
          from: "s6404062620109@email.kmutnb.ac.th",
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ message: "Error sending OTP" });
          } else {
            console.log("Email sent: " + info.response);
            const token = jwt.sign({ email: email }, "resetToken", { expiresIn: "15m" });
            res.status(200).send({ message: "OTP sent successfully", token: token });
          }
        });
      }
    );
  });
});

app.post("/verifyotp", (req, res) => {
  const { email, otp } = req.body;
  db.query("SELECT OTP, OTP_EXP FROM user WHERE Email = ?", [email], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ message: "Database user query error." });
      }

      if (result.length === 0) {
        return res.status(400).send({ message: "Email not found." });
      }

      const storedOtp = result[0].OTP;
      const otpExp = result[0].OTP_EXP;
      const currentTime = new Date();

      if (currentTime > otpExp) {
        return res.status(400).send({ message: "OTP has expired." });
      }

      if (storedOtp !== otp) {
        return res.status(400).send({ message: "Invalid OTP" });
      }

      return res.status(200).send({ message: "OTP verified successfully." });
    }
  );
});

app.post("/setnewpassword", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.query("UPDATE user SET Password = ? WHERE Email = ?", [hashedPassword, email], (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ message: "Error updating Password in database." });
      } else {
        return res.status(200).send({ message: "Update Password Success!" });
      }
    }
  );
});

/* Authenticator */

/* Courses */

app.get("/getCourses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) {
      return res.status(500).send("Database query error");
    }
    res.json(results);
  });
});

app.get("/checkCoursesProgress/:email", (req, res) => {
   const email = req.params.email;

   db.query(`SELECT * FROM history WHERE Email = ?`, [email], (err, results) => {
     if (err) {
       console.error(err);
       return res.status(500).json({ message: "Database history query error" });
     }

     else{
      return res.status(200).json({ results });
     }
   });
});

app.get("/getLatestProgress/:historyId", (req, res) => {
  const historyId = req.params.historyId;

  db.query(`SELECT * FROM progress WHERE HistoryID = ?`, [historyId], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database progress query error" });
    }

    else{
      let inProgress = '';
      const latestQuestion = result[result.length-1].QuestionID;

      db.query(`SELECT progress.QuestionID, question.Type, question.SubjectID FROM progress 
        INNER JOIN question ON progress.QuestionID = question.QuestionID 
        WHERE progress.QuestionID = ? AND progress.Status = ?`, 
        [latestQuestion, 'Failed'], (error, latestResult) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database progress query error" });
          }
          else{
            const lastestType = latestResult[0].Type;
            const latestSubject = latestResult[0].SubjectID;
            if(lastestType === "Pre"){
              inProgress = `pretest/${historyId}`;
            }
            if(lastestType === "Lab"){

              inProgress = `subject/${latestSubject}`;
            }
            return res.status(200).json({ inProgress });
          }
      });
    }
  });
});

/*edit*/ /*app.get("/getSubject/:courseId/:subjectId", (req, res) => {
//   const courseId = req.params.courseId;
//   const subjectId = req.params.subjectId;

//   db.query(`SELECT * FROM subject WHERE SubjectID = ? AND \`course-ID\` = ? `, [subjectId, courseId], (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Database subject query error" });
//       } else {
//         return res.status(200).json(result);
//       }
//     }
//   );
});/*

/* Courses */

/* Subject */

app.get("/getAllSubject/:courseId", (req, res) => {
  const courseId = req.params.courseId;

  db.query(`SELECT * FROM courses WHERE CourseID = ?`, [courseId], (err, courseResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database courses query error" });
      } else {
        db.query(`SELECT * FROM subject WHERE CourseID = ? `, [courseId], (err, subjectResults) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database subject query error" });
            } else {
              return res.status(200).json({ courseInfo: courseResult, subject: subjectResults });
            }
          }
        );
      }
    }
  );
});

/*edit*/ /*app.get('/updateHistory/:email/:courseId', (req, res) => {
  const { email, courseId } = req.params;

  db.query(`SELECT SubjectID From subject WHERE \`Course-ID\` = ?`, [courseId], (subjectError, subjectResult) =>{
    if(subjectError){
      console.log(error);
      return res.status(500).json({ message: "Database subject query failed" });
    }
    else{
      let subjectId = subjectResult.map((value) => value.SubjectID);

      db.query(`SELECT * FROM history WHERE \`User-Email\` = ? AND \`Subject-ID\` in (?)`, [email, subjectId], (error, result) =>{
        if(error){
          console.log(error);
          return res.status(500).json({ message: "Database history query failed" });
        }
        else{
          return res.status(200).json({ result });
        }
      });
      
    }
  });
});*/

/* Subject */

/* Pre-Test */

app.get("/getPretest/:courseId/:historyId/:email", (req, res) => {
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

app.post("/submitPretest", (req, res) => {
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
              console.log(userQuestionIds);
              
              validAnswers.forEach((answer) => {
                db.query( `UPDATE progress SET Score = 1 WHERE QuestionID = ? AND HistoryID = ?`,
                  [answer.QuestionID, historyId], (error) => {
                    if (error) {
                      console.error(error);
                      return res.status(500).json({ message: "Update progress error" });
                    }
                    
                    updateCount++;
                    if (updateCount === totalToUpdate) {

                      db.query(`UPDATE progress SET Status = 'Done' WHERE HistoryID = ?`,
                        [historyId], (error) => {
                          if (error) {
                            console.error(error);
                            return res.status(500).json({ message: "Update progress status error" });
                          }

                          const subjectIdlabs = [];
                          let subjectCounter = 0;

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
                                    return res.status(200).json({
                                      message: "Progress updated successfully (no labs inserted)",
                                      SubjectIDs: SubjectIdList,
                                    });
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

/* Pre-Test */

/* Lab */

app.post("/createLinuxContainer", (req, res) => {
  const questionID = req.body.questionID;
  const containerName = `linux_container_${Date.now()}`;
  const createContainerCmd = `docker run -d -P -e USER=root -e PASSWORD=password --name ${containerName} --storage-opt size=256m dorowu/ubuntu-desktop-lxde-vnc`;

  db.query(`SELECT * FROM \`virtual matchine\``, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Database virtual matchine query error" });
    } else if (result.length > 4) {
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

                      db.query(`SELECT \`Subject-ID\` FROM question WHERE QuestionID in (?)`, [questionID], (error, result) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ message: "Database question query error" });
                        } else {
                          db.query(`INSERT INTO \`virtual matchine\` (\`Subject-ID\`, \`IP-Address\`) VALUES(?, ?)`,
                            [result[0]["Subject-ID"], `${ipOutput.trim()}:${port}`], (error) => {
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

app.post('/stopContainer', (req, res) => {
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
        db.query(`DELETE FROM \`virtual matchine\` WHERE \`IP-Address\` = ? `, [IpAddress], (error, result) =>{
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

app.get("/getLabquestion/:subjectId", (req, res) => {
  const subjectId = req.params.subjectId;

  db.query(
    `SELECT * FROM question WHERE Type = ? AND \`Subject-ID\` = ? `,
    ["lab", subjectId], (err, questionResult) => {
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

app.post("/submitLabanswer", (req, res) => {
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

          db.query(`SELECT \`Subject-ID\` FROM question WHERE QuestionID = ?`, [QuestionIds[0]], (error, result) => {
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
          
        } else {
          return res.status(200).json({ message: "You Failed!" });
        }
      }
    }
  );
});

/* Lab */

/* History */

app.post('/registerHistory', (req, res) => {
  const { courseId, email } = req.body;

  db.query(`INSERT INTO history ( CourseID, Email ) VALUES( ?, ? )`, [courseId, email], (postErr, postResult) => {
    if(postErr){
      console.log(postErr);
      return res.status(500).json({ message: 'Register History Error.' });
    }

    else{
      return res.status(200).json({ message: 'Register History Successful.' });  
    }
  });
});

// app.get(`/getUserHistory/:email`, (req, res) => {
//   const email = req.params.email;

//   db.query(`SELECT * FROM history WHERE \`User-Email\` = ?`, [email], (err, resultHistories) => {
//     if(err) {
//       console.log(err);
//       return res.status(500).json({ message: "Database history query error" });
//     }
//     else{
//       const subjectIds = resultHistories.map((value) => (value[`Subject-ID`]));
      
//       db.query(`SELECT \`Course-ID\` FROM subject WHERE SubjectID in (?)`, [subjectIds], (err, resultFilterCourse) => {
//         if(err) {
//           console.log(err);
//           return res.status(500).json({ message: "Database subject query error" });
//         }
//         else{
//           const uniqueCourseIDs = [...new Set(resultFilterCourse.map((value) => value['Course-ID']))];

//           return res.status(200).json({
//             CourseIDs: uniqueCourseIDs,
//             History: resultHistories,
//           });
//         }
//       });
//     }
//   });
// });

/* History */

/* Progress */

app.post('/registerTestProgress', (req, res) => {
  const { questionIdList, courseId, email } = req.body;

  db.query('SELECT HistoryID FROM history WHERE CourseID = ? AND Email = ?', [courseId, email], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database history query error." });
    }
    if(result.length > 0){
      const historyID = result[0].HistoryID;
 
      for(let i=0; i<questionIdList.length; i++){
        db.query('SELECT SubjectID FROM question WHERE QuestionID = ?', [questionIdList[i]], (error, subjectResult) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database question query error." });
          }
          else{
            const subjectID = subjectResult[0].SubjectID;
            let round = 0;
            db.query(`INSERT INTO progress ( QuestionID	, SubjectID, HistoryID ) VALUES( ?, ?, ? )`, [questionIdList[i], subjectID, historyID], (postErr, postResult) => {
              if (postErr) {
                console.error(postErr);
                return res.status(500).json({ message: "Progress post error." });
              }
              else{
                round++;
                if(round === questionIdList.length){
                  return res.status(200).json({ message: "Progress post Sucessful." });
                }
              }
            });
          }
        });
      }
    }
  });
});

/* Progress */

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
