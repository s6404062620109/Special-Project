import React, { useContext, useEffect, useState } from "react";
import backend from "../../../api/backend";
import { AuthContext } from "../../../context/AuthProvider";

import style from "./css/manageuser.module.css";

function ManageUser() {
  const { userData } = useContext(AuthContext);
  const [ userList, setUserList ] = useState([]);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ message, setMessage ] = useState({ 
    text: "", status: "" 
  });
  const [ filterRole, setFilterRole ] = useState("all");
  const [ showEditPopup, setShowEditPopup ] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    role: "s" 
  });
  const [selectedUser, setSelectedUser] = useState({ 
    id: null, 
    name: "", 
    email: "",
    profile_img: "", 
    role: "s" 
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentProfileImg, setCurrentProfileImg] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await backend.get('/admin/getUsers', { withCredentials: true });

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

  const filteredUsers = userList.filter(user => {
    const matchesName = user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmail = user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      (matchesName || matchesEmail) &&
      (filterRole === "all" || user.role === filterRole)
    );
  });

  const handleAddUser = async () => {
    if(!userData.id){
        alert("กรุณาเข้าสู่ระบบก่อน");
        window.location.href = "/";
        return;
    }
    
    try {
      const response = await backend.post(`/admin/addUser`, newUser, { withCredentials: true });
      if (response.status === 201) {
        setMessage({ text: response.data.message, status: "success" });
        setNewUser({ name: "", email: "", role: "s" });
        setTimeout(() => window.location.reload(), 3000);
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 400 || error.response.status === 500) {
        setMessage({ text: error.response.data.message, status: "error" });
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if(!userData.id){
        alert("Please authentication first");
        window.location.href = "/";
        return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    
    try{
        const response = await backend.delete(`/admin/deleteUser/${userId}`, { withCredentials: true });

        if (response.status === 200) {
            alert(response.data.message);
            window.location.reload();
        }
    } catch(error) {
      console.log(error);
      if(error.response.status === 500 || error.response.status === 400 || error.response.status === 404) {
            alert(error.response.data.message)
      }
    }
  }

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
  }

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

      const response = await backend.put(`/admin/updateUser/${selectedUser.id}`, updatedUser, { withCredentials: true });
      if (response.status === 200) {
        setMessage({ text: response.data.message, status: "success" });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 400 || error.response.status === 500) {
        setMessage({ text: error.response.data.message, status: "error" });
      }
    }
  };

  return (
    <div className={style["manageuser-container"]}>
      <div className={style["container"]}>
        <div className={style.head}>
          <h2>USERS</h2>
        </div>
        <div className={style.body}>
          <div className={style["filter-container"]}>
            <input
              type="text"
              placeholder="Search by profile name or email..."
              className={style.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={style.filterSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="s">Student</option>
              <option value="t">Teacher</option>
              <option value="a">Admin</option>
            </select>
          </div>

          <div className={style["table-container"]}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                        {user.name}
                    </td>

                    <td>
                        {user.email}
                    </td>

                    <td>
                      {user.role === "s" && "Student"}
                      {user.role === "t" && "Teacher"}
                      {user.role === "a" && "Admin"}
                    </td>

                    <td>
                        <button 
                            className={style.editButton}
                            onClick={() => handleEditClick(user)}
                        >
                            <img
                                src="/My_Coursesp/Edit.svg"
                                alt="Edit button"
                            />
                            <p>Edit</p>
                        </button>

                        <button 
                            className={style.deleteButton}
                            onClick={() => handleDeleteUser(user.id)}
                        >
                            <img
                                src="/My_Coursesp/Bin.svg"
                                alt="Delete button"
                            />
                            <p>Delete</p>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        className={style["add-button"]} 
        onClick={() => setShowPopup(true)}
      >
        <img
            src="/My_Coursesp/Add.svg"
            alt="Add button"
        />
        <p>Add New User</p>
      </button>

        {showPopup && (
            <div className={style.popup}>
            <div className={style.popupContent}>
                <h3>Add New User</h3>
                <input
                type="text"
                placeholder="Name"
                className={style.inputField}
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                type="email"
                placeholder="Email"
                className={style.inputField}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <select
                className={style.selectField}
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                <option value="s">Student</option>
                <option value="t">Teacher</option>
                <option value="a">Admin</option>
                </select>
                <div className={style.popupButtons}>
                    <div className={`${style.toast} ${style[message.status]}`}>
                        {message.text}
                    </div>

                    <div>
                        <button className={style.confirmButton} onClick={handleAddUser}>Add</button>
                        <button className={style.cancelButton} onClick={() => setShowPopup(false)}>Cancel</button>
                    </div>
                </div>
            </div>
            </div>
        )}

        {showEditPopup && (
        <div className={style.popup}>
          <div className={style.popupContent}>
            <h3>Edit User</h3>
            <div className={style.profileImageContainer}>
              {currentProfileImg || selectedImage ? (
                <img
                src={selectedImage || currentProfileImg}
                alt="Profile"
                className={style.profileImage}
              />
            ) : (
              <div className={style.profilePlaceholder}>No Image</div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={style.imageUploadInput}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className={style.uploadButton}>
              Upload Image
            </label>
          </div>

            <input
                type="text"
                placeholder="Name"
                className={style.inputField}
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                className={style.inputField}
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
            />
            <select
                className={style.selectField}
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
            >
                <option value="s">Student</option>
                <option value="t">Teacher</option>
                <option value="a">Admin</option>
            </select>
            <div className={style.popupButtons}>
                <div className={`${style.toast} ${style[message.status]}`}>
                {message.text}
                </div>
                <div>
                <button className={style.confirmButton} onClick={handleUpdateUser}>Save</button>
                <button className={style.cancelButton} onClick={() => setShowEditPopup(false)}>Cancel</button>
                </div>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}

export default ManageUser;
