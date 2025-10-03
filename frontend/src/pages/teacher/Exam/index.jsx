import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import style from "./css/exam.module.css";
import { AddExam } from "./contents/AddExam";
import { EditExam } from "./contents/EditExam";
import { DeleteExam } from "./contents/DeleteExam";

import { Button, IconButton, useMediaQuery } from "@mui/material";
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

  const handleQuestionChange = (index, event, att) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [att]: event.target.value,
    };
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      choice: newQuestions[questionIndex].choice.map((choice, index) => {
        if (index === choiceIndex) {
          return {
            ...choice,
            [field]: value,
          };
        }
        return choice;
      }),
    };
    setQuestions(newQuestions);
  };

  const handleAddQuestion = async () => {
    setQuestions([
      ...questions,
      {
        content: "",
        img: "",
        choices: [
          {
            content: "",
            type: null,
          },
        ],
      },
    ]);
  };

  const handleAddChoice = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].choices.push({
      content: "",
      type: null,
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

  return {
    questions,
    fetchQuestions,
    handleQuestionChange,
    handleChoiceChange,
    handleAddQuestion,
    handleAddChoice,
    handleDeleteQuestion,
    handleDeleteChoice,
  };
};

function Exam() {
  const { mode, courseId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    questions,
    fetchQuestions,
    handleQuestionChange,
    handleChoiceChange,
    handleAddQuestion,
    handleAddChoice,
    handleDeleteQuestion,
    handleDeleteChoice,
  } = useQuestions(courseId);

  const handleSubmit = async () => {
    try {
      const response = await backend.post(
        `/teacher/questions/${courseId}`,
        {
          questions,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const tabletQuery = useMediaQuery("(max-width:720px)");

  useEffect(() => {
    if (mode === "add" && questions.length === 0) {
      handleAddQuestion();
    } else if (mode === "edit" || mode === "delete") {
      fetchQuestions();
    }
  }, [mode, courseId]);

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
    </div>
  );
}

export default Exam;
