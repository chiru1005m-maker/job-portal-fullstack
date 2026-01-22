import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import api, { setAuthToken } from './api'

// Restore auth header on reload
const existingToken = localStorage.getItem('token'); 
if (existingToken) setAuthToken(existingToken);

// Layout and Global components
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'

// Page Components
import Home from './pages/Home'
import JobDetails from './pages/JobDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import PostJob from './pages/PostJob'
import MyApplications from './pages/MyApplications'
import AdminImport from './pages/AdminImport'
import AdminDashboard from './pages/AdminDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import SeekerDashboard from './pages/SeekerDashboard'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}>
          {/* Public Routes */}
          <Route index element={<Home/>} />
          <Route path='jobs/:id' element={<JobDetails/>} />
          <Route path='login' element={<Login/>} />
          <Route path='register' element={<Register/>} />
          
          {/* Employer & Admin Access */}
          {/* FIXED: Path changed from 'post' to 'post-job' to match App.js and Dashboard links */}
          <Route path='post-job' element={
            <ProtectedRoute roles={["Employer", "Admin"]}>
              <PostJob/>
            </ProtectedRoute>
          } />
          
          <Route path='admin/import' element={
            <ProtectedRoute roles={["Employer", "Admin"]}>
              <AdminImport/>
            </ProtectedRoute>
          } />

          <Route path='employer-dashboard' element={
            <ProtectedRoute roles={["Employer", "Admin"]}>
              <EmployerDashboard/>
            </ProtectedRoute>
          } />

          {/* Admin Only Access */}
          <Route path='admin/dashboard' element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDashboard/>
            </ProtectedRoute>
          } />

          {/* JobSeeker Access */}
          <Route path='my-applications' element={
            <ProtectedRoute roles={["JobSeeker"]}>
              <MyApplications/>
            </ProtectedRoute>
          } />

          {/* Seeker Dashboard Route */}
          <Route path='seeker-dashboard' element={
            <ProtectedRoute roles={["JobSeeker"]}>
              <SeekerDashboard/>
            </ProtectedRoute>
          } />
          
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)