const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const { error } = require('console');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: 'Content-Type,Authorization',
}));

const db = mysql2.createConnection({
    user: "root",
    host: "db",
    port: 3306,
    password: "root",
    database: "SAT"
})

db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to MySQL database');
});

/* Authenticator */

app.post('/register', async (req, res) =>{
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
    }
    
    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database query error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO user (email, password, name, role, OTP) VALUES(?, ?, ?, ?, ?)",
                [email, hashedPassword, name, 'Student', '-'],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "Register Failed!!!" });
                    } else {
                        return res.status(201).json({ message: "Register Success!!!" });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password ) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) =>{
            if(err){
                return res.status(500).json({ message: "Database query error" });
            }

            if(result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            
            if(result.length > 0){
                const user = result[0];
                const isPasswordValid = await bcrypt.compare(password, user.Password);
                if (!isPasswordValid) {
                    return res.status(401).send({ message: "Invalid password" });
                }
                else{
                    const token = jwt.sign({ email: user.Email, name: user.Name }, 'authToken', { expiresIn: '1h' });
                    return res.status(201).send({ message: "Login Success" , token:token })
                }
            }
        })
});

app.post('/requestotp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ message: 'Email is required' });
    }

    db.query('SELECT * FROM user WHERE Email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send({ message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(400).send({ message: 'Email not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpexp = new Date(Date.now() + 15 * 60 * 1000); 

        db.query('UPDATE user SET OTP = ?, OTP_EXP = ? WHERE Email = ?', [otp, otpexp, email], (error) => {
            if (error) {
                console.error('Error updating OTP in database:', error);
                return res.status(500).send({ message: 'Error updating OTP in database' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 's6404062620109@email.kmutnb.ac.th',
                  pass: 'umhv hkky xduh btac'
                }
            });

            const mailOptions = {
                from: 's6404062620109@email.kmutnb.ac.th',
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP code is: ${otp}`
            };        

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: 'Error sending OTP' });
                } else {
                    console.log('Email sent: ' + info.response);
                    const token = jwt.sign({ email: email }, 'resetToken', { expiresIn: '15m' });
                    res.status(200).send({ message: 'OTP sent successfully', token: token });
                }
            });
        });
    });

    
});

app.post('/verifyotp', (req, res) => {
    const { email, otp } = req.body; 
    db.query('SELECT OTP, OTP_EXP FROM user WHERE Email = ?', [email], (error, result) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send({ message: 'Database query error' });
        }

        if (result.length === 0) {
            return res.status(400).send({ message: 'Email not found' });
        }

        const storedOtp = result[0].OTP;
        const otpExp = result[0].OTP_EXP;
        const currentTime = new Date();

        if (currentTime > otpExp) {
            return res.status(400).send({ message: 'OTP has expired' });
        }
        
        if (storedOtp !== otp) {
            return res.status(400).send({ message: 'Invalid OTP' });
        }

        return res.status(200).send({ message: 'OTP verified successfully' });
    });
});

app.post('/setnewpassword', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password ) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('UPDATE user SET Password = ? WHERE Email = ?', [hashedPassword, email], (error) => {
        if (error) {
            console.error('Error updating Password in database:', error);
            return res.status(500).send({ message: 'Error updating Password in database' });
        }
        else{
            return res.status(200).send({ message: 'Update Password Success!' });
        }
    });
});

/* Authenticator */ 

/* Courses */

app.get('/getCourses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) {
            res.status(500).send('Database query error');
            return;
        }
        res.json(results);
    });
});

app.get('/updateCourses/:email', (req, res) => {
    const email = req.params.email;

    const query = ` SELECT history.*, subject.\`Course-ID\`
        FROM history 
        JOIN subject ON history.\`Subject-ID\` = subject.SubjectID
        WHERE \`User-Email\` = ? `;

    db.query( query, [email], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database query error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No courses found for the user"});
            }
            
            res.json(results);
        });
});

app.get('/getAllSubject/:courseId', (req, res) => {
    const courseId = req.params.courseId;

    db.query( `SELECT * FROM courses WHERE CourseID = ?`, [courseId], (err, courseResult) =>{
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database courses query error" });
        }
        else{

            db.query( `SELECT * FROM subject WHERE \`Course-ID\` = ? `, [courseId], (err, subjectResults) => {
                if(err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database subject query error" });
                }
                else{
                    return res.status(200).json({ courseInfo: courseResult, subject: subjectResults })
                }
            });

        }

    });
});

