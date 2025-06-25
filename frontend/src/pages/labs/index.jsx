import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../context/AuthProvider';
import backend from '../../api/backend';

function Labs() {
    const { userData } = useContext(AuthContext);
    const { courseId, subjectId, enrollmentId } = useParams();

    const fetchLabQuestions = async () => {
        try{
            const response = await backend.get(`/labs/getLabQuestions/${courseId}`,{
                withCredentials: true
            });

            if(response.status === 200){
                console.log(response.data);
            }

        } catch(error){ 
            console.log(error);
        }
    }

    useEffect(() => {
        fetchLabQuestions();
    }, [courseId, subjectId, enrollmentId, userData]);

  return (
    <div>Labs</div>
  )
}

export default Labs