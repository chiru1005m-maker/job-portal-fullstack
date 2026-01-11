import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import api, { setAuthToken } from './api'

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('username'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const nav = useNavigate()

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('username');
      const storedRole = localStorage.getItem('role');
      setUser(storedUser);
      setRole(storedRole);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setAuthToken(t);
    } else {
      // UPDATED: Added /admin/dashboard to protected paths
      const protectedPaths = ['/', '/my-applications', '/post', '/admin/import', '/admin/dashboard'];
      if (protectedPaths.includes(window.location.pathname)) {
        nav('/login');
      }
    }
  }, [nav]);

  const logout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('username'); 
    localStorage.removeItem('role'); 
    setAuthToken(null); 
    setUser(null); 
    setRole(null); 
    nav('/login');
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={styles.header}>
        <div style={styles.navContainer}>
          <h2 style={styles.logo}>
            <Link to='/' style={{ textDecoration: 'none', color: '#007bff' }}>Job Portal</Link>
          </h2>
          
          <nav style={styles.navLinks}>
            <Link to='/' style={styles.link}>Home</Link>
            
            {user ? (
              <>
                {/* NEW: Admin specific links */}
                {role === 'Admin' && (
                  <Link to='/admin/dashboard' style={styles.link}>Admin Panel</Link>
                )}

                {role === 'Employer' && (
                  <>
                    <Link to='/post' style={styles.link}>Post Job</Link>
                    <Link to='/admin/import' style={styles.link}>Import CSV</Link>
                  </>
                )}
                
                {role === 'JobSeeker' && (
                  <Link to='/my-applications' style={styles.link}>My Applications</Link>
                )}
                
                <div style={styles.userSection}>
                  <span style={styles.userName}>
                    👤 {typeof user === 'object' ? JSON.stringify(user) : String(user)} 
                    <small style={{fontWeight: 400}}> ({String(role)})</small>
                  </span>
                  <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to='/login' style={styles.link}>Login</Link>
                <Link to='/register' style={styles.registerBtn}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '0 20px', height: '70px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  navContainer: { maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { textDecoration: 'none', color: '#495057', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px', paddingLeft: '20px', borderLeft: '1px solid #eee' },
  userName: { fontSize: '14px', color: '#333', fontWeight: '600' },
  logoutBtn: { padding: '6px 14px', backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' },
  registerBtn: { textDecoration: 'none', backgroundColor: '#007bff', color: 'white', padding: '8px 18px', borderRadius: '4px', fontWeight: '600', fontSize: '15px' },
  mainContent: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }
}