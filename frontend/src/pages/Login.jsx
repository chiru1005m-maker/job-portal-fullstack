import React, { useState } from 'react';
import api, { setAuthToken } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const r = await api.post('/api/auth/login', { username, password });
      const { token, username: uname, role } = r.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', uname);
      localStorage.setItem('role', role);
      
      setAuthToken(token);
      window.dispatchEvent(new Event('storage'));
      nav('/');
    } catch (err) {
      // FIX: Extract message as string to prevent React Error #31
      const msg = err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>🔑</div>
        <h2 style={styles.title}>Welcome to JobConnect</h2>
        <p style={styles.subtitle}>Sign in to explore Job Opportunities </p>

        {/* Safety: error is forced to string */}
        {error && <div style={styles.errorBox}>{String(error)}</div>}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={styles.input}
              placeholder="Your username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          New to the portal? <Link to="/register" style={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

// ... styles remain exactly as you have them ...
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', backgroundColor: '#f8f9fa' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px', textAlign: 'center', border: '1px solid #eee' },
  iconContainer: { fontSize: '40px', marginBottom: '10px' },
  title: { margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '26px', fontWeight: '700' },
  subtitle: { margin: '0 0 30px 0', color: '#6c757d', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#495057' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '16px', boxSizing: 'border-box', outline: 'none' },
  button: { padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' },
  buttonDisabled: { padding: '14px', backgroundColor: '#a0c4ff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'not-allowed', marginTop: '10px' },
  errorBox: { backgroundColor: '#fff5f5', color: '#e03131', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffc9c9', textAlign: 'left' },
  footerText: { marginTop: '30px', fontSize: '14px', color: '#495057' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '700' }
};