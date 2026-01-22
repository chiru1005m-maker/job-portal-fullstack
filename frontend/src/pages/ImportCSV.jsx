import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function ImportCSV() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const nav = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage({ text: 'Please select a CSV file first.', type: 'error' });

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/admin/import-jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: 'MNC Jobs imported successfully!', type: 'success' });
      setTimeout(() => nav('/'), 2000);
    } catch (err) {
      setMessage({ text: 'Import failed: ' + (err.response?.data || 'Server error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bulk Import MNC Jobs</h2>
        <p style={styles.subtitle}>Upload a .csv file to add multiple job openings at once.</p>
        
        <div style={styles.infoBox}>
          <strong>CSV Format:</strong> title, description, company, location, owner
        </div>

        <form onSubmit={handleUpload} style={styles.form}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            style={styles.fileInput}
          />
          
          {message.text && (
            <div style={message.type === 'success' ? styles.success : styles.error}>
              {message.text}
            </div>
          )}

          <button disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
            {loading ? 'Processing...' : 'Upload and Import'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  title: { margin: '0 0 10px 0', color: '#333' },
  subtitle: { color: '#666', marginBottom: '20px' },
  infoBox: { backgroundColor: '#e7f3ff', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#0056b3', marginBottom: '20px' },
  fileInput: { marginBottom: '20px', padding: '10px', border: '1px solid #ddd', width: '100%', borderRadius: '4px' },
  btn: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { padding: '12px', backgroundColor: '#ccc', cursor: 'not-allowed' },
  error: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
  success: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
};