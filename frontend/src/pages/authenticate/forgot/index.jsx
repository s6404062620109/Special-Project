import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';

import style from "../css/auth.module.css";
import backend from "../../../api/backend";
import { autofillTextFieldSx } from "../login";

function Forgot() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await backend.post('/auth/forgot_password', {
            email
        });

        if (response.status === 200) {
            setStatusMessage(response.data.message);
            setTimeout(() => navigate('/'), 2000);
        }
    } catch (error) {
        console.log(error);
        setStatusMessage(error.response?.data?.message || 'Failed to forgot password.');
    }
  };

  return (
    <div className={style.container}>
      <div className={style.heading}>
        <p>ลืมรหัสผ่าน</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={style.inputContent}>
          <div>
            <TextField
              id="standard-basic"
              variant="standard"
              label="EMAIL"
              sx={autofillTextFieldSx}
              slotProps={{
                input: {
                  sx: { color: 'white' }
                }
              }}
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.status}>
            <p>{statusMessage}</p>
            <input type="submit" value="ขอรหัสกู้คืนบัญชี" />
          </div>

          <div className={style.functions}>
            <Link to="/login">คุณมีบัญชีผู้ใช้อยู่แล้ว ?</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Forgot;
