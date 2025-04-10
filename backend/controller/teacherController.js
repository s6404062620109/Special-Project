const fs = require("fs");
const path = require("path");
const multer = require('multer'); 
const db = require("../database");
const e = require("express");

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

/* teacher_subject controller */

module.exports = {
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    addManualSubject,
}