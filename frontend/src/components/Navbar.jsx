import React from 'react'
import { Link } from 'react-router-dom'

import style from './css/navbar.module.css';
import Logo from '../assets/Navbar/Logo.svg';
import Profile from '../assets/Navbar/Profile.png';


function Navbar() {
  return (
    <div className={style.container}>
      <div className={style.logoContainer}>
        <img alt='Logo Image' src={Logo}/>
        <p>SAT</p>
      </div>

      <div className={style.functionsContainer}>
        <Link to='/courses'>COURSES</Link>
        <Link>FAQ</Link>
        <Link>NEWS</Link>
      </div>

      <div className={style.userAuth}>
        <Link to='/login'>Log in</Link>
        <img alt='Profile Image' src={Profile}/>
      </div>
    </div>
  )
}

export default Navbar
