import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import style from './css/newpassword.module.css';

function Setpassword() {
    const navigate = useNavigate();
    const token = localStorage.getItem('resetToken');
    const [statusMessage, setStatusMessage] = useState('');
    const [data, setData] = useState({
      email: '',
      password: '',
      cpassword: ''
    });

    const decodeAuthToken = (Authtoken) =>{
      if(!Authtoken){
        console.log('Not authentication.');
        return
      }
      else{
        const decodedToken = jwtDecode(Authtoken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('resetToken');
          console.log('resetToken expired. Logging out.'); 
        }
        else{
          setData({...data, email: decodedToken.email});
        }
      }
    }

    useEffect(() => {
      decodeAuthToken(token);
    }, [token]);

    const handlesubmit = async (e) =>{
        e.preventDefault();
        
        if (data.password !== data.cpassword) {
          setStatusMessage('Passwords do not match');
          return;
        }

        try {
            const response = await axios.post('http://localhost:3001/setnewpassword', {
                email: data.email,
                password: data.password
            });

            if (response.status === 200) {
                setStatusMessage(response.data.message);
                localStorage.removeItem('resetToken');
                setTimeout(() => navigate('/login'), 1000);
            }
        } catch (error) {
            console.error('Error setting new password:', error.response?.data?.message || error.message);
            setStatusMessage('Failed to update password');
        }
    }
    return (
      <div className={style.container}>
        <div className={style.heading}>
          <img alt='Back_Burron' 
              src='./Expand_left.svg'
              onClick={() => navigate('/reset')}/>
          <p>Set New Password</p>
        </div>
  
        <form onSubmit={handlesubmit}>
          <div className={style.inputContent}>
            <div>
              <label>New Password</label>
              <input
                type='password'
                value={data.password}
                onChange={(e) => setData({...data, password:e.target.value})}
                required
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                type='password'
                value={data.cpassword}
                onChange={(e) => setData({...data, cpassword:e.target.value})}
                required
              />
            </div>
          </div>
  
          <div className={style.footer}>
            <div className={style.status}>
              <p>{statusMessage}</p>
              <input type='submit' value='Confirm'/>
            </div>
  
          </div>
        </form>
      </div>
    )
}

export default Setpassword