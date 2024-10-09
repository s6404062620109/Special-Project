import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import style from './css/labbox.module.css';

function LabBox({ subjectId }) {
    const [Address, setAddress] = useState({
        ip:'', port:''
    });
    const [loading, setLoading] = useState(false);
    const [ questionList, setQuestionList ] = useState([]);
    const [ answer, setAnswer ] = useState([]);
    const [ checkStatus, setCheckStatus ] = useState('');
    const navigate = useNavigate();

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
            console.log(response);
            setAddress({ ip: response.data.ip, port: response.data.port});
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

                    <button onClick={() => window.open(`http://localhost:${Address.port}`, '_blank')}>
                        START
                    </button>
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default LabBox