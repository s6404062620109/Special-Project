import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';

function Labs({ 
    questions,
    handleLabSpawn = null,
    answers,
    handleLabAnswerChange
 }) {

  return (
    <Stack>
        <Typography variant='h6'>Lab Questions</Typography>

        <Stack
            direction="column"
            alignItems="flex-start"
            justifyContent="center"
            gap={2}
            sx={{
                width: "80%",
                margin: "8px auto"
            }}
        >
            {questions.map((question, ind) => (
                <FormControl key={ind}
                    sx={{
                        width: "100%",
                        margin: "8px auto",
                        border: "1px solid #b3b3b3",
                        padding: "16px",
                        borderRadius: "8px",
                    }}
                > 
                    <FormLabel>{ind+1}. {question.content}</FormLabel>

                    {question.img && (
                        <img
                            src={question.img}
                            alt={`Question ${ind + 1} Image`}
                        />
                    )}

                    {question.type === 3 && (
                        <RadioGroup
                            sx={{
                                width: "80%",
                                margin: "8px auto"
                            }}
                            aria-labelledby="question-label"
                            name="radio-buttons-group"
                            value={answers[question.id]?.answer || ""}
                            onChange={(e) => handleLabAnswerChange(question.id, e.target.value)}
                        >
                            {question.choice.map((choice, ind) => (
                                <FormControlLabel 
                                    key={ind} 
                                    value={choice.id} 
                                    control={<Radio />} 
                                    label={choice.content}
                                />
                            ))}
                        </RadioGroup>
                    )}

                    {(question.type === 4 && handleLabSpawn)&&(
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            gap={2}
                            sx={{
                                width: "80%",
                                margin: "8px auto"
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Answer"
                                value={answers[question.id]?.answer || ""}
                                onChange={(e) => handleLabAnswerChange(question.id, e.target.value)}
                                disabled={!handleLabSpawn}
                            />

                            <Button
                                variant='contained'
                                onClick={() => handleLabSpawn(question.id)}
                            >
                                สร้างห้องจำลอง
                            </Button>
                        </Stack>
                    )}
                    
                </FormControl>
            ))}
        </Stack>
        
    </Stack>
  )
}

export default Labs