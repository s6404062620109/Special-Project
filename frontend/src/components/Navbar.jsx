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
            <>
              <Link to='/my-courses'>คอร์สของฉัน</Link>
              <Link to='/guide'>คู่มือการใช้งาน</Link>
            </>
          )}
          {userData.role === "a" && (
            <>
              <Link to='/my-courses'>คอร์สของฉัน</Link>
              <Link to='/manageUser'>จัดการบัญชีผู้ใช้</Link>
              <Link to='/manageCourse'>จัดการคอร์ส</Link>
              <Link to='/guide'>คู่มือการใช้งาน</Link>
            </>
          )}
          {userData.role === "s" && (
            <>
              <Link to='/courses'>คอร์สออนไลน์</Link>
              <Link to='/guide'>คู่มือการใช้งาน</Link>
            </>
          )}
          {userData.name === null && (
            <>
              <Link to='/courses'>คอร์สออนไลน์</Link>
            </>
          )}
        </div>

        <div 
          className={`${style["functionsContainer-mobile"]} ${sidebarVisible ? style.showSidebar : ''}`}
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <div onClick={() => navigate('/')}>หน้าหลัก</div>

          {userData.role === "t" && (
            <>
              <div onClick={() => navigate('/my-courses')}>คอร์สของฉัน</div>
              <div onClick={() => navigate('/guide')}>คู่มือการใช้งาน</div>
            </>
          )}

          {userData.role === "a" && (
            <>
              <div onClick={() => navigate('/my-courses')}>คอร์สของฉัน</div>
              <div onClick={() => navigate('/manageUser')}>จัดการบัญชีผู้ใช้</div>
              <div onClick={() => navigate('/manageCourse')}>จัดการคอร์ส</div>
              <div onClick={() => navigate('/guide')}>คู่มือการใช้งาน</div>
            </>
          )}

          {userData.role === "s" && (
            <>
              <div onClick={() => navigate('/courses')}>คอร์สออนไลน์</div>
              <div onClick={() => navigate('/guide')}>คู่มือการใช้งาน</div>
            </>
          )}

          {userData.role === null && (
            <>
              <div onClick={() => navigate('/courses')}>คอร์สออนไลน์</div>
            </>
          )}
        </div>

        {userData.name !== null &&(
          <div className={style.userAuth}>  
            <div className={style.userInfo}>
              <div>
                <label>
                  {userData.sex === 'm' && 'นาย'+userData.name}
                  {userData.sex === 'f' && 'นาง'+userData.name}
                  {userData.sex === 'n' && 'คุณ'+userData.name}
                </label>
                <label>{userData.surname}</label>
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
