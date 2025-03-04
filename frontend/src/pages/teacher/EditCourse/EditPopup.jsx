import React, { useEffect, useState } from 'react';
import backend from '../../../api/backend';

import style from './css/editpopup.module.css';

function EditPopup({ courseInfo, onClose, onSave }) {
    const [ name, setName ] = useState(courseInfo.name);
    const [ iconFile, setIconFile ] = useState(null);
    const [ iconPath, setIconPath ] = useState('');

    useEffect(() => {
        const fetchCourseIcon = async () =>{
            if(courseInfo.icon_id){
                try{
                    const response = await backend.get(`/imgrender/getIcon/${courseInfo.id}/${courseInfo.icon_id}`);

                    if(response.status === 200){
                        setIconPath(`${import.meta.env.VITE_API_BASE_URL}${response.data.url}`);
                    }
                } catch(error){
                    console.log(error);
                }
            }
        }
        
        fetchCourseIcon();
    }, [courseInfo]);

    const handleSave = async (e) => {
        e.preventDefault();

        try {
          // อัปเดตข้อมูลคอร์ส
          const response = await backend.put(`/teacher/update/${courseInfo.id}`, { name });
    
          if (response.status === 200) {
            if (iconFile) {
              const formData = new FormData();
              formData.append("icon", iconFile);
    
              const uploadResponse = await backend.post(`/teacher/uploadCourseIcon/${courseInfo.id}`,
                formData, { headers: { "Content-Type": "multipart/form-data" } }
              );
    
              if (uploadResponse.status === 200) {
                alert("Course and icon updated successfully!");
              }
            } else {
              alert("Course updated successfully!");
            }
    
            onSave();
          }
        } catch (error) {
          console.log(error);
          alert("Failed to update course.");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setIconFile(file);
          setIconPath(URL.createObjectURL(file));
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
                {iconPath ? (
                  <img
                    src={iconPath}
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