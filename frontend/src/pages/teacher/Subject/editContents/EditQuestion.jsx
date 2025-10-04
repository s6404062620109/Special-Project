import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import QuestionItem from '../components/QuestionItem';

function EditQuestion({
  questionInput, 
  questionType,
  handleOpenLabUpload,
  handleOpenImgDialog,
  handleQuestionChange,
  handleQuestionTypeChange,
  handleChoiceChange,
  addQuestion,
  addChoice,
  deleteQuestion,
  deleteChoice,
  handleSubmit,
  handlePreview,
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
          <Typography variant='h5' fontWeight='bold'>ปฏิบัติการทดสอบ</Typography>

          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            ดูตัวอย่าง
          </Button>
        </Stack>

        <Stack>
          {questionInput.map((question, index) => (
            <QuestionItem
              key={index}
              index={index}
              question={question}
              questionType={questionType}
              onQuestionChange={handleQuestionChange}
              onTypeChange={handleQuestionTypeChange}
              onChoiceChange={handleChoiceChange}
              onAddChoice={addChoice}
              onDeleteChoice={deleteChoice}
              onDeleteQuestion={deleteQuestion}
              onUpload={handleOpenLabUpload}
              onOpenImg={handleOpenImgDialog}
            />
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addQuestion}
          sx={{ marginTop: "20px" }}
        >
          เพิ่มปฏิบัติการทดสอบ
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
          ยกเลิก
        </Button>

        <Button 
          variant='contained'
          sx={{
            background: "green",
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={handleSubmit}
        >
          ยืนยัน
        </Button>
              
      </Stack>
    </Stack>
  )
}

export default EditQuestion