import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Activity, Ruler, Weight, LogOut, Save, Edit2 } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setUser(data.data);
            setFormData({
                firstName: data.data.firstName || '',
                lastName: data.data.lastName || '',
                email: data.data.email || '',
                dateOfBirth: data.data.dateOfBirth ? new Date(data.data.dateOfBirth).toISOString().split('T')[0] : '',
                gender: data.data.gender || '',
                bloodGroup: data.data.bloodGroup || '',
                height: data.data.height || '',
                weight: data.data.weight || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    gender: formData.gender || undefined,
                    bloodGroup: formData.bloodGroup || undefined,
                    dateOfBirth: formData.dateOfBirth || undefined,
                    height: formData.height ? Number(formData.height) : undefined,
                    weight: formData.weight ? Number(formData.weight) : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Update failed');
            }

            const data = await response.json();
            setUser(data.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="profile-title">
                            <h1>{user?.firstName} {user?.lastName}</h1>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-logout"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                <div className="profile-content">
                    <div className="section-header">
                        <h2 className="section-title">Personal Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-edit"
                            >
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>{error}</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="info-grid">
                            <div className="info-column">
                                <InfoItem icon={<User />} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                                <InfoItem icon={<Mail />} label="Email" value={user?.email} />
                                <InfoItem icon={<Calendar />} label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'} />
                            </div>
                            <div className="info-column">
                                <InfoItem icon={<Activity />} label="Blood Group" value={user?.bloodGroup || 'Not set'} />
                                <InfoItem icon={<Ruler />} label="Height" value={user?.height ? `${user.height} cm` : 'Not set'} />
                                <InfoItem icon={<Weight />} label="Weight" value={user?.weight ? `${user.weight} kg` : 'Not set'} />
                                <InfoItem icon={<User />} label="Gender" value={user?.gender || 'Not set'} />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="edit-form">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-save"
                                >
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        <div className="info-icon">{icon}</div>
        <div>
            <p className="info-label">{label}</p>
            <p className="info-value">{value}</p>
        </div>
    </div>
);

export default UserProfile;
