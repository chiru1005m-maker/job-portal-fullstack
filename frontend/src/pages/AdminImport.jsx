import React, { useState } from 'react'
import api from '../api'

export default function AdminImport(){
  const [users, setUsers] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [apps, setApps] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const submit = async (e)=>{
    e.preventDefault(); 
    setMessage(null); 
    setError(null);

    const fd = new FormData();
    if (users) fd.append('users', users);
    if (jobs) fd.append('jobs', jobs);
    if (apps) fd.append('applications', apps);

    // Don't submit if no files are selected
    if (!users && !jobs && !apps) {
      setError('Please select at least one CSV file to upload');
      return;
    }

    setLoading(true)
    try {
      const r = await api.post('/api/admin/import', fd, { 
        headers: {'Content-Type':'multipart/form-data'} 
      })
      // Ensure message is a string
      const statusMsg = r.data?.status || r.data?.message || 'Imported successfully';
      setMessage(typeof statusMsg === 'object' ? JSON.stringify(statusMsg) : String(statusMsg));
    } catch (err){
      // FIX: Extract error as string to prevent Error #31 crash
      const errMsg = err.response?.data?.message || err.response?.data || 'Import failed';
      setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : String(errMsg));
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={submit} style={{ maxWidth: 600, backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Import CSV Data</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Upload system data via CSV files.</p>

        {/* Use String() as extra safety */}
        {message && <div style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: 15 }}>{String(message)}</div>}
        {error && <div style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: 15 }}>{String(error)}</div>}
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Users CSV</label>
          <input type='file' accept='.csv' onChange={e => setUsers(e.target.files[0])} style={styles.fileInput} />
          {users && <div style={styles.fileName}>Selected: {users.name}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Jobs CSV</label>
          <input type='file' accept='.csv' onChange={e => setJobs(e.target.files[0])} style={styles.fileInput} />
          {jobs && <div style={styles.fileName}>Selected: {jobs.name}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Applications CSV</label>
          <input type='file' accept='.csv' onChange={e => setApps(e.target.files[0])} style={styles.fileInput} />
          {apps && <div style={styles.fileName}>Selected: {apps.name}</div>}
        </div>

        <button 
          disabled={loading} 
          style={{ 
            ...styles.button, 
            backgroundColor: loading ? '#ccc' : '#007bff',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing Upload...' : 'Upload Data'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' },
  fileInput: { display: 'block', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' },
  fileName: { fontSize: '12px', color: '#28a745', marginTop: '5px' },
  button: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }
};
