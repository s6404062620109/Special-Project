import React, { useState } from 'react';
import backend from '../../../api/backend';
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import style from './css/editpopup.module.css';

function EditPopup({ courseInfo, subject, count_questions, count_labs, onClose, onSave }) {
  const [courseData, setCourseData] = useState({
    name: courseInfo.name,
    icon: courseInfo.icon,
    enable: courseInfo.enable,
    announcement: courseInfo.announce_state,
    pretest_rate: courseInfo.pretest_rate,
    posttest_rate: courseInfo.posttest_rate,
  });
  console.log(courseData)
  const announce_state = [
    { name: "คะแนนกำลังอยู่ในขั้นตอนการประเมินผล", value: 0 },
    { name: "คะแนนแบบทดสอบก่อนเรียน", value: 1 },
    { name: "คะแนนแบบทดสอบก่อนเรียนและหลังเรียน", value: 2 },
    { name: "คะแนนแบบทดสอบก่อนเรียน หลังเรียน และรายละเอียดการประเมินผล", value: 3 },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCourseData({ ...courseData, icon: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const courseInfoValidation = () => {
    if (courseData.name === "") return alert("กรุณากรอกชื่อคอร์ส");
    if (subject.length === 0) return alert("กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน");
    if (courseData.pretest_rate < 1) return alert("กรุณาป้อนอัตราการเลือกข้อสอบก่อนเรียนอย่างน้อย 1 ข้อ");
    if (courseData.pretest_rate > count_questions || courseData.pretest_rate > count_questions){
      return alert(`กรุณาป้อนอัตราการเลือกข้อสอบ ก่อน/หลังเรียน ไม่ให้เกิน ${count_questions} ข้อ`);
    }
    if (courseData.posttest_rate < 1) return alert("กรุณาป้อนอัตราการเลือกข้อสอบหลังเรียนอย่างน้อย 1 ข้อ");
    if (count_questions < 5) return alert("กรุณาเพิ่มข้อสอบที่คลังข้อสอบอย่างน้อย 5 ข้อ");
    if (count_labs < 5) return alert("กรุณาเพิ่มปฎิบัติการทดสอบที่บทเรียนอย่างน้อย 5 ข้อ");

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!courseInfoValidation()) return;

    try {
      const response = await backend.put(`/teacher/update/${courseInfo.id}`,
        {
          name: courseData.name,
          icon: courseData.icon,
          enable: courseData.enable,
          announce_state: courseData.announcement,
          pretest_rate: courseData.pretest_rate,
          posttest_rate: courseData.posttest_rate,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert(response.data.message);
        onSave();
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Error saving course");
    }
  };

  return (
    <div className={style.popupOverlay}>
      <div className={style.popupContent}>
        <form onSubmit={handleSave} className={style.formWrapper}>
          
          {/* ส่วนอัปโหลดไอคอน */}
          <div className={style.fileInput}>
            <label>ไอคอนคอร์ส</label>
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

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>รูปแบบประกาศคะแนน</InputLabel>
              <Select
                value={courseData.announcement}
                onChange={(e) => setCourseData({ ...courseData, announcement: e.target.value })}
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
              sx={{ mt: 2 }}
            >
              <TextField
                variant="outlined"
                label="อัตราการเลือกข้อสอบก่อนเรียน"
                type="number"
                value={courseData.pretest_rate}
                onChange={(e) => setCourseData({ ...courseData, pretest_rate: e.target.value })}
                fullWidth
                required
              />

              <TextField
                variant="outlined"
                label="อัตราการเลือกข้อสอบหลังเรียน"
                type="number"
                value={courseData.posttest_rate}
                onChange={(e) => setCourseData({ ...courseData, posttest_rate: e.target.value })}
                fullWidth
                required
              />
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={courseData.enable}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (!courseInfoValidation()) {
                        e.preventDefault();
                        return;
                      }
                    }
                    setCourseData({ ...courseData, enable: e.target.checked });
                  }}
                  disabled={!courseInfoValidation()}
                />
              }
              label="เผยแพร่คอร์ส"
              sx={{ mt: 2 }}
            />
          </div>

          <div className={style.buttonGroup}>
            <button type="button" onClick={onClose}>ยกเลิก</button>
            <button type="submit">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPopup;
