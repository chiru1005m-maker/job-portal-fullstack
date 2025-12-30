import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/jobs?search=${search}&page=${page}`);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // FIX: Force error to string to prevent Error #31 crash
      const msg = err.response?.data?.message || err.response?.data || 'Failed to fetch jobs';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Latest MNC Opportunities</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          placeholder="Search jobs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button 
          onClick={() => { setPage(1); fetchJobs(); }} 
          disabled={loading}
          style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {/* FIX: Ensure button text toggles correctly */}
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{String(error)}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '100%', maxWidth: '600px', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{String(job.title)}</h3>
            <p style={{ color: '#666' }}>{String(job.description).substring(0, 100)}...</p>
            {/* FIX: Safety guard for owner object */}
            <p style={{ fontSize: '13px', fontWeight: 'bold' }}>
              Posted by: {job.owner?.username || String(job.owner || 'MNC Partner')}
            </p>
            <Link to={`/jobs/${job.id}`} style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>View Details →</Link>
          </div>
        )) : !loading && <p>No jobs found matching your search.</p>}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={loading || jobs.length < 10}>Next</button>
      </div>
    </div>
  );
}