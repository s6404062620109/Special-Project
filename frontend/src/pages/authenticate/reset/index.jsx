import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';

import style from './css/reset.module.css';
import backend from '../../../api/backend';

function Reset() {
    const [ password, setPassword ] = useState({
      rpassword: null, cpassword: null
    })
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!token) {
          setStatusMessage('Token is missing.');
          return;
      }

      if (password.rpassword !== password.cpassword) {
          setStatusMessage('Passwords do not match.');
          return;
      }

      try {
          const response = await backend.put('/auth/reset_password', {
              token,
              newPassword: password.rpassword,
          });

          if (response.status === 200) {
              setStatusMessage(response.data.message);
              setTimeout(() => navigate('/'), 2000);
          }
      } catch (error) {
          setStatusMessage(error.response?.data?.message || 'Failed to reset password.');
      }
    };

    return (
      <div className={style.container}>
        <div className={style.heading}>
          <p>Reset Password</p>
        </div>
  
        <form onSubmit={handleSubmit}>
          <div className={style.inputContent}>
            <div>
              <label>Password</label>
              <input
                type='password'
                value={password.rpassword}
                onChange={(e) => setPassword({...password, rpassword:e.target.value})}
                required
              />
            </div>
          </div>

          <div className={style.inputContent}>
            <div>
              <label>Confirm Password</label>
              <input
                type='password'
                value={password.cpassword}
                onChange={(e) => setPassword({...password, cpassword:e.target.value})}
                required
              />
            </div>
          </div>
  
          <div className={style.footer}>
            <div className={style.status}>
              <p>{statusMessage}</p>
              <input type='submit' value='Send Recovery Code'/>
            </div>

            <div className={style.functions}>
              <Link to='/'>Do you already have an account ?</Link>
            </div>
          </div>
        </form>
      </div>
    )
}

export default Reset