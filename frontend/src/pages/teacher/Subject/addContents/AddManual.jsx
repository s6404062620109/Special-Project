import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from "@mui/material/styles";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";

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

function AddManual({ 
  subjectInput, 
  setSubjectInput, 
  addContent, 
  removeContent, 
  handleChange, 
  handleImageUpload, 
  removeImage,
  handlePreview,
  handleSubmit 
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();

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
          <Typography variant="h5" fontWeight='bold'>บทเรียน</Typography>
          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            ตัวอย่าง
          </Button>
        </Stack>
        
        <TextField 
          id="outlined-basic" 
          variant="outlined" 
          label="Subject Name"
          value={subjectInput.name}
          onChange={(e) => setSubjectInput({ ...subjectInput, name: e.target.value })}
          sx={{
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px white inset',
              WebkitTextFillColor: 'black',
              caretColor: 'black',
            },
          }}
        />

        <Stack
          gap={1}
        >
          <Typography variant="h5">เนื้อหาบทเรียน</Typography>
          {subjectInput.content.map((item, index) => (
            <Stack key={index} 
              gap={1} 
              sx={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                borderRadius: '8px' 
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">หัวข้อที่ {index + 1}</Typography>
                <IconButton onClick={() => removeContent(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <TextField 
                variant="outlined" 
                label="Topic Name"
                value={item.topic}
                onChange={(e) => handleChange(index, "topic", e.target.value)}
              />
              <TextField
                label="Topic Description"
                multiline
                rows={6}
                value={item.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
              />
              <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                อัพโหลดรูปภาพ
                <VisuallyHiddenInput type="file" onChange={(event) => handleImageUpload(index, event)} multiple />
              </Button>
              <Stack gap={1}>
                {item.imgs.map((img, imgIndex) => (
                  <Box key={imgIndex} sx={{ display: "flex", justifyContent: "center" }}>
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={img}
                        alt="preview"
                        style={{
                          width: "100%", 
                          height: "200px", 
                          objectFit: "cover", 
                          borderRadius: "4px", 
                        }}
                      />
                      <IconButton
                        onClick={() => removeImage(index, imgIndex)}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          padding: "2px",
                          zIndex: 1
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          ))}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={addContent}
          >
            เพิ่มเนื้อหา
          </Button>
        </Stack>
        
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
          onClick={() => {
            localStorage.removeItem('editMode');
            localStorage.removeItem('prevMode');
            localStorage.removeItem('selector-question-type');
            
            navigate(`/edit-course/${courseId}`);
          }}
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
  )
}

export default AddManual