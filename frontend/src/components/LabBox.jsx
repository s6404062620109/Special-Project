import React, { useEffect, useState } from 'react'

import style from './css/labbox.module.css';
import backend from '../api/backend';

function LabBox({ no, id, question }) {
    const [Address, setAddress] = useState({
        ip:'', port:'', containerId: '', url:''
    });
    const [loading, setLoading] = useState(false);
    const [focus, setFocus] = useState(false);
    const [ answer, setAnswer ] = useState([]);
    const [ checkStatus, setCheckStatus ] = useState('');
    const [userData, setUserData] = useState({
        id:null,
        email:null,
        name:null,
        role:null,
        profile_img:null,
    });
    const emailrefStorage = localStorage.getItem("email");

    useEffect(() => {
        const fetchUserData = async () => {
          try{
            const response = await backend.get(`/auth/authorization/${emailrefStorage}`, {
              withCredentials: true
            });
            if(response.status === 200){
              setUserData({
                id:response.data.id,
                email:response.data.email,
                name:response.data.name,
                role:response.data.role,
                profile_img:response.data.profile_img,
              });
            }
    
          } catch(error){
            console.log(error);
          }
          
        }
        fetchUserData();
    },[emailrefStorage]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswer((prev) => ({
          ...prev,
          [questionId]: answer,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await backend.post('/lab/submitLabanswer', { 
                answer: answer, 
                email: userData.email, 
            });
            setCheckStatus(response.data.message);

        } catch (error) {
            console.log(error);
        }
    }

    const handleCreateContainer = async () => {
        setLoading(true);

        try {
            const response = await backend.post('/lab/createLinuxContainer', { Email:userData.email , questionID: id });
            if(response.status === 200){    
                setAddress({ 
                    ip: response.data.ip, 
                    port: response.data.port , 
                    containerId: response.data.containerId, 
                    url: response.data.url
                });
            }
            
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };  

    const handleStartContainer = async () => {
        const newTab = window.open(`http://localhost:${Address.port}`, '_blank');
    
        const checkTabClosed = setInterval(async () => {
            if (newTab.closed) {
                clearInterval(checkTabClosed);
    
                try {
                    const response = await backend.post('/lab/stopContainer', { 
                        containerId: Address.containerId, 
                        IpAddress: `${Address.ip}:${Address.port}` 
                    });
    
                    if (response.status === 200) {
                        setAddress({ ip: 'Stop lab test', port: '', containerId: '' });
                    }
    
                } catch (error) {
                    console.error(`Failed to stop container ${Address.containerId}:`, error);
                }
            }
        }, 2000);
    };

  return (
    <div className={style.container}>
        <h2>Lab Question</h2>
        <div className={style.content}>
            <div className={style.questionBox}>
                
                <div 
                    className={style.question}
                >
                    <h3>{no}. {question}</h3>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <input
                            type='text'
                            onChange={(e) => handleAnswerChange(id, e.target.value)}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                            required
                            className={`${style.inputText} ${focus ? style.focusInput : ''}`}
                        />

                        {!checkStatus ? (
                            <input
                                type='submit'
                                value='Submit'
                            />
                        ) : (
                            <p>{checkStatus}</p>
                        )}
                    </form>
                </div>
            </div>

            <div className={style.labBox}>
                <div className={style["lab-wrap"]}>
                    <button 
                        onClick={handleCreateContainer} 
                        disabled={loading}
                    >
                        {loading ? 'Spawnng...' : 'SPAWN'}
                    </button>

                    <div className={style.address}>
                        {Address && <p to={`${Address.url}`}>{Address.ip}</p>}
                    </div>

                    <button onClick={handleStartContainer} disabled={!Address.port}>
                        START
                    </button>
                    <button>
                        <img 
                            src='/Course_Assets/Skip forward.svg'
                            alt='Skip Icon'
                        />
                        NEXT
                    </button>
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default LabBox