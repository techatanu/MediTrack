import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Bell, ArrowLeft, Download, Trash2, FileText, Calendar, Tag } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button'; 
import axios from 'axios';
import './ViewReport.css';

const ViewReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setReport(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching report:', err);
                setError(err.response?.data?.error?.message || 'Failed to load report');
                setLoading(false);
            }
        };

        if (id) {
            fetchReport();
        }
    }, [id]);

    const handleDownload = async () => {
        if (!report?.fileUrl) return;
        setDownloading(true);
        try {

            const response = await fetch(report.fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            const ext = report.fileUrl.split('.').pop().split('?')[0];
            link.download = `${report.title.replace(/\s+/g, '_')}_${report._id}.${ext}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);

            window.open(report.fileUrl, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/reports/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            navigate('/reports');
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete report.");
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ padding: '2rem' }}>Loading Report...</div>;
    if (error) return <div className="p-8 text-center text-red-500" style={{ padding: '2rem', color: 'red' }}>{error}</div>;
    if (!report) return <div className="p-8 text-center" style={{ padding: '2rem' }}>Report not found</div>;

    const isPDF = report.fileUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div className="header-search">

                    </div>
                    <div className="header-actions">
                        <div className="user-profile">
                            <img src="/demo user.png" alt="User" className="avatar" />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">

                    <div className="page-header-actions" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
                                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <ArrowLeft size={20} color="#374151" />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{report.title}</h1>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>View and manage your report details</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleDelete}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                                    background: '#fee2e2', color: '#dc2626', border: 'none', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <Trash2 size={18} /> Delete
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1.25rem', borderRadius: '8px',
                                    background: '#0f4c5c', color: 'white', border: 'none', fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                <Download size={18} /> {downloading ? 'Downloading...' : 'Download'}
                            </button>
                        </div>
                    </div>

                    <div className="report-content-grid" style={{
                        display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start'
                    }}>

                        {/* Details Card */}
                        <div className="card" style={{
                            background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                                Report Details
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px', height: 'fit-content' }}>
                                        <Tag size={20} color="#4b5563" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Category</label>
                                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{report.category}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px', height: 'fit-content' }}>
                                        <Calendar size={20} color="#4b5563" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Date</label>
                                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>
                                            {new Date(report.reportDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: '8px', height: 'fit-content' }}>
                                        <FileText size={20} color="#4b5563" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Description</label>
                                        <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.5' }}>
                                            {report.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                {report.doctor && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>PRESCRIBED BY</label>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>Dr. {report.doctor.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{report.doctor.specialization}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{report.doctor.hospital}</div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="card" style={{
                            background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minHeight: '600px', display: 'flex', flexDirection: 'column'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                                Preview
                            </h3>

                            <div style={{
                                flex: 1, background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem'
                            }}>
                                {isPDF ? (
                                    <iframe
                                        src={report.fileUrl}
                                        width="100%"
                                        height="600px"
                                        title="PDF Report"
                                        style={{ border: 'none' }}
                                    />
                                ) : (
                                    <img
                                        src={report.fileUrl}
                                        alt="Report Preview"
                                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViewReport;
