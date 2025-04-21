import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Box, Button, Stack, Typography, styled } from "@mui/material";
import PreviewIcon from '@mui/icons-material/Preview';
import AddIcon from '@mui/icons-material/Add';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function AddPdf({
  handlePreview,
  file,
  setFile,
  inputRef,
  handleBoxClick,
  handleFileChange,
  handleSubmit,
  pdfValidation
}) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  return (
    <Stack
      justifyContent='space-around'
      alignItems='center'
      gap={2}
      sx={{
        width: "100%",
        marginTop: "20px"
      }}
    >
      <Stack
        sx={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: { xs: '90%', sm: '50%' }
        }}
        gap={2}
      >
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            Subject
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Preview
          </Button>
        </Stack>

        <Box
          onClick={handleBoxClick}
          sx={{
            width: '100%',
            height: '200px', 
            border: '1px dashed #b3b3b3',
            borderRadius: '8px',
            position: 'relative',
            '&:hover': {
              borderColor: '#888',
              background: '#f0f0f0',
              cursor: 'pointer'
            }
          }}
        >
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {file ? (
              <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            ) : (
              <Stack
                justifyContent="center"
                alignItems="center"
              >
                <AddIcon
                  sx={{
                    color: '#b3b3b3'
                  }}
                />
              <Typography variant="h6" sx={{ color: '#b3b3b3' }}>Upload PDf here.</Typography>
              </Stack>
              
            )}
          </Stack>
          
          
          <VisuallyHiddenInput
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            multiple
            accept="application/pdf"
          />
        </Box>
      </Stack>

      <Stack
        sx={{
          width: { xs: "60%", sm: "40%" },
          gap: 2,
          flexDirection: { xs: "column", sm: "row" }
        }}
      >
        <Button 
          variant='outlined' 
          sx={{
            background: "red",
            color: "white",
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={() => navigate(`/edit-course/${courseId}`)}
        >
          Cancel
        </Button>
        <Button 
          variant='contained'
          sx={{
            width: { xs: '100%', sm: '50%' }
          }}
          onClick={handleSubmit}
        >
          Next
        </Button>
        
      </Stack>     
      
    </Stack>
  );
}

export default AddPdf;