app.get('/getSubject/:courseId/:subjectId', (req, res) => {
    const courseId = req.params.courseId;
    const subjectId = req.params.subjectId
    db.query(`SELECT * FROM subject WHERE SubjectID = ? AND \`course-ID\` = ? `, [subjectId, courseId], (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: "Database subject query error" });
        }
        else{
            return res.status(200).json(result);
        }
    });
});

/* Courses */

/* Test */

app.get('/getPretest/:courseId', (req, res) => {
    const courseId = req.params.courseId;

    db.query('SELECT SubjectID FROM subject WHERE \`Course-ID\` = ?', [courseId], (err, result) => {
        if(err) {
            console.log(err);
            return res.status(500).json({ message: "Database subject query error" });
        }
        
        else{
            const subjectList = result.map(item => item.SubjectID);
            
            db.query(`SELECT * FROM question WHERE \`Subject-ID\` in (?) and Type = ?`, [subjectList, 'pretest'], (err, questionresults) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({ message: "Database question query error" });
                }

                else{
                    const shuffledQuestions = questionresults.sort(() => 0.5 - Math.random());
                    const randomQuestions = shuffledQuestions.slice(0, 10);

                    const questionIdList = randomQuestions.map(item => item.QuestionID);

                    db.query(`SELECT AnswerID, result, QuestionID FROM answer WHERE QuestionID in (?)`, [questionIdList], (err, ansresults) =>{
                        if(err) {
                            console.log(err);
                            return res.status(500).json({ message: "Database answer query error" });
                        }

                        else{

                            return res.status(200).json({ Qustions: randomQuestions, Choices: ansresults });
                        }
                    });
                }
            });
        }
    });
});

app.post('/submitPretest', (req, res) => {
    const { payload, courseid, email } = req.body;
    const userAnswer = payload.answers;
    const userAnswerIds = Object.values(userAnswer);
    const userQuestionIds = Object.keys(userAnswer);

    const query = `SELECT AnswerID, Type, QuestionID FROM answer WHERE AnswerID IN (${userAnswerIds.join(',')}) AND QuestionID IN (${userQuestionIds.join(',')})`;

    db.query(query, (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).json({ message: "Database answer query error" });
        }

        else{
            let score = 0;
            result.map(item => {
                if(item.Type === 'a'){
                    score += 1;
                }
            });
            
            db.query(`SELECT * FROM subject WHERE \`Course-ID\` = ?`, [courseid], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database subject query error" });
                }

                else{
                    let subjectId = result[0].SubjectID;

                    db.query(`INSERT INTO history ( \`User-Email\`, \`Subject-ID\`, PracticeStatus, Status, Prescore ) VALUES( ?, ?, ?, ?, ? )`,
                        [email, subjectId, 'Failed', 'Doing', score], (postErr, postResult) => {
                            if (postErr){
                                console.log(postErr);
                                return res.status(500).json({ message: 'Failed post history.' })
                            }
                            else{
                                return res.status(200).json({ message: 'Success post history', subjectId });
                            }
                        }
                    );
                }
            });
        }
    });
});

/* Post */

/* Lab */

app.post('/createLinuxContainer', (req, res) => {
    const questionID = req.body.questionID;
    const containerName = `linux_container_${Date.now()}`;
    const createContainerCmd = `docker run -d -P -e USER=root -e PASSWORD=password --name ${containerName} dorowu/ubuntu-desktop-lxde-vnc`;

    // Step 1: Create the container
    exec(createContainerCmd, (err, stdout, stderr) => {
        if (err) {
            console.error('Error creating container:', err);
            return res.status(500).json({ message: 'Failed to create container' });
        }

        // Step 2: Query the database for the answer
        db.query(`SELECT result FROM answer WHERE QuestionID in (?) AND Type = ?`, [questionID, 'a'], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Database answer query error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'No answer found' });
            } else {
                const answerResult = result[0].result;

                const sourceDirPath = path.join(__dirname, `../lab/q${questionID}`);
                const tempDirPath = `/tmp/lab_${questionID}_${Date.now()}`;

                // Step 3: Read files from the directory and copy them to the container
                fs.readdir(sourceDirPath, (err, files) => {
                    if (err) {
                        console.error('Error reading directory:', err);
                        return res.status(500).json({ message: 'Failed to read directory' });
                    }

                    let fileCopyPromises = files.map(file => {
                        const sourceFilePath = path.join(sourceDirPath, file);
                        return new Promise((resolve, reject) => {
                            exec(`docker cp ${sourceFilePath} ${containerName}:/root/${file}`, (err) => {
                                if (err) {
                                    reject(`Failed to copy file ${file}`);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });

                    // Step 4: Wait until all files are copied, then modify and copy the answerResult to HTML
                    Promise.all(fileCopyPromises)
                        .then(() => {
                            const indexFilePath = path.join(sourceDirPath, 'mail.html');
                            fs.readFile(indexFilePath, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading index.html:', err);
                                    return res.status(500).json({ message: 'Failed to read index.html' });
                                }

                                // Replace placeholder with answer result
                                const modifiedHtml = data.replace('<!-- INSERT ANSWER HERE -->', encodeURIComponent(answerResult));

                                // Write the modified HTML to a temporary file
                                const tempHtmlFilePath = `/tmp/index_${questionID}_${Date.now()}.html`;
                                fs.writeFileSync(tempHtmlFilePath, modifiedHtml, { encoding: 'utf8' });

                                // Step 5: Copy the modified HTML file to the container
                                exec(`docker cp ${tempHtmlFilePath} ${containerName}:/root/mail.html`, (err) => {
                                    if (err) {
                                        console.error('Error copying HTML file into container:', err);
                                        return res.status(500).json({ message: 'Failed to copy HTML file into container' });
                                    }

                                    // Step 6: Retrieve the IP and port of the container
                                    exec(`docker inspect -f '{{range .NetworkSettings.Ports}}{{.}}{{end}}' ${containerName}`, (err, portOutput) => {
                                        if (err) {
                                            console.error('Error getting container port:', err);
                                            return res.status(500).json({ message: 'Failed to retrieve container port' });
                                        }

                                        const portMatch = portOutput.match(/\d{4,5}/);
                                        const port = portMatch ? portMatch[0] : null;

                                        exec(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerName}`, (err, ipOutput) => {
                                            if (err) {
                                                console.error('Error getting container IP:', err);
                                                return res.status(500).json({ message: 'Failed to retrieve container IP' });
                                            }

                                            // Return the IP and port of the container
                                            return res.status(200).json({ ip: ipOutput.trim(), port: port });
                                        });
                                    });
                                });
                            });
                        })
                        .catch(copyError => {
                            console.error(copyError);
                            return res.status(500).json({ message: 'Failed to copy files into container' });
                        });
                });
            }
        });
    });
});

app.get('/getLabquestion/:subjectId', (req, res) => {
    const subjectId = req.params.subjectId;
    
    db.query(`SELECT * FROM question WHERE Type = ? AND \`Subject-ID\` = ? `, ['lab', subjectId], (err, questionResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database question query error" });
        }

        if (questionResult.length === 0) {
            return res.status(404).json({ message: "No lab questions found for this subject" });
        }

        else{
            return res.status(200).json({ questionlist: questionResult});
        }
    });
});

app.post('/submitLabanswer', (req, res) => {
    const answer = req.body;
    const QuestionIds = Object.keys(answer);
    const answerResults = Object.values(answer);

    db.query('SELECT * FROM answer WHERE QuestionID in (?)', [QuestionIds], (error, result) => {
        if(error){
            console.log(error);
            return res.status(500).json({ message: "Database answer query error" });
        }

        else{
            let score = 0;
            result.map((item, index) => { 
                if(item.result ===  answerResults[index]){
                    score++;
                }
            });
            if(score===answerResults.length){
                return res.status(200).json({ message: "You Pass!" });
            }
            else{
                return res.status(200).json({ message: "You Failed!" });
            }
        }
    });
});

/* Lab */

const port = 3001
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})
