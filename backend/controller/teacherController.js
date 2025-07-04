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
        db.query("SELECT * FROM course WHERE teacherId = ?", [userId], (error, result) => {
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

const courseTestProgress = (req, res) => {
  const { courseId } = req.params;

  if(!courseId){
    return res.status(400).send({ message: "Required course ID." });
  }

  try{
    db.query("SELECT id FROM enrollment WHERE courseId = ?", [courseId], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database enrollment query error." });
      }

      const enrollmentIds = result.map(item => item.id);
      if (enrollmentIds.length === 0) {
        return res.status(404).send({ message: "No enrollment found." });
      }

      db.query("SELECT * FROM progress WHERE enrollmentId IN (?)", [enrollmentIds], (error, progressResult) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ message: "Database progress query error" });
        }

        const questionIds = progressResult.map(item => item.questionId);
        if (questionIds.length === 0) {
          return res.status(404).send({ message: "No question found." });
        }

        db.query("SELECT id, typeId, subjectId FROM question WHERE id IN (?)", [questionIds], (error, questionResult) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ message: "Database question query error" });
          }

          const questionInfoMap = {};
          questionResult.forEach(item => {
            questionInfoMap[item.id] = {
              type: item.type,
              subjectId: item.subjectId
            };
          });

          const filteredProgress = progressResult
            .filter(item => {
              const type = questionInfoMap[item.questionId]?.type;
              return type?.includes('Pre') || type?.includes('Post');
            })
            .map(item => {
              const questionInfo = questionInfoMap[item.questionId];
              return {
                ...item,
                type: questionInfo?.type || null,
                subjectId: questionInfo?.subjectId || null
              };
            });

          return res.status(200).send(filteredProgress);
        });
      });
    });

  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

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
    const { name, icon, enable } = req.body;
    
    if( typeof courseId !== 'string' || typeof name !== 'string' || typeof icon !== 'string' ){
        return res.status(400).send({ message: "Invalid Course ID or Name or Icon." });
    }

    if (!name || !icon || enable === undefined || typeof enable !== 'boolean') {
        return res.status(400).json({ message: "Name ,icon and enable are required." });
    }

    try{
        db.query("UPDATE course SET name = ?, icon = ?, enable = ?, updateat = NOW() WHERE id = ?", [name, icon, enable, courseId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database course query error." });
            }

            return res.status(200).send({ message: "Course updated successfully."});
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
        db.query("DELETE FROM course WHERE id = ?", [courseId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database course query error." });
            }
            
            const coursePath = path.join(__dirname, `../courses/c${courseId}`);
            if (fs.existsSync(coursePath)) {
                fs.rmSync(coursePath, { recursive: true, force: true });
            }
            
            return res.status(200).send({ message: "Course deleted successfully."});
        });

    } catch(error){
        console.log(error);
        return res.status(500).send({ message: "Server error.", error });
    }
}
/* teacher_course controller */

/* teacher_subject controller */

