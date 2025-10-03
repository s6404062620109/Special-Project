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

const progressAnalysis = (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).send({ message: "Required course ID." });
  }

  const sql = `
    SELECT 
      e.userId,
      u.name,
      u.email,
      q.id AS questionId,
      q.typeId,
      p.score
    FROM enrollment e
    JOIN user u ON u.id = e.userId
    JOIN subject s ON s.courseId = e.courseId
    JOIN question q ON q.subjectId = s.id
    LEFT JOIN progress p 
      ON p.enrollmentId = e.id 
      AND p.questionId = q.id 
      AND p.is_completed = 1
    WHERE e.courseId = ?
  `;

  db.query(sql, [courseId], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).send({ message: "Database query error." });
    }

    if (!results || results.length === 0) {
      return res.status(404).send({ message: "No progress found." });
    }

    const users = [];
    let pretestMax = 0;
    let posttestMax = 0;

    const questionSet = new Set();
    results.forEach(r => {
      if (!questionSet.has(r.questionId)) {
        if (r.typeId === 1) pretestMax++;
        if (r.typeId === 2) posttestMax++;
        questionSet.add(r.questionId);
      }
    });

    results.forEach((r) => {
      let user = users.find(u => u.userId === r.userId);

      if (!user) {
        user = {
          userId: r.userId,
          name: r.name,
          email: r.email,
          pretestScore: 0,
          posttestScore: 0,
        };
        users.push(user);
      }

      if (r.typeId === 1) {
        user.pretestScore += r.score || 0;
      } else if (r.typeId === 2) {
        user.posttestScore += r.score || 0;
      }
    });

    return res.status(200).send({ users, pretestMax, posttestMax });
  });
};

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

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
    const { name, icon, enable, announce_state } = req.body;

    if( typeof courseId !== 'string' || typeof name !== 'string' || typeof icon !== 'string' || typeof enable !== 'number' || typeof announce_state !== 'number' ){
        return res.status(400).send({ message: "Invalid Course ID or Name or Icon or Enable or Announce_state." });
    }
    
    if (!name?.trim() || !icon?.trim() || enable === undefined || announce_state === undefined) {
        return res.status(400).json({ message: "Name ,icon, enable and announce_state are required." });
    }

    try{
        db.query("UPDATE course SET name = ?, icon = ?, enable = ?, updateat = NOW() , announce_state = ? WHERE id = ?", [name, icon, enable, announce_state, courseId], (error) => {
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

const enrollSummary = (req, res) => {
  const { courseId } = req.params;

  try {
    const sql = `
      SELECT 
        e.id AS enrollmentId, e.courseId, e.completed_labs, e.total_labs,
        u.id AS userId, u.name AS userName, u.email AS userEmail,
        p.id AS progressId, p.is_completed, p.score, p.questionId,
        pa.user_answer AS userAnswer,
        q.id AS questionId, q.content AS questionContent, q.typeId, q.subjectId,
        qa.content AS correctAnswer
      FROM enrollment e
      JOIN user u ON u.id = e.userId
      LEFT JOIN progress p ON p.enrollmentId = e.id
      LEFT JOIN progress_answer pa ON pa.progressId = p.id
      LEFT JOIN question q ON q.id = p.questionId
      LEFT JOIN question_answer qa ON qa.questionId = q.id AND qa.type = 1
      WHERE e.courseId = ?;
    `;

    db.query(sql, [courseId], (error, rows) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ message: "Database query error." });
      }

      if (!rows.length) {
        return res.status(404).send({ message: "No enrollment found." });
      }

      const enrollmentMap = {};
      const labQuestionSetMap = {};

      rows.forEach(row => {
        // สร้าง enrollment object
        if (!enrollmentMap[row.enrollmentId]) {
          enrollmentMap[row.enrollmentId] = {
            id: row.enrollmentId,
            courseId: row.courseId,
            pretestScore: 0,
            posttestScore: 0,
            labtestScore: 0,
            progressPercent: 0,
            userId: row.userId,
            user: {
              id: row.userId,
              name: row.userName,
              email: row.userEmail
            },
            progress: []
          };
          labQuestionSetMap[row.enrollmentId] = new Set();
        }

        if (row.progressId && row.score != null) {
          if (row.typeId === 1) {
            enrollmentMap[row.enrollmentId].pretestScore += row.score;
          } else if (row.typeId === 2) {
            enrollmentMap[row.enrollmentId].posttestScore += row.score;
          } else if ([3,4,5,6].includes(row.typeId)) {
            if (row.questionId && !labQuestionSetMap[row.enrollmentId].has(row.questionId)) {
              enrollmentMap[row.enrollmentId].labtestScore += row.score;
              labQuestionSetMap[row.enrollmentId].add(row.questionId);
            }
          }
        }

        if (row.total_labs && row.total_labs > 0) {
          enrollmentMap[row.enrollmentId].progressPercent = 
            Math.round((row.completed_labs / row.total_labs) * 100);
        }

        // สร้าง progress object
        if (row.progressId) {
          let progress = enrollmentMap[row.enrollmentId].progress.find(p => p.id === row.progressId);
          if (!progress) {
            progress = {
              id: row.progressId,
              is_completed: row.is_completed,
              score: row.score,
              enrollmentId: row.enrollmentId,
              questions: []
            };
            enrollmentMap[row.enrollmentId].progress.push(progress);
          }

          // เพิ่ม question object
          if (row.questionId) {
            let question = progress.questions.find(q => q.id === row.questionId);
            if (!question) {
              question = {
                id: row.questionId,
                content: row.questionContent,
                typeId: row.typeId,
                subjectId: row.subjectId,
                correctAnswers: row.correctAnswer ? [row.correctAnswer] : [],
                userAnswers: row.userAnswer ? [row.userAnswer] : []
              };
              progress.questions.push(question);
            } else {
              // push correctAnswer ถ้าไม่ซ้ำ
              if (row.correctAnswer && !question.correctAnswers.includes(row.correctAnswer)) {
                question.correctAnswers.push(row.correctAnswer);
              }

              // push userAnswer ถ้าไม่ซ้ำ
              if (row.userAnswer && !question.userAnswers.includes(row.userAnswer)) {
                question.userAnswers.push(row.userAnswer);
              }
            }
          }
        }
      });

      const finalFormat = Object.values(enrollmentMap);
      res.status(200).send({ finalFormat });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error.", error });
  }
};

/* teacher_course controller */

/* teacher_questions controller */

const getQuestions = (req, res) => {
  const { courseId } = req.params;

  if(!courseId || typeof courseId !== 'string'){
    return res.status(400).send({ message: "Invalid Course ID." });
  }

  try{
    db.query("SELECT * FROM questions WHERE courseId = ?", [courseId], (error, result) => {
      if(error){
        console.log(error);
        return res.status(500).send({ message: "Database questions query error." });
      }

      const questionIds = result.map(r => r.id);
      
      if(questionIds.length === 0){
        return res.status(404).send({ message: "No questions found." });
      }

      db.query("SELECT * FROM question_answers WHERE questionId IN (?)", [questionIds], (error, choicesResult) => {
        if(error){
          console.log(error);
          return res.status(500).send({ message: "Database question_choices query error." });
        }

        const choicesMap = {};
        choicesResult.forEach(r => {
          if(!choicesMap[r.questionId]){
            choicesMap[r.questionId] = [];
          }
          choicesMap[r.questionId].push(r);
        });

        const questions = result.map(r => {
          return {
            id: r.id,
            content: r.content,
            img:  r.img,
            choices: choicesMap[r.id] || []
          }
        });

        return res.status(200).send({ questions });
      });
    })
  } catch(error){
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
}

const addQuestion = (req, res) => {
  const { courseId } = req.params;
  const { questions } = req.body;

  if (!courseId || typeof courseId !== "string") {
    return res.status(400).send({ message: "Invalid Course ID." });
  }
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).send({ message: "Questions are required." });
  }

  try {
    const insertQuestions = new Promise((resolve, reject) => {
      db.query(`INSERT INTO questions (content, img, courseId) VALUES ?`,
        [questions.map(q => [q.content, q.img, courseId])], (error, result) => {
          if (error) return reject(error);

          // result.insertId = id แรกที่ insert
          // result.affectedRows = จำนวนแถวที่ insert
          const insertedIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);

          resolve(insertedIds);
        }
      );
    });

    insertQuestions.then(insertedIds => {
      // match แต่ละ question กับ questionId ที่เพิ่ง insert
      const allChoices = [];
      questions.forEach((q, index) => {
        const questionId = insertedIds[index];
        q.choices.forEach(c => {
          allChoices.push([c.content, c.type, questionId]);
        });
      });

      db.query(`INSERT INTO question_answers (content, type, questionId) VALUES ?`,
        [allChoices], (error2) => {
          if (error2) {
            console.log(error2);
            return res.status(500).send({ message: "Error inserting choices." });
          }

          return res.status(200).send({ message: "เพิ่มคำถามใหม่สำเร็จ" });
        }
      );
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: "Error inserting questions.", err });
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error.", error });
  }
};

