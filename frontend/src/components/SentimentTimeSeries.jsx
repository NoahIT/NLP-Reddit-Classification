import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

function SentimentTimeSeries({ data, onPlotClick }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const textColor = theme === 'dark' ? '#E0E0E0' : '#121212';
  const gridColor = theme === 'dark' ? '#443C68' : '#dadce0';
  const lineColor = theme === 'dark' ? '#90A4AE' : '#6200EE';

  const { xData, yData, counts } = useMemo(() => {
    const grouped = {};

    data.forEach(item => {
      const hourBucket = new Date(item.created_utc).toISOString().substring(0, 13) + ":00:00";
      if (!grouped[hourBucket]) {
        grouped[hourBucket] = { scores: [], count: 0 };
      }
      grouped[hourBucket].scores.push(item.sentiment_score);
      grouped[hourBucket].count++;
    });

    const sortedHours = Object.keys(grouped).sort();

    return {
      xData: sortedHours,
      yData: sortedHours.map(hour => grouped[hour].scores.reduce((a, b) => a + b, 0) / grouped[hour].count),
      counts: sortedHours.map(hour => grouped[hour].count)
    };
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <Plot
          data={[
            {
              x: xData,
              y: yData,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: lineColor },
              line: { color: lineColor }
            }
          ]}
          layout={{
            title: t('sentimentOverTime'),
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: textColor },
            xaxis: {
              title: t('time'),
              gridcolor: gridColor,
              zerolinecolor: gridColor
            },
            yaxis: {
              title: t('averageSentiment'),
              gridcolor: gridColor,
              zerolinecolor: gridColor,
              range: [-1, 1]
            },
            margin: { l: 50, r: 20, b: 50, t: 50 },
            autosize: true
          }}
          style={{ width: '100%', height: '100%' }}
          onClick={onPlotClick}
          useResizeHandler={true}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>

      {/* Custom Legend */}
      <div style={{ width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem' }}>
        <h4 style={{ marginBottom: '1rem', color: textColor }}>{t('legend')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: textColor }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: lineColor }}></div>
            <span>{t('averageSentiment')}</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <strong>{t('totalDataPoints')}:</strong> {xData.length}
          </div>
        </div>
        <p className="chart-description" style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
          {t('sentimentTimeDesc') || "Trends in sentiment score over time. Useful for spotting spikes or drops in community mood."}
        </p>
      </div>
    </div>
  );
}

export default SentimentTimeSeries;