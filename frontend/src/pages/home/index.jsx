import React, { useEffect, useState } from 'react';
import axios from 'axios';

import style from './css/home.module.css';


function Home() {
  const [userData, setUserdata] = useState({
    email:'',
    name:''
  });
  const token = localStorage.getItem('authToken');
  const decodeAuthToken = async (token) => {
    if(!token){
      console.log('Not authentication.');
      return
    }
    else{
      try{
        const response = await axios.get('http://localhost:3001/auth/authorization', {
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

  useEffect( () => {
    const fetchUserHistory = async () => {
      try{ 
        const response = await axios.get(`http://localhost:3001/getUserHistory/${userData.email}`);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }

    fetchUserHistory();
  }, [userData])

  return (
    <div className={style.container}>
      <p>
        Security Awareness Training
      </p>
    </div>
  )
}

export default Home
