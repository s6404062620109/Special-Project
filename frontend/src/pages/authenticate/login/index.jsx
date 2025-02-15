import React, { useState } from 'react'
import { Link } from 'react-router-dom';

import style from './css/login.module.css';
import backend from '../../../api/backend';

function Login() {
  const [dataInput, setDatainput] = useState({
    email: '',
    password: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

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
      setStatusMessage("Server error, please try again later");
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
            <label>EMAIL</label>
            <input
              type='text'
              placeholder='EMAIL'
              value={dataInput.email}
              onChange={(e) => setDatainput({...dataInput, email: e.target.value})}
            />
          </div>

          <div>
            <label>PASSWORD</label>
            <input
              type='password'
              placeholder='PASSWORD'
              value={dataInput.password}
              onChange={(e) => setDatainput({...dataInput, password: e.target.value})}
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

export default Login
