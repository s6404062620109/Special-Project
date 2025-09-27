import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';
import { AuthContext } from '../../../context/AuthProvider';
 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

import style from './css/mycourses.module.css';
import AddPopup from './AddPopup';
import { IconButton, Menu, MenuItem } from '@mui/material';
import EditPopup from '../Course/EditPopup';

const menuItemStyle = {
  padding: "0 24px",
  width: "100%",
  display: "flex",
  gap: "10px",
};

function MyCourses() {
  const { userData } = useContext(AuthContext);
  const [ myCourses, setMyCourses ] = useState([]);
  const [ isPopupOpen, setIsPopupOpen ] = useState(false);
  const [ editPopupOpen, setEditPopupOpen ] = useState(false);
  const [ anchorEl, setAnchorEl ] = useState(null);
  const [ selecedCourse, setSelectedCourse ] = useState(null);
  const [ menuCourse, setMenuCourse ] = useState(null); 
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

  const handleSaveCourse = () => {
    setEditPopupOpen(false);
    fetchMyCourses();
  };
  
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
                    <tr key={course.id || index} onClick={(e) => {
                      if(anchorEl){
                        e.stopPropagation();
                        return;
                      }
                      navigate(`/edit-course/${course.id}`)
                    }}>
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

                      {/* <td>
                        <button onClick={() => handleDeleteCourse(course.id)}>
                          <DeleteIcon/>
                          <p>Delete</p>
                        </button>
                      </td> */}

                      <td>
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          setAnchorEl(e.currentTarget);
                          setMenuCourse(course);
                        }}>
                          <MoreVertOutlinedIcon sx={{ color: "black" }}/>
                        </IconButton>

                        <Menu
                          id="menu-appbar"
                          anchorEl={anchorEl}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(anchorEl)}
                          onClose={() => {
                            setAnchorEl(null);
                            setMenuCourse(null); 
                          }}
                        >
                          <MenuItem 
                            sx={menuItemStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorEl(null);
                              setSelectedCourse({
                                name: menuCourse.name,
                                icon: menuCourse.icon,
                                enable: menuCourse.enable,
                                id: menuCourse.id,
                              });
                              setEditPopupOpen(true);
                            }}
                          >
                            <EditIcon/>
                            <p>Edit</p>
                          </MenuItem>

                          <MenuItem 
                            sx={menuItemStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorEl(null);
                              handleDeleteCourse(menuCourse.id)
                            }}
                          >
                            <DeleteIcon/>
                            <p>Delete</p>
                          </MenuItem>
                            
                        </Menu>
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

      {editPopupOpen && (
        <EditPopup
          courseInfo={selecedCourse}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  )
}

export default MyCourses