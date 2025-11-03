import React, { useContext, useEffect, useState } from "react";
import { Typography, Snackbar, Alert, Stack, Box, IconButton } from "@mui/material";

import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";
import style from "./css/profile.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

function Profile() {
  const { userData, setUserData } = useContext(AuthContext);
  const [ editMode, setEditMode ] = useState(false);
  const [ tempUserData, setTempUserData ] = useState({ ...userData });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setTempUserData({ ...userData });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!tempUserData.name.trim() || !tempUserData.surname.trim() || !tempUserData.email.trim()) {
        setSnackbar({ open: true, message: "กรุณากรอกชื่อ, นามสกุล, และอีเมลให้ครบถ้วน", severity: 'warning' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempUserData.email)) {
        setSnackbar({ open: true, message: "รูปแบบอีเมลไม่ถูกต้อง ตัวอย่าง example@email.com", severity: 'error' });
        return;
      }

      const thaiRegex = /^[ก-๏\s]+$/;
      const engRegex = /^[a-zA-Z\s]+$/;

      const isNameThai = thaiRegex.test(tempUserData.name);
      const isNameEng = engRegex.test(tempUserData.name);
      const isSurnameThai = thaiRegex.test(tempUserData.surname);
      const isSurnameEng = engRegex.test(tempUserData.surname);

      if (!isNameThai && !isNameEng) {
        setSnackbar({ open: true, message: "ชื่อต้องเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น และห้ามมีตัวอักษรพิเศษ", severity: 'error' });
        return;
      }
      if (!isSurnameThai && !isSurnameEng) {
        setSnackbar({ open: true, message: "นามสกุลต้องเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น และห้ามมีตัวอักษรพิเศษ", severity: 'error' });
        return;
      }

      if (isNameThai !== isSurnameThai || isNameEng !== isSurnameEng) {
        setSnackbar({ open: true, message: "ชื่อและนามสกุลต้องเป็นภาษาเดียวกัน", severity: 'error' });
        return;
      }

      if (JSON.stringify(tempUserData) === JSON.stringify(userData)) {
        setEditMode(false);
        return;
      }

      const response = await backend.put(`/auth/updateProfile/${userData.id}`,
        tempUserData, { withCredentials: true }
      );

      if (response.status === 200) {
        setUserData({ ...tempUserData });
        setEditMode(false);
        setSnackbar({ open: true, message: "อัปเดตโปรไฟล์สำเร็จ!", severity: 'success' });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({ open: true, message: error.response?.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้", severity: 'error' });
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await backend.post("/auth/forgot_password", {
        email: userData.email,
      });
      if (response.status === 200) {
        setSnackbar({ open: true, message: "ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว", severity: 'success' });
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      setSnackbar({ open: true, message: "ไม่สามารถส่งอีเมลสำหรับรีเซ็ตรหัสผ่านได้", severity: 'error' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      setSnackbar({ open: true, message: "ขนาดไฟล์ต้องไม่เกิน 16MB", severity: 'warning' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempUserData((prevData) => ({
        ...prevData,
        profile_img: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      const response = await backend.post('/auth/logout', 
        { email: userData.email }, 
        { withCredentials: true }
      );

      if(response.status === 200){
        localStorage.removeItem('email');
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        window.location.href = '/';
      } 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={style["profile-container"]}>
      <div className={style.container}>
        <div className={style.head}>
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            <label htmlFor={editMode ? "profile-image-upload" : undefined}>
              <Box
                component="img"
                alt="User Profile img"
                src={tempUserData.profile_img || "/Navbar_Assets/Profile.png"}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  cursor: editMode ? 'pointer' : 'default',
                  transition: 'opacity 0.2s ease-in-out',
                  '&:hover': {
                    opacity: editMode ? 0.6 : 1,
                  },
                }}
              />
            </label>

            {editMode && tempUserData.profile_img && (
              <IconButton
                aria-label="delete profile picture"
                onClick={() => setTempUserData(prev => ({ ...prev, profile_img: null }))}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
            disabled={!editMode}
          />
        </div>

        <Stack direction="row" spacing={4} justifyContent="flex-start" sx={{ mb: 2, width: '100%' }}>
          <Stack direction="row" alignItems="baseline" gap={1}>
            <Typography variant="h6">เพศ</Typography>
            <Typography variant="body1" color="text.secondary">
              {tempUserData.sex === "m" && "ชาย"}
              {tempUserData.sex === "f" && "หญิง"}
              {tempUserData.sex === "n" && "ไม่ระบุ"}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" gap={1}>
            <Typography variant="h6">บทบาท</Typography>
            <Typography variant="body1" color="text.secondary">
              {tempUserData.role === "s" && "นักเรียน"}
              {tempUserData.role === "t" && "อาจารย์"}
              {tempUserData.role === "a" && "ผู้ดูแลระบบ"}
            </Typography>
          </Stack>
        </Stack>

        <div className={style.body}>

          <div>
            <Typography variant="h6">ชื่อผู้ใช้</Typography>
            <input
              type="text"
              name="name"
              value={editMode ? tempUserData.name : userData.name}
              className={editMode ? style.editableInput : ""}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Typography variant="h6">นามสกุล</Typography>
            <input
              type="text"
              name="surname"
              value={editMode ? tempUserData.surname : userData.surname}
              className={editMode ? style.editableInput : ""}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Typography variant="h6">อีเมล</Typography>
            <input
              type="text"
              name="email"
              value={editMode ? tempUserData.email : userData.email}
              className={editMode ? style.editableInput : ""}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

        </div>

        <div className={style.footer}>
          {editMode ? (
            <>
              <button onClick={handleResetPassword}>รีเซ็ตรหัสผ่านใหม่</button>
              <div>
                <button onClick={handleSave}>บันทึก</button>
                <button onClick={toggleEditMode}>ยกเลิก</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={toggleEditMode}>แก้ไขข้อมูลส่วนตัว</button>
              <button onClick={handleLogout}>ออกจากระบบ</button>
            </>
          )}
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Profile;
