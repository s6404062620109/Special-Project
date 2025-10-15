import React, { useEffect, useState } from 'react';
import backend from '../../../api/backend';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
  TableSortLabel, Typography,
  Stack,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

import style from './css/managecourse.module.css';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchCourses = async () => {
    try {
      const response = await backend.get(`/admin/getCourses`, { withCredentials: true });
      if (response.status === 200) {
        setCourses(response.data.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
      const response = await backend.delete(`/admin/deleteCourse/${courseToDelete}`, { withCredentials: true });
      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        setCourses(courses.filter((course) => course.id !== courseToDelete));
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบคอร์ส', 
        severity: 'error' 
      });
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

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <div className={style.head}>
          <Typography variant='h4'>คอร์สทั้งหมด</Typography>
        </div>

        <div className={style.body}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      รหัสคอร์ส
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      ชื่อคอร์ส
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'teacherName'}
                      direction={orderBy === 'teacherName' ? order : 'asc'}
                      onClick={() => handleRequestSort('teacherName')}
                    >
                      อาจารย์
                    </TableSortLabel>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(courses, getComparator(order, orderBy)).map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            gap={2}
                        >
                          {course.icon ? (
                             <img
                                src={course.icon}
                                alt="course icon"
                                style={{ width: "40px", height: "40px", borderRadius: "8px" }}
                            />
                          ):(
                            <Avatar sx={{ width: 50, height: 50, marginRight: "10px", bgcolor: "#1976d2" }}>
                              <SchoolIcon />
                            </Avatar>
                          )}
                           
                            {course.name}
                        </Stack>
                    </TableCell>
                    <TableCell>
                        {
                            course.teacherName
                        }
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteClick(course.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

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
            คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สเรียนนี้? การกระทำนี้เป็นการลบข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManageCourses;
