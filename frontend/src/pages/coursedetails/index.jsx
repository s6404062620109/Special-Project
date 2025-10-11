import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";

import { Avatar, Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

import style from "./css/coursedetails.module.css";
import SubjectData from "./SubjectData";
import TestDialog from "./testDialog";

const renderTestSection = (announcement, {
  setShowTestList,
  pretestProgress,
  posttestProgress,
  labProgress,
  preTestScore,
  postTestScore,
}) => {
  if (announcement === 0) {
    return <Typography variant="h6">คะแนนกำลังอยู่ในขั้นตอนการประเมินผล</Typography>;
  }

  const pretestProgressCompleted = pretestProgress.length > 0 && pretestProgress.every((item) => item.is_completed === 1);
  const posttestProgressCompleted = posttestProgress.length > 0 && posttestProgress.every((item) => item.is_completed === 1);
  const labProgressCompleted = labProgress.length > 0 && labProgress.every((item) => item.is_completed === 1);
  const labScore = labProgress.reduce((acc, item) => acc + item.score, 0);

  return (
    <>
      <Typography 
        variant="h5"
        fontWeight="bold"
      >
        ผลการทำแบบทดสอบ
      </Typography>
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-evenly" },
          gap: 2,
          width: "80%",
        }}
      >

        {((announcement === 1 || announcement === 2 || announcement === 3) && pretestProgressCompleted) && (
          <Stack 
            alignItems="center" 
            gap={2}
            sx={{
              flexDirection: "column",
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: "center",
            }}
          >
            <Typography variant="h6">แบบทดสอบก่อนเรียน {preTestScore} / {pretestProgress.length} คะแนน</Typography>
            {announcement === 3 && (
              <Button
                variant="contained"
                onClick={() => setShowTestList({ mode: "pre", state: true })}
              >
                ดูรายละเอียด
              </Button>
            )}
          </Stack>
        )}

        {((announcement === 2 || announcement === 3) && labProgressCompleted) && (
          <Stack 
            alignItems="center" 
            gap={2}
            sx={{
              flexDirection: "column",
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: "center",
            }}
          >
            <Typography variant="h6">ปฎิบัติการทดสอบ {labScore} / {labProgress.length} คะแนน</Typography>
            {announcement === 3 && (
              <Button
                variant="contained"
                onClick={() => setShowTestList({ mode: "lab", state: true })}
              >
                ดูรายละเอียด
              </Button>
            )}
          </Stack>
        )}


        {((announcement === 2 || announcement === 3) && posttestProgressCompleted) && (
          <Stack 
            gap={2}
            sx={{
              flexDirection: "column",
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: "center",
            }}
          >
            <Typography variant="h6">แบบทดสอบหลังเรียน {postTestScore} / {posttestProgress.length} คะแนน</Typography>
            {announcement === 3 && (
              <Button
                variant="contained"
                onClick={() => setShowTestList({ mode: "post", state: true })}
              >
                ดูรายละเอียด
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </>
  );
};

function CourseDetail() {
  const { courseId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [ render, setRender ] = useState("detail");
  const [ questionList, setQuestionList ] = useState({
    pretestList: [],
    posttestList: [],
    labList: [],
  });
  const [ subjectList, setSubjectList ] = useState([]);
  const [ courseInfo, setCourseInfo ] = useState({
    id: "",
    name: "",
    icon: "",
    createat: null,
    updateat: null,
    announcement: 0,
  });
  const [ count, setCount ] = useState({
    countEnrollments: 0,
    countPosttestComplete: 0
  })
  const [ teacherInfo, setTeacherInfo ] = useState({
    sex: "",
    name: "",
    surname: "",
    email: "",
    profile_img: null
  });
  const [ history, setHistory ] = useState([]);
  const [ labProgress, setLabProgress ] = useState([]);
  const [ pretestProgress, setPretestProgress ] = useState([]);
  const [ posttestProgress, setPosttestProgress ] = useState([]);
  const [ labAnswers, setLabAnswers ] = useState([]);
  const [ pretestAnswers, setPretestAnswers ] = useState([]);
  const [ posttestAnswers, setPosttestAnswers ] = useState([]);
  const [ showTestList, setShowTestList ] = useState({
    mode: "",
    state: false,
  });
  const navigate = useNavigate();

  const fetchCourseInfo = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubject/${courseId}`);

      if(response.status === 200){
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
          profile_img: teacherInfo.profile_img
        });

        setCount({
          countEnrollments: response.data.countEnrollments,
          countPosttestComplete: response.data.countPosttestComplete
        });

        setSubjectList(response.data.subject);
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQuestionList = async () => {
    try{
      const pretestResponse = await backend.get(`/pretest/getPretest/${enrollmentId}/${courseId}`, {
        withCredentials: true,
      });

      const posttestResponse = await backend.get(`/posttest/getPosttest/${enrollmentId}/${courseId}`, {
        withCredentials: true,
      });

      const labResponse = await backend.get(`/labs/getAllLabQuestion/${courseId}`, {
        withCredentials: true,
      });
      
      if(pretestResponse.status === 200 && posttestResponse.status === 200){
        setQuestionList({
          pretestList: pretestResponse.data.questions,
          posttestList: posttestResponse.data.questions,
          labList: labResponse.data.questionFormat,
        });
      }
    } catch(err){
      console.log(err);
    }
  };

  const findAndNavigateToLatestEnrollment = async () => {
    try {
      const response = await backend.get(`/enroll/getLatestEnrollment/${userData.id}/${courseId}`, { withCredentials: true });

      if (response.status === 200 && response.data.latestEnrollmentId) {
        navigate(`/course/${courseId}/${response.data.latestEnrollmentId}`, { replace: true });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate(`/course/${courseId}/null`, { replace: true });
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await backend.get(`/enroll/checkCourseEnroll/${userData.id}/${courseId}/${enrollmentId}`, {
        withCredentials: true,
      });
      
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
      const response = await backend.get(`/progress/checkCourseProgress/${history[0].id}/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setPretestProgress(response.data.pretest_progress);
        setPosttestProgress(response.data.posttest_progress);
        setLabProgress(response.data.lab_progress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProgressAnswers = async () => {
    try {
      const response = await backend.get(`/progress/checkProgressAnswers/${courseId}/${enrollmentId}/${showTestList.mode}`, {
        withCredentials: true,
      });

      if(response.status === 200){

        if(showTestList.mode === "pre"){
          setPretestAnswers(response.data.answers);
        } 
        else if(showTestList.mode === "post"){
          setPosttestAnswers(response.data.answers);
        }
        else if(showTestList.mode === "lab"){
          setLabAnswers(response.data.answers);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLatestProgress = async () => {
    try {
      const response = await backend.get(`/progress/getLatestProgress/${enrollmentId}/${courseId}`, {
        withCredentials: true
      });

      if (response.status === 200) {
        navigate(`/course/${courseId}/${response.data.inProgress}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const enrollCourse = async () => {
    try {
      const response = await backend.post(`/enroll/enrollCourse`, {
        courseId: courseId,
        userId: userData.id,
      }, {withCredentials: true});
  
      if (response.status === 200) {
        navigate(`/course/${courseId}/pretest/${response.data.enrollmentId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(showTestList.mode === ""){
      return;
    }
    fetchProgressAnswers();
  }, [ courseId, enrollmentId, showTestList.mode ]);

  useEffect(() => {
    fetchQuestionList();
  }, [enrollmentId, courseId]);

  useEffect(() => {
    fetchCourseInfo();
    fetchHistory();
  }, [courseId, userData.id]);

  useEffect(() => {
    if (history.length > 0 && enrollmentId === "null") {
      navigate(`/course/${courseId}/${history[0].id}`, { replace: true });
    }
  }, [history, enrollmentId, courseId, navigate]);

  useEffect(() => {
    if (enrollmentId && enrollmentId !== "null" && history.length > 0) {
      fethProgress();
    }
    // else if (enrollmentId !== "null" && history.length === 0) {
    //   navigate(`/course/${courseId}/null`);
    // }
  }, [history, enrollmentId]);

  const isPreTestCompleted = pretestProgress.length > 0 && pretestProgress.every((item) => item.is_completed === 1);
  const preTestScore = isPreTestCompleted ? pretestProgress.reduce((acc, item) => acc + item.score, 0) : null;

  const isPostTestCompleted = posttestProgress.length > 0 && posttestProgress.every((item) => item.is_completed === 1);
  const postTestScore = isPostTestCompleted ? posttestProgress.reduce((acc, item) => acc + item.score, 0) : null;

  const isLabCompleted = labProgress.length > 0 && labProgress.every((item) => item.is_completed === 1);

  const handleChangeTab = (event, newValue) => {
    setRender(newValue);
  };

  const mergedPretestData = React.useMemo(() => {
    if (!questionList.pretestList.length || !pretestProgress.length || !pretestAnswers.length)
      return [];

    // สร้าง Map สำหรับ progress และ answers เพื่อ lookup เร็วขึ้น
    const progressMap = new Map(pretestProgress.map(p => [p.questionId, p]));
    const answerMap = new Map(pretestAnswers.map(a => [a.progressId, a]));

    // รวมข้อมูล
    return questionList.pretestList.map(q => {
      const progress = progressMap.get(q.qId);
      const answer = progress ? answerMap.get(progress.id) : null;

      return {
        ...q, // เอา content, choice จาก question เดิม
        user_answer: answer ? answer.user_answer : null,
        is_correct: answer ? !!answer.score : false,
        score: answer ? answer.score : 0
      };
    });
  }, [questionList.pretestList, pretestProgress, pretestAnswers]);

  const mergedPosttestData = React.useMemo(() => {
    if (!questionList.posttestList.length || !posttestProgress.length || !posttestAnswers.length)
      return [];

    // สร้าง Map สำหรับ progress และ answers เพื่อ lookup เร็วขึ้น
    const progressMap = new Map(posttestProgress.map(p => [p.questionId, p]));
    const answerMap = new Map(posttestAnswers.map(a => [a.progressId, a]));

    // รวมข้อมูล
    return questionList.posttestList.map(q => {
      const progress = progressMap.get(q.qId);
      const answer = progress ? answerMap.get(progress.id) : null;

      return {
        ...q, // เอา content, choice จาก question เดิม
        user_answer: answer ? answer.user_answer : null,
        is_correct: answer ? !!answer.score : false,
        score: answer ? answer.score : 0
      };
    });
  }, [questionList.posttestList, posttestProgress, posttestAnswers]);

  const mergedLabData = React.useMemo(() => {
    if (!questionList?.labList?.length || !labProgress?.length || !labAnswers?.length)
      return [];

    // 🔹 สร้าง Map: progressId => array of answers
    const progressMap = new Map(labProgress.map(p => [p.questionId, p]));
    const answerMap = new Map();
    labAnswers.forEach(a => {
      if (!answerMap.has(a.progressId)) answerMap.set(a.progressId, []);
      answerMap.get(a.progressId).push(a);
    });

    return questionList.labList.map(q => {
      const progress = progressMap.get(q.id);
      const answers = progress ? answerMap.get(progress.id) || [] : [];

      // 🔹 สร้าง user_answer
      let userAnswer;
      if (q.type === 6) {
        // type 6 → รวมหลายคำตอบเป็น array
        userAnswer = answers.map(a => a.user_answer);
      } else {
        // type อื่น → เอา record แรก
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
        is_correct: answers.some(a => a.score > 0),
      };
    });
  }, [questionList.labList, labProgress, labAnswers]);

  return (
    <div className={style.container}>
      <Stack sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={render}
          onChange={handleChangeTab}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab label="รายละเอียดคอร์ส" value="detail" />
          <Tab label="รายละเอียดคะแนนแบบทดสอบ" value="test" disabled={history.length === 0}/>
        </Tabs>
      </Stack>

      {render === "detail" && (
        <>
          <div className={style.head}>
            <div>
              <img alt="Course Icon Image" src={courseInfo.icon} />
              <p>{courseInfo.name}</p>
            </div>

            <Stack 
              gap={2}
              sx={{
                alignItems: { xs: "center", sm: "flex-start" },
                flexDirection: 'column',
                justifyContent: { xs: "center", sm: "space-between" },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                สร้างเมื่อ{" "}
                {courseInfo.createat
                  ? new Date(courseInfo.createat).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Bangkok",
                    })
                  : "-"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                แก้ไขเมื่อ{" "}
                {courseInfo.updateat
                  ? new Date(courseInfo.updateat).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Bangkok",
                    })
                  : "-"}
              </Typography>
              
            </Stack>

          </div>

          <Typography 
            variant="h6"
            sx={{
              marginTop: 2
            }}
          >
            อาจารย์ผู้สอน
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
              flexWrap: "wrap",
              justifyContent: "space-evenly",
              gap: 2,
              marginBottom: 2,
            }}
          >

            <Stack 
              direction="row"
              alignItems="center"
              gap={2}
            >
              <Avatar
                src={teacherInfo.profile_img || undefined}
                alt={teacherInfo.name}
                sx={{ width: 72, height: 72 }}
              />
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight="600">
                  {(() => {
                    const isEnglish = /^[A-Za-z\s]+$/.test(teacherInfo.name + " " + teacherInfo.surname);

                    // ถ้าเป็นภาษาอังกฤษ
                    if (isEnglish) {
                      if (teacherInfo.sex === "m") return `Mr. ${teacherInfo.name} ${teacherInfo.surname}`;
                      if (teacherInfo.sex === "f") return `Mrs. ${teacherInfo.name} ${teacherInfo.surname}`;
                      if (teacherInfo.sex === "n") return `Sir. ${teacherInfo.name} ${teacherInfo.surname}`;
                    }

                    // ถ้าเป็นภาษาไทย
                    if (teacherInfo.sex === "m") return `นาย${teacherInfo.name} ${teacherInfo.surname}`;
                    if (teacherInfo.sex === "f") return `นาง${teacherInfo.name} ${teacherInfo.surname}`;
                    if (teacherInfo.sex === "n") return `คุณ${teacherInfo.name} ${teacherInfo.surname}`;

                    // ถ้าไม่ทราบเพศ
                    return teacherInfo.name && teacherInfo.surname
                      ? `${teacherInfo.name} ${teacherInfo.surname}`
                      : "ไม่ทราบชื่ออาจารย์";
                  })()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  {teacherInfo.email || "-"}
                </Typography>
              </Stack>
            </Stack>

          </Stack>

          {userData.id && history.length > 0 && (
            <Stack
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", sm: "space-between" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: 2,
                width: "80%",
                margin: "auto",
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
                    borderBottom: !isPreTestCompleted ? "1px solid #000" : "none",
                  },
                }}
                onClick={() => {
                  if (!isPreTestCompleted) {
                    navigate(`/course/${courseId}/pretest/${enrollmentId}`);
                  }
                }}
              >
                {isPreTestCompleted ?<Typography variant="h6" color="success">แบบทดสอบก่อนเรียน</Typography> : <Typography variant="h6">แบบทดสอบก่อนเรียน</Typography>}
                {isPreTestCompleted ? <CheckIcon color="success" /> : <ClearIcon color="error" />}
              </Stack>

              {/* Posttest Section */}
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{
                  cursor: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "pointer" : "default",
                  color: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "#1976d2" : "#979797",
                  transition: "color 0.3s",
                  "&:hover": {
                    color: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "#115293" : "#979797",
                    borderBottom: !isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "1px solid #000" : "none",
                  },
                }}
                onClick={() => {
                  if (!isPostTestCompleted && isPreTestCompleted && isLabCompleted) {
                    navigate(`/course/${courseId}/posttest/${enrollmentId}`);
                  }
                }}
              >
                {isPostTestCompleted ?<Typography variant="h6" color="success">แบบทดสอบหลังเรียน</Typography> : <Typography variant="h6">แบบทดสอบหลังเรียน</Typography>}
                {isPostTestCompleted ? (
                  <CheckIcon color="success" /> 
                  ):(
                    <ClearIcon 
                      color={!isPostTestCompleted && isPreTestCompleted && isLabCompleted ? "error" : "inherit"} 
                    />
                  )
                }
              </Stack>
            </Stack>
          )}

          <div className={style.content}>
            <table>
              <thead>
                <tr>
                  <th>
                    <p>บทเรียน</p>
                  </th>
                  <th>
                    <p>สถานะการทำปฎิบัติการทดสอบ</p>
                  </th>
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
                    />
                  ))}
                </tbody>
              )}
            </table>
          </div>

          <Stack
            justifyContent="center"
            alignItems="center"
            gap={2}
            sx={{
              width: { sm: "100%", md: "80%"},
              margin: "auto",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          > 
            {userData.id && enrollmentId !== "null" && history.length === 0 && !isPostTestCompleted && (
              <Typography variant="subtitle1" align="center" color="red">
                คุณไม่ผ่านการเรียนรู้ของคอร์ส 
                <ClearIcon color="error" sx={{ ml: 1, mb: -0.5 }} />
              </Typography>
            )}

            {userData.id && enrollmentId !== "null" && 
            history.length > 0 && history[0].posttest_complete === 1 && (
              <Typography variant="subtitle1" align="center" color="green">
                คุณผ่านการเรียนรู้ของคอร์สนี้แล้ว
                <CheckIcon color="success" sx={{ ml: 1, mb: -0.5 }} />
              </Typography>
            )}
                 
            {(userData.id && history.length === 0) && (
              <Button
                variant="contained"
                sx={{
                  width: { md: '50%', xs: '100%' }
                }}
                onClick={() => enrollCourse()}
              >
                {enrollmentId !== "null" ? "สมัครเรียนใหม่" : "สมัครเรียน"}
              </Button>
            )}

            {(userData.id && history.length > 0 && history[0].posttest_complete === 0) && (
              <Button 
                variant="contained"
                onClick={fetchLatestProgress}
                sx={{
                  width: { md: '50%', xs: '100%' }
                }} 
              >
                เข้าเรียนต่อ
              </Button>
            )}
          </Stack>

          <Stack
            justifyContent="space-evenly"
            gap={3}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "space-evenly" },
              marginTop: 2
            }}
          >
            <Typography variant="h6">
              ผู้ลงทะเบียนเรียน { count.countEnrollments } คน
            </Typography>
                  
            <Typography variant="h6">
              ผู้สำเร็จการศึกษา { count.countPosttestComplete } คน
            </Typography>
          </Stack>

          {history.length > 0 && (
            <Stack
            sx={{
              margin: "24px 0",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-evenly" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 2,
            }}
          >
            {history[0].startat && (
              <Typography variant="subtitle1" color="text.secondary">
                เริ่มเรียนเมื่อ{" "}
                {history[0].startat
                  ? new Date(history[0].startat).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Bangkok",
                    })
                  : "-"}
              </Typography>
            )}
            
            {history[0].endat && (
              <Typography variant="subtitle1" color="text.secondary">
                สำเร็จการเรียนเมื่อ{" "}
                {history[0].endat
                  ? new Date(history[0].endat).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Bangkok",
                    })
                  : "-"}
              </Typography>
            )}            
          </Stack>
          )}
        </>
      )}
      
      {render === "test" && (
        <>
          {userData.id && pretestProgress.length > 0 && posttestProgress.length > 0&& (
            <div className={style.testSection}>
              {renderTestSection(courseInfo.announcement, {
                  setShowTestList,
                  pretestProgress,
                  posttestProgress,
                  preTestScore,
                  postTestScore,
                  labProgress,
                })}
            </div>
          )}
        </>
      )}

      {(showTestList.mode === "pre" && showTestList.state) && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({...showTestList, state: false})}
          testList={mergedPretestData}
          mode={showTestList.mode}
        />
      )}

      {(showTestList.mode === "post" && showTestList.state) && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({...showTestList, state: false})}
          testList={mergedPosttestData}
          mode={showTestList.mode}
        />
      )}

      {(showTestList.mode === "lab" && showTestList.state) && (
        <TestDialog
          open={showTestList.state}
          onClose={() => setShowTestList({...showTestList, state: false})}
          testList={mergedLabData}
          mode={showTestList.mode}
        />
      )}
    </div>
  );
}

export default CourseDetail;
