import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [cvFile, setCvFile] = useState(null);
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const currentUsername = localStorage.getItem('username');

  const [loading, setLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applications, setApplications] = useState([]);

  const isEmployer = userRole === 'Employer' || userRole === 'Admin';

  const loadJob = () => {
    api.get('/api/jobs/' + id)
      .then(r => setJob(r.data))
      .catch(() => setJob(false));
  };

  const loadApplications = () => {
    api.get('/api/applications/job/' + id)
      .then(r => {
        console.log("Applications received:", r.data); // Debug to see if cvPath exists
        setApplications(Array.isArray(r.data) ? r.data : []);
      })
      .catch(err => console.error("Error loading apps", err));
  }

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      // Updated to match the /api/applications/{id}/status?status=... endpoint
      await api.put(`/api/applications/${appId}/status?status=${newStatus}`);
      loadApplications();
    } catch (err) {
      alert("Error updating status.");
    }
  }

  useEffect(() => { loadJob(); }, [id]);

  useEffect(() => {
    if (job && isEmployer && currentUsername) {
      const ownerName = job.owner?.username || job.owner;
      if (ownerName && ownerName.toString().toLowerCase() === currentUsername.toLowerCase()) {
        loadApplications();
      }
    }
  }, [job, isEmployer, currentUsername]);

  const handleApplyClick = () => {
    if (!token) {
      alert("Please login as a Job Seeker to apply.");
      navigate('/login');
      return;
    }
    setApplyOpen(true);
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!cvFile) return setApplyError("Please upload your CV.");
    
    setLoading(true);
    setApplyError(null);

    const formData = new FormData();
    formData.append('jobId', id); 
    formData.append('coverLetter', cover);
    formData.append('cvFile', cvFile); 

    try {
      await api.post('/api/applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setApplySuccess('Success! Application submitted 🚀');
      setApplyOpen(false);
      setCover('');
      setCvFile(null);
      // If seeker is also an admin/employer, refresh list
      if (isEmployer) loadApplications();
    } catch (err) {
      if (err.response?.status === 409) {
        setApplyError('You have already applied for this job.');
      } else {
        setApplyError('Failed to submit application. Please check your connection.');
      }
    } finally { 
      setLoading(false); 
    }
  }

  if (job === null) return <div style={centerMsg}>Loading...</div>
  if (job === false) return <div style={centerMsg}>Job not found.</div>

  const companyName = job.owner?.username || job.owner || job.companyName || "Verified Employer";

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ marginBottom: '5px' }}>{job.title}</h2>
          <p style={{ color: '#007bff', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
            🏢 {companyName}
          </p>
          <p style={{ color: '#666' }}>📍 {job.location} | <span style={typeBadge}>{job.type}</span></p>
        </div>
        {!isEmployer && !applySuccess && (
          <button onClick={handleApplyClick} style={btnStyle}>
            {applyOpen ? 'Close Form' : 'Apply Now'}
          </button>
        )}
      </div>
      
      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
      
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#555', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Job Description</h4>
        <p style={descriptionText}>{job.description}</p>
      </div>

      {(!userRole || userRole === 'JobSeeker') && (
        <div style={{ marginTop: '30px' }}>
          {applySuccess && <div style={successBox}>{applySuccess}</div>}
          {applyError && (
            <div style={{...successBox, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca'}}>
              ⚠️ {applyError}
            </div>
          )}
          
          {applyOpen && (
            <form onSubmit={submitApply} style={formStyle}>
              <h4 style={{marginTop: 0}}>Submit Application to {companyName}</h4>
              <label style={labelStyle}>Resume/CV (PDF preferred)</label>
              <input type="file" required onChange={e => setCvFile(e.target.files[0])} style={inputStyle} />
              
              <label style={labelStyle}>Cover Letter</label>
              <textarea 
                placeholder="Explain why you are a good fit..." 
                value={cover} 
                onChange={e => setCover(e.target.value)} 
                style={{...inputStyle, height: '120px', resize: 'vertical'}} 
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button disabled={loading} style={saveBtn}>{loading ? 'Sending...' : 'Submit Application'}</button>
                <button type="button" onClick={() => setApplyOpen(false)} style={cancelBtn}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Employer View - Fixed Visibility and CV Mapping */}
      {isEmployer && (job.owner?.username || job.owner) === currentUsername && (
        <div style={{marginTop: '40px', borderTop: '2px solid #007bff', paddingTop: '20px'}}>
          <h4 style={{ color: '#111827' }}>Candidate Applications ({applications.length})</h4>
          {applications.length === 0 ? <p>No candidates have applied yet.</p> : applications.map(a => (
            <div key={a.id} style={cardStyle}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <strong>👤 {a.applicant?.username || 'Candidate'}</strong>
                <span style={{...statusBadge, color: a.status === 'Hired' ? '#28a745' : a.status === 'Rejected' ? '#dc3545' : '#b45309'}}>
                  {a.status}
                </span>
              </div>
              <p style={{fontSize: '0.85rem', margin: '5px 0', color: '#4b5563'}}>Email: {a.applicantEmail}</p>
              
              <div style={coverLetterBox}>
                <p style={{ margin: '0 0 5px 0', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Cover Letter</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                  {a.coverLetter || "No cover letter provided."}
                </p>
              </div>

              {/* CRITICAL FIX: Ensure field matches cvPath from Java Entity */}
              {a.cvPath ? (
                <a 
                  href={`http://localhost:8080/api/applications/download/${a.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={cvLinkStyle}
                >
                  📄 View Resume
                </a>
              ) : (
                <p style={{color: '#ef4444', fontSize: '0.8rem', fontWeight: '600'}}>
                  ⚠️ Resume file path missing in database
                </p>
              )}

              {a.status === 'Pending' && (
                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                  <button onClick={() => handleStatusUpdate(a.id, 'Hired')} style={hireBtn}>Hire</button>
                  <button onClick={() => handleStatusUpdate(a.id, 'Rejected')} style={rejectBtn}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Styling (remains same as your working version)
const containerStyle = { padding: '40px 20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const typeBadge = { backgroundColor: '#e7f3ff', color: '#007bff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' };
const descriptionText = { whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' };
const btnStyle = { padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const formStyle = { backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '1px solid #dee2e6' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' };
const inputStyle = { width: '100%', marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
const saveBtn = { ...btnStyle, backgroundColor: '#28a745' };
const cancelBtn = { ...btnStyle, backgroundColor: '#6c757d' };
const cardStyle = { padding: '20px', border: '1px solid #e5e7eb', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#fff' };
const coverLetterBox = { backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', margin: '12px 0', borderLeft: '4px solid #2563eb' };
const cvLinkStyle = { color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', border: '1px solid #2563eb', padding: '5px 10px', borderRadius: '4px' };
const statusBadge = { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' };
const hireBtn = { padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };
const rejectBtn = { padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };
const successBox = { padding: '15px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', border: '1px solid #6ee7b7' };
const centerMsg = { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#666' };