import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import backend from "../../api/backend";

import style from "./css/subject.module.css";
import NavSubject from "./NavSubject";
import Reader from "../../components/Reader";
import Labs from "./Labs";

import {
  Backdrop,
  Box,
  IconButton,
  Slide,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function useLabProgress(courseId, subjectId, enrollmentId) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [progressAnswers, setProgressAnswers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const controllerRef = useRef(null);
  const lastQuestionIdsRef = useRef(null);
  
  const allQuestionsAnswered = useMemo(() => {
    if (!questions.length) return false;

    const answeredIds = new Set(progressAnswers.map(p => p.questionId));

    return answeredIds.size === questions.length;
  }, [progressAnswers, questions]);

  /** Pagination */
  const handleChangePage = (event, page) => {
    setCurrentQuestionIndex(page - 1);
    setErrorMessage("");
  };

  /** Fetch lab questions */
  const fetchLabQuestions = async () => {
    try {
      const response = await backend.get(`/labs/getLabQuestions/${courseId}/${subjectId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const questionResults = response.data.questionFormat || [];
        setQuestions(questionResults);
      }
    } catch (error) {
      console.error("fetchLabQuestions error:", error);
    }
  };

  /** Derived questionIds */
  const questionIds = useMemo(
    () => questions.map((q) => q.id).filter(Boolean),
    [questions]
  );

  /** Fetch progress answers */
  const fetchAllProgressAnswers = async (ids, force = false) => {
    if (!ids || ids.length === 0) return;

    const idsKey = ids.join(",");
    if (!force && lastQuestionIdsRef.current === idsKey) return;
    lastQuestionIdsRef.current = idsKey;

    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await backend.get(`/progress/getAllProgressAnswers/${enrollmentId}/${courseId}?questionIds=${ids.join(",")}`,
        { withCredentials: true, signal: controller.signal }
      );

      if (response.status === 200) {
        setProgressAnswers(response.data.answers || []);
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        // request canceled
      } else {
        console.error("fetchAllProgressAnswers error:", error);
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  /** Auto fetch when questions loaded */
  useEffect(() => {
    if (questionIds.length > 0) fetchAllProgressAnswers(questionIds);
  }, [enrollmentId, courseId, questionIds.join(",")]);

  useEffect(() => {
    if (questions.length === 0) return;

    const progressMap = progressAnswers.reduce((acc, p) => {
      if (!acc[p.questionId]) acc[p.questionId] = [];
      acc[p.questionId].push(p.user_answer);
      return acc;
    }, {});

    const initialAnswers = questions.map((q) => {
      if (progressMap[q.id]) {
        return {
          questionId: q.id,
          answer: q.type === 6 ? progressMap[q.id] : progressMap[q.id][0],
          lab_type: q.type,
        };
      } else {
        return {
          questionId: q.id,
          answer: q.type === 6 ? [] : "",
          lab_type: q.type,
        };
      }
    });

    setAnswers(initialAnswers);
  }, [questions, progressAnswers]);

  /** Handle answer change */
  const handleLabAnswerChange = (
    questionId,
    questionType,
    value,
    answerId = null,
    checked = null
  ) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((item) => {
        if (item.questionId !== questionId) return item;

        let updatedAnswer = item.answer;

        if (questionType === 3) {
          // Multiple choice (single answer)
          updatedAnswer = {
            ...item.answer,
            answerId,
            content: value,
          };
        } else if (questionType === 4 || questionType === 5) {
          // Short text or HTML answer
          updatedAnswer = String(value);
        } else if (questionType === 6) {
          // Multiple choice (multi-select)
          const prevArray = Array.isArray(item.answer) ? item.answer : [];
          if (checked) {
            if (!prevArray.some((v) => v.answerId === answerId)) {
              updatedAnswer = [...prevArray, { answerId, content: value }];
            }
          } else {
            updatedAnswer = prevArray.filter((v) => v.answerId !== answerId);
          }
        }

        return { ...item, answer: updatedAnswer };
      })
    );
  };

  /** Validation */
  const labValidations = (questionId) => {
    const answer = answers.find((a) => a.questionId === questionId);
    const idx = questions.findIndex((q) => q.id === questionId);

    setErrorMessage("");
    if (!answer) {
      setErrorMessage(`ไม่พบคำตอบของคำถามที่ ${idx + 1}`);
      return false;
    }

    let valid = true;

    if (
      (answer.lab_type === 3 ||
        answer.lab_type === 4 ||
        answer.lab_type === 5) &&
      (answer.answer === null || answer.answer === "")
    ) {
      valid = false;
      setErrorMessage(`ต้องเลือกคำตอบสำหรับคำถามที่ ${idx + 1}.`);
    }

    if (
      answer.lab_type === 6 &&
      (!Array.isArray(answer.answer) || answer.answer.length === 0)
    ) {
      valid = false;
      setErrorMessage(`คำถามที่ ${idx + 1} ต้องการคำตอบอย่างน้อย 1 คำตอบ`);
    }

    return valid;
  };

  const fetchLastProgress = async () => {
    try {
      const response = await backend.get(
        `/progress/getLatestProgress/${enrollmentId}/${courseId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
         window.location.href = `/course/${courseId}/${response.data.inProgress}`;
      }
    } catch (error) {
      console.log(error);
    }
  };

  /** Submit answer */
  const handleLabSubmit = async (questionId) => {
    if (!labValidations(questionId)) return;

    const answer = answers.find((a) => a.questionId === questionId);
    try {
      const response = await backend.put(`/labs/submitLabQuestions/${courseId}/${enrollmentId}`,
        { answer },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setErrorMessage(response.data.message);
        fetchAllProgressAnswers(questionIds, true);

        // ตรวจสอบว่าคำตอบที่เพิ่งส่งไปเป็นคำตอบของข้อสุดท้ายหรือไม่
        const answeredIds = new Set(progressAnswers.map(p => p.questionId));
        if (!answeredIds.has(questionId) && (answeredIds.size + 1 === questions.length)) {
          setErrorMessage("คุณได้ทำปฏิบัติการทดสอบทั้งหมดแล้ว กำลังไปทเรียนต่อไป...");
          setTimeout(fetchLastProgress, 2000);
          
        }

        setTimeout(() =>{
          setErrorMessage("")
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        }, 2000);
      }
    } catch (error) {
      console.error("handleLabSubmit error:", error);
      setErrorMessage(error?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleChangePage,
    questions,
    setQuestions,
    answers,
    setAnswers,
    progressAnswers,
    fetchLabQuestions,
    fetchLastProgress,
    allQuestionsAnswered,
    handleLabAnswerChange,
    errorMessage,
    handleLabSubmit,
  };
}

function Subject() {
  const { courseId, subjectId, enrollmentId } = useParams();
  const { userData } = useContext(AuthContext);
  const [subjectList, setSubjectList] = useState([]);
  const [content, setContent] = useState({ name: "", content: null });
  const [openNavSubject, setOpenNavSubject] = useState(false);
  const [labs, setLabs] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson");

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleChangePage,
    questions,
    answers,
    setAnswers,
    progressAnswers,
    fetchLabQuestions,
    fetchLastProgress,
    allQuestionsAnswered,
    handleLabAnswerChange,
    errorMessage,
    handleLabSubmit,
  } = useLabProgress(courseId, subjectId, enrollmentId);

  const readerRef = useRef(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  const fetchSubjectData = async () => {
    try {
      const response = await backend.get(
        `/subjects/getSubject/${courseId}/${subjectId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { subjectname, jsonData, pdfUrl } = response.data;
        setContent({
          name: subjectname || "",
          content: jsonData || pdfUrl || null,
        });
      }
    } catch (err) {
      console.log(err);
      if (
        err?.response?.status === 404 ||
        err?.response?.data?.message === "No courses found."
      ) {
        alert("โปรดลงทะเบียนเรียนใหม่ก่อนเข้าเรียน");
        navigate(`/course/${courseId}/${enrollmentId}`);
      }
    }
  };

  const fetchSubjectList = async () => {
    try {
      const response = await backend.get(`/subjects/getAllSubjectStudent/${courseId}`, {
        withCredentials: true
      });
      if (response.status === 200) {
        setSubjectList(response.data.subject || []);
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 404 && error.response.data.message === "Course not found"){
        navigate('/courses')
      }
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const checkPretestCompletion = async () => {
    try {
      const response = await backend.get(
        `/progress/checkCourseProgress/${enrollmentId}/${courseId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const pretestProgress = response.data.pretest_progress;

        const pretestCompleted = pretestProgress.every(
          (item) => item.is_completed === 1
        );

        if (!pretestCompleted) {
          alert("กรุณาทำแบบทดสอบก่อนเรียนให้เสร็จก่อนเข้าเรียน");
          navigate(`/course/${courseId}/${enrollmentId}`);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjectData();
    fetchSubjectList();
    fetchLabQuestions();
    checkPretestCompletion();
  }, [courseId, subjectId]);

  return (
    <div className={style.container}>
      <Stack sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleChangeTab}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab label="บทเรียน" value="lesson" />
          <Tab label="ปฏิบัติการทดสอบ" value="lab" />
        </Tabs>
      </Stack>

      {activeTab === "lesson" && (
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ width: "100%", gap: 2 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <div ref={readerRef}>
              <Reader
                content={content}
                enrollmentId={enrollmentId}
                subjectId={subjectId}
              />
            </div>
            <div ref={endRef}></div>
          </Box>

          <Stack
            sx={{
              position: "fixed",
              bottom: "20px",
              left: "40px",
              transform: "translateY(-50%)",
              height: "100px",
              justifyContent: "space-between",
              zIndex: 1301,
            }}
          >
            <IconButton
              onClick={() => {
                readerRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                color: "black",
                opacity: 0.5,
                ":hover": {
                  opacity: 1,
                  color: "white",
                  background: "#1976d2",
                },
              }}
            >
              <ExpandLessIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                endRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                color: "black",
                opacity: 0.5,
                ":hover": {
                  opacity: 1,
                  color: "white",
                  background: "#1976d2",
                },
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}

      {activeTab === "lab" && (
        <Labs
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          handleChangePage={handleChangePage}
          questions={questions}
          answers={answers}
          progressAnswers={progressAnswers}
          handleLabAnswerChange={handleLabAnswerChange}
          errorMessage={errorMessage}
          handleLabSubmit={handleLabSubmit}
          fetchLastProgress={fetchLastProgress}
        />
      )}

      <Backdrop
        open={openNavSubject}
        sx={{ zIndex: 1300 }}
        onClick={() => setOpenNavSubject(false)}
      />

      <Slide direction="left" in={openNavSubject} mountOnEnter unmountOnExit>
        <Stack
          sx={{
            position: "fixed",
            top: "35%",
            right: "20px",
            transform: "translateY(-50%)",
            zIndex: 1301,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <NavSubject
            courseId={courseId}
            subjectList={subjectList}
            enrollmentId={enrollmentId}
          />
        </Stack>
      </Slide>

      {!openNavSubject && (
        <IconButton
          onClick={() => setOpenNavSubject(true)}
          sx={{
            position: "fixed",
            bottom: "40%",
            right: "5px",
            transform: "translateY(-50%)",
            zIndex: 1301,
            background: "white",
            border: "1px solid #b3b3b3",
            opacity: 0.5,
            ":hover": { opacity: 1 },
          }}
        >
          <ListIcon fontSize="large" />
        </IconButton>
      )}
    </div>
  );
}

export default Subject;
