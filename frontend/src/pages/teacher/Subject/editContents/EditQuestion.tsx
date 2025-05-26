import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';


function EditQuestion({
  questionInput, 
  questionType,
  handleNext
}) {
  const { courseId } = useParams();
  const navigate = useNavigate();

  return (
    <Stack
      alignItems='center'
      sx={{
        marginTop: '20px',
        gap: 2,
      }}
    >
      <Box
        sx={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: { xs: '90%', sm: '50%' }
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h5' fontWeight='bold'>Question</Typography>

          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
          >
            Preview
          </Button>
        </Stack>

        <Stack>
          {questionInput.map((question, index) => (
            <Stack key={index}
              sx={{
                flexDirection: 'column',                
                marginTop: '20px',
                gap: 1,
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
              }}
            >
              <Stack 
                direction='row' 
                alignItems='center' 
                justifyContent='space-between'
              >
                <Typography variant='h6'>
                  Question {index + 1}
                </Typography>

                <IconButton
                >
                  <DeleteIcon/>
                </IconButton>
              </Stack>

              <Stack
                direction='row'
                alignItems='center' 
                gap={2}
                sx={{
                  width: '100%'
                }}
              >
                <TextField
                  label="Question Content"
                  fullWidth
                  value={question.content}
                />
                <FormControl
                  sx={{
                    width: '40%'
                  }}
                >
                  <InputLabel id={`question-type-label-${index}`}>Type</InputLabel>
                  <Select
                    labelId={`question-type-label-${index}`}
                    value={question.type}
                    label="Type"
                  >
                    {questionType.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                }}
              > 
                <Stack direction='row' alignItems='center' justifyContent='space-between'>
                  <Typography variant='h6'> Choice </Typography>

                  <IconButton 
                  >
                    <AddIcon/>
                  </IconButton>
                </Stack>
                
                {Array.isArray(question.choice) && question.choice.map((choice, choiceIndex) => (
                  <Stack key={choiceIndex}
                    sx={{
                      width: '90%',
                      margin: '16px auto',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }} 
                  >
                    <Typography variant='h6'>{choiceIndex + 1}</Typography>

                    <Stack 
                      sx={{
                        width: '90%',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: { xs: 0, sm: 2 },
                      }}
                    >
                      <TextField
                        label="Content"
                        fullWidth
                        value={choice.content}
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            checked={choice.isCorrect} 
                          />
                        } 
                        label="Correct"
                        sx={{
                          width: { xs: '100%', sm: '30%' },
                        }} 
                      />
                    </Stack>

                    <IconButton
                    >
                      <DeleteIcon/>
                    </IconButton>
                  </Stack>
                ))}

              </Box>
            </Stack>
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ marginTop: "20px" }}
        >
          Add Question
        </Button>
      </Box>

      <Stack
        sx={{
          width: { xs: "60%", sm: "40%" },
          gap: 2,
          flexDirection: { xs: "column", sm: "row" }
        }}
      >
        <Button 
          variant='outlined' 
          sx={{
            background: "red",
            color: "white",
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={() => navigate(`/edit-course/${courseId}`)}
        >
          Cancel
        </Button>

        <Button 
          variant='contained'
          sx={{
            background: "green",
            width: { xs: '100%', sm: '50%' }
          }}
        >
          Confirm
        </Button>
              
      </Stack>
    </Stack>
  )
}

export default EditQuestion