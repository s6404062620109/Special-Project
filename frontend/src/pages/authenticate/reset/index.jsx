import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import style from '../css/auth.module.css';
import backend from '../../../api/backend';

function Reset() {
    const [ password, setPassword ] = useState({
      rpassword: null, cpassword: null
    })
    const [statusMessage, setStatusMessage] = useState('');
    const [ showPassword, setShowPassword ] = useState({
      password: false,
      cpassword: false
    });
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    useEffect(() => {
      if(!token){
        window.location.href = "/";
      }
    },[token]);

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!token) {
          setStatusMessage('ไม่พบโทเค็น');
          return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password.rpassword)) {
        setStatusMessage(
          'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรประกอบด้วย \nตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ(@, $, !, %, *, ?, &)'
        );
        return;
      }

      if (password.rpassword !== password.cpassword) {
          setStatusMessage('รหัสผ่านไม่ตรงกัน');
          return;
      }

      try {
          const response = await backend.put('/auth/reset_password', {
            token,
            newPassword: password.rpassword,
          });

        if (response.status === 200) {
          setStatusMessage(response.data.message);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatusMessage(response.data.message);
        }
      } catch (error) {
          setStatusMessage(error.response?.data?.message || 'Failed to reset password.');
      }
    };

    return (
      <div className={style.container}>
        <div className={style.heading}>
          <p>ตั้งค่านรหัสผ่านใหม่</p>
        </div>
  
        <form onSubmit={handleSubmit}>
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
                value={password.rpassword}
                onChange={(e) => setPassword({...password, rpassword:e.target.value})}
                required
              />
            </div>
          </div>

          <div className={style.inputContent}>
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
                value={password.cpassword}
                onChange={(e) => setPassword({...password, cpassword:e.target.value})}
                required
              />
            </div>
          </div>
  
          <div className={style.footer}>
            <div className={style.status}>
              {statusMessage === "Password updated successfully." || statusMessage === "อัปเดตพาสเวิร์ดสำเร็จ" ? (
                <p style={{color: 'green'}}>{statusMessage}</p>
              ):(
                <p style={{color: 'red'}}>{statusMessage}</p>
              )}
              
              <input type='submit' value='ยืนยันรหัสผ่านใหม่'/>
            </div>

            <div className={style.functions}>
              <Link to='/login'>คุณมีบัญชีผู้ใช้อยู่แล้ว ?</Link>
            </div>
          </div>
        </form>
      </div>
    )
}

export default Reset