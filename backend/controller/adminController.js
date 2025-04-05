const fs = require("fs");
const path = require("path"); 
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

module.exports = {
    getUsers,
}