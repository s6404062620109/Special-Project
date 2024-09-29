import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import style from './css/login.module.css';

function Login() {
  const navigate = useNavigate();
  const [dataInput, setDatainput] = useState({
    email: '',
    password: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try { 
      const response = await axios.post('http://localhost:3001/login', {
          email: dataInput.email,
          password: dataInput.password,
      });

      if (response.status === 201) {
        setStatusMessage(response.data.message);
        localStorage.setItem('authToken', response.data.token);
        setTimeout(() => navigate('/'), 2000);
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
        <img alt='Back_Burron' 
            src='./Expand_left.svg'
            onClick={() => navigate('/')}/>
        <p>Log in</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={style.inputContent}>
          <div>
            <label>E-mail</label>
            <input
              type='text'
              value={dataInput.email}
              onChange={(e) => setDatainput({...dataInput, email: e.target.value})}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type='password'
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
            <Link to='/reset'>Forgot password ?</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
