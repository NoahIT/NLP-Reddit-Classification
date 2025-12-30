import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import SentimentPieChart from './SentimentPieChart';
import SentimentTimeSeries from './SentimentTimeSeries';
import './ComparisonPanel.css';

function ComparisonPanel({
    title,
    subreddits,
    selectedSubreddit,
    selectedTimeframe,
    onSubredditChange,
    onTimeframeChange,
    data,
    loading
}) {
    const { language } = useLanguage();
    const t = useTranslation(language);

    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;
        const total = data.length;
        const avgSentiment = data.reduce((acc, item) => acc + item.sentiment_score, 0) / total;
        return { total, avgSentiment };
    }, [data]);

    return (
        <div className="comparison-panel glass-panel">
            <h2>{title}</h2>

            <div className="controls">
                <select
                    value={selectedSubreddit}
                    onChange={(e) => onSubredditChange(e.target.value)}
                    className="panel-select"
                >
                    <option value="">{t('selectSubreddit')}</option>
                    {subreddits.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>

                <select
                    value={selectedTimeframe}
                    onChange={(e) => onTimeframeChange(e.target.value)}
                    className="panel-select"
                >
                    <option value="24">{t('hours24')}</option>
                    <option value="168">{t('days7')}</option>
                    <option value="720">{t('days30')}</option>
                </select>
            </div>

            {loading ? (
                <div className="panel-loading">{t('loading')}</div>
            ) : (
                <div className="panel-content">
                    {stats ? (
                        <div className="panel-stats">
                            <div className="stat-item">
                                <span className="stat-label">{t('totalPosts')}</span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">{t('avgSentiment')}</span>
                                <span className={`stat-value ${stats.avgSentiment > 0 ? 'positive' : stats.avgSentiment < 0 ? 'negative' : 'neutral'}`}>
                                    {stats.avgSentiment.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="no-data">{t('noData')}</div>
                    )}

                    {data && data.length > 0 && (
                        <>
                            <div className="chart-container">
                                <SentimentPieChart data={data} />
                            </div>
                            <div className="chart-container">
                                <SentimentTimeSeries data={data} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ComparisonPanel;
