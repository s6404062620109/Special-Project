import React, { useState, useEffect } from 'react';
import backend from '../../../api/backend';
import {
  Menu,
  MenuItem,
  Autocomplete,
  Alert,
  Divider,
  InputAdornment,
  Slide,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Button,
  Chip,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

import style from './css/popup.module.css';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function EditPopup({ courseInfo, allTags = [], onClose, onSave }) {
  const [courseData, setCourseData] = useState({
    name: courseInfo.name,
    discription: courseInfo.discription,
    icon: courseInfo.icon,
    enable: courseInfo.enable,
    announcement: courseInfo.announce_state,
    pretest_rate: courseInfo.pretest_rate,
    posttest_rate: courseInfo.posttest_rate,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState(null);
  const [deletedTagIds, setDeletedTagIds] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCourseData({ ...courseData, icon: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // ให้ availableTags ถูกตั้งค่าเริ่มต้นโดยตัด tag ที่เป็น selected ออก
  useEffect(() => {
    const initialSelected = Array.isArray(courseInfo.tags) ? courseInfo.tags : [];
    setSelectedTags(initialSelected);

    // allTags มาจาก props (API) — ให้ remove tag ที่อยู่ใน selected ออก
    const initialAvailable = Array.isArray(allTags)
      ? allTags.filter((t) => !initialSelected.some((s) => String(s.id) === String(t.id)))
      : [];
    setAvailableTags(initialAvailable);
  }, [courseInfo, allTags]);

  const handleTagDelete = (tagToDelete) => {
    setSelectedTags((prev) => prev.filter((tag) => String(tag.id) !== String(tagToDelete.id)));

    const isOriginalTag = (courseInfo.tags || []).some(originalTag => String(originalTag.id) === String(tagToDelete.id));
    if (isOriginalTag) {
      setDeletedTagIds(prev => {
        if (prev.includes(tagToDelete.id)) return prev;
        return [...prev, tagToDelete.id];
      });
    }

    setAvailableTags((prev) => {
      const exists = prev.some((t) => String(t.id) === String(tagToDelete.id));
      if (exists) return prev;
      return [tagToDelete, ...prev];
    });
  };

  const handleAddTagSelect = (tagToAdd) => {
    setSelectedTags((prev) => {
      if (prev.some((t) => String(t.id) === String(tagToAdd.id))) return prev;
      return [...prev, tagToAdd];
    });

    setAvailableTags((prev) => prev.filter((t) => String(t.id) !== String(tagToAdd.id)));
    setDeletedTagIds((prev) => prev.filter((id) => String(id) !== String(tagToAdd.id)));

    handleTagMenuClose();
  };

  const handleAddTagClick = (event) => {
    setTagMenuAnchorEl(event.currentTarget);
  };

  const handleTagMenuClose = () => {
    setTagMenuAnchorEl(null);
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
          icon: courseData.icon,
          discription: courseData.discription,
          tags: selectedTags.map(tag => tag.id),
          deletedTags: deletedTagIds
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
    const infoChanged = courseData.name !== courseInfo.name || courseData.icon !== courseInfo.icon || courseData.discription !== courseInfo.discription;

    const initialTagIds = (courseInfo.tags || []).map(t => String(t.id)).sort();
    const currentTagIds = selectedTags.map(t => String(t.id)).sort();
    const tagsChanged = JSON.stringify(initialTagIds) !== JSON.stringify(currentTagIds);

    if (!infoChanged && !tagsChanged) {
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

  const unselectedTags = availableTags;

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
                  startIcon={<DeleteIcon />}
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

          <div className={style.formGroup}>
            <TextField
              variant="outlined"
              label="คำอธิบายคอร์ส"
              type="text"
              value={courseData.discription || ''}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setCourseData({ ...courseData, discription: e.target.value });
                }
              }}
              multiline
              rows={4}
              fullWidth
              slotProps={{ 
                maxLength: 255 
              }}
              helperText={(
                <Stack
                  flexDirection='row'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Typography variant='subtitle2'>{`${(courseData.discription || '').length}/255`}</Typography>
                  {courseData.discription && (
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={() => setCourseData({ ...courseData, discription: '' })}
                      sx={{
                        textTransform: 'none',
                        alignSelf: 'flex-end',
                        mt: 0.5,
                        color: 'text.secondary'
                      }}
                    >
                      ล้างข้อความ
                    </Button>
                  )}
                </Stack>
              )}
            />
          </div>

          <div className={style.formGroup}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '1rem' }}>
              แท็ก {"("}ไม่บังคับ{")"}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              {selectedTags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  size="small"
                />
              ))}
              {unselectedTags.length > 0 ? (
                <Chip
                  icon={<AddIcon />}
                  label="เพิ่มแท็ก"
                  onClick={handleAddTagClick}
                  variant="outlined"
                  size="small"
                  clickable
                />
              ) : (
                <Typography variant='subtitle1'>ไม่มีแท็กในระบบ</Typography>
              )}
            </Stack>
            <Menu
              anchorEl={tagMenuAnchorEl}
              open={Boolean(tagMenuAnchorEl)}
              onClose={handleTagMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    maxHeight: 200,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 2000
                  },
                },
              }}
            >
              {unselectedTags.map((tag) => (
                <MenuItem key={tag.id} onClick={() => handleAddTagSelect(tag)}>
                  {tag.name}
                </MenuItem>
              ))}
            </Menu>
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
