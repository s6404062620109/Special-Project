const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("./database");

const router = express.Router();

router.use("/lab", express.static(path.join(__dirname, "../lab")));

router.get("/getLabFile/:questionId", (req, res) => {
    const { questionId } = req.params;
    const folderPath = path.join(__dirname, `../lab/q${questionId}/`);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading lab directory:", err);
            return res.status(500).json({ message: "Error retrieving lab files." });
        }

        res.status(200).json({ files });
    });
});


router.get("/renderLab/:questionId", (req, res) => {
    const { questionId } = req.params;
    const filePath = path.join(__dirname, `../lab/q${questionId}/index.html`);

    db.query(`SELECT content FROM answer WHERE questionId = ?`, [questionId], (error, result) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "No answer found for this question." });
        }

        console.log(result);
        const answerContent = result[0].content;

        fs.readFile(filePath, "utf8", (err, fileContent) => {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(404).json({ message: "File not found." });
            }

            const modifiedContent = fileContent.replace("<!-- INSERT ANSWER HERE -->", answerContent);

            res.setHeader("Content-Type", "text/html");
            res.send(modifiedContent);
        });
    });
});

module.exports = router;