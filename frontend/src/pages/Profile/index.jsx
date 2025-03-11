import React, { useEffect, useState } from "react";
import backend from "../../api/backend";

import style from "./css/profile.module.css";

function Profile() {
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
    verified_expired: null,
  });
  const [timeLeft, setTimeLeft] = useState("Loading...");
  const [editMode, setEditMode] = useState(false);
  const [tempUserData, setTempUserData] = useState({ ...userData });
  const emailrefStorage = localStorage.getItem("email");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authResponse = await backend.get(
          `/auth/authorization/${emailrefStorage}`,
          {
            withCredentials: true,
          }
        );

        if (authResponse.status === 200) {
          setUserData((prevData) => ({
            ...prevData,
            id: authResponse.data.id,
            email: authResponse.data.email,
            name: authResponse.data.name,
            role: authResponse.data.role,
            profile_img: authResponse.data.profile_img,
          }));
          setTempUserData(authResponse.data);
        }

        const passwordResponse = await backend.get(
          `/auth/getVerifiedExpired/${emailrefStorage}`,
          {
            withCredentials: true,
          }
        );

        if (passwordResponse.status === 200) {
          const { verified_expired } = passwordResponse.data;

          setUserData((prevData) => ({
            ...prevData,
            verified_expired,
          }));
        }
      } catch (error) {
        console.log(error);
        if (error.response?.status === 403) {
          localStorage.removeItem("email");
          alert(error.response.data.message);
          window.location.href = "/";
        }
      }
    };

    fetchUserData();
  }, [emailrefStorage]);

  useEffect(() => {
    if (!userData.verified_expired) return;

    const updateTimer = () => {
      const now = new Date();
      const expiredTime = new Date(userData.verified_expired);
      const diff = expiredTime - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, [userData.verified_expired]);

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
      const response = await backend.post('/auth/logout', {}, { withCredentials: true });
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
          <p>{userData.name}</p>
        </div>

        <div className={style.body}>
          <div>
            <label>NAME</label>
            <input
              type="text"
              name="name"
              value={editMode ? tempUserData.name : userData.name}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>EMAIL</label>
            <input
              type="text"
              name="email"
              value={editMode ? tempUserData.email : userData.email}
              disabled={!editMode}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>⏳ Expired Time</label>
            <p className={style["expired-time"]}>{timeLeft}</p>
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
