import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';

function SetPassword() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const navigate = useNavigate();

    const [ data, setData ] = useState({
      password: '',
      cpassword: ''
    });
    const [ statusMessage, setStatusMessage ] = useState('');
    const [ showPassword, setShowPassword ] = useState({
      password: false,
      cpassword: false
    });

    useEffect(() => {
      if(!token){
        window.location.href = "/";
      }
    },[token]);

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
            <p>ตั้งค่านรหัสผ่าน</p>
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword({...showPassword, password: !showPassword.password})}
                            edge="end"
                          >
                            {showPassword.password ? 
                              <VisibilityIcon/> : 
                              <VisibilityOffIcon/>
                            }
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  type={ showPassword.password ? 'text' : 'password' }
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword({...showPassword, cpassword: !showPassword.cpassword})}
                            edge="end"
                          >
                            {showPassword.cpassword ? 
                              <VisibilityIcon/> : 
                              <VisibilityOffIcon/>
                            }
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  type={ showPassword.cpassword ? 'text' : 'password' }
                  value={data.cpassword}
                  onChange={(e) => setData({ ...data, cpassword:e.target.value })}
                />
              </div>
            </div>
    
            <div className={style.footer}>
              <div className={style.status}>
                {statusMessage === "ตั้งค่ารหัสผ่านสำเร็จแล้ว" ? (
                  <p style={{color: 'green'}}>{statusMessage}</p>
                ):(
                  <p style={{color: 'red'}}>{statusMessage}</p>
                )}
                <input type='submit' value='ยืนยันรหัสผ่าน'/>
              </div>
    
              <div className={style.functions}>
                <Link to='/login'>คุณมีบัญชีผู้ใช้อยู่แล้ว ?</Link>
              </div>
            </div>
          </form>
        </div>
  )
}

export default SetPassword