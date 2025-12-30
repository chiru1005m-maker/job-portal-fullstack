import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ jobs: 0, apps: 0, users: 0 });
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sRes, jRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/jobs?limit=100')
      ]);
      setStats(sRes.data);
      setAllJobs(jRes.data);
    } catch (err) {
      console.error("Admin load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const deleteJob = async (id) => {
  if (window.confirm("Are you sure you want to delete this job?")) {
    try {
      await api.delete(`/api/jobs/${id}`);
      // Refresh the job list after deletion
      setJobs(jobs.filter(job => job.id !== id));
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete the job.");
    }
  }
};
  if (loading) return <div style={{padding: '20px'}}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Global Admin Panel</h2>
      
      {/* Activity Monitor */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={statCard}>Total Jobs: {stats.jobs}</div>
        <div style={statCard}>Total Applications: {stats.apps}</div>
        <div style={statCard}>Active Users: {stats.users}</div>
      </div>

      <h3>Manage All Job Posts</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allJobs.map(job => (
            <tr key={job.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tdStyle}>{String(job.title)}</td>
              <td style={tdStyle}>{job.owner?.username || 'System'}</td>
              <td style={tdStyle}>
                <button onClick={() => deleteJob(job.id)} style={delBtn}>Delete Post</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const statCard = { padding: '20px', backgroundColor: '#007bff', color: 'white', borderRadius: '8px', flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' };
const thStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px' };
const delBtn = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };