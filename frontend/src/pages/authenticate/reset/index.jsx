import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import style from './css/reset.module.css';

function Reset() {
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const handlesubmit = async (e) =>{
      e.preventDefault(); 
      
      try {
        const response = await axios.post('http://localhost:3001/auth/requestotp', { email });
        if (response.status === 200) {
          localStorage.setItem('resetToken', response.data.token);
          setStatusMessage(response.data.message);
          setTimeout(() => navigate('/resetcode'), 1000);
        }
      } catch (error) {
        setStatusMessage('Failed to send OTP');
      }
    }

    return (
      <div className={style.container}>
        <div className={style.heading}>
          <img alt='Back_Burron' 
              src='./Expand_left.svg'
              onClick={() => navigate('/login')}/>
          <p>Recovery Password</p>
        </div>
  
        <form onSubmit={handlesubmit}>
          <div className={style.inputContent}>
            <div>
              <label>E-mail</label>
              <input
                type='text'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
  
          <div className={style.footer}>
            <div className={style.status}>
              <p>{statusMessage}</p>
              <input type='submit' value='Send Recovery Code'/>
            </div>
  
          </div>
        </form>
      </div>
    )
}

export default Reset