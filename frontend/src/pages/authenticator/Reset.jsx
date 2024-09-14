import React from 'react'
import { useNavigate } from 'react-router-dom';

import style from './css/user.module.css';

function Reset() {
    const navigate = useNavigate();

    const handlesubmit = () =>{
      navigate('/resetcode')
  }
    return (
      <div className={style.container}>
        <div className={style.heading}>
          <img alt='Back_Burron' 
              src='./Expand_left.svg'
              onClick={() => navigate('/login')}/>
          <p>Recovery Password</p>
        </div>
  
        <form onSubmit={() => handlesubmit()}>
          <div className={style.inputContent}>
            <div>
              <label>E-mail</label>
              <input
                type='text'
              />
            </div>
          </div>
  
          <div className={style.footer}>
            <div className={style.status}>
              <p>STATUS</p>
              <input type='submit' value='Send Recovery Code'/>
            </div>
  
          </div>
        </form>
      </div>
    )
}

export default Reset