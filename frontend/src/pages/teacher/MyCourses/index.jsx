import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backend from '../../../api/backend';
import { AuthContext } from '../../../context/AuthProvider';

import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

import style from './css/mycourses.module.css';
import AddPopup from './AddPopup';
import { 
  Alert,
  Avatar, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Slide, 
  Snackbar,  
} from '@mui/material';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function MyCourses() {
  const { userData } = useContext(AuthContext);
  const [ myCourses, setMyCourses ] = useState([]);
  const [ isPopupOpen, setIsPopupOpen ] = useState(false);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ courseToDelete, setCourseToDelete ] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
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
        { name, icon, teacherId: userData.id }, 
        { withCredentials: true }
      );
    
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'เพิ่มคอร์สเรียนสำเร็จ', severity: 'success' });
        fetchMyCourses();
        setIsPopupOpen(false);
      }

    } catch (error) {
      console.error("Error adding course:", error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มคอร์ส', severity: 'error' });
    }
  };

  const handleDeleteClick = (courseId) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      const response = await backend.delete(`/teacher/deleteCourse/${courseToDelete}/${userData.id}`, { withCredentials: true });

      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        setMyCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete));
      }

    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        setSnackbar({ open: true, message: error.response.data.message, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการลบคอร์ส', severity: 'error' });
      }
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
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
                    <tr key={course.id || index} onClick={() => navigate(`/edit-course/${course.id}`)}>
                      <td>
                        {course?.icon ? (
                          <img
                            src={course.icon}
                            alt={`${course.name || "Course"} icon`}
                            style={{ width: "50px", height: "50px", marginRight: "10px" }}
                          />
                        ) : (
                          <Avatar sx={{ width: 50, height: 50, marginRight: "10px", bgcolor: "#1976d2" }}>
                            <SchoolIcon />
                          </Avatar>
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
                            handleDeleteClick(course.id);
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"ยืนยันการลบคอร์สเรียน"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สเรียนนี้? การกระทำนี้จะส่งผลให้ผู้เรียนไม่สามารถเข้าถึงคอร์สได้อีกต่อไป
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ยกเลิก</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>ยืนยัน</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default MyCourses