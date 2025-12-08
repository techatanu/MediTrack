import React from 'react';
import Navbar from '../components/Navbar';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <Navbar />

            <div className="about-container">
                <div className="about-header">
                    <h1>About MediTrack</h1>
                    <p className="subtitle">Built by someone who's been there</p>
                </div>

                <div className="story-section">
                    <h2>Why MediTrack Exists</h2>
                    <p>
                        MediTrack started from a simple, frustrating moment that too many of us have experienced.
                    </p>
                    <div className="highlight">
                        "My dad needed to send an old medical report to his doctor. He called me in a panic. I spent the next 20 minutes scrolling through months of WhatsApp messages, digging through random phone folders, checking email attachments—just to find ONE document. When I finally found it, I thought: there has to be a better way."
                    </div>
                    <p>
                        That's when I realized this wasn't just my dad's problem. It's everyone's problem. How many times have you:
                    </p>
                    <p>
                        • Sat in a doctor's office trying to remember when your last blood test was?<br />
                        • Lost an important prescription because it's buried in your phone somewhere?<br />
                        • Had to call family members to dig up old medical records?<br />
                        • Wished you could just pull up your health history in seconds?
                    </p>
                    <p>
                        <strong>Nobody should lose important health information because it's buried in WhatsApp.</strong> Your medical records deserve better than being scattered across chat apps, email threads, and forgotten folders.
                    </p>
                </div>

                <div className="mission-box">
                    <h3>Our Mission</h3>
                    <p>
                        To give everyone a simple, secure place to store and access their medical records—so when it matters most, you're not searching. You're ready.
                    </p>
                </div>

                <h2 style={{ textAlign: 'center', margin: '50px 0 30px', fontSize: '2rem', color: '#2d3748' }}>What We Stand For</h2>

                <div className="values-grid">
                    <div className="value-card">
                        <div className="icon">🎯</div>
                        <h4>Simple, Not Complicated</h4>
                        <p>No confusing medical jargon. No overwhelming features. Just upload, organize, and access. That's it.</p>
                    </div>

                    <div className="value-card">
                        <div className="icon">🔒</div>
                        <h4>Your Data, Your Control</h4>
                        <p>You're the only one who can view your records. We don't sell data. We don't share without permission. Period.</p>
                    </div>

                    <div className="value-card">
                        <div className="icon">💙</div>
                        <h4>Built With Care</h4>
                        <p>This isn't a corporate product. It's built by someone who's lived this frustration and wants to fix it.</p>
                    </div>
                </div>

                <div className="creator-section">
                    <h3>Who's Building This?</h3>
                    <p><strong>Atanu Adhikari</strong></p>
                    <p>Computer Science Student | Problem Solver | Healthcare Tech Enthusiast</p>
                    <p style={{ marginTop: '20px', fontSize: '1rem', color: '#718096' }}>
                        MediTrack started as my capstone project, but it quickly became something more personal. After watching my own family struggle with lost medical records, I knew I had to build something that actually solves this problem—not just for a grade, but for real people dealing with real healthcare frustrations.
                    </p>
                    <div className="badge">🚧 Currently in Development</div>
                </div>

                <div className="future-section">
                    <h3>Where We're Heading</h3>
                    <p>
                        Right now, MediTrack is in active development and testing. My goal? To make this a <strong>free, open-source tool</strong> that anyone can use, contribute to, and improve. Because healthcare record management shouldn't be a luxury—it should be accessible to everyone.
                    </p>
                    <p style={{ marginTop: '20px' }}>
                        If you're a developer, designer, or healthcare professional who believes in this mission, I'd love your help making MediTrack better. Together, we can build something that genuinely helps people.
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', background: 'white', borderRadius: '12px' }}>
                    <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Want to Help or Follow Along?</h3>
                    <p style={{ color: '#4a5568', marginBottom: '20px' }}>
                        MediTrack is still growing. If you want to contribute, report bugs, or just see how it develops:
                    </p>
                    <button style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', margin: '5px' }}>
                        View on GitHub
                    </button>
                    <button style={{ background: 'white', color: '#667eea', padding: '12px 30px', border: '2px solid #667eea', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', margin: '5px' }}>
                        Get Early Access
                    </button>
                </div>
            </div>
        </div>
    );
};

export default About;
