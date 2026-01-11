import React, { useEffect, useState } from 'react'
import api from '../api'
import { useParams } from 'react-router-dom'

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [cvLink, setCvLink] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('username') || '');
  const [loading, setLoading] = useState(false)
  const [applyError, setApplyError] = useState(null)
  const [applySuccess, setApplySuccess] = useState(null)
  const [applications, setApplications] = useState([])

  const loadJob = () => {
    api.get('/api/jobs/' + id)
      .then(r => setJob(r.data))
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data || 'Job not found';
        setApplyError(typeof msg === 'object' ? 'Error loading job' : String(msg));
        setJob(false); 
      });
  };

  const loadApplications = () => {
    api.get('/api/applications/job/' + id)
      .then(r => setApplications(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
    if (job) {
      const uname = localStorage.getItem('username');
      const ownerName = job.owner?.username || job.owner;
      if (ownerName === uname) loadApplications();
    }
  }, [job]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/api/applications/${appId}/status`, { status: newStatus });
      alert(`Status updated to ${newStatus}`);
      loadApplications();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const submitApply = async (e) => {
    e.preventDefault();
    setApplyError(null); 
    setApplySuccess(null);
    if (!cvLink.startsWith('http')) { setApplyError('Valid CV URL required'); return; }
    
    setLoading(true)
    try {
      await api.post('/api/applications/apply', { jobId: id, applicantEmail: email, coverLetter: cover, cvLink });
      setApplySuccess('Application submitted!');
      setApplyOpen(false);
      setCover(''); setCvLink('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Apply failed';
      setApplyError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally { setLoading(false); }
  }

  if (job === null) return <div style={{ padding: '20px' }}>Loading...</div>
  if (job === false) return <div style={{ padding: '20px', color: 'red' }}>{String(applyError)}</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3>{String(job.title)}</h3>
      <p>{String(job.description)}</p>
      <p><strong>Owner:</strong> {job.owner?.username || String(job.owner)}</p>

      {!applyOpen ? (
        <button onClick={() => setApplyOpen(true)} style={btnStyle}>Apply Now</button>
      ) : (
        <form onSubmit={submitApply} style={formStyle}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input placeholder="CV Link (Drive/LinkedIn)" value={cvLink} onChange={e => setCvLink(e.target.value)} style={inputStyle} />
          <textarea placeholder="Cover Letter" value={cover} onChange={e => setCover(e.target.value)} style={{...inputStyle, height: '100px'}} />
          <button disabled={loading} style={saveBtn}>{loading ? 'Sending...' : 'Submit'}</button>
          <button type="button" onClick={() => setApplyOpen(false)} style={cancelBtn}>Cancel</button>
        </form>
      )}

      {applications.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h4>Received Applications</h4>
          {applications.map(a => (
            <div key={a.id} style={cardStyle}>
              <strong>{a.applicant?.username || a.applicantEmail}</strong>
              <span style={badgeStyle}>{a.status}</span>
              {a.cvLink && <a href={a.cvLink} target="_blank" rel="noreferrer" style={cvLinkStyle}>View CV ↗</a>}
              <p style={{fontSize: '14px'}}>{a.coverLetter}</p>
              
              <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                <button onClick={() => updateStatus(a.id, 'Interviewing')} style={statusBtn}>Interview</button>
                <button onClick={() => updateStatus(a.id, 'Hired')} style={hiredBtn}>Hire</button>
                <button onClick={() => updateStatus(a.id, 'Rejected')} style={rejectBtn}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const formStyle = { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '20px' };
const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', display: 'block' };
const saveBtn = { ...btnStyle, backgroundColor: '#28a745' };
const cancelBtn = { ...btnStyle, backgroundColor: '#6c757d', marginLeft: '10px' };
const cardStyle = { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#fff' };
const badgeStyle = { marginLeft: '10px', padding: '2px 8px', backgroundColor: '#e7f3ff', borderRadius: '10px', fontSize: '12px' };
const cvLinkStyle = { display: 'block', color: '#28a745', fontWeight: 'bold', textDecoration: 'none', margin: '5px 0' };
const statusBtn = { padding: '4px 8px', fontSize: '12px', cursor: 'pointer' };
const hiredBtn = { ...statusBtn, backgroundColor: '#d4edda', color: '#155724' };
const rejectBtn = { ...statusBtn, backgroundColor: '#f8d7da', color: '#721c24' };