import React, { useState } from 'react';
import backend from '../../../api/backend';
import {
  Alert,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
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

import style from './css/popup.module.css';
import ClearIcon from '@mui/icons-material/Clear';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function SettingPopup({ courseInfo, subject, count_questions, count_labs, onClose, onSave }) {
    const [ courseData, setCourseData ] = useState({
        enable: courseInfo.enable,
        announcement: courseInfo.announce_state,
        pretest_rate: courseInfo.pretest_rate,
        posttest_rate: courseInfo.posttest_rate,
        duration_days: courseInfo.duration_days,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const announce_state = [
        { name: "ยังไม่ประกาศผล", value: 0 },
        { name: "คะแนนแบบทดสอบก่อนเรียน", value: 1 },
        { name: "แสดงคะแนนรวมทั้งหมด", value: 2 },
        { name: "แสดงคะแนนและรายละเอียด", value: 3 },
    ];
  
    const getValidationErrors = (showError = false) => {
        const errors = [];

        if (subject.length === 0) {
            errors.push("ต้องมีบทเรียนอย่างน้อย 1 บทเรียน");
        }
        if (count_questions < 5) {
            errors.push("ต้องมีข้อสอบในคลังอย่างน้อย 5 ข้อ");
        }
        if (count_labs < 1) {
            errors.push("ต้องมีปฏิบัติการในบทเรียนอย่างน้อย 1 ข้อ");
        }
        if (courseData.pretest_rate < 1) {
            errors.push("ต้องกำหนดจำนวนข้อสอบก่อนเรียนอย่างน้อย 1 ข้อ");
        }
        if (courseData.posttest_rate < 1) {
            errors.push("ต้องกำหนดจำนวนข้อสอบหลังเรียนอย่างน้อย 1 ข้อ");
        }
        if (courseData.pretest_rate > count_questions || courseData.posttest_rate > count_questions) {
            errors.push(`จำนวนข้อสอบก่อน/หลังเรียนต้องไม่เกิน ${count_questions} ข้อ`);
        }
        
        if (errors.length > 0 && showError) {
            setSnackbar({ open: true, message: errors[0], severity: 'warning' });
        }
        return errors;
    };  

    const handleSave = async (e) => {
        e.preventDefault();
        
        // ตรวจสอบค่า rate ที่ป้อนเข้ามาเสมอ
        if (Number(courseData.pretest_rate) < 1 || Number(courseData.posttest_rate) < 1 || Number(courseData.pretest_rate) > count_questions || Number(courseData.posttest_rate) > count_questions) {
            getValidationErrors(true); // เรียกเพื่อแสดง Snackbar แต่ไม่ใช้ค่า return
            return;
        }

        // ตรวจสอบความพร้อมของคอร์สเฉพาะตอนที่จะเปิดเผยแพร่
        if (courseData.enable) {
            const validationErrors = getValidationErrors(true);
            if (validationErrors.length > 0) return;
        }

        try {
            const response = await backend.put(`/teacher/updateCourseSettings/${courseInfo.id}`,
                {
                    enable: Number(courseData.enable),
                    announcement: Number(courseData.announcement),
                    pretest_rate: Number(courseData.pretest_rate),
                    posttest_rate: Number(courseData.posttest_rate),
                    duration_days: courseData.duration_days ? Number(courseData.duration_days) : null,
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
            Number(courseData.posttest_rate) !== courseInfo.posttest_rate ||
            Number(courseData.duration_days) !== courseInfo.duration_days;

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
        Number(courseData.posttest_rate) !== courseInfo.posttest_rate ||
        Number(courseData.duration_days) !== courseInfo.duration_days;

    const validationErrors = getValidationErrors();
    const isCourseValidForEnable = validationErrors.length === 0;
    
    // เงื่อนไขหลักในการเปิดใช้งานฟอร์มตั้งค่า
    const isReadyForSettings = subject.length >= 1 && count_questions >= 5 && count_labs >= 1;

    return (
        <div className={style.popupOverlay}>
            <div className={style.popupContent}>
                <Typography variant='h5' sx={{ fontWeight: '600' }}>
                    ตั้งค่าคอร์สเรียน
                </Typography>

                <Divider 
                    sx={{ 
                        borderColor: '#000000ff', 
                        marginBottom: 2,
                        borderWidth: '1px' }} />

                <form onSubmit={handleAttemptSave} className={style.formWrapper}>
                    {!isReadyForSettings && (
                        <Stack sx={{ mb: 2, p: 2, border: '1px solid #ffa726', borderRadius: '4px', bgcolor: '#fff3e0' }}>
                            <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'bold', fontSize: "20px" }}>
                                ต้องดำเนินการให้ครบตามเงื่อนไขก่อนจึงจะสามารถตั้งค่าได้:
                            </Typography>
                            <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                                {subject.length < 1 && <li><Typography variant="caption" color="warning.dark" fontSize="16px">ต้องมีบทเรียนอย่างน้อย 1 บทเรียน</Typography></li>}
                                {count_questions < 5 && <li><Typography variant="caption" color="warning.dark" fontSize="16px">ต้องมีข้อสอบในคลังอย่างน้อย 5 ข้อ</Typography></li>}
                                {count_labs < 1 && <li><Typography variant="caption" color="warning.dark" fontSize="16px">ต้องมีปฏิบัติการในบทเรียนอย่างน้อย 1 ข้อ</Typography></li>}
                            </ul>
                        </Stack>
                    )}

                    <FormControl fullWidth>
                        <InputLabel id="announcement-label">รูปแบบประกาศคะแนน</InputLabel>
                        <Select
                            labelId="announcement-label"
                            value={courseData.announcement}
                            onChange={(e) => setCourseData({ ...courseData, announcement: e.target.value })}
                            label="รูปแบบประกาศคะแนน"
                            disabled={!isReadyForSettings}
                            MenuProps={{ disablePortal: true }}
                        >
                            {announce_state.map((a) => (
                                <MenuItem key={a.value} value={a.value}>
                                    {a.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        variant="outlined"
                        label="จำนวนวันที่ควรเรียนจบ (ไม่บังคับ)"
                        type="number"
                        value={courseData.duration_days || ''}
                        onChange={(e) => setCourseData({ ...courseData, duration_days: e.target.value === '' ? null : e.target.value })}
                        fullWidth
                        disabled={!isReadyForSettings}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="clear duration days"
                                        onClick={() => setCourseData({ ...courseData, duration_days: null })}
                                        edge="end"
                                        disabled={!isReadyForSettings || courseData.duration_days === null}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            inputProps: {
                                min: 1,
                            },
                        }}
                    />

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
                            disabled={!isReadyForSettings}
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
                            disabled={!isReadyForSettings}
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
                                checked={Boolean(courseData.enable)}
                                onChange={(e) => {
                                    const errors = getValidationErrors();
                                    if (e.target.checked && errors.length > 0) {
                                        setSnackbar({ open: true, message: `ยังไม่สามารถเผยแพร่ได้: ${errors[0]}`, severity: 'warning' });
                                        return;
                                    }
                                    setCourseData({ ...courseData, enable: e.target.checked });
                                }}
                                disabled={!isReadyForSettings}
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