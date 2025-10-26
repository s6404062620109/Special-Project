import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Chip,
  TextField
} from '@mui/material';

function TestDialog({ open, onClose, testList, mode }) {
  if (!testList || testList.length === 0) {
    return null;
  }
  const totalScore = testList.reduce((acc, q) => acc + (q.score || 0), 0);
  const maxScore = testList.length;
  console.log(testList)
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {(mode === "pre" || mode === "post") && (
        <>
          <DialogTitle>
            <Typography variant="h5">
              ผลการทำแบบทดสอบ{mode === "pre" ? "ก่อนเรียน" : "หลังเรียน"}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Typography variant="h6" gutterBottom>
              คะแนนรวม: {totalScore} / {maxScore}
            </Typography>

            <Stack spacing={2}>
              {testList.map((question, index) => (
                <Stack
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    backgroundColor: question.is_correct ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    ข้อที่ {index + 1}: {question.content}
                  </Typography>

                  {question.img && (
                    <img
                      src={question.img}
                      alt={`Question Image ${index + 1}`}
                      style={{ maxWidth: "100%", marginTop: 12 }}
                    />
                  )}

                  {/* แสดงตัวเลือก */}
                  <Stack spacing={1} sx={{ pl: 2, mt: 1 }}>
                    {question.choice?.map((choice, cIndex) => {
                      const isSelected = question.user_answer === choice.content;
                      const isCorrect = choice.is_correct === 1;

                      return (
                        <Typography
                          key={cIndex}
                          sx={{
                            color: isSelected
                              ? isCorrect
                                ? 'green'
                                : 'red'
                              : 'inherit',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {String.fromCharCode(65 + cIndex)}. {choice.content}
                          {isCorrect && (
                            <Chip
                              label="คำตอบที่ถูก"
                              color="success"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {isSelected && (
                            <Chip
                              label="ที่คุณเลือก"
                              color={isCorrect ? 'success' : 'error'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      );
                    })}
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontStyle: 'italic',
                      color: question.is_correct ? 'green' : 'red'
                    }}
                  >
                    {question.is_correct
                      ? 'ตอบถูก ✔️'
                      : 'ตอบผิด ❌'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
        </>
      )}
      
      {mode === "lab" && (
        <>
          <DialogTitle>
            <Typography variant="h5">
              ผลการทำปฎิบัติการทดสอบ
            </Typography>
          </DialogTitle>

          <DialogContent dividers>

            <Stack spacing={2}>
              {testList.map((question, index) => (
                <Stack
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    backgroundColor: question.is_correct ? '#e8f5e9' : '#ffebee'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    ข้อที่ {index + 1}: {question.content}
                  </Typography>
                  
                  {question.img && (
                    <img
                      src={question.img}
                      alt={`Question Img ${index + 1}`}
                      style={{ maxWidth: "100%", marginTop: 12 }}
                    />
                  )}

                  {question.htmlFile && (
                    <Stack sx={{ width: "100%", margin: "8px auto" }} gap={2}>
                      <iframe
                        srcDoc={question.htmlFile.content}
                        sandbox="allow-scripts allow-same-origin"
                        style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
                      />
                      <TextField
                        disabled
                        fullWidth
                        label="คำตอบ"
                        value={question.user_answer || ''}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'rgba(0, 0, 0, 1)',
                            color: 'rgba(0, 0, 0, 1)',
                          },
                        }}
                      />
                    </Stack>
                  )}

                  <Stack spacing={1} sx={{ pl: 2, mt: 1 }}>
                    {question.choice?.map((choice, cIndex) => {
                      let isSelected = false;
                      if (question.type === 6) {
                        // type 6 → user_answer เป็น array
                        isSelected = question.user_answer?.includes(choice.content);
                      } else {
                        isSelected = question.user_answer === choice.content;
                      }
                      const isCorrect = choice.is_correct === 1;

                      return (
                        <Typography
                          key={cIndex}
                          sx={{
                            color: isSelected
                              ? isCorrect
                                ? 'green'
                                : 'red'
                              : 'inherit',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {String.fromCharCode(65 + cIndex)}. {choice.content}
                          {isCorrect && (
                            <Chip
                              label="คำตอบที่ถูก"
                              color="success"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {isSelected && (
                            <Chip
                              label="ที่คุณเลือก"
                              color={isCorrect ? 'success' : 'error'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      );
                    })}

                    {question.type === 4 && (
                      <TextField
                        disabled
                        fullWidth
                        label="คำตอบ"
                        value={question.user_answer || ''}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'rgba(0, 0, 0, 1)',
                            color: 'rgba(0, 0, 0, 1)',
                          },
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontStyle: 'italic',
                      color: question.is_correct ? 'green' : 'red'
                    }}
                  >
                    {question.is_correct
                      ? 'ตอบถูก ✔️'
                      : 'ตอบผิด ❌'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default TestDialog;
