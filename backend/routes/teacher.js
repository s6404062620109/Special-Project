const express = require("express");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const db = require("./database");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/getMyCourses/:userId", (req, res) => {
    const { userId } = req.params;

    if( typeof userId !== 'string' ){
        return res.status(400).send({ message: "Invalid user ID." });
    }

    db.query("SELECT * FROM course WHERE teacherId = ?", [userId], (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).send({ message: "Database user query error." });
        }

        return res.status(200).send({ result });
    });
});

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId } = req.params;

    if (!courseId) {
      return cb(new Error("Course ID is required"), null);
    }

    const uploadPath = path.join(__dirname, `../courses/c${courseId}`);
    createFolder(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = "icon" + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post("/uploadCourseIcon/:courseId", upload.single("icon"), (req, res) => {
  const { courseId } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const iconFileName = req.file.filename;

  db.query("UPDATE course SET icon_id = ? WHERE id = ?", [iconFileName, courseId], (err) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ message: "Database update error" });
    }

    res.status(200).json({ message: "Icon uploaded successfully", icon: iconFileName });
  });
});

router.post("/addCourse", async (req, res) => {
  try {
    const { name, teacherId } = req.body;

    if (!name || !teacherId) {
      return res.status(400).json({ message: "Course name and teacher ID are required" });
    }

    db.query("INSERT INTO course (name, teacherId) VALUES (?, ?)", [name, teacherId], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Database query error" });
      }

      return res.status(200).json({
        message: "Course added successfully",
        course: { id: result.insertId, name, teacherId, icon: null },
      });
    });
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

function deleteFolderRecursive(folderPath){
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
};

const moveFiles = (files, sourcePath, destinationPath) => {
  try {
    files.forEach((file) => {
      const sourceFile = path.join(sourcePath, file.filename);
      const destinationFile = path.join(destinationPath, file.filename);
      fs.renameSync(sourceFile, destinationFile);
    });
  } catch (err) {
    console.error("Error moving files:", err);
    throw new Error("Error moving files");
  }
};

function deleteTempFiles(files, tmpPath) {
  files.forEach((file) => {
    const filePath = path.join(tmpPath, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

const subjectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseId } = req.params;

    if (!courseId) {
      return cb(new Error("Course ID is required"), null);
    }

    const uploadPath = path.join(__dirname, `../courses/c${courseId}/tmp`);
    createFolder(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const subjectUpload = multer({
  storage: subjectStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images" || file.fieldname.startsWith("labFile-") || file.fieldname === "pdfFile") {
      cb(null, true);
    } else {
      cb(new Error("Unexpected field"), false);
    }
  },
}).any(); 

router.post("/saveSubject/:courseId", (req, res) => {
  subjectUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "File upload error" });
    }

    const { courseId } = req.params;
    const { name, data, questions, mode } = req.body;
    const uploadedFiles = req.files;

    if (!name || name === null) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!questions) {
      return res.status(400).json({ message: "Questions are required." });
    }

    let parsedData, parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions); 
      if (data) {
        parsedData = JSON.parse(data);
      }
    } catch (err) {
      console.error("Error parsing JSON data:", err);
      return res.status(400).json({ message: "Invalid JSON data" });
    }

    const { content, subcontent, summary } = parsedData || {};
    const questionData = parsedQuestions;

    db.query("INSERT INTO subject (name, courseId) VALUES (?, ?)", [name, courseId], (err, insertSubjectResult) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ message: "Database insert error" });
      }

      const subjectId = insertSubjectResult.insertId;
      const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);
      const tmpPath = path.join(__dirname, `../courses/c${courseId}/tmp`);

      createFolder(subjectFolderPath);

      if (mode === "pdf") {
        // โหมด PDF: ตรวจสอบและบันทึกไฟล์ PDF
        const pdfFile = uploadedFiles.find(file => file.fieldname === "pdfFile");

        if (!pdfFile) {
          return res.status(400).json({ message: "PDF file is required for PDF mode." });
        }

        const pdfFilePath = path.join(subjectFolderPath, "content.pdf");

        try {
          fs.renameSync(pdfFile.path, pdfFilePath);
        } catch (err) {
          console.error("Error moving PDF file:", err);
          return res.status(500).json({ message: "Error saving PDF file" });
        }

        questionData.forEach((question, index) => {
          const { question: q, answers } = question;
          db.query(
            "INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
            [q.content, q.type, subjectId],
            (err, insertQuestionResult) => {
              if (err) {
                console.error("Database insert error:", err);
                return res.status(500).json({ message: "Database insert error" });
              }
      
              const questionId = insertQuestionResult.insertId;
      
              // บันทึกคำตอบ
              answers.forEach((answer) => {
                db.query(
                  "INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                  [answer.content, answer.type, questionId],
                  (err) => {
                    if (err) {
                      console.error("Database insert error:", err);
                      return res.status(500).json({ message: "Database insert error" });
                    }
                  }
                );
              });
            }
          );
        });
      

        return res.status(200).json({ message: "Subject saved successfully." });
      } else if (mode === "manual") {
        // โหมด Manual: ดำเนินการตามเดิม
        if (!data) {
          return res.status(400).json({ message: "Data is required for manual mode." });
        }

        const jsonData = { content, subcontent, summary };
        const jsonFilePath = path.join(subjectFolderPath, "content.json");
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        // แยกไฟล์ images และ labFile-*
        const imageFiles = uploadedFiles.filter(file => file.fieldname === "images");
        const labFiles = uploadedFiles.filter(file => file.fieldname.startsWith("labFile-"));

        // ย้ายไฟล์ images ไปยังโฟลเดอร์ปลายทาง
        moveFiles(imageFiles, tmpPath, subjectFolderPath);

        const imageFileNames = imageFiles.map((file) => file.filename);
        const imageFileNamesString = imageFileNames.join(",");

        db.query("UPDATE subject SET images = ? WHERE id = ?",
          [imageFileNamesString, subjectId], (err) => {
            if (err) {
              console.error("Database update error:", err);
              return res.status(500).json({ message: "Database update error" });
            }

            deleteTempFiles(imageFiles, tmpPath);

            questionData.forEach((question, index) => {
              const { question: q, answers } = question;
              db.query("INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
                [q.content, q.type, subjectId], (err, insertQuestionResult) => {
                  if (err) {
                    console.error("Database insert error:", err);
                    return res.status(500).json({ message: "Database insert error" });
                  }

                  const questionId = insertQuestionResult.insertId;

                  const labFile = labFiles.find(file => file.fieldname === `labFile-${index}`);
                  if (q.type === "lab-w" && labFile) {
                    const labFilePath = path.join(__dirname, `../lab/q${questionId}`);
                    createFolder(labFilePath);

                    try {
                      fs.copyFileSync(labFile.path, path.join(labFilePath, "index.html"));
                    } catch (err) {
                      console.error("Error copying lab file:", err);
                      return res.status(500).json({ message: "Error copying lab file" });
                    }
                  }

                  answers.forEach((answer) => {
                    db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                      [answer.content, answer.type, questionId], (err) => {
                        if (err) {
                          console.error("Database insert error:", err);
                          return res.status(500).json({ message: "Database insert error" });
                        }
                      });
                  });
                });
            });

            res.status(200).json({ message: "Subject saved successfully" });
          });
      } else {
        return res.status(400).json({ message: "Invalid mode specified." });
      }
    });
  });
});

