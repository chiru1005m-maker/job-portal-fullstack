import React, { useState, useEffect } from 'react';
import api from '../api';

export default function SeekerDashboard() {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    currentJobTitle: '',
    bio: '',
    skills: '',
    education: '',
    experience: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeUrl: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch existing profile on load
  useEffect(() => {
    // Initial sync ensures setAuthToken is active to prevent 403 on refresh
    api.get('/api/profiles/me')
      .then(res => {
        setProfile(prev => ({ ...prev, ...res.data }));
        setLoading(false);
      })
      .catch(err => {
        console.log("No profile found or 403 error. Check SecurityConfig.");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // 1. Update text-based profile data
      await api.put('/api/profiles/update', profile);

      // 2. Handle Resume Upload if a file is selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        
        await api.post('/api/profiles/upload-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMessage("Profile and Resume updated successfully! ✨");
      window.scrollTo(0, 0);
      
      // Refresh profile to get the new resumeUrl
      const updated = await api.get('/api/profiles/me');
      setProfile(prev => ({ ...prev, ...updated.data }));
    } catch (err) {
      const errorMsg = err.response?.status === 403 
        ? "Access Denied (403). Please relogin." 
        : "Error saving profile. Check server logs.";
      setMessage(errorMsg);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;

  return (
    <div style={dashContainer}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Professional Profile</h2>
      <p style={{ color: '#666' }}>Complete your details to stand out to employers.</p>
      
      {message && <div style={message.includes('Error') || message.includes('Denied') ? errorBox : alertBox}>{message}</div>}
      
      <form onSubmit={handleSave} style={formStyle}>
        {/* Section 1: Personal Info */}
        <div style={sectionStyle}>
          <h4 style={sectionHeader}>Personal Information</h4>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={profile.fullName || ''} 
            onChange={e => setProfile({...profile, fullName: e.target.value})} style={inputStyle} placeholder="John Doe" />
          
          <label style={labelStyle}>Location</label>
          <input type="text" value={profile.location || ''} 
            onChange={e => setProfile({...profile, location: e.target.value})} style={inputStyle} placeholder="Bengaluru, India" />
        </div>

        {/* Section 2: Resume Upload (The Missing Part) */}
        <div style={{...sectionStyle, border: '2px dashed #007bff', backgroundColor: '#f0f7ff'}}>
          <h4 style={sectionHeader}>Professional Resume</h4>
          <label style={labelStyle}>Upload New Resume (PDF Only)</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={e => setResumeFile(e.target.files[0])} 
            style={{...inputStyle, border: 'none', background: 'none'}} 
          />
          {profile.resumeUrl && (
            <p style={{fontSize: '13px', color: '#007bff', fontWeight: 'bold'}}>
              ✅ Current Resume: <a href={`http://localhost:8080${profile.resumeUrl}`} target="_blank" rel="noreferrer">View Uploaded PDF</a>
            </p>
          )}
        </div>

        {/* Section 3: Professional Details */}
        <div style={sectionStyle}>
          <h4 style={sectionHeader}>Professional Details</h4>
          <label style={labelStyle}>Skills (Comma separated)</label>
          <input type="text" value={profile.skills || ''} 
            onChange={e => setProfile({...profile, skills: e.target.value})} style={inputStyle} placeholder="Java, React, Spring Boot" />

          <label style={labelStyle}>Bio</label>
          <textarea value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})} style={{...inputStyle, height: '80px'}} />
        </div>

        {/* Section 4: External Links */}
        <div style={sectionStyle}>
          <h4 style={sectionHeader}>External Links</h4>
          <label style={labelStyle}>LinkedIn URL</label>
          <input type="text" value={profile.linkedinUrl || ''} 
            onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} style={inputStyle} />
        </div>

        <button type="submit" style={saveBtn}>Update Professional Portfolio</button>
      </form>
    </div>
  );
}

// Styles
const dashContainer = { maxWidth: '800px', margin: '20px auto', padding: '30px', backgroundColor: '#fdfdfd', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column' };
const sectionStyle = { marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' };
const sectionHeader = { margin: '0 0 15px 0', color: '#007bff', fontSize: '16px' };
const labelStyle = { fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', display: 'block', color: '#333' };
const inputStyle = { marginBottom: '15px', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', width: '95%' };
const saveBtn = { padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: '0.2s' };
const alertBox = { padding: '15px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '20px', borderRadius: '4px', borderLeft: '5px solid #28a745' };
const errorBox = { padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '20px', borderRadius: '4px', borderLeft: '5px solid #dc3545' };