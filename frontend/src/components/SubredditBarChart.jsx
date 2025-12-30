import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

function SubredditBarChart({ data }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const textColor = theme === 'dark' ? '#E0E0E0' : '#121212';
  const gridColor = theme === 'dark' ? '#443C68' : '#dadce0';

  const { topSubreddits, topCounts } = useMemo(() => {
    const counts = {};
    data.forEach(item => {
      counts[item.subreddit] = (counts[item.subreddit] || 0) + 1;
    });

    const sortedSubreddits = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      topSubreddits: sortedSubreddits.map(item => `r/${item[0]}`).reverse(),
      topCounts: sortedSubreddits.map(item => item[1]).reverse(),
    };
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <Plot
          data={[
            {
              y: topSubreddits,
              x: topCounts,
              type: 'bar',
              orientation: 'h',
              marker: { color: '#6200EE' }
            }
          ]}
          layout={{
            title: t('topSubreddits'),
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: textColor },
            xaxis: {
              title: t('postCount'),
              gridcolor: gridColor
            },
            yaxis: {
              automargin: true
            },
            margin: { l: 100, r: 20, b: 50, t: 50 },
            autosize: true
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>

      {/* Custom Legend */}
      <div style={{ width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem' }}>
        <h4 style={{ marginBottom: '1rem', color: textColor }}>{t('legend')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: textColor }}>
          {topSubreddits.slice().reverse().map((sub, index) => (
            <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
              <span>{sub}: {topCounts[topCounts.length - 1 - index]}</span>
            </div>
          ))}
        </div>
        <p className="chart-description" style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
          {t('subredditBarDesc') || "Top 10 most active subreddits by post count."}
        </p>
      </div>
    </div>
  );
}

export default SubredditBarChart;