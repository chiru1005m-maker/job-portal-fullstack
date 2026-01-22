import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ title: '', type: '', location: '' }); // Changed 'search' to 'title'
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState("");
  
  const [editingJobId, setEditingJobId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', location: '', type: '', description: '' });

  const currentUsername = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');
  const isJobSeeker = userRole === 'JobSeeker';

  const jobTips = [
    "💡 Pro-tip: Jobs with 'Remote' in the title are getting 3x more applications this week!",
    "🚀 Ready for a change? There are currently several active openings waiting for you.",
    "✨ Fun Fact: Updating your resume can increase your response rate by 20%.",
    "🔍 Use the 'Location' filter to find opportunities right in your neighborhood.",
    "🌟 Quality over quantity: Tailor your cover letter for the best results!",
    "📱 Most recruiters review applications within the first 48 hours. Apply early!"
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      // Match the @RequestParam names in JobController.java
      if (filters.title) params.title = filters.title.trim(); 
      if (filters.location) params.location = filters.location.trim();
      if (filters.type) params.type = filters.type;

      // Point to the unified list endpoint we created in JobController
      const response = await api.get('/api/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      setJobs([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchJobs(); 
    setTip(jobTips[Math.floor(Math.random() * jobTips.length)]);
  }, []);

  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await api.delete(`/api/jobs/${id}`);
        setJobs(jobs.filter(job => job.id !== id));
      } catch (err) {
        alert(err.response?.data || "Failed to delete job.");
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/jobs/${id}`, editFormData);
      setEditingJobId(null);
      fetchJobs();
      alert("Job updated successfully!");
    } catch (err) {
      alert("Update failed: " + (err.response?.data || "Server error"));
    }
  };

  const startEditing = (job) => {
    setEditingJobId(job.id);
    setEditFormData({
      title: job.title || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      description: job.description || ''
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Find Your Next Job</h1>
        <div style={tipContainerStyle}>
          <p style={tipTextStyle}>{tip}</p>
        </div>
      </header>
      
      <div style={searchContainer}>
        <input 
          placeholder="Job Title..." 
          value={filters.title}
          onChange={(e) => setFilters({...filters, title: e.target.value})}
          style={inputStyle} 
        />
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} style={inputStyle}>
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Remote">Remote</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
        </select>
        <input 
          placeholder="Location..." 
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          style={inputStyle} 
        />
        <button onClick={fetchJobs} style={searchBtn}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div style={gridStyle}>
        {jobs.length > 0 ? (
          jobs.map(job => {
            const jobOwnerName = job.owner?.username || "Verified Employer"; 
            const isOwner = jobOwnerName === currentUsername;
            const isEditing = editingJobId === job.id;

            return (
              <div key={job.id} style={jobCard}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <input style={{...editInput, width: '100%'}} value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Location</label>
                        <input style={{...editInput, width: '100%'}} value={editFormData.location} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Type</label>
                        <select style={{...editInput, width: '100%', height: '38px'}} value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}>
                          <option value="Full-time">Full-time</option>
                          <option value="Remote">Remote</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea style={{...editInput, width: '100%', minHeight: '100px', resize: 'vertical'}} value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => handleUpdate(job.id)} style={saveBtn}>Save</button>
                      <button onClick={() => setEditingJobId(null)} style={cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span style={typeBadge}>{job.type || 'Full-time'}</span>
                    <h3 style={{ marginBottom: '5px', fontSize: '1.2rem' }}>{job.title}</h3>
                    
                    <p style={{ color: '#007bff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>
                      🏢 {jobOwnerName}
                    </p>

                    <p style={{ color: '#666', marginBottom: '8px', fontSize: '0.9rem' }}>📍 {job.location || 'Remote'}</p>
                    <p style={descPreview}>{job.description}</p>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <Link to={`/jobs/${job.id}`} style={viewBtn}>Details →</Link>
                      
                      {isOwner ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => startEditing(job)} style={editBtnStyle}>Edit</button>
                          <button onClick={() => deleteJob(job.id)} style={deleteBtnStyle}>Delete</button>
                        </div>
                      ) : (
                        isJobSeeker && (
                          <Link 
                            to={`/jobs/${job.id}`} 
                            style={{
                              ...applyBtnStyle, 
                              backgroundColor: '#28a745',
                              textDecoration: 'none',
                              textAlign: 'center'
                            }}
                          >
                            Apply Now
                          </Link>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#999' }}>
            {loading ? 'Loading jobs...' : 'No jobs found matching your requirements.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ... styles remain the same ...
const searchContainer = { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '200px', outline: 'none' };
const searchBtn = { padding: '12px 30px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const jobCard = { padding: '25px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: 'white', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '300px' };
const typeBadge = { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e7f3ff', color: '#007bff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' };
const viewBtn = { textDecoration: 'none', color: '#007bff', fontWeight: 'bold' };
const descPreview = { color: '#777', fontSize: '0.85rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const editBtnStyle = { padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' };
const deleteBtnStyle = { padding: '6px 12px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' };
const applyBtnStyle = { padding: '8px 16px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' };
const editInput = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#555', marginBottom: '4px', textTransform: 'uppercase' };
const saveBtn = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const cancelBtn = { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const tipContainerStyle = { backgroundColor: '#fff9db', padding: '10px 20px', borderRadius: '50px', display: 'inline-block', marginTop: '10px', border: '1px solid #ffe066', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const tipTextStyle = { margin: 0, fontSize: '14px', color: '#856404', fontWeight: '500' };