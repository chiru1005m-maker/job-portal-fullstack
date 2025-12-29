import React, { useEffect, useState } from 'react'
import api from '../api'

export default function MyApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/applications/me')
      .then(r => {
        setApps(Array.isArray(r.data) ? r.data : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>My Applications</h3>
      <p style={styles.subtitle}>Track the status of your MNC job applications</p>

      {loading ? (
        <div style={styles.message}>Loading your history...</div>
      ) : apps.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>No applications found. Start applying to see them here!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {apps.map((a) => (
            <div key={a.id} style={styles.appCard}>
              <div style={styles.infoGroup}>
                {/* Safe check for job title */}
                <h4 style={styles.jobTitle}>
                  {a.job_title || (a.job ? a.job.title : 'Position Details Unavailable')}
                </h4>
                <p style={styles.employer}>Employer: {a.owner || 'MNC Verified'}</p>
              </div>
              
              <div style={styles.detailsGroup}>
                <span style={styles.statusBadge}>Under Review</span>
                <p style={styles.coverLetter}>
                  <strong>Cover Letter:</strong> {a.cover_letter || a.coverLetter || 'No cover letter provided.'}
                </p>
              </div>

              <div style={styles.dateGroup}>
                {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  header: { fontSize: '28px', color: '#333', marginBottom: '10px' },
  subtitle: { color: '#666', marginBottom: '30px', fontSize: '16px' },
  message: { textAlign: 'center', marginTop: '50px', color: '#888' },
  emptyCard: { padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  appCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  infoGroup: { flex: '1 1 250px' },
  jobTitle: { margin: '0 0 5px 0', color: '#007bff', fontSize: '19px' },
  employer: { margin: 0, color: '#555', fontSize: '14px' },
  detailsGroup: { flex: '2 1 300px' },
  statusBadge: {
    display: 'inline-block',
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  coverLetter: { margin: 0, fontSize: '13px', color: '#666', fontStyle: 'italic' },
  dateGroup: { color: '#aaa', fontSize: '12px', textAlign: 'right' }
}