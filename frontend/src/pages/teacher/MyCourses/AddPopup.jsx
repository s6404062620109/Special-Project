import React, { useState } from "react";

import style from "./css/addPopup.module.css";

function AddPopup({ onClose, onAddCourse }) {
  const [courseData, setCourseData] = useState({
    name: null,
    icon_id: null,
  });
  const [iconFile, setIconFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddCourse({ name: courseData.name, icon: iconFile });

    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
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
                {iconFile ? (
                  <img
                    src={URL.createObjectURL(iconFile)}
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
