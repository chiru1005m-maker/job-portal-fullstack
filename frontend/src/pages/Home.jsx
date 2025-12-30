import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', location: '' });
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
  setLoading(true);
  try {
    const { search, type, location } = filters;
    // We add active=true to the query string
    const res = await api.get(`/api/jobs?search=${search}&type=${type}&location=${location}&active=true`);
    setJobs(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchJobs(); }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Find Your Next MNC Role</h1>
      
      {/* ADVANCED FILTER BAR */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
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
        {jobs.map(job => (
          <div key={job.id} style={jobCard}>
            <span style={typeBadge}>{job.type || 'Full-time'}</span>
            <h3>{String(job.title)}</h3>
            <p style={{color: '#666'}}>{job.location || 'Remote'}</p>
            <Link to={`/jobs/${job.id}`} style={viewBtn}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' };
const searchBtn = { padding: '10px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const jobCard = { padding: '20px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: 'white', position: 'relative' };
const typeBadge = { position: 'absolute', top: '10px', right: '10px', backgroundColor: '#e7f3ff', color: '#007bff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' };
const viewBtn = { textDecoration: 'none', color: '#007bff', fontWeight: 'bold', display: 'inline-block', marginTop: '10px' };