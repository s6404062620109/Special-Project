import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import ManualRead from './ManualRead'
import PdfRead from './PdfRead';
import TestRead from './TestRead';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';

function Reader({ 
  content,
  question, 
}) {
  const { mode } = useParams();
  const isPDF = ( typeof content === 'string' && content.endsWith('.pdf') ) || (
    typeof content === 'object' &&
    content !== null &&
    'name' in content &&
    'file' in content &&
    content.file instanceof File &&
    content.file.type === 'application/pdf'
  );
  const isManual = typeof content === 'object' && !isPDF && content;
  const isTest = Array.isArray(question) && question.length > 0;

  const availableModes = [
    { condition: isManual, label: "Manual" },
    { condition: isPDF, label: "PDF" },
    { condition: isTest, label: "Test" },
  ].filter(item => item.condition)
  .map(item => item.label);
  const [ confirmMode, setConfirmMode ] = useState(availableModes[0]);

  return (
    <Box>
      {(isManual) && <ManualRead subjectInput={content} />}

      {(isPDF) && <PdfRead subjectName={ isPDF ? content.name : "" } fileUrl={ isPDF ? content.file : content } />}

      {(isTest) && <TestRead question={question} />}

      {(mode === "submit") && (
        <Box
          sx={{
            width: "80%",
            margin: "20px auto",
            padding: "20px",
            borderRadius: "8px",
            background: "#f5f5f5f5"
          }}
        >
          {confirmMode === "Manual" && <ManualRead subjectInput={content} />}
          {confirmMode === "PDF" && <PdfRead subjectName={ isPDF ? content.name : "" } fileUrl={ isPDF ? content.file : content } />}
          {confirmMode === "Test" && <TestRead question={question} />}
        </Box>
      )}

      {mode === "submit" && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-around"
          sx={{
            width: { xs: "70%", sm: "25%" },
            margin: "20px auto",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Typography variant='h5' fontWeight='600'>Content</Typography>
          <Select
            defaultValue='All'
            value={confirmMode}
            onChange={(e) => setConfirmMode(e.target.value)}
            sx={{ width: "50%" }}
          >
            {availableModes.map((mode, index) => (
              <MenuItem key={index} value={mode}>
                {mode}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      )}
    </Box>
  );
}

export default Reader;
