import React, { useContext, useEffect, useState } from "react";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TableSortLabel,
  Button,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import style from "./css/manageuser.module.css";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import { Check } from "@mui/icons-material";

function ManageUser() {
  const { userData } = useContext(AuthContext);
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState({ text: "", status: "" });
  const [newUser, setNewUser] = useState({
    name: "",
    surname: "",
    sex: "n",
    email: "",
    password: "",
    role: "s",
  });
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    sex: "",
    name: "",
    surname: "",
    email: "",
    profile_img: "",
    role: "s",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentProfileImg, setCurrentProfileImg] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const fetchUserData = async () => {
    try {
      const response = await backend.get("/admin/getUsers", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserList(response.data.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userData]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const filteredUsers = userList.filter((user) => {
    const matchesName = user?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesEmail = user?.email
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return (
      (matchesName || matchesEmail) &&
      (filterRole === "all" || user.role === filterRole)
    );
  });

  const handleAddUser = async () => {
    if (!userData.id) {
      setSnackbar({ open: true, message: "กรุณาเข้าสู่ระบบ", severity: "warning" });
      window.location.href = "/";
      return;
    }

    if (!newUser.name.trim() || !newUser.surname.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      const errorMessage = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
      setMessage({
        text: errorMessage,
        status: "error",
      });
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      const errorMessage = "รูปแบบอีเมลไม่ถูกต้อง ตัวอย่าง example@email.com";
      setMessage({ text: errorMessage, status: "error" });
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      return;
    }

    const nameRegex = /^[a-zA-Zก-๏\s]+$/;
    if (!nameRegex.test(newUser.name) || !nameRegex.test(newUser.surname)) {
      const errorMessage = "ชื่อและนามสกุลต้องเป็นตัวอักษรเท่านั้น";
      setMessage({ text: errorMessage, status: "error" });
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newUser.password)) {
      const errorMessage = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรประกอบด้วย ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ(@, $, !, %, *, ?, &)";
      setMessage({
        text: errorMessage,
        status: "error",
      });
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      return;
    }

    try {
      const response = await backend.post(`/admin/addUser`, newUser, {
        withCredentials: true,
      });
      if (response.status === 201) {
        setMessage({ text: response.data.message, status: "success" });
        setSnackbar({ open: true, message: response.data.message, severity: "success" });
        setNewUser({
          name: "",
          surname: "",
          sex: "n",
          email: "",
          password: "",
          role: "s",
        });
        fetchUserData();
        setShowPopup(false);
      }
    } catch (error) {
      console.log(error);
      setMessage({
        text: error.response?.data?.message || "Error",
        status: "error",
      });
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้",
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userData.id) {
      setSnackbar({ open: true, message: "Please authenticate first", severity: "warning" });
      window.location.href = "/";
      return;
    }
    if (!userToDelete) return;

    try {
      const response = await backend.delete(`/admin/deleteUser/${userToDelete}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setSnackbar({ open: true, message: response.data.message, severity: "success" });
        fetchUserData();
      }
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting user",
        severity: "error",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      surname: user.surname, 
      sex: user.sex,
      email: user.email,
      profile_img: user.profile_img,
      role: user.role,
    });
    setCurrentProfileImg(user.profile_img);
    setShowEditPopup(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(selectedUser.email)) {
        const errorMessage = "รูปแบบอีเมลไม่ถูกต้อง ตัวอย่าง example@email.com";
        setMessage({ text: errorMessage, status: "error" });
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
        return;
      }

      const nameRegex = /^[a-zA-Zก-๏\s]+$/;
      if (!nameRegex.test(selectedUser.name) || !nameRegex.test(selectedUser.surname)) {
        const errorMessage = "ชื่อและนามสกุลต้องเป็นตัวอักษรเท่านั้น";
        setMessage({ text: errorMessage, status: "error" });
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
        return;
      }

      const updatedUser = {
        ...selectedUser,
        profile_img: selectedImage || currentProfileImg,
      };

      const response = await backend.put(
        `/admin/updateUser/${selectedUser.id}`,
        updatedUser,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setMessage({ text: response.data.message, status: "success" });
        setSnackbar({ open: true, message: response.data.message, severity: "success" });
        fetchUserData();
        setShowEditPopup(false);
      }
    } catch (error) {
      console.log(error);
      setMessage({
        text: error.response?.data?.message || "Error",
        status: "error",
      });
    }
  };

  const handleApproveTeacher = async (userId) => {
    try{
      const response = await backend.put(`/admin/approveTeacherReq/${userId}`, {},{
        withCredentials: true,
      });
      if(response.status === 200){
        setSnackbar({ open: true, message: response.data.message, severity: "success" });
        fetchUserData();
      }
    } catch(error){
      console.log(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error approving teacher",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const tabletQuery = useMediaQuery("(max-width:720px)");

  return (
    <div className={style["manageuser-container"]}>
      <div className={style["container"]}>
        <div className={style.head}>
          <h2>ผู้ใช้ทั้งหมด</h2>
        </div>
        <div className={style.body}>
          <div className={style["filter-container"]}>
            <input
              type="text"
              placeholder="ค้นหาด้วย ชื่อ / อีเมล ของผู้ใช้"
              className={style.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={style.filterSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="s">นักเรียน</option>
              <option value="t">อาจารย์</option>
              <option value="a">ผู้ดูแลระบบ</option>
            </select>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={orderBy === "name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                    >
                      ชื่อ
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "surname" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "surname"}
                      direction={orderBy === "surname" ? order : "asc"}
                      onClick={() => handleRequestSort("surname")}
                    >
                      นามสกุล
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "sex" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "sex"}
                      direction={orderBy === "sex" ? order : "asc"}
                      onClick={() => handleRequestSort("sex")}
                    >
                      เพศ
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "email" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      อีเมล
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === "role" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "role"}
                      direction={orderBy === "role" ? order : "asc"}
                      onClick={() => handleRequestSort("role")}
                    >
                      บทบาท
                    </TableSortLabel>
                  </TableCell>
                  <TableCell ortDirection={orderBy === "isApprove" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "isApprove"}
                      direction={orderBy === "isApprove" ? order : "asc"}
                      onClick={() => handleRequestSort("isApprove")}
                    >
                      ยืนยันคำขอเป็นอาจารย์
                    </TableSortLabel>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stableSort(filteredUsers, getComparator(order, orderBy)).map(
                  (user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.surname}</TableCell>
                      <TableCell>
                        {user.sex === "m" && "ชาย"}
                        {user.sex === "f" && "หญิง"}
                        {user.sex === "n" && "ไม่ระบุ"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "s" && "นักเรียน"}
                        {user.role === "t" && "อาจารย์"}
                        {user.role === "a" && "ผู้ดูแลระบบ"}
                      </TableCell>
                      <TableCell>
                        {user.isApprove === 1 && !tabletQuery ? (
                          <Button 
                            variant="contained" 
                            color="success"
                            size="small"
                            onClick={() => handleApproveTeacher(user.id)}
                            startIcon={<Check/>}
                          >
                            ยืนยัน
                          </Button>
                        ):(
                          <></>
                        )}
                        {user.isApprove === 1 && tabletQuery ? (
                          <IconButton
                            sx={{
                              backgroundColor: "rgba(68, 210, 25, 1)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(68, 210, 25, 1)",
                              },
                            }}
                            onClick={() => handleApproveTeacher(user.id)}
                          >
                            <Check/>
                          </IconButton>
                        ):(
                          <></>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ 
                          display: "flex", 
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {!tabletQuery ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleEditClick(user)}
                            startIcon={<EditIcon />}
                          >
                            แก้ไข
                          </Button>
                        ) : (
                          <IconButton
                            sx={{
                              backgroundColor: "rgb(25, 118, 210)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgb(25, 118, 210)",
                              },
                            }}
                            onClick={() => handleEditClick(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}

                        {!tabletQuery ? (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(user.id)}
                            sx={{ marginLeft: 0 }}
                            startIcon={
                              <DeleteIcon />
                            }
                          >
                            ลบ
                          </Button>
                        ) : (
                          <IconButton
                            sx={{
                              backgroundColor: "rgb(255, 87, 51)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgb(255, 87, 51)",
                              },
                              marginLeft: 0,
                            }}
                            onClick={() => handleDeleteClick(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} rowSpan={3}>
                      <Typography variant="h4" color="error" textAlign='center'>ไม่พบบัญชีผู้ใช้ในระบบ</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <AddUser
        open={showPopup}
        onClose={() => {
          setNewUser({
            name: "",
            surname: "",
            sex: "n",
            email: "",
            password: "",
            role: "s",
          });
          setShowPopup(false)
        }}
        newUser={newUser}
        setNewUser={setNewUser}
        onSubmit={handleAddUser}
        message={message}
      />

      <EditUser
        open={showEditPopup}
        onClose={() => setShowEditPopup(false)}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onSubmit={handleUpdateUser}
        selectedImage={selectedImage}
        handleImageChange={handleImageChange}
        currentProfileImg={currentProfileImg}
        message={message}
      />

      <button
        className={style["add-button"]}
        onClick={() => setShowPopup(true)}
      >
        <img src="/My_Coursesp/Add.svg" alt="Add button" />
        <p>Add New User</p>
      </button>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"ยืนยันการลบบัญชีผู้ใช้"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้นี้? การกระทำนี้ไม่สามารถกู้คืนได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ยกเลิก</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManageUser;
