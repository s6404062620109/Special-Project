import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Pagination, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import QuestionItem from '../components/QuestionItem';

function AddQuestion({
  questionInput, 
  questionType,
  handleOpenLabUpload,
  handleOpenImgDialog,
  addQuestion, 
  deleteQuestion, 
  handleQuestionChange,
  handleQuestionTypeChange, 
  handleChoiceChange, 
  addChoice, 
  deleteChoice,
  handlePreview, 
  handleSubmit 
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();  
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const pageCount = Math.ceil(questionInput.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = questionInput.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0); // Scroll to top on page change
  };
  
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
          {currentQuestions.map((question, index) => {
            const originalIndex = startIndex + index;
            return (
              <QuestionItem
                key={question.id || originalIndex}
                index={originalIndex}
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
            );
          })}
        </Stack>

        <Stack
          alignItems='center'
          justifyContent='center'
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ marginTop: "20px" }}
          >
            เพิ่มปฏิบัติการทดสอบ
          </Button>
        </Stack>
        

        {pageCount > 1 && (
          <Stack 
            sx={{ 
              width: "100%",
              mt: 3 
            }}
          >
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            />
          </Stack>
        )}
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

export default AddQuestion