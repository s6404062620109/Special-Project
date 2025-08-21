import React, { useState } from "react";
import { Alert, FormControlLabel, Slide, Snackbar, Switch, TextField } from "@mui/material";

import style from "./css/addPopup.module.css";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function AddPopup({ onClose, onAddCourse }) {
  const [courseData, setCourseData] = useState({
    name: "",
    icon: "",
    enable: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSubmit = (e) => {
    if(courseData.name === "" || courseData.icon === ""){
      e.preventDefault();
      setSnackbar({
        open: true,
        message: "Name and icon are required.",
        severity: "error"
      });      
      return;
    }

    onAddCourse(courseData);
    setSnackbar({
      open: true,
      message: "Course added successfully!",
      severity: "success"
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData((prev) => ({ ...prev, icon: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={style.popupOverlay}>
      <div className={style.popupContent}>
        <form onSubmit={handleSubmit}>
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
                value={courseData.name}
                onChange={(e) =>
                  setCourseData({ ...courseData, name: e.target.value })
                }
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
            <button type="submit">Add Course</button>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slots={{ transition: SlideTransition }} 
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AddPopup;
