import React from 'react';

import { Dialog, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Reader from '../../../../components/Reader';

function Preview({
  subjectInput,
  questionInput,
  PreviewPopupOpen,
  setPreviewPopupOpen
}) {

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
                  width: { xs: '90%', sm: '70%' },
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
        
        <Reader 
          content={subjectInput}
          question={questionInput}
        />

    </Dialog>
  )
}

export default Preview