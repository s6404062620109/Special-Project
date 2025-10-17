const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../database");
require("dotenv").config();

const register = (req, res) => {
  const { email, sex, name, surname, password, teacher_request } = req.body;

  if (!req.body || !sex || !email || !password || !name || !surname) {
    return res.status(400).json({ message: "Email, password, sex, name, surname and teacher_request are required." });
  }

  const isTeacherRequest = teacher_request || false;

  try {
    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database user query error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "มีอีเมลนี้ในระบบแล้ว กรุณาใช้อีเมลอื่น." });
      }

      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          console.error("Password hashing failed:", err);
          return res.status(500).json({ message: "Password hashing failed." });
        }

        db.query("INSERT INTO user (email, password, sex, name, surname, role, isApprove) VALUES(?, ?, ?, ?, ?, ?, ?)",
          [email, hashedPassword, sex, name, surname, "s", isTeacherRequest], (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Register Failed!!!" });
            }

            return res.status(201).json({ message: "สมัครสมาชิกสำเร็จแล้ว" });
          }
        );
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const register_password = (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    return res.status(400).json({ message: "Token, email, and password are required." });
  }

  try {
    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database user query error." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = results[0];

      if (user.password !== null) {
        return res.status(400).json({ message: "User already have password." });
      }

      jwt.verify(token, user.verified_key, (err, decoded) => {
        if (err) {
          console.error("Token verification failed:", err);
          return res.status(400).json({ message: "Invalid or expired token." });
        }

        if (decoded.email !== email) {
          return res.status(400).json({ message: "Email does not match the token." });
        }

        if (new Date() > new Date(user.verified_expired)) {
          db.query("DELETE FROM user WHERE email = ?", [email], (err) => {
            if (err) {
              console.error("User deletion failed:", err);
              return res.status(500).json({ message: "User deletion failed." });
            }

            return res.status(200).json({ message: "Token has expired. Please register again." });
          });

          return;
        }

        const saltRounds = 10;
        bcrypt.hash(newPassword, saltRounds, (err, hash) => {
          if (err) {
            console.error("Password hashing failed:", err);
            return res.status(500).json({ message: "Password hashing failed." });
          }

          db.query("UPDATE user SET password = ?, verified_key = NULL, verified_expired = NULL WHERE email = ?",
            [hash, email], (err, result) => {
              if (err) {
                console.error("Password update failed:", err);
                return res.status(500).json({ message: "Password update failed." });
              }

              return res.status(200).json({ message: "ตั้งค่ารหัสผ่านสำเร็จแล้ว" });
            }
          );
        });
      });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!req.body || !email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database user query error." });
        }

      if (result.length === 0) {
        return res.status(404).json({ message: "Invalid email or password." });
      }

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const verifiedKey = crypto.randomBytes(32).toString("hex");
      const verifiedExpired = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 );

      db.query("UPDATE user SET verified_key = ?, verified_expired = ? WHERE email = ?",
        [verifiedKey, verifiedExpired, email], (error) => {
          if (error) {
            return res.status(500).json({ message: "Error updating verification details." });
          }

          const token = jwt.sign({ id: user.id }, verifiedKey, { expiresIn: "30d" });

          const isProduction = `http://${process.env.DEV_URL}:${process.env.FRONTEND_PORT}`?.startsWith("https");
          
          res.cookie("authToken", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: isProduction, 
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            // before deploy secure: true, sameSite: "none"
          });

          return res.status(200).json({ message: "Login Successfully." });
        }
      );
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const logout = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try{
    db.query("UPDATE user SET verified_key = NULL, verified_expired = NULL WHERE email = ?", 
      [email], (err) => {
        if(err){
          console.log(err);
          return res.status(500).json({ message: "Database user query error" });
        }

        res.clearCookie("authToken");
        return res.status(200).json({ message: "Logged out successfully." });
      }
    );
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
  
}

