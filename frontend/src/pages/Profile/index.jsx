import React, { useContext, useEffect, useState } from "react";
import { Typography } from "@mui/material";

import backend from "../../api/backend";
import { AuthContext } from "../../context/AuthProvider";
import style from "./css/profile.module.css";

function Profile() {
  const { userData, setUserData } = useContext(AuthContext);
  const [ editMode, setEditMode ] = useState(false);
  const [ tempUserData, setTempUserData ] = useState({ ...userData });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setTempUserData({ ...userData });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await backend.put(`/auth/updateProfile/${userData.id}`,
        tempUserData, { withCredentials: true }
      );

      if (response.status === 200) {
        setUserData({ ...tempUserData });
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await backend.post("/auth/forgot_password", {
        email: userData.email,
      });
      if (response.status === 200) {
        alert("Password reset link sent to your email.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Failed to send reset email.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      alert("File size must be less than 16MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempUserData((prevData) => ({
        ...prevData,
        profile_img: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      const response = await backend.post('/auth/logout', 
        { email: userData.email }, 
        { withCredentials: true }
      );

      if(response.status === 200){
        localStorage.removeItem('email');
        alert(response.data.message);
        window.location.href = '/';
      } 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={style["profile-container"]}>
      <div className={style.container}>
        <div className={style.head}>
          <label htmlFor="profile-image-upload">
            <img
              alt="User Profile img"
              src={
                tempUserData.profile_img
                  ? tempUserData.profile_img
                  : "/Navbar_Assets/Profile.png"
              }
              style={{ cursor: "pointer" }}
            />
          </label>

          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
            disabled={!editMode}
          />
        </div>

        <div className={style.body}>
          <div>
            <Typography variant="h6">ชื่อผู้ใช้</Typography>
            <input
              type="text"
              name="name"
              value={editMode ? tempUserData.name : userData.name}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Typography variant="h6">นามสกุล</Typography>
            <input
              type="text"
              name="surname"
              value={editMode ? tempUserData.surname : userData.surname}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Typography variant="h6">อีเมล</Typography>
            <input
              type="text"
              name="email"
              value={editMode ? tempUserData.email : userData.email}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

        </div>

        <div className={style.footer}>
          {editMode ? (
            <>
              <button onClick={handleResetPassword}>Reset Password</button>
              <div>
                <button onClick={handleSave}>Save</button>
                <button onClick={toggleEditMode}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <button onClick={toggleEditMode}>Edit Profile</button>
              <button onClick={handleLogout}>Log Out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
