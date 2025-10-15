const crypto = require("crypto");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const db = require("../database");

const getUsers = (req, res) => {
  try {
    db.query("SELECT id, email, sex, name, surname, role, profile_img, isApprove FROM user", (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ message: "Database user query error." });
        }

        return res.status(200).send({ result });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const addUser = (req, res) => {
  const { name, surname, sex, email, password, role } = req.body;

  if (!name || !surname || !sex || !email || !password || !role) {
    return res.status(400).send({ message: "Name, surname, sex, email, password, and role are required!" });
  }

  try {
    db.query("SELECT * FROM user WHERE email = ?", 
      [email], async (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database user query error." });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Email already registered." });
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
          if (hashErr) {
            console.error("Password hashing failed:", hashErr);
            return res.status(500).json({ message: "Password hashing failed." });
          }

          db.query("INSERT INTO user (email, password, name, surname, sex, role) VALUES (?, ?, ?, ?, ?, ?)",
            [email, hashedPassword, name, surname, sex, role], (insertErr) => {
              if (insertErr) {
                console.log(insertErr);
                return res.status(500).json({ message: "Failed to add user." });
              }
              return res.status(201).json({ message: "User added successfully." });
            }
          );
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const deleteUser = (req, res) => {
  const { userId } = req.params;

  try {
    db.query("DELETE FROM user WHERE id = ?", [userId], (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database user query error." });
      }

      return res.status(200).send({ message: "User deleted successfully." });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const updateUser = (req, res) => {
  const { userId } = req.params;
  const { name, surname, sex, email, role, profile_img } = req.body;

  if(!userId || !name || !surname || !sex || !email || !role){
    return res.status(400).send("Userid, name, surname, sex, email, role are required!");
  }

  try {
    db.query("UPDATE user SET name = ?, surname = ?, sex = ?, email = ?, role = ?, profile_img = ? WHERE id = ?",
      [name, surname, sex, email, role, profile_img, userId], (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .send({ message: "Database user query error." });
        }

        if (result.affectedRows === 0) {
          return res.status(404).send({ message: "User not found." });
        }

        return res.status(200).send({ message: "User updated successfully." });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getCourses = (req, res) => {
  try {
    db.query(
      "SELECT id, name, icon, teacherId FROM course",
      (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .send({ message: "Database course query error." });
        }

        const teacherIds = result.map((course) => course.teacherId);

        db.query(
          "SELECT id, name FROM user WHERE id IN (?)",
          [teacherIds],
          (error, usersResult) => {
            if (error) {
              console.log(error);
            }
            const dataFormat = result.map((course) => {
              const teacherName = usersResult.find(
                (user) => user.id === course.teacherId
              )?.name;
              return {
                ...course,
                teacherName,
              };
            });

            return res.status(200).send({ result: dataFormat });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const deleteCourse = (req, res) => {
  const { courseId } = req.params;

  if(!courseId || typeof courseId !== 'string'){
    return res.status(400).send({ message: "Invalid Course ID." });
  }

  try {
    db.query("DELETE FROM course WHERE id = ?", [courseId], (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Database course query error." });
      }

      const coursePath = path.join(__dirname, `../courses/c${courseId}`);
      if (fs.existsSync(coursePath)) {
        fs.rmSync(coursePath, { recursive: true, force: true });
      }

      return res.status(200).send({ message: "Course deleted successfully." });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const approveTeacherReq = (req, res) => {
    const { userId } = req.params;

    try {
        db.query("UPDATE user SET role = 't', isApprove = 0 WHERE id = ?", [userId], (error) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Database user update error." });
            }
            return res.status(200).send({ message: "ยืนยันคำร้องขอสำเร็จ." });
        });
    } catch (error) {   
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const getGuides = (req, res) => {
  try {
    const studentGuidePath = path.join(__dirname, "../courses/guide/student/guide.pdf");
    const teacherGuidePath = path.join(__dirname, "../courses/guide/teacher/guide.pdf");
    const labGuidePath = path.join(__dirname, "../courses/guide/teacher/index.html");

    const response = {};

    if (fs.existsSync(studentGuidePath)) {
      response.studentGuide = "/guide/student/guide.pdf";
    }

    if (fs.existsSync(teacherGuidePath) && fs.existsSync(labGuidePath)) {
      response.teacherGuide = "/guide/teacher/guide.pdf";
      response.labGuide = "/guide/teacher/index.html";
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const updateGuide = (req, res) => {
  try {
    const { deleteGuides } = req.body;

    const studentGuide = req.files.find(f => f.fieldname === "studentGuide");
    const teacherGuide = req.files.find(f => f.fieldname === "teacherGuide");
    const labGuide = req.files.find(f => f.fieldname === "labGuide");

    const studentGuidePath = path.join(__dirname, "../courses/guide/student");
    const teacherGuidePath = path.join(__dirname, "../courses/guide/teacher");

    if (!fs.existsSync(studentGuidePath)) {
      fs.mkdirSync(studentGuidePath, { recursive: true });
    }
    if (!fs.existsSync(teacherGuidePath)) {
      fs.mkdirSync(teacherGuidePath, { recursive: true });
    }

    if (studentGuide) {
      fs.writeFileSync(path.join(studentGuidePath, "guide.pdf"), studentGuide.buffer);
    }

    if (teacherGuide) {
      fs.writeFileSync(path.join(teacherGuidePath, "guide.pdf"), teacherGuide.buffer);
    }

    if (labGuide) {
      fs.writeFileSync(path.join(teacherGuidePath, "index.html"), labGuide.buffer);
    }

    if (deleteGuides && deleteGuides.length > 0) {
      if (deleteGuides.includes("student")) {
        const file = path.join(studentGuidePath, "guide.pdf");
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      if (deleteGuides.includes("teacher")) {
        const pdfFile = path.join(teacherGuidePath, "guide.pdf");
        const htmlFile = path.join(teacherGuidePath, "index.html");
        if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);
        if (fs.existsSync(htmlFile)) fs.unlinkSync(htmlFile);
      }
    }

    return res.status(200).json({ message: "Guide updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const downloadLabGuide = (req, res) => {
  try{
    const filePath = path.join(__dirname, "../courses/guide/teacher/index.html");
    res.download(filePath, "sample-lab.html"); 

  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

module.exports = {
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  getCourses,
  deleteCourse,
  approveTeacherReq,
  getGuides,
  updateGuide,
  downloadLabGuide
};
