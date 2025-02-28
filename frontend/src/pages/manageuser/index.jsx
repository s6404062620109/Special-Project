import React, { useEffect } from 'react';
import backend from '../../api/backend';

import style from './css/manageuser.module.css';

function ManageUser() {
    useEffect(() => {
        const fetchUserData = async () =>{
            try{
                const response = await backend.get('/user/getUsers');

                if(response.status === 200){
                    console.log(response.data);
                }
            } catch(error){
                console.log(error);
            }
        }   
        fetchUserData()
    }, []);

  return (
    <div className={style.container}>
        ManageUser
    </div>
  )
}

export default ManageUser