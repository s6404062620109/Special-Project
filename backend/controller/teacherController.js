const fs = require("fs");
const path = require("path");
const multer = require('multer'); 
const db = require("../database");

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
        return res.status(500).send({ message: "Database user query error." });
    }
}

module.exports = {
    getMyCourses
}