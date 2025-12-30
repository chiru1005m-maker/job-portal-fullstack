import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState("");

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
      const { search, type, location } = filters;
      const res = await api.get(`/api/jobs?search=${search}&type=${type}&location=${location}&active=true`);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchJobs(); 
    setTip(jobTips[Math.floor(Math.random() * jobTips.length)]);
    document.title = "Job Portal | Find Your Next Job"; // Updates the browser tab
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Find Your Next Job </h1>
        
        {/* RANDOM COMMENT / TIP BOX */}
        <div style={tipContainerStyle}>
          <p style={tipTextStyle}>{tip}</p>
        </div>
      </header>
      
      {/* ADVANCED FILTER BAR */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
        <input 
          placeholder="Keyword..." 
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={inputStyle} 
        />
        <select onChange={(e) => setFilters({...filters, type: e.target.value})} style={inputStyle}>
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Remote">Remote</option>
          <option value="Contract">Contract</option>
        </select>
        <input 
          placeholder="Location (City/Country)" 
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          style={inputStyle} 
        />
        <button onClick={fetchJobs} style={searchBtn}>{loading ? '...' : 'Search'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} style={jobCard}>
            <span style={typeBadge}>{job.type || 'Full-time'}</span>
            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{String(job.title)}</h3>
            <p style={{ color: '#666', marginBottom: '15px', fontSize: '0.9rem' }}>
               📍 {job.location || 'Remote'}
            </p>
            <Link to={`/jobs/${job.id}`} style={viewBtn}>View Details →</Link>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#999' }}>
            No jobs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '200px', outline: 'none' };
const searchBtn = { padding: '12px 30px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const jobCard = { padding: '25px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: 'white', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' };
const typeBadge = { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e7f3ff', color: '#007bff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' };
const viewBtn = { textDecoration: 'none', color: '#007bff', fontWeight: 'bold', display: 'inline-block' };

const tipContainerStyle = {
  backgroundColor: '#fff9db',
  padding: '10px 20px',
  borderRadius: '50px',
  display: 'inline-block',
  marginTop: '10px',
  border: '1px solid #ffe066',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const tipTextStyle = {
  margin: 0,
  fontSize: '14px',
  color: '#856404',
  fontWeight: '500'
};