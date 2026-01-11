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
      if (err.response?.status === 403) {
        // This is handled by your api.js, but we keep it for safety
        console.error("Access Denied to My Listings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const fetchApplicants = async (jobId) => {
    try {
      const res = await api.get(`/api/applications/job/${jobId}`);
      setApplicants(res.data);
      setSelectedJobId(jobId);
    } catch (err) {
      console.error("Error fetching applicants", err);
    }
  };

  const handleDecision = async (appId, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this candidate?`)) return;
    try {
      await api.put(`/api/applications/${appId}/status`, { status: decision });
      fetchApplicants(selectedJobId); 
    } catch (err) {
      alert("Failed to update status.");
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
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
          <p>You haven't posted any jobs yet.</p>
          <Link to="/post" style={{ color: '#007bff' }}>Post your first job listing now</Link>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={thStyle}>Job Title</th>
              <th style={thStyle}>Applicants</th>
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
                    Manage ({job.applicationCount || 0})
                  </button>
                </td>
                <td style={tdStyle}>
                  <Link to={`/jobs/${job.id}`} style={detailsLink}>View Posting</Link>
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
            <button onClick={() => setSelectedJobId(null)} style={closeBtn}>Close</button>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
          
          {applicants.length === 0 ? <p style={{ textAlign: 'center' }}>No applicants yet.</p> : (
            applicants.map(app => (
              <div key={app.id} style={appCard}>
                <div style={{ flex: 1 }}>
                  {/* RESTRICTED VIEW: Only Personal/Contact Info shown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0 }}>
                      {app.applicant?.firstName} {app.applicant?.lastName} ({app.applicant?.username})
                    </h4>
                    <span style={app.status === 'Hired' ? hiredBadge : app.status === 'Rejected' ? rejectedBadge : pendingBadge}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p style={{ margin: '2px 0' }}><strong>Email:</strong> {app.applicant?.email}</p>
                    <p style={{ margin: '2px 0' }}><strong>Phone:</strong> {app.applicant?.phoneNumber || 'Not Provided'}</p>
                  </div>
                  
                  <div style={coverLetterContainer}>
                    <strong style={{ fontSize: '11px', color: '#666' }}>COVER LETTER:</strong>
                    <p style={{ marginTop: '5px', fontSize: '14px', color: '#333' }}>
                      {app.coverLetter || "No cover letter provided."}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    {app.cvLink || app.applicant?.resumePath ? (
                      <a 
                        href={`http://localhost:8080/uploads/${app.cvLink || app.applicant?.resumePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={cvLink}
                      >
                        📄 View Official Resume
                      </a>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>No Resume uploaded</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minWidth: '120px' }}>
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

// Styling remains identical to ensure UI consistency
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' };
const thStyle = { padding: '15px', color: '#666', fontSize: '14px', textAlign: 'left' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #f4f4f4' };
const trStyle = { transition: 'background 0.2s' };
const postBtn = { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' };
const viewBtn = { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const reviewSection = { marginTop: '40px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' };
const appCard = { display: 'flex', borderBottom: '1px solid #eee', padding: '20px 0' };
const cvLink = { color: '#007bff', fontSize: '14px', textDecoration: 'none', border: '1px solid #007bff', padding: '5px 10px', borderRadius: '4px', display: 'inline-block' };
const hireBtn = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const rejectBtn = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const closeBtn = { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' };
const detailsLink = { fontSize: '14px', color: '#666', textDecoration: 'none' };
const badgeBase = { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' };
const hiredBadge = { ...badgeBase, backgroundColor: '#d4edda', color: '#155724' };
const rejectedBadge = { ...badgeBase, backgroundColor: '#f8d7da', color: '#721c24' };
const pendingBadge = { ...badgeBase, backgroundColor: '#fff3cd', color: '#856404' };
const coverLetterContainer = { marginTop: '10px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #dee2e6' };