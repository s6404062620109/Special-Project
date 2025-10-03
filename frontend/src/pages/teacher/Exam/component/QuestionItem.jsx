import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChoiceItem from './ChoiceItem';
import { useParams } from 'react-router-dom';

const QuestionItem = ({
  index,
  question,
  onQuestionChange,
  onChoiceChange,
  onAddChoice,
  onDeleteChoice,
  onDeleteQuestion,
  onOpenImg,
}) => {
  const { mode } = useParams();
  const [content, setContent] = useState(question.content);

  useEffect(() => {
    setContent(question.content);
  }, [question.content]);

  const handleBlurContent = () => {
    if (mode === "delete") return; // ไม่แก้ไขใน delete mode
    if (content !== question.content) {
      onQuestionChange(index, 'content', content);
    }
  };

  return (
    <Stack
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">คำถามที่ {index + 1}</Typography>
        <IconButton onClick={() => onDeleteQuestion(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </Stack>

      <TextField
        label="Question Content"
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlurContent}
        disabled={mode === "delete"} // disable input เมื่อ delete mode
      />

      <Box sx={{ width: '100%', borderRadius: '8px' }}>
        {question.img ? (
          <Box
            component="img"
            src={question.img}
            alt="Question Image"
            sx={{
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              objectFit: 'cover',
              cursor: mode === "delete" ? "default" : "pointer",
              transition: 'transform 0.3s',
              '&:hover': {
                transform: mode === "delete" ? "none" : 'scale(0.9)',
                border: mode === "delete" ? "none" : '1px solid #000',
              },
            }}
            onClick={() => mode !== "delete" && onOpenImg(index)}
          />
        ) : (
          mode !== "delete" && (
            <Button startIcon={<AddIcon />} onClick={() => onOpenImg(index)}>
              เพิ่มรูปภาพ
            </Button>
          )
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">ตัวเลือก</Typography>
        {mode !== "delete" && (
          <IconButton onClick={() => onAddChoice(index)}>
            <AddIcon />
          </IconButton>
        )}
      </Stack>

      {Array.isArray(question.choices) &&
        question.choices.map((choice, choiceIndex) => (
          <ChoiceItem
            key={choiceIndex}
            choice={choice}
            choiceIndex={choiceIndex}
            onChange={(field, value) =>
              onChoiceChange(index, choiceIndex, field, value)
            }
            onDelete={() => onDeleteChoice(index, choiceIndex)}
          />
        ))}
    </Stack>
  );
};

export default React.memo(QuestionItem);
