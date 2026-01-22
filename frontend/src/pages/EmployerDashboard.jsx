import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployerDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/jobs/my-listings');
      setMyJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // --- NEW DELETE FUNCTION ---
  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job listing? This will also remove all associated applications.")) {
      try {
        await api.delete(`/api/jobs/${jobId}`);
        // Remove the job from the UI state so it disappears instantly
        setMyJobs(myJobs.filter(job => job.id !== jobId));
        alert("Job deleted successfully.");
        if (selectedJobId === jobId) setSelectedJobId(null);
      } catch (err) {
        alert("Failed to delete job: " + (err.response?.data || "Server error"));
      }
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const res = await api.get(`/api/applications/job/${jobId}`);
      setApplicants(Array.isArray(res.data) ? res.data : []);
      setSelectedJobId(jobId);
    } catch (err) {
      console.error("Error fetching applicants", err);
    }
  };

  const handleDecision = async (appId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this candidate?`)) return;
    try {
      await api.put(`/api/applications/${appId}/status?status=${decision}`);
      fetchApplicants(selectedJobId); 
      alert(`Candidate status updated to ${decision}`);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.2rem' }}>Loading Employer Tools...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Employer Recruitment Center</h2>
        <Link to="/post-job" style={postBtn}>+ Post New Job</Link>
      </div>

      {myJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ccc' }}>
          <p>You haven't posted any jobs yet.</p>
          <Link to="/post-job" style={{ color: '#007bff', fontWeight: 'bold' }}>Post your first job listing now</Link>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Candidates</th>
              <th style={thStyle}>Details</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.map(job => (
              <tr key={job.id} style={trStyle}>
                <td style={tdStyle}>
                  <strong>{job.title}</strong>
                  <br /><small style={{ color: '#888' }}>{job.location}</small>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => fetchApplicants(job.id)} style={viewBtn}>
                    Manage
                  </button>
                </td>
                <td style={tdStyle}>
                  <Link to={`/jobs/${job.id}`} style={detailsLink}>View Posting</Link>
                </td>
                <td style={tdStyle}>
                  {/* NEW DELETE BUTTON */}
                  <button 
                    onClick={() => handleDeleteJob(job.id)} 
                    style={deleteBtnStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedJobId && (
        <div style={reviewSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Reviewing Candidates</h3>
            <button onClick={() => setSelectedJobId(null)} style={closeBtn}>Close [X]</button>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
          
          {applicants.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No applicants yet.</p>
          ) : (
            applicants.map(app => (
              <div key={app.id} style={appCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0 }}>{app.applicant?.username}</h4>
                    <span style={app.status === 'Hired' ? hiredBadge : app.status === 'Rejected' ? rejectedBadge : pendingBadge}>
                      {app.status}
                    </span>
                  </div>
                  <div style={coverLetterContainer}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{app.coverLetter || "No cover letter."}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '120px', marginLeft: '20px' }}>
                  {app.status === 'Pending' && (
                    <>
                      <button onClick={() => handleDecision(app.id, 'Hired')} style={hireBtn}>Hire</button>
                      <button onClick={() => handleDecision(app.id, 'Rejected')} style={rejectBtn}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' };
const thStyle = { padding: '15px', color: '#666', fontSize: '14px', textAlign: 'left', backgroundColor: '#fdfdfd' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f4f4f4' };
const trStyle = { transition: 'background 0.2s' };
const postBtn = { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' };
const viewBtn = { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const deleteBtnStyle = { padding: '8px 12px', backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const reviewSection = { marginTop: '40px', padding: '25px', backgroundColor: '#fff', border: '1px solid #007bff', borderRadius: '12px' };
const appCard = { display: 'flex', borderBottom: '1px solid #eee', padding: '20px 0' };
const hireBtn = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const rejectBtn = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const closeBtn = { background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' };
const detailsLink = { fontSize: '14px', color: '#007bff', textDecoration: 'none' };
const badgeBase = { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' };
const hiredBadge = { ...badgeBase, backgroundColor: '#d4edda', color: '#155724' };
const rejectedBadge = { ...badgeBase, backgroundColor: '#f8d7da', color: '#721c24' };
const pendingBadge = { ...badgeBase, backgroundColor: '#fff3cd', color: '#856404' };
const coverLetterContainer = { marginTop: '10px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' };