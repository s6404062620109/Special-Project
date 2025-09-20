import React, { useState } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, FormLabel, Pagination, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

function Labs({
    currentQuestionIndex,
    handleChangePage,
    questions,
    handleLabSpawn = null,
    answers,
    progressAnswers,
    handleLabAnswerChange,
    errorMessage,
    handleLabSubmit,
 }) {
    const { courseId, enrollmentId } = useParams();
    const [ htmlFileContent, setHtmlFileContent ] = useState('');

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

    useEffect(() => {
      if (currentQuestion?.type === 5) {
        if(currentQuestion.htmlFile instanceof File){
          const reader = new FileReader();
          reader.onload = (e) => setHtmlFileContent(e.target.result);
          reader.onerror = () => setHtmlFileContent('ไม่สามารถอ่านไฟล์ HTML ได้');
          reader.readAsText(currentQuestion.htmlFile);
        }
        if(typeof currentQuestion.htmlFile.content === 'string'){
          setHtmlFileContent(currentQuestion.htmlFile.content);
        }
      } 
      else if (typeof currentQuestion?.htmlFile === 'string') {
        setHtmlFileContent(currentQuestion.htmlFile);
      } 
    }, [currentQuestion]);
  
    useEffect(() => {
      const handleMessage = (event) => {
        if (event.data?.source === "react-devtools-bridge") return;
        if (typeof event.data !== "object") return;
        const { answer } = event.data;

        if (typeof answer !== "string") return;
        if (currentQuestion?.type === 5) {
          handleLabAnswerChange(currentQuestion.id, currentQuestion.type, answer);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [currentQuestion]);

    const isAnswered = progressAnswers.some(
      (p) => p.questionId === currentQuestion?.id && p.user_answer
    );

  return (
    <Stack>
      <Typography variant="h6" align="center">Lab Questions</Typography>

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
              {currentQuestionIndex + 1}.

              {currentQuestion.content.split("\\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </FormLabel>
            
            {currentQuestion.img && (
              <img
                src={currentQuestion.img}
                alt={`Question ${currentQuestionIndex + 1}`}
                style={{ maxWidth: '100%', marginTop: 12 }}
              />
            )}
            {currentQuestion.htmlFile && (
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                gap={2}
                sx={{ width: "100%", margin: "8px auto" }}
              >
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
                  onChange={(e) => handleLabAnswerChange(currentQuestion.id, 5, e.target.value)}
                />
              </Stack>
            )}

            {currentQuestion.type === 3 && (
              <RadioGroup
                sx={{ width: "80%", margin: "8px auto" }}
                name={`radio-group-${currentQuestion.id}`}
                value={String(currentAnswer?.answer?.answerId ?? "")}
                onChange={(e) => {
                  const selectedChoice = currentQuestion.choice.find(c => String(c.id) === e.target.value);
                  handleLabAnswerChange(
                    currentQuestion.id,
                    currentQuestion.type,
                    selectedChoice?.content,
                    selectedChoice?.id,
                  );
                }}
              >
                {currentQuestion.choice.map((choice, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={String(choice.id)}
                    control={<Radio />}
                    label={choice.content}
                  />
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 6 && (
              <Stack sx={{ width: "80%", margin: "8px auto" }}>
                {currentQuestion.choice.map((choice, idx) => (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
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
            )}

            {currentQuestion.type === 4 && handleLabSpawn && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={2}
                sx={{ width: "80%", margin: "8px auto" }}
              >
                <TextField
                  fullWidth
                  label="Answer"
                    value={currentAnswer?.answer || ""}
                    onChange={(e) => handleLabAnswerChange(currentQuestion.id, 4, e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => handleLabSpawn(currentQuestion.id)}
                >
                  สร้างห้องจำลอง
                </Button>
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                width: "100%",
                margin: "8px auto",
              }}
            >
              <Typography variant="body2" color={errorMessage === "คุณผ่านการทดสอบแล้ว" ? "green" : "red"}>{errorMessage}</Typography>

                
              {!isAnswered && 
                <Button
                  variant='contained'
                  sx={{
                    width: "15%"
                  }}
                  onClick={() => handleLabSubmit(courseId, enrollmentId, currentQuestion.id)}
                >
                  ส่งคำตอบ
                </Button>
              }
            </Stack>
          </FormControl>
            
          <Pagination
            count={questions.length}
            page={currentQuestionIndex + 1}
            onChange={(event, page) => handleChangePage(event, page)} 
            color="primary"
            showFirstButton
            showLastButton
            sx={{
                display: "flex",
                justifyContent: "center",
            }}
          />
        </Stack>
      )}
    </Stack>
  )
}

export default Labs