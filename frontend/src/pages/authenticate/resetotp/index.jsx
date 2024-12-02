import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import style from './css/resetotp.module.css';

function ResetCode() {
    const [data, setData] = useState({
      email:'',
      name:'',
      role:'',
    })
    const [otp, setOtp] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('resetToken');

    const decodeAuthToken = async (token) => {
      if(!token){
        console.log('Not authentication.');
        return
      }
      else{
        try{
          const response = await axios.get('http://localhost:3001/autherizationotp', {
            headers: {
              'Authorization': `Bearer ${token}`
            } 
          });
  
          if(response.status === 200){
            setData({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
          }
  
        } catch (error) {
          console.log(error);
        }
      }
    }

    useEffect(() => {
      decodeAuthToken(token);
    }, [token]);

    const handlesubmit = async (e) =>{
        e.preventDefault();
        
        try {
          const response = await axios.post('http://localhost:3001/verifyotp', { email: data.email, otp });
  
          if (response.status === 200) {
            console.log(response.data.message);
            setStatusMessage(response.data.message);
            setTimeout(() => navigate('/newpassword'), 1000); 
          }
        } catch (error) {
          console.error('Error verifying OTP:', error.response?.data?.message || error.message);
        }
    }
    
    return (
      <div className={style.container}>
        <div className={style.heading}>
          <img alt='Back_Burron' 
              src='./Expand_left.svg'
              onClick={() => navigate('/reset')}/>
          <p>Recovery Password</p>
        </div>
  
        <form onSubmit={handlesubmit}>
          <div className={style.inputContent}>
            <div>
              <label>Recovery Code</label>
              <input
                type='text'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
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

export default ResetCode