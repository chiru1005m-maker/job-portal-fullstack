import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import api, { setAuthToken } from './api'
// restore auth header on reload
const existingToken = localStorage.getItem('token'); if (existingToken) setAuthToken(existingToken);
import App from './App'
import Home from './pages/Home'
import JobDetails from './pages/JobDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import PostJob from './pages/PostJob'
import MyApplications from './pages/MyApplications'
import AdminImport from './pages/AdminImport'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}>
          <Route index element={<Home/>} />
          <Route path='jobs/:id' element={<JobDetails/>} />
          <Route path='login' element={<Login/>} />
          <Route path='register' element={<Register/>} />
          <Route path='post' element={<ProtectedRoute roles={["Employer","Admin"]}><PostJob/></ProtectedRoute>} />
          <Route path='applications' element={<ProtectedRoute roles={["JobSeeker"]}><MyApplications/></ProtectedRoute>} />
          <Route path='admin/import' element={<ProtectedRoute roles={["Employer","Admin"]}><AdminImport/></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)