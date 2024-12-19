import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

import style from './css/newpassword.module.css';
import backend from '../../../api/backend';

function Setpassword() {
    const navigate = useNavigate();
    const token = localStorage.getItem('resetToken');
    const [statusMessage, setStatusMessage] = useState('');
    const [data, setData] = useState({
      email: '',
      password: '',
      cpassword: ''
    });

    const decodeAuthToken = async (token) => {
      if(!token){
        console.log('Not authentication.');
        return
      }
      else{
        try{
          const response = await backend.get('/auth/autherizationotp', {
            headers: {
              'Authorization': `Bearer ${token}`
            } 
          });
  
          if(response.status === 200){
            setData({ ...data, email: response.data.result[0].Email })
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
        console.log(data)

        if (data.password !== data.cpassword) {
          setStatusMessage('Passwords do not match');
          return;
        }

        try {
            const response = await backend.post('/auth/setnewpassword', {
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

            <div className={style.functions}>
              <Link to='/'>Do you already have an account ?</Link>
            </div>
          </div>
        </form>
      </div>
    )
}

export default Setpassword