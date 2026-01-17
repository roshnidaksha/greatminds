import React from 'react';
import './About.css';

export default function About() {
    return (
        <div className="about-container">
            <div className="about-content">
                <div className="about-header">
                    <img 
                        src="/Minds.png" 
                        alt="MINDS Logo" 
                        className="minds-logo"
                    />
                    <h1>About MINDS</h1>
                </div>
                
                <div className="about-sections">
                    <div className="about-section">
                        <div className="section-icon">🏛️</div>
                        <h2>Our History</h2>
                        <p>
                            MINDS is established since <strong>1962</strong> to improve the lives of 
                            persons with intellectual disabilities and their families.
                        </p>
                    </div>

                    <div className="about-section highlight">
                        <div className="section-icon">🎯</div>
                        <h2>Supported Transition & Engagement Programme (STEP)</h2>
                        <p>
                            STEP aims to support graduates from MINDS schools to experience 
                            programmes in order to improve or maintain their daily living skills 
                            while awaiting placement in adult disability services or employment.
                        </p>
                    </div>

                    <div className="about-section">
                        <div className="section-icon">💡</div>
                        <h2>Our Mission</h2>
                        <p>
                            We are committed to empowering individuals with intellectual disabilities 
                            through meaningful engagement, skill development, and community integration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