router.post("/updateSubject/:courseId/:subjectId", (req, res) => {
  subjectUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "File upload error" });
    }

    const { courseId, subjectId } = req.params;
    const { name, data, questions, mode } = req.body; 
    const uploadedFiles = req.files;

    if (!mode) {
      return res.status(400).json({ message: "Mode is required." });
    }

    if (mode === "manual" && (!data || !questions)) {
      return res.status(400).json({ message: "Data and questions are required for manual mode." });
    }

    // if (mode === "pdf" && !uploadedFiles?.pdfFile) {
    //   return res.status(400).json({ message: "PDF file is required for PDF mode." });
    // }

    db.query("SELECT name, images FROM subject WHERE id = ? AND courseId = ?", [subjectId, courseId], (err, result) => {
      if (err) {
        console.error("Database select error:", err);
        return res.status(500).json({ message: "Database select error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Subject not found." });
      }

      const currentSubject = result[0];
      const subjectFolderPath = path.join(__dirname, `../courses/c${courseId}/s${subjectId}`);

      if (!fs.existsSync(subjectFolderPath)) {
        fs.mkdirSync(subjectFolderPath, { recursive: true });
      }

      // โหมด PDF
      if (mode === "pdf") {
        let questionData

        try {
          questionData = JSON.parse(questions);
        } catch (error) {
          console.error("Error parsing questions:", error);
          return res.status(400).json({ message: "Invalid questions format." });
        }

        const pdfFile = uploadedFiles.find(file => file.fieldname === "pdfFile");

        if (currentSubject.contentPath && fs.existsSync(currentSubject.contentPath)) {
          try {
            fs.unlinkSync(currentSubject.contentPath);
          } catch (err) {
            console.error("Error deleting old PDF file:", err);
            return res.status(500).json({ message: "Error deleting old PDF file" });
          }
        }

        const pdfFilePath = path.join(subjectFolderPath, "content.pdf");

        try {
          fs.renameSync(pdfFile.path, pdfFilePath);
        } catch (err) {
          console.error("Error moving PDF file:", err);
          return res.status(500).json({ message: "Error moving PDF file" });
        }

        questionData.forEach((question, index) => {
          const { question: q, answers } = question;

          if (q.id) {
            db.query("UPDATE question SET content = ?, type = ? WHERE id = ?",
              [q.content, q.type, q.id],
              (err) => {
                if (err) {
                  console.error("Database update error:", err);
                  return res.status(500).json({ message: "Database update error" });
                }

                answers.forEach((answer) => {
                  db.query("SELECT id FROM answer WHERE content = ? AND type = ? AND questionId = ?",
                    [answer.content, answer.type, q.id],
                    (err, result) => {
                      if (err) {
                        console.error("Database select error:", err);
                        return res.status(500).json({ message: "Database select error" });
                      }

                      if (result.length === 0) {
                        db.query("INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                          [answer.content, answer.type, q.id],
                          (err) => {
                            if (err) {
                              console.error("Database insert error:", err);
                              return res.status(500).json({ message: "Database insert error" });
                            }
                          }
                        );
                      }
                    }
                  );
                });
              }
            );
          } else {
            db.query("SELECT id FROM question WHERE content = ? AND type = ? AND subjectId = ?",
              [q.content, q.type, subjectId], (err, result) => {
                if (err) {
                  console.error("Database select error:", err);
                  return res.status(500).json({ message: "Database select error" });
                }

                if (result.length > 0) {
                  return res.status(500).json({ message: "Question already exists" });
                } else {
                  db.query("INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
                    [q.content, q.type, subjectId],
                    (err, insertResult) => {
                      if (err) {
                        console.error("Database insert error:", err);
                        return res.status(500).json({ message: "Database insert error" });
                      }

                      const questionId = insertResult.insertId;

                      answers.forEach((answer) => {
                        db.query(
                          "INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                          [answer.content, answer.type, questionId],
                          (err) => {
                            if (err) {
                              console.error("Database insert error:", err);
                              return res.status(500).json({ message: "Database insert error" });
                            }
                          }
                        );
                      });

                      const labFile = uploadedFiles.find(file => file.fieldname === `labFile-${index}`);
                      if (q.type === "lab-w" && labFile) {
                        const labFilePath = path.join(__dirname, `../lab/q${questionId}`);
                        fs.mkdirSync(labFilePath, { recursive: true });

                        try {
                          fs.copyFileSync(labFile.path, path.join(labFilePath, "index.html"));
                        } catch (err) {
                          console.error("Error copying lab file:", err);
                          return res.status(500).json({ message: "Error copying lab file" });
                        }
                      }
                    }
                  );
                }
              }
            );
          }
        });

      }

      // โหมด Manual
      else if (mode === "manual") {
        let content, subcontent, summary, questionData;

        try {
          const parsedData = JSON.parse(data);
          content = parsedData.content;
          subcontent = parsedData.subcontent;
          summary = parsedData.summary;
        } catch (error) {
          console.error("Error parsing data:", error);
          return res.status(400).json({ message: "Invalid data format." });
        }

        try {
          questionData = JSON.parse(questions);
        } catch (error) {
          console.error("Error parsing questions:", error);
          return res.status(400).json({ message: "Invalid questions format." });
        }

        // บันทึกข้อมูล JSON
        const jsonData = { content, subcontent, summary };
        const jsonFilePath = path.join(subjectFolderPath, "content.json");
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        // อัปเดตชื่อวิชา (ถ้ามีการเปลี่ยนแปลง)
        let updateSubjectQuery = "UPDATE subject SET";
        const updateParams = [];

        if (name && name !== currentSubject.name) {
          updateSubjectQuery += " name = ?,";
          updateParams.push(name);
        }

        // จัดการไฟล์รูปภาพ
        const imageFiles = uploadedFiles.filter(file => file.fieldname === "images");
        if (imageFiles.length > 0) {
          const imageFileNames = imageFiles.map((file) => file.filename);
          const existingImages = currentSubject.images
            ? currentSubject.images.split(",").filter(img => img.trim() !== "")
            : [];

          imageFiles.forEach((file) => {
            const oldPath = file.path;
            const newPath = path.join(subjectFolderPath, file.filename);
            fs.renameSync(oldPath, newPath);
          });

          const updatedImages = [...existingImages, ...imageFileNames].join(",");
          updateSubjectQuery += " images = ?,";
          updateParams.push(updatedImages);
        }

        // อัปเดตข้อมูลในฐานข้อมูล
        if (updateParams.length > 0) {
          updateSubjectQuery = updateSubjectQuery.slice(0, -1);
          updateSubjectQuery += " WHERE id = ? AND courseId = ?";
          updateParams.push(subjectId, courseId);

          db.query(updateSubjectQuery, updateParams, (err) => {
            if (err) {
              console.error("Database update error:", err);
              return res.status(500).json({ message: "Database update error" });
            }
          });
        }

        // จัดการคำถามและคำตอบ
        questionData.forEach((question, index) => {
          const { question: q, answers } = question;

          if (q.id) {
            db.query("UPDATE question SET content = ?, type = ? WHERE id = ?",
              [q.content, q.type, q.id],
              (err) => {
                if (err) {
                  console.error("Database update error:", err);
                  return res.status(500).json({ message: "Database update error" });
                }

                answers.forEach((answer) => {
                  db.query(
                    "SELECT id FROM answer WHERE content = ? AND type = ? AND questionId = ?",
                    [answer.content, answer.type, q.id],
                    (err, result) => {
                      if (err) {
                        console.error("Database select error:", err);
                        return res.status(500).json({ message: "Database select error" });
                      }

                      if (result.length === 0) {
                        db.query(
                          "INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                          [answer.content, answer.type, q.id],
                          (err) => {
                            if (err) {
                              console.error("Database insert error:", err);
                              return res.status(500).json({ message: "Database insert error" });
                            }
                          }
                        );
                      }
                    }
                  );
                });
              }
            );
          } else {
            db.query("SELECT id FROM question WHERE content = ? AND type = ? AND subjectId = ?",
              [q.content, q.type, subjectId], (err, result) => {
                if (err) {
                  console.error("Database select error:", err);
                  return res.status(500).json({ message: "Database select error" });
                }

                if (result.length > 0) {
                  return res.status(500).json({ message: "Question already exists" });
                } else {
                  db.query("INSERT INTO question (content, type, subjectId) VALUES (?, ?, ?)",
                    [q.content, q.type, subjectId],
                    (err, insertResult) => {
                      if (err) {
                        console.error("Database insert error:", err);
                        return res.status(500).json({ message: "Database insert error" });
                      }

                      const questionId = insertResult.insertId;

                      answers.forEach((answer) => {
                        db.query(
                          "INSERT INTO answer (content, type, questionId) VALUES (?, ?, ?)",
                          [answer.content, answer.type, questionId],
                          (err) => {
                            if (err) {
                              console.error("Database insert error:", err);
                              return res.status(500).json({ message: "Database insert error" });
                            }
                          }
                        );
                      });

                      const labFile = uploadedFiles.find(file => file.fieldname === `labFile-${index}`);
                      if (q.type === "lab-w" && labFile) {
                        const labFilePath = path.join(__dirname, `../lab/q${questionId}`);
                        fs.mkdirSync(labFilePath, { recursive: true });

                        try {
                          fs.copyFileSync(labFile.path, path.join(labFilePath, "index.html"));
                        } catch (err) {
                          console.error("Error copying lab file:", err);
                          return res.status(500).json({ message: "Error copying lab file" });
                        }
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }

      res.status(200).json({ message: "Subject updated successfully" });
    });
  });
});

router.delete("/deleteSubjectOnCourse/:courseId/:subjectId/:userId", (req, res) => {
  const { courseId, subjectId, userId } = req.params;

  if(!courseId || !subjectId || !userId){
    return res.status(400).send({ message: "Course ID, Subject ID and User ID are required." });
  }

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
  
});

router.put("/update/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const { name } = req.body;

  try {
    db.query("UPDATE course SET name = ? WHERE id = ?", [name, courseId], (err) => {
      if(err){
        console.log(err);
        return res.status(500).json({ message: "Update course error"});
      }

      return res.status(200).json({ message: "Course updated successfully!" });
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update course." });
  }
});

const deleteIcon = (courseId, iconFileName) => {
  if (!iconFileName) return;

  const iconPath = path.join(__dirname, `../courses/c${courseId}`, iconFileName);

  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath);
    console.log(`Deleted icon: ${iconPath}`);
  } else {
    console.log(`Icon not found: ${iconPath}`);
  }
};

router.post("/uploadCourseIcon/:courseId", upload.single("icon"), (req, res) => {
  const { courseId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const iconFileName = req.file.filename;

  db.query("SELECT icon_id FROM course WHERE id = ?", [courseId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database query error" });
    }

    const oldIconFileName = results[0]?.icon_id;

    // ลบ icon เดิม (ถ้ามี)
    if (oldIconFileName) {
      deleteIcon(courseId, oldIconFileName);
    }

    // อัปเดต icon ใหม่ในฐานข้อมูล
    db.query("UPDATE course SET icon_id = ? WHERE id = ?",
      [iconFileName, courseId], (err) => {
        if (err) {
          console.error("Database update error:", err);
          return res.status(500).json({ message: "Database update error" });
        }

        res.status(200).json({ message: "Icon uploaded successfully", icon: iconFileName });
      }
    );
  });
});

router.delete("/deleteCourse/:courseId/:userId", (req, res) => {
    const { courseId, userId } = req.params;

    if( typeof courseId !== 'string' || typeof userId !== 'string' ){
        return res.status(400).send({ message: "Invalid User ID or Course ID." });
    }

    db.query("SELECT id FROM course WHERE id = ? AND teacherId = ?", [ courseId, userId ], (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).send({ message: "Database user query error." });
        }

        if(result.length === 0){
            return res.status(404).send({ message: "Course not found or you do not have permission to delete this course." });
        }

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
    });
    
});

module.exports = router;