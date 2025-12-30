import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

const SubredditRadarChart = ({ data }) => {
    const { language } = useLanguage();
    const t = useTranslation(language);

    const plotData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Aggregate data by subreddit
        const subStats = {};
        data.forEach(item => {
            if (!subStats[item.subreddit]) {
                subStats[item.subreddit] = {
                    sentimentSum: 0,
                    scoreSum: 0,
                    count: 0
                };
            }
            subStats[item.subreddit].sentimentSum += item.sentiment_score;
            subStats[item.subreddit].scoreSum += item.score;
            subStats[item.subreddit].count += 1;
        });

        const subreddits = Object.keys(subStats);
        // Take top 5 subreddits by activity (count) to avoid clutter
        const topSubreddits = subreddits
            .sort((a, b) => subStats[b].count - subStats[a].count)
            .slice(0, 5);

        // Normalize scores for radar chart (0-1 scale approx)
        // Find max values for normalization
        let maxAvgScore = 0;
        let maxCount = 0;

        topSubreddits.forEach(sub => {
            const avgScore = subStats[sub].scoreSum / subStats[sub].count;
            if (avgScore > maxAvgScore) maxAvgScore = avgScore;
            if (subStats[sub].count > maxCount) maxCount = subStats[sub].count;
        });

        const traces = topSubreddits.map(sub => {
            const stats = subStats[sub];
            const avgSentiment = stats.sentimentSum / stats.count; // -1 to 1
            // Normalize sentiment to 0-1 for chart consistency (0 = -1, 0.5 = 0, 1 = 1)
            const normSentiment = (avgSentiment + 1) / 2;

            const avgScore = stats.scoreSum / stats.count;
            const normScore = maxAvgScore > 0 ? avgScore / maxAvgScore : 0;

            const normCount = maxCount > 0 ? stats.count / maxCount : 0;

            return {
                type: 'scatterpolar',
                r: [normSentiment, normScore, normCount, normSentiment], // Close the loop
                theta: [t('sentiment'), t('engagement'), t('activity'), t('sentiment')],
                fill: 'toself',
                name: `r/${sub}`,
                opacity: 0.6
            };
        });

        return traces;

    }, [data]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, height: '100%' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{t('subredditComparison') || "Subreddit Comparison"}</h3>
                <Plot
                    data={plotData}
                    layout={{
                        polar: {
                            radialaxis: {
                                visible: true,
                                range: [0, 1],
                                color: '#888'
                            },
                            bgcolor: 'rgba(0,0,0,0)'
                        },
                        margin: { l: 50, r: 50, t: 30, b: 50 },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#E0E0E0' },
                        showlegend: false
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>

            {/* Custom Legend */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#E0E0E0' }}>{t('legend')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#E0E0E0' }}>
                    {plotData.map((trace, index) => (
                        <div key={trace.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                            <span>{trace.name}</span>
                        </div>
                    ))}
                </div>
                <p className="chart-description" style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    {t('radarChartDesc') || "Comparison of subreddits based on sentiment, engagement, and activity."}
                </p>
            </div>
        </div>
    );
};

export default SubredditRadarChart;
