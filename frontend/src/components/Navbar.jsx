import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import style from './css/navbar.module.css';
import backend from '../api/backend';


function Navbar() {
  const [data, setData] = useState({
    email:'',
    name:'',
    role:'',
  })
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      try{
        const response = await backend.get('/auth/authorization', {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
        });

        if(response.status === 200){
          setData({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }
  
  useEffect(() => {
    decodeAuthToken(token);
  }, [token])

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
          <img alt='Logo Image' src='/Navbar_Assets/Logo.svg'/>
          <p>SAT</p>
        </div>

        <div className={style.functionsContainer}>
          <Link to='/courses'>COURSES</Link>
          <Link>FAQ</Link>
          <Link>NEWS</Link>
        </div>

        {token && (
          <div className={style.userAuth}>  
            <div className={style.userInfo}>
              <div>
                <p>Name:</p>
                <label>{data.name}</label>
              </div>

              <img 
                alt='Profile Image' 
                src='/Navbar_Assets/Profile.png'
                onClick={() => setMenuVisible(!menuVisible)}
              />
            </div>

            {menuVisible && ( 
              <div className={style.functions}>
                <ul>
                  <li>
                    Setting
                    <img
                      alt='Setting Button'
                      src='/Navbar_Assets/Setting.svg'
                    />
                  </li>
                    
                  <li onClick={handleLogout}>
                    Log Out
                    <img
                      alt='LogOut Button'
                      src='/Navbar_Assets/Sign_out.svg'
                    />
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
