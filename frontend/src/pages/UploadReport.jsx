import React, { useState } from 'react';
import { Upload, Search, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import './UploadReport.css';
import axios from 'axios';

const UploadReport = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Lab'); // Default to Lab
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!file || !title || !category || !date) {
            alert('Please fill in all required fields and select a file.');
            return;
        }
        setLoading(true);
        // 1. Create FormData object
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('reportDate', date); // Matches backend 'reportDate'
        formData.append('image', file); // Matches backend 'upload.single("image")'
        try {
            // Get token from local storage (adjust key if different)
            const token = localStorage.getItem('token');
            // 4. Send to Backend
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/reports`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Report uploaded successfully!');
            // Reset form
            setTitle('');
            setCategory('Lab');
            setDate('');
            setFile(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-search">
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={24} />
                            <span style={{ fontSize: '1rem', fontWeight: 500 }}>Back</span>
                        </button>
                    </div>
                    <div className="header-actions">
                        <div className="icon-btn"><Search size={20} /></div>
                        {/* Notification removed */}
                        <div className="user-profile">
                            <img src="/demo user.png" alt="User" className="avatar" />
                        </div>
                    </div>
                </header>
                <div className="dashboard-content">
                    <h1 className="page-title">Upload Report</h1>
                    <div className="upload-container">
                        {/* Title Input */}
                        <div className="form-group">
                            <label>Report Title *</label>
                            <input
                                type="text"
                                placeholder="e.g., Blood Test Result"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        {/* Category Select */}
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Lab">Lab Test</option>
                                <option value="Prescription">Prescription</option>
                            </select>
                        </div>
                        {/* Date Input */}
                        <div className="form-group">
                            <label>Date of Report *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        {/* File Drop/Input */}
                        <div className="form-group">
                            <label>Upload File *</label>
                            <div className="drop-zone" style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                                <div className="drop-content">
                                    <div className="upload-icon-circle">
                                        <Upload size={24} />
                                    </div>
                                    <h3>{file ? file.name : "Click or Drag to Upload"}</h3>
                                    <p>{file ? "File selected" : "Support for images and PDF"}</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="large"
                            className="btn-full"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </main>
        </div >
    );
};
export default UploadReport;