import React, { useState, useEffect } from 'react';
import './SidebarNav.css';

const SidebarNav = ({ sections }) => {
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-50% 0px -50% 0px', // Trigger when element is in the middle of viewport
                threshold: 0
            }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <nav className="sidebar-nav">
            <ul className="sidebar-list">
                {sections.map((section) => (
                    <li key={section.id} className="sidebar-item">
                        <button
                            className={`sidebar-btn ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(section.id)}
                            aria-label={`Scroll to ${section.label}`}
                        >
                            <div className="sidebar-circle"></div>
                            <span className="sidebar-label">{section.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SidebarNav;
