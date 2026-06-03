// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// User pages
import Home from './pages/home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TripPlanner from './pages/TripPlanner';
import EmergencyPage from "./pages/EmergencyPage";  
import AIGuideChat from './pages/AIGuideChat';
import MapsPage from "./pages/MapsPage";
import BookStayPage from "./pages/BookStayPage";
import StayBookingPage from "./pages/StayBookingPage";
import ElderCarePage from "./pages/ElderCarePage";
// Admin pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ProtectedAdmin from './admin/ProtectedAdmin';
import ManagePlaces from './admin/ManagePlaces';
import ManageEvents from './admin/ManageEvents';
import ManageAccommodations from './admin/ManageAccommodations';

import './App.css';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || "/"}>
      <Routes>
        {/* ----------------- USER SIDE ----------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/ai-guide-chat" element={<AIGuideChat />} />
        <Route path="/emergencyPage" element={<EmergencyPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/book-stay" element={<BookStayPage />} />
        <Route path="/stay-booking" element={<StayBookingPage />} />
        <Route path="/elder-care" element={<ElderCarePage />} />
        {/* ----------------- ADMIN SIDE ----------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes - only accessible when admin token exists */}
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />

        <Route
          path="/admin/places"
          element={
            <ProtectedAdmin>
              <ManagePlaces />
            </ProtectedAdmin>
          }
        />
        <Route
           path="/admin/events"
           element={
              <ProtectedAdmin>
                <ManageEvents />
    </ProtectedAdmin>
    }
        />
        <Route 
            path="/admin/accommodations"
            element={
              <ProtectedAdmin>
                <ManageAccommodations />
              </ProtectedAdmin>
            }
  
/>


        {/* Add additional admin routes (events, accommodations, etc.) similarly: */}
        {/* <Route path="/admin/events" element={<ProtectedAdmin><ManageEvents /></ProtectedAdmin>} /> */}
        {/* <Route path="/admin/accommodations" element={<ProtectedAdmin><ManageAccommodations /></ProtectedAdmin>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
