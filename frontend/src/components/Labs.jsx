import { useState } from 'react';
import { Button, FormControl, FormControlLabel, FormLabel, Pagination, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';

function Labs({ 
    questions,
    handleLabSpawn = null,
    answers,
    handleLabAnswerChange
 }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleChangePage = (event, value) => {
        setCurrentQuestionIndex(value - 1);
    };

    const currentQuestion = questions[currentQuestionIndex];

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

            {(currentQuestion.type === 3 || currentQuestion.type === 6) && (
              <RadioGroup
                sx={{ width: "80%", margin: "8px auto" }}
                name={`radio-group-${currentQuestion.id}`}
                value={answers[currentQuestion.id]?.answer || ""}
                onChange={(e) => handleLabAnswerChange(currentQuestion.id, e.target.value)}
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
                  value={answers[currentQuestion.id]?.answer || ""}
                  onChange={(e) => handleLabAnswerChange(currentQuestion.id, e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => handleLabSpawn(currentQuestion.id)}
                >
                  สร้างห้องจำลอง
                </Button>
              </Stack>
            )}
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