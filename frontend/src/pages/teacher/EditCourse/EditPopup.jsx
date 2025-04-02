import React, { useEffect, useState } from 'react';
import backend from '../../../api/backend';

import style from './css/editpopup.module.css';

function EditPopup({ courseInfo, onClose, onSave }) {
    const [ name, setName ] = useState(courseInfo.name);
    const [ icon, setIcon ] = useState(courseInfo.icon);

    const handleSave = async (e) => {
      e.preventDefault();
      
      try {
        const response = await backend.put(`/teacher/update/${courseInfo.id}`, { name, icon }, { withCredentials: true });
    
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
          setIcon(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

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
                {icon ? (
                  <img
                    src={icon}
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
              <label>Course Name</label>
              <input
                type="text"
                value={name}
                placeholder="Enter Course Name"
                onChange={(e) => setName(e.target.value)}
                required
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