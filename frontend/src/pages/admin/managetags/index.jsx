import React, { useState, useEffect } from 'react';
import backend from '../../../api/backend';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
  Typography, Stack, Button, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import style from './managetags.module.css';

function ManageTags() {
  const [tags, setTags] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState({ id: null, name: '' });
  const [dialogMode, setDialogMode] = useState('add');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchTags = async () => {
    try {
      const response = await backend.get('/admin/getAllTags', { withCredentials: true });
      if (response.status === 200) {
        setTags(response.data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setSnackbar({ open: true, message: 'ไม่สามารถดึงข้อมูลแท็กได้', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenDialog = (mode, tag = { id: null, name: '' }) => {
    setDialogMode(mode);
    setCurrentTag(tag);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTag({ id: null, name: '' });
  };

  const handleSaveTag = async () => {
    if (!currentTag.name.trim()) {
      setSnackbar({ open: true, message: 'กรุณากรอกชื่อแท็ก', severity: 'warning' });
      return;
    }

    try {
      let response;
      if (dialogMode === 'add') {
        response = await backend.post('/admin/createTag', { name: currentTag.name }, { withCredentials: true });
      } else {
        response = await backend.put(`/admin/updateTag/${currentTag.id}`, { name: currentTag.name }, { withCredentials: true });
      }

      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        fetchTags(); // Refresh the list
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving tag:", error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'เกิดข้อผิดพลาด', severity: 'error' });
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setTagToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      const response = await backend.delete(`/admin/deleteTag/${tagToDelete.id}`, { withCredentials: true });
      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
        fetchTags();
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ', severity: 'error' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.container}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" className={style.head}>
          <Typography variant='h4'>จัดการแท็ก</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            เพิ่มแท็กใหม่
          </Button>
        </Stack>

        <div className={style.body}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>รหัสประจำแท็ก</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ชื่อแท็ก</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>{tag.id}</TableCell>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog('edit', tag)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(tag)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {tags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} rowSpan={3}>
                      <Typography variant='h4' color='error' textAlign='center'>ไม่พบแท็กในระบบ</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'เพิ่มแท็กใหม่' : 'แก้ไขแท็ก'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ชื่อแท็ก"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTag.name}
            onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveTag()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button onClick={handleSaveTag} variant="contained">บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>คุณแน่ใจหรือไม่ว่าต้องการลบแท็ก "{tagToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ยกเลิก</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>ยืนยัน</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManageTags;