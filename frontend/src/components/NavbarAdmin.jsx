import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthProvider';
import backend from "../api/backend";

import style from "./css/navbar.module.css";

function NavbarAdmin() {
  const { userData } = useContext(AuthContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await backend.post("/auth/logout", { email: userData.email }, { withCredentials: true });
      if (response.status === 200) {
        localStorage.removeItem("email");
        alert(response.data.message);
        window.location.href = '/';
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={style.navWrap}>
      <nav>
        <div className={style.logoContainer} onClick={() => navigate("/")}>
          <img alt="Logo Image" src="/Navbar_Assets/Logo.svg" />
          <p>SAT</p>
        </div>

        <div
          className={style["logo-mobile"]}
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <img alt="Logo Image" src="/Navbar_Assets/Logo.svg" />
          <p>SAT</p>
        </div>

        <div className={style.functionsContainer}>
          <Link to="/manageUser">USERS</Link>
          <Link>FAQ</Link>
        </div>

        <div
          className={`${style["functionsContainer-mobile"]} ${
            sidebarVisible ? style.showSidebar : ""
          }`}
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <div onClick={() => navigate("/")}>Home</div>
          <div onClick={() => navigate("/manageUser")}>USERS</div>
          <div>FAQ</div>
        </div>

        {userData.name !== null && (
          <div className={style.userAuth}>
            <div className={style.userInfo}>
              <div>
                <p>Welcome , </p>
                <label>Owner.{userData.name}</label>
              </div>

              <img
                alt="Profile Image"
                src={userData.profile_img ? userData.profile_img : '/Navbar_Assets/Profile.png'}
                onClick={() => setMenuVisible(!menuVisible)}
              />
            </div>

            {menuVisible && (
              <div className={style.functions}>
                <ul>
                  <li onClick={() => navigate(`/profile`)}>
                    <img
                      alt='Profile Button'
                      src='/Navbar_Assets/User.svg'
                    />
                    <p>Profile</p>
                  </li>

                  <li onClick={handleLogout}>
                    <img
                      alt='LogOut Button'
                      src='/Navbar_Assets/Sign_out.svg'
                    />
                    <p>Log Out</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

export default NavbarAdmin;
