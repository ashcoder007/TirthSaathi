import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        form
      );

      localStorage.setItem('ts_token', res.data.token);
      localStorage.setItem('ts_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup">
      <div className="auth-card">
        <h2>Create account</h2>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              required
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
              placeholder="Choose a password"
              required
              minLength={6}
            />
          </div>

          <div className="auth-footer">
            <div className="footer-cta">Already a User?</div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Login
              </button>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Sign Up'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
