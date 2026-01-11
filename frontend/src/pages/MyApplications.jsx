import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = () => {
    setLoading(true);
    // Fetches applications for the logged-in user
    api.get('/api/applications/me')
      .then(r => {
        setApps(Array.isArray(r.data) ? r.data : []);
        setLoading(false);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.response?.data || 'Failed to load applications';
        setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const withdraw = async (appId) => {
    // Alert triggers correctly as seen in your screenshot
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    
    try {
      // Logic: This matches the @DeleteMapping("/{id}") in your ApplicationController.java
      // It uses the specific Application ID from the database
      await api.delete(`/api/applications/${appId}`);
      alert("Application withdrawn successfully.");
      loadDashboard(); 
    } catch (err) {
      console.error("Full Error Object:", err);
      // Detailed error handling to resolve the 'Withdrawal failed' popup
      const serverError = err.response?.data?.message || err.response?.data;
      const msg = serverError || 'Withdrawal failed';
      alert("Withdrawal Error: " + (typeof msg === 'object' ? JSON.stringify(msg) : String(msg)));
    }
  };

  if (loading) return <div style={styles.status}>Updating your dashboard...</div>;
  if (error) return <div style={styles.error}>{String(error)}</div>;

  return (
    <div style={styles.container}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontSize: '14px' }}>← Back to Job Board</Link>
      
      <h2 style={styles.title}>JobSeeker Dashboard 📁</h2>
      <p style={styles.subtitle}>View your active applications and track your hiring status.</p>

      {apps.length === 0 ? (
        <div style={styles.empty}>
          <p>You have no active applications.</p>
          <Link to="/" style={styles.browseBtn}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {apps.map(app => (
            <div key={app.id} style={{
              ...styles.card,
              // Green border appears when status is 'Hired'
              borderLeft: app.status === 'Hired' ? '6px solid #28a745' : '1px solid #eee'
            }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.jobTitle}>{app.job?.title || 'Job Opening'}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                        ...styles.statusBadge, 
                        backgroundColor: app.status === 'Hired' ? '#d4edda' : '#e7f3ff',
                        color: app.status === 'Hired' ? '#155724' : '#007bff',
                        border: app.status === 'Hired' ? '1px solid #c3e6cb' : '1px solid #b8daff'
                    }}>
                        {app.status || 'Applied'}
                    </span>
                    {/* The button that triggers the withdrawal logic */}
                    <button onClick={() => withdraw(app.id)} style={styles.withdrawBtn}>Withdraw</button>
                </div>
              </div>
              
              <div style={styles.details}>
                {app.status === 'Hired' && (
                  <div style={styles.hiredBanner}>
                    🎉 <strong>Congratulations!</strong> You have been hired for this position!
                  </div>
                )}

                <p><strong>Employer:</strong> {app.job?.owner?.username || 'Verified Employer'}</p>
                
                {app.cvLink && (
                  <div style={styles.cvRow}>
                    <strong>Shared CV:</strong> 
                    <a 
                        href={`http://localhost:8080/uploads/${app.cvLink}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.link}
                    >
                        View Document ↗
                    </a>
                  </div>
                )}
                
                <p style={{marginTop: '10px', fontStyle: 'italic', color: '#666'}}>
                    "{app.coverLetter ? (app.coverLetter.substring(0, 100) + '...') : 'No cover letter provided.'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '20px' },
  title: { fontSize: '28px', color: '#1a1a1a', marginBottom: '5px', marginTop: '15px' },
  subtitle: { color: '#666', marginBottom: '30px' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  jobTitle: { margin: 0, color: '#333', fontSize: '20px', fontWeight: 'bold' },
  statusBadge: { padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
  withdrawBtn: { padding: '5px 10px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  details: { fontSize: '14px', color: '#444' },
  hiredBanner: { backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px dashed #28a745' },
  cvRow: { marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' },
  link: { color: '#007bff', fontWeight: 'bold', textDecoration: 'none' },
  status: { textAlign: 'center', padding: '100px', fontSize: '18px', color: '#666' },
  error: { color: '#721c24', backgroundColor: '#f8d7da', padding: '20px', borderRadius: '8px', margin: '20px' },
  empty: { textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9', borderRadius: '15px', color: '#888' },
  browseBtn: { display: 'inline-block', marginTop: '20px', padding: '10px 25px', backgroundColor: '#007bff', color: '#fff', borderRadius: '8px', textDecoration: 'none' }
};