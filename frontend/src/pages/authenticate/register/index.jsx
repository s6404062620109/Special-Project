import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import style from './css/register.module.css';
import backend from '../../../api/backend';

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    password: '',
    cpassword: '',
    name: ''
  })
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) =>{
    e.preventDefault();

    if (data.password !== data.cpassword) {
      setStatusMessage("Passwords do not match");
      return;
    }

    try { 
      const response = await backend.post('/auth/register', {
          email: data.email,
          password: data.password,
          name: data.name,
      });

      if (response.status === 201) {
        setStatusMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
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
            onClick={() => navigate('/login')}/>
        <p>Sign Up</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className={style.inputContent}>
          <div>
            <label>E-mail</label>
            <input
              type='text'
              value={data.email}
              onChange={(e) => setData({ ...data, email:e.target.value })}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type='password'
              value={data.password}
              onChange={(e) => setData({ ...data, password:e.target.value })}
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type='password'
              value={data.cpassword}
              onChange={(e) => setData({ ...data, cpassword:e.target.value })}
            />
          </div>

          <div>
            <label>Name</label>
            <input
              type='text'
              value={data.name}
              onChange={(e) => setData({ ...data, name:e.target.value })}
            />
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>{statusMessage}</p>
            <input type='submit' value='Register'/>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register