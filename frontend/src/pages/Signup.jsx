import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFName] = useState("");
    const [lname, setLName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        console.log("API URL:", import.meta.env.VITE_API_URL);
        console.log("Form Data:", { fname, lname, email, password });

        const trimmedEmail = (email || "").trim();
        if (!trimmedEmail) {
            setErrorMsg("Please enter a valid email.");
            return;
        }
        if (!password || password.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: fname,
                    lastName: lname,
                    email: trimmedEmail,
                    password: password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMsg(errorData.message || 'Signup failed. Please try again.');
                return;
            }

            const data = await response.json();


            login({
                username: data.username || fname || trimmedEmail.split('@')[0],
                token: data.token
            });


            navigate('/complete-profile', { replace: true });
        } catch (error) {
            console.error("Signup Error:", error);
            setErrorMsg('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                <form onSubmit={handleRegister}>
                    <h3>Sign Up</h3>
                    <div className="structure">
                        <label>First name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter first name"
                            value={fname}
                            onChange={(e) => setFName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="structure">
                        <label>Last name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Last name"
                            value={lname}
                            onChange={(e) => setLName(e.target.value)}
                        />
                    </div>
                    <div className="structure">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="structure">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Sign Up
                        </button>
                    </div>
                    <p className="forgot-password text-right">
                        Already registered <a href="/login">Login</a>
                    </p>
                    {errorMsg && <div style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</div>}
                </form>
            </div>
        </div>
    );
}

export default Signup;