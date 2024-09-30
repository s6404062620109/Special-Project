import axios from 'axios';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function Pretest() {
  const { courseId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await axios.get(`http://localhost:3001/getPretest/${courseId}`);
        console.log(response);
      }
      catch(err){
        console.log(err);
      }
    }

    fetchData();
  }, [courseId])

  return (
    <div>Pretest</div>
  )
}

export default Pretest