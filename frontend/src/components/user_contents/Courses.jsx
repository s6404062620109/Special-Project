import React, { useEffect, useState } from 'react'
import axios from 'axios';

function Courses() {
  const [data, setData] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/getCourses');
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.CourseID}>
          <img
            alt='course icon'
            src={`./Course_Icon/${item.Icon_id}`}
          />
          <div>
            <h1>{item.Name}</h1>
            <p>{item.Detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Courses