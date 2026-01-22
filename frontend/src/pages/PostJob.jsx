import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('Full-time') 
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Ensure this endpoint matches your @PostMapping in JobController
      await api.post('/api/jobs', { 
        title, 
        description, 
        type, 
        location 
      })
      alert('Job posted successfully! 🚀')
      
      // Redirect to Employer Dashboard to see the new listing
      nav('/employer-dashboard') 
    } catch (err) {
      console.error("Submission error:", err)
      const msg = err.response?.data?.message || err.response?.data || 'Failed to post job'
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ borderBottom: '2px solid #f0f0f0', marginBottom: '25px', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Post a New Opportunity</h2>
        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Fill in the details to find your next great hire.</p>
      </div>
      
      {error && (
        <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={formGroup}>
          <label style={labelStyle}>Job Title</label>
          <input 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Senior Software Engineer"
            style={inputStyle} 
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...formGroup, flex: 1 }}>
            <label style={labelStyle}>Employment Type</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div style={{ ...formGroup, flex: 1 }}>
            <label style={labelStyle}>Location</label>
            <input 
              required 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="e.g. Bangalore, IN"
              style={inputStyle} 
            />
          </div>
        </div>

        <div style={formGroup}>
          <label style={labelStyle}>Detailed Description</label>
          <textarea 
            required 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Outline responsibilities, required skills, and what your company offers..."
            style={{ ...inputStyle, height: '180px', resize: 'vertical', lineHeight: '1.5' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            type="button"
            onClick={() => nav(-1)}
            style={{ flex: 1, padding: '12px', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Cancel
          </button>
          <button 
            disabled={loading} 
            style={{ 
              flex: 2,
              padding: '12px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Processing...' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}

const formGroup = { marginBottom: '20px' }
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#34495e' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #dcdde1', boxSizing: 'border-box', fontSize: '15px' }