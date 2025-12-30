import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = () => {
    setLoading(true);
    api.get('/api/applications/my')
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
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    
    try {
      // Sending delete request to backend
      await api.delete(`/api/applications/${appId}`);
      alert("Application withdrawn successfully.");
      loadDashboard(); // Refresh list
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Withdrawal failed';
      alert("Error: " + (typeof msg === 'object' ? JSON.stringify(msg) : String(msg)));
    }
  };

  if (loading) return <div style={styles.status}>Updating your dashboard...</div>;
  if (error) return <div style={styles.error}>{String(error)}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>JobSeeker Dashboard</h2>
      <p style={styles.subtitle}>View your active applications and shared CVs.</p>

      {apps.length === 0 ? (
        <div style={styles.empty}>You have no active applications.</div>
      ) : (
        <div style={styles.list}>
          {apps.map(app => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.jobTitle}>{String(app.job?.title || 'Job Opening')}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={styles.statusBadge}>{app.status || 'Applied'}</span>
                    <button onClick={() => withdraw(app.id)} style={styles.withdrawBtn}>Withdraw</button>
                </div>
              </div>
              
              <div style={styles.details}>
                <p><strong>Employer:</strong> {app.job?.owner?.username || 'MNC Partner'}</p>
                {app.cvLink && (
                  <div style={styles.cvRow}>
                    <strong>My CV:</strong> <a href={app.cvLink} target="_blank" rel="noopener noreferrer" style={styles.link}>View Link ↗</a>
                  </div>
                )}
                <p style={{marginTop: '10px', fontStyle: 'italic'}}>"{String(app.coverLetter).substring(0, 100)}..."</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
  title: { fontSize: '28px', color: '#1a1a1a', marginBottom: '10px' },
  subtitle: { color: '#666', marginBottom: '30px' },
  card: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  jobTitle: { margin: 0, color: '#007bff', fontSize: '20px' },
  statusBadge: { backgroundColor: '#e7f3ff', color: '#007bff', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  withdrawBtn: { padding: '5px 10px', backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  details: { fontSize: '14px', color: '#444' },
  cvRow: { marginTop: '8px', padding: '8px', backgroundColor: '#f0fff4', borderRadius: '6px', border: '1px solid #c6f6d5' },
  link: { color: '#2f855a', fontWeight: 'bold', textDecoration: 'none' },
  status: { textAlign: 'center', padding: '50px' },
  error: { color: '#dc3545', padding: '15px', border: '1px solid #ffc9c9' },
  empty: { textAlign: 'center', padding: '40px', color: '#999' }
};