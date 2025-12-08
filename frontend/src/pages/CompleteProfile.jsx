import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function CompleteProfile() {
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setErrorMsg('Authentication required. Please login again.');
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dateOfBirth: dateOfBirth || undefined,
                    gender: gender || undefined,
                    bloodGroup: bloodGroup || undefined,
                    height: height ? parseFloat(height) : undefined,
                    weight: weight ? parseFloat(weight) : undefined
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMsg(errorData.error?.message || 'Failed to update profile. Please try again.');
                setLoading(false);
                return;
            }

            // Success - redirect to dashboard
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Profile update error:', error);
            setErrorMsg('An error occurred. Please try again later.');
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-inner" style={{ maxWidth: '540px' }}>
                <form onSubmit={handleSubmit}>
                    <h3>Welcome to MediTrack!</h3>
                    <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' }}>
                        Let's set up your health profile.
                    </p>

                    <div className="structure">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    <div className="structure">
                        <label>Gender</label>
                        <select
                            className="form-control"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="structure">
                        <label>Blood Group</label>
                        <select
                            className="form-control"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="">Select blood group</option>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="structure">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="170"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div className="structure">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {errorMsg && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{errorMsg}</div>}

                    <div className="d-grid" style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Complete Profile'}
                        </button>
                    </div>

                    <p className="forgot-password text-right" style={{ marginTop: '1rem' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleSkip(); }} style={{ cursor: 'pointer' }}>
                            Skip for now →
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfile;
