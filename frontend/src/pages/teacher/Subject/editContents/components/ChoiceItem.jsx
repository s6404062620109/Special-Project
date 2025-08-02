import React, { useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ChoiceItem = ({ choice, choiceIndex, onChange, onDelete }) => {
  const [content, setContent] = useState(choice.content);

  useEffect(() => {
    setContent(choice.content);
  }, [choice.content]);

  const handleBlur = () => {
    if (content !== choice.content) {
      onChange("content", content);
    }
  };

  return (
    <Stack
      sx={{
        width: '90%',
        margin: '16px auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant='h6'>{choiceIndex + 1}</Typography>

      <Stack
        sx={{
          width: '90%',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: { xs: 0, sm: 2 },
        }}
      >
        <TextField
          label="Content"
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(choice.isCorrect)}
              onChange={(e) => onChange("isCorrect", e.target.checked)}
            />
          }
          label="Correct"
          sx={{ width: { xs: '100%', sm: '30%' } }}
        />
      </Stack>

      <IconButton onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

export default React.memo(ChoiceItem);
