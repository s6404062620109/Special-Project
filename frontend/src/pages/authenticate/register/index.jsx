import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

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
        setTimeout(() => navigate('/'), 2000);
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
        <p>CREATE A NEW ACCOUNT</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className={style.inputContent}>
          <div>
            <label>EMAIL</label>
            <input
              type='text'
              placeholder='EMAIL'
              value={data.email}
              onChange={(e) => setData({ ...data, email:e.target.value })}
            />
          </div>

          <div>
            <label>PASSWORD</label>
            <input
              type='password'
              placeholder='PASSWORD'
              value={data.password}
              onChange={(e) => setData({ ...data, password:e.target.value })}
            />
          </div>

          <div>
            <label>CONFIRM PASSWORD</label>
            <input
              type='password'
              placeholder='CONFIRM PASSWORD'
              value={data.cpassword}
              onChange={(e) => setData({ ...data, cpassword:e.target.value })}
            />
          </div>

          <div>
            <label>NAME</label>
            <input
              type='text'
              placeholder='NAME'
              value={data.name}
              onChange={(e) => setData({ ...data, name:e.target.value })}
            />
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>{statusMessage}</p>
            <input type='submit' value='SIGN UP'/>
          </div>

          <div className={style.functions}>
            <Link to='/'>Do you already have an account ?</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register