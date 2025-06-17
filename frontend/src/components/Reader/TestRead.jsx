import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Typography, Select, MenuItem, IconButton } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function TestRead({ question, handleAnswerChange, selectedAnswers = null }) {
  const location = useLocation();
  const { courseId, enrollmentId, subjectId } = useParams();
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [ selectedType, setSelectedType ] = useState('all');
  
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
                {type === 'all' ? 'All' : type}
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