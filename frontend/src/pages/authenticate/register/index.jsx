import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';
import { autofillTextFieldSx } from '../login';
import Checkbox from '@mui/material/Checkbox';
import { IconButton, InputAdornment, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    name: '',
    surname: '',
    password: '',
    confirm_password: '',
    teacher_request: false,
  })
  const [statusMessage, setStatusMessage] = useState('');
  const [ showPassword, setShowPassword ] = useState(false);
  const [ showConfirmPassword, setShowConfirmPassword ] = useState(false);

  const handleSubmit = async (e) =>{
    e.preventDefault();

    if(data.password !== data.confirm_password){
      setStatusMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try { 
      const response = await backend.post('/auth/register', {
          email: data.email,
          name: data.name,
          surname: data.surname,
          password: data.password,
          teacher_request: data.teacher_request,
      });

      if (response.status === 201) {
        setStatusMessage(response.data.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
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
        <p>สมัครสมาชิก</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className={style.inputContent}>
          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="EMAIL"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'white' }
                }
              }}
              type='text'
              value={data.email}
              onChange={(e) => setData({ ...data, email:e.target.value })}
              required
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="NAME"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'white' }
                }
              }}
              type='text'
              value={data.name}
              onChange={(e) => setData({ ...data, name:e.target.value })}
              required
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="SURNAME"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'white' }
                }
              }}
              type='text'
              value={data.surname}
              onChange={(e) => setData({ ...data, surname:e.target.value })}
              required
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="PASSWORD"
              sx={autofillTextFieldSx}
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
                        {showConfirmPassword ? 
                          <VisibilityIcon sx={{color: 'black'}}/> : 
                          <VisibilityOffIcon sx={{color: 'black'}}/>
                        }
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => setData({ ...data, password:e.target.value })}
              required
            />
          </div>

          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="CONFIRM PASSWORD"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'black' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? 
                          <VisibilityIcon sx={{color: 'black'}}/> : 
                          <VisibilityOffIcon sx={{color: 'black'}}/>
                        }
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              type={showConfirmPassword ? 'text' : 'password'}
              value={data.confirm_password}
              onChange={(e) => setData({ ...data, confirm_password:e.target.value })}
              required
            />
          </div>

          <div>
            <Checkbox
              onChange={(e) => setData({ ...data, teacher_request: e.target.checked })}
              checked={Boolean(data.teacher_request)}
            />
            <Typography variant='body2'>ต้องการสมัครเป็นอาจารย์ผู้สอน</Typography>
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            {statusMessage === "สมัครสมาชิกสำเร็จแล้ว" ? (
               <p style={{color: 'green'}}>{statusMessage}</p>
            ):(
              <p style={{color: 'red'}}>{statusMessage}</p>
            )}
           
            <input type='submit' value='ยืนยันสมัครสมาชิก'/>
          </div>

          <div className={style.functions}>
            <Link to='/'>คุณมีบัญชีผู้ใช้อยู่แล้ว ?</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register