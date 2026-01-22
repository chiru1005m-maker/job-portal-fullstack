import React, { useState } from 'react';
import api, { setAuthToken } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const r = await api.post('/api/auth/login', { username, password });
      
      if (!r.data || !r.data.token) {
        throw new Error("EMPTY_RESPONSE");
      }

      const { token, username: uname, role } = r.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', uname);
      localStorage.setItem('role', role);
      
      setAuthToken(token);
      window.dispatchEvent(new Event('storage'));
      nav('/'); 
      
    } catch (err) {
      localStorage.clear();
      setAuthToken(null);

      // TARGETED ERROR MESSAGING BASED ON STATUS CODES
      if (err.response?.status === 401) {
        // User found, but password failed
        setError("Invalid password. Please try again.");
      } else if (err.response?.status === 404) {
        // Username not found in the database
        setError("User doesn't exist. Please register first.");
      } else {
        // Other errors (Network, 500, etc)
        setError("Login failed. Check your connection or try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>JobConnect</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: '8px' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={styles.passwordInput}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton}
              >
                {/* Professional Toggle: Open/Closed Locks or Eyes */}
                {showPassword ? "🔓" : "🔒"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-12px' }}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register now</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', backgroundColor: '#f4f7f6' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', border: '1px solid #e1e4e8' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '0', color: '#111827', fontSize: '24px', fontWeight: '700' },
  subtitle: { margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  passwordInput: { width: '100%', padding: '10px 45px 10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  eyeButton: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2, fontSize: '18px' },
  button: { padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  buttonDisabled: { padding: '12px', backgroundColor: '#93c5fd', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'not-allowed', marginTop: '10px' },
  errorBox: { backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center' },
  footerText: { marginTop: '25px', fontSize: '14px', color: '#6b7280', textAlign: 'center' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
  forgotLink: { color: '#6b7280', textDecoration: 'none', fontSize: '12px', fontWeight: '500' }
};