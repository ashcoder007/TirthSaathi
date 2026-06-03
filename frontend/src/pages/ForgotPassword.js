import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMsg(res.data.message || 'If the email exists, a reset link was sent.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Forgot Password</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={submit}>
        <input type="email" placeholder="Your registered email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button type="submit">Send reset link</button>
      </form>
    </div>
  );
}
