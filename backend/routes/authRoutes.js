const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/register", authController.register);

router.put("/register_password", authController.register_password);

router.post("/login", authController.login);

router.post("/logout", authController.logout);
  
router.get("/authorization/:email", authController.authorization);

router.post("/forgot_password", authController.forgot_password);
  
router.put("/reset_password", authController.reset_password);

router.get("/getVerifiedExpired/:email", authController.getVerifiedExpired);

router.put("/updateProfile/:id", authController.updateProfile);

module.exports = router;