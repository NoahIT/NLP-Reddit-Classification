import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import ComparisonPanel from '../components/ComparisonPanel';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import { motion } from 'framer-motion';
import './ComparisonPage.css';

const pageVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
};

function ComparisonPage() {
    const { language } = useLanguage();
    const t = useTranslation(language);

    const [subreddits, setSubreddits] = useState([]);

    // Panel A State
    const [subA, setSubA] = useState('');
    const [timeA, setTimeA] = useState('24');
    const [dataA, setDataA] = useState([]);
    const [loadingA, setLoadingA] = useState(false);

    // Panel B State
    const [subB, setSubB] = useState('');
    const [timeB, setTimeB] = useState('24');
    const [dataB, setDataB] = useState([]);
    const [loadingB, setLoadingB] = useState(false);

    useEffect(() => {
        apiClient.getSubreddits()
            .then(res => setSubreddits(res.data))
            .catch(err => console.error("Error fetching subreddits:", err));
    }, []);

    useEffect(() => {
        if (!subA) {
            setDataA([]);
            return;
        }
        setLoadingA(true);
        apiClient.getData(subA, timeA)
            .then(res => setDataA(res.data))
            .catch(err => console.error("Error fetching data A:", err))
            .finally(() => setLoadingA(false));
    }, [subA, timeA]);

    useEffect(() => {
        if (!subB) {
            setDataB([]);
            return;
        }
        setLoadingB(true);
        apiClient.getData(subB, timeB)
            .then(res => setDataB(res.data))
            .catch(err => console.error("Error fetching data B:", err))
            .finally(() => setLoadingB(false));
    }, [subB, timeB]);

    return (
        <motion.div
            className="comparison-page"
            variants={pageVariant}
            initial="hidden"
            animate="visible"
        >
            <header className="comparison-header">
                <h1 className="page-title">{t('comparison')}</h1>
                <p className="page-subtitle">Analyze sentiment across different communities side-by-side.</p>
            </header>

            <div className="comparison-container glass-panel">
                <div className="comparison-grid">
                    <div className="comparison-column">
                        <ComparisonPanel
                            title={t('panelA')}
                            subreddits={subreddits}
                            selectedSubreddit={subA}
                            selectedTimeframe={timeA}
                            onSubredditChange={setSubA}
                            onTimeframeChange={setTimeA}
                            data={dataA}
                            loading={loadingA}
                        />
                    </div>

                    <div className="comparison-divider">
                        <div className="divider-line"></div>
                        <div className="vs-badge">VS</div>
                        <div className="divider-line"></div>
                    </div>

                    <div className="comparison-column">
                        <ComparisonPanel
                            title={t('panelB')}
                            subreddits={subreddits}
                            selectedSubreddit={subB}
                            selectedTimeframe={timeB}
                            onSubredditChange={setSubB}
                            onTimeframeChange={setTimeB}
                            data={dataB}
                            loading={loadingB}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ComparisonPage;
