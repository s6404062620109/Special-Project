import React, { useEffect, useState } from 'react'
import axios from 'axios';

import style from './css/labbox.module.css';

function LabBox({ subjectId }) {
    const [Address, setAddress] = useState({
        ip:'', port:'', containerId: ''
    });
    const [loading, setLoading] = useState(false);
    const [ questionList, setQuestionList ] = useState([]);
    const [ answer, setAnswer ] = useState([]);
    const [ checkStatus, setCheckStatus ] = useState('');

    useEffect(() => {
        const fetchQuestion = async () => {
            try{
                const response = await axios.get(`http://localhost:3001/getLabquestion/${subjectId}`);

                setQuestionList(response.data.questionlist);

            } catch(error){
                console.log(error);
            }
        }

        fetchQuestion();
    }, [subjectId])

    const handleCreateContainer = async () => {
        setLoading(true);
        let questionID = questionList.map(item => item.QuestionID)
        try {
            const response = await axios.post('http://localhost:3001/createLinuxContainer', {questionID});
            setAddress({ ip: response.data.ip, port: response.data.port , containerId: response.data.containerId});
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
            const response = await axios.post('http://localhost:3001/submitLabanswer', answer);
            setCheckStatus(response.data.message);

        } catch (error) {
            console.log(error);
        }
    }

    const handleStartContainer = () => {
        const newTab = window.open(`http://localhost:${Address.port}`, '_blank');

        const checkTabClosed = setInterval(async () => {
            if (newTab.closed) {
                clearInterval(checkTabClosed);

                try {
                    const response = await axios.post(`http://localhost:3001/stopContainer`, 
                        { containerId: Address.containerId, IpAddress: `${Address.ip}:${Address.port}` }
                    );

                    if(response.status === 200) {
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
        <h2>Question</h2>
        <div className={style.content}>
            <div className={style.questionBox}>
                {questionList.map((item, index) => (
                    <div 
                        className={style.question}
                        key={index}
                    >
                        <h3>{index+1}. {item.Question}</h3>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <input
                                type='text'
                                onChange={(e) => handleAnswerChange(item.QuestionID, e.target.value)}
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
                ))}
            </div>

            <div className={style.labBox}>
                <div className={style["labWrap"]}>
                    <button onClick={handleCreateContainer} disabled={loading}>
                        {loading ? 'Spawnng...' : 'SPAWN'}
                    </button>

                    <div className={style.address}>
                        {Address && <p to={`http://localhost:${Address.port}`}>{Address.ip}</p>}
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