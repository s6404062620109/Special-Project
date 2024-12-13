import React, { useEffect, useState } from 'react'

import style from './css/labbox.module.css';
import backend from '../api/backend';

function LabBox({ no, id, question }) {
    const [Address, setAddress] = useState({
        ip:'', port:'', containerId: '', url:''
    });
    const [loading, setLoading] = useState(false);
    const [ answer, setAnswer ] = useState([]);
    const [ checkStatus, setCheckStatus ] = useState('');
    const [userData, setUserdata] = useState({
        email:'',
        name:'',
        role:''
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

    const handleCreateContainer = async () => {
        setLoading(true);

        try {
            const response = await backend.post('/lab/createLinuxContainer', { Email:userData.email , questionID: id });
            if(response.status === 200){    
                setAddress({ ip: response.data.ip, port: response.data.port , containerId: response.data.containerId, url: response.data.url});
            }
            
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswer((prev) => ({
          ...prev,
          [questionId]: answer,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await backend.post('/lab/submitLabanswer', 
                { answer: answer, email: userData.email 
            });
            setCheckStatus(response.data.message);

        } catch (error) {
            console.log(error);
        }
    }

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

        try {
            const response = await backend.post('/lab/startContainer', {
                containerId: Address.containerId,
                port: Address.port,
            });
            
            if (response.status === 200) {
                console.log('Firefox started successfully');
            }
        } catch (error) {
            console.error('Error starting Firefox:', error);
        }
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
                            required
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
                <div className={style["labWrap"]}>
                    <button onClick={handleCreateContainer} disabled={loading}>
                        {loading ? 'Spawnng...' : 'SPAWN'}
                    </button>

                    <div className={style.address}>
                        {Address && <p to={`${Address.url}`}>{Address.ip}</p>}
                    </div>

                    <button onClick={handleStartContainer} disabled={!Address.port}>
                        START
                    </button>
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default LabBox