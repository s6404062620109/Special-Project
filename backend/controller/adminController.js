const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("../database");

const getUsers = (req, res) => {
    try{
        db.query("SELECT id, email, name, role, profile_img FROM user", (error, result) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database user query error." });
            }

            return res.status(200).send({ result });
        });    
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const addUser = (req, res) => {
    const { email, name, role } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ message: "Email, name, and role are required." });
    }

    try{
        db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Database user query error." });
            }
    
            if (results.length > 0) {
                return res.status(400).json({ message: "Email already registered." });
            }
  
            const verifiedKey = crypto.randomBytes(32).toString("hex");
            const verificationToken = jwt.sign({ email }, verifiedKey, { expiresIn: "1h" });
            const verifiedExpired = new Date(Date.now() + 60 * 60 * 1000);

            db.query("INSERT INTO user (email, name, role, verified_key, verified_expired) VALUES (?, ?, ?, ?, ?)",
                [email, name, role, verifiedKey, verifiedExpired], (err) => {
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
                    return res.status(500).json({ message: "Failed to send email." });
                    } else {
                    return res.status(201).json({ message: "User added successfully." });
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

const deleteUser = (req, res) => {
    const { userId } = req.params;

    try{
        db.query("DELETE FROM user WHERE id = ?", [userId], (error) => {
            if(error){
                console.log(error);
                return res.status(500).send({ message: "Database user query error." });
            }

            return res.status(200).send({ message: "User deleted successfully." });
        }); 
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const updateUser = (req, res) => {
    const { userId } = req.params;
    const { name, email, role, profile_img } = req.body;
  
    try{
        db.query("UPDATE user SET name = ?, email = ?, role = ?, profile_img = ? WHERE id = ?",
            [name, email, role, profile_img, userId], (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Database user query error." });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "User not found." });
                }

                return res.status(200).send({ message: "User updated successfully." });
            }
        );
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getUsers,
    addUser,
    deleteUser,
    updateUser
}