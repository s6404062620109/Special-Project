import React, { useEffect, useState } from 'react';

import { Dialog, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


function PreviewManual({
    subjectInput,
    PreviewPopupOpen,
    setPreviewPopupOpen
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (PreviewPopupOpen) {
          setCurrentIndex(0);
        }
    }, [PreviewPopupOpen]);

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
    
    const currentItem = subjectInput.content[currentIndex];

  return (
    <Dialog
        open={PreviewPopupOpen}
        onClose={() => setPreviewPopupOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
            paper: {
                sx: {
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'white',
                  width: { xs: '90%', sm: '50%' },
                  position: 'relative'
                }
            }
        }}
    >
        <IconButton 
            onClick={() => setPreviewPopupOpen(false)}
            sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1
            }}
            size="small"
        >
            <CloseIcon fontSize="small" />
        </IconButton>
        
        <Stack
            gap={2}
        >
            <Typography variant='h5' fontWeight='bold'>{subjectInput.name}</Typography>

            {currentItem && (
                <Stack 
                    gap={2}
                >
                    <Typography variant='h6' fontWeight='600'>{currentItem.topic}</Typography>
                    {currentItem.description.split('\n').map((line, i) => (
                    <Typography
                        key={i}
                        variant="body1"
                        sx={{ mt: /^\s*$/.test(line) ? 2 : 0 }}
                    >
                        {line}
                    </Typography>
                    ))}
                    {currentItem.imgs?.map((img, imgIndex) => (
                    <img
                        key={imgIndex}
                        src={img}
                        alt="preview"
                        style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        }}
                    />
                    ))}
                </Stack>
            )}

            <Stack 
                direction="row"  
                alignItems='center' 
                justifyContent="center" 
                pt={2}
            >
                <IconButton
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ArrowBackIosIcon/>
                </IconButton>
                <Typography variant="body2">
                    {currentIndex + 1} / {subjectInput.content.length}
                </Typography>
                <IconButton
                    onClick={handleNext}
                    disabled={currentIndex === subjectInput.content.length - 1}
                >
                    <ArrowForwardIosIcon/>
                </IconButton>
            </Stack>
        </Stack>
    </Dialog>
  )
}

export default PreviewManual