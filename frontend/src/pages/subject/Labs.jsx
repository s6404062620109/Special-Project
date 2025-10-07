import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Pagination,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/** Hook สำหรับจัดการคำตอบของ currentQuestion */
function useCurrentAnswer(questions, answers, progressAnswers, currentIndex) {
  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const isAnswered = useMemo(() => {
    return progressAnswers.some(
      (p) => p.questionId === currentQuestion?.id && p.user_answer
    );
  }, [progressAnswers, currentQuestion]);

  return { currentQuestion, currentAnswer, isAnswered };
}

function Labs({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  handleChangePage,
  questions,
  answers,
  progressAnswers,
  handleLabAnswerChange,
  errorMessage,
  handleLabSubmit,
}) {
  const [htmlFileContent, setHtmlFileContent] = useState("");

  const { currentQuestion, currentAnswer, isAnswered } = useCurrentAnswer(
    questions,
    answers,
    progressAnswers,
    currentQuestionIndex
  );


  const lastProgressLengthRef = useRef(progressAnswers.length);
  useEffect(() => {
    if (progressAnswers.length > lastProgressLengthRef.current) {
      const answeredIndex = questions.findIndex(q =>
        progressAnswers.some(p => p.questionId === q.id)
      );
      if (answeredIndex > currentQuestionIndex) {
        setCurrentQuestionIndex(answeredIndex);
      }
    }
    lastProgressLengthRef.current = progressAnswers.length;
  }, [progressAnswers, questions, currentQuestionIndex, setCurrentQuestionIndex]);

  useEffect(() => {
    if (!currentQuestion) return;

    if (currentQuestion?.type === 5) {
      if (currentQuestion.htmlFile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => setHtmlFileContent(e.target.result);
        reader.onerror = () => setHtmlFileContent("ไม่สามารถอ่านไฟล์ HTML ได้");
        reader.readAsText(currentQuestion.htmlFile);
      } else if (typeof currentQuestion.htmlFile?.content === "string") {
        setHtmlFileContent(currentQuestion.htmlFile.content);
      }
    } else if (typeof currentQuestion?.htmlFile === "string") {
      setHtmlFileContent(currentQuestion.htmlFile);
    }
  }, [currentQuestion]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source === "react-devtools-bridge") return;
      if (typeof event.data !== "object") return;

      const { answer } = event.data;
      if (typeof answer === "string" && currentQuestion?.type === 5) {
        handleLabAnswerChange(currentQuestion.id, 5, answer);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentQuestion]);

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 3: // Single choice
        return (
          <RadioGroup
            sx={{ width: "80%", margin: "8px auto" }}
            name={`radio-${currentQuestion.id}`}
            value={String(currentAnswer?.answer?.answerId ?? "")}
            onChange={(e) => {
              const selectedChoice = currentQuestion.choice.find(
                (c) => String(c.id) === e.target.value
              );
              handleLabAnswerChange(
                currentQuestion.id,
                3,
                selectedChoice?.content,
                selectedChoice?.id
              );
            }}
          >
            {currentQuestion.choice.map((choice) => (
              <FormControlLabel
                key={choice.id}
                value={String(choice.id)}
                control={<Radio />}
                label={choice.content}
              />
            ))}
          </RadioGroup>
        );

      case 6: // Multi choice
        return (
          <Stack sx={{ width: "80%", margin: "8px auto" }}>
            {currentQuestion.choice.map((choice) => (
              <FormControlLabel
                key={choice.id}
                control={
                  <Checkbox
                    checked={Array.isArray(currentAnswer?.answer) &&
                      currentAnswer.answer.some((a) => a.answerId === choice.id)}
                    onChange={(e) =>
                      handleLabAnswerChange(
                        currentQuestion.id,
                        6,
                        choice.content,
                        choice.id,
                        e.target.checked
                      )
                    }
                  />
                }
                label={choice.content}
              />
            ))}
          </Stack>
        );

      case 5: // HTML file + iframe
        return (
          <Stack sx={{ width: "100%", margin: "8px auto" }} gap={2}>
            <iframe
              srcDoc={htmlFileContent}
              sandbox="allow-scripts allow-same-origin"
              style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
            />
            <TextField
              disabled
              fullWidth
              label="Answer"
              value={currentAnswer?.answer || ""}
            />
          </Stack>
        );

      default:
        return null;
    }
  };
  
  return (
    <Stack>
      <Typography variant="h6" align="center">
        ปฎิบัติการทดสอบ
      </Typography>

      {currentQuestion && (
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={{ width: "80%", margin: "16px auto" }}
        >
          <FormControl
            sx={{
              width: "100%",
              border: "1px solid #b3b3b3",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <FormLabel>
              {currentQuestionIndex + 1}.{" "}
              {currentQuestion.content.split("\\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </FormLabel>

            {currentQuestion.img && (
              <img
                src={currentQuestion.img}
                alt={`Question ${currentQuestionIndex + 1}`}
                style={{ maxWidth: "100%", marginTop: 12 }}
              />
            )}

            {renderQuestionInput()}

            <Stack
              alignItems="center"
              gap={2}
              sx={{ 
                width: "100%", 
                margin: "8px auto",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: { xs: "center", md: "space-between" },
              }}
            >
              <Typography
                variant="body2"
                color={errorMessage === "บันทึกคำตอบเรียบร้อยแล้ว" ? "green" : "red"}
              >
                {errorMessage}
              </Typography>

              {!isAnswered && (
                <Button
                  variant="contained"
                  sx={{ 
                    width: { xs: "50%", md: "15%"} 
                  }}
                  onClick={() => handleLabSubmit(currentQuestion.id)}
                >
                  ส่งคำตอบ
                </Button>
              )}
            </Stack>
          </FormControl>

          <Pagination
            count={questions.length}
            page={currentQuestionIndex + 1}
            onChange={handleChangePage}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ display: "flex", justifyContent: "center" }}
          />
        </Stack>
      )}
    </Stack>
  );
}

export default Labs;
