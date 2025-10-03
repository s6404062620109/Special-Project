import React, { useState } from 'react';
import backend from '../../../api/backend';
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";

import style from './css/editpopup.module.css';

function EditPopup({ courseInfo, onClose, onSave }) {
  const [courseData, setCourseData] = useState({
    name: courseInfo.name,
    icon: courseInfo.icon,
    enable: courseInfo.enable,
    announcement: courseInfo.announce_state
  });

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await backend.put(`/teacher/update/${courseInfo.id}`, 
        { name: courseData.name, icon: courseData.icon, enable: courseData.enable, announce_state: courseData.announcement },
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

            <FormControl
              sx={{
                width: "300px",
                mt: 2
              }}
            >
              <InputLabel>รูปแบบประกาศคะแนน</InputLabel>
              <Select
                value={courseData.announcement}
                onChange={(e) => setCourseData({ ...courseData, announcement: e.target.value })}
                MenuProps={{ disablePortal: true }}
                sx={{ width: "100%", mt: 2 }}
              >
                {announce_state.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={courseData.enable}
                  onChange={(e) => setCourseData({ ...courseData, enable: e.target.checked })}
                />
              }
              label="เผยแพร่"
              sx={{ mt: 2 }}
            />
          </div>

          <div className={style.buttonGroup}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPopup;
