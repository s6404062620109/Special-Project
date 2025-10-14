import React, { useState } from 'react';
import backend from '../../../api/backend';
import {
  Alert,
  Divider,
  FormControl,
  IconButton,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

import style from './css/editpopup.module.css';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function EditPopup({ courseInfo, subject, count_questions, count_labs, onClose, onSave }) {
  const [courseData, setCourseData] = useState({
    name: courseInfo.name,
    icon: courseInfo.icon,
    enable: courseInfo.enable,
    announcement: courseInfo.announce_state,
    pretest_rate: courseInfo.pretest_rate,
    posttest_rate: courseInfo.posttest_rate,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const announce_state = [
    { name: "ยังไม่ประกาศผล", value: 0 },
    { name: "คะแนนแบบทดสอบก่อนเรียน", value: 1 },
    { name: "แสดงคะแนนรวมทั้งหมด", value: 2 },
    { name: "แสดงคะแนนและรายละเอียด", value: 3 },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCourseData({ ...courseData, icon: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const courseInfoValidation = (showError = false) => {
    let errorMessage = '';    
    if (courseData.name.trim() === "") {
      errorMessage = "กรุณากรอกชื่อคอร์ส";
    }
    
    if (errorMessage && showError) {
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }

    return errorMessage || null; 
  };  

  const handleSave = async (e) => {
    e.preventDefault();

    const validationError = courseInfoValidation(true);
    if (validationError) return;

    try {
      const response = await backend.put(`/teacher/update/${courseInfo.id}`,
        {
          name: courseData.name,
          icon: courseData.icon
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        setTimeout(() => {
          onSave();
        }, 1500); 
      }
    } catch (error) {
      console.log(error);
      setSnackbar({ open: true, message: error?.response?.data?.message || "Error saving course", severity: 'error' });
    }
  };

  const isFormValid = courseData.name.trim() !== "";

  const handleAttemptSave = (e) => {
    e.preventDefault();
    const hasChanges = courseData.name !== courseInfo.name || courseData.icon !== courseInfo.icon;
    if (!hasChanges) {
      setSnackbar({ open: true, message: 'ไม่มีการเปลี่ยนแปลงข้อมูล', severity: 'info' });
    } else {
      handleSave(e);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className={style.popupOverlay}>
      <div className={style.popupContent}>
        <Typography 
          variant='h5'
          sx={{ 
            fontWeight: '600'
          }}
        >
          แก้ไขคอร์สเรียน
        </Typography>

        <Divider 
          sx={{ 
            borderColor: '#ccc', 
            marginBottom: 2,
            borderWidth: '1px',
            borderColor: '#000000ff'
          }}
        />
        <form onSubmit={handleAttemptSave} className={style.formWrapper}>

          <div className={style.fileInput}>
            <label>ไอคอนคอร์ส</label>
            <Stack 
              direction="column" 
              alignItems="center" 
              spacing={1}
              sx={{
                width: "100%",
              }}
            >
              <div
                className={style.previewImageContainer}
                onClick={() => document.getElementById("fileInput").click()}
              >
                {courseData.icon ? (
                  <img src={courseData.icon} alt="Preview" className={style.previewImage} />
                ) : (
                  <span className={style.uploadText}>Click to Upload</span>
                )}
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {courseData.icon && (
                <Button
                  variant='text'
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon/>}
                  onClick={() => setCourseData({ ...courseData, icon: null })}
                >
                  ลบรูปภาพ
                </Button>
              )}
            </Stack>
          </div>

          <div className={style.formGroup}>
            <TextField
              variant="outlined"
              label="ชื่อคอร์ส"
              type="text"
              value={courseData.name}
              onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
              fullWidth
              required
            />
          </div>

          <div className={style.buttonGroup}>
            <button type="button" onClick={onClose}>ยกเลิก</button>
            <button type="submit" disabled={!isFormValid}>บันทึก</button>
          </div>
        </form>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slots={{ transition: SlideTransition }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default EditPopup;
