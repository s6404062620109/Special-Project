import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import backend from '../../api/backend';

import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Typography, Select, MenuItem, IconButton, TextField } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function TestRead({ question, handleAnswerChange, selectedAnswers = null }) {
  const location = useLocation();
  const { courseId, enrollmentId, subjectId, mode } = useParams();
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [ selectedType, setSelectedType ] = useState('all');
  const [ cmdFileContent, setCmdFileContent ] = useState('');
  const [ htmlFileContent, setHtmlFileContent ] = useState('');
  const [ questionType, setQuestionType ] = useState([]);

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

  const filteredQuestions = selectedType === 'all'
    ? question
    : question.filter(q => q.type === Number(selectedType));

  const currentItem = filteredQuestions[currentIndex];
  const pathsToShow = [
    `/add-subject/${courseId}/submit`,
    `/edit-subject/${courseId}/${subjectId}`
  ];
  const pathsToSelected = [ 
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`
  ]
  
  const showSelector = pathsToShow.includes(location.pathname);
  const canSelected = pathsToSelected.includes(location.pathname);

  const isInteractive = typeof handleAnswerChange === 'function' && selectedAnswers;

  useEffect(() => {
    if(question.length > 0){
      setQuestionType([ 3, 5, 6 ]);
    }
  }, [question]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedType]);

  useEffect(() => {
    if (!currentItem) return;

    if (currentItem.type === 4 && currentItem.Cmdfile) {
      if (typeof currentItem.Cmdfile.content === 'string') {
        setCmdFileContent(currentItem.Cmdfile.content);
      } 
      else if (currentItem.Cmdfile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => setCmdFileContent(e.target.result);
        reader.onerror = () => setCmdFileContent('ไม่สามารถอ่านไฟล์ shell script ได้');
        reader.readAsText(currentItem.Cmdfile);
      } 
      else {
        setCmdFileContent('');
      }
    } 
    else {
      setCmdFileContent('');
    }

    if (currentItem.type === 5 && currentItem.htmlFile) {
      if (currentItem.htmlFile instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => setHtmlFileContent(e.target.result);
        reader.onerror = () => setHtmlFileContent('ไม่สามารถอ่านไฟล์ HTML ได้');
        reader.readAsText(currentItem.htmlFile);
      } 
      else if (typeof currentItem.htmlFile?.content === 'string') {
        setHtmlFileContent(currentItem.htmlFile.content);
      }
    } 
    else if (typeof currentItem?.htmlFile === 'string') {
      setHtmlFileContent(currentItem.htmlFile);
    } 
    else {
      setHtmlFileContent('');
    }
  }, [currentItem]);
  const pathRender = [
    `/exam/${mode}/${courseId}`,
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`,
    `/course/${courseId}/${enrollmentId}`
  ];
  const pathToRender = pathRender.includes(location.pathname);

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
        <Typography variant='h5' fontWeight='bold'>คำถาม</Typography>

        {showSelector && (
          <Select
            defaultValue='All'
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            MenuProps={{
              disablePortal: true
            }}
            sx={{ 
              width: 200,
            }}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {questionType.map((type) => (
              <MenuItem key={type} value={type}>
                {type === 3 && "เลือกคำตอบเพียง 1 คำตอบ"}
                {type === 5 && "เลือกคำตอบจากการกระทำ"}
                {type === 6 && "เลือกคำตอบหลายคำตอบ"}
              </MenuItem>
            ))}
          </Select>
        )}
      </Stack>
      
      {currentItem && (
        <Stack 
          gap={2}
        >
          
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
        
          {(pathToRender ||(currentItem.type === 3 || currentItem.type === 6)) && (
            <FormControl>
              <FormLabel 
                id="demo-radio-buttons-group-label"
              >
                {currentItem.content.split("\\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {currentIndex+1}.
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </FormLabel>
              {isInteractive ? (
                <RadioGroup
                  aria-labelledby="question-label"
                  name="radio-buttons-group"
                  value={selectedAnswers[currentItem.qId]?.answerId || ''}
                  onChange={(e) => handleAnswerChange(currentItem.qId, e.target.value, currentItem.choice.find(choice => choice.aId === Number(e.target.value)).content)}
                >
                  {currentItem.choices?.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice.aId}
                      disabled={!canSelected}
                      control={<Radio />}
                      label={choice.content}
                      checked={selectedAnswers[currentItem.qId]?.answerId === String(choice.aId)}
                    />
                  ))}
                  {currentItem.choice.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice.aId}
                      disabled={!canSelected}
                      control={<Radio />}
                      label={choice.content}
                      checked={selectedAnswers[currentItem.qId]?.answerId === String(choice.aId)}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  aria-labelledby="question-label"
                  name="radio-buttons-group"
                >
                  {currentItem.choices?.map((choice, index) => (
                    <FormControlLabel
                      key={index}
                      value={choice.aId}
                      disabled={!canSelected}
                      control={<Radio />}
                      label={choice.content}
                    />
                  ))}
                  {currentItem.choice?.map((choice, index) => (
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
          
          {currentItem.type === 5 && currentItem.htmlFile && (
            <Stack gap={2}>
              <Typography 
                variant="h6"
              >
                {currentItem.content.split("\\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>

              <iframe
                srcDoc={htmlFileContent}
                style={{ width: "100%", height: "600px", border: "none" }}
                sandbox="allow-scripts allow-same-origin"
              />

              <TextField
                label="Answer"
                value={currentItem.answer || ""}
                disabled={!canSelected}
              />
            </Stack>
          )}

          {(currentItem.type === 4) && (
            <Stack
              gap={2}
              fullWidth
            >
              <Typography 
                variant="h6"
              >
                {currentItem.content.split("\\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="center"
                gap={2}
              >
                {currentItem.Cmdfile && (
                  <Stack
                    sx={{
                      width: "80%"
                    }}
                  >
                    <Typography variant="h6">Cmd File</Typography>
                    <TextField
                      label="Shell Script Content"
                      multiline
                      minRows={6}
                      value={cmdFileContent}
                      fullWidth
                      slotProps={{
                        input: {
                          readOnly: true
                        }
                      }}
                    />

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