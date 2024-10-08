import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';

import style from './css/labbox.module.css';

function LabBox({ subjectId }) {
    const [Address, setAddress] = useState({
        ip:'', port:''
    });
    const [loading, setLoading] = useState(false);
    const [ questionList, setQuestionList ] = useState([]);

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
                {Address && <Link to={`http://localhost:${Address.port}`}>{Address.ip}</Link>}
            </div>
        </div>
        
    </div>
  )
}

export default LabBox