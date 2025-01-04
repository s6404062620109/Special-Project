const express = require("express");
const path = require("path");
const router = express.Router();

router.use("/courses", express.static(path.join(__dirname, "../courses")));

router.get("/getIcon/:courseId/:imgId", (req, res) => {
    const { courseId, imgId } = req.params;
    const imageUrl = `/imgrender/courses/c${courseId}/${imgId}`;
    res.status(200).json({ url: imageUrl });
});

router.get("/getContentImage/:courseId/:subjectId/:imgId", (req, res) => {
    const { courseId, subjectId, imgId } = req.params;
    const imageUrl = `/imgrender/courses/c${courseId}/s${subjectId}/${imgId}`;
    res.status(200).json({ url: imageUrl });
});

module.exports = router;
