import React, { useEffect, useState } from 'react'
import api from '../api'
import { useParams } from 'react-router-dom'

export default function JobDetails(){
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('username') || '');
  const [loading, setLoading] = useState(false)
  const [applyError, setApplyError] = useState(null)
  const [applySuccess, setApplySuccess] = useState(null)

  useEffect(()=>{ setJob(null); api.get('/api/jobs/'+id).then(r=>setJob(r.data)).catch(()=>{}); },[id])
  if(job === null) return <div>Loading...</div>

  const [applications, setApplications] = useState([])

  const loadApplications = ()=>{
    const uname = localStorage.getItem('username');
    if (job.owner && uname && job.owner.username === uname){
      api.get('/api/applications/job/'+id).then(r=>setApplications(r.data)).catch(()=>{});
    }
  }

  const submitApply = async (e)=>{
    e.preventDefault();
    setApplyError(null); setApplySuccess(null);
    if (!email || !email.includes('@')) { setApplyError('Please enter a valid email'); return }
    if (!cover || cover.trim().length < 20) { setApplyError('Please provide a cover letter (at least 20 characters)'); return }
    setLoading(true)
    try {
      await api.post('/api/applications/apply',{ jobId: id, applicantEmail: email, coverLetter: cover })
      setApplySuccess('Application submitted successfully')
      setApplyOpen(false)
      setCover('')
      loadApplications()
    } catch (err){
      setApplyError(err.response?.data || 'Apply failed')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ loadApplications(); },[job,id])

  return (
    <div>
      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <p>Owner: {job.owner? job.owner.username : '—'}</p>

      {applySuccess && <div style={{color:'green', marginBottom:8}}>{applySuccess}</div>}
      {applyError && <div style={{color:'red', marginBottom:8}}>{applyError}</div>}

      {!applyOpen ? (
        <button onClick={()=>setApplyOpen(true)}>Apply</button>
      ) : (
        <form onSubmit={submitApply} style={{maxWidth:600}}>
          <div><label>Your email <input value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
          <div><label>Cover letter <textarea value={cover} onChange={e=>setCover(e.target.value)} /></label></div>
          <button disabled={loading}>{loading ? 'Submitting...' : 'Submit application'}</button>
          <button type='button' onClick={()=>{ setApplyOpen(false); setApplyError(null); }}>{loading ? 'Cancel' : 'Cancel'}</button>
        </form>
      )}

      {applications.length>0 && (
        <div style={{marginTop:20}}>
          <h4>Applications</h4>
          <ul>
            {applications.map(a=> <li key={a.id}>{a.applicant? a.applicant.username : a.applicantEmail}: {a.coverLetter}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}