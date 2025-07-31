import React, { useEffect, useState } from 'react';
import {
  Box, Button, IconButton, Stack, TextField, Typography, FormControl, InputLabel, MenuItem, Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChoiceItem from './ChoiceItem';

const QuestionItem = ({
  index,
  question,
  questionType,
  onQuestionChange,
  onTypeChange,
  onChoiceChange,
  onAddChoice,
  onDeleteChoice,
  onDeleteQuestion,
  onUpload,
  onOpenImg,
}) => {
    const [content, setContent] = useState(question.content);
    const [answer, setAnswer] = useState(question.answer);

    useEffect(() => {
        setContent(question.content);
    }, [question.content]);

    useEffect(() => {
        setAnswer(question.answer);
    }, [question.answer]);

    const handleBlurContent = () => {
        if (content !== question.content) {
        onQuestionChange(index, 'content', content);
        }
    };

    const handleBlurAnswer = () => {
        if (answer !== question.answer) {
        onQuestionChange(index, 'answer', answer);
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
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h6'>Question {index + 1}</Typography>
        <IconButton onClick={() => onDeleteQuestion(index)}>
          <DeleteIcon />
        </IconButton>
      </Stack>

      <Stack direction='row' alignItems='center' gap={2}>
        <TextField
          label="Question Content"
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlurContent}
        />
        <FormControl sx={{ width: '40%' }}>
          <InputLabel id={`question-type-label-${index}`}>Type</InputLabel>
          <Select
            labelId={`question-type-label-${index}`}
            value={question.type}
            label="Type"
            onChange={(e) => onTypeChange(index, e.target.value)}
          >
            {questionType.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box 
        sx={{ 
          width: '100%', 
          borderRadius: '8px' 
        }}
      >
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
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(0.9)',
                border: "1px solid #000"
              }
            }}
            onClick={() => onOpenImg(index)}
          />
        ) : (
          <Button startIcon={<AddIcon />} onClick={() => onOpenImg(index)}>
            Add Picture
          </Button>
        )}
      </Box>

      {/* เงื่อนไข Choice */}
      {(question.type === 1 || question.type === 2 || question.type === 3 || question.type === 6) && (
        <>
          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='h6'>Choice</Typography>
            <IconButton onClick={() => onAddChoice(index)}>
              <AddIcon />
            </IconButton>
          </Stack>

          {Array.isArray(question.choice) &&
            question.choice.map((choice, choiceIndex) => (
              <ChoiceItem
                key={choiceIndex}
                choice={choice}
                choiceIndex={choiceIndex}
                onChange={(field, value) => onChoiceChange(index, choiceIndex, field, value)}
                onDelete={() => onDeleteChoice(index, choiceIndex)}
              />
            ))}
        </>
      )}

      {(question.type === 4 || question.type === 5) && (
        <>
          <Stack direction="row" alignItems="center" gap={2}>
            {question.type === 5 && (
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => onUpload(index, question.type === 5 ? "lab" : "lab")}
                fullWidth
              >
                HTML Files
              </Button>
            )}

            {question.type === 4 && (
              <Button
                variant="outlined"
                color='secondary'
                startIcon={<CloudUploadIcon />}
                onClick={() => onUpload(index, "cmd")}
                fullWidth
              >
                Cmd File
              </Button>
            )}
          </Stack>

          <TextField
            label="Answer"
            fullWidth
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onBlur={handleBlurAnswer}
          />
        </>
      )}
    </Stack>
  );
};

export default React.memo(QuestionItem);