import React, { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom';

import ManualRead from './ManualRead'
import PdfRead from './PdfRead';
import TestRead from './TestRead';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';

function Reader({ 
  content = null, 
  question = null, 
  enrollmentId = null, 
  subjectId = null,
  mode = null 
}) {
  const { courseId } = useParams();
  const location = useLocation();
  const isPDF = content &&
    (
      (typeof content === 'string' && content.endsWith('.pdf')) ||
      (typeof content === 'object' && content !== null && (
        ('name' in content && 'file' in content && content.file instanceof File && content.file.type === 'application/pdf') ||
        ('content' in content && typeof content.content === 'string' && content.content.endsWith('.pdf'))
      ))
    );

  const isManual = content &&
    typeof content === 'object' &&
    !isPDF &&
    (
      (Array.isArray(content.content) && content.content.length > 0) ||
      !Array.isArray(content.content)
    );
  const isTest = Array.isArray(question) && question.length > 0;

  const availableModes = [
    { condition: isManual, label: "Manual" },
    { condition: isPDF, label: "PDF" },
    { condition: isTest, label: "Test" },
  ].filter(item => item.condition)
  .map(item => item.label);
  const [ confirmMode, setConfirmMode ] = useState(availableModes[0]);

  const pathShow = [
    `/add-subject/${courseId}/manual`, 
    `/add-subject/${courseId}/pdf`,
    `/add-subject/${courseId}/question`,
    `/edit-subject/${courseId}/${subjectId}`,
    `/course/${courseId}/subject/${subjectId}/${enrollmentId}`,
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`,
  ]
  const showContent = pathShow.includes(location.pathname);

  return (
    <Box>
      {(isManual && showContent && mode !== "submit") && <ManualRead subjectInput={content} />}

      {(isPDF && showContent && mode !== "submit") && 
        <PdfRead 
          subjectName={ isPDF ? content.name : "" } 
          fileUrl={ isPDF&&content.file ? content.file : `${import.meta.env.VITE_API_BASE_URL}/subjects${content.content}` } 
        />
      }

      {(isTest && showContent && mode !== "submit") && <TestRead question={question} />}

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
