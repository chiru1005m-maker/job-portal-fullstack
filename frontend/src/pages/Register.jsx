import React, { useState } from 'react';
import api from '../api';
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
      await api.post('/api/auth/register', { username, email, password, role });
      alert('Registration successful! Please login.');
      nav('/login'); 
    } catch (err) {
      // FIX: Extract message as string to prevent React Error #31
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Create an Account</h3>
        
        {/* Safety: error is forced to string */}
        {error && <div style={{ color: '#e03131', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #ffc9c9', fontSize: '14px' }}>{String(error)}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value='JobSeeker'>Job Seeker</option>
            <option value='Employer'>Employer</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Choose a username"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="email@example.com"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
          <input 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
          />
        </div>

        <button 
          disabled={loading} 
          style={{ padding: '12px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </form>
    </div>
  );
}