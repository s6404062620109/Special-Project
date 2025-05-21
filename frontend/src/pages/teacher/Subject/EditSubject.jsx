import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import backend from '../../../api/backend';

function EditSubject() {
    const { courseId, subjectId } = useParams();
    const [ subjectData, setSubjectData ] = useState({
        jsonData: [],
        pdfUrl: "",
        subjectName: ""
    }); 

    const fetchSubjectData = async () => {
        try {
            const response = await backend.get(`/teacher/getSubject/${courseId}/${subjectId}`, { withCredentials: true });
            
            if(response.status === 200){
                const subjectData = response.data;
                
                if(subjectData.subjectname){
                    setSubjectData({ ...subjectData, subjectName: subjectData.subjectname });

                    if (Array.isArray(subjectData.jsonData) && subjectData.jsonData.length > 0) {
                        setSubjectData({ ...subjectData, jsonData: subjectData.jsonData });
                    }
                    if (typeof subjectData.pdfUrl === 'string' && subjectData.pdfUrl.trim() !== '') {
                        setSubjectData({ ...subjectData, pdfUrl: subjectData.pdfUrl });
                    }
                    else {
                        console.warn("Missing subjectName in response");
                        return;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchSubjectData();
    }, [courseId, subjectId]);
    console.log(subjectData)
  return (
    <div>EditSubject</div>
  )
}

export default EditSubject