const express = require("express");
const db = require("../database");

const router = express.Router();

const getCourses = (req, res) => {
    try{
        db.query("SELECT * FROM course", (err, courses) => {
            if (err) {
              return res.status(500).send({ message: "Database course query error" });
            } 
            
            if (courses.length === 0) {
              return res.status(200).send([]);
            }
        
            const courseIds = courses.map(course => course.id);
        
            db.query("SELECT * FROM subject WHERE courseId IN (?)", [courseIds], (err, subjects) => {
              if (err) {
                return res.status(500).send({ message: "Database subject query error" });
              } 
        
              const filteredCourses = courses.filter(course => 
                subjects.some(subject => subject.courseId === course.id)
              );
        
              return res.status(200).send(filteredCourses);
            });
          }
        );

    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

const getEnrollmentCourses = (req, res) => {
    const { courseIds } = req.params;

    if (!courseIds) {
        return res.status(400).send("Course IDs are required");
    }

    const courseIdsArray = courseIds.split(',').map(id => parseInt(id));

    try{
        db.query("SELECT id, name, icon_id FROM course WHERE id IN (?)", [courseIdsArray], (err, results) => {
            if (err) {
                return res.status(500).send("Database query error");
            }
      
            return res.status(200).send(results);
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({ message: "Server error.", error });
    }
}

module.exports = {
    getCourses,
    getEnrollmentCourses
}