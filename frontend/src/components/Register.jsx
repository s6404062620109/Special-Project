import React from 'react'
import { useNavigate } from 'react-router-dom';

import style from './css/user.module.css';

function Register() {
  const navigate = useNavigate();

  return (
    <div className={style.container}>
      <div className={style.heading}>
        <img alt='Back_Burron' 
            src='./Expand_left.svg'
            onClick={() => navigate('/login')}/>
        <p>Sign Up</p>
      </div>

      <form>
        <div className={style.inputContent}>
          <div>
            <label>E-mail</label>
            <input
              type='text'
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type='password'
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type='password'
            />
          </div>

          <div>
            <label>Name</label>
            <input
              type='text'
            />
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>STATUS</p>
            <input type='submit' value='Register'/>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register