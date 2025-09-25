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
  TableSortLabel,
  Button,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import style from "./css/manageuser.module.css";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

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
    email: "",
    role: "s",
  });
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    name: "",
    email: "",
    profile_img: "",
    role: "s",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentProfileImg, setCurrentProfileImg] = useState(null);

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
      alert("กรุณาเข้าสู่ระบบ");
      window.location.href = "/";
      return;
    }

    try {
      const response = await backend.post(`/admin/addUser`, newUser, {
        withCredentials: true,
      });
      if (response.status === 201) {
        setMessage({ text: response.data.message, status: "success" });
        setNewUser({ name: "", email: "", role: "s" });
        fetchUserData();
        setShowPopup(false);
      }
    } catch (error) {
      console.log(error);
      setMessage({
        text: error.response?.data?.message || "Error",
        status: "error",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userData.id) {
      alert("Please authentication first");
      window.location.href = "/";
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const response = await backend.delete(`/admin/deleteUser/${userId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert(response.data.message);
        fetchUserData();
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
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
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stableSort(filteredUsers, getComparator(order, orderBy)).map(
                  (user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "s" && "นักเรียน"}
                        {user.role === "t" && "อายารย์"}
                        {user.role === "a" && "ผู้ดูแลระบบ"}
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
                            Edit
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
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ marginLeft: 0 }}
                            startIcon={
                              <DeleteIcon />
                            }
                          >
                            Delete
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
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <AddUser
        open={showPopup}
        onClose={() => setShowPopup(false)}
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
    </div>
  );
}

export default ManageUser;
