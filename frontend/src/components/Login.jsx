import React from 'react'

import style from './css/user.module.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div className={style.container}>
      <div className={style.heading}>
        <img alt='Back_Burron' 
            src='./Expand_left.svg'
            onClick={() => navigate('/')}/>
        <p>Log in</p>
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
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>STATUS</p>
            <input type='submit' value='Log in'/>
          </div>

          <div className={style.functions}>
            <Link to='/register'>Don’t have an account ?</Link>
            <div></div>
            <Link to=''>Forgot password ?</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login