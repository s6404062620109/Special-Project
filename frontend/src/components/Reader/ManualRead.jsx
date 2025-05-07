import React, { useState, useEffect } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ManualRead({ subjectInput }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isValidContent = Array.isArray(subjectInput?.content);
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [subjectInput]);

  const handleNext = () => {
    if (currentIndex < subjectInput.content.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentItem = isValidContent ? subjectInput.content[currentIndex] : null;

  if (!isValidContent) {
    return <Typography variant="h6">ไม่มีเนื้อหาสำหรับแสดงผล</Typography>;
  }

  return (
    <Stack 
      gap={2}
      sx={{
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      <Typography variant='h5' fontWeight='bold'>
        {subjectInput.name}
      </Typography>

      {currentItem && (
        <Stack 
          gap={2}
        >
          <Typography variant='h6' fontWeight='600'>
            {currentItem.topic}
          </Typography>

          {currentItem.description.split('\n').map((line, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{ 
                width: '100%',
                mt: /^\s*$/.test(line) ? 2 : 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'            
              }}
            >
              {line}
            </Typography>
          ))}

          <Stack
            gap={2}
            justifyContent='center'
            alignItems='center'
          >
            {currentItem.imgs?.map((img, imgIndex) => (
              <img
                key={imgIndex}
                src={img}
                alt="preview"
                style={{
                  width: '600px',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            ))}
          </Stack>
          
        </Stack>
      )}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        pt={2}
      >
        <IconButton onClick={handlePrev} disabled={currentIndex === 0}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="body2">
          {currentIndex + 1} / {subjectInput.content.length}
        </Typography>
        <IconButton
          onClick={handleNext}
          disabled={currentIndex === subjectInput.content.length - 1}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

export default ManualRead;
