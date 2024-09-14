import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import style from './css/navbar.module.css';


function Navbar() {
  const navigate = useNavigate();

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
          <Link to='/login'>Log in</Link>
          <img alt='Profile Image' src='./Navbar_Assets/Profile.png'/>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
