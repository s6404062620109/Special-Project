import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    name: ''
  })
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) =>{
    e.preventDefault();

    try { 
      const response = await backend.post('/auth/register', {
          email: data.email,
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
            <TextField
              id="standard-basic"
              variant="standard"
              label="EMAIL"
              sx={{
                borderRadius: "8px"
              }}
              InputProps={{
                sx: { 
                  color: 'white'
                }
              }}
              type='text'
              value={data.email}
              onChange={(e) => setData({ ...data, email:e.target.value })}
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="NAME"
              sx={{
                borderRadius: "8px"
              }}
              InputProps={{
                sx: { 
                  color: 'white'
                }
              }}
              type='text'
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