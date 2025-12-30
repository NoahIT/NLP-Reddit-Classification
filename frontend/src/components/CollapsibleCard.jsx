import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CollapsibleCard.css';

const CollapsibleCard = ({ title, children, className = '', defaultExpanded = true, isOpen, onToggle }) => {
    // Internal state for uncontrolled usage
    const [localExpanded, setLocalExpanded] = useState(defaultExpanded);

    // Determine effective state (controlled vs uncontrolled)
    const isExpanded = isOpen !== undefined ? isOpen : localExpanded;

    const handleToggle = () => {
        if (onToggle) {
            onToggle(!isExpanded);
        } else {
            setLocalExpanded(!isExpanded);
        }
    };

    return (
        <motion.div
            className={`card glass-panel collapsible-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="card-header" onClick={handleToggle}>
                <h3>{title}</h3>
                <button className="toggle-btn" aria-label={isExpanded ? "Collapse" : "Expand"}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-content"
                        onAnimationComplete={() => {
                            // Trigger a window resize event to force Plotly to resize
                            window.dispatchEvent(new Event('resize'));
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CollapsibleCard;
