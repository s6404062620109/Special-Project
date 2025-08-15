import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import backend from '../../api/backend';

import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Typography, Select, MenuItem, IconButton, TextField } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function TestRead({ question, handleAnswerChange, selectedAnswers = null }) {
  const location = useLocation();
  const { courseId, enrollmentId, subjectId } = useParams();
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [ selectedType, setSelectedType ] = useState('all');
  const [ cmdFileContent, setCmdFileContent ] = useState('');
  const [ htmlFileContent, setHtmlFileContent ] = useState('');
  const [ questionType, setQuestionType ] = useState([]);

  const fetchQuestionType = async () => {
    try{
      const response = await backend.get(`/teacher/getQuestionType`, {withCredentials: true});
      
      if(response.status === 200){
        const types_question = question.map(question => question.type);
        const uniqueTypes = [...new Set(types_question)];
        
        const filtered = response.data.result.filter(type => uniqueTypes.includes(type.id));

        setQuestionType(filtered);
      }

    } catch(error){
      console.log(error);
    }
  }

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
  ];
  const pathsToSelected = [ 
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`
  ]
  
  const showSelector = pathsToShow.includes(location.pathname) || localStorage.getItem("selector-question-type") === "true";
  const canSelected = pathsToSelected.includes(location.pathname);

  const isInteractive = typeof handleAnswerChange === 'function' && selectedAnswers;

  // question type ref from db
  useEffect(() => {
    fetchQuestionType();
  }, []);

  // initial currentIndex select question type 
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedType]);
  
  // read preview cmd file & html file
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
            <MenuItem value="all">All</MenuItem>
            {questionType.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name_type}
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
          
          {currentItem.type === 5 && currentItem.htmlFile && (
            <Stack gap={2}>
              <Typography variant="h6">{currentIndex + 1}. {currentItem.content}</Typography>

              <div
                dangerouslySetInnerHTML={{
                  __html: htmlFileContent
                }}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f9f9f9'
                }}
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
              <Typography variant="h6">{currentIndex + 1}. {currentItem.content}</Typography>

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