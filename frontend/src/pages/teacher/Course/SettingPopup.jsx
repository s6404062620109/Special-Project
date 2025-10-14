import React, { useState } from 'react';
import backend from '../../../api/backend';
import {
  Alert,
  Button,
  Divider,
  FormControl,
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
} from "@mui/material";

import style from './css/editpopup.module.css';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function SettingPopup({ courseInfo, subject, count_questions, count_labs, onClose, onSave }) {
    const [courseData, setCourseData] = useState({
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

    const courseInfoValidation = (showError = false) => {
        let errorMessage = '';
        if (subject.length === 0) errorMessage = "กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน";
        else if (courseData.pretest_rate < 1) errorMessage = "กรุณาป้อนอัตราการเลือกข้อสอบก่อนเรียนอย่างน้อย 1 ข้อ";
        else if (courseData.pretest_rate > count_questions || courseData.posttest_rate > count_questions) errorMessage = `กรุณาป้อนอัตราการเลือกข้อสอบ ก่อน/หลังเรียน ไม่ให้เกิน ${count_questions} ข้อ`;
        else if (courseData.posttest_rate < 1) errorMessage = "กรุณาป้อนอัตราการเลือกข้อสอบหลังเรียนอย่างน้อย 1 ข้อ";
        else if (count_questions < 5) errorMessage = "กรุณาเพิ่มข้อสอบที่คลังข้อสอบอย่างน้อย 5 ข้อ";
        else if (count_labs < 5) errorMessage = "กรุณาเพิ่มปฎิบัติการทดสอบที่บทเรียนอย่างน้อย 5 ข้อ";
        
        if (errorMessage && showError) {
            setSnackbar({ open: true, message: errorMessage, severity: 'warning' });
        }
        return errorMessage || null; 
    };  

    const handleSave = async (e) => {
        e.preventDefault();

        const validationError = courseInfoValidation(true);
        if (validationError && courseData.enable) return;

        try {
            const response = await backend.put(`/teacher/updateCourseSettings/${courseInfo.id}`,
                {
                    enable: courseData.enable,
                    announcement: courseData.announcement,
                    pretest_rate: courseData.pretest_rate,
                    posttest_rate: courseData.posttest_rate,
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
            setSnackbar({ open: true, message: error?.response?.data?.message || "Error saving settings", severity: 'error' });
        }
    };

    const handleAttemptSave = (e) => {
        e.preventDefault();
        const hasChanges =
            courseData.enable !== courseInfo.enable ||
            courseData.announcement !== courseInfo.announce_state ||
            Number(courseData.pretest_rate) !== courseInfo.pretest_rate ||
            Number(courseData.posttest_rate) !== courseInfo.posttest_rate;

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

    const hasChanges =
        courseData.enable !== courseInfo.enable ||
        courseData.announcement !== courseInfo.announce_state ||
        Number(courseData.pretest_rate) !== courseInfo.pretest_rate ||
        Number(courseData.posttest_rate) !== courseInfo.posttest_rate;

    const isCourseValidForEnable = courseInfoValidation() === null;

    return (
        <div className={style.popupOverlay}>
            <div className={style.popupContent}>
                <Typography variant='h5' sx={{ fontWeight: '600' }}>
                    ตั้งค่าคอร์สเรียน
                </Typography>
                <Divider sx={{ borderColor: '#ccc', marginY: 2, borderWidth: '1px' }} />

                <form onSubmit={handleAttemptSave} className={style.formWrapper}>
                    <FormControl fullWidth>
                        <InputLabel id="announcement-label">รูปแบบประกาศคะแนน</InputLabel>
                        <Select
                            labelId="announcement-label"
                            value={courseData.announcement}
                            onChange={(e) => setCourseData({ ...courseData, announcement: e.target.value })}
                            label="รูปแบบประกาศคะแนน"
                            MenuProps={{ disablePortal: true }}
                        >
                            {announce_state.map((a) => (
                                <MenuItem key={a.value} value={a.value}>
                                    {a.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Stack 
                        direction={{ xs: "column", sm: "row" }} 
                        spacing={2}
                        sx={{
                            width: "100%"
                        }}
                    >
                        <TextField
                            variant="outlined"
                            label="จำนวนข้อสอบก่อนเรียน"
                            type="number"
                            value={courseData.pretest_rate}
                            onChange={(e) => setCourseData({ ...courseData, pretest_rate: e.target.value })}
                            fullWidth
                            required
                            sx={{ 
                                inputProps: { 
                                    min: 1, 
                                    max: count_questions 
                                } 
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="จำนวนข้อสอบหลังเรียน"
                            type="number"
                            value={courseData.posttest_rate}
                            onChange={(e) => setCourseData({ ...courseData, posttest_rate: e.target.value })}
                            fullWidth
                            required
                            sx={{ 
                                inputProps: { 
                                    min: 1, 
                                    max: count_questions 
                                } 
                            }}
                        />
                    </Stack>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={courseData.enable}
                                onChange={(e) => {
                                    const validationError = courseInfoValidation();
                                    if (e.target.checked && validationError) {
                                        setSnackbar({ open: true, message: validationError, severity: 'warning' });
                                        return;
                                    }
                                    setCourseData({ ...courseData, enable: e.target.checked });
                                }}
                                disabled={!isCourseValidForEnable && !courseData.enable}
                            />
                        }
                        label="เผยแพร่คอร์ส"
                    />

                    <div className={style.buttonGroup}>
                        <button type="button" onClick={onClose}>ยกเลิก</button>
                        <button type="submit" disabled={!hasChanges}>บันทึก</button>
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
    )
}

export default SettingPopup