import React, { useEffect, useState } from 'react';
import backend from '../../../api/backend';
import { FormControlLabel, Switch, TextField } from "@mui/material";

import style from './css/editpopup.module.css';

function EditPopup({ courseInfo, onClose, onSave }) {
  const [courseData, setCourseData] = useState({
    name: courseInfo.name,
    icon: courseInfo.icon,
    enable: courseInfo.enable
  });

  const handleSave = async (e) => {
    e.preventDefault();
      
    try {
      const response = await backend.put(`/teacher/update/${courseInfo.id}`, 
        { 
          name: courseData.name, 
          icon: courseData.icon, 
          enable: courseData.enable
        }, { withCredentials: true }
      );
    
      if (response.status === 200) {
        alert(response.data.message);
        onSave();
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData({ ...courseData, icon: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  console.log(courseData)
  return (
    <div className={style.popupOverlay}>
      <div className={style.popupContent}>
        <form onSubmit={handleSave}>
          <div className={style["form-wrapper"]}>
            <div className={style.fileInput}>
              <label>Course Icon</label>
              <div
                className={style.previewImageContainer}
                onClick={() => document.getElementById("fileInput").click()}
              >
                {courseData.icon ? (
                  <img
                    src={courseData.icon}
                    alt="Preview"
                    className={style.previewImage}
                  />
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
                id="outlined-basic"
                variant="outlined"
                label="Course Name"
                type="text"
                defaultValue={courseData.name}
                onChange={(e) => setCourseData({ ...courseData, name: e.target.value})}
                required
              />

              <FormControlLabel 
                control={
                  <Switch 
                    onChange={(e) => setCourseData({ ...courseData, enable: e.target.checked })} 
                    checked={courseData.enable} 
                  />
                } 
                label="Can study?" 
              />
            </div>
          </div>

          <div className={style.buttonGroup}>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPopup