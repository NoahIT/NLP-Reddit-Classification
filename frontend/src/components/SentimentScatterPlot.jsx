import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

const SentimentScatterPlot = ({ data }) => {
    const { language } = useLanguage();
    const t = useTranslation(language);

    const plotData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Group by sentiment label for coloring
        const groups = {};
        data.forEach(item => {
            const label = item.sentiment_label || 'Unknown';
            if (!groups[label]) {
                groups[label] = {
                    x: [],
                    y: [],
                    text: [],
                    type: 'scatter',
                    mode: 'markers',
                    name: label,
                    marker: { size: 8, opacity: 0.7 }
                };
            }
            groups[label].x.push(item.sentiment_score);
            groups[label].y.push(item.score || 0); // Upvotes
            // Truncate content for hover text
            const hoverText = item.content ? (item.content.substring(0, 50) + '...') : `r/${item.subreddit}`;
            groups[label].text.push(`${hoverText} (r/${item.subreddit})`);
        });

        return Object.values(groups);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <p>{t('noDataAvailable')}</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, height: '100%' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{t('sentimentVsEngagement')}</h3>
                <Plot
                    data={plotData}
                    layout={{
                        autosize: true,
                        margin: { l: 50, r: 20, t: 30, b: 50 },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#E0E0E0' },
                        xaxis: {
                            title: t('sentimentScore'),
                            zerolinecolor: '#555',
                            gridcolor: '#333'
                        },
                        yaxis: {
                            title: t('upvotes'),
                            zerolinecolor: '#555',
                            gridcolor: '#333',
                            type: 'log', // Log scale often better for upvotes
                            autorange: true
                        },
                        showlegend: false,
                        hovermode: 'closest'
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
                    {plotData.map((trace) => (
                        <div key={trace.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)', border: '2px solid #E0E0E0' }}></div>
                            <span>{trace.name}</span>
                        </div>
                    ))}
                </div>
                <p className="chart-description" style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    {t('sentimentScatterDesc') || "Scatter plot showing the relationship between sentiment score and number of upvotes."}
                </p>
            </div>
        </div>
    );
};

export default SentimentScatterPlot;
