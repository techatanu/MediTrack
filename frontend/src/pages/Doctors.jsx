import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, Stethoscope, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import './Dashboard.css'; 

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        hospital: '',
        phone: ''
    });


    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/doctors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDoctors(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching doctors:", err);
            setError('Failed to load doctors.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const openModal = (doctor = null) => {
        if (doctor) {
            setCurrentDoctor(doctor);
            setFormData({
                name: doctor.name,
                specialization: doctor.specialization,
                hospital: doctor.hospital,
                phone: doctor.phone || ''
            });
        } else {
            setCurrentDoctor(null);
            setFormData({ name: '', specialization: '', hospital: '', phone: '' });
        }
        setIsModalOpen(true);
    };


    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentDoctor(null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            if (currentDoctor) {

                await axios.put(`${import.meta.env.VITE_API_URL}/doctors/${currentDoctor._id}`, formData, config);
            } else {

                await axios.post(`${import.meta.env.VITE_API_URL}/doctors`, formData, config);
            }


            fetchDoctors();
            closeModal();
        } catch (err) {
            console.error("Error saving doctor:", err);
            alert("Failed to save doctor. Please try again.");
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/doctors/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDoctors();
        } catch (err) {
            console.error("Error deleting doctor:", err);
            alert("Failed to delete doctor.");
        }
    };


    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center'
                            }}
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="header-search">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search doctors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="user-profile">
                            <img src="/demo user.png" alt="User" className="avatar" />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <h2>My Doctors</h2>
                        <Button variant="primary" onClick={() => openModal()}>
                            <Plus size={18} /> Add New Doctor
                        </Button>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading doctors...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="empty-state">No doctors found matching "{searchTerm}".</div>
                    ) : (
                        <div className="reports-grid"> 
                            {filteredDoctors.map((doctor) => (
                                <div key={doctor._id} className="stat-card" style={{ position: 'relative' }}>
                                    

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div className="report-icon bg-blue">
                                            <Stethoscope size={24} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => openModal(doctor)}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor._id)}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#111827' }}>{doctor.name}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{doctor.specialization}</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} />
                                            <span>{doctor.hospital}</span>
                                        </div>
                                        {doctor.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} />
                                                <span>{doctor.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {isModalOpen && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', position: 'relative'
                        }}>
                            <button
                                onClick={closeModal}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {currentDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                            </h2>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Doctor Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        placeholder="e.g. Dr. John Doe"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        placeholder="e.g. Cardiologist"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hospital / Clinic</label>
                                    <input
                                        type="text"
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        placeholder="e.g. City General Hospital"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone (Optional)</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        placeholder="e.g. 555-0123"
                                    />
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <Button type="button" variant="outline" onClick={closeModal} style={{ flex: 1 }}>Cancel</Button>
                                    <Button type="submit" variant="primary" style={{ flex: 1 }}>Save Doctor</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Doctors;
