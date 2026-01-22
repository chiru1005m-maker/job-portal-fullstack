import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import api, { setAuthToken } from './api'

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('username'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const nav = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const syncAuth = () => {
      const storedUser = localStorage.getItem('username');
      const storedRole = localStorage.getItem('role');
      const storedToken = localStorage.getItem('token');

      setUser(storedUser);
      setRole(storedRole);
      
      if (storedToken) {
        setAuthToken(storedToken);
      }
    };

    syncAuth();

    window.addEventListener('storage', syncAuth);
    window.addEventListener('authChange', syncAuth); 

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authChange', syncAuth);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    setAuthToken(null); 
    setUser(null); 
    setRole(null); 
    window.dispatchEvent(new Event('authChange'));
    nav('/login');
  };

  const getLinkStyle = (path) => (
    location.pathname === path ? styles.activeLink : styles.link
  );

  return (
    <div style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={styles.header}>
        <div style={styles.navContainer}>
          <h2 style={styles.logo}>
            <Link to='/' style={{ textDecoration: 'none', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
              <span style={{color: '#007bff', marginRight: '8px'}}>🚀</span> JobConnect
            </Link>
          </h2>
          
          <nav style={styles.navLinks}>
            <Link to='/' style={getLinkStyle('/')}>Browse Jobs</Link>
            
            {user ? (
              <>
                <Link 
                  to={role === 'Employer' ? '/employer-dashboard' : '/seeker-dashboard'} 
                  style={location.pathname.includes('dashboard') ? styles.activeLink : styles.link}
                >
                  Dashboard
                </Link>

                {role === 'Employer' && (
                  <>
                    {/* FIXED: Changed from /post to /post-job to match Dashboard links */}
                    <Link to='/post-job' style={getLinkStyle('/post-job')}>Post Job</Link>
                    <Link to='/admin/import' style={getLinkStyle('/admin/import')}>Import CSV</Link>
                  </>
                )}
                
                {role === 'JobSeeker' && (
                  <Link to='/my-applications' style={getLinkStyle('/my-applications')}>My Applications</Link>
                )}
                
                <div style={styles.userSection}>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>{user}</span>
                    <span style={styles.roleBadge}>{role}</span>
                  </div>
                  <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                </div>
              </>
            ) : (
              <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                <Link to='/login' style={getLinkStyle('/login')}>Sign In</Link>
                <Link to='/register' style={styles.registerBtn}>Get Started</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* This is where PostJob.jsx will render */}
        <Outlet />
      </main>
      
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>© 2026 JobConnect Portal • All Rights Reserved</p>
          <div style={styles.footerStats}>
            <span>Role: <strong>{role || 'Guest'}</strong></span>
            <span style={{marginLeft: '15px'}}>System Status: <span style={{color: '#28a745'}}>● Online</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  header: { backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '0 20px', height: '75px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 },
  navContainer: { maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { textDecoration: 'none', color: '#546e7a', fontWeight: '500', fontSize: '14px', transition: 'color 0.2s' },
  activeLink: { textDecoration: 'none', color: '#007bff', fontWeight: '700', fontSize: '14px', borderBottom: '2px solid #007bff', paddingBottom: '4px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #eee', paddingLeft: '20px', marginLeft: '10px' },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '13px', fontWeight: '700', color: '#2c3e50' },
  roleBadge: { fontSize: '9px', fontWeight: '900', backgroundColor: '#e3f2fd', color: '#007bff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', marginTop: '2px' },
  logoutBtn: { padding: '6px 14px', color: '#e53935', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', background: '#fff', fontSize: '12px', fontWeight: '600' },
  registerBtn: { backgroundColor: '#007bff', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  mainContent: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 180px)' },
  footer: { borderTop: '1px solid #e0e0e0', marginTop: '50px', backgroundColor: '#fff', padding: '30px 0' },
  footerContent: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', color: '#90a4ae', fontSize: '12px', padding: '0 20px' }
}