const getSubject = (req, res) => {
  const { courseId, subjectId } = req.params;
  const jsonFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
  const pdfFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.pdf`);
  let question = [];

  try{
    db.query(`SELECT name FROM subject WHERE id = ? AND courseId = ?`,
      [subjectId, courseId], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database subject query error" });
        }

        db.query('SELECT courseId FROM subject WHERE id = ?', [subjectId], (err, subjectResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database subject query error" });
          }
          const subjectCourseId = String(subjectResult[0].courseId);
          if(subjectCourseId === courseId){
            db.query('SELECT * FROM question WHERE subjectId = ?', [subjectId], (err, questionResult) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Database question query error" });
              }
              const questionIds = questionResult.map(item => item.id);
              const typeIds = questionResult.map(item => item.typeId);
              if (questionIds.length === 0 || typeIds.length === 0) {
                return res.status(404).json({ message: "No question found." });
              }

              db.query('SELECT * FROM type WHERE id IN (?)', [typeIds], (err, typeResult) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ message: "Database type query error" });
                }

                db.query('SELECT * FROM answer WHERE questionId IN (?)', [questionIds], (err, answerResult) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ message: "Database answer query error" });
                }

                  question = questionResult.map(item => {
                    const answers = answerResult.filter(answer => answer.questionId === item.id);

                    const questionFormat = {
                      id: item.id,
                      content: item.content,
                      img: item.img,
                      type: typeResult.find(type => type.id === item.typeId).id,
                    };

                    if(item.typeId === 1 || item.typeId === 2 || item.typeId === 3){
                      return {
                        ...questionFormat,
                        choice: answers.map(answer => ({
                          id: answer.id,
                          content: answer.content,  
                          isCorrect: answer.type
                        }))
                      };
                    }
                    if( item.typeId === 4 ){
                      const labFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${item.id}`);
                      let Labfiles = [];
                      let Cmdfile = null;

                      if (fs.existsSync(labFolderPath)) {
                        const allFiles = fs.readdirSync(labFolderPath);
                        Cmdfile = allFiles.includes("run.sh") ? `/courses/c${courseId}/s${subjectId}/lab${item.id}/run.sh` : null;
                        Labfiles = allFiles
                          .filter(file => file !== "run.sh")
                          .map(file => `/courses/c${courseId}/s${subjectId}/lab${item.id}/${file}`);
                      }

                      return {
                        ...questionFormat,
                        answerId: answers[0].id,
                        answer: answers[0].type === 1 ? answers[0].content : null,
                        Cmdfile: { name: Cmdfile.split("/").pop(), path: Cmdfile },
                        Labfiles: Labfiles.map(file => ({ name: file.split("/").pop(), path: file }))
                      };
                    }
                    
                  });
                });
              });         
            });
          }
          else{
            return res.status(404).json({ message: "Subject not found in course." });
          }
        });

        fs.access(jsonFilePath, fs.constants.F_OK, (jsonErr) => {
          fs.access(pdfFilePath, fs.constants.F_OK, (pdfErr) => {
            const subjectname = result[0].name;
            const pdfUrl = !pdfErr ? `/courses/c${courseId}/s${subjectId}/content.pdf` : null;
                 
            if (!jsonErr) {
              // ถ้ามี content.json ให้อ่านและส่งกลับพร้อม pdfUrl ถ้ามี
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
              // ถ้าไม่มี content.json แต่มี PDF
              return res.status(200).json({ pdfUrl, subjectname, question });
            } else {
              return res.status(404).json({ message: "No subject content available" });
            }
          });
        });
      }
    );
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

