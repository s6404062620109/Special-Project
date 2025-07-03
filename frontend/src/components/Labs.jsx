import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';

function Labs({ 
    questions,
    handleLabSpawn = null,
 }) {

  return (
    <Stack>
        <Typography variant='h6'>Lab Questions</Typography>
        <Box>
            {questions.map((question, ind) => (
                <FormControl key={ind}> 
                    <FormLabel>{ind+1}. {question.content}</FormLabel>

                    {question.img && (
                        <img
                            src={question.img}
                            alt={`Question ${ind + 1} Image`}
                        />
                    )}

                    {question.choice && (
                        <RadioGroup>
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
                        <Button
                            variant='contained'
                            onClick={() => handleLabSpawn(question.id)}
                        >
                            สร้างห้องจำลอง
                        </Button>
                    )}
                    
                </FormControl>
            ))}
        </Box>
        
    </Stack>
  )
}

export default Labs