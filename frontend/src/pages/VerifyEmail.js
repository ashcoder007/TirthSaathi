// src/pages/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setAuth } from '../utils/auth';
import { API_BASE_URL } from '../config';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending'); // pending | success | failed
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token'); // or 't' if you use a different name
    if (!token) {
      setStatus('failed');
      setMessage('Verification token not found in URL.');
      return;
    }

    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        // Expect backend to return { success: true, token: <jwt>, user: {...} }
        if (res.status === 200 && res.data?.token && res.data?.user) {
          // store and redirect to home
          setAuth({ token: res.data.token, user: res.data.user });
          setStatus('success');
          setMessage('Email verified. Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('failed');
          setMessage(res.data?.message || 'Verification response missing token/user.');
        }
      } catch (err) {
        console.error('verify error', err?.response?.data || err.message);
        const msg = err?.response?.data?.message || 'Verification failed. Token invalid or expired.';
        setStatus('failed');
        setMessage(msg);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 30, textAlign: 'center' }}>
      {status === 'pending' && <p>Verifying your email — please wait...</p>}
      {status === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {status === 'failed' && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
};

export default VerifyEmail;
