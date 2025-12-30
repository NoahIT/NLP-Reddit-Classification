
import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

function SentimentStackedBar({ data }) {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const t = useTranslation(language);
    const textColor = theme === 'dark' ? '#E0E0E0' : '#121212';

    const plotData = useMemo(() => {
        const subreddits = [...new Set(data.map(item => item.subreddit))];
        const sentimentCounts = {};

        subreddits.forEach(sub => {
            sentimentCounts[sub] = { positive: 0, neutral: 0, negative: 0 };
        });

        data.forEach(item => {
            if (sentimentCounts[item.subreddit]) {
                sentimentCounts[item.subreddit][item.sentiment_label]++;
            }
        });

        const positiveTrace = {
            x: subreddits,
            y: subreddits.map(sub => sentimentCounts[sub].positive),
            name: t('positive'),
            type: 'bar',
            marker: { color: '#28a745' }
        };

        const neutralTrace = {
            x: subreddits,
            y: subreddits.map(sub => sentimentCounts[sub].neutral),
            name: t('neutral'),
            type: 'bar',
            marker: { color: '#ffc107' }
        };

        const negativeTrace = {
            x: subreddits,
            y: subreddits.map(sub => sentimentCounts[sub].negative),
            name: t('negative'),
            type: 'bar',
            marker: { color: '#dc3545' }
        };

        return [positiveTrace, neutralTrace, negativeTrace];
    }, [data, t]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Plot
                data={plotData}
                layout={{
                    title: t('sentimentBySubreddit'),
                    barmode: 'stack',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: textColor },
                    margin: { l: 40, r: 20, b: 80, t: 40 },
                    xaxis: { title: t('subreddit'), tickangle: -45 },
                    yaxis: { title: t('count') },
                    legend: { orientation: 'h', y: -0.3 },
                    autosize: true
                }}
                style={{ width: '100%', flex: 1 }}
                useResizeHandler={true}
            />
            <p className="chart-description">
                {t('sentimentStackedDesc') || "Breakdown of sentiment (Positive, Neutral, Negative) for each subreddit."}
            </p>
        </div>
    );
}

export default SentimentStackedBar;
