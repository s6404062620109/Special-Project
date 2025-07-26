import { useState } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, FormLabel, Pagination, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

function Labs({ 
    questions,
    handleLabSpawn = null,
    answers,
    handleLabAnswerChange,
    errorMessage,
    handleLabSubmit
 }) {
    const { courseId, enrollmentId } = useParams();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleChangePage = (event, value) => {
        setCurrentQuestionIndex(value - 1);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

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
            <FormLabel>{currentQuestionIndex + 1}. {currentQuestion.content}</FormLabel>
            
            {currentQuestion.img && (
              <img
                src={currentQuestion.img}
                alt={`Question ${currentQuestionIndex + 1}`}
                style={{ maxWidth: '100%', marginTop: 12 }}
              />
            )}

            {currentQuestion.type === 3 && (
              <RadioGroup
                sx={{ width: "80%", margin: "8px auto" }}
                name={`radio-group-${currentQuestion.id}`}
                value={currentAnswer?.answer}
                onChange={(e) => handleLabAnswerChange(currentQuestion.id, currentQuestion.type, e.target.value)}
              >
                {currentQuestion.choice.map((choice, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={choice.id}
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
                        checked={currentAnswer?.answer?.includes(choice.id) || false}
                        onChange={(e) => handleLabAnswerChange(currentQuestion.id, 6, choice.id, e.target.checked)}
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
              <Typography>{errorMessage}</Typography>

              <Button
                variant='contained'
                sx={{
                  width: "25%"
                }}
                onClick={() => handleLabSubmit(courseId, enrollmentId)}
              >
                ส่งคำตอบ
              </Button>
            </Stack>
          </FormControl>
            
          <Pagination
            count={questions.length}
            page={currentQuestionIndex + 1}
            onChange={handleChangePage}
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