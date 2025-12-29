import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const [jobs, setJobs] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const nav = useNavigate()
  const role = localStorage.getItem('role')
  const currentUser = localStorage.getItem('username')

  const load = async () => {
    setError(null); setLoading(true)
    const params = { page, size }
    if (q) params.q = q
    
    try {
      const r = await api.get('/api/jobs', { params })
      const data = Array.isArray(r.data) ? r.data : (r.data.content ? r.data.content : [])
      setJobs(data)
    } catch (err) { 
      setJobs([]); 
      setError(err.response?.data || 'Failed to load jobs') 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load(); }, [q, page])

  // Function to handle Job Application
  const handleApply = async (job) => {
    try {
      await api.post('/api/applications', {
        applicant: currentUser,
        owner: job.owner,
        jobTitle: job.title,
        coverLetter: "Interested in this MNC position."
      });
      alert(`Successfully applied for ${job.title}!`);
    } catch (err) {
      alert("Error applying for job. Make sure you are logged in.");
    }
  };

  // Function to handle Job Deletion
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) return;
    try {
      await api.delete(`/api/jobs/${jobId}`);
      alert("Job deleted successfully");
      load(); // Refresh the list
    } catch (err) {
      alert("Error deleting job: " + (err.response?.data || "Unauthorized"));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Latest MNC Opportunities</h3>
      
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
        <input 
          placeholder='Search jobs (e.g. Google, Java)' 
          value={q} 
          onChange={e => { setQ(e.target.value); setPage(0); }} 
          style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button onClick={load} style={styles.searchBtn} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
        {role === 'Employer' && (
          <Link to='/post' style={styles.postLink}>+ Post New Job</Link>
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>Searching for jobs...</div>
      ) : (
        <div style={styles.grid}>
          {jobs.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No jobs found.</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} style={styles.card}>
                <div style={styles.badge}>{job.owner || 'MNC'}</div>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <p style={styles.companyName}>🏢 Verified Employer</p>
                <p style={styles.description}>
                  {job.description?.substring(0, 100) || 'No description available'}...
                </p>
                <div style={styles.footer}>
                  <button onClick={() => nav(`/job/${job.id}`)} style={styles.viewBtn}>
                    Details
                  </button>
                  
                  {/* Logic: If Employer owns the job, show Delete. Otherwise show Apply */}
                  {role === 'Employer' && currentUser === job.owner ? (
                    <button onClick={() => handleDelete(job.id)} style={styles.deleteBtn}>
                      Delete
                    </button>
                  ) : (
                    <button onClick={() => handleApply(job)} style={styles.applyBtn}>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page <= 0} style={styles.pageBtn}>Prev</button>
        <span style={{ margin: '0 15px', fontWeight: 'bold' }}>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={jobs.length < size} style={styles.pageBtn}>Next</button>
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  },
  badge: {
    backgroundColor: '#e7f3ff',
    color: '#007bff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '10px',
    width: 'fit-content'
  },
  jobTitle: { fontSize: '18px', margin: '0 0 5px 0', color: '#333', fontWeight: 'bold' },
  companyName: { fontSize: '14px', margin: '0 0 15px 0', color: '#666' },
  description: { fontSize: '14px', color: '#555', flexGrow: 1, lineHeight: '1.5' },
  footer: { marginTop: '15px', display: 'flex', gap: '10px' },
  viewBtn: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#f0f2f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  applyBtn: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  deleteBtn: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  searchBtn: {
    marginLeft: '10px',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  postLink: {
    marginLeft: 'auto',
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  pageBtn: {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    border: 'none',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 5px',
  }
}