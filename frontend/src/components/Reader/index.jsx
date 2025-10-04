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

  const isManual = content && 'content' in content && !isPDF &&
    (
      (Array.isArray(content.content) && content.content.length > 0) ||
      !Array.isArray(content.content)
    );
  const isTest = Array.isArray(question) && question.length > 0;

  const availableModes = [
    { condition: isManual, label: "เนื้อหาที่กำหนดเอง", value: "Manual" },
    { condition: isPDF, label: "เนื้อหาจากไฟล์ PDF", value: "PDF" },
    { condition: isTest, label: "ปฏิบัติการทดสอบ", value: "Test" },
  ].filter(item => item.condition);
  const [confirmMode, setConfirmMode] = useState(availableModes[0]?.value || "");

  const pathShow = [
    `/add-subject/${courseId}/manual`, 
    `/add-subject/${courseId}/pdf`,
    `/add-subject/${courseId}/question`,
    `/edit-subject/${courseId}/${subjectId}`,
    `/course/${courseId}/subject/${subjectId}/${enrollmentId}`,
    `/course/${courseId}/pretest/${enrollmentId}`,
    `/course/${courseId}/posttest/${enrollmentId}`,
    `/exam/${mode}/${courseId}`
  ]
  const showContent = pathShow.includes(location.pathname);

  return (
    <Box>
      
      {mode === "submit" && (
        <Stack
          alignItems="center"
          justifyContent="space-around"
          gap={2}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            margin: "20px auto",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <Typography variant='h5' fontWeight='600'>เนื้อหาที่ต้องการดู</Typography>
          <Select
            value={confirmMode}
            onChange={(e) => setConfirmMode(e.target.value)}
            sx={{ 
              width: { xs: "60%", sm: "30%"} 
            }}
          >
            {availableModes.map((mode, index) => (
              <MenuItem key={index} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      )}

      {(isManual && showContent && mode !== "submit") && <ManualRead subjectInput={content} />}

      {(isPDF && showContent && mode !== "submit") && 
        <PdfRead 
          subjectName={ isPDF ? content.name : "" } 
          fileUrl={ isPDF&&content.file ? content.file : `http://${import.meta.env.VITE_DEV_URL}:${import.meta.env.VITE_BACKEND_PORT}/subjects${content.content}` } 
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
    </Box>
  );
}

export default Reader;
