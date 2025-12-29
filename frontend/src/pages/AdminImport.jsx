import React, { useState } from 'react'
import api from '../api'

export default function AdminImport(){
  const [users,setUsers] = useState(null)
  const [jobs,setJobs] = useState(null)
  const [apps,setApps] = useState(null)
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState(null)
  const [error,setError] = useState(null)

  const submit = async (e)=>{
    e.preventDefault(); setMessage(null); setError(null);
    const fd = new FormData();
    if (users) fd.append('users', users);
    if (jobs) fd.append('jobs', jobs);
    if (apps) fd.append('applications', apps);
    setLoading(true)
    try {
      const r = await api.post('/api/admin/import', fd, { headers: {'Content-Type':'multipart/form-data'} })
      setMessage(r.data?.status || 'Imported')
    } catch (err){
      setError(err.response?.data || 'Import failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} style={{maxWidth:600}}>
      <h3>Import CSV</h3>
      {message && <div style={{color:'green', marginBottom:8}}>{message}</div>}
      {error && <div style={{color:'red', marginBottom:8}}>{error}</div>}
      <div><label>Users {users && <span style={{marginLeft:8}}>{users.name}</span>} <input type='file' accept='.csv' onChange={e=>setUsers(e.target.files[0])} /></label></div>
      <div><label>Jobs {jobs && <span style={{marginLeft:8}}>{jobs.name}</span>} <input type='file' accept='.csv' onChange={e=>setJobs(e.target.files[0])} /></label></div>
      <div><label>Applications {apps && <span style={{marginLeft:8}}>{apps.name}</span>} <input type='file' accept='.csv' onChange={e=>setApps(e.target.files[0])} /></label></div>
      <button disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
    </form>
  )
}