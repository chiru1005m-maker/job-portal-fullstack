import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function EmployerDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      // Assuming your backend has an endpoint for jobs owned by the current user
      const res = await api.get('/api/jobs/my-listings');
      setMyJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const toggleJobStatus = async (jobId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'Close' : 'Re-open'} this job?`)) return;
    try {
      await api.patch(`/api/jobs/${jobId}/toggle-active`);
      loadDashboard();
    } catch (err) {
      alert("Status update failed");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Employer Tools...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Employer Recruitment Center</h2>
        <Link to="/post" style={postBtn}>+ Post New Job</Link>
      </div>

      {myJobs.length === 0 ? (
        <div style={emptyState}>You haven't posted any jobs yet.</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Applicants</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.map(job => (
              <tr key={job.id} style={trStyle}>
                <td style={tdStyle}>
                  <Link to={`/jobs/${job.id}`} style={{ fontWeight: 'bold', color: '#007bff', textDecoration: 'none' }}>
                    {String(job.title)}
                  </Link>
                  <br /><small style={{ color: '#888' }}>{job.location}</small>
                </td>
                <td style={tdStyle}>{job.applicationCount || 0} candidates</td>
                <td style={tdStyle}>
                  <span style={job.active ? activeBadge : closedBadge}>
                    {job.active ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => toggleJobStatus(job.id, job.active)} style={job.active ? closeBtn : openBtn}>
                    {job.active ? 'Close Job' : 'Re-activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Styling
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const thStyle = { padding: '15px', color: '#666', fontSize: '14px' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f4f4f4' };
const trStyle = { transition: 'background 0.2s' };
const postBtn = { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' };
const activeBadge = { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
const closedBadge = { backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
const closeBtn = { padding: '5px 10px', backgroundColor: 'transparent', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '4px', cursor: 'pointer' };
const openBtn = { ...closeBtn, border: '1px solid #007bff', color: '#007bff' };
const emptyState = { textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#999' };