import React, { useState } from "react";

import style from "./css/addPopup.module.css";

function AddPopup({ onClose, onAddCourse }) {
  const [courseData, setCourseData] = useState({
    name: null,
    icon: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCourse(courseData);
    onClose();
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
                required
              />
            </div>

            <div className={style.formGroup}>
              <label>Course Name</label>
              <input
                type="text"
                value={courseData.name}
                placeholder="Enter Course Name"
                onChange={(e) =>
                  setCourseData({ ...courseData, name: e.target.value })
                }
                required
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
    </div>
  );
}

export default AddPopup;
