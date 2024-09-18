import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';

import style from './css/navbar.module.css';


function Navbar() {
  const [data, setData] = useState({
    email:'',
    name:''
  })
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  
  useEffect(() => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('authToken');
        console.log('Token expired. Logging out.');
        navigate('/login'); 
      }
      else{
        setData({
          email: decodedToken.email,
          name: decodedToken.name
        })
      }
    }
    
    // console.log('Decoded Token:', decodedToken);
  }, []);

  const handleLogout = () =>{
    localStorage.removeItem('authToken');
    window.location.reload();
  }

  return (
    <div className={style.navWrap}>
      <nav>
        <div className={style.logoContainer}
          onClick={() => navigate('/')}  
        >
          <img alt='Logo Image' src='./Navbar_Assets/Logo.svg'/>
          <p>SAT</p>
        </div>

        <div className={style.functionsContainer}>
          <Link to='/courses'>COURSES</Link>
          <Link>FAQ</Link>
          <Link>NEWS</Link>
        </div>

        <div className={style.userAuth}>
          {token ? (
            <div className={style.userInfo}>
              <div>
                <p>Name:</p>
                <label>{data.name}</label>
              </div>
            </div>
          ) : (
            <Link to='/login'>Log in</Link>
          )}
          <img 
            alt='Profile Image' 
            src='./Navbar_Assets/Profile.png'
            onClick={() => setMenuVisible(!menuVisible)}
          />
          {token && (
            <>
              {menuVisible && (
                <div className={style.functions}>
                  <ul>
                    <li>
                      Setting
                      <img
                        alt='Setting Button'
                        src='./Navbar_Assets/Setting.svg'
                      />
                    </li>
                    <li onClick={handleLogout}>
                      Log Out
                      <img
                        alt='LogOut Button'
                        src='./Navbar_Assets/Sign_out.svg'
                      />
                    </li>
                  </ul>
                </div>
              )} 
            </>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navbar
