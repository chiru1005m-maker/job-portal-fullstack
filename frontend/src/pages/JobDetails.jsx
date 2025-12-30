import React, { useEffect, useState } from 'react'
import api from '../api'
import { useParams } from 'react-router-dom'

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [cvLink, setCvLink] = useState(''); // State for CV URL
  const [email, setEmail] = useState(localStorage.getItem('username') || '');
  const [loading, setLoading] = useState(false)
  const [applyError, setApplyError] = useState(null)
  const [applySuccess, setApplySuccess] = useState(null)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    setJob(null);
    api.get('/api/jobs/' + id)
      .then(r => setJob(r.data))
      .catch((err) => {
        // Safety: Prevent Error #31 by ensuring error is a string
        const msg = err.response?.data?.message || err.response?.data || 'Job not found';
        setApplyError(typeof msg === 'object' ? 'Error loading job details' : String(msg));
        setJob(false); 
      });
  }, [id])

  const loadApplications = () => {
    if (!job) return;
    const uname = localStorage.getItem('username');
    const ownerName = job.owner?.username || job.owner;
    
    if (ownerName && uname && ownerName === uname) {
      api.get('/api/applications/job/' + id)
        .then(r => setApplications(r.data))
        .catch(() => {});
    }
  }

  useEffect(() => {
    if (job) loadApplications();
  }, [job, id])

  const submitApply = async (e) => {
    e.preventDefault();
    setApplyError(null); 
    setApplySuccess(null);
    
    // Validation
    if (!email || !email.includes('@')) { 
      setApplyError('Please enter a valid email'); 
      return 
    }
    if (!cvLink || !cvLink.startsWith('http')) {
      setApplyError('Please provide a valid URL for your CV (e.g., Google Drive link)');
      return;
    }
    if (!cover || cover.trim().length < 20) { 
      setApplyError('Please provide a cover letter (at least 20 characters)'); 
      return 
    }

    setLoading(true)
    try {
      await api.post('/api/applications/apply', { 
        jobId: id, 
        applicantEmail: email, 
        coverLetter: cover,
        cvLink: cvLink // New field
      })
      setApplySuccess('Application submitted successfully!')
      setApplyOpen(false)
      setCover('')
      setCvLink('')
      loadApplications()
    } catch (err) {
      // Safety guard against object rendering
      const msg = err.response?.data?.message || err.response?.data || 'Apply failed';
      setApplyError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false)
    }
  }

  if (job === null) return <div style={{ padding: '20px' }}>Loading job details...</div>
  if (job === false) return <div style={{ padding: '20px', color: 'red' }}>Error: {String(applyError)}</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{String(job.title)}</h3>
      <p style={{ lineHeight: '1.6', color: '#444' }}>{String(job.description)}</p>
      <p style={{ fontWeight: 'bold' }}>
        Owner: {job.owner?.username || String(job.owner || 'Verified Employer')}
      </p>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

      {applySuccess && <div style={{ color: 'green', marginBottom: 15, fontWeight: 'bold' }}>{applySuccess}</div>}
      {applyError && <div style={{ color: 'red', marginBottom: 15 }}>{String(applyError)}</div>}

      {!applyOpen ? (
        <button 
          onClick={() => setApplyOpen(true)}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Apply for this Position
        </button>
      ) : (
        <form onSubmit={submitApply} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Email</label>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CV / Resume Link (Google Drive / LinkedIn)</label>
            <input 
              placeholder="https://drive.google.com/..."
              value={cvLink} 
              onChange={e => setCvLink(e.target.value)} 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cover Letter</label>
            <textarea 
              value={cover} 
              onChange={e => setCover(e.target.value)} 
              style={{ width: '100%', height: '120px', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button 
            type='button' 
            onClick={() => { setApplyOpen(false); setApplyError(null); }}
            style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </form>
      )}

      {applications.length > 0 && (
        <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>Received Applications</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {applications.map(a => (
              <li key={a.id} style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '10px' }}>
                <strong style={{ color: '#007bff' }}>{a.applicant?.username || a.applicantEmail}</strong>
                {a.cvLink && (
                  <a href={a.cvLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#28a745', marginTop: '5px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                    📄 View CV / Resume
                  </a>
                )}
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>{a.coverLetter}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}