/* teacher_questions controller */

/* teacher_subject controller */

const getSubject = (req, res) => {
  const { courseId, subjectId } = req.params;
  const jsonFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.json`);
  const pdfFilePath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/content.pdf`);

  try {
    const sql = `
      SELECT 
        s.name AS subjectname,
        l.id AS questionId, l.content AS questionContent, l.img AS questionImg, l.typeId,
        t.id AS typeId, t.name_type AS typeName,
        la.id AS answerId, la.content AS answerContent, la.type AS answerType
      FROM subject s
      LEFT JOIN labs l ON s.id = l.subjectId
      LEFT JOIN question_type t ON l.typeId = t.id
      LEFT JOIN lab_answers la ON l.id = la.questionId
      WHERE s.id = ? AND s.courseId = ?
    `;

    db.query(sql, [subjectId, courseId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "Subject not found." });
      }

      const subjectname = rows[0].subjectname;
      const questionsMap = {};

      rows.forEach(r => {
        if (!r.questionId) return;

        if (!questionsMap[r.questionId]) {
          questionsMap[r.questionId] = {
            id: r.questionId,
            content: r.questionContent,
            img: r.questionImg,
            type: r.typeId,
            choice: []
          };
        }

        if (r.typeId === 1 || r.typeId === 2 || r.typeId === 3 || r.typeId === 6) {
          if (r.answerId) {
            questionsMap[r.questionId].choice.push({
              id: r.answerId,
              content: r.answerContent,
              isCorrect: r.answerType
            });
          }
        } else if (r.typeId === 4) {
          const labFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${r.questionId}`);
          let Cmdfile = null;

          if (fs.existsSync(labFolderPath)) {
            const allFiles = fs.readdirSync(labFolderPath);
            if (allFiles.includes("run.sh")) {
              const relPath = `/courses/c${courseId}/s${subjectId}/lab${r.questionId}/run.sh`;
              const absPath = path.join(__dirname, `..${relPath}`);
              let content = null;
              try {
                content = fs.readFileSync(absPath, "utf8");
              } catch (readErr) {
                console.error(`Error reading run.sh for lab${r.questionId}:`, readErr);
              }
              Cmdfile = { name: "run.sh", path: relPath, content };
            }
          }

          questionsMap[r.questionId].answerId = r.answerId;
          questionsMap[r.questionId].answer = r.answerType === 1 ? r.answerContent : null;
          questionsMap[r.questionId].Cmdfile = Cmdfile;
        } else if (r.typeId === 5) {
          const labFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}/lab${r.questionId}`);
          let htmlFile = null;

          if (fs.existsSync(labFolderPath)) {
            const allFiles = fs.readdirSync(labFolderPath);
            if (allFiles.includes("index.html")) {
              const relPath = `/courses/c${courseId}/s${subjectId}/lab${r.questionId}/index.html`;
              const absPath = path.join(__dirname, `..${relPath}`);
              let content = null;
              try {
                content = fs.readFileSync(absPath, "utf8");
              } catch (readErr) {
                console.error(`Error reading index.html for lab${r.questionId}:`, readErr);
              }
              htmlFile = { name: "index.html", path: relPath, content };
            }
          }

          questionsMap[r.questionId].answerId = r.answerId ?? null;
          questionsMap[r.questionId].answer = r.answerType === 1 ? r.answerContent : null;
          questionsMap[r.questionId].htmlFile = htmlFile;
        }
      });

      const question = Object.values(questionsMap);

      fs.access(jsonFilePath, fs.constants.F_OK, (jsonErr) => {
        fs.access(pdfFilePath, fs.constants.F_OK, (pdfErr) => {
          if (!jsonErr) {
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
            return res.status(200).json({ pdfUrl: `/courses/c${courseId}/s${subjectId}/content.pdf`, subjectname, question });
          } else {
            return res.status(404).json({ message: "No subject content available" });
          }
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getQuestionType = (req, res) => {
  try{
    db.query("SELECT * FROM question_type WHERE status = 1", (error, result) => {
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
            }

            if (q.type === 5){
              const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
              createFolder(labFolder);

              if (typeof q.Htmlfile === "string") {
                const htmlUploaded = files.find(f => f.fieldname === q.Htmlfile);
                if (htmlUploaded) {
                  const htmlPath  = path.join(labFolder, "index.html");
                  fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                  console.log("✅ HTML file written to:", htmlPath);
                }
              }
            }

            if (Array.isArray(q.choice)) {
              for (const c of q.choice) {
                db.query("INSERT INTO question_answer (content, type, questionId) VALUES (?, ?, ?)",
                  [c.content, c.isCorrect, questionId], (err) => {
                    if (err) console.log("Choice Insert Error:", err);
                  }
                );
              }
            }
            if(q.answer){
              db.query("INSERT INTO question_answer (content, type, questionId) VALUES (?, ?, ?)",
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
}

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
          }

          if (q.type === 5){
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof q.Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === q.Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
              }
            }
          }

          if (Array.isArray(q.choice)) {
            for (const c of q.choice) {
              db.query("INSERT INTO question_answer (content, type, questionId) VALUES (?, ?, ?)",
                [c.content, c.isCorrect, questionId], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                }
              );
            }
          }
          if(q.answer){
            db.query("INSERT INTO question_answer (content, type, questionId) VALUES (?, ?, ?)",
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
}

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
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Cmdfile, Htmlfile } = q;

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
                db.query("UPDATE question_answer SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO question_answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE question_answer SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }
          if(answer && !answerId){
            db.query("INSERT INTO question_answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, answer, 1], (err) => {
              if (err) console.log("Choice Insert Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }
          }

          if (qType === 5){
            const labFolder = path.join(subjectFolderPath, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
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
          db.query("DELETE FROM question_answer WHERE id IN (?)", [parsedChoiceDelete], (err) => {
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
          const { id: qid, content: qContent, img: qImg, type: qType, choice, answer, answerId, Cmdfile, Htmlfile } = q;

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
                db.query("UPDATE question_answer SET content = ?, type = ? WHERE id = ?", [cContent, isCorrect, cid], (err) => {
                  if (err) console.log("Choice Update Error:", err);
                });
              } else {
                db.query("INSERT INTO question_answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, cContent, isCorrect], (err) => {
                  if (err) console.log("Choice Insert Error:", err);
                });
              }
            }
          }
          if(answer && answerId){
            db.query("UPDATE question_answer SET content = ? WHERE id = ? AND type = 1", [answer, answerId], (err) => {
              if (err) console.log("Choice Update Error:", err);
            });
          }
          if(answer && !answerId){
            db.query("INSERT INTO question_answer (questionId, content, type) VALUES (?, ?, ?)", [questionId, answer, 1], (err) => {
              if (err) console.log("Choice Insert Error:", err);
            });
          }

          if (qType === 4) {
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Cmdfile === "string") {
              const cmdFile = files.find(f => f.fieldname === Cmdfile);
              if (cmdFile) {
                const cmdPath = path.join(labFolder, "run.sh");
                fs.writeFileSync(cmdPath, cmdFile.buffer);
              }
            }
          }

          if (qType === 5){
            const labFolder = path.join(courseFolder, `lab${questionId}`);
            createFolder(labFolder);

            if (typeof Htmlfile === "string") {
              const htmlUploaded = files.find(f => f.fieldname === Htmlfile);
              if (htmlUploaded) {
                const htmlPath  = path.join(labFolder, "index.html");
                fs.writeFileSync(htmlPath, htmlUploaded.buffer);
                console.log("✅ HTML file written to:", htmlPath);
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
          db.query("DELETE FROM question_answer WHERE id IN (?)", [parsedChoiceDelete], (err) => {
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
  progressAnalysis,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollSummary,
  getQuestions,
  addQuestion,
  getSubject,
  getQuestionType,
  addManualSubject,
  addPdfSubject,
  editManualSubject,
  editPdfSubject,
  deleteSubject
}