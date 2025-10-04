import { useNavigate } from 'react-router-dom';

import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';

import PreviewIcon from '@mui/icons-material/Preview';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import QuestionItem from '../component/QuestionItem';

export const AddExam = ({
  questions,
  setPreviewOpen,
  handleQuestionChange,
  handleChoiceChange,
  handleAddquestion,
  handleAddChoice,
  handleDeleteQuestion,
  handleDeleteChoice,
  handleAddImg,
  handleDeleteImg,
  handleSubmit
}) => {
  const navigate = useNavigate();
  
  return (
    <Stack
      alignItems='center'
      sx={{
        width: "100%",
        marginTop: '20px',
        gap: 2,
      }}
    >
      <Box
        sx={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: "90%"
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h5' fontWeight='bold'>เพิ่มคำถามใหม่</Typography>

          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
            onClick={setPreviewOpen}
          >
            ดูตัวอย่าง
          </Button>
        </Stack>

        <Stack>
          {questions.map((question, index) => (
            <QuestionItem
              key={index}
              index={index}
              question={question}
              onQuestionChange={handleQuestionChange}
              onChoiceChange={handleChoiceChange}
              onAddChoice={handleAddChoice}
              onDeleteChoice={handleDeleteChoice}
              onDeleteQuestion={handleDeleteQuestion}
              onAddImg={handleAddImg}
              onDeleteImg={handleDeleteImg}
            />
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ marginTop: "20px" }}
          onClick={() => handleAddquestion()}
        >
          เพิ่มคำถามใหม่
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
          onClick={() => navigate(-1)}
        >
          ยกเลิก
        </Button>

        <Button 
          variant='contained'
          sx={{
            background: "green",
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={() => handleSubmit()}
        >
          ยืนยัน
        </Button>
              
      </Stack>
    </Stack>
  )
}