const getQuestionType = (req, res) => {
  try{
    db.query("SELECT * FROM type", (error, result) => {
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
            console.log(q);
            let img = null;
            let questionId;
            if(q.img){
              img = q.img;
            }

            await new Promise((resolve, reject) => {
              db.query("INSERT INTO question (content, img, typeId, subjectId) VALUES (?, ?, ?, ?)",
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

              if (Array.isArray(q.Labfiles)) {
                for (const labKey of q.Labfiles) {
                  const labFile = files.find(f => f.fieldname === labKey);
                  if (labFile) {
                    const labPath = path.join(labFolderPath, labFile.originalname);
                    fs.writeFileSync(labPath, labFile.buffer);
                  }
                }
              }
            }

            if (Array.isArray(q.choice)) {
              for (const c of q.choice) {
                db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                  [c.content, c.isCorrect, questionId], (err) => {
                    if (err) console.log("Choice Insert Error:", err);
                  }
                );
              }
            }
            if(q.answer){
              db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                [q.answer, 1, questionId], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                }
              );
            }

          }

          return res.status(200).json({ message: "PDF subject created successfully." });
        } catch (err) {
          console.error(err);
          return res.status(500).send({ message: "Error inserting questions or choices." });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Server error.", error });
    }
};

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
            db.query("INSERT INTO question (content, img, typeId, subjectId) VALUES (?, ?, ?, ?)",
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

            if (Array.isArray(q.Labfiles)) {
              for (const labKey of q.Labfiles) {
                const labFile = files.find(f => f.fieldname === labKey);
                if (labFile) {
                  const labPath = path.join(labFolderPath, labFile.originalname);
                  fs.writeFileSync(labPath, labFile.buffer);
                }
              }
            }
          }

          if (Array.isArray(q.choice)) {
            for (const c of q.choice) {
              db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                [c.content, c.isCorrect, questionId], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                }
              );
            }
          }
          if(q.answer){
            db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
              [q.answer, 1, questionId], (err) => {
                if (err) console.log("Choice Insert Error:", err);
              }
            );
          }

        }

        return res.status(200).json({ message: "PDF subject created successfully." });
      } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error inserting questions or choices." });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
};

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
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Labfiles, Cmdfile } = q;

          let questionId = qid;
          if (qid) {
            await new Promise((resolve, reject) => {
              db.query("UPDATE question SET content = ?, img = ?, typeId = ? WHERE id = ?", [qContent, qImg, qType, qid], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          } else {
            questionId = await new Promise((resolve, reject) => {
              db.query("INSERT INTO question (subjectId, content, img, typeId) VALUES (?, ?, ?, ?)", [subjectId, qContent, qImg, qType], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
              });
            });
          }

          if(choice){
            for (const c of choice) {
              const { id: cid, content: cContent, isCorrect } = c;
              if (cid) {
                db.query("UPDATE answer SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE answer SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            if (!fs.existsSync(labFolder)) fs.mkdirSync(labFolder, { recursive: true });

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }

            if (Array.isArray(Labfiles)) {
              for (const labField of Labfiles) {
                if (typeof labField === "string") {
                  const labFile = files.find(f => f.fieldname === labField);
                  if (labFile) {
                    const labPath = path.join(labFolder, labFile.originalname);
                    fs.writeFileSync(labPath, labFile.buffer);
                  }
                }
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
          db.query("SELECT id, typeId FROM question WHERE id IN (?)", [parsedQuestionDelete], (err, result) => {
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

            db.query("DELETE FROM question WHERE id IN (?)", [parsedQuestionDelete], (err) => {
              if (err) {
                console.log("Question Delete Error:", err);
                return res.status(500).send({ message: "Error deleting questions." });
              }
            });
          });
        }

        if (parsedChoiceDelete) {
          db.query("DELETE FROM answer WHERE id IN (?)", [parsedChoiceDelete], (err) => {
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
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Labfiles, Cmdfile } = q;

          let questionId = qid;
          if (qid) {
            await new Promise((resolve, reject) => {
              db.query("UPDATE question SET content = ?, img = ?, typeId = ? WHERE id = ?", [qContent, qImg, qType, qid], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          } else {
            questionId = await new Promise((resolve, reject) => {
              db.query("INSERT INTO question (subjectId, content, img, typeId) VALUES (?, ?, ?, ?)", [subjectId, qContent, qImg, qType], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
              });
            });
          }

          if(choice){
            for (const c of choice) {
              const { id: cid, content: cContent, isCorrect } = c;
              if (cid) {
                db.query("UPDATE answer SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE answer SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }
          if(answer && !answerId){
            db.query("INSERT INTO answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, answer, 1], (err) => {
              if (err) console.log("Choice Insert Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            if (!fs.existsSync(labFolder)) fs.mkdirSync(labFolder, { recursive: true });

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }

            if (Array.isArray(Labfiles)) {
              for (const labField of Labfiles) {
                if (typeof labField === "string") {
                  const labFile = files.find(f => f.fieldname === labField);
                  if (labFile) {
                    const labPath = path.join(labFolder, labFile.originalname);
                    fs.writeFileSync(labPath, labFile.buffer);
                  }
                }
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
          db.query("SELECT id, typeId FROM question WHERE id IN (?)", [parsedQuestionDelete], (err, result) => {
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

            db.query("DELETE FROM question WHERE id IN (?)", [parsedQuestionDelete], (err) => {
              if (err) {
                console.log("Question Delete Error:", err);
                return res.status(500).send({ message: "Error deleting questions." });
              }
            });
          });
        }

        if (parsedChoiceDelete) {
          db.query("DELETE FROM answer WHERE id IN (?)", [parsedChoiceDelete], (err) => {
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
  courseTestProgress,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubject,
  getQuestionType,
  addManualSubject,
  addPdfSubject,
  editManualSubject,
  editPdfSubject,
  deleteSubject
}