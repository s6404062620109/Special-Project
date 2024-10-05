import React, { useEffect, useState } from 'react'
import axios from 'axios';

import style from './css/labbox.module.css';

function LabBox({ subjectId }) {
    const [ipAddress, setIpAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [ questionList, setQuestionList ] = useState([]);

    const handleCreateContainer = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/createLinuxContainer');
            console.log(response)
            setIpAddress(response.data.ip);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

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

    console.log(questionList)
  return (
    <div className={style.container}>
        <h2>Question</h2>
        <div className={style.content}>
            <div className={style.questionBox}>
                {questionList.map(item => (
                    <div>
                        <p>{item.Question}</p>
                        <input
                            type='text'
                        />
                    </div>
                ))}
            </div>

            <div className={style.labBox}>
                <button onClick={handleCreateContainer} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Linux Container'}
                </button>
                {ipAddress && <p>Container IP Address: {ipAddress}</p>}
            </div>
        </div>
        
    </div>
  )
}

export default LabBox