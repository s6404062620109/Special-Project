import React, { useEffect, useState } from 'react';

import style from './css/home.module.css';
import backend from '../../api/backend';


function Home() {
  const [userData, setUserdata] = useState({
    email:'',
    name:'',
    role:'',
  });
  const token = localStorage.getItem('authToken');
  
  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      try{
        const response = await backend.get('/auth/authorization', {
          headers: {
            'Authorization': `Bearer ${token}`
          } 
        });

        if(response.status === 200){
          setUserdata({ email: response.data.result[0].Email, name: response.data.result[0].Name, role: response.data.result[0].Role })
        }

      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    decodeAuthToken(token);
  }, [token]);

  return (
    <div className={style.container}>
      <p>
        Security Awareness Training
      </p>
    </div>
  )
}

export default Home
