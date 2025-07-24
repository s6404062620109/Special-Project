import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Typography, Select, MenuItem, IconButton, TextField } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function TestRead({ question, handleAnswerChange, selectedAnswers = null }) {
  const location = useLocation();
  const { courseId, enrollmentId, subjectId } = useParams();
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [ selectedType, setSelectedType ] = useState('all');
  const [ QuestionType, setQuestionType ] = useState([]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedType]);
  
  const handleNext = () => {
    if (currentIndex < question.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const uniqueTypes = [...new Set(question.map(q => q.type)), 'all'];
  
  const filteredQuestions = selectedType === 'all'
    ? question
    : question.filter(q => q.type === selectedType);

  const currentItem = filteredQuestions[currentIndex];
  const pathsToShow = [
    `/add-subject/${courseId}/question`,
    `/add-subject/${courseId}/submit`,
    `/edit-subject/${courseId}/${subjectId}`,
  ];
  const pathsToSelected = [ 
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`
  ]
  
  const showSelector = pathsToShow.includes(location.pathname);
  const canSelected = pathsToSelected.includes(location.pathname);

  const isInteractive = typeof handleAnswerChange === 'function' && selectedAnswers;
  return (
    <Stack
      gap={2}
      sx={{
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant='h5' fontWeight='bold'>Question</Typography>

        {showSelector && (
          <Select
            defaultValue='All'
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ width: 200 }}
          >
            {uniqueTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type === 'all' && 'All'}
                {type === 1 && "Pre"}
                {type === 2 && "Post"}
                {type === 3 && "lab-Quiz"}
                {type === 4 && "Lab-VM"}
                {type === 5 && "Lab-Web"}
                {type === 6 && "Lab-Multiple_Correct"}
                {type !== 1 && type !== 2 && type !== 3 && type !== 4 && type !== 'all' && type}
              </MenuItem>
            ))}
          </Select>
        )}
      </Stack>
      
      {currentItem && (
        <Stack gap={2}>
          
          {currentItem.img && (
            <img
              src={currentItem.img}
              alt="Question Image"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
          )}
        
          {(currentItem.type === 1 || currentItem.type === 2 || currentItem.type === 3 || currentItem.type === 6) && (
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">{currentIndex + 1}. {currentItem.content}</FormLabel>
              {isInteractive ? (
                <RadioGroup
                  aria-labelledby="question-label"
                  name="radio-buttons-group"
                  value={selectedAnswers[currentItem.qId] || ''}
                  onChange={(e) => handleAnswerChange(currentItem.qId, e.target.value)}
                >
                  {currentItem.choice.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice.aId}
                      disabled={!canSelected}
                      control={<Radio />}
                      label={choice.content}
                      checked={selectedAnswers[currentItem.qId] === String(choice.aId)}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  aria-labelledby="question-label"
                  name="radio-buttons-group"
                >
                  {currentItem.choice.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice.aId}
                      disabled={!canSelected}
                      control={<Radio />}
                      label={choice.content}
                    />
                  ))}
                </RadioGroup>
              )}
            </FormControl>
          )}
          
          {(currentItem.type === 4) && (
            <Stack
              gap={2}
            >
              <Typography variant="h6">{currentIndex + 1}. {currentItem.content}</Typography>

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="center"
                gap={2}
              >
                {currentItem.Labfiles.length>0 &&(
                  <Stack>
                    <Typography variant="h6">Lab Files</Typography>
                    {currentItem.Labfiles.map((file, index) => (
                      <Typography key={index} variant="body2">{index+1}. {file.name}</Typography>
                    ))}
                  </Stack>
                )}
                {currentItem.Cmdfile && (
                  <Stack>
                    <Typography variant="h6">Cmd File</Typography>
                    <Typography variant="body2">- {currentItem.Cmdfile.name}</Typography>
                  </Stack>
                )}
              </Stack>

              <TextField
                label="Answer"
                value={currentItem.answer || ""}
                disabled={!canSelected}
              />
            </Stack>
          )}
        </Stack>
      )}

      <Stack direction="row" alignItems="center" justifyContent="center" pt={2}>
        <IconButton onClick={handlePrev} disabled={currentIndex === 0}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="body2">{currentIndex + 1} / {filteredQuestions.length}</Typography>
        <IconButton onClick={handleNext} disabled={currentIndex === filteredQuestions.length - 1}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Stack>
    </Stack>
  )
}

export default TestRead