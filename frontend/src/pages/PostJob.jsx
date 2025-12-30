import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('Full-time') // Default value
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/api/jobs', { 
        title, 
        description, 
        type, 
        location 
      })
      alert('Job posted successfully!')
      nav('/')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to post job'
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Post a New Opportunity</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

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
            <label style={labelStyle}>Job Type</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
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
          <label style={labelStyle}>Description</label>
          <textarea 
            required 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Describe the role, requirements, and benefits..."
            style={{ ...inputStyle, height: '150px', resize: 'vertical' }} 
          />
        </div>

        <button 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Posting...' : 'List Job Now'}
        </button>
      </form>
    </div>
  )
}

const formGroup = { marginBottom: '15px' }
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }