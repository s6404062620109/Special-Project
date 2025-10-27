import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import {
  Avatar,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";

import style from "./css/coursedetails.module.css";
import SubjectData from "./SubjectData";
import TestDialog from "./testDialog";

const renderTestSection = (
  announcement,
  {
    setShowTestList,
    pretestProgress,
    posttestProgress,
    labProgress,
    preTestScore,
    postTestScore,
    labScore,
  }
) => {
  if (announcement === 0) {
    return (
      <Typography variant="h6">ยังไม่มีการประกาศคะแนน</Typography>
    );
  }
  
  const pretestProgressCompleted =
    pretestProgress.length > 0 &&
    pretestProgress.every((item) => item.is_completed === 1);
  const posttestProgressCompleted =
    posttestProgress.length > 0 &&
    posttestProgress.every((item) => item.is_completed === 1);
  const labProgressCompleted =
    labProgress.length > 0 &&
    labProgress.every((item) => item.is_completed === 1);

  if (!pretestProgressCompleted && !posttestProgressCompleted && !labProgressCompleted) {
    return (
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: "center", 
          margin: "16px 0" 
        }}
      >
        ยังไม่พบการทำแบบทดสอบ
      </Typography>
    );
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: "100%", 
          margin: "16px auto" 
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f7f3f3ff" }}>
              <TableCell sx={{ fontWeight: "bold" }}>
                <Typography variant="h6">แบบทดสอบ</Typography>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                <Typography variant="h6">คะแนน</Typography>
              </TableCell>
              { announcement === 3 && (
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  <Typography variant="h6">รายละเอียด</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {(announcement === 1 || announcement === 2 || announcement === 3) && pretestProgressCompleted && (
              <TableRow>
                <TableCell>
                  <Typography variant="body1">ก่อนเรียน</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1">{preTestScore} / {pretestProgress.length}</Typography>
                </TableCell>
                {announcement === 3 && (
                  <TableCell align="center">
                    <IconButton
                      onClick={() => setShowTestList({ mode: "pre", state: true })}
                      color="primary"
                      aria-label="view pre-test details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            )}
            {(announcement === 2 || announcement === 3) && labProgressCompleted && (
              <TableRow>
                <TableCell>
                  <Typography variant="body1">ระหว่างเรียน</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1">{labScore} / {labProgress.length}</Typography>
                </TableCell>
                {announcement === 3 && (
                  <TableCell align="center">
                    <IconButton
                      onClick={() => setShowTestList({ mode: "lab", state: true })}
                      color="primary"
                      aria-label="view lab details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            )}
            {(announcement === 2 || announcement === 3) && posttestProgressCompleted && (
              <TableRow>
                <TableCell>
                  <Typography variant="body1">หลังเรียน</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1">{postTestScore} / {posttestProgress.length}</Typography>
                </TableCell>
                {announcement === 3 && (
                  <TableCell align="center">
                    <IconButton
                      onClick={() => setShowTestList({ mode: "post", state: true })}
                      color="primary"
                      aria-label="view post-test details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

function CancelEnrollmentDialog({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const { courseId, enrollmentId } = useParams();

  const handleConfirm = async () => {
    if(enrollmentId === null || courseId === null){
      return;
    }
    
    try{
      const response = await backend.put(`/enroll/enrollCancel/${enrollmentId}/${courseId}`, { withCredentials: true });

      if(response.status === 200){

      }
    } catch(error){
      console.log(error);
    }

    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>ยืนยันการยกเลิกการลงทะเบียน</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการลงทะเบียนเรียนในครั้งนี้? การกระทำนี้จะทำให้การเรียนปัจจุบันสิ้นสุดลงทันที
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="reason"
          label="เหตุผลในการยกเลิก (ไม่บังคับ)"
          type="text"
          fullWidth
          variant="standard"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>ยกเลิก</Button>
        <Button onClick={handleConfirm} color="error">
          ยืนยันการยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExpiredDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>คอร์สหมดอายุ</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ระยะเวลาการเรียนของคุณในคอร์สนี้ได้สิ้นสุดลงแล้ว ระบบจะทำการรีเฟรชหน้าเพื่ออัปเดตสถานะของคุณ
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          ตกลง
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CourseDetail() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [questionList, setQuestionList] = useState({
    pretestList: [],
    posttestList: [],
    labList: [],
  });
  const [subjectList, setSubjectList] = useState([]);
  const [courseInfo, setCourseInfo] = useState({
    id: "",
    name: "",
    icon: "",
    createat: null,
    updateat: null,
    expires_at: null,
    announcement: 0,
  });
  const [count, setCount] = useState({
    countEnrollments: 0,
    countPosttestComplete: 0,
  });
  const [teacherInfo, setTeacherInfo] = useState({
    sex: "",
    name: "",
    surname: "",
    email: "",
    profile_img: null,
  });
  const [history, setHistory] = useState([]);
  const [labProgress, setLabProgress] = useState([]);
  const [pretestProgress, setPretestProgress] = useState([]);
  const [posttestProgress, setPosttestProgress] = useState([]);
  const [labAnswers, setLabAnswers] = useState([]);
  const [pretestAnswers, setPretestAnswers] = useState([]);
  const [posttestAnswers, setPosttestAnswers] = useState([]);
  const [showTestList, setShowTestList] = useState({
    mode: "",
    state: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [expiredDialogOpen, setExpiredDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCourseInfo = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubjectStudent/${courseId}`, { withCredentials: true });

      if (response.status === 200) {
        let responseCourse = response.data.courseInfo;
        let teacherInfo = response.data.teacherInfo;

        setCourseInfo({
          id: responseCourse.id,
          name: responseCourse.name,
          icon: responseCourse.icon,
          createat: responseCourse.createat,
          updateat: responseCourse.updateat,
          announcement: responseCourse.announce_state,
        });

        setTeacherInfo({
          sex: teacherInfo.sex,
          name: teacherInfo.name,
          surname: teacherInfo.surname,
          email: teacherInfo.email,
          profile_img: teacherInfo.profile_img,
        });

        setCount({
          countEnrollments: response.data.countEnrollments,
          countPosttestComplete: response.data.countPosttestComplete,
        });

        setSubjectList(response.data.subject);
      }
    } catch (err) {
      console.log(err);
      if(err.response.status === 404 && err.response.data.message === "Course not found"){
        navigate('/courses')
      }
    }
  };

  const fetchQuestionList = async () => {
    try {
      const pretestResponse = await backend.get(
        `/pretest/getPretest/${enrollmentId}/${courseId}`,
        {
          withCredentials: true,
        }
      );

      const posttestResponse = await backend.get(
        `/posttest/getPosttest/${enrollmentId}/${courseId}`,
        {
          withCredentials: true,
        }
      );

      const labResponse = await backend.get(
        `/labs/getAllLabQuestion/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (pretestResponse.status === 200 && posttestResponse.status === 200 && labResponse.status === 200) {
        setQuestionList({
          pretestList: pretestResponse.data.questions,
          posttestList: posttestResponse.data.questions,
          labList: labResponse.data.questionFormat,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const findAndNavigateToLatestEnrollment = async () => {
    try {
      const response = await backend.get(`/enroll/getLatestEnrollment/${userData.id}/${courseId}`,
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.latestEnrollmentId) {
        navigate(`/course/${courseId}/${response.data.latestEnrollmentId}`, {
          replace: true,
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate(`/course/${courseId}/null`, { replace: true });
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await backend.get(`/enroll/checkCourseEnroll/${userData.id}/${courseId}/${enrollmentId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setHistory(response.data.results);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        findAndNavigateToLatestEnrollment();
      } else {
        console.log(error);
      }
    }
  };

  const fethProgress = async () => {
    try {
      const response = await backend.get(`/progress/checkCourseProgress/${history[0].id}/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setPretestProgress(response.data.pretest_progress);
        setPosttestProgress(response.data.posttest_progress);
        setLabProgress(response.data.lab_progress);
      }
    } catch (error) {
      console.log(error);
      // if (error.response.status === 403 || error.response.data.message === "คอร์สนี้หมดอายุการเรียนแล้ว") {
      //   setExpiredDialogOpen(true);
      // } else {
      //   setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการเข้าเรียนต่อ', severity: 'error' });
      // }
    }
  };

  const fetchProgressAnswers = async () => {
    try {
      const response = await backend.get(`/progress/checkProgressAnswers/${courseId}/${enrollmentId}/${showTestList.mode}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        if (showTestList.mode === "pre") {
          setPretestAnswers(response.data.answers);
        } else if (showTestList.mode === "post") {
          setPosttestAnswers(response.data.answers);
        } else if (showTestList.mode === "lab") {
          setLabAnswers(response.data.answers);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLatestProgress = async () => {
    try {
      const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        navigate(`/course/${courseId}/${response.data.inProgress}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 403 && error.response.data.message === "คอร์สนี้หมดอายุการเรียนแล้ว") {
        setExpiredDialogOpen(true);
        return;
      } else {
        setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการเข้าเรียนต่อ', severity: 'error' });
      }
    }
  };

  const enrollCourse = async () => {
    try {
      const response = await backend.post(`/enroll/enrollCourse`,
        {
          courseId: courseId,
          userId: userData.id,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate(`/course/${courseId}/pretest/${response.data.enrollmentId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCancelEnrollment = async (reason) => {

    if (!enrollmentId || enrollmentId === 'null' || !courseId) {
      console.error("โปรดระบุ enrollmentId และ courseId.");
      return;
    }

    try {
      const response = await backend.put(`/enroll/enrollCancel/${enrollmentId}/${courseId}`, 
        { reason },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        setTimeout(() => {
          setCancelDialogOpen(false);
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to cancel enrollment:", error);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการยกเลิก', severity: 'error' });
    }
  };

  useEffect(() => {
    if (showTestList.mode === "") {
      return;
    }
    fetchProgressAnswers();
  }, [courseId, enrollmentId, showTestList.mode]);

  useEffect(() => {
    fetchQuestionList();
  }, [enrollmentId, courseId]);

  useEffect(() => {
    fetchCourseInfo();
    if (enrollmentId) {
      fetchHistory();
    }
  }, [courseId, userData.id, enrollmentId]);

  useEffect(() => {
    if (history.length > 0 && enrollmentId === "null") {
      navigate(`/course/${courseId}/${history[0].id}`, { replace: true });
    }
  }, [history, enrollmentId, courseId, navigate]);

  useEffect(() => {
    if (
      enrollmentId &&
      enrollmentId !== "null" &&
      history.length > 0 
    ) {
      fethProgress();
    }
  }, [history, enrollmentId]);


  const isPreTestCompleted =
    pretestProgress.length > 0 && pretestProgress.every((item) => item.is_completed === 1);
  const preTestScore = isPreTestCompleted
    ? pretestProgress.reduce((acc, item) => acc + item.score, 0)
    : null;

  const isPostTestCompleted =
    posttestProgress.length > 0 &&
    posttestProgress.every((item) => item.is_completed === 1);
  const postTestScore = isPostTestCompleted
    ? posttestProgress.reduce((acc, item) => acc + item.score, 0)
    : null;

  const isLabCompleted =
    labProgress.length > 0 &&
    labProgress.every((item) => item.is_completed === 1);
  
  const labScore = labProgress.reduce((acc, item) => acc + item.score, 0);

  const mergedPretestData = React.useMemo(() => {
    if (
      !questionList.pretestList.length ||
      !pretestProgress.length ||
      !pretestAnswers.length
    )
      return [];

    // สร้าง Map สำหรับ progress และ answers เพื่อ lookup เร็วขึ้น
    const progressMap = new Map(pretestProgress.map((p) => [p.questionId, p]));
    const answerMap = new Map(pretestAnswers.map((a) => [a.progressId, a]));

    // รวมข้อมูล
    return questionList.pretestList.map((q) => {
      const progress = progressMap.get(q.qId);
      const answer = progress ? answerMap.get(progress.id) : null;

      return {
        ...q, // เอา content, choice จาก question เดิม
        user_answer: answer ? answer.user_answer : null,
        is_correct: answer ? !!answer.score : false,
        score: answer ? answer.score : 0,
      };
    });
  }, [questionList.pretestList, pretestProgress, pretestAnswers]);

  const mergedPosttestData = React.useMemo(() => {
    if (
      !questionList.posttestList.length ||
      !posttestProgress.length ||
      !posttestAnswers.length
    )
      return [];

    // สร้าง Map สำหรับ progress และ answers เพื่อ lookup เร็วขึ้น
    const progressMap = new Map(posttestProgress.map((p) => [p.questionId, p]));
    const answerMap = new Map(posttestAnswers.map((a) => [a.progressId, a]));

    // รวมข้อมูล
    return questionList.posttestList.map((q) => {
      const progress = progressMap.get(q.qId);
      const answer = progress ? answerMap.get(progress.id) : null;

      return {
        ...q, // เอา content, choice จาก question เดิม
        user_answer: answer ? answer.user_answer : null,
        is_correct: answer ? !!answer.score : false,
        score: answer ? answer.score : 0,
      };
    });
  }, [questionList.posttestList, posttestProgress, posttestAnswers]);

  const mergedLabData = React.useMemo(() => {
    if (
      !questionList?.labList?.length ||
      !labProgress?.length ||
      !labAnswers?.length
    )
      return [];

    // 🔹 สร้าง Map: progressId => array of answers
    const progressMap = new Map(labProgress.map((p) => [p.questionId, p]));
    const answerMap = new Map();
    labAnswers.forEach((a) => {
      if (!answerMap.has(a.progressId)) answerMap.set(a.progressId, []);
      answerMap.get(a.progressId).push(a);
    });

    return questionList.labList.map((q) => {
      const progress = progressMap.get(q.id);
      const answers = progress ? answerMap.get(progress.id) || [] : [];

      // 🔹 สร้าง user_answer
      let userAnswer;
      if (q.type === 6) {
        // type 6 → รวมหลายคำตอบเป็น array
        userAnswer = answers.map((a) => a.user_answer);
      } 
      else {
        // type 3, 4, 5 → เอา record แรก
        userAnswer = answers.length ? answers[0].user_answer : null;
      }

      return {
        id: q.id,
        type: q.type,
        content: q.content,
        img: q.img || null,
        htmlFile: q.htmlFile || null,
        choice: q.choice || [],

        is_completed: progress ? progress.is_completed : 0,
        score: answers.reduce((sum, a) => sum + (a.score || 0), 0),
        user_answer: userAnswer,
        is_correct: answers.some((a) => a.score > 0),
      };
    });
  }, [questionList.labList, labProgress, labAnswers]);

  const tabletQuery = useMediaQuery("(max-width:720px)")

  return (
    <div className={style.container}>
      <div className={style.head}>
        <div className={style["headWrap"]}>
          {courseInfo.icon ? (
            <img alt="Course Icon Image" src={courseInfo.icon} />
          ) : (
            <Avatar sx={{ width: 50, height: 50, marginRight: "10px", bgcolor: "#1976d2" }}>
              <SchoolIcon />
            </Avatar>
          )}

          <Stack
            gap={1}
            sx={{
              alignItems: "center",
              flexDirection: "column",
              justifyContent: { xs: "center", sm: "space-between" },
            }}
          >
            <p>{courseInfo.name}</p>

            <Typography variant="subtitle1" color="text.secondary">
              ️ผู้สอน: ️
              {(() => {
                const isEnglish = /^[A-Za-z\s]+$/.test(
                  teacherInfo.name + " " + teacherInfo.surname
                );
                if (isEnglish) {
                  if (teacherInfo.sex === "m")
                    return `Mr. ${teacherInfo.name} ${teacherInfo.surname}`;
                  if (teacherInfo.sex === "f")
                    return `Mrs. ${teacherInfo.name} ${teacherInfo.surname}`;
                  return `Sir. ${teacherInfo.name} ${teacherInfo.surname}`;
                }
                if (teacherInfo.sex === "m")
                  return `นาย${teacherInfo.name} ${teacherInfo.surname}`;
                if (teacherInfo.sex === "f")
                  return `นาง${teacherInfo.name} ${teacherInfo.surname}`;
                if (teacherInfo.sex === "n")
                  return `คุณ${teacherInfo.name} ${teacherInfo.surname}`;
                return teacherInfo.name && teacherInfo.surname
                  ? `${teacherInfo.name} ${teacherInfo.surname}`
                  : "ไม่ทราบชื่ออาจารย์";
              })()}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              อัพเดตล่าสุด:{" "}
              {courseInfo.updateat
                ? new Date(courseInfo.updateat).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Bangkok",
                  })
                : courseInfo.createat
                ? new Date(courseInfo.createat).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Bangkok",
                  })
                : "-"}
            </Typography>
          </Stack>
        </div>

        {userData.id &&
          (history.length === 0 ||
            (history.length > 0 && history[0].posttest_complete !== 1)) && (
          <Stack
            justifyContent="center"
            alignItems="center"
            gap={2}
            sx={{
              width: { xs: "100%", sm: "80%", md: "60%" },
              margin: "auto",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {history.length === 0 && (
              <Button
                variant="contained"
                sx={{ 
                  width: { xs: "100%", md: "50%" }
                }}
                onClick={enrollCourse}
              >
                สมัครเรียน
              </Button>
            )}

            {history.length > 0 && history[0].posttest_complete === -1 && (
              <Button
                variant="contained"
                sx={{ 
                  width: "100%",
                  bgcolor: "warning.main", 
                }}
                onClick={enrollCourse}
              >
                สมัครเรียนใหม่
              </Button>
            )}

            {history.length > 0 && history[0].posttest_complete === 0 && (
              <Stack
                sx={{
                  flexDirection: "column",
                  gap: 2,
                  width: { xs: "100%", md: "50%"}
                }}
              >
                <Button
                  variant="contained"
                  onClick={fetchLatestProgress}
                  sx={{ width: "100%" }}
                >
                  เข้าเรียนต่อ
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  sx={{ width: "100%" }}
                >
                  ยกเลิกการเรียน
                </Button>
              </Stack>
            )}
          </Stack>
        )}

      </div>

      <Tabs 
        value="detail"
        sx={{
          "& .MuiTabs-list": {
            justifyContent: { xs: "center", md: "flex-start" },
          },
        }}
      >
        <Tab 
          value="detail" 
          label="รายละเอียดคอร์ส" 
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "1rem" },
            fontWeight: "600" 
          }} 
        />
      </Tabs>

      <>
        {userData.id && (
          <Stack
            sx={{
              gap: 2,
              width: { xs: "100%", sm: "80%", md: "60%" },
              margin: "16px auto auto auto",
            }}
          >
            <>
              {userData.id &&
                enrollmentId !== "null" &&
                history.length > 0 &&
                history[0].posttest_complete === -1 && (
                  <Paper
                    elevation={2}
                    sx={{
                      width: "100%",
                      border: "1px solid",
                      borderColor: "error.main",
                    }}
                  >
                    <Typography
                      variant="h6"
                      align="center"
                      color="error.main"
                      gutterBottom
                    >
                      คุณไม่ผ่านเกณฑ์ของคอร์สนี้
                    </Typography>
                    <List dense>
                      {postTestScore < preTestScore && (
                        <ListItem>
                          <ListItemIcon><ClearIcon color="error" /></ListItemIcon>
                          <ListItemText primary="คะแนนแบบทดสอบหลังเรียนน้อยกว่าคะแนนแบบทดสอบก่อนเรียน" />
                        </ListItem>
                      )}
                      {labProgress.length > 0 && (labScore / labProgress.length) * 100 < 60 && (
                        <ListItem>
                          <ListItemIcon><ClearIcon color="error" /></ListItemIcon>
                          <ListItemText primary="คะแนนปฏิบัติการ (Lab) ไม่ถึง 60%" />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
              )}

              {userData.id &&
              enrollmentId !== "null" &&
              history.length > 0 &&
              history[0].posttest_complete === 1 && (
                <Typography variant="subtitle1" align="center" color="green">
                  คุณผ่านการเรียนรู้ของคอร์สนี้แล้ว
                  <CheckIcon color="success" sx={{ ml: 1, mb: -0.5 }} />
                </Typography>
              )}
            </>
            {userData.id && (history.length === 0 || (history.length > 0 && history[0].posttest_complete === 0)) && (
              <Paper
                elevation={2}
                sx={{
                  width: "100%",
                  border: "1px solid",
                  borderColor: "info.main",
                }}
              >
                <Typography variant="h6" align="center" color="info.main" gutterBottom>
                  เกณฑ์การผ่านคอร์สเรียน
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="1. คะแนนแบบทดสอบหลังเรียนต้องไม่น้อยกว่าคะแนนแบบทดสอบก่อนเรียน" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2. คะแนนปฏิบัติการ (Lab) ต้องไม่ต่ำกว่า 60%" />
                  </ListItem>
                </List>
              </Paper>
            )}
            
            {history.length > 0 && (
              <Stack
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: { xs: "center", sm: "space-between" },
                  alignItems: { xs: "center", sm: "flex-start" },
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" color="text.secondary">
                  เริ่มเรียน: {" "}
                  {history[0].startat
                    ? new Date(history[0].startat).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Bangkok",
                      })
                  : "-"}
                </Typography>

                {history[0].endat !== null ? (
                  <Typography variant="subtitle1" color="text.secondary">
                  จบการเรียน: {" "}
                    {history[0].endat
                    ? new Date(history[0].endat).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Bangkok",
                      })
                    : "-"}
                </Typography>
                ) : (
                  <Typography variant="subtitle1" color="text.secondary">
                  ควรเรียนจบก่อน: {" "}
                    {history[0].expires_at
                    ? new Date(history[0].expires_at).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Bangkok",
                      })
                    : "-"}
                </Typography>
                )}
              </Stack>
            )}
            
            {(history.length > 0 && history[0].posttest_complete !== -1) && (
              <Stack
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: { xs: "center", sm: "space-between" },
                  alignItems: { xs: "center", sm: "flex-start" },
                  gap: 2,
                }}
              >
                
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  sx={{
                    cursor: !isPreTestCompleted ? "pointer" : "default",
                    color: !isPreTestCompleted ? "#1976d2" : "#979797",
                    transition: "color 0.3s",
                    "&:hover": {
                      color: !isPreTestCompleted ? "#115293" : "#979797",
                      borderBottom: !isPreTestCompleted
                        ? "1px solid #000"
                        : "none",
                    },
                  }}
                  onClick={() => {
                    if (!isPreTestCompleted) {
                      navigate(`/course/${courseId}/pretest/${enrollmentId}`);
                    }
                  }}
                >
                  {isPreTestCompleted ? (
                    <Typography variant="h6" color="success">
                      แบบทดสอบก่อนเรียน
                    </Typography>
                  ) : (
                    <Typography variant="h6">แบบทดสอบก่อนเรียน</Typography>
                  )}
                  {isPreTestCompleted ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ClearIcon color="error" />
                  )}
                </Stack>

                {/* Posttest Section */}
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  sx={{
                    cursor:
                      !isPostTestCompleted && isPreTestCompleted && isLabCompleted
                        ? "pointer"
                        : "default",
                    color:
                      !isPostTestCompleted && isPreTestCompleted && isLabCompleted
                        ? "#1976d2"
                        : "#979797",
                    transition: "color 0.3s",
                    "&:hover": {
                      color:
                        !isPostTestCompleted &&
                        isPreTestCompleted &&
                        isLabCompleted
                          ? "#115293"
                          : "#979797",
                      borderBottom:
                        !isPostTestCompleted &&
                        isPreTestCompleted &&
                        isLabCompleted
                          ? "1px solid #000"
                          : "none",
                    },
                  }}
                  onClick={() => {
                    if (
                      !isPostTestCompleted &&
                      isPreTestCompleted &&
                      isLabCompleted
                    ) {
                      navigate(`/course/${courseId}/posttest/${enrollmentId}`);
                    }
                  }}
                >
                  {isPostTestCompleted ? (
                    <Typography variant="h6" color="success">
                      แบบทดสอบหลังเรียน
                    </Typography>
                  ) : (
                    <Typography variant="h6">แบบทดสอบหลังเรียน</Typography>
                  )}
                  {isPostTestCompleted ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ClearIcon
                      color={
                        !isPostTestCompleted &&
                        isPreTestCompleted &&
                        isLabCompleted
                          ? "error"
                          : "inherit"
                      }
                    />
                  )}
                </Stack>
              </Stack>
            )}
            
          </Stack>
        )}

        <div className={style.content}>
          <table>
            <thead>
              <tr>
                <th>
                  <p>บทเรียน</p>
                </th>
                {userData.id && (
                  <th>
                    <p>{tabletQuery ? "ปฏิบัติการทดสอบ" : "สถานะการทำปฏิบัติการทดสอบ"}</p>
                  </th>
                )}
                
              </tr>
            </thead>

            {subjectList.length > 0 && labProgress && (
              <tbody>
                {subjectList.map((subject, index) => (
                  <SubjectData
                    key={index}
                    id={subject.id}
                    name={subject.name}
                    courseId={subject.courseId}
                    labProgress={labProgress}
                    enrollmentId={enrollmentId}
                    setSnackbar={setSnackbar}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>

        <Stack
          justifyContent="space-evenly"
          gap={3}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "space-evenly" },
            margin: "16px auto",
          }}
        >
          <Typography variant="h6">
            จำนวนการลงทะเบียน {count.countEnrollments} ครั้ง
          </Typography>

          <Typography variant="h6">
            จำนวนผู้เรียนที่ผ่านแล้ว {count.countPosttestComplete} คน
          </Typography>
        </Stack>
      </>

      <Tabs 
        value="test"
        sx={{
          "& .MuiTabs-list": {
            justifyContent: { xs: "center", md: "flex-start" },
          },
        }}
      >
        <Tab 
          value="test" 
          label="ประวัติการเรียน" 
          sx={{ 
            fontSize: { xs: "0.8rem", sm: "1rem" },
            fontWeight: "600" 
          }} 
        />
      </Tabs>

      <>
        {userData.id &&
          pretestProgress.length > 0 &&
          posttestProgress.length > 0 && (
            <div className={style.testSection}>
              {renderTestSection(courseInfo.announcement, {
                setShowTestList,
                pretestProgress,
                posttestProgress,
                preTestScore,
                postTestScore,
                labProgress,
                labScore,
              })}
            </div>
          )}
      </>

      {showTestList.mode === "pre" && showTestList.state && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({ ...showTestList, state: false })}
          testList={mergedPretestData}
          mode={showTestList.mode}
        />
      )}

      {showTestList.mode === "post" && showTestList.state && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({ ...showTestList, state: false })}
          testList={mergedPosttestData}
          mode={showTestList.mode}
        />
      )}

      {showTestList.mode === "lab" && showTestList.state && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({ ...showTestList, state: false })}
          testList={mergedLabData}
          mode={showTestList.mode}
        />
      )}

      <CancelEnrollmentDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelEnrollment}
      />

      <ExpiredDialog
        open={expiredDialogOpen}
        onClose={() => window.location.reload()}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CourseDetail;
