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
  onAddImg,
  onDeleteImg,
}) => {
  const { mode } = useParams();
  const [content, setContent] = useState(question.content);

  useEffect(() => {
    setContent(question.content);
  }, [question.content]);

  const handleBlurContent = () => {
    if (mode === "delete") return;
    if (content !== question.content) {
      onQuestionChange(index, content, 'content');
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
        label="เนื้อหา"
        fullWidth
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlurContent}
        disabled={mode === "delete"}
      />

      <Box sx={{ width: '100%', borderRadius: '8px', position: 'relative' }}>
        {question.img ? (
          <>
            <Box
              component="img"
              src={question.img}
              alt="Question Image"
              sx={{
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            {mode !== "delete" && (
              <IconButton
                size="small"
                color="error"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255,255,255,0.7)',
                  '&:hover': { background: 'rgba(255,255,255,0.9)' },
                }}
                onClick={() => onDeleteImg(index)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          mode !== "delete" && (
            <>
              <input
                accept="image/*"
                type="file"
                id={`upload-img-${index}`}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) onAddImg(index, file);
                }}
              />
              <label htmlFor={`upload-img-${index}`}>
                <Button startIcon={<AddIcon />} component="span">
                  เพิ่มรูปภาพ
                </Button>
              </label>
            </>
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
