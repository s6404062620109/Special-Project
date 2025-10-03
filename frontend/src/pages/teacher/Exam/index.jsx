import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import style from "./css/exam.module.css";
import { AddExam } from "./contents/AddExam";
import { EditExam } from "./contents/EditExam";
import { DeleteExam } from "./contents/DeleteExam";

import { Button, IconButton, Slide, Snackbar, useMediaQuery } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import backend from "../../../api/backend";

const useQuestions = (courseId) => {
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const response = await backend.get(`/teacher/questions/${courseId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuestionChange = (index, value, field ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
    const newQuestions = [...questions];
    const targetQuestion = newQuestions[questionIndex];

    if (!targetQuestion.choices) {
      targetQuestion.choices = [];
    }

    targetQuestion.choices = targetQuestion.choices.map((choice, index) =>
      index === choiceIndex ? { ...choice, [field]: value } : choice
    );

    setQuestions(newQuestions);
  };
  
  const handleAddQuestion = async () => {
    setQuestions([
      ...questions,
      {
        content: "",
        img: null,
        choices: [
          {
            content: "",
            type: false,
          },
        ],
      },
    ]);
  };

  const handleAddChoice = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].choices.push({
      content: "",
      type: false,
    });
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleDeleteChoice = (questionIndex, choiceIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices.splice(choiceIndex, 1);
    setQuestions(newQuestions);
  };

  const handleAddImg = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newQuestions = [...questions];
      newQuestions[index].img = reader.result;
      setQuestions(newQuestions);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImg = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].img = "";
    setQuestions(newQuestions);
  }

  const validation = () => {
    let isValid = true;
    let validMessage = "";

    if (questions.length === 0) {
      return {
        isValid: false,
        validMessage: "กรุณากรอกอย่างน้อย 1 คำถาม",
      };
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.content) {
        return {
          isValid: false,
          validMessage: `กรุณากรอกคำถามที่ ${i + 1}`,
        };
      }

      if (!question.choices || question.choices.length < 2) {
        return {
          isValid: false,
          validMessage: `กรุณากรอกตัวเลือกคำถามที่ ${i + 1} อย่างน้อย 2 ตัวเลือก`,
        };
      }

      let correctCount = 0;
      let incorrectCount = 0;

      question.choices.forEach((choice) => {
        if (choice.type === true) correctCount++;
        if (choice.type === false) incorrectCount++;
      });

      if (correctCount === 0) {
        return {
          isValid: false,
          validMessage: `กรุณากรอกตัวเลือกที่ถูกต้องสำหรับคำถามที่ ${i + 1} อย่างน้อย 1 ตัวเลือก`,
        };
      }

      if (incorrectCount === 0) {
        return {
          isValid: false,
          validMessage: `กรุณากรอกตัวเลือกที่ไม่ถูกต้องสำหรับคำถามที่ ${i + 1} อย่างน้อย 1 ตัวเลือก`,
        };
      }
    }

    return {
      isValid: true,
      validMessage: "ผ่านการตรวจสอบ",
    };
  };

  return {
    questions,
    fetchQuestions,
    handleQuestionChange,
    handleChoiceChange,
    handleAddQuestion,
    handleAddChoice,
    handleDeleteQuestion,
    handleDeleteChoice,
    handleAddImg,
    handleDeleteImg,
    validation,
  };
};

function Exam() {
  const { mode, courseId } = useParams();
  const navigate = useNavigate();
  const [ message, setMessage ] = useState("");
  const [ loading, setLoading ] = useState(false);
  const [ snackBarState, setSnackBarState ] = React.useState({
    open: false,
    Transition: null,
  });

  const {
    questions,
    fetchQuestions,
    handleQuestionChange,
    handleChoiceChange,
    handleAddQuestion,
    handleAddChoice,
    handleDeleteQuestion,
    handleDeleteChoice,
    handleAddImg,
    handleDeleteImg,
    validation,
  } = useQuestions(courseId);

  const { isValid, validMessage } = validation();

  const handleSubmitAdd = async () => {
    try {
      const response = await backend.post(`/teacher/addQuestions/${courseId}`, { questions },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate(-1);
        }, 4000);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async () => {
    
    if (!isValid) {
      setMessage(validMessage);
      setSnackBarState({ open: true, Transition: SlideTransition });
      setTimeout(() => {
        setSnackBarState({ open: false, Transition: SlideTransition });
        setMessage("");
      }, 3000);
      return;
    }

    if (mode === "add") {
      handleSubmitAdd();
    } 
    else if (mode === "edit") {

    }
    else if (mode === "delete") {
      
    }
  };

  const tabletQuery = useMediaQuery("(max-width:720px)");

  useEffect(() => {
    setLoading(true);
    if (mode === "add" && questions.length === 0) {
      handleAddQuestion();
      setLoading(false);
    } else if (mode === "edit" || mode === "delete") {
      fetchQuestions();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [mode, courseId]);

  function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
  }

  return (
    <div className={style.pageWrapper}>
      <div className={style.head}>
        {tabletQuery ? (
          <IconButton
            sx={{
              backgroundColor: "rgb(25, 118, 210)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(25, 118, 210)",
              },
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            startIcon={<ArrowLeftIcon />}
            onClick={() => navigate(-1)}
          >
            ย้อนกลับ
          </Button>
        )}
      </div>

      <div className={style.body}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {mode === "add" && (
              <AddExam
                questions={questions}
                handleQuestionChange={handleQuestionChange}
                handleChoiceChange={handleChoiceChange}
                handleAddquestion={handleAddQuestion}
                handleAddChoice={handleAddChoice}
                handleDeleteQuestion={handleDeleteQuestion}
                handleDeleteChoice={handleDeleteChoice}
                handleAddImg={handleAddImg}
                handleDeleteImg={handleDeleteImg}
                handleSubmit={handleSubmit}
              />
            )}

            {mode === "edit" && (
              <EditExam 
                questions={questions}
                handleQuestionChange={handleQuestionChange}
                handleChoiceChange={handleChoiceChange}
                handleAddChoice={handleAddChoice}
                handleDeleteQuestion={handleDeleteQuestion}
                handleDeleteChoice={handleDeleteChoice}
                handleSubmit={handleSubmit}
              />
            )}

            {mode === "delete" && (
              <DeleteExam 
                questions={questions}
                handleQuestionChange={handleQuestionChange}
                handleChoiceChange={handleChoiceChange}
                handleAddChoice={handleAddChoice}
                handleDeleteQuestion={handleDeleteQuestion}
                handleDeleteChoice={handleDeleteChoice}
                handleSubmit={handleSubmit}
              />
            )}
          </>
        )}
      </div>

      {message && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={snackBarState.open}
          slots={{ transition: snackBarState.Transition }}
          onClose={() => setMessage("")}
          message={message}
          key={"bottom" + "right"}
          autoHideDuration={3000}
          sx={{
            "& .MuiSnackbarContent-root": {
              background: message === "เพิ่มคำถามใหม่สำเร็จ" ? "green" : "red",
              color: "white",
            }
          }}
        />
      )}
    </div>
  );
}

export default Exam;
