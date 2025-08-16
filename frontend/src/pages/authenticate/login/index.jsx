import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import style from './css/login.module.css';
import backend from '../../../api/backend';

export const autofillTextFieldSx = {
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0px 1000px transparent inset !important',
    WebkitTextFillColor: 'black',
    transition: 'background-color 9999s ease-in-out 0s',
  },
  '& .MuiInputBase-root': {
    color: 'black',
  },
  '& .MuiInputLabel-root': {
    color: 'black',
  }
};

function Login() {
  const [ dataInput, setDatainput ] = useState({
    email: '',
    password: ''
  });
  const [ statusMessage, setStatusMessage ] = useState('');
  const [ showPassword, setShowPassword ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try { 
      const response = await backend.post('/auth/login', {
          email: dataInput.email,
          password: dataInput.password,
      }, { withCredentials: true });

      if (response.status === 200) {
        setStatusMessage(response.data.message);
        localStorage.setItem('email', dataInput.email);
        setTimeout(() => window.location.reload(), 2000);
      } 
      else if(response.status === 401) {
        setStatusMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setStatusMessage(error.response.data.message);
    }
  }

  return (
    <div className={style.container}>
      <div className={style.heading}>
        <p>LOG IN</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className={style.inputContent}>
          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="EMAIL"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'black'},
                }
              }}
              type='text'
              value={dataInput.email}
              onChange={(e) => setDatainput({...dataInput, email: e.target.value})}
              required
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="PASSWORD"
              slotProps={{
                input: {
                  sx: { color: 'black' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? 
                          <VisibilityIcon sx={{color: 'black'}}/> : 
                          <VisibilityOffIcon sx={{color: 'black'}}/>
                        }
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              type={showPassword ? 'text' : 'password'}
              value={dataInput.password}
              onChange={(e) => setDatainput({...dataInput, password: e.target.value})}
              required
            />
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>{statusMessage}</p>
            <input type='submit' value='Log in'/>
          </div>

          <div className={style.functions}>
            <Link to='/register'>Don’t have an account ?</Link>
            <div></div>
            <Link to='/forgot-password'>Forgot password ?</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
<footer class="footer">
  <div class="footer-container">
    <div class="footer-section">
      <h3>About Us</h3>
      <p>เราคือทีมพัฒนาที่มุ่งมั่นสร้างเว็บที่ดีที่สุด</p>
    </div>
    <div class="footer-section">
      <h3>Links</h3>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </div>
    <div class="footer-section">
      <h3>Follow Us</h3>
      <div class="social-icons">
        <a href="#"><img src="icon-facebook.png" alt="Facebook"/></a>
        <a href="#"><img src="icon-twitter.png" alt="Twitter"/></a>
        <a href="#"><img src="icon-instagram.png" alt="Instagram"/></a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    &copy; 2025 Your Website | All Rights Reserved
  </div>
</footer>
export default Login


