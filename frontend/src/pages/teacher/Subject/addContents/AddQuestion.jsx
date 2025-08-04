import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VisuallyHiddenInput } from './AddPdf';

import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function AddQuestion({
  questionInput, 
  questionType,
  handleOpenLabUpload,
  handleOpenImgDialog,
  addQuestion, 
  deleteQuestion, 
  handleQuestionChange, 
  handleChoiceChange, 
  addChoice, 
  deleteChoice,
  handlePreview, 
  handleSubmit 
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();  

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
            onClick={handlePreview}
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
                  onClick={() => deleteQuestion(index)}
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
                  onChange={(e) => handleQuestionChange(index, "content", e.target.value)}
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
                    onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                  >
                    {questionType.map((item) => (
                      <MenuItem key={item} value={item.id}>
                        {item.name_type}
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
                {question.img ? (
                  <Box
                    component="img"
                    src={question.img}
                    alt="Question Image"
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      transition: 'opacity 0.3s',
                      '&:hover': {
                        border: "1px solid #000"
                      },
                    }}
                    onClick={() => handleOpenImgDialog(index)}
                  />
                ):(
                  <Button 
                    startIcon={<AddIcon />}
                    color='#888'
                    onClick={() => handleOpenImgDialog(index)}
                  >
                    Add Picture
                  </Button>
                )}
                
                {(question.type === 1 || question.type === 2 || question.type === 3) &&(
                  <>
                    <Stack direction='row' alignItems='center' justifyContent='space-between'>
                      <Typography variant='h6'> Choice </Typography>

                      <IconButton 
                        onClick={() => addChoice(index)}
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
                            onChange={(e) => handleChoiceChange(index, choiceIndex, "content", e.target.value)}
                          />
                          <FormControlLabel 
                            control={
                              <Checkbox 
                                checked={choice.isCorrect}
                                onChange={(e) => handleChoiceChange(index, choiceIndex, "isCorrect", e.target.checked)} 
                              />
                            } 
                            label="Correct"
                            sx={{
                              width: { xs: '100%', sm: '30%' },
                            }} 
                          />
                        </Stack>

                        <IconButton
                          onClick={() => deleteChoice(index, choiceIndex)}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </Stack>
                    ))}
                  </>
                )}
                
                {(question.type === 4) && (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{
                        width: "100%",
                        gap: 2,
                        marginBottom: "16px",
                      }}
                    >
                      <Button 
                        variant="outlined"
                        color='secondary' 
                        startIcon={<CloudUploadIcon />}
                        onClick={() => handleOpenLabUpload(index, "cmd")}
                        sx={{
                          width: "100%",
                        }}
                      >
                        Cmd File
                      </Button>
                    </Stack>

                    <Stack>
                      <TextField
                        label="Answer"
                        fullWidth
                        value={question.answer}
                        onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                      />
                    </Stack>
                  </>
                )}

              </Box>
            </Stack>
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addQuestion}
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
          onClick={() => {
            localStorage.removeItem('editMode');
            localStorage.removeItem('prevMode');
            localStorage.removeItem('selector-question-type');
            
            navigate(`/edit-course/${courseId}`);
          }}
        >
          Cancel
        </Button>

        <Button 
          variant='contained'
          sx={{
            background: "green",
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={handleSubmit}
        >
          Confirm
        </Button>
              
      </Stack>
    </Stack>
  )
}

export default AddQuestion