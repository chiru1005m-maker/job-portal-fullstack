import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const nav = useNavigate()
  
  const role = localStorage.getItem('role')

  // Security Check
  if (role !== 'Employer') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only logged-in employers can post jobs.</p>
        <button onClick={() => nav('/login')} style={styles.btn}>Go to Login</button>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null); 
    setSuccess(null);

    // Validation
    if (!title || title.trim().length < 3) { 
      setError('Title must be at least 3 characters'); 
      return 
    }
    if (!desc || desc.trim().length < 10) { 
      setError('Description must be at least 10 characters'); 
      return 
    }

    setLoading(true)
    try {
      const owner = localStorage.getItem('username');
      const r = await api.post('/api/jobs', { 
        owner: owner,
        title: title.trim(), 
        description: desc.trim() 
      })
      setSuccess('Job posted successfully!')
      
      // Redirect to home after 1.5 seconds so they can see the success message
      setTimeout(() => nav('/'), 1500);
    } catch (err) {
      setError(err.response?.data || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post a New Opening</h2>
        <p style={styles.subtitle}>Fill in the details to find your next hire</p>

        <form onSubmit={submit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Job Title</label>
            <input 
              placeholder="e.g. Senior Java Developer"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea 
              placeholder="Describe the role and MNC requirements..."
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              style={{ ...styles.input, height: '150px', resize: 'vertical' }}
            />
          </div>

          <button disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          
          <button type="button" onClick={() => nav('/')} style={styles.cancelBtn}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px', backgroundColor: '#f4f7f6', minHeight: '90vh' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  title: { margin: '0 0 10px 0', color: '#333' },
  subtitle: { margin: '0 0 25px 0', color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' },
  btn: { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  btnDisabled: { padding: '12px', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '6px', cursor: 'not-allowed' },
  cancelBtn: { padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer' },
  errorBox: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', fontSize: '14px' },
  successBox: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '4px', fontSize: '14px' }
};