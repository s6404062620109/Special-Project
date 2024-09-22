import React, { useState } from 'react'
import axios from 'axios';

import style from './css/labbox.module.css';

function LabBox() {
    const [ipAddress, setIpAddress] = useState('');
    const [loading, setLoading] = useState(false);

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

  return (
    <div>
        <button onClick={handleCreateContainer} disabled={loading}>
            {loading ? 'Creating...' : 'Create Linux Container'}
        </button>
        {ipAddress && <p>Container IP Address: {ipAddress}</p>}
    </div>
  )
}

export default LabBox