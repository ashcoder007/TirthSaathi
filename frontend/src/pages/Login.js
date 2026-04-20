import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('ts_token', res.data.token);
      localStorage.setItem('ts_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page login">

      {/* MAIN CARD */}
      <div className="auth-card">

        <h2>Login</h2>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@domain.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          {/* Login button */}
          <div style={{ textAlign: "right", marginTop: 18 }}>
            <button className="btn-primary" type="submit">
              Login
            </button>
          </div>
        </form>

      </div>

      {/* FORGOT PASSWORD OUTSIDE THE CARD */}
      <div className="below-card-link">
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>

      {/* SIGNUP TEXT BELOW */}
      <p className="below-card-text">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>

    </div>
  );
}
