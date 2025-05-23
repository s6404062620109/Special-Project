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

        db.query("SELECT id, type, subjectId FROM question WHERE id IN (?)", [questionIds], (error, questionResult) => {
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

const addManualSubject = (req, res) => {
    const { courseId } = req.params;
    const { name, content, question } = req.body;

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
            await new Promise((resolve, reject) => {
              db.query("INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
                [q.content, q.type, subjectId], (err, questionResult) => {
                  if (err) return reject(err);
  
                  const questionId = questionResult.insertId;
  
                  for (const c of q.choice) {
                    db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                      [c.content, c.isCorrect, questionId], (err) => {
                        if (err) console.log("Choice Insert Error:", err);
                      }
                    );
                  }
                  resolve();
                }
              );
            });
          }
  
          return res.status(200).json({ message: "Subject created successfully." });
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
  const file = req.file;

  if (typeof courseId !== 'string') {
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  if (!name || !question || !file) {
    return res.status(400).json({ message: "Name, file, and question are required." });
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

      const pdfFilePath = path.join(subjectFolderPath, "content.pdf");
      fs.writeFileSync(pdfFilePath, file.buffer);

      try {
        for (const q of parsedQuestion) {
          await new Promise((resolve, reject) => {
            db.query("INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
              [q.content, q.type, subjectId], (err, questionResult) => {
                if (err) return reject(err);

                const questionId = questionResult.insertId;

                for (const c of q.choice) {
                  db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                    [c.content, c.isCorrect, questionId], (err) => {
                      if (err) console.log("Choice Insert Error:", err);
                    }
                  );
                }
                resolve();
              }
            );
          });
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
              if (questionIds.length === 0) {
                return res.status(404).json({ message: "No question found." });
              }

              db.query('SELECT * FROM answer WHERE questionId IN (?)', [questionIds], (err, answerResult) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ message: "Database answer query error" });
                }

                question = questionResult.map(item => {
                  const answers = answerResult.filter(answer => answer.questionId === item.id);
                  return {
                    id: item.id,
                    content: item.content,
                    type: item.type,
                    choice: answers.map(answer => ({
                      content: answer.content,
                      isCorrect: answer.type
                    }))
                  };
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

/* teacher_subject controller */

module.exports = {
    getMyCourses,
    courseTestProgress,
    createCourse,
    updateCourse,
    deleteCourse,
    addManualSubject,
    addPdfSubject,
    getSubject,
}