const authorization = (req, res) => {
  const authToken = req.cookies.authToken;
  const { email } = req.params;

  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }
  if (!email){
    return res.status(400).json({ message: "Email is required." });
  }

  try{
    db.query("SELECT id, email, sex, name, surname, role, profile_img, verified_key FROM user WHERE email = ?", 
      [email], (err, users) => {
        if (err) {
          return res.status(500).json({ message: "Database error while fetching user data." });
        }
  
        if (users.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }
        
        const user = users[0];
  
        try {
          const decoded = jwt.verify(authToken, user.verified_key);
          if (decoded.id === user.id) {
            return res.status(200).json({
              id: user.id,
              email: user.email,
              sex: user.sex,
              name: user.name,
              surname: user.surname,
              role: user.role,
              profile_img: user.profile_img,
            });
          }
        } catch (error) {
          console.log("Invalid token for user:", error);
          return res.status(403).json({ message: "Invalid or expired token." });
        }
  
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    );

  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }

}

const forgot_password = (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).send({ message: "Email is required." });
  }

  try{

    db.query("SELECT * FROM user WHERE email = ?", [email], (error, results) => {
      if (error) {
          console.error(error);
          return res.status(500).send({ message: "Database user query error." });
      }

      if (results.length === 0) {
          return res.status(400).send({ message: "Email not found." });
      }

      const resetToken = crypto.randomBytes(32).toString("hex"); 
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000); 

      db.query("UPDATE user SET verified_key = ?, verified_expired = ? WHERE email = ?", 
        [resetToken, expiryTime, email], (err) => {
          if (err) {
            console.error("Error storing reset token:", err);
            return res.status(500).send({ message: "Error storing reset token." });
          }

          const resetLink = `http://${process.env.DEV_URL}:${process.env.FRONTEND_PORT}/reset-password?token=${resetToken}`;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: true,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
              subject: "Reset Your Password",
              text: `Click the link below to reset your password. This link will expire in 15 minutes.\n\n${resetLink}`,
            };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(500).send({ message: "Error sending reset email." });
            } 
            else {
              console.log("Email sent: " + info.response);
              return res.status(200).send({ message: "Password reset link sent successfully." });
            }
          });
        }
      );
    });

  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

const reset_password = (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  try{
    db.query("SELECT * FROM user WHERE verified_key = ?", [token], async (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database user query error." });
      }

      if (results.length === 0) {
          return res.status(400).json({ message: "Invalid or expired token." });
      }

      const user = results[0];

      if (new Date() > new Date(user.verified_expired)) {
          return res.status(400).json({ message: "Token has expired." });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      db.query("UPDATE user SET password = ?, verified_key = NULL, verified_expired = NULL WHERE email = ?", 
        [hashedPassword, user.email], (err) => {
          if (err) {
            return res.status(500).json({ message: "Password update failed." });
          }

          return res.status(200).json({ message: "Password updated successfully." });
        }
      );
    });

  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

const getVerifiedExpired = (req, res) => {
  const authToken = req.cookies.authToken;
  const { email } = req.params;

  if (!authToken) {
    return res.status(403).json({ message: "Authorization error! No token provided." });
  }

  if(!email){
    return res.status(400).json({ message: "Email is required." });
  }

  try{
    db.query("SELECT id, email, verified_expired, verified_key FROM user WHERE email = ?",
      [email], (err, users) => {
        if (err) {
          return res.status(500).json({ message: "Database error while fetching user data." });
        }
  
        if (users.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }
  
        const user = users[0];
  
        try {
          const decoded = jwt.verify(authToken, user.verified_key);
          if (decoded.id === user.id) {
            return res.status(200).json({
              verified_expired: user.verified_expired,
            });
          }
        } catch (error) {
          console.log("Invalid token for user:", error);
          return res.status(403).json({ message: "Invalid or expired token." });
        }
  
        return res.status(403).json({ message: "Invalid or expired token." });
      }
    );
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

const updateProfile = (req, res) => {
  const { id } = req.params;
  const { name, surname, email, profile_img } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ message: "Name surname and email are required." });
  }

  if( typeof name !== 'string' || typeof surname !== 'string' || typeof email !== 'string' ){
    return res.status(400).json({ message: "Name surname and email must be string." });
  }

  try{
    db.query("UPDATE user SET name = ?, surname = ?, email = ?, profile_img = ? WHERE id = ?",  
      [ name, surname, email, profile_img, id ], (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "Profile updated successfully!" });
    });
  } catch(error){
    console.log(error);
    return res.status(500).json({ message: "Server error.", error });
  }
}

module.exports = {
  register,
  register_password,
  login,
  logout,
  authorization,
  forgot_password,
  reset_password,
  getVerifiedExpired,
  updateProfile
};
