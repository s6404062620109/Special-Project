import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider';
import backend from '../api/backend';

import style from './css/navbar.module.css';

function Navbar() {
  const { userData } = useContext(AuthContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await backend.post('/auth/logout', { email: userData.email }, { withCredentials: true });
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
    <div className={style.navWrap}>
      <nav>
        <div className={style.logoContainer}
          onClick={() => navigate('/')}  
        >
          <img alt='Logo Image' src='/Navbar_Assets/Logo.svg'/>
          <p>SAT</p>
        </div>

        <div className={style["logo-mobile"]}
           onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <img alt='Logo Image' src='/Navbar_Assets/Logo.svg'/>
          <p>SAT</p>
        </div>

        <div className={style.functionsContainer}>
          {userData.role === "t" && (
            <Link to='/my-courses'>คอร์สของฉัน</Link>
          )}
          {userData.role === "a" && (
            <>
              <Link to='/manageUser'>ผู้ใช้งาน</Link>
              <Link to='/manageCourse'>คอร์สออนไลน์</Link>
            </>
          )}
          {(userData.role === "s" || userData.role === null) && (
            <>
              <Link to='/courses'>คอร์สออนไลน์</Link>
              <Link>ร่วมงานกับเรา</Link>
            </>
          )}
          <Link>คู่มือการใช้งาน</Link>
        </div>

        <div 
          className={`${style["functionsContainer-mobile"]} ${sidebarVisible ? style.showSidebar : ''}`}
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <div onClick={() => navigate('/')}>หน้าหลัก</div>

          {userData.role === "t" && (
            <div onClick={() => navigate('/my-courses')}>คอร์สของฉัน</div>
          )}

          {userData.role === "a" && (
            <>
              <div onClick={() => navigate('/manageUser')}>ผู้ใช้งาน</div>
              <div onClick={() => navigate('/manageCourse')}>คอร์สออนไลน์</div>
            </>
          )}

          {(userData.role === "s" || userData.role === null) && (
            <>
              <div onClick={() => navigate('/courses')}>คอร์สออนไลน์</div>
              <div>ร่วมงานกับเรา</div>
            </>
          )}
          <div>คู่มือการใช้งาน</div>
        </div>

        {userData.name !== null &&(
          <div className={style.userAuth}>  
            <div className={style.userInfo}>
              <div>
                <p>Welcome, </p>
                <label>{userData.name}</label>
              </div>

              <img 
                alt='Profile Image' 
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
  )
}

export default Navbar
