const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
app.use(cookieParser());

// const allowedOrigins = [,
//   `http://${process.env.DEV_URL}:${process.env.FRONTEND_PORT}`,
//   `http://localhost:8081`,
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

app.use(cors({
  origin: (origin, callback) => {
    // allow requests from any browser origin by reflecting it
    // allow non-browser tools (no origin) as well
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));

/* authRoutes */
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

/* Courses */
const courseRoutes = require("./routes/courseRoutes");
app.use("/courses", courseRoutes);

/* Subject */
const subjectsRoutes = require("./routes/subjectsRoutes");
app.use("/subjects", subjectsRoutes);

/* Pre-Test */
const pretestRoutes = require("./routes/pretestRoutes");
app.use("/pretest", pretestRoutes);

/* Post-Test */
const posttestRoutes = require("./routes/posttestRoutes");
app.use("/posttest", posttestRoutes);

/* Enrollment */
const enrollRoutes = require("./routes/enrollRoutes");
app.use("/enroll", enrollRoutes);

/* Progress */
const progressRoutes = require("./routes/progressRoutes");
app.use("/progress", progressRoutes);

/* Lab on web */
const labsRoutes = require("./routes/labsRoutes");
app.use("/labs", labsRoutes);

/* Admin */
const admin = require("./routes/adminRoutes");
app.use("/admin", admin); 

/* Teacher */
const teachRoutes = require("./routes/teachRoutes");
app.use("/teacher", teachRoutes); 

/* Image */
const Img = require("./routes/imagerender");
app.use("/imgrender", Img);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
});