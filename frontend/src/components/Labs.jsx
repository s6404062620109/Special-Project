import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';

function Labs({ 
    questions,
    handleLabSpawn = null,
    answers,
    setAnswers
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

                    {question.choice && (
                        <RadioGroup
                            sx={{
                                width: "80%",
                                margin: "8px auto"
                            }}
                        >
                            {question.choice.map((choice, ind) => (
                                <FormControlLabel 
                                    key={ind} 
                                    value={choice.aId} 
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
                                value={question.answer || ""}
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