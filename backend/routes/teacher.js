const express = require("express");
const db = require("./database");

const router = express.Router();

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
    
            return res.status(200).send({ message: "Course deleted successfully."});
        });
    });
    
});

module.exports = router;