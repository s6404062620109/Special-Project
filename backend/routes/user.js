const express = require("express");
const db = require("./database");

const router = express.Router();

router.get("/getUsers", (req, res) => {
    db.query("SELECT id, email, name, role, profile_img FROM user", (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).send({ message: "Database user query error." });
        }

        return res.status(200).send({ result });
    });
});

module.exports = router;