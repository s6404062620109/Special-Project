import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/mycourses.module.css';
import AddPopup from './AddPopup';

function MyCourses() {
    const [ myCourses, setMyCourses ] = useState([]);
    const [ userData, setUserData ] = useState({
      id:null,
      email:null,
      name:null,
      role:null,
      profile_img:null,
    });
    const [ courseIcons, setCourseIcons ] = useState({});
    const [ isPopupOpen, setIsPopupOpen ] = useState(false);
    const emailrefStorage = localStorage.getItem("email");
    const navigate = useNavigate();

    const fetchCourseIcons = async (courses) => {
      try {
        const coursesWithIcons = courses.filter((course) => course.icon_id);
    
        const iconPromises = coursesWithIcons.map((course) =>
          backend.get(`/imgrender/getIcon/${course.id}/${course.icon_id}`)
        );

        const iconResponses = await Promise.allSettled(iconPromises);

        const icons = iconResponses.reduce((acc, response, index) => {
          if (response.status === 'fulfilled') {

            acc[coursesWithIcons[index].id] = `${import.meta.env.VITE_API_BASE_URL}${response.value.data.url}`;
          }
          return acc;
        }, {});
    
        setCourseIcons(icons);
      } catch (error) {
        console.error('Error fetching course icons:', error);
      }
    };

    useEffect(() => {
        const fetchUserData = async () => {
    
          try{
            const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
              withCredentials: true
            });
            if(response.status === 200){
              setUserData({
                id:response.data.id,
                email:response.data.email,
                name:response.data.name,
                role:response.data.role,
                profile_img:response.data.profile_img,
              });
            }
    
          } catch(error){
            console.log(error);
            if(error.response.status === 403){
              localStorage.removeItem('email');
              alert("You session time out, please login again.")
              navigate('/');
            }
          }
          
        }
        fetchUserData();
    },[emailrefStorage]);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try{
                const response = await backend.get(`/teacher/getMyCourses/${userData.id}`);

                if(response.status === 200){
                  setMyCourses(response.data.result);
                  fetchCourseIcons(response.data.result);
                }
            } catch(error) {
                console.log(error);
            }
        }

        fetchMyCourses();
    },[userData.id]);

    const handleAddCourse = async ({ name, icon }) => {
      try {
        const response = await backend.post("/teacher/addCourse", { name, teacherId: userData.id });
    
        if (response.status === 200) {
          const newCourse = response.data.course;
    
          if (icon) {
            await uploadCourseIcon(newCourse.id, icon);
            window.location.reload();
          }
    
          setMyCourses((prevCourses) => [...prevCourses, newCourse]);
        }
      } catch (error) {
        console.error("Error adding course:", error);
      }
    };

    const uploadCourseIcon = async (courseId, iconFile) => {
      try {
        const formData = new FormData();
        formData.append("icon", iconFile);
    
        await backend.post(`/teacher/uploadCourseIcon/${courseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      } catch (error) {
        console.error("Error uploading course icon:", error);
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
        } else {
          alert("An error occurred while deleting the course.");
        }
      }
    };
    
  return (
    <div className={style['my-courses-container']}>
      <div className={style.container}>
        <div className={style.head}>
          <h2>COURSES</h2>
        </div>

        <div className={style.body}>
          <table>
            <tbody>
              {myCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    {courseIcons[course.id] && (
                      <img
                        src={courseIcons[course.id]}
                        alt={`${course.name} icon`}
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                      />
                    )}
                    {course.name}
                  </td>

                  <td>
                    <button onClick={() => navigate(`/edit-course/${course.id}`)}>
                      <img src='/My_Coursesp/Edit.svg' alt='Edit button' />
                      <p>Edit</p>
                    </button>
                  </td>

                  <td>
                    <button onClick={() => handleDeleteCourse(course.id)}>
                      <img src='/My_Coursesp/Bin.svg' alt='Delete button' />
                      <p>Delete</p>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={style['add-button']} onClick={() => setIsPopupOpen(true)}>
        <img alt='Add button' src='/My_Coursesp/Add.svg' />
        <p>Add Course</p>
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