const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("../database");

const getAll = (req, res) => {
    const courseId = req.params.courseId;

    try{
        db.query(`SELECT * FROM course WHERE id = ?`, [courseId], (err, courseResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database course query error" });
            }
            db.query(`SELECT * FROM subject WHERE courseId = ? `, [courseId], (err, subjectResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database subject query error" });
                }
        
                return res.status(200).json({ courseInfo: courseResult, subject: subjectResults });
            });
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getAll,
}