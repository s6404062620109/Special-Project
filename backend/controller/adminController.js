const crypto = require("crypto");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path"); 
const db = require("../database");

const getUsers = (req, res) => {
  try {
    db.query("SELECT id, email, name, role, profile_img, isApprove FROM user", (error, result) => {
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
  const { email, name, role } = req.body;

  if (!email || !name || !role) {
    return res
      .status(400)
      .json({ message: "Email, name, and role are required." });
  }

  try {
    db.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Database user query error." });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Email already registered." });
        }

        const verifiedKey = crypto.randomBytes(32).toString("hex");
        const verificationToken = jwt.sign({ email }, verifiedKey, {
          expiresIn: "1h",
        });
        const verifiedExpired = new Date(Date.now() + 60 * 60 * 1000);

        db.query(
          "INSERT INTO user (email, name, role, verified_key, verified_expired) VALUES (?, ?, ?, ?, ?)",
          [email, name, role, verifiedKey, verifiedExpired],
          (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Failed to add user." });
            }

            const setPasswordLink = `${process.env.FRONTEND_URL}/set-password?token=${verificationToken}&email=${email}`;

            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Set Your Password",
              html: `
                        <p>Hello ${name},</p>
                        <p>You have been added to our system. Please click the link below to set your password. This link will expire in 1 hour.</p>
                        <a href="${setPasswordLink}">${setPasswordLink}</a>
                        <p>If you didn't request this, please ignore this email.</p>
                    `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Email sending failed:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to send email." });
              } else {
                return res
                  .status(201)
                  .json({ message: "User added successfully." });
              }
            });
          }
        );
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
  const { name, email, role, profile_img } = req.body;

  try {
    db.query(
      "UPDATE user SET name = ?, email = ?, role = ?, profile_img = ? WHERE id = ?",
      [name, email, role, profile_img, userId],
      (error, result) => {
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
};
