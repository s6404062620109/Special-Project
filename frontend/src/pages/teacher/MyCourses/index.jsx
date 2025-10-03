import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';
import { AuthContext } from '../../../context/AuthProvider';

import DeleteIcon from '@mui/icons-material/Delete';

import style from './css/mycourses.module.css';
import AddPopup from './AddPopup';
import { Button, IconButton, Typography, useMediaQuery } from '@mui/material';

const menuItemStyle = {
  padding: "0 16px",
  width: "100%",
  display: "flex",
  gap: "10px",
};

function MyCourses() {
  const { userData } = useContext(AuthContext);
  const [ myCourses, setMyCourses ] = useState([]);
  const [ isPopupOpen, setIsPopupOpen ] = useState(false);
  const [ anchorEl, setAnchorEl ] = useState(null);
  const navigate = useNavigate();

  const fetchMyCourses = async () => {
    try{
      const response = await backend.get(`/teacher/getMyCourses/${userData.id}`, { withCredentials: true });

      if(response.status === 200){
        setMyCourses(response.data.result);
      }

    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMyCourses();
  },[userData.id]);

  const handleAddCourse = async ({ name, icon, enable }) => {
    try {
      const response = await backend.post("/teacher/addCourse", 
        { name, icon, enable, teacherId: userData.id }, 
        { withCredentials: true }
      );
    
      if (response.status === 200) {
        window.location.reload();
        return;
      }

    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;
    
    try {
      const response = await backend.delete(`/teacher/deleteCourse/${courseId}/${userData.id}`, { withCredentials: true });
    
      if (response.status === 200) {
        alert(response.data.message);
        setMyCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
      }
      
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        alert(error.response.data.message);
      }
      else {
        alert("An error occurred while deleting the course.");
      }
    }
  };
  
  const tabletQuery = useMediaQuery("(max-width:720px)");

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
          <h2>คอร์สเรียน</h2>
        </div>

        <div className={style.body}>
          <table>
            <tbody>
              {myCourses.length > 0 ? (
                myCourses.map((course, index) => (
                  course ? (
                    <tr key={course.id || index} onClick={() => navigate(`/edit-course/${course.id}`)}>
                      <td>
                        {course?.icon ? (
                          <img
                            src={course.icon}
                            alt={`${course.name || "Course"} icon`}
                            style={{ width: "50px", height: "50px", marginRight: "10px" }}
                          />
                        ) : (
                          <span>No Icon</span>
                        )}
                        {course?.name || "Unnamed Course"}
                      </td>

                      <td>
                        <IconButton
                          sx={{
                            backgroundColor: "rgb(255, 87, 51)",
                            color: "white",
                            opacity: 0.6,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: "rgb(255, 87, 51)",
                            },
                            borderRadius: "100%", 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </td>
                    </tr>
                  ) : null
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>No courses available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={style['add-button']} onClick={() => setIsPopupOpen(true)}>
        <img alt='Add button' src='/My_Coursesp/Add.svg' />
        <p>เพิ่มคอร์สใหม่</p>
      </div>

      {isPopupOpen && userData.id && (
        <AddPopup
          onClose={() => setIsPopupOpen(false)}
          onAddCourse={handleAddCourse}
        />
      )}
    </div>
  )
}

export default MyCourses