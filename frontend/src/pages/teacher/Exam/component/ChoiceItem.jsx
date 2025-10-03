import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Checkbox, FormControlLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ChoiceItem = ({ choice, choiceIndex, onChange, onDelete }) => {
  const { mode } = useParams();
  const [content, setContent] = useState(choice.content);

  useEffect(() => {
    setContent(choice.content);
  }, [choice.content]);

  const handleBlur = () => {
    if (mode === "delete") return; // ไม่แก้ไขอะไร
    if (content !== choice.content) {
      onChange("content", content);
    }
  };

  const handleCheckboxChange = (e) => {
    if (mode === "delete") return; // ไม่แก้ไขอะไร
    onChange("isCorrect", e.target.checked);
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
          disabled={mode === "delete"} 
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(choice.type)}
              onChange={handleCheckboxChange}
              disabled={mode === "delete"} 
            />
          }
          label="Correct"
          sx={{ width: { xs: '100%', sm: '30%' } }}
        />
      </Stack>

      <IconButton onClick={onDelete} color={mode === "delete" ? "error" : "default"}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

export default React.memo(ChoiceItem);
