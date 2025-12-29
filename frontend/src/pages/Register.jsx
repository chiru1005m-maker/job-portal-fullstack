import React, { useState } from 'react';
import api from '../api'; // Removed setAuthToken since we aren't auto-logging in anymore
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JobSeeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password || (!username && !email)) {
      setError('Provide a username or email, and a password');
      return;
    }

    setLoading(true);

    try {
      // 1. Send registration data to the backend
      await api.post('/api/auth/register', { username, email, password, role });
      
      // 2. Alert the user and redirect to login
      alert('Registration successful! Please login.');
      nav('/login'); 
    } catch (err) {
      // Handles backend errors
      setError(err.response?.data || 'Registration failed');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={submit} style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3>Create an Account</h3>
        
        {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#fee' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block' }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value='JobSeeker'>Job Seeker</option>
            <option value='Employer'>Employer</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block' }}>Username</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block' }}>Email</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block' }}>Password</label>
          <input 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        <button 
          disabled={loading} 
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}