const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("./database");

const router = express.Router();

router.post("/register", async (req, res) => {
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
    });
});

const authenUserKey = `SAT_Authen_User`
router.post("/login", (req, res) => {
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
            const token = jwt.sign({ email: user.Email }, authenUserKey, { expiresIn: "1h" });
            return res.status(201).send({ message: "Login Success.", token: token });
          }
        }
    });
});
  
router.get("/authorization", (req, res) => {
    const authToken = req.headers['authorization'];
    let authtokenvalue = ''
    if ( authToken ){
      authtokenvalue = authToken.split(' ')[1];
    }
    
    const user = jwt.verify(authtokenvalue, authenUserKey);
    if(user){
      const email = user.email;
      db.query('SELECT Email, Name, Role FROM user WHERE Email = ?', [email], (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Database user query error." });
        } else{ 
          return res.status(200).json({ result });
        }
      });
    } else {
      return res.status(403).json({ message: "Authorization error!" });
    }
});

const authenRequestotpKey = `SAT_Reset_OTP`
router.post("/requestotp", (req, res) => {
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
              const token = jwt.sign({ email: email }, authenRequestotpKey, { expiresIn: "15m" });
              res.status(200).send({ message: "OTP sent successfully", token: token });
            }
          });
        }
      );
    });
});
  
router.get("/autherizationotp", (req, res) => {
    const authToken = req.headers['authorization'];
    let authtokenvalue = ''
    if ( authToken ){
      authtokenvalue = authToken.split(' ')[1];
    }
    
    const user = jwt.verify(authtokenvalue, authenRequestotpKey);
    if(user){
      const email = user.email;
      db.query('SELECT Email, Name, Role FROM user WHERE Email = ?', [email], (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Database user query error." });
        } else{ 
          return res.status(200).json({ result });
        }
      });
    } else {
      return res.status(403).json({ message: "Authorization error!" });
    }
});
  
router.post("/verifyotp", (req, res) => {
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
  
router.post("/setnewpassword", async (req, res) => {
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

module.exports = router;