// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import axios from 'axios';
import App from './App';
import './mapbox-worker';

const frontendToken = localStorage.getItem('admin_token') || localStorage.getItem('ts_token');
if (frontendToken) axios.defaults.headers.common['Authorization'] = `Bearer ${frontendToken}`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
