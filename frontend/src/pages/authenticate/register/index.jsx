import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';
import { autofillTextFieldSx } from '../login';
import Checkbox from '@mui/material/Checkbox';
import { Typography } from '@mui/material';

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    name: '',
    teacher_request: false,
  })
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) =>{
    e.preventDefault();

    try { 
      const response = await backend.post('/auth/register', {
          email: data.email,
          name: data.name,
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
            <Checkbox
              onChange={(e) => setData({ ...data, teacher_request: e.target.checked })}
              checked={Boolean(data.teacher_request)}
            />
            <Typography variant='body2'>ต้องการสมัครเป็นอาจารย์ผู้สอน</Typography>
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            {statusMessage === "สมัครสมาชิกสำเร็จแล้ว, กรุณาตั้งค่ารหัสผ่านที่อีเมลของคุณ." ? (
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