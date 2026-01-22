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

    // Basic validation to prevent unnecessary API calls
    if (!password || !username || !email) {
      setError('Please fill in all fields (Username, Email, and Password)');
      return;
    }

    setLoading(true);

    try {
      // Sends data to your local PostgreSQL via the backend
      await api.post('/api/auth/register', { username, email, password, role });
      alert(`Registration successful as ${role}! You can now log in.`);
      nav('/login'); 
    } catch (err) {
      // Improved error parsing to catch database constraints (e.g., duplicate username)
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed. The database might be offline.';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.formCard}>
        <h3 style={styles.title}>Create an Account</h3>
        <p style={styles.subtitle}>Join JobConnect to start your journey</p>
        
        {error && <div style={styles.errorBox}>{String(error)}</div>}
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>I am a...</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            style={styles.input}
          >
            <option value='JobSeeker'>Job Seeker (Looking for work)</option>
            <option value='Employer'>Employer (Hiring people)</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Choose a unique username"
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="email@example.com"
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            style={styles.input} 
            required
          />
        </div>

        <button 
          disabled={loading} 
          style={loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: '40px 20px', display: 'flex', justifyContent: 'center', backgroundColor: '#f8f9fa', minHeight: '85vh' },
  formCard: { width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  title: { margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#495057' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '15px' },
  button: { padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  buttonDisabled: { padding: '14px', backgroundColor: '#a0c4ff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  errorBox: { color: '#e03131', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #ffc9c9', fontSize: '13px' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#495057', marginTop: '10px' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }
};