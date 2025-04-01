import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';

function SetPassword() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const navigate = useNavigate();

    const [data, setData] = useState({
      password: '',
      cpassword: ''
    });
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) =>{
      e.preventDefault();
      
      if(data.password !== data.cpassword){
        setStatusMessage("Password not matching confirm password.");
        return;
      }

      try { 
        const response = await backend.put('/auth/register_password', {
          token,
          email,
          newPassword: data.password
        });
  
        if (response.status === 200) {
          setStatusMessage(response.data.message);
        } else {
          setStatusMessage(response.data.message);
        }
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        console.error('Error during registration:', error);
        setStatusMessage(error.response.data.message);
      }
      
    }

  return (
    <div className={style.container}>
          <div className={style.heading}>
            <p>SET PASSWORD</p>
          </div>
    
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className={style.inputContent}>
              <div>
                <TextField
                  id="standard-basic"
                  variant="standard"
                  label="PASSWORD"
                  slotProps={{
                    input: {
                      sx: { 
                        color: 'white',
                      }
                    }
                  }}
                  type='password'
                  value={data.password}
                  onChange={(e) => setData({ ...data, password:e.target.value })}
                />
              </div>
    
              <div>
                <TextField
                  id="standard-basic"
                  variant="standard"
                  label="CONFIRM PASSWORD"
                  slotProps={{
                    input: {
                      sx: { 
                        color: 'white',
                      }
                    }
                  }}
                  type='password'
                  value={data.cpassword}
                  onChange={(e) => setData({ ...data, cpassword:e.target.value })}
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

export default SetPassword