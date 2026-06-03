import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
      setMsg(res.data.message || 'Password reset successful');
      setTimeout(()=> navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error occurred');
    }
  };

  if (!token) {
    return <p>Invalid reset link.</p>;
  }

  return (
    <div style={{padding:20}}>
      <h2>Set new password</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={submit}>
        <